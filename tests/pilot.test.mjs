import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID, scryptSync } from 'node:crypto';
import { mkdtemp, rm, rmdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createPilot } from '../scripts/pilot-server.mjs';
import { accounts, emptyWorkspace, pilotAction } from '../scripts/pilot-workflow.mjs';
import { registers } from '../src/lib/pilot-registers.ts';

const passwords = { preparer: 'test-preparer-pass', reviewer: 'test-reviewer-pass', partner: 'test-partner-pass' };
const create = { client: 'Fictional Pilot Company', legalForm: 'ХХК', registration: 'QA-PILOT-1', framework: 'Test',
  contact: 'Demo Finance', email: 'pilot@example.test', start: '2025-01-01', end: '2025-12-31', reportDate: '2026-04-01' };

async function start(database) {
  const pilot = createPilot({ database, setupCode: 'test-bootstrap-only' });
  const server = createServer((req, res) => void pilot.handle(req, res, new URL(req.url, 'http://127.0.0.1')));
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const origin = 'http://127.0.0.1:' + server.address().port;
  return {
    async fetch(path, cookie, data, requestOrigin = origin) {
      return fetch(origin + '/api/pilot' + path, {
        method: data === undefined ? 'GET' : 'POST',
        headers: { ...(cookie ? { Cookie: cookie } : {}),
          ...(data === undefined ? {} : { 'Content-Type': 'application/json', Origin: requestOrigin }) },
        body: data === undefined ? undefined : JSON.stringify(data),
      });
    },
    async close() {
      await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
      pilot.close();
    },
  };
}

async function fixture(service, setup = true) {
  if (setup) assert.equal((await service.fetch('/setup', '', { code: 'test-bootstrap-only', ...passwords })).status, 201);
  const cookies = {};
  for (const role of Object.keys(passwords)) {
    const response = await service.fetch('/login', '', { role, password: passwords[role] });
    assert.equal(response.status, 200);
    cookies[role] = response.headers.get('set-cookie').split(';')[0];
  }
  const scoped = (path, id) => path + '?engagement=' + id;
  const view = async (role, id, status = 200) => {
    const response = await service.fetch(scoped('', id), cookies[role]);
    assert.equal(response.status, status);
    return response.json();
  };
  async function write(role, id, action, fields, status = 200, options = {}) {
    const revision = options.revision ?? (await view(role, id)).revision;
    const response = await service.fetch(scoped('/action', id), cookies[role], { action, fields, revision, idempotencyKey: options.key });
    const result = await response.json();
    assert.equal(response.status, status, action + ' · ' + (result.error ?? ''));
    return result;
  }
  return { cookies, scoped, view, write };
}

test('approved roster capacity and reassignment preserve historical staff sign-offs', async () => {
  const dir = await mkdtemp(join(tmpdir(),'audit-staffing-'));
  const database = join(dir,'staffing.sqlite');
  let service;
  try {
    service = await start(database);
    const { view,write } = await fixture(service);
    const fields=values=>Object.fromEntries(Object.entries(values).map(([key,value])=>['field.'+key,value]));
    const register=(role,scope,kind,operation,values={},id='',status=200)=>write(role,scope,'register',{
      kind,operation,id,...(operation==='save'?fields(values):values),
    },status);
    const draft=async(scope,kind,values,id='')=>{
      const result=await register('reviewer',scope,kind,'save',values,id);
      return id||result.registers.at(-1).id;
    };
    const approve=async(scope,kind,values,id='')=>{
      const row=await draft(scope,kind,values,id);
      await register('reviewer',scope,kind,'submit',{},row);
      await register('partner',scope,kind,'approve',{reason:'Verified source and suitability'},row);
      return row;
    };
    const roster={};
    for (const capacity of ['preparer','reviewer','partner','specialist']) {
      const external=capacity==='specialist';
      const facts={name:'Staff '+capacity,reference:'TEST-'+capacity,status:external?'external':'active',
        account:external?'':capacity,availableFrom:'2026-01-01',availableTo:'2026-06-30',capacityHours:'100'};
      const person=await approve('firm','M01-F03',facts);
      const credential=await approve('firm','M01-F04',{person,qualification:'Credential '+capacity,issuer:'Fixture issuer',
        sector:'Manufacturing',skill:'Fixed assets',validFrom:'2025-01-01',validTo:external?'':'2026-05-31',
        validity:external?'no-expiry':'dated',source:'Exact issuer record'});
      const appointment=await approve('firm','M01-F06',{person,role:'Firm appointment',capacity,employment:external?'external':'employee',
        from:'2026-01-01',to:'2026-06-30',basis:'Recorded appointment'});
      roster[capacity]={person,credential,appointment,facts};
    }
    const unknown=await approve('firm','M01-F04',{person:roster.preparer.person,qualification:'Unverified credential',
      sector:'Manufacturing',skill:'Fixed assets',validity:'unknown',source:'Awaiting confirmation'});
    const a=(await write('reviewer','firm','create',create)).selected;
    const b=(await write('reviewer','firm','create',{...create,client:'Restricted workload',registration:'STAFF-2'})).selected;
    const activate={independence:'I-Staff',letter:'L-Staff',assessment:'Synthetic staffing scenario'};
    await write('partner',a,'activate',activate);
    await write('partner',b,'activate',activate);
    await write('partner',a,'staffing-enable',{},409);
    const booking=(capacity,hours='10')=>{
      const {person,credential,appointment}=roster[capacity];
      return {capacity,person,credential,appointment,assignmentDate:'2026-02-01',assignmentEnd:'2026-05-30',hours,
        needs:'Fixed asset file and review',result:'suitable',basis:'Checked dated suitability'};
    };
    const primary=booking('preparer','80');
    const prep=await draft(a,'M04-F06',{...primary,credential:unknown});
    await register('reviewer',a,'M04-F06','submit',{},prep,409);
    await draft(a,'M04-F06',{...primary,assignmentEnd:'2026-06-15'},prep);
    await register('reviewer',a,'M04-F06','submit',{},prep,409);
    await draft(a,'M04-F06',{...primary,appointment:roster.partner.appointment},prep);
    await register('reviewer',a,'M04-F06','submit',{},prep,409);
    await approve(a,'M04-F06',primary,prep);
    await approve(a,'M04-F06',booking('reviewer'));
    await approve(a,'M04-F06',booking('partner'));

    const external=await draft(a,'M04-F04',{assignee:'external',person:roster.specialist.person,scope:'Valuation',due:'2026-03-01'});
    await register('reviewer',a,'M04-F04','declare',{reason:'Verified declaration',source:'Signed declaration ref'},external);
    await register('reviewer',a,'M04-F04','submit',{},external);
    await register('partner',a,'M04-F04','approve',{reason:'Independent review'},external);
    const expert=booking('specialist');
    const expertId=await draft(a,'M04-F06',expert);
    await register('reviewer',a,'M04-F06','submit',{},expertId,409);
    await approve(a,'M04-F06',{...expert,declaration:external,supervisor:'reviewer',deliverable:'Signed valuation memorandum'},expertId);
    const enabled=await write('partner',a,'staffing-enable',{});
    assert.equal(enabled.staffing.managed,true);
    assert.equal(enabled.staffing.accepted.length,4);
    assert.equal(enabled.staffing.seats.find(s=>s.capacity==='specialist').deliverable,'Signed valuation memorandum');
    assert.deepEqual(enabled.staffing.members.sort(),['partner','preparer','reviewer']);

    const competing=await draft(b,'M04-F06',booking('preparer','30'));
    await register('reviewer',b,'M04-F06','submit',{},competing,409);
    await approve(b,'M04-F06',booking('preparer','20'),competing);
    const personBefore=(await view('reviewer','firm')).roster.find(r=>r.id===roster.preparer.person);
    assert.equal(personBefore.committed,100);
    assert.equal(personBefore.assignments.length,2);
    assert.ok(personBefore.credentials.some(c=>c.id===unknown&&c.validity==='unknown'));
    await write('partner',b,'access',{role:'reviewer',access:'revoke',reason:'Scoped portfolio'});
    const visible=(await view('reviewer','firm')).roster.find(r=>r.id===roster.preparer.person);
    assert.equal(visible.committed,80);
    assert.deepEqual(visible.assignments.map(x=>x.engagement),[a]);

    const form='3.1.2';
    const schedule={form,start:'2026-03-01',due:'2026-04-01'};
    await write('reviewer',a,'schedule',{...schedule,due:'2026-06-01'},409);
    await write('reviewer',a,'schedule',schedule);
    await write('reviewer',a,'task-add',{owner:'preparer',title:'Check fixture',due:'2026-04-01',form});
    const req=(await write('reviewer',a,'request',{form,title:'Fixture ledger',due:'2026-03-20'})).requests[0].id;
    await write('preparer',a,'upload',{request:req,name:'ledger.csv',source:'Fixture',base64:'bGVkZ2Vy'});
    await write('preparer',a,'accept',{request:req});
    await write('preparer',a,'save',{form,execution:'Prepared',conclusion:'Agreed'});
    await write('preparer',a,'submit',{form});
    await write('reviewer',a,'work-assign',{form,owner:'reviewer',reviewer:'preparer',reason:'Try changing submitted route'},409);
    const signed=(await write('reviewer',a,'review',{form})).papers.find(p=>p.form===form);
    assert.deepEqual(signed.staffingSignoffs.map(s=>[s.action,s.seat.name]),[['review','Staff reviewer'],['submit','Staff preparer']]);
    assert.equal(signed.staffingSignoffs[0].seat.credential.source,'Exact issuer record');

    await approve('firm','M01-F03',{...roster.preparer.facts,status:'inactive'},roster.preparer.person);
    await write('reviewer',a,'task-add',{owner:'preparer',title:'Do not assign',due:'2026-04-01',form},409);
    await write('preparer',a,'save',{form,execution:'New edits',conclusion:'Blocked'},409);
    const replacement=(await write('reviewer',a,'work-assign',{form,owner:'reviewer',reviewer:'partner',reason:'Preparer unavailable'})).papers.find(p=>p.form===form);
    assert.deepEqual([replacement.owner,replacement.reviewer,replacement.due],['temuulen','bat',schedule.due]);
    assert.equal(replacement.reviewedVersion,signed.reviewedVersion);
    assert.equal(replacement.status,'reviewed');
    assert.deepEqual(replacement.staffingSignoffs,signed.staffingSignoffs);
    assert.equal(replacement.assignmentHistory[0].reason,'Preparer unavailable');
    assert.equal(replacement.assignmentHistory[0].ownerBasis.name,'Staff reviewer');
    const assignedView=await view('partner',a);
    assert.equal(assignedView.staffing.seats.find(s=>s.capacity==='preparer').current,false);
    assert.equal(assignedView.staffing.accepted.find(s=>s.capacity==='preparer').name,'Staff preparer');
    assert.equal(assignedView.requests.find(r=>r.id===req).owner,'nomin');
    const later=(await write('partner',a,'request',{form,title:'Follow-up ledger',due:'2026-04-05'})).requests[0];
    assert.equal(later.owner,'temuulen');
    const rerouted=await write('reviewer',a,'work-assign',{form,owner:'partner',reviewer:'reviewer',reason:'Route outstanding follow-up'});
    assert.equal(rerouted.requests.find(r=>r.id===later.id).owner,'bat');
    assert.equal(rerouted.requests.find(r=>r.id===req).owner,'nomin');
    await write('reviewer',a,'upload',{request:later.id,name:'new.csv',source:'Fixture',base64:'bGVkZ2Vy'},403);
    await write('partner',a,'upload',{request:later.id,name:'new.csv',source:'Fixture',base64:'bGVkZ2Vy'});
    assert.equal((await write('partner',a,'accept',{request:later.id})).requests[0].status,'complete');

    await service.close();
    service=null;
    service=await start(database);
    const again=await fixture(service,false);
    const restored=(await again.view('partner',a)).papers.find(p=>p.form===form);
    assert.deepEqual(restored.staffingSignoffs,signed.staffingSignoffs);
    assert.equal(restored.owner,'bat');
  } finally {
    if (service) await service.close();
    for (const suffix of ['', '-shm', '-wal']) await rm(database+suffix,{force:true});
    await rmdir(dir);
  }
});

test('provisional intake, subsequent-period confirmation and signed terms survive independent review', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'audit-intake-'));
  const database = join(dir, 'intake.sqlite');
  let service;
  try {
    service = await start(database);
    const { cookies, scoped, view, write } = await fixture(service);
    const getEnquiry = (v, id) => v.intake.enquiries.find(row => row.id === id);
    const base = { company:'Source client', contact:'Finance contact', origin:'firm', service:'Financial statement audit', facts:'Reporting period unknown' };
    const draft = (await write('preparer','firm','intake-save',base)).intake.enquiries[0];
    assert.deepEqual([draft.status,draft.origin,draft.start,draft.end,draft.framework,draft.contact], ['draft','firm','','','','Finance contact']);
    assert.equal((await view('reviewer','firm')).intake.enquiries.length, 0);
    const forwarded = await write('preparer','firm','intake-forward',{id:draft.id,note:'Confirm client identifiers'});
    assert.equal(getEnquiry(forwarded,draft.id).status,'forwarded');
    assert.deepEqual(forwarded.portfolio,[]);
    const returned = await write('reviewer','firm','intake-return',{id:draft.id,item:'Reporting period',note:'Confirm with finance'});
    assert.equal(getEnquiry(returned,draft.id).history[0].item,'Reporting period');
    await write('preparer','firm','intake-save',{...base,id:draft.id,start:'2025-01-01',end:'2025-12-31'});
    await write('preparer','firm','intake-forward',{id:draft.id,note:'Confirmed dates'});
    const separate = (await write('reviewer','firm','intake-save',{...base,company:'Declined prospect',origin:'client'})).intake.enquiries[0];
    await write('reviewer','firm','intake-forward',{id:separate.id,note:'Review conflict'});
    const declined = await write('partner','firm','intake-decline',{id:separate.id,note:'Engagement not offered'});
    assert.equal(getEnquiry(declined,separate.id).status,'declined');
    assert.equal(getEnquiry(declined,separate.id).engagement,undefined);

    const clientFields = {name:base.company,registration:'INTAKE-001',legalForm:'ХХК',framework:'',industry:'Manufacturing',bodies:'Board',note:'Client-supplied profile'};
    await write('preparer','firm','client-save',clientFields,403);
    const client = (await write('reviewer','firm','client-save',clientFields)).intake.clients[0];
    await write('reviewer','firm','client-save',{...clientFields,registration:' intake-001 '},409);
    const contactFields = {id:client.id,name:'First finance contact',email:'first@example.test',capacity:'Finance director',
      body:'Board',source:'Client confirmation',effective:'2025-03-01',signer:'yes',note:'Record both capacities'};
    const current = (await write('reviewer','firm','client-contact',contactFields)).intake.clients[0];
    const contact = current.profile.contacts[0];
    assert.equal(contact.signer,true);
    assert.equal(contact.role,'Finance director');
    assert.equal(contact.source,'Client confirmation');
    const convert = {id:draft.id,clientId:client.id,contactId:contact.id,synthetic:'yes',extended:'no',note:'Confirmed for the 2025 period'};
    await write('reviewer','firm','intake-convert',convert,409);
    await write('reviewer','firm','client-save',{...clientFields,id:client.id,framework:'Approved fixture framework'});
    await write('reviewer','firm','intake-convert',convert,400);
    const dates = {start:'2025-01-01',end:'2025-12-31',reportDate:'2026-04-01'};
    const requestKey=randomUUID(), firmRev=(await view('reviewer','firm')).revision;
    const original = await write('reviewer','firm','intake-convert',{...convert,...dates},200,{key:requestKey,revision:firmRev});
    const a=original.selected;
    assert.equal((await write('reviewer','firm','intake-convert',{...convert,...dates},200,{key:requestKey,revision:firmRev})).selected,a);
    assert.equal(original.engagement.active,false);
    assert.deepEqual(original.engagement.decisions,[]);
    assert.equal(original.intakeContext.by,'reviewer');
    assert.equal(original.intakeContext.enquiry,draft.id);
    const activate={assessment:'Accepted on verified evidence',independence:'Reviewed threat assessment',letter:'Forged external reference'};
    assert.match((await write('partner',a,'activate',activate,409)).error,/1\.4\.3/);
    const acceptFile=async(scope,bytes)=>{
      const row=await write('reviewer',scope,'support-upload',{name:'signed-letter.pdf',source:'Client signed copy',base64:Buffer.from(bytes).toString('base64')});
      const id=row.evidence.at(-1).id;
      await write('partner',scope,'support-assess',{id,result:'accepted',reason:'Independently verified file'});
      return id;
    };
    const approveTerms=async(scope,evidence,reference,version)=>{
      const fields={evidence,reference,signatory:'Client director',signedOn:'2026-03-20',scope:'Financial statement audit only'};
      const saved=await write('reviewer',scope,'intake-terms-save',fields);
      assert.equal(saved.intakeTerms.version,version);
      await write('reviewer',scope,'intake-terms-approve',{version:String(version),reason:'Self approval'},403);
      await write('partner',scope,'intake-terms-approve',{version:String(version+1),reason:'Wrong version'},409);
      return write('partner',scope,'intake-terms-approve',{version:String(version),reason:'Approved exact version'});
    };
    const oldEvidence=await acceptFile(a,'Approved 2025 terms');
    const first=await approveTerms(a,oldEvidence,'Letter v1',1);
    assert.equal(first.intakeTerms.sha256,createHash('sha256').update('Approved 2025 terms').digest('hex'));
    const threatFields={'field.threat':'Conflicting service','field.significance':'high','field.owner':'reviewer','field.safeguard':'Independent review',
      'field.followup':'2026-03-31','field.residual':'open','field.basis':'Unresolved threat'};
    const risk=(await write('reviewer',a,'register',{kind:'M04-F05',operation:'save',...threatFields})).registers.at(-1).id;
    const updateRisk=(role,operation,fields={})=>write(role,a,'register',{kind:'M04-F05',id:risk,operation,...fields});
    await updateRisk('reviewer','submit');
    await updateRisk('partner','approve',{reason:'Threat remains open'});
    assert.match((await write('partner',a,'activate',activate,409)).error,/M04-F05/);
    await updateRisk('reviewer','save',{...threatFields,'field.residual':'acceptable'});
    await updateRisk('reviewer','submit');
    await updateRisk('partner','approve',{reason:'Safeguard verified'});
    const active = await write('partner',a,'activate',activate);
    assert.equal(active.engagement.active,true);
    assert.equal(active.engagement.decisions.at(-1).letter,'1.4.3 v1 · Letter v1');
    assert.equal((await view('reviewer','firm')).intake.clients[0].status,'active');
    await write('reviewer',a,'form-use',{form:'1.1.1',version:'source'});
    const oldIntake=(await view('preparer',a)).papers.find(p=>p.form==='1.1.1');
    assert.equal(oldIntake.template.shared.framework,'Approved fixture framework');
    const originalRequest=(await write('reviewer',a,'request',{title:'Prior-period file',due:'2026-03-31'})).requests[0];
    assert.equal(originalRequest.contactEmail,'first@example.test');

    const next = (await write('reviewer','firm','intake-save',{...base,origin:'client',clientId:client.id})).intake.enquiries[0];
    await write('reviewer','firm','intake-forward',{id:next.id,note:'Continuance review'});
    await write('partner','firm','client-status',{id:client.id,status:'suspended',note:'Temporarily suspended'});
    await write('reviewer','firm','intake-convert',{...convert,id:next.id,...dates},409);
    await write('partner','firm','client-status',{id:client.id,status:'active',note:'Review complete'});
    await write('reviewer','firm','intake-convert',{...convert,id:next.id,...dates},409);
    assert.equal(getEnquiry(await view('reviewer','firm'),next.id).status,'forwarded');
    const nextPeriod = {start:'2026-01-01',end:'2026-12-31',reportDate:'2027-04-01'};
    const follow = await write('reviewer','firm','intake-convert',{...convert,id:next.id,...nextPeriod,prior:a,note:'Selected stable client facts only'});
    const b = follow.selected;
    assert.notEqual(a,b);
    assert.equal(follow.intakeContext.prior,a);
    assert.equal(follow.engagement.active,false);
    assert.deepEqual(follow.evidence,[]);
    assert.deepEqual(follow.engagement.decisions,[]);
    assert.equal((await service.fetch(scoped('/evidence/'+oldEvidence,b),cookies.partner)).status,404);
    const evidenceB=await acceptFile(b,'Approved 2026 terms');
    await approveTerms(b,evidenceB,'Second period letter',1);
    const corrected = await write('reviewer','firm','client-contact',{...contactFields,contactId:contact.id,email:'updated@example.test',effective:'2025-06-01',note:'New verified contact channel'});
    const currentClient=corrected.intake.clients[0];
    assert.ok(currentClient.history.some(h=>h.before?.contacts.some(c=>c.email==='first@example.test')));
    assert.match((await write('partner',b,'activate',activate,409)).error,/дахин/);
    const refreshed=await write('reviewer',b,'intake-refresh',{contactId:contact.id,note:'Reconfirmed replacement channel'});
    assert.equal(refreshed.intakeContext.version,currentClient.version);
    assert.equal(refreshed.intakeContext.history[0].note,'Selected stable client facts only');
    assert.match((await write('partner',b,'activate',activate,409)).error,/1\.4\.3/);
    const refreshedTerms=await approveTerms(b,evidenceB,'Second period letter',2);
    assert.equal(refreshedTerms.intakeTermsHistory[0].version,1);
    await write('partner',b,'activate',activate);
    assert.equal((await view('partner',a)).engagement.decisions.at(-1).letter,'1.4.3 v1 · Letter v1');
    assert.equal((await view('reviewer',a)).requests[0].contactEmail,'first@example.test');
    assert.equal((await write('reviewer',b,'request',{title:'Current-period file',due:'2027-03-31'})).requests[0].contactEmail,'updated@example.test');
    assert.equal((await view('partner',b)).engagement.decisions.at(-1).letter,'1.4.3 v2 · Second period letter');
    await service.close();
    service=null;
    service=await start(database);
    const reloaded=await fixture(service,false);
    const firm=await reloaded.view('reviewer','firm');
    assert.deepEqual(firm.intake.clients[0].periods.map(p=>p.id),[b,a]);
    assert.equal(getEnquiry(firm,separate.id).status,'declined');
    assert.equal((await reloaded.view('partner',b)).intakeContext.prior,a);
  } finally {
    if (service) await service.close();
    for (const suffix of ['', '-shm', '-wal']) await rm(database + suffix, { force: true });
    await rmdir(dir);
  }
});

test('typed workpapers and one-form grants preserve published and reviewed versions', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'audit-forms-'));
  const database = join(dir, 'forms.sqlite');
  let service = await start(database);
  try {
    const { cookies, scoped, view, write } = await fixture(service);
    const firm = await view('reviewer','firm');
    assert.equal(firm.forms.length,70);
    const fetchTemplate = async id => {
      const response = await service.fetch(scoped('/template/'+id, 'firm'), cookies.reviewer);
      assert.equal(response.status,200);
      return response.json();
    };
    for (const listed of firm.forms) {
      const body = await fetchTemplate(listed.id);
      assert.equal(body.id, listed.id);
      assert.ok(body.fields.length && body.fields.every(field => field.source));
    }
    const scopeForm = await fetchTemplate('1.1.1');
    assert.deepEqual(scopeForm.fields.filter(f=>f.key.startsWith('r10_')).map(f=>f.binding), ['name','legalForm','registration']);
    const body44 = await fetchTemplate('4.4');
    const body45 = await fetchTemplate('4.5');
    const save = (role,body,status=200) => write(role,'firm','template-save',{form:body.id,body:JSON.stringify(body)},status);
    const note = (role,action,id,status=200) => write(role,'firm',action,{form:id,note:'Synthetic methodology review'},status);
    await save('reviewer',body44,403);
    await write('reviewer','firm','template-grant',{form:'4.4',actor:'reviewer',access:'grant',note:'Attempt self grant'},403);
    await write('partner','firm','template-grant',{form:'4.4',actor:'reviewer',access:'grant',note:'One form'});
    await save('reviewer',body45,403);
    await save('reviewer',body44);
    await note('reviewer','template-submit','4.4');
    await note('reviewer','template-publish','4.4',403);
    await note('partner','template-return','4.4');
    await note('reviewer','template-submit','4.4');
    await note('partner','template-publish','4.4');
    await write('partner','firm','template-grant',{form:'4.4',actor:'reviewer',access:'revoke',note:'End grant'});
    await save('reviewer',body44,403);

    const a = (await write('reviewer','firm','create',create)).selected;
    const b = (await write('reviewer','firm','create',{...create,client:'Another client',registration:'FORMS-2'})).selected;
    const pick = (v,id) => v.papers.find(p=>p.form===id);
    const enable = (id,form,version,status=200,role='reviewer') => write(role,id,'form-use',{form,version},status);
    const intake = pick(await enable(a,'1.1.1','source'),'1.1.1');
    assert.equal(intake.template.shared.registration,create.registration);
    assert.equal(intake.template.shared.period,create.start+' — '+create.end);
    assert.equal(intake.template.linked.r17,'');
    const input = (form,templateDigest,answers) => ({form,templateDigest,answers:JSON.stringify(answers)});
    const scopeAnswers = {...input('1.1.1',intake.template.digest,{r26:'Scope documented'}),execution:'Work',conclusion:'Current scope'};
    await write('preparer',a,'save',{...scopeAnswers,answers:JSON.stringify({r16:'Forged decision'})},400);
    await write('preparer',a,'save',scopeAnswers);
    await write('preparer',a,'submit',{form:'1.1.1'},409);
    await enable(a,'3.1.2','source',409);
    await write('partner',a,'activate',{independence:'I-typed',letter:'L-typed',assessment:'A-typed'});
    const submitted = pick(await write('preparer',a,'submit',{form:'1.1.1'}),'1.1.1');
    assert.equal(submitted.values['linked.r17'],'L-typed');
    assert.equal(submitted.template.linked.r16,'A-typed');
    await write('reviewer',a,'review',{form:'1.1.1'});
    await enable(a,'4.1.A2','source',409);

    const id='F-FORMS001';
    const question=(key,type,extra={})=>({key,label:key,type,source:'Synthetic workbook',...extra});
    const custom = {id,title:'Typed pilot fixture',stage:3,fields:[
      question('amount','number',{required:true}),question('day','date',{required:true}),
      question('result','yesno',{required:true}),question('reason','textarea',{required:true,when:{key:'result',value:'Үгүй'}}),
      question('choice','select',{options:['One','Two']}),question('many','multiselect',{options:['A','B']}),
      question('items','table',{required:true}),question('proof','evidence',{required:true}),question('entity','text',{binding:'name'}),
    ]};
    await save('reviewer',custom);
    await note('reviewer','template-submit',id);
    assert.equal((await view('preparer','firm')).formLibrary.drafts.length,0);
    await enable(a,id,'1',409);
    const pub1=(await note('partner','template-publish',id)).formLibrary.releases.find(r=>r.id===id);
    await enable(a,id,'1',403,'preparer');
    const pinned=pick(await enable(a,id,'1'),id);
    assert.equal(pinned.template.digest,pub1.digest);
    const attach = async(scope,name) => {
      const file=(await write('reviewer',scope,'support-upload',{name,source:'Synthetic source',base64:Buffer.from(name).toString('base64')})).evidence[0].id;
      await write('partner',scope,'support-assess',{id:file,result:'accepted',reason:'Read independently'});
      return file;
    };
    const evidence=await attach(a,'approved.csv'),other=await attach(b,'private.csv');
    const rowId=randomUUID();
    const rows=JSON.stringify([{id:rowId,values:{description:'Asset row',amount:'0'}}]);
    const answers={amount:'0',day:'2026-03-15',result:'Үгүй',choice:'One',many:'["A","B"]',items:rows,proof:evidence};
    const fields = override => input(id,pub1.digest,{...answers,...override});
    await write('reviewer',a,'save',fields({day:'2026-02-31'}),400);
    await write('reviewer',a,'save',fields({many:'["B","Z"]'}),400);
    await write('reviewer',a,'save',fields({items:'[{"id":"same","values":{}},{"id":"same","values":{}}]'}),400);
    await write('reviewer',a,'save',fields({proof:other}),400);
    await write('reviewer',a,'save',fields({entity:'Forged company'}),400);
    await write('reviewer',a,'save',fields({}));
    await write('reviewer',a,'submit',{form:id},409);
    const prepared=pick(await write('reviewer',a,'save',fields({reason:'Observed exception'})),id);
    assert.equal(prepared.values['field.amount'],'0');
    assert.equal(JSON.parse(prepared.values['field.items'])[0].id,rowId);
    assert.deepEqual(prepared.evidence,[evidence]);
    await write('reviewer',a,'submit',{form:id});
    await write('reviewer',a,'review',{form:id},403);
    const signed=pick(await write('partner',a,'review',{form:id}),id);
    assert.equal(signed.reviewedVersion,signed.version);

    const programme=pick(await enable(a,'3.1.2','source'),'3.1.2');
    const req=(await write('reviewer',a,'request',{title:'Fixed assets',due:'2026-03-31'})).requests[0].id;
    await write('preparer',a,'upload',{request:req,name:'assets.csv',source:'Synthetic evidence',base64:'YXNzZXRz'});
    await write('preparer',a,'accept',{request:req});
    const procedure=programme.template.body.fields.find(f=>f.type==='procedure');
    const procAnswers={
      [procedure.key]:'Compared register and ledger',
      [procedure.key+'.outcome']:procedure.options[0],
      [procedure.key+'.result']:'No exception',
      [procedure.key+'.actualHours']:'0',
      [procedure.key+'.assertions']:'["О"]',
      [procedure.key+'.file']:evidence,
    };
    await write('preparer',a,'save',{...input('3.1.2',programme.template.digest,procAnswers),execution:'Test',conclusion:'Reviewed results'});
    await write('preparer',a,'submit',{form:'3.1.2'});
    await write('reviewer',a,'review',{form:'3.1.2'});
    await write('partner',a,'statements',{statements:'Synthetic statements',disclosures:'Synthetic disclosures'});
    for (const form of ['4.4','4.1.A1']) {
      await write('reviewer',a,'save',{form,execution:'Work',conclusion:'Current report'});
      await write('reviewer',a,'submit',{form});
      await write('partner',a,'review',{form});
    }
    assert.equal((await write('partner',a,'authorize',{})).authorized.current,true);
    const [snapshot]=await (await service.fetch(scoped('/authorizations',a),cookies.partner)).json();
    const archivedNative=snapshot.authorization.nativePapers.find(p=>p.id.endsWith('/'+id));
    assert.equal(archivedNative.version,signed.version);
    assert.equal(archivedNative.values['field.amount'],'0');
    assert.ok(snapshot.authorization.templates.some(t=>t.hash===pub1.digest));
    assert.ok(snapshot.evidence.some(file=>file.id===evidence));

    await write('partner',b,'activate',{independence:'I2',letter:'L2',assessment:'A2'});
    await enable(b,id,'1');
    const newer={...custom,fields:custom.fields.filter(f=>f.key!=='amount'&&f.key!=='proof')};
    await save('reviewer',newer);
    await note('reviewer','template-submit',id);
    const pub2=(await note('partner','template-publish',id)).formLibrary.releases.find(r=>r.id===id);
    const unchanged=pick(await view('partner',a),id);
    assert.equal(unchanged.status,'reviewed');
    assert.equal(unchanged.template.digest,pub1.digest);
    assert.equal((await view('partner',a)).authorized.current,true);
    const revision=await enable(a,id,'2');
    assert.equal(revision.authorized.current,false);
    const updated=pick(revision,id);
    assert.equal(updated.status,'changed');
    assert.equal(updated.template.digest,pub2.digest);
    assert.equal(updated.values['field.amount'],undefined);
    assert.deepEqual(updated.evidence,[]);
    assert.equal(updated.values['field.items'],rows);
    assert.ok(updated.history.some(h=>h.version===signed.version&&h.values['field.amount']==='0'&&h.values.templateDigest===pub1.digest));
    assert.equal(updated.oldTemplates[pub1.digest].fields[0].key,'amount');
    assert.equal(pick(await view('partner',b),id).template.number,1);
    await write('reviewer',a,'save',fields({reason:'Stale payload'}),409);

    await service.close();
    service = await start(database);
    const reloaded=await fixture(service,false);
    assert.equal(pick(await reloaded.view('partner',a),id).template.number,2);
    assert.equal(pick(await reloaded.view('partner',b),id).template.number,1);
    assert.equal(pick(await reloaded.view('partner',a),id).oldTemplates[pub1.digest].title,custom.title);
  } finally {
    await service.close();
    for (const suffix of ['', '-shm', '-wal']) await rm(database + suffix, { force: true });
    await rmdir(dir);
  }
});

test('two engagements isolate revisions, work, reports, grants and archive access', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'audit-multi-'));
  const database = join(dir, 'multi.sqlite');
  let service = await start(database);
  try {
    const { cookies, scoped, view, write } = await fixture(service);
    const a = (await write('reviewer', 'firm', 'create', { ...create, synthetic: 'yes' })).selected;
    const createB = { ...create, client: 'Private second engagement', registration: 'QA-PILOT-2', synthetic: 'yes', includePreparer: 'no' };
    const key = randomUUID();
    const revision = (await view('reviewer', 'firm')).revision;
    const b = (await write('reviewer', 'firm', 'create', createB, 200, { key, revision })).selected;
    assert.notEqual(a, b);
    assert.equal((await write('reviewer', 'firm', 'create', createB, 200, { key, revision })).selected, b);
    assert.deepEqual((await view('reviewer', 'firm')).portfolio.map(e => e.id).sort(), [a, b].sort());
    assert.deepEqual((await view('preparer', 'firm')).portfolio.map(e => e.id), [a]);
    assert.doesNotMatch(JSON.stringify(await view('preparer', b, 404)), /Private second/);
    await write('reviewer', 'firm', 'create', { ...createB, registration: ' qa-pilot-1 ' }, 409);
    const activate = { independence: 'I1', letter: 'L1', assessment: 'Synthetic acceptance' };
    await write('partner', a, 'activate', activate);
    await write('partner', b, 'activate', activate);
    const schedule = { form: '3.1.2', start: '2026-03-01', due: '2026-03-15' };
    const revA = (await view('reviewer', a)).revision, revB = (await view('reviewer', b)).revision;
    await write('reviewer', a, 'schedule', schedule, 200, { revision: revA });
    assert.equal((await view('reviewer', b)).revision, revB);
    await write('reviewer', b, 'schedule', { ...schedule, due: '2026-03-16' }, 200, { revision: revB });
    await write('reviewer', a, 'schedule', { ...schedule, due: '2026-03-17' }, 409, { revision: revA });
    assert.equal((await view('reviewer', a)).papers[0].due, '2026-03-15');
    assert.equal((await view('reviewer', b)).papers[0].due, '2026-03-16');
    const portfolio = (await view('reviewer', 'firm')).portfolio;
    assert.equal(portfolio.find(e => e.id === a).progress.deadlines[0].due, '2026-03-15');
    assert.equal(portfolio.find(e => e.id === b).progress.deadlines[0].due, '2026-03-16');
    assert.deepEqual((await view('preparer', 'firm')).portfolio.map(e => e.progress.deadlines[0].due), ['2026-03-15']);
    const access = { role: 'preparer', access: 'grant', reason: 'Assigned fieldwork' };
    await write('reviewer', b, 'access', access, 403);
    await write('partner', b, 'access', access);

    const requestFields = { title: 'Audit evidence', due: '2026-03-20' };
    const requestKey = randomUUID();
    const request = (await write('reviewer', a, 'request', requestFields, 200, { key: requestKey })).requests[0].id;
    await write('reviewer', b, 'request', requestFields, 409, { key: requestKey });
    await write('preparer', b, 'accept', { request }, 404);
    async function finish(id, requestId, label) {
      const bytes = Buffer.from(label);
      const upload = await write('preparer', id, 'upload', { request: requestId, name: label + '.csv', source: label, base64: bytes.toString('base64') });
      const evidence = upload.evidence[0].id;
      await write('preparer', id, 'accept', { request: requestId });
      await write('partner', id, 'statements', { statements: label + ' statements', disclosures: label + ' disclosures' });
      for (const [form, owner, reviewer] of [['3.1.2','preparer','reviewer'], ['4.4','reviewer','partner'], ['4.1.A1','reviewer','partner']]) {
        await write(owner, id, 'save', { form, execution: 'Work reviewed', conclusion: label + ' conclusion' });
        await write(owner, id, 'submit', { form });
        await write(reviewer, id, 'review', { form });
      }
      await write('partner', id, 'authorize', {});
      await write('partner', id, 'issue', { reference: label + ' issue' });
      return evidence;
    }
    const evidenceA = await finish(a, request, 'Engagement A');
    assert.equal((await service.fetch(scoped('/evidence/' + evidenceA, b), cookies.reviewer)).status, 404);
    const sealedA = await write('partner', a, 'archive-seal', {});
    const archiveA = sealedA.archive.packages[0].id;
    assert.deepEqual((await view('partner', b)).archive.packages, []);
    const requestB = (await write('reviewer', b, 'request', requestFields)).requests[0].id;
    const evidenceB = await finish(b, requestB, 'Engagement B');
    assert.equal(await (await service.fetch(scoped('/evidence/' + evidenceB, b), cookies.preparer)).text(), 'Engagement B');
    await write('partner', b, 'access', { ...access, access: 'revoke' });
    assert.equal((await service.fetch(scoped('/evidence/' + evidenceB, b), cookies.preparer)).status, 404);
    await write('preparer', b, 'save', { form: '3.1.2', execution: 'X', conclusion: 'Y' }, 404, { revision: 1 });
    assert.equal((await view('preparer', a)).selected, a);
    for (const [id,label] of [[a,'Engagement A'],[b,'Engagement B']]) {
      const report = await (await service.fetch(scoped('/report', id), cookies.partner)).text();
      assert.match(report, new RegExp(label + ' statements'));
      const approvals = await (await service.fetch(scoped('/authorizations', id), cookies.partner)).json();
      assert.equal(approvals.length, 1);
      assert.match(approvals[0].authorization.artifact.html, new RegExp(label + ' statements'));
    }
    const sealedB = await write('partner', b, 'archive-seal', {});
    assert.notEqual(sealedB.archive.packages[0].id, archiveA);
    assert.equal(sealedB.archive.packages[0].previous, null);
    const grantFields = { 'field.package': archiveA, 'field.accessor': 'reviewer', 'field.reason': 'Audit inspection', 'field.until': '2099-01-01' };
    const wrong = await write('reviewer', b, 'register', { kind: 'M12-F07', operation: 'save', ...grantFields });
    await write('reviewer', b, 'register', { kind: 'M12-F07', id: wrong.registers.at(-1).id, operation: 'submit' }, 409);
    const grant = (await write('reviewer', a, 'register', { kind: 'M12-F07', operation: 'save', ...grantFields })).registers.at(-1).id;
    await write('reviewer', a, 'register', { kind: 'M12-F07', id: grant, operation: 'submit' });
    await write('partner', a, 'register', { kind: 'M12-F07', id: grant, operation: 'approve', reason: 'Approved' });
    const archivePath = '/archive-export/' + grant;
    assert.equal((await service.fetch(scoped(archivePath, a), cookies.reviewer, {})).status, 200);
    assert.equal((await service.fetch(scoped(archivePath, b), cookies.reviewer, {})).status, 403);
    await write('partner', a, 'access', { ...access, role: 'reviewer', access: 'revoke' });
    assert.equal((await service.fetch(scoped(archivePath, a), cookies.reviewer, {})).status, 404);
    await write('partner', a, 'access', { ...access, role: 'reviewer' });
    assert.equal((await service.fetch(scoped(archivePath, a), cookies.reviewer, {})).status, 403);
    await service.close();
    service = null;
    service = await start(database);
    const reloaded = await fixture(service, false);
    assert.deepEqual((await reloaded.view('preparer', 'firm')).portfolio.map(e => e.id), [a]);
    assert.deepEqual((await reloaded.view('partner', a)).archive.packages.map(p => p.id), [archiveA]);
    assert.deepEqual((await reloaded.view('partner', b)).archive.packages.map(p => p.id), [sealedB.archive.packages[0].id]);
  } finally {
    if (service) await service.close();
    for (const suffix of ['', '-shm', '-wal']) await rm(database + suffix, { force: true });
    await rmdir(dir);
  }
});

test('a single-workspace database migrates with its original IDs, versions and archive bytes', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'audit-legacy-'));
  const database = join(dir, 'legacy.sqlite');
  let service;
  try {
    const legacy = { ...emptyWorkspace(), person: accounts.reviewer };
    pilotAction(legacy, 'reviewer', 'create', { ...create, synthetic: 'yes' }, { archive: { isSealed: () => false } });
    const id = legacy.engagement;
    const fileId = randomUUID(), archiveId = randomUUID(), grantId = randomUUID();
    const file = Buffer.from('Legacy evidence fixture');
    const sha256 = createHash('sha256').update(file).digest('hex');
    legacy.pilotRecords = [{ id: grantId, kind: 'M12-F07', owner: 'reviewer', status: 'approved', version: 1,
      references: {}, history: [], values: { package: archiveId, accessor: 'preparer', until: '2099-01-01', reason: 'Historical grant' } }];
    const packageEvidence = { id: fileId, name: 'legacy.csv', sha256, version: 2, size: file.length, base64: file.toString('base64') };
    const authorization = { package: { paper: { id: id + '/4.1.A1', version: 3, values: { conclusion: 'Historical report' } } } };
    const archived = { authorization, client: create.client, issue: { reference: 'Historical issue' }, evidence: [packageEvidence] };
    const payload = JSON.stringify(archived), digest = createHash('sha256').update(payload).digest('hex');
    const db = new DatabaseSync(database);
    db.exec(`
      CREATE TABLE accounts (role TEXT PRIMARY KEY, salt TEXT NOT NULL, hash BLOB NOT NULL);
      CREATE TABLE workspace (id INTEGER PRIMARY KEY, revision INTEGER NOT NULL, body TEXT NOT NULL);
      CREATE TABLE evidence (id TEXT PRIMARY KEY, name TEXT NOT NULL, sha256 TEXT NOT NULL, bytes BLOB NOT NULL);
      CREATE TABLE authorizations (id INTEGER PRIMARY KEY, snapshot TEXT NOT NULL);
      CREATE TABLE pilot_archives (id TEXT PRIMARY KEY, previous TEXT, issued TEXT NOT NULL, sealed TEXT NOT NULL, digest TEXT NOT NULL, synthetic INTEGER NOT NULL, summary TEXT NOT NULL, payload TEXT);
    `);
    for (const [role, password] of Object.entries(passwords)) {
      db.prepare('INSERT INTO accounts VALUES (?, ?, ?)').run(role, 'migration-fixture', scryptSync(password, 'migration-fixture', 64));
    }
    db.prepare('INSERT INTO workspace VALUES (1, 19, ?)').run(JSON.stringify(legacy));
    db.prepare('INSERT INTO evidence VALUES (?, ?, ?, ?)').run(fileId, 'legacy.csv', sha256, file);
    db.prepare('INSERT INTO authorizations VALUES (1, ?)').run(JSON.stringify({ authorization }));
    db.prepare('INSERT INTO pilot_archives VALUES (?, NULL, ?, ?, ?, 1, ?, ?)').run(archiveId, '2026-04-01', '2026-04-05', digest,
      JSON.stringify({ client: create.client, files: [{ id: fileId, name: 'legacy.csv', version: 2, sha256 }] }), payload);
    db.close();
    service = await start(database);
    const { cookies, scoped, view } = await fixture(service, false);
    const migrated = await view('partner', id);
    assert.equal(migrated.revision, 19);
    assert.equal(migrated.archive.packages[0].digest, digest);
    assert.equal(migrated.archive.packages[0].id, archiveId);
    const exportPath = scoped('/archive-export/' + grantId, id);
    assert.deepEqual((await (await service.fetch(exportPath, cookies.preparer, {})).json()).content, archived);
    await service.close();
    service = await start(database);
    const res = await service.fetch('/login', '', { role: 'partner', password: passwords.partner });
    const reloaded = await res.json();
    assert.equal(reloaded.selected, id);
    assert.equal(reloaded.revision, 19);
    assert.equal(reloaded.archive.packages[0].id, archiveId);
  } finally {
    if (service) await service.close();
    for (const suffix of ['', '-shm', '-wal']) await rm(database + suffix, { force: true });
    await rmdir(dir);
  }
});

test('separate accounts hand off one persisted audit engagement and authorize exact evidence and report versions', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'audit-pilot-'));
  const database = join(dir, 'test.sqlite');
  let service;
  try {
    service = await start(database);
    assert.deepEqual(await (await service.fetch('')).json(), { setup: true });
    const setup = { code: 'test-bootstrap-only', ...passwords };
    assert.equal((await service.fetch('/setup', '', setup, 'http://example.test')).status, 403);
    assert.equal((await service.fetch('/setup', '', setup)).status, 201);
    assert.equal((await service.fetch('/setup', '', setup)).status, 409);
    assert.equal((await service.fetch('/login', '', { role: 'partner', password: passwords.preparer })).status, 401);
    const login = async role => {
      const response = await service.fetch('/login', '', { role, password: passwords[role] });
      assert.equal(response.status, 200);
      const cookie = response.headers.get('set-cookie');
      assert.match(cookie, /HttpOnly; SameSite=Strict/);
      return cookie.split(';')[0];
    };
    const reviewer = await login('reviewer'), preparer = await login('preparer'), partner = await login('partner');
    const view = async cookie => (await service.fetch('', cookie)).json();
    const write = async (cookie, action, fields, expected = 200, revision) => {
      const r = await service.fetch('/action', cookie, { action, fields, revision: revision ?? (await view(cookie)).revision, role: 'partner' });
      const json = await r.json();
      assert.equal(r.status, expected, action + ': ' + JSON.stringify(json).slice(0, 220));
      return json;
    };

    await write(preparer, 'create', create, 403);
    await write(reviewer, 'create', create);
    await write(partner, 'activate', { independence: 'Independence v1', letter: 'Agreed letter v1', assessment: 'Synthetic case accepted' });
    assert.equal((await view(preparer)).engagement.client, create.client);
    assert.equal((await view(reviewer)).engagement.active, true);
    const schedule = { form: '3.1.2', start: '2026-03-10', due: '2026-03-20' };
    await write(preparer, 'schedule', schedule, 403);
    await write(reviewer, 'schedule', { ...schedule, start: '2026-02-31' }, 400);
    const scheduled = await write(reviewer, 'schedule', schedule);
    const scheduledPaper = scheduled.papers.find(p => p.form === schedule.form);
    await write(reviewer, 'schedule', { ...schedule, due: '2026-03-22' });
    const sharedPaper = (await view(preparer)).papers.find(p => p.form === schedule.form);
    assert.equal(sharedPaper.due, '2026-03-22');
    assert.equal(sharedPaper.baselineDue, '2026-03-20');
    assert.equal(sharedPaper.version, scheduledPaper.version);
    const assigned = await write(reviewer, 'task-add', { owner: 'preparer', title: 'Check source ledger', due: '2026-03-22', form: schedule.form });
    const task = assigned.delivery.tasks[0].id;
    await write(partner, 'task-add', { title: 'Partner checkpoint', due: '2026-03-22' });
    assert.deepEqual((await view(preparer)).delivery.tasks.map(t => t.id), [task]);
    await write(reviewer, 'task-status', { id: task, done: 'yes' }, 403);
    await write(preparer, 'task-status', { id: task, done: 'yes' });
    assert.equal((await view(reviewer)).delivery.tasks.find(t => t.id === task).done, true);
    assert.equal((await view(reviewer)).papers.find(p => p.form === schedule.form).status, scheduledPaper.status);
    await write(reviewer, 'request', { title: 'Asset register', due: '2026-03-20' }, 409, 1);
    const requestCommand = { action: 'request', fields: { title: 'Asset register', due: '2026-03-20' },
      revision: (await view(reviewer)).revision, idempotencyKey: randomUUID() };
    const firstRequest = await service.fetch('/action', reviewer, requestCommand);
    assert.equal(firstRequest.status, 200);
    const requested = await firstRequest.json();
    const duplicate = await service.fetch('/action', reviewer, { ...requestCommand, fields: { due: '2026-03-20', title: 'Asset register' } });
    assert.equal(duplicate.status, 200);
    assert.equal((await duplicate.json()).revision, requested.revision);
    assert.equal((await service.fetch('/action', reviewer, { ...requestCommand, fields: { ...requestCommand.fields, title: 'Different request' } })).status, 409);
    const req = requested.requests[0].id;
    const work = { form: '3.1.2', execution: 'Compared additions to register', conclusion: 'First conclusion' };
    await write(preparer, 'save', work);
    await write(preparer, 'submit', work, 409);
    const upload = (name, contents) => write(preparer, 'upload', { request: req, name, source: 'Demo Finance', base64: Buffer.from(contents).toString('base64') });
    const old = (await upload('old.csv', 'incorrect,period')).evidence[0].id;
    await write(preparer, 'reject', { request: req, reason: 'Wrong period' });
    const contents = 'asset,amount\nsynthetic,100\n';
    const current = (await upload('register.csv', contents)).evidence.find(e => e.name === 'register.csv');
    assert.equal(current.replaces, old);
    assert.equal(current.version, 2);
    await write(reviewer, 'accept', { request: req }, 403);
    await write(preparer, 'accept', { request: req });
    assert.equal((await service.fetch('/evidence/' + old)).status, 401);
    assert.equal(await (await service.fetch('/evidence/' + old, reviewer)).text(), 'incorrect,period');
    assert.equal(await (await service.fetch('/evidence/' + current.id, reviewer)).text(), contents);
    const submission = await write(preparer, 'submit', work);
    await write(preparer, 'review', work, 403);
    const returned = await write(reviewer, 'return', { form: work.form, reason: 'Explain the amount' });
    const note = returned.papers[0].notes[0].id;
    await write(preparer, 'save', { ...work, conclusion: 'Matched 100 to the replacement register.' });
    await write(preparer, 'respond', { form: work.form, note, response: 'Recorded exact evidence and amount.' });
    await write(preparer, 'submit', work);
    await write(reviewer, 'review', work, 409);
    await write(reviewer, 'clear', { form: work.form, note });
    const reviewed = await write(reviewer, 'review', work);
    assert.equal(reviewed.papers[0].reviewedVersion, submission.papers[0].version + 1);
    await write(partner, 'authorize', {}, 409);
    await write(partner, 'statements', { statements: 'Synthetic statement set v1', disclosures: 'Synthetic notes v1' });
    for (const form of ['4.4', '4.1.A1']) {
      await write(reviewer, 'save', { ...work, form });
      await write(reviewer, 'submit', { form });
      await write(partner, 'review', { form });
    }
    await write(preparer, 'authorize', {}, 403);
    const signed = await write(partner, 'authorize', {});
    assert.equal(signed.authorized.current, true);
    assert.equal((await service.fetch('/authorizations', reviewer)).status, 404);
    const snapshots = await (await service.fetch('/authorizations', partner)).json();
    assert.equal(snapshots[0].authorization.package.reliedOn.find(p => p.id.endsWith('/3.1.2')).reviewedVersion, reviewed.papers[0].reviewedVersion);
    assert.equal(snapshots[0].evidence[0].sha256, createHash('sha256').update(contents).digest('hex'));
    await write(partner, 'authorize', {});
    assert.equal((await view(partner)).authorized.count, 1);
    const changed = await write(partner, 'statements', { statements: 'Synthetic statement set v2', disclosures: 'Synthetic notes v1' });
    assert.equal(changed.authorized.current, false);
    assert.equal(changed.papers.find(p => p.form === '4.1.A1').status, 'changed');
    await write(partner, 'authorize', {}, 409);

    await service.close();
    service = null;
    service = await start(database);
    assert.deepEqual(await (await service.fetch('')).json(), { setup: false });
    const afterRestart = await login('partner');
    const reviewerAfterRestart = await login('reviewer');
    const replay = await service.fetch('/action', reviewerAfterRestart, requestCommand);
    assert.equal(replay.status, 200);
    assert.deepEqual((await replay.json()).requests.map(r => r.id), [req]);
    const deliveryAfterRestart = await view(reviewerAfterRestart);
    assert.equal(deliveryAfterRestart.delivery.tasks.find(t => t.id === task).done, true);
    assert.equal(deliveryAfterRestart.papers.find(p => p.form === schedule.form).due, '2026-03-22');
    assert.equal((await view(afterRestart)).authorized.current, false);
    assert.deepEqual(await (await service.fetch('/authorizations', afterRestart)).json(), snapshots);
    assert.equal(await (await service.fetch('/evidence/' + current.id, afterRestart)).text(), contents);
    assert.equal((await service.fetch('/logout', afterRestart, {})).status, 200);
    assert.equal((await service.fetch('/evidence/' + current.id, afterRestart)).status, 401);
  } finally {
    if (service) await service.close();
    for (const suffix of ['', '-shm', '-wal']) await rm(database + suffix, { force: true });
    await rmdir(dir);
  }
});

test('the extended engagement exercises all 34 registers and seals a scoped recoverable archive', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'audit-registers-'));
  const database = join(dir, 'test.sqlite');
  let service;
  try {
    service = await start(database);
    assert.equal((await service.fetch('/setup', '', { code: 'test-bootstrap-only', ...passwords })).status, 201);
    const cookies = {};
    const signIn = async role => {
      const response = await service.fetch('/login', '', { role, password: passwords[role] });
      assert.equal(response.status, 200);
      cookies[role] = response.headers.get('set-cookie').split(';')[0];
      return response.json();
    };
    let current;
    for (const role of Object.keys(passwords)) current = await signIn(role);
    const write = async (role, action, fields, expected = 200) => {
      const result = await service.fetch('/action', cookies[role], { revision: current.revision, action, fields });
      const value = await result.json();
      assert.equal(result.status, expected, action + ' ' + (fields.kind ?? '') + ' · ' + (value.error ?? ''));
      if (result.ok) current = value;
      return value;
    };
    const action = (role, kind, id, operation, extra = {}, status = 200) =>
      write(role, 'register', { kind, id, operation, ...extra }, status);
    const save = async (role, kind, values, id = '', status = 200) => {
      const value = await action(role, kind, id, 'save', Object.fromEntries(Object.entries(values).map(([k,v]) => ['field.'+k,v])), status);
      return status === 200 ? (id || value.registers.findLast(row=>row.kind===kind).id) : value;
    };
    const approve = async (kind, values, owner='reviewer', reviewer='partner', id='') => {
      const record = await save(owner, kind, values, id);
      await action(owner, kind, record, 'submit');
      await action(reviewer, kind, record, 'approve', { reason: 'Tested and documented' });
      return record;
    };
    const find = id => current.registers.find(row => row.id === id);
    const filing = { name: 'Synthetic Audit Firm', licence: 'F-1', reporting: 'Historical firm name', contact: 'test@example.test' };
    await save('preparer', 'M01-F01', filing, '', 403);
    const firm = await approve('M01-F01', filing);
    const unit = await approve('M01-F02', { name: 'Audit team', type: 'team', status: 'active' });
    const practitioners = {};
    for (const role of Object.keys(passwords)) {
      const person = await approve('M01-F03', { name: 'Synthetic ' + role, reference: role, unit, status: 'active', availableFrom: '2025-01-01', availableTo: '2027-01-01' });
      const credential = await approve('M01-F04', { person, qualification: 'Test credential', sector: 'Manufacturing', skill: 'Audit', validFrom: '2025-01-01', validTo: '2027-01-01', source: 'Synthetic credential ref' });
      await approve('M01-F06', { person, role, employment: 'employee', from: '2025-01-01', basis: 'Pilot roster role' });
      practitioners[role] = { person, credential };
    }
    const rule = await approve('M02-F05', { programme: '3.1.2', profile: 'framework', match: 'Test', outcome: 'required', override: 'no', basis: 'Fixture programme applicability' });
    const excluded = await approve('M02-F05', { programme: '3.1.3', profile: 'all', outcome: 'excluded', override: 'no', basis: 'Fixture programme exclusion' });
    const stockSource = await service.fetch('/template/3.1.4?version=source',cookies.reviewer);
    assert.equal(stockSource.status,200);
    const stockTemplate = {...await stockSource.json(),title:'Reviewed stock count programme'};
    await write('partner','template-grant',{form:'3.1.4',actor:'reviewer',access:'grant',note:'Stock template only'});
    await write('reviewer','template-save',{form:'3.1.4',body:JSON.stringify(stockTemplate)});
    await write('reviewer','template-submit',{form:'3.1.4',note:'Prepared local stock version'});
    const publishedStock = (await write('partner','template-publish',{form:'3.1.4',note:'Reviewed stock version'})).formLibrary.releases.find(r=>r.id==='3.1.4');
    await write('reviewer', 'create', { ...create, extended: 'yes', synthetic: 'yes' });
    const activation = { independence: 'I-1', letter: 'L-1', assessment: 'Synthetic case accepted' };
    await write('reviewer', 'support-upload', { name: 'registry.csv', source: 'Synthetic registry', base64: Buffer.from('id,owner\n1,Parent').toString('base64') });
    const registryFile = current.evidence[0].id;
    await write('reviewer', 'support-assess', { id: registryFile, result: 'accepted', reason: 'Own file' }, 403);
    await write('partner', 'support-assess', { id: registryFile, result: 'accepted', reason: 'Verified registry provenance' });
    const party = await approve('M03-F04', { name: 'Parent', relation: 'controller', share: '80', effective: '2025-01-01', source: 'Group record', basis: 'Evidence examined' });
    await approve('M04-F02', { concern: 'Management integrity', party, source: 'Registry and inquiries', evidence: registryFile, owner: 'reviewer', result: 'addressed', basis: 'No unresolved issues' });
    for (const role of Object.keys(passwords)) {
      const issuer = role === 'reviewer' ? 'partner' : 'reviewer';
      const id = await save(issuer, 'M04-F04', { assignee: role, scope: 'Current engagement', due: '2026-03-01' });
      await action(role, 'M04-F04', id, 'declare', { reason: 'Own synthetic declaration' });
      await action(issuer, 'M04-F04', id, 'submit');
      await action(role, 'M04-F04', id, 'approve', { reason: 'Own signature' }, 403);
      await action(issuer, 'M04-F04', id, 'approve', { reason: 'Evaluated the declaration' });
      await approve('M04-F06', { capacity: role, ...practitioners[role], assignmentDate: '2026-03-15', hours: '10', needs: 'Audit capacity', result: 'suitable', basis: 'Roster and credential checked' });
    }
    const threat = { threat: 'Prior service', party, significance: 'medium', owner: 'reviewer', safeguard: 'Separate personnel', followup: '2026-03-12', residual: 'open', basis: 'Await evaluation' };
    const threatId = await approve('M04-F05', threat);
    assert.match((await write('partner', 'activate', activation, 409)).error, /M04-F05/);
    await approve('M04-F05', { ...threat, residual: 'acceptable', basis: 'Reviewed the safeguard' }, 'reviewer', 'partner', threatId);
    await write('partner', 'activate', activation);
    assert.equal(current.engagement.firm.find(r => r.id === firm).values.reporting, filing.reporting);
    await approve('M01-F01', { ...filing, reporting: 'New firm display name' }, 'reviewer', 'partner', firm);
    assert.equal(current.engagement.firm.find(r => r.id === firm).values.reporting, filing.reporting);

    const checkPaper = async (form, owner, reviewer, fields={}) => {
      await write(owner, 'save', { form, execution: 'Performed the procedure', conclusion: 'Recorded result', ...fields });
      await write(owner, 'submit', { form });
      await write(reviewer, 'review', { form });
    };
    await checkPaper('1.3', 'preparer', 'reviewer', { benchmark: '1000', percentage: '2', performance: '60', trivial: '5' });
    await checkPaper('2.6', 'preparer', 'reviewer', { reliance: 'partial' });
    await write('reviewer', 'resolve-impact', { id: current.impacts[0].id, reason: 'Affected work considered before adoption' });
    const entity = await approve('M06-F02', { business: 'Manufacturing', objectives: 'Operations', governance: 'Board', environment: 'Competitive market', framework: 'Test', party, source: 'Board minutes' });
    const fraud = await approve('M06-F04', { risk: 'Override risk', entity, factors: 'Manual postings', inquiry: 'Interview', presumption: 'Documented decision', assertion: 'Existence', response: 'Test entries' });
    await approve('M06-F05', { area: 'PPE', reliance: 'Prior period review', test: 'Opening ledger tie', limitations: 'Prior firm scope limited', effect: 'Perform independent corroboration' });
    const analytics = await approve('M06-F06', { area: 'PPE', expected: '100', actual: '120', threshold: '10', source: 'Comparative schedule', investigation: 'New additions', scope: 'Test additions cycle' });
    const riskValues = { risk: 'PPE additions', entity, fraud, analytics, type: 'account', target: 'PPE', assertion: 'Existence', response: 'Test fixed asset additions', programme: '3.1.2' };
    const risk = await approve('M06-F09', riskValues);
    const otherRisk = await approve('M06-F09', { ...riskValues, programme: '3.1.3', target: 'Other accounts' });
    const blocked = await save('reviewer', 'M07-F01', { rule: excluded, risk: otherRisk, decision: 'adopt', basis: 'Try prohibited option' });
    await action('reviewer', 'M07-F01', blocked, 'submit', {}, 409);
    await approve('M07-F01', { rule: excluded, risk: otherRisk, decision: 'exclude', basis: 'Explicitly inapplicable' }, 'reviewer', 'partner', blocked);
    const programme = await approve('M07-F01', { rule, risk, decision: 'adopt', basis: 'Applicable plan and approved rule' });
    assert.deepEqual(current.fieldwork, ['3.1.2']);
    assert.equal(current.papers.some(p => p.form === '3.1.3'), false);
    assert.match(find(programme).template.digest, /^[a-f0-9]{64}$/);
    await write('preparer', 'request', { form: '3.1.2', title: 'Evidence set', due: '2026-03-30' });
    const request = current.requests[0].id;
    await write('preparer', 'upload', { request, name: 'support.xlsx', source: 'Synthetic Finance', base64: Buffer.from('test-only evidence bytes').toString('base64') });
    await write('preparer', 'accept', { request });
    const evidence = current.evidence.find(e => e.request === request).id;
    await approve('M07-F06', { programme, expected: '100', actual: '120', precision: '5', threshold: '10', reliability: 'Checked against GL', evidence, investigation: 'Investigated additions', conclusion: 'Explained' });
    await approve('M07-F08', { programme, recipient: 'Synthetic third party', address: 'example.test', due: '2026-03-31', result: 'none', provenance: 'Auditor-controlled address', resolution: 'Alternative invoices and receipts' });
    const journal = await approve('M07-F09', { programme, population: evidence, entry: 'JE-15', line: '2', selection: 'Manual entry', evidence, test: 'Matched to source', exception: 'Approval missing', conclusion: 'Escalated to governance' });
    const coverage = { type: 'subsequent', paper: '3.2.1', evidence, work: 'Read minutes', result: 'resolved', conclusion: 'No further items' };
    const subsequent = await save('reviewer', 'M07-F10', coverage);
    await action('reviewer', 'M07-F10', subsequent, 'submit', {}, 409);
    await approve('M07-F10', { ...coverage, coverageThrough: create.reportDate }, 'reviewer', 'partner', subsequent);
    const annotation = await approve('M08-F07', { evidence, anchorKind: 'cell', anchor: 'Assets!C15', mark: 'tick', comment: 'Agreed to ledger' }, 'preparer', 'reviewer');
    await action('partner', 'M08-F07', annotation, 'reply', { reason: 'Reviewed source cell' });
    assert.equal(find(annotation).discussion[0].by, 'partner');
    await checkPaper('3.1.2', 'preparer', 'reviewer');
    await write('partner', 'statements', { statements: 'Synthetic statements', disclosures: 'Synthetic disclosures', lines: 'PPE,120' });
    const finalValues = { line: 'PPE', expected: '110', actual: '120', threshold: '5', risk, paper: '3.1.2', investigation: 'Supported by additions', conclusion: 'Explained variance' };
    const finalAnalytics = await approve('M10-F06', finalValues);
    const sufficiency = await approve('M10-F08', { analytics: finalAnalytics, limitations: 'None', contradictions: 'Resolved', findings: 'Governance item retained', result: 'sufficient', basis: 'Current reviewed sources' });
    const opinion = await approve('M10-F09', { sufficiency, opinion: 'qualified', basisType: 'misstatement', assessment: 'Recorded human evaluation', basis: 'Synthetic qualified basis' });
    const section = { opinion, type: 'other', wording: 'Synthetic <additional> wording', basis: 'Applicable scenario' };
    const additional = await save('reviewer', 'M10-F11', { ...section, template: '4.1.A1' });
    await action('reviewer', 'M10-F11', additional, 'submit', {}, 409);
    await approve('M10-F11', { ...section, template: '4.1.A2' }, 'reviewer', 'partner', additional);
    await approve('M10-F12', { requested: '2026-03-01', due: '2026-03-31', result: 'received', signed: '2026-03-15', evidence, assessment: 'Synthetic signed record reviewed' });
    await approve('M10-F13', { paper: '3.1.2', journal, recipient: 'Board', message: 'Approval exception', response: 'Acknowledged', delivery: evidence });
    await checkPaper('4.4', 'reviewer', 'partner');
    assert.ok(current.papers.some(p => p.form === '4.1.A2'));
    assert.ok(!current.papers.some(p => p.form === '4.1.A1'));
    await checkPaper('4.1.A2', 'reviewer', 'partner');
    assert.deepEqual(current.gaps, []);
    const original = await service.fetch('/report', cookies.partner);
    assert.equal(original.status, 200);
    assert.match(original.headers.get('content-disposition'), /4\.1\.A2/);
    const originalHtml = await original.text();
    assert.match(originalHtml, /Synthetic qualified basis/);
    assert.match(originalHtml, /Synthetic &lt;additional&gt; wording/);
    assert.match(originalHtml, /Synthetic statements/);
    await write('partner', 'authorize', {});
    assert.equal(current.authorized.current, true);
    assert.equal(current.authorized.artifactSha256, createHash('sha256').update(originalHtml).digest('hex'));
    await write('reviewer', 'report-date', { date: '2026-04-02' }, 403);
    await write('partner', 'report-date', { date: '2026-04-02' });
    assert.equal(current.authorized.current, false);
    assert.ok(current.gaps.some(gap => gap.startsWith('3.2.1')));
    await write('partner', 'issue', { reference: 'Stale authorization' }, 409);
    await approve('M07-F10', { ...coverage, coverageThrough: '2026-04-02' }, 'reviewer', 'partner', subsequent);
    await checkPaper('4.1.A2', 'reviewer', 'partner');
    assert.deepEqual(current.gaps, []);
    await write('partner', 'authorize', {});
    const authorizedHash = current.authorized.artifactSha256;
    const approvedReport = await service.fetch('/report', cookies.partner);
    const approvedHtml = await approvedReport.text();
    assert.equal(createHash('sha256').update(approvedHtml).digest('hex'), authorizedHash);
    assert.notEqual(approvedHtml, originalHtml);
    await write('partner', 'issue', { reference: 'Synthetic issued package record' });
    await write('partner', 'archive-seal', {});
    const archive = current.archive.packages[0].id;
    for (const role of ['preparer','reviewer']) {
      const ungranted = await (await service.fetch('', cookies[role])).json();
      assert.equal(ungranted.archive.packages[0].summary.files, undefined);
      assert.equal(ungranted.archive.packages[0].digest, undefined);
      assert.deepEqual(ungranted.evidence, []);
      assert.deepEqual(ungranted.papers, []);
      assert.doesNotMatch(JSON.stringify(ungranted), /support\.xlsx|registry\.csv/);
      assert.equal((await service.fetch('/report', cookies[role])).status, 404);
    }
    await write('reviewer', 'save', { form: '4.4', execution: 'Attempt change', conclusion: 'Blocked' }, 409);
    const retrieval = await approve('M12-F07', { package: archive, accessor: 'preparer', reason: 'Verify archived work', until: '2099-01-01' });
    const exported = await (await service.fetch('/archive-export/' + retrieval, cookies.preparer, {})).json();
    assert.equal(exported.scope, 'full');
    assert.ok(exported.content.evidence.some(e => e.id === evidence));
    assert.equal(exported.content.authorization.artifact.html, approvedHtml);
    assert.equal(exported.content.issue.reportSha256, authorizedHash);
    assert.ok(exported.content.authorization.templates.some(t => t.contract.id === '3.1.2' && t.hash === find(programme).template.digest));
    assert.equal((await service.fetch('/archive-export/' + retrieval, cookies.reviewer, {})).status, 403);
    assert.equal((await service.fetch('/evidence/' + evidence, cookies.reviewer)).status, 403);
    const inspection = await approve('M12-F10', { package: archive, accessor: 'reviewer', scope: 'report', until: '2099-01-01', reason: 'Review report only' });
    const scoped = await (await service.fetch('/archive-export/' + inspection, cookies.reviewer, {})).json();
    assert.deepEqual(Object.keys(scoped.content).sort(), ['issue','report']);
    assert.equal(scoped.content.report.html, approvedHtml);
    assert.doesNotMatch(JSON.stringify(scoped), /support\.xlsx|registry\.csv/);
    const reportOnly = await (await service.fetch('', cookies.reviewer)).json();
    assert.equal(reportOnly.archive.packages[0].summary.files, undefined);
    assert.equal((await service.fetch('/evidence/' + evidence, cookies.reviewer)).status, 403);
    await action('reviewer', 'M12-F10', inspection, 'revoke', { reason: 'Only partner revokes' }, 403);
    await action('partner', 'M12-F10', inspection, 'revoke', { reason: 'Inspection finished' });
    assert.equal(find(inspection).revoked.by, 'partner');
    assert.equal((await service.fetch('/archive-export/' + inspection, cookies.reviewer, {})).status, 403);
    const expired = await approve('M12-F07', { package: archive, accessor: 'reviewer', reason: 'Historical grant', until: '2020-01-01' });
    assert.equal((await service.fetch('/archive-export/' + expired, cookies.reviewer, {})).status, 403);
    const restore = await approve('M12-F09', { package: archive, type: 'restore', basis: 'Restore into scratch SQLite table' });
    assert.equal(find(restore).verification.ok, true);
    assert.equal(find(restore).verification.files, 2);
    const amendment = await approve('M12-F04', { package: archive, type: 'administrative', changes: 'Correct archive index label', basis: 'Content unchanged' });
    assert.equal(current.archive.packages.find(p => p.id === find(amendment).successor).previous, archive);
    const policy = await approve('M12-F08', { package: archive, type: 'policy', reference: 'Synthetic historical policy', anchor: '2000-01-01', years: '1', basis: 'Disposable test copy' });
    const hold = await approve('M12-F08', { package: archive, type: 'hold', reference: 'Synthetic hold', basis: 'Pending inspection' });
    const disposal = await save('reviewer', 'M12-F11', { package: archive, policy, basis: 'Eligible synthetic copy' });
    assert.match((await action('reviewer', 'M12-F11', disposal, 'submit', {}, 409)).error, /хориг/);
    await approve('M12-F08', { package: archive, type: 'release', reference: hold, basis: 'Inspection complete' });
    await action('reviewer', 'M12-F11', disposal, 'submit');
    await action('partner', 'M12-F11', disposal, 'approve', { reason: 'Synthetic copy and policy checked' });
    const successor = find(amendment).successor;
    const lateHold = await approve('M12-F08', { package: successor, type: 'hold', reference: 'Late hold', basis: 'New inspection' });
    await write('partner', 'archive-dispose', { id: disposal }, 409);
    await approve('M12-F08', { package: successor, type: 'release', reference: lateHold, basis: 'Inspection ended' });
    await write('partner', 'archive-dispose', { id: disposal });
    assert.equal(current.archive.packages.find(p => p.id === archive).disposed, 1);
    assert.equal((await service.fetch('/archive-export/' + retrieval, cookies.preparer, {})).status, 409);
    assert.equal((await service.fetch('/evidence/' + evidence, cookies.reviewer)).status, 403);
    await approve('M12-F04', { package: successor, type: 'substantive', changes: 'Correct final line', basis: 'New financial statement figures' });
    assert.equal(current.archive.reopened.package, successor);
    assert.equal((await service.fetch('/evidence/' + evidence, cookies.reviewer)).status, 200);
    await write('partner', 'statements', { statements: 'Synthetic statements', disclosures: 'Synthetic disclosures', lines: 'PPE,130' });
    assert.equal(current.authorized.current, false);
    assert.ok([finalAnalytics, sufficiency, opinion].every(id => find(id).stale));
    await write('partner', 'authorize', {}, 409);
    assert.deepEqual([...new Set(current.registers.map(r => r.kind))].sort(), registers.map(r => r.id).sort());
    assert.ok(registers.every(r => current.registers.some(row => row.kind === r.id && row.status === 'approved')));

    // Versioned planning after the archived first release. The excluded file stays out.
    const materiality = {benchmark:'1000',percentage:'2',performance:'60',trivial:'5',benchmarkSource:'Reviewed draft trial balance'};
    await write('preparer','save',{form:'1.3',execution:'Compared candidate benchmarks',conclusion:'Selected current draft balances',
      ...materiality,performance:'100'});
    await write('preparer','submit',{form:'1.3'},409);
    await checkPaper('1.3','preparer','reviewer',materiality);
    await checkPaper('2.6','preparer','reviewer',{reliance:'partial',relianceEvidence:registryFile});
    const stockRule = await approve('M02-F05',{programme:'3.1.4',profile:'all',outcome:'optional',override:'no',basis:'Inventory in scope'});
    const stockRisk = await approve('M06-F09',{...riskValues,risk:'Stock counts',target:'Inventory',response:'Observe count and reconcile',programme:'3.1.4'});
    const scope = {templateVersion:'source',nature:'Test the balance',timing:'At the end of the period',extent:'Cover the documented stratum'};
    const assetsPlan = {rule,risk,decision:'adopt',basis:'Use the tested controls and corroborate',approach:'reliance',procedure:'r15',...scope};
    const stockPlan = {rule:stockRule,risk:stockRisk,decision:'adopt',basis:'Substantive response',approach:'substantive',procedure:'r11',...scope,templateVersion:'1'};
    await save('reviewer','M07-F01',{...assetsPlan,procedure:'not-in-template'},programme);
    await action('reviewer','M07-F01',programme,'submit',{},409);
    await save('reviewer','M07-F01',assetsPlan,programme);
    await action('reviewer','M07-F01',programme,'submit');
    await checkPaper('2.6','preparer','reviewer',{reliance:'full',relianceEvidence:registryFile});
    await action('partner','M07-F01',programme,'approve',{reason:'Stale control basis'},409);
    await action('partner','M07-F01',programme,'return',{reason:'Update to the reviewed reliance version'});
    await action('reviewer','M07-F01',programme,'submit');
    await action('partner','M07-F01',programme,'approve',{reason:'Latest basis reviewed'});
    const stock = await approve('M07-F01',stockPlan);
    const paper = form => current.papers.find(p=>p.form===form);
    assert.equal(paper('3.1.2').planning.basis.risk.target,'PPE');
    assert.equal(paper('3.1.2').planning.basis.procedure.key,'r15');
    assert.equal(paper('3.1.2').planning.basis.materiality.performance,12);
    assert.equal(paper('3.1.2').planning.basis.reliance.evidence,registryFile);
    assert.equal(paper('3.1.2').template.digest,find(programme).template.digest);
    assert.equal(paper('3.1.4').planning.basis.reliance,undefined);
    assert.equal(paper('3.1.4').template.digest,publishedStock.digest);
    assert.equal(paper('3.1.4').title,stockTemplate.title);
    assert.equal(paper('3.1.3'),undefined);
    await write('reviewer','form-use',{form:'3.1.2',version:'source'},409);
    await write('preparer','request',{form:'3.1.3',title:'Excluded work',due:'2026-03-30'},409);
    const stockRequest = (await write('preparer','request',{form:'3.1.4',title:'Stock',due:'2026-03-30'})).requests[0].id;
    await write('preparer','upload',{request:stockRequest,name:'stock.csv',source:'Synthetic stock sheet',base64:'c3RvY2s='});
    await write('preparer','accept',{request:stockRequest});
    const perform = async (form,key) => {
      const {digest,body} = paper(form).template;
      const outcome = body.fields.find(f=>f.key===key).options[0];
      const fields = {form,templateDigest:digest,execution:'Performed the response',conclusion:'Documented outcome'};
      await write('preparer','save',{...fields,answers:JSON.stringify({r10:'An unrelated procedure'})});
      await write('preparer','submit',{form},409);
      const unresolved = body.fields.find(f=>f.key===key).options.find(v=>v.includes('(UNABLE_TO_COMPLETE)'));
      await write('preparer','save',{...fields,answers:JSON.stringify({[key]:'Attempted the mapped procedure',
        [key+'.outcome']:unresolved,[key+'.result']:'Awaiting further evidence'})});
      await write('preparer','submit',{form},409);
      await write('preparer','save',{...fields,answers:JSON.stringify({[key]:'Performed the mapped procedure',
        [key+'.outcome']:outcome,[key+'.result']:'Agreed with source evidence'})});
      await write('preparer','submit',{form});
      await write('reviewer','review',{form});
    };
    await perform('3.1.2','r15');
    await perform('3.1.4','r11');
    const stockVersion = paper('3.1.4').version;
    const assetsVersion = paper('3.1.2').version;
    await checkPaper('2.6','preparer','reviewer',{reliance:'partial',relianceEvidence:registryFile});
    assert.deepEqual(current.impacts.find(i=>i.source==='2.6').targets,['3.1.2']);
    assert.equal(paper('3.1.2').status,'changed');
    assert.equal(paper('3.1.2').pendingPlanning,true);
    assert.ok(paper('3.1.2').history.some(h=>h.version===assetsVersion&&h.by==='temuulen'));
    assert.equal(paper('3.1.4').reviewedVersion,stockVersion);
    assert.equal(paper('3.1.4').status,'reviewed');
    assert.equal(find(stock).stale,false);
    assert.equal(find(blocked).stale,false);
    await write('preparer','submit',{form:'3.1.2'},409);
    await approve('M07-F01',assetsPlan,'reviewer','partner',programme);
    await write('preparer','submit',{form:'3.1.2'});
    await write('reviewer','review',{form:'3.1.2'});
    await checkPaper('1.3','preparer','reviewer',{...materiality,percentage:'1'});
    assert.ok(['3.1.2','3.1.4'].every(form=>paper(form).status==='changed'&&paper(form).pendingPlanning));
    assert.equal(find(blocked).stale,false);
    assert.ok(find(programme).history.some(h=>h.status==='approved'&&h.programmeBasis?.materiality.overall===20));
    await service.close();
    service = null;
    service = await start(database);
    const reloaded = await signIn('partner');
    assert.equal(reloaded.archive.packages.find(p => p.id === archive).disposed, 1);
    assert.equal(reloaded.registers.find(r => r.id === opinion).values.opinion, 'qualified');
    assert.equal(reloaded.registers.find(r => r.id === restore).verification.restored, true);
    assert.ok(reloaded.papers.find(p=>p.form==='3.1.4').pendingPlanning);
  } finally {
    if (service) await service.close();
    for (const suffix of ['', '-shm', '-wal']) await rm(database + suffix, { force: true });
    await rmdir(dir);
  }
});
// Wave 3 reference handoff across data, evidence and sampled work.
test('approved data feeds the same scoped analytics, multipart confirmation and sampled source rows', async () => {
  const dir=await mkdtemp(join(tmpdir(),'audit-population-'));
  const database=join(dir,'pilot.sqlite');
  let service;
  try {
    service=await start(database);
    const {cookies,scoped,view,write}=await fixture(service);
    const a=(await write('reviewer','firm','create',create)).selected;
    const run=(role,action,fields,status=200)=>write(role,a,action,fields,status);
    await run('partner','activate',{independence:'Reviewed',letter:'Agreed',assessment:'Accepted'});
    const header='id,account,amount,entity,date,currency,journal,entry_type';
    const line=(id,amount,date='2025-04-15',entity=create.registration,currency='MNT')=>
      [id,'1500',amount,entity,date,currency,id==='zero'||id==='add'?'J-add':'J-'+id,id==='add'?'manual':'system'].join(',');
    const first=[header,line('zero','0'),line('add','125.50'),line('add','125.50'),line('bad','12oops'),
      line('outside','10','2025-04-15','OTHER'),line('','20'),line('old','30','2024-12-31'),
      line('date','40','11/11/25'),line('fx','50','2025-04-15',create.registration,'USD')].join('\n');
    const upload=contents=>({name:'ledger.csv',currency:'MNT',source:'Signed management export',base64:Buffer.from(contents).toString('base64')});
    let state=await run('preparer','population-import',upload(first));
    const raw=state.population.current;
    assert.deepEqual(raw.counts,{read:9,accepted:1,excluded:0,quarantined:8,invalidAmounts:1});
    assert.equal(raw.rows.find(r=>r.id==='zero').cents,0);
    assert.equal(raw.rows.find(r=>r.id==='bad').cents,null);
    assert.equal(raw.readTotals.USD,5000);
    for (const [id,issue] of [['add','duplicate'],['outside','entity'],['','key'],['old','period'],['date','date'],['fx','currency']]) {
      assert.ok(raw.rows.find(r=>r.id===id).issues.includes(issue),id+' '+issue);
    }
    assert.equal(await (await service.fetch(scoped('/evidence/'+raw.evidence,a),cookies.reviewer)).text(),first);
    await run('reviewer','population-approve',{version:'1',reason:'Unresolved quarantine'},409);
    state=await run('preparer','support-upload',{name:'control.csv',source:'Independent report',
      base64:Buffer.from('count,total\n2,125.50').toString('base64')});
    const controlEvidence=state.evidence.find(e=>e.name==='control.csv').id;
    await run('reviewer','support-assess',{id:controlEvidence,result:'accepted',reason:'Verified control report separately'});
    const controls={count:'2',total:'125.50',source:'Independently produced signed control report',mapping:'1500,PPE',
      controlEvidence,statements:'PPE,125.50',exclusions:[4,5,6,7,8,9,10].map(r=>r+',Documented outside approved scope').join('\n'),use:'PPE analysis and sample'};
    await run('preparer','population-reconcile',{...controls,version:'1',controlEvidence:raw.evidence},409);
    state=await run('preparer','population-reconcile',{...controls,version:'1',total:'0',mapping:'1500,PPE\n1500,OTHER'});
    assert.ok(state.population.current.gaps.some(g=>g.includes('1500')));
    assert.equal(state.population.current.counts.accepted,2);
    await run('reviewer','population-approve',{version:'2',reason:'Mismatched control'},409);
    state=await run('preparer','population-reconcile',{...controls,version:'2'});
    assert.deepEqual(state.population.current.gaps,[]);
    assert.deepEqual(state.population.current.bridge,[{line:'PPE',accounts:['1500'],computed:12550,reported:12550,difference:0}]);
    await run('preparer','population-approve',{version:'3',reason:'Own version'},403);
    await run('reviewer','population-approve',{version:'3',reason:'Reviewed independent totals and row exclusions'});
    const reg=(role,operation,fields)=>run(role,'register',{kind:'M06-F06',operation,...fields});
    state=await reg('preparer','save',Object.fromEntries(Object.entries({
      area:'PPE',populationLine:'PPE',expected:'120',actual:'999999',threshold:'10',source:'forged source',scope:'Assess the additions',
    }).map(([key,value])=>['field.'+key,value])));
    const analytic=state.registers.find(r=>r.kind==='M06-F06');
    assert.equal(analytic.values.actual,'125.5');
    assert.equal(analytic.populationBasis.version,3);
    await reg('preparer','submit',{id:analytic.id});
    await reg('reviewer','approve',{id:analytic.id,reason:'Independent comparison'});

    for (const [form,fields] of [['1.3',{benchmark:'1000',percentage:'2',performance:'60',trivial:'5',benchmarkSource:'Management control report'}],['2.6',{reliance:'none'}]]) {
      await run('preparer','save',{form,execution:'Current planning',conclusion:'Reviewed plan',...fields});
      await run('preparer','submit',{form});
      await run('reviewer','review',{form});
    }
    const form='3.1.2', requestInfo={title:'Supporting source set',form,due:'2026-03-30',parts:'Schedule A\nSchedule B\nExternal confirmation'};
    state=await run('preparer','request-draft',requestInfo);
    const request=state.requests[0].id,[p1,p2,p3]=state.requests[0].parts.map(p=>p.id);
    assert.equal(state.requests[0].dispatch,'draft');
    await run('reviewer','confirmation-start',{request,part:p3},409);
    await run('reviewer','request-issue',{request});
    const file=(name,body)=>({name,base64:Buffer.from(body).toString('base64')});
    state=await run('preparer','upload',{request,parts:[p1,p2].join(','),source:'Finance package',...file('schedules.csv','Schedule A and B')});
    const shared=state.requests[0].parts[0].evidence;
    assert.equal(state.requests[0].parts[1].evidence,shared);
    await run('preparer','accept',{request,part:p1});
    state=await run('preparer','accept',{request,part:p2});
    assert.equal(state.requests[0].status,'partial');
    assert.equal(state.requests[0].parts[2].state,'missing');
    await run('preparer','confirmation-start',{request,part:p3},403);
    state=await run('reviewer','confirmation-start',{request,part:p3});
    const expired='/confirmation/'+state.confirmationLink.token;
    state=await run('reviewer','confirmation-start',{request,part:p3});
    const link='/confirmation/'+state.confirmationLink.token;
    assert.equal((await service.fetch(expired)).status,404);
    const invite=await (await service.fetch(link)).json();
    assert.deepEqual([invite.request,invite.part,invite.recipient],[request,'External confirmation',create.email]);
    assert.equal((await service.fetch(link,'',{...file('confirmation.csv','Acknowledged'),response:'Third-party balance agrees'},'https://bad.test')).status,403);
    const reply={...file('confirmation.csv','Acknowledged'),response:'Third-party balance agrees'};
    assert.equal((await service.fetch(link,'',reply)).status,201);
    assert.equal((await service.fetch(link,'',reply)).status,404);
    state=await view('reviewer',a);
    const received=state.confirmations.find(c=>c.state==='received');
    assert.equal(received.response,reply.response);
    assert.equal(received.request,request);
    const confirmation=received.evidence;
    assert.equal(state.requests[0].parts[2].state,'received');
    state=await run('preparer','accept',{request,part:p3});
    assert.equal(state.requests[0].status,'complete');

    const filters={form,threshold:'100',days:'7'};
    state=await run('preparer','journal-run',filters);
    const journals=state.journals[form], journalRef={form,version:String(journals.version)};
    assert.deepEqual(journals.cases.map(c=>[c.id,c.criteria,c.postings.map(r=>r.row)]),[['J-add',['amount','manual'],[2,3]]]);
    assert.equal((await run('preparer','journal-run',filters)).journals[form].stamp,journals.stamp);
    assert.equal((await run('preparer','journal-run',filters)).journals[form].version,journals.version);
    await run('reviewer','journal-review',{...journalRef,reason:'Unexplained selected journal'},409);
    await run('preparer','journal-run',{...filters,threshold:'999'},409);
    const investigation={...journalRef,entry:'J-add',purpose:'Asset addition',authority:'Signed authorization',
      accounting:'Checked both postings to the register',amount:'0',evidence:shared};
    await run('preparer','journal-investigate',{...investigation,result:'incomplete'});
    await run('reviewer','journal-review',{...journalRef,reason:'Still incomplete'},409);
    await run('preparer','journal-investigate',{...investigation,result:'explained'});
    await run('preparer','journal-review',{...journalRef,reason:'Own investigation'},403);
    await run('reviewer','journal-review',{...journalRef,reason:'Verified exact posting set and authorization'});

    const design={form,line:'PPE',size:'2',seed:'42',purpose:'Inspect both approved source rows'};
    state=await run('preparer','sample-design',design);
    const identity={form,version:String(state.samples[form].version)};
    await run('preparer','sample-select',identity,409);
    await run('preparer','sample-approve',{...identity,reason:'Own design'},403);
    await run('reviewer','sample-approve',{...identity,reason:'Reviewed exact inputs'});
    state=await run('reviewer','sample-select',identity);
    const selected=state.samples[form].selected;
    assert.deepEqual(selected.map(r=>[r.id,r.row,r.cents]).sort(),[['add',3,12550],['zero',2,0]]);
    assert.deepEqual((await run('preparer','sample-select',identity)).samples[form].selected,selected);
    await run('preparer','save',{form,execution:'Inspected confirmations and schedules',conclusion:'Exception reported'});
    await run('preparer','sample-test',{...identity,unit:'zero',result:'pass',amount:'0',evidence:shared,detail:'Zero agreed'});
    await run('preparer','submit',{form},409);
    await run('preparer','sample-test',{...identity,unit:'add',result:'exception',amount:'0',evidence:confirmation,detail:'Approval missing'});
    await run('preparer','submit',{form});
    state=await run('reviewer','review',{form});
    assert.equal(state.papers.find(p=>p.form===form).status,'reviewed');
    assert.equal(state.fieldFindings[0].sampleId,'add');
    const signed=state.papers.find(p=>p.form===form).version;
    state=await run('reviewer','request-reopen',{request,part:p3,reason:'Replace the confirmation'});
    assert.equal(state.papers.find(p=>p.form===form).status,'changed');
    assert.ok(state.papers.find(p=>p.form===form).history.some(h=>h.version===signed&&h.evidence.includes(confirmation)));
    assert.equal(state.evidence.find(e=>e.id===confirmation).current,false);
    assert.equal(await (await service.fetch(scoped('/evidence/'+confirmation,a),cookies.reviewer)).text(),'Acknowledged');
    await run('preparer','upload',{request,part:p3,source:'Updated confirmation',...file('corrected.csv','Replacement')});
    state=await run('preparer','accept',{request,part:p3});
    const replacement=state.requests[0].parts[2].evidence;
    assert.equal(state.evidence.find(e=>e.id===replacement).replaces,confirmation);
    await run('preparer','sample-test',{...identity,unit:'add',result:'exception',amount:'0',evidence:replacement,detail:'Approval missing in replacement'});
    await run('preparer','submit',{form});
    state=await run('reviewer','review',{form});
    state=await run('partner','sample-resolve-finding',{id:state.fieldFindings[0].id,reason:'Escalated approval control issue'});
    await run('reviewer','resolve-impact',{id:state.impacts.find(i=>i.source==='1.3').id,reason:'Selected under the current materiality version'});
    await run('partner','statements',{statements:'Reviewed synthetic statements',disclosures:'Reviewed synthetic disclosures'});
    for (const form of ['4.4','4.1.A1']) {
      await run('reviewer','save',{form,execution:'Completed the review',conclusion:'Reviewed current evidence'});
      await run('reviewer','submit',{form});
      await run('partner','review',{form});
    }
    state=await run('partner','authorize',{});
    assert.equal(state.authorized.current,true);
    const [signedBundle]=await (await service.fetch(scoped('/authorizations',a),cookies.partner)).json();
    assert.equal(signedBundle.authorization.population.version,3);
    assert.equal(signedBundle.authorization.samples[form].selected.length,2);
    assert.equal(signedBundle.authorization.journals[form].cases[0].id,'J-add');
    assert.equal(signedBundle.authorization.confirmations[0].evidence,confirmation);
    assert.ok(signedBundle.evidence.some(e=>e.id===confirmation));
    const priorAnalytics=state.registers.find(r=>r.id===analytic.id).version;
    state=await run('preparer','population-import',upload([header,line('zero','0'),line('add','130')].join('\n')));
    assert.equal(state.samples[form].current,false);
    assert.equal(state.journals[form].current,false);
    assert.equal(state.papers.find(p=>p.form===form).status,'changed');
    assert.equal(state.registers.find(r=>r.id===analytic.id).stale,true);
    assert.equal(state.registers.find(r=>r.id===analytic.id).version,priorAnalytics);
    assert.equal(state.authorized.current,false);
    assert.ok(state.population.history.some(v=>v.version===3&&v.approval));
    await service.close();
    service=await start(database);
    const {view:reloaded}=await fixture(service,false);
    state=await reloaded('reviewer',a);
    assert.equal(state.samples[form].basis.population,3);
    assert.equal(state.samples[form].current,false);
    assert.deepEqual(state.samples[form].selected,selected);
    assert.equal(state.fieldFindings[0].resolution,'Escalated approval control issue');
  } finally {
    if(service)await service.close();
    for(const suffix of ['', '-shm', '-wal'])await rm(database+suffix,{force:true});
    await rmdir(dir);
  }
});
