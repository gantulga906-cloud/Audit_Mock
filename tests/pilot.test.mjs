import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID, scryptSync } from 'node:crypto';
import { mkdtemp, rm, rmdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createPilot } from '../scripts/pilot-server.mjs';
import { recordLifecycleEvidence } from '../scripts/pilot-lifecycle-evidence.mjs';
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
    const responseSubmission=await write(preparer, 'submit', work);
    await write(reviewer, 'review', work, 409);
    await write(reviewer, 'clear', { form: work.form, note, version:String(responseSubmission.papers[0].version),
      responseVersion:'1',reason:'Matched the revised amount and retained supporting evidence' });
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
  const database = join(dir, 'test.sqlite'), restored = join(dir, 'restored.sqlite');
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
    await write('partner', 'statements', { statements: 'Attempt locked change', disclosures: 'Blocked' }, 409);
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
    const policy = await approve('M12-F08', { package: archive, type: 'policy', reference: 'Synthetic historical policy', anchor: '2000-01-01', years: '1', basis: 'Disposable test copy' });
    const hold = await approve('M12-F08', { package: archive, type: 'hold', reference: 'Synthetic hold', basis: 'Pending inspection' });
    const amendment = await approve('M12-F04', { package: archive, type: 'administrative', changes: 'Correct archive index label', basis: 'Content unchanged' });
    const successor = find(amendment).successor;
    const successorIndex = current.archive.packages.find(p => p.id === successor);
    assert.equal(successorIndex.previous, archive);
    assert.equal(successorIndex.holds, 1);
    assert.deepEqual(successorIndex.retention, { policy, package: archive, expires: '2001-01-01' });
    const successorGrant = await approve('M12-F07', { package: successor, accessor: 'preparer', reason: 'Verify the successor independently', until: '2099-01-01' });
    const oldExport = await (await service.fetch('/archive-export/' + retrieval, cookies.preparer, {})).json();
    const amendedExport = await (await service.fetch('/archive-export/' + successorGrant, cookies.preparer, {})).json();
    const { changes, ...unchanged } = amendedExport.content;
    assert.equal(oldExport.digest, exported.digest);
    assert.deepEqual(oldExport.content, exported.content);
    assert.deepEqual(unchanged, exported.content);
    assert.notEqual(amendedExport.digest, oldExport.digest);
    const { at: changedAt, ...change } = changes;
    assert.deepEqual(change, { package: archive, id: amendment, type: 'administrative',
      changes: 'Correct archive index label', basis: 'Content unchanged', approvedBy: 'partner' });
    assert.ok(Number.isFinite(Date.parse(changedAt)));
    const index = (await (await service.fetch('', cookies.partner)).json()).archive.packages;
    for (const [id, reason] of [[archive, 'Verify archived work'], [successor, 'Verify the successor independently']]) {
      const last = index.find(p => p.id === id).access[0];
      assert.equal(last.actor, 'preparer');
      assert.equal(last.scope, 'full');
      assert.equal(last.reason, reason);
      assert.ok(Number.isFinite(Date.parse(last.at)));
    }
    const disposal = await save('reviewer', 'M12-F11', { package: archive, policy, basis: 'Eligible synthetic copy' });
    assert.match((await action('reviewer', 'M12-F11', disposal, 'submit', {}, 409)).error, /хориг/);
    await approve('M12-F08', { package: archive, type: 'release', reference: hold, basis: 'Inspection complete' });
    await action('reviewer', 'M12-F11', disposal, 'submit');
    await action('partner', 'M12-F11', disposal, 'approve', { reason: 'Synthetic copy and policy checked' });
    assert.equal(find(disposal).executedAt, undefined);
    assert.equal(current.archive.packages.find(p => p.id === archive).disposed, 0);
    const lateHold = await approve('M12-F08', { package: successor, type: 'hold', reference: 'Late hold', basis: 'New inspection' });
    await write('partner', 'archive-dispose', { id: disposal }, 409);
    await approve('M12-F08', { package: successor, type: 'release', reference: lateHold, basis: 'Inspection ended' });
    await write('partner', 'archive-dispose', { id: disposal });
    assert.equal(current.archive.packages.find(p => p.id === archive).disposed, 1);
    assert.equal((await service.fetch('/archive-export/' + retrieval, cookies.preparer, {})).status, 409);
    assert.equal((await service.fetch('/evidence/' + evidence, cookies.reviewer)).status, 403);
    const longer = await approve('M12-F08', { package: successor, type: 'policy', reference: 'Synthetic longer authority',
      anchor: '2024-02-29', years: '76', basis: 'Retain this report and its successors' });
    const secondAmendment = await approve('M12-F04', { package: successor, type: 'administrative', changes: 'Add index description', basis: 'Content unchanged' });
    const descendant = find(secondAmendment).successor;
    const shorter = await approve('M12-F08', { package: descendant, type: 'policy', reference: 'Synthetic local schedule',
      anchor: '2000-01-01', years: '1', basis: 'Other authority has longer retention' });
    assert.deepEqual(current.archive.packages.find(p => p.id === descendant).retention,
      { policy: longer, package: successor, expires: '2100-02-28' });
    const earlyDisposal = await save('reviewer', 'M12-F11', { package: descendant, policy: shorter, basis: 'Shorter schedule elapsed' });
    assert.match((await action('reviewer', 'M12-F11', earlyDisposal, 'submit', {}, 409)).error, /2100-02-28/);
    await write('partner', 'archive-dispose', { id: earlyDisposal }, 409);
    await approve('M12-F04', { package: descendant, type: 'substantive', changes: 'Correct final line', basis: 'New financial statement figures' });
    assert.equal(current.archive.reopened.package, descendant);
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
    const { backup } = await import('node:sqlite');
    const source = new DatabaseSync(database, { readOnly: true });
    try { await backup(source, restored); } finally { source.close(); }
    await service.close();
    service = null;
    service = await start(restored);
    const reloaded = await signIn('partner');
    assert.equal(reloaded.archive.packages.find(p => p.id === archive).disposed, 1);
    assert.deepEqual(reloaded.archive.packages.find(p => p.id === descendant).retention,
      { policy: longer, package: successor, expires: '2100-02-28' });
    assert.equal(reloaded.registers.find(r => r.id === opinion).values.opinion, 'qualified');
    assert.equal(reloaded.registers.find(r => r.id === restore).verification.restored, true);
    assert.ok(reloaded.papers.find(p=>p.form==='3.1.4').pendingPlanning);
    await signIn('preparer');
    const restoredResponse = await service.fetch('/archive-export/' + successorGrant, cookies.preparer, {});
    assert.equal(restoredResponse.status, 200);
    const restoredExport = await restoredResponse.json();
    assert.equal(restoredExport.id, successor);
    assert.equal(restoredExport.digest, amendedExport.digest);
    assert.deepEqual(restoredExport.content, amendedExport.content);
    assert.equal((await service.fetch('/archive-export/' + retrieval, cookies.preparer, {})).status, 409);
  } finally {
    if (service) await service.close();
    for (const file of [database, restored]) for (const suffix of ['', '-shm', '-wal']) await rm(file + suffix, { force: true });
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
test('commercial fieldwork reconciles revenue, receipts, purchases and bank evidence with independent case review', async () => {
  const dir=await mkdtemp(join(tmpdir(),'audit-commercial-'));
  const database=join(dir,'pilot.sqlite');
  let service;
  try {
    service=await start(database);
    const {cookies,scoped,view,write}=await fixture(service);
    const programForms=['3.1.16','3.1.5','3.1.10','3.1.8','3.1.4','3.1.2'];
    const register=async (id,kind,values) => {
      const fields=Object.fromEntries(Object.entries(values).map(([key,value])=>['field.'+key,value]));
      const draft=await write('reviewer',id,'register',{kind,operation:'save',...fields});
      const row=draft.registers.findLast(row=>row.kind===kind);
      await write('reviewer',id,'register',{kind,id:row.id,operation:'submit'});
      await write('partner',id,'register',{kind,id:row.id,operation:'approve',reason:'Independently reviewed'});
      return row.id;
    };
    const rules={};
    for (const programme of programForms) rules[programme]=await register('firm','M02-F05',{programme,profile:'all',
      outcome:'optional',override:'no',basis:'Commercial reference scenario'});
    const engagement=(await write('reviewer','firm','create',create)).selected;
    const run=(role,action,fields,status=200)=>write(role,engagement,action,fields,status);
    await run('partner','activate',{assessment:'Accepted',independence:'Independent',letter:'Agreed'});
    for (const programme of programForms) {
      const risk=await register(engagement,'M06-F09',{programme,risk:'Testing '+programme,type:'account',target:programme,
        assertion:'Accuracy and cut-off',response:'Reconcile source documents and investigate the exceptions'});
      await register(engagement,'M07-F01',{rule:rules[programme],risk,decision:'adopt',basis:'Procedure in scope'});
    }
    const file=(name,contents)=>({name,base64:Buffer.from(contents).toString('base64')});
    const evidence=async (name,contents)=>{
      const loaded=await run('preparer','support-upload',{...file(name+'.csv',contents),source:'Synthetic independently retained '+name});
      const id=loaded.evidence.find(e=>e.name===name+'.csv').id;
      await run('reviewer','support-assess',{id,result:'accepted',reason:'Verified source and coverage'});
      return id;
    };
    const proof=await evidence('control','Independent control report\n10 rows,673 net');
    const posting=(id,account,amount,reference)=>[id,account,amount,create.registration,'2025-12-30','MNT',reference].join(',');
    const ledger=['id,account,amount,entity,date,currency,reference',
      posting('G1','4100',-100,'I1'),posting('G2','4100',-200,'I2'),posting('G3','4100',-12,'UNEXPLAINED'),
      posting('A1','1200',100,'I1'),posting('A2','1200',200,'I2'),posting('P1','2100',-80,'B1'),
      posting('C1','1010',150,'BANK1'),posting('C2','1010',-30,'BANK2'),
      posting('STK','1300',500,'STOCK'),posting('FA','1500',145,'FA1')].join('\n');
    const importFields={...file('approved-ledger.csv',ledger),source:'Year-end signed ledger export',currency:'MNT'};
    await run('preparer','population-import',importFields);
    const data=await run('preparer','population-reconcile',{version:'1',count:'10',total:'673',source:'Signed control report',
      controlEvidence:proof,use:'Fieldwork on source references',mapping:'4100,Sales\n1200,AR\n2100,AP\n1010,Cash\n1300,Inventory\n1500,PPE',
      statements:'Sales,-312\nAR,300\nAP,-80\nCash,120\nInventory,500\nPPE,145'});
    assert.deepEqual(data.population.current.gaps,[]);
    await run('reviewer','population-approve',{version:'2',reason:'Reviewed account mapping and original'});
    const source=(header,rows)=>[header,...rows.map(([id,...fields])=>[id,create.registration,'MNT',...fields].join(','))].join('\n');
    const salesEvidence={
      invoices:await evidence('invoices',source('id,entity,currency,invoice_date,delivery_date,due_date,amount,open_amount,sku,quantity,unit_price,discount',[
        ['I1','2025-12-30','2026-01-02','2026-01-10',100,100,'SKU1',2,50,0],
        ['I2','2025-11-15','2025-11-15','2025-11-20',200,195,'SKU2',1,200,0],
        ['I3','2026-01-02','2025-12-29','2026-02-15',50,0,'SKU1',1,50,0],
      ])+'\nWRONG,OTHER,MNT,2025-12-30,2025-12-30,2026-01-15,75,75,SKU1,1,75,0'),
      credits:await evidence('credits',source('id,entity,currency,invoice,date,amount',[
        ['DUP','I1','2025-12-31',10],['DUP','I1','2025-12-31',12],['POST','I1','2026-01-02',10],['PRE','I2','2025-12-18',5],
      ])),
      cash:await evidence('cash',source('id,entity,currency,invoice,date,amount',[
        ['RC1','I1','2026-01-10',25],['RC2','I2','2026-01-11',220],['RC3','NO-INVOICE','2026-01-11',3],
      ])),
      prices:await evidence('prices',source('sku,entity,currency,unit_price,max_discount,from,to',[
        ['SKU1',45,0,'2025-01-01','2026-12-31'],
      ])),
    };
    const purchaseEvidence={
      receipts:await evidence('receipts',source('id,entity,currency,vendor,date,amount',[
        ['R1','V1','2025-12-01',80],['R2','V2','2025-12-29',50],['R3','V3','2025-12-30',25],
      ])),
      bills:await evidence('bills',source('id,entity,currency,receipt,vendor,date,amount',[
        ['B1','R1','V1','2025-12-02',80],['B2','R2','V2','2026-01-03',50],
      ])),
      payments:await evidence('payments',source('id,entity,currency,invoice,vendor,date,amount',[
        ['PAY1','B1','V1','2025-12-10',40],['PAY2','B1','V1','2025-12-10',40],['PAY3','NO-BILL','V3','2026-01-11',10],
        ['PAY4','B2','V2','2026-01-15',25],
      ])),
    };
    const bankEvidence={
      bank:await evidence('bank',source('id,entity,currency,reference,date,amount',[
        ['ST1','BANK1','2025-12-30',150],['ST2','BANK3','2025-12-30',-10],
      ])),
      reconciliation:await evidence('reconciliation',source('id,entity,currency,kind,reference,date,amount,reason',[
        ['B0','bank_opening','','2025-01-01',1000,'Signed opening'],
        ['B1','bank_closing','','2025-12-31',1140,'Signed closing'],
        ['L0','book_opening','','2025-01-01',1000,'Signed opening'],
        ['L1','book_closing','','2025-12-31',1120,'Signed closing'],
        ['AD','bank_adjustment','BANK2','2025-12-31',-30,'Outstanding cheque'],
      ])),
    };
    const through='2026-03-31', sales={form:'3.1.16',line:'Sales',through,sign:'credit',...salesEvidence};
    let state=await run('preparer','area-run',sales);
    const salesRun=state.areas[sales.form], i1=salesRun.cases.find(item=>item.label==='I1');
    assert.deepEqual(i1.flags.sort(),['credit','cutoff','partial','price']);
    assert.ok(i1.trace.some(t=>t.source==='ledger'&&t.row===2));
    assert.equal(i1.metrics.remaining,7500);
    assert.equal(salesRun.links.find(item=>item.label==='RC2').metrics.allocated,19500);
    assert.ok(salesRun.cases.find(item=>item.label==='DUP').flags.includes('duplicate'));
    assert.ok(salesRun.cases.find(item=>item.label==='I2').flags.includes('terms'));
    assert.ok(salesRun.cases.find(item=>item.label==='WRONG').flags.includes('scope'));
    assert.deepEqual(salesRun.summary,{invoices:30000,ledger:31200,creditAtClose:500,open:29500,subsequentCash:22000,
      remaining:7500,notDue:10000,days1to30:0,days31to60:19500,days61to90:0,over90:0});
    assert.equal((await run('preparer','area-run',sales)).areas[sales.form].stamp,salesRun.stamp);
    await run('preparer','area-run',{...sales,through:'2026-02-01'},409);
    const ar={...sales,form:'3.1.5',line:'AR',sign:'debit'};
    const arRun=(await run('preparer','area-run',ar)).areas[ar.form];
    assert.equal(arRun.summary.ledger,30000);
    assert.equal(arRun.summary.remaining,7500);
    const purchases={form:'3.1.10',line:'AP',through,sign:'credit',...purchaseEvidence};
    const purchaseRun=(await run('preparer','area-run',purchases)).areas[purchases.form];
    assert.equal(purchaseRun.summary.candidateLiability,7500);
    assert.equal(purchaseRun.summary.payments,2500);
    assert.deepEqual(purchaseRun.links.find(link=>link.label==='B2').trace.map(trace=>trace.source),['receipts','bills','payments']);
    assert.ok(purchaseRun.cases.find(item=>item.label==='B2').flags.includes('liability'));
    assert.ok(purchaseRun.cases.some(item=>item.flags.includes('payment_duplicate')));
    assert.ok(purchaseRun.cases.find(item=>item.label==='PAY3').flags.includes('unmatched'));
    const cash={form:'3.1.8',line:'Cash',through,...bankEvidence};
    const bankRun=(await run('preparer','area-run',cash)).areas[cash.form];
    assert.equal(bankRun.summary.matched,1);
    assert.deepEqual(bankRun.links.find(link=>link.label==='BANK1').trace.map(trace=>trace.source),['bank','ledger']);
    assert.equal(bankRun.summary.residual,-1000);
    assert.ok(bankRun.cases.find(item=>item.label==='AD').flags.includes('reconciling'));
    assert.ok(bankRun.cases.find(item=>item.label==='ST2').flags.includes('unmatched'));
    const stock={form:'3.1.4',line:'Inventory',through,sign:'debit',
      inventory:await evidence('inventory',source('id,entity,currency,item,location,unit,opening_qty,closing_qty,closing_value',[
        ['ITEM1','A','Main','EA',10,11,330],['ITEM2','B','Annex','EA',5,5,160],
      ])),
      movements:await evidence('movements',source('id,entity,currency,item,location,unit,date,kind,quantity',[
        ['IN','A','Main','EA','2025-12-01','receipt',5],['OUT','A','Main','EA','2025-12-02','issue',3],
      ])),
      counts:await evidence('counts',source('id,entity,currency,item,location,unit,date,counted_qty',[
        ['CT1','A','Main','EA','2025-12-31',10],['CT2','B','Annex','EA','2025-12-31',5],
      ])),
    };
    const stockRun=(await run('preparer','area-run',stock)).areas[stock.form];
    assert.deepEqual(stockRun.summary,{inventoryValue:49000,ledger:50000,countedItems:2,unresolvedCounts:1,residual:-1000});
    const mismatch=stockRun.cases.find(item=>item.label==='A / Main / EA');
    assert.deepEqual(mismatch.flags,['rollforward','count']);
    assert.deepEqual(mismatch.metrics,{expectedQuantity:12,closingQuantity:11,countedQuantity:10});
    await run('reviewer','area-review',{form:stock.form,version:'1',conclusion:'Count differences unresolved'},409);
    const assetHeader='id,entity,currency,class,opening_cost,additions,disposals,transfers,closing_cost,opening_accumulated,charge,disposed_accumulated,adjustments,closing_accumulated';
    const assetRow=['FA1','Equipment',100,60,0,0,160,10,5,0,0,15];
    const assets={form:'3.1.2',line:'PPE',through,sign:'debit',
      assets:await evidence('assets',source(assetHeader,[assetRow])),
      additions:await evidence('additions',source('id,entity,currency,asset,date,amount',[
        ['ACQUISITION','FA1','2025-07-01',60],
      ])),
    };
    const assetRun=(await run('preparer','area-run',assets)).areas[assets.form];
    assert.deepEqual(assetRun.summary,{assetCost:16000,accumulated:1500,carrying:14500,additions:6000,ledger:14500,residual:0});
    assert.deepEqual(assetRun.cases,[]);
    await run('reviewer','area-review',{form:assets.form,version:'1',conclusion:'Register and addition agree'});
    const incorrect=assetRow.map((value,i)=>i===6?158:value);
    const revisedAsset=await evidence('revised-assets',source(assetHeader,[incorrect]));
    const revisedRun=(await run('preparer','area-run',{...assets,assets:revisedAsset})).areas[assets.form];
    assert.equal(revisedRun.summary.residual,-200);
    assert.ok(revisedRun.cases.some(c=>c.flags.includes('rollforward')));
    assert.equal(revisedRun.history[0].approval.conclusion,'Register and addition agree');

    const request=(await run('preparer','request',{form:sales.form,title:'Sales test support',due:through})).requests[0].id;
    await run('preparer','upload',{request,source:'Auditor inquiry',...file('signed-response.csv','Reviewed commercial exceptions')});
    state=await run('preparer','accept',{request});
    const support=state.requests[0].parts[0].evidence;
    const review={form:sales.form,version:String(salesRun.version),conclusion:'Independently reviewed the sales and cut-off exceptions'};
    await run('reviewer','area-review',review,409);
    await run('preparer','submit',{form:sales.form},409);
    for (const item of salesRun.cases) await run('preparer','area-dispose',{...review,case:item.id,evidence:support,
      result:item.id===i1.id?'finding':'explained',amount:'0',note:'Examined exact source rows for '+item.label});
    await run('preparer','area-review',review,403);
    state=await run('reviewer','area-review',review);
    assert.equal(state.areas[sales.form].approval.conclusion,review.conclusion);
    await run('preparer','save',{form:sales.form,execution:'Reconciled the sales ledger and source files',conclusion:'Cut-off issue escalated'});
    await run('preparer','submit',{form:sales.form});
    state=await run('reviewer','review',{form:sales.form});
    const signed=state.papers.find(p=>p.form===sales.form);
    assert.equal(JSON.parse(signed.values['pilot.area.run']).stamp,salesRun.stamp);
    assert.equal(state.fieldFindings[0].form,sales.form);
    assert.equal(await (await service.fetch(scoped('/evidence/'+salesEvidence.credits,engagement),cookies.reviewer)).status,200);
    await run('partner','fieldwork-resolve-finding',{id:state.fieldFindings[0].id,reason:'Retained the year-end cut-off issue'});
    state=await run('preparer','population-import',importFields);
    assert.ok(programForms.every(form=>state.areas[form].current===false));
    assert.equal(state.papers.find(p=>p.form===sales.form).status,'changed');
    assert.ok(state.papers.find(p=>p.form===sales.form).history.some(h=>h.version===signed.version&&h.values['pilot.area.run']));
    await service.close();
    service=await start(database);
    const reloaded=await fixture(service,false);
    state=await reloaded.view('reviewer',engagement);
    assert.equal(state.areas[sales.form].approval.conclusion,review.conclusion);
    assert.equal(state.areas[sales.form].current,false);
  } finally {
    if(service)await service.close();
    for(const suffix of ['', '-shm', '-wal'])await rm(database+suffix,{force:true});
    await rmdir(dir);
  }
});
test('approved payroll, tax and financing editions calculate exact outputs and reject unsupported inputs', async () => {
  const dir=await mkdtemp(join(tmpdir(),'audit-statutory-finance-'));
  const database=join(dir,'pilot.sqlite');
  let service;
  try {
    service=await start(database);
    const {view,write}=await fixture(service);
    const forms=['3.1.18','3.1.14','3.1.9','3.1.21','3.1.20','3.1.15','3.1.3'];
    async function approve(scope,kind,values) {
      const fields=Object.fromEntries(Object.entries(values).map(([k,v])=>['field.'+k,v]));
      const draft=await write('reviewer',scope,'register',{kind,operation:'save',...fields});
      const id=draft.registers.findLast(r=>r.kind===kind).id;
      await write('reviewer',scope,'register',{kind,id,operation:'submit'});
      await write('partner',scope,'register',{kind,id,operation:'approve',reason:'Independent fixture approval'});
      return id;
    }
    const rules={};
    for (const programme of forms) rules[programme]=await approve('firm','M02-F05',{
      programme,profile:'all',outcome:'optional',override:'no',basis:'Scoped calculation method'});
    const engagement=(await write('reviewer','firm','create',create)).selected;
    const run=(role,action,fields,status=200)=>write(role,engagement,action,fields,status);
    await run('partner','activate',{assessment:'Accepted',independence:'Reviewed',letter:'Agreed'});
    for (const programme of forms) {
      const risk=await approve(engagement,'M06-F09',{programme,risk:'Recalculation '+programme,type:'account',target:programme,
        assertion:'Accuracy',response:'Compare approved parameters, source amounts and ledger'});
      await approve(engagement,'M07-F01',{rule:rules[programme],risk,decision:'adopt',basis:'Selected for the reference engagement'});
    }
    const file=(name,body)=>({name,base64:Buffer.from(body).toString('base64')});
    const approvedFile=async (name,body)=>{
      const uploaded=await run('preparer','support-upload',{...file(name+'.csv',body),source:'Synthetic reviewed '+name});
      const id=uploaded.evidence.find(row=>row.name===name+'.csv').id;
      await run('reviewer','support-assess',{id,result:'accepted',reason:'Original and basis reviewed independently'});
      return id;
    };
    const entries=[
      ['P1','PayrollExpense',1045],['P2','PayrollExpense',525],['P1','PayrollLiability',-222],['P2','PayrollLiability',-115],
      ['P1','PayrollCash',-823],['P2','PayrollCash',-400],
      ['2025-12:vat','Tax',-100],['2025-12:withholding','Tax',-25],['2025-12:current','Tax',-200],['2025-12:deferred','Tax',30],
      ['2025-12:vat','TaxCash',-80],['2025-12:withholding','TaxCash',-25],['2025-12:current','TaxCash',-200],
      ['L1','Loan',-1100],['L1','Interest',105.04],
      ['LS1','Lease',-120],['LS2','Lease',-100],['LS1','ROU',130],['LS2','ROU',100],
      ['F1','FX',25],['F2','FX',-15],['E1','Equity',-1125],['INV1','Investment',130],['INV1','Income',-9],
    ];
    const ledger=['id,account,amount,entity,date,currency,reference',...entries.map(([ref,account,amount],i)=>
      ['ROW-'+i,account,amount,create.registration,'2025-12-31','MNT',ref].join(','))].join('\n');
    const amount=entries.reduce((sum,row)=>sum+Math.round(row[2]*100),0)/100;
    const accounts=[...new Set(entries.map(row=>row[1]))];
    const controls=await approvedFile('controls','Independent signed balance schedule\n'+entries.length+','+amount);
    const importFields={...file('ledger.csv',ledger),source:'Signed synthetic ledger',currency:'MNT'};
    await run('preparer','population-import',importFields);
    const reconciled=await run('preparer','population-reconcile',{version:'1',count:String(entries.length),total:String(amount),
      source:'Signed separate control',controlEvidence:controls,use:'Recalculations with named profiles',mapping:accounts.map(a=>a+','+a).join('\n'),
      statements:accounts.map(a=>a+','+entries.filter(r=>r[1]===a).reduce((sum,r)=>sum+Math.round(r[2]*100),0)/100).join('\n')});
    assert.deepEqual(reconciled.population.current.gaps,[]);
    await run('reviewer','population-approve',{version:'2',reason:'Verified exact totals and statements'});
    const csv=(columns,rows)=>[columns,...rows.map(([id,...fields])=>[id,create.registration,'MNT',...fields].join(','))].join('\n');
    const source=(name,columns,rows)=>approvedFile(name,csv(columns,rows));
    const edition='SYNTHETIC-2025', through='2026-03-31', params={edition,through};
    const payroll={...params,form:'3.1.18',line:'PayrollExpense',liability:'PayrollLiability',settlement:'PayrollCash',sign:'debit',
      payroll:await source('payroll','id,entity,currency,employee,category,date,status,gross,employee_contribution,withholding,employer_contribution,other_deductions,net_adjustment,net',[
        ['P1','EMP1','standard','2025-12-20','active',1000,80,92,40,10,5,823],
        ['P2','EMP2','standard','2025-12-21','inactive',500,50,45,25,0,0,410],
      ]),
      payrollRules:await source('payroll-rules','id,entity,currency,edition,category,method,from,to,employee_bps,employer_bps,withholding_bps,cap,withholding_base',[
        ['RULE',edition,'standard','flat_cap','2025-01-01','2025-12-31',1000,500,1000,800,'after_employee'],
        ['RULE','EXPIRED','standard','flat_cap','2024-01-01','2024-12-31',1000,500,1000,800,'after_employee'],
        ['RULE','UNSUPPORTED','standard','progressive_unknown','2025-01-01','2025-12-31',1000,500,1000,800,'after_employee'],
      ]),
      payrollBank:await source('payroll-bank','id,entity,currency,payroll,employee,date,amount',[
        ['BANK1','P1','EMP1','2025-12-22',823],['BANK2','P2','EMP2','2025-12-22',400],
      ]),
      payrollHistory:await source('payroll-history','id,entity,currency,employee,category,period,gross',[
        ['PR1','EMP1','standard','2025-11',900],
      ]),
      payrollVariance:await source('payroll-variance','id,entity,currency,edition,from,to,method,amount,rate_bps,pay_day',[
        ['VAR',edition,'2025-01-01','2025-12-31','month_day',60,1500,20],
      ]),
    };
    await run('preparer','area-run',{...payroll,edition:''},400);
    for (const invalid of ['UNKNOWN','EXPIRED','UNSUPPORTED']) await run('preparer','area-run',{...payroll,edition:invalid},409);
    assert.equal((await view('reviewer',engagement)).areas,undefined);
    let state=await run('preparer','area-run',payroll);
    const payrollRun=state.areas[payroll.form];
    assert.equal(payrollRun.summary.expectedNet,122800);
    assert.equal(payrollRun.summary.expectedLiability,34200);
    assert.equal(payrollRun.summary.ledgerLiability,33700);
    assert.equal(payrollRun.summary.bankPaid,122300);
    assert.deepEqual([payrollRun.summary.payChanges,payrollRun.summary.offCycle,payrollRun.summary.missingComparator],[1,1,1]);
    assert.deepEqual(payrollRun.cases.find(c=>c.label==='EMP2 / P2').flags.sort(),['inactive','settlement','statutory','variance']);
    assert.equal(payrollRun.links.find(c=>c.label==='EMP1 / P1').metrics.expectedEmployer,4000);
    assert.deepEqual(payrollRun.cases.find(c=>c.label==='EMP2 / 2025-12').flags,['comparator','off_cycle']);
    assert.ok(payrollRun.links.find(c=>c.label==='EMP1 / P1').trace.some(t=>t.source==='payrollRules'&&t.row===2));
    const tax={...params,form:'3.1.14',line:'Tax',settlement:'TaxCash',sign:'credit',
      tax:await source('tax','id,entity,currency,period,category,date,base,adjustment,offset,tax',[
        ['T1','2025-12','vat','2025-12-20',1000,0,0,100],['T2','2025-12','withholding','2025-12-20',500,0,0,25],
        ['T3','2025-12','current','2025-12-20',2000,100,10,200],['T4','2025-12','deferred','2025-12-20',-300,0,0,-30],
      ]),
      taxRules:await source('tax-rules','id,entity,currency,edition,category,method,from,to,rate_bps',[
        ['VAT',edition,'vat','flat','2025-01-01','2025-12-31',1000],['WHT',edition,'withholding','flat','2025-01-01','2025-12-31',500],
        ['CIT',edition,'current','current','2025-01-01','2025-12-31',1000],['DT',edition,'deferred','temporary','2025-01-01','2025-12-31',1000],
      ]),
      taxReturns:await source('filed-returns','id,entity,currency,period,category,date,amount',[
        ['R1','2025-12','vat','2026-01-05',95],['R2','2025-12','withholding','2026-01-05',25],
        ['R3','2025-12','current','2026-01-05',200],['R4','2025-12','deferred','2026-01-05',-30],
      ]),
      taxPayments:await source('tax-payments','id,entity,currency,period,category,date,amount',[
        ['B1','2025-12','vat','2025-12-31',80],['B2','2025-12','withholding','2025-12-31',25],['B3','2025-12','current','2025-12-31',200],
      ]),
    };
    const taxRun=(await run('preparer','area-run',tax)).areas[tax.form];
    assert.deepEqual(taxRun.summary,{expectedTax:32500,recordedTax:32500,deferredTax:-3000,filedTax:32000,taxPaid:30500,
      ledgerTax:29500,ledgerSettlement:30500});
    assert.deepEqual(taxRun.cases.find(c=>c.label==='2025-12:vat').flags,['filing']);
    assert.equal(taxRun.links.find(c=>c.label==='2025-12:vat').metrics.unsettledTax,2000);

    const loan={...params,form:'3.1.9',line:'Loan',interest:'Interest',sign:'credit',
      loans:await source('loans','id,entity,currency,opening,drawdowns,repayments,movements,closing,recorded_interest,covenant_metric',[
        ['L1',1000,200,100,0,1100,105.04,2.5],
      ]),
      loanTerms:await source('loan-terms','id,entity,currency,loan,edition,method,from,to,rate_bps,day_basis,covenant_direction,covenant_limit,definition',[
        ['TERM','L1',edition,'simple_segment','2025-01-01','2026-01-01',1000,365,'maximum',2,'Approved leverage metric from loan covenant'],
      ]),
      loanSegments:await source('loan-segments','id,entity,currency,loan,from,to,principal',[
        ['S1','L1','2025-01-01','2025-07-01',1000],['S2','L1','2025-07-01','2026-01-01',1100],
      ]),
    };
    const loanRun=(await run('preparer','area-run',loan)).areas[loan.form];
    assert.equal(loanRun.summary.loanInterest,10504);
    assert.equal(loanRun.summary.loanPrincipal,110000);
    assert.deepEqual(loanRun.cases.map(c=>[c.flags,c.metrics.headroom]),[[['covenant'],-50]]);
    const leases={...params,form:'3.1.21',line:'Lease',rou:'ROU',sign:'credit',
      leases:await source('leases','id,entity,currency,edition,method,rate_bps,life,elapsed,initial_adjustment,recorded_liability,recorded_rou',[
        ['LS1',edition,'fixed_arrears',0,2,1,20,120,130],['LS2',edition,'fixed_arrears',1000,1,0,0,100,100],
        ['LS1','VARIABLE','variable',0,2,1,20,120,130],
      ]),
      leasePayments:await source('lease-payments','id,entity,currency,lease,sequence,amount',[
        ['P1','LS1',1,120],['P2','LS1',2,120],['P3','LS2',1,110],
      ]),
    };
    await run('preparer','area-run',{...leases,edition:'VARIABLE'},409);
    const leaseRun=(await run('preparer','area-run',leases)).areas[leases.form];
    assert.deepEqual(leaseRun.summary,{leaseLiability:22000,leaseRou:23000,ledger:22000,ledgerRou:23000});
    assert.equal(leaseRun.links.find(c=>c.label==='LS1').metrics.initialLiability,24000);
    assert.deepEqual(leaseRun.cases,[]);
    const fx={...params,form:'3.1.20',line:'FX',sign:'debit',
      fxPositions:await source('fx-positions','id,entity,currency,foreign_currency,date,basis,foreign_amount,recorded',[
        ['F1','USD','2025-12-15','transaction',10,24],['F2','USD','2025-12-31','monetary_close',-5,-15],
      ]),
      fxRates:await source('fx-rates','id,entity,currency,edition,foreign_currency,date,direction,rate_micros',[
        ['RATE1',edition,'USD','2025-12-15','functional_per_foreign',2500000],
        ['RATE2',edition,'USD','2025-12-31','functional_per_foreign',3000000],
        ['RATE1','INCOMPLETE','USD','2025-12-15','functional_per_foreign',2500000],
      ]),
    };
    await run('preparer','area-run',{...fx,edition:'INCOMPLETE'},409);
    const fxRun=(await run('preparer','area-run',fx)).areas[fx.form];
    assert.equal(fxRun.summary.fxFunctional,1000);
    assert.equal(fxRun.links.find(c=>c.label==='F2').metrics.fxFunctional,-1500);
    assert.deepEqual(fxRun.cases.find(c=>c.label==='F1').flags,['valuation']);
    const equity={...params,form:'3.1.15',line:'Equity',sign:'credit',
      equity:await source('equity','id,entity,currency,edition,method,opening,profit,contributions,distributions,transfers,movements,closing',[
        ['E1',edition,'roll_forward',1000,100,50,20,-5,0,1125],
      ]),
      equityActions:await source('equity-actions','id,entity,currency,component,kind,date,amount,reference',[
        ['C','E1','contribution','2025-11-01',50,'Approved resolution'],['D','E1','distribution','2025-12-01',20,''],
      ]),
    };
    const equityRun=(await run('preparer','area-run',equity)).areas[equity.form];
    assert.equal(equityRun.summary.equityClosing,112500);
    assert.deepEqual(equityRun.cases[0].flags,['authority']);
    const investments={...params,form:'3.1.3',line:'Investment',income:'Income',sign:'debit',
      investments:await source('investments','id,entity,currency,edition,method,opening_units,acquired_units,disposed_units,other_units,closing_units,opening_cost,additions,disposals,transfers,closing_cost,income,valuation',[
        ['INV1',edition,'discounted_cash_flows',10,5,3,0,12,100,60,30,0,130,9,199],
      ]),
      custody:await source('custody','id,entity,currency,instrument,date,closing_units,closing_cost,income',[
        ['C','INV1','2025-12-31',12,130,9],
      ]),
      investmentCashFlows:await source('investment-flows','id,entity,currency,instrument,edition,method,sequence,rate_bps,amount',[
        ['CF1','INV1',edition,'period_end',1,1000,110],['CF2','INV1',edition,'period_end',2,1000,121],
      ]),
    };
    const investmentRun=(await run('preparer','area-run',investments)).areas[investments.form];
    assert.equal(investmentRun.summary.investmentPv,20000);
    assert.equal(investmentRun.summary.investmentIncome,900);
    assert.deepEqual(investmentRun.cases[0].flags,['valuation']);

    const review={form:payroll.form,version:String(payrollRun.version),conclusion:'Reviewed employee contribution and payment discrepancies'};
    await run('reviewer','area-review',review,409);
    const request=(await run('preparer','request',{form:payroll.form,title:'Payroll review evidence',due:through})).requests[0].id;
    await run('preparer','upload',{request,source:'Reviewed inquiry',...file('payroll-exception.csv','Payroll exception evidence')});
    state=await run('preparer','accept',{request});
    const proof=state.requests[0].parts[0].evidence;
    for (const item of payrollRun.cases) await run('preparer','area-dispose',{...review,case:item.id,evidence:proof,
      result:'finding',amount:'5',note:'Investigated payroll and payment evidence'});
    await run('preparer','area-review',review,403);
    await run('reviewer','area-review',review);
    await run('preparer','save',{form:payroll.form,execution:'Compared original ledger, bank and payroll',conclusion:'Escalated payroll discrepancy'});
    await run('preparer','submit',{form:payroll.form});
    state=await run('reviewer','review',{form:payroll.form});
    const paper=state.papers.find(p=>p.form===payroll.form);
    assert.equal(JSON.parse(paper.values['pilot.area.run']).stamp,payrollRun.stamp);
    assert.equal(state.fieldFindings[0].amount,5);
    state=await run('preparer','population-import',importFields);
    assert.ok(forms.every(form=>state.areas[form].current===false));
    assert.ok(state.papers.find(p=>p.form===payroll.form).history.some(h=>h.version===paper.version&&h.values['pilot.area.run']));
    await service.close();
    service=await start(database);
    const restarted=await fixture(service,false);
    state=await restarted.view('reviewer',engagement);
    assert.equal(state.areas[payroll.form].params.edition,edition);
    assert.equal(state.areas[payroll.form].approval.conclusion,review.conclusion);
    assert.equal(state.areas[payroll.form].current,false);
  } finally {
    if(service)await service.close();
    for(const suffix of ['', '-shm', '-wal'])await rm(database+suffix,{force:true});
    await rmdir(dir);
  }
});
test('technical changes, posting verification, exact-package EQR and independent custody form one scoped cycle', async t => {
  const dir=await mkdtemp(join(tmpdir(),'audit-completion-cycle-'));
  const database=join(dir,'pilot.sqlite');
  let service;
  try {
    service=await start(database);
    const extras={quality:'test-independent-quality',custodian:'test-independent-custody'};
    assert.equal((await service.fetch('/setup','',{code:'test-bootstrap-only',...passwords,...extras})).status,201);
    const {cookies,scoped,view,write}=await fixture(service,false);
    const day=86_400_000, today=new Date().toISOString().slice(0,10);
    const priorDate=new Date(Date.now()-2*day).toISOString().slice(0,10);
    const engagement=(await write('reviewer','firm','create',{...create,reportDate:priorDate,synthetic:'yes'})).selected;
    const run=(role,action,fields,status=200)=>write(role,engagement,action,fields,status);
    const current=role=>view(role,engagement);
    const work=(state,form)=>state.papers.find(p=>p.form===form);
    const auditRegister=async(kind,values,owner='reviewer',approver='partner',id)=>{
      const fields=Object.fromEntries(Object.entries(values).map(([k,v])=>['field.'+k,v]));
      const draft=await run(owner,'register',{kind,id,operation:'save',...fields});
      const record=id??draft.registers.findLast(r=>r.kind===kind).id;
      await run(owner,'register',{kind,id:record,operation:'submit'});
      await run(approver,'register',{kind,id:record,operation:'approve',reason:'Independently checked the exact source'});
      return record;
    };
    const file=(name,text)=>({name,base64:Buffer.from(text).toString('base64')});
    const evidence=async(name,text)=>{
      const uploaded=await run('reviewer','support-upload',{...file(name+'.csv',text),source:'Retained original '+name});
      const id=uploaded.evidence.find(f=>f.name===name+'.csv').id;
      await run('partner','support-assess',{id,result:'accepted',reason:'Reviewed original file'});
      return id;
    };
    await run('partner','activate',{assessment:'Accepted',independence:'Reviewed',letter:'Agreed'});
    const original=await evidence('technical-evidence','Original supporting work and schedules');
    const further=await evidence('component-followup','Specific further tests of the component');
    const controls=await evidence('population-control','Independently checked signed control report');
    const importLedger=async(posted)=>{
      const lines=['id,account,amount,entity,date,currency,reference',
        ['ORIGINAL','1500',100,create.registration,'2025-10-10','MNT','BASE'].join(',')];
      if (posted!==undefined) lines.push(['CORRECTION','1500',posted,create.registration,'2025-12-31','MNT','ADJ-1'].join(','));
      const raw=(await run('preparer','population-import',{...file('ledger.csv',lines.join('\n')),source:'Reviewed ledger export',currency:'MNT'})).population.current;
      const total=String(100+(posted??0));
      const reconciled=await run('preparer','population-reconcile',{version:String(raw.version),count:String(lines.length-1),total,
        source:'Independent controls',controlEvidence:controls,mapping:'1500,PPE',statements:'PPE,'+total,use:'Test the correction'});
      return run('reviewer','population-approve',{version:String(reconciled.population.current.version),reason:'Approved independent controls'});
    };
    await importLedger();
    const paper=async(form,extra={},owner='preparer',reviewer='reviewer')=>{
      await run(owner,'save',{form,execution:'Examined exact source records',conclusion:'Completed and documented the selected work',...extra});
      await run(owner,'submit',{form});
      return run(reviewer,'review',{form});
    };
    await paper('1.3',{benchmark:'10000',percentage:'1',performance:'50',trivial:'5',benchmarkSource:'Approved statement amount'});
    await paper('2.6',{reliance:'none'});
    let state=await current('reviewer');
    await run('reviewer','resolve-impact',{id:state.impacts[0].id,reason:'Assessed threshold and planned work'});
    const ownerFacts={name:'Related owner',relation:'owner',share:'80',effective:'2025-01-01',source:'Registry version',basis:'Reviewed owner'};
    const party=await auditRegister('M03-F04',ownerFacts), group=await auditRegister('M03-F04',{...ownerFacts,name:'Component A',relation:'group',share:'100'});
    const related={type:'related',paper:'3.2.4',party,sourceRef:'RP-1',evidence:original,work:'Compared relationship and transaction',
      effect:'Disclose approved relationship and transaction',conclusion:'Prepared related-party note',result:'resolved'};
    const relatedId=await auditRegister('M07-F10',related);
    const component={type:'component',paper:'3.1.13',party:group,sourceRef:'COMP-A',criterion:'Selected group method edition',
      contributor:'Component auditor',scope:'Revenue and cash under group instructions and scoped materiality',
      eligibility:'Examined competence, objectivity and group involvement',evidence:original,work:'Reviewed delivered scope',
      contrary:'Missing final revenue confirmations',effect:'Retain limitation in group conclusion',conclusion:'Additional work needed',result:'limited'};
    const componentId=await auditRegister('M07-F10',component);
    const estimate={type:'estimate',paper:'3.1.2',sourceRef:'EST-1',criterion:'Auditor range under reviewed methodology',assumptions:'Reviewed lives and market support',
      recorded:'100',low:'85',high:'110',evidence:original,work:'Recalculated supported range',effect:'Verified disclosures',conclusion:'Within range',result:'resolved'};
    await auditRegister('M07-F10',estimate);
    const ppe={form:'3.1.2'};
    const request=(await run('preparer','request',{...ppe,title:'PPE estimate original',due:priorDate})).requests[0].id;
    const initialPpe=(await run('preparer','upload',{request,source:'Asset register owner',...file('fixed-assets.csv','Asset file original')}))
      .evidence.find(e=>e.name==='fixed-assets.csv').id;
    await run('preparer','accept',{request});
    await run('preparer','save',{...ppe,execution:'Compared cost and useful life',conclusion:'Estimate appears supported'});
    const firstPpeSubmission=work(await run('preparer','submit',ppe),ppe.form);
    assert.equal(firstPpeSubmission.status,'submitted');
    assert.notEqual(firstPpeSubmission.reviewedVersion,firstPpeSubmission.version);
    assert.ok(firstPpeSubmission.evidence.includes(initialPpe));
    const returnReason='Obtain the authorized useful-life schedule and explain the estimate';
    const returnedPpe=work(await run('reviewer','return',{...ppe,reason:returnReason}),ppe.form);
    const note=returnedPpe.notes[0];
    assert.deepEqual([returnedPpe.status,note.author,note.version,note.anchor,note.text],
      ['returned',accounts.reviewer,firstPpeSubmission.version,'conclusion',returnReason]);
    await run('reviewer','request-reopen',{request,reason:'Replace unsupported useful-life source'});
    await run('preparer','submit',ppe,409);
    const schedule='asset,cost,usefulLife\nPPE-A,100,5\n';
    await run('preparer','upload',{request,source:'Authorized replacement register',...file('fixed-assets-revised.csv',schedule)});
    const acceptedPpe=await run('preparer','accept',{request});
    const replacement=acceptedPpe.evidence.find(e=>e.name==='fixed-assets-revised.csv');
    assert.equal(replacement.replaces,initialPpe);
    const retrieved=await service.fetch(scoped('/evidence/'+replacement.id,engagement),cookies.reviewer);
    assert.equal(retrieved.status,200);
    const reviewedBytes=await retrieved.text();
    assert.equal(reviewedBytes,schedule);
    const revisedConclusion='Authorized useful-life schedule supports the five-year life';
    const response='Attached the approved replacement schedule and reconciled PPE-A to the recorded cost';
    await run('preparer','save',{...ppe,execution:'Compared cost and the authorized useful-life schedule',conclusion:revisedConclusion});
    await run('preparer','respond',{...ppe,note:note.id,response});
    const resubmittedPpe=work(await run('preparer','submit',ppe),ppe.form);
    assert.ok(resubmittedPpe.version>firstPpeSubmission.version);
    assert.ok(resubmittedPpe.evidence.includes(replacement.id));
    assert.ok(!resubmittedPpe.evidence.includes(initialPpe));
    assert.equal(resubmittedPpe.notes[0].cleared,false);
    await run('preparer','clear',{...ppe,note:note.id},403);
    await run('reviewer','review',ppe,409);
    const noteBasis={...ppe,note:note.id,version:String(resubmittedPpe.version)};
    const returnedResponse=work(await run('reviewer','clear',{...noteBasis,responseVersion:'1',result:'returned',
      reason:'Identify the basis for the revised life in the reviewer response'}),ppe.form);
    assert.equal(returnedResponse.status,'returned');
    assert.equal(returnedResponse.notes[0].cleared,false);
    await run('preparer','respond',{...ppe,note:note.id,response});
    await run('preparer','submit',ppe);
    const reason='Verified the work revision and exact replacement schedule';
    await run('reviewer','clear',{...noteBasis,responseVersion:'1',reason},409);
    const clearedPpe=work(await run('reviewer','clear',{...noteBasis,responseVersion:'2',reason}),ppe.form);
    assert.equal(clearedPpe.status,'submitted');
    assert.deepEqual(clearedPpe.notes[0].decisions.map(({result,by,workVersion,responseVersion})=>[result,by,workVersion,responseVersion]),
      [['returned',accounts.reviewer,resubmittedPpe.version,1],['cleared',accounts.reviewer,resubmittedPpe.version,2]]);
    assert.equal(clearedPpe.notes[0].decisions[1].reason,reason);
    assert.ok(Number.isFinite(Date.parse(clearedPpe.notes[0].decisions[1].at)));
    const reviewedPpe=work(await run('reviewer','review',ppe),ppe.form);
    assert.deepEqual([reviewedPpe.status,reviewedPpe.reviewedVersion,reviewedPpe.values.conclusion,
      reviewedPpe.notes[0].response,reviewedPpe.notes[0].cleared],
    ['reviewed',resubmittedPpe.version,revisedConclusion,response,true]);
    assert.ok(reviewedPpe.history.some(entry=>entry.version===firstPpeSubmission.version&&entry.by===accounts.preparer&&
      entry.values.conclusion===firstPpeSubmission.values.conclusion&&entry.evidence.includes(initialPpe)));
    await paper('3.1.13');
    const relatedPaper={form:'3.2.4'};
    const assigned=work(await run('partner','work-assign',{...relatedPaper,owner:'preparer',reviewer:'partner',
      reason:'Route the significant ownership disclosure directly to the engagement partner'}),relatedPaper.form);
    assert.equal(assigned.assignmentHistory[0].reviewer,accounts.partner);
    await run('preparer','save',{...relatedPaper,execution:'Traced ownership evidence',conclusion:'Identified the disclosure consequence'});
    const routed=work(await run('preparer','submit',relatedPaper),relatedPaper.form);
    assert.equal(work(await current('reviewer'),relatedPaper.form).reviewable,false);
    assert.equal(work(await current('partner'),relatedPaper.form).reviewable,true);
    await run('reviewer','review',relatedPaper,403);
    state=await run('partner','review',relatedPaper);
    const earlier=state.papers.find(w=>w.form==='3.2.4');
    assert.deepEqual([earlier.owner,earlier.reviewer,routed.submittedBy,earlier.reviewedVersion],
      [accounts.preparer,accounts.partner,accounts.preparer,routed.version]);
    assert.ok(state.gaps.some(g=>g.includes('M07-F10')));
    const consultation={form:'3.2.4',title:'Ownership disclosure consultation',
      scope:'Partner must consider the approved ownership revision, relationship and applicable disclosure restriction',
      restriction:'prohibited',advice:original};
    await run('preparer','completion-consultation-record',consultation,403);
    state=await run('reviewer','completion-consultation-record',consultation);
    const consultationId=state.completion.consultations[0].id;
    const reviewConsultation=(version,result,reason,status=200)=>run('partner','completion-consultation-review',
      {id:consultationId,version:String(version),result,reason},status);
    assert.deepEqual((await current('preparer')).completion.consultations,[]);
    assert.ok(state.gaps.some(g=>g.startsWith('4.4 · Зөвлөлдөх')));
    await run('reviewer','save',{form:'4.4',execution:'Reviewed aggregate completion',conclusion:'Waiting for consultation'});
    await run('reviewer','submit',{form:'4.4'},409);
    const deniedProhibition=await reviewConsultation(1,'resolved','The partner cannot override the documented prohibition',409);
    assert.match(deniedProhibition.error,/хориг/);
    const returnedConsultation=(await reviewConsultation(1,'returned','Obtain evidence that the restriction is actually addressed')).completion.consultations[0];
    await run('reviewer','completion-consultation-record',{...consultation,id:consultationId,restriction:'clear'},409);
    const recommendation={...consultation,id:consultationId,restriction:'clear',advice:further};
    await run('reviewer','completion-consultation-record',recommendation);
    await run('reviewer','completion-consultation-review',{id:consultationId,version:'2',result:'resolved',reason:'Attempted self-review'},403);
    state=await reviewConsultation(2,'resolved','Revised the related-party note and checked the disclosed transaction against the advice');
    assert.equal(state.completion.consultations[0].scope,consultation.scope);
    assert.equal(state.completion.consultations[0].current,true);
    const firstConsultationReview=state.completion.consultations[0];
    await auditRegister('M03-F04',{...ownerFacts,share:'70',basis:'Confirmed change in ownership'},'reviewer','partner',party);
    state=await current('reviewer');
    assert.equal(state.papers.find(w=>w.form==='3.2.4').status,'changed');
    assert.equal(state.papers.find(w=>w.form==='3.1.2').status,'reviewed');
    assert.equal(state.papers.find(w=>w.form==='3.1.13').status,'reviewed');
    assert.ok(state.papers.find(w=>w.form==='3.2.4').history.some(h=>h.version===earlier.version&&h.values['pilot.technical']));
    assert.equal(state.completion.consultations[0].current,false);
    assert.equal(state.completion.consultations[0].decision.result,'resolved');
    const affected=work(state,relatedPaper.form), staleConsultation=state.completion.consultations[0];
    assert.ok(affected.history.some(entry=>entry.version===earlier.reviewedVersion&&entry.by===accounts.partner&&
      Boolean(Date.parse(entry.at))&&entry.values.conclusion===earlier.values.conclusion));
    await run('preparer','submit',{form:'3.2.4'},409);
    await auditRegister('M07-F10',{...related,conclusion:'Revised related-party note reflects confirmed ownership'},'reviewer','partner',relatedId);
    const updatedRelated=work(await paper('3.2.4',{},'preparer','partner'),relatedPaper.form);
    state=await run('reviewer','completion-consultation-record',{...recommendation,scope:'Reassessed the same advice against the revised ownership and disclosure'});
    assert.ok(state.completion.consultations[0].history.some(row=>row.version===2&&row.decision.result==='resolved'));
    await reviewConsultation(2,'resolved','Attempted to clear against the old signed basis',409);
    const updatedConsultation=(await reviewConsultation(3,'resolved','Checked the actual revised disclosure and evidence against the advice')).completion.consultations[0];
    await auditRegister('M07-F10',{...component,evidence:further,result:'resolved',effect:'Specified revenue work completed; other group areas retain their own conclusions',
      conclusion:'Received and checked requested limited scope'},'reviewer','partner',componentId);
    await paper('3.1.13');

    await run('partner','statements',{statements:'Financial statement version one',disclosures:'Initial disclosure'});
    state=await run('reviewer','completion-finding-record',{form:'3.1.2',title:'Recorded asset correction',reference:'F-PPE',
      classification:'factual',amount:'100',evidence:original,criterion:'Exact signed asset register',effect:'PPE adjustment'});
    const finding=state.completion.findings[0].id, correction={id:finding,version:'1'};
    await run('reviewer','correction-propose',{id:finding,amount:'100',account:'1500',reference:'ADJ-1',sign:'debit',evidence:original,reason:'Correct asset entry'});
    const managementReply=await evidence('management-reply','Management agrees to post 100');
    state=await run('reviewer','correction-response',{...correction,amount:'100',result:'accepted',evidence:managementReply,reason:'Confirmed actual acceptance'});
    assert.equal(state.completion.findings[0].outstanding,10000);
    assert.equal(state.completion.findings[0].status,'agreed');
    await run('reviewer','correction-verify',{...correction,reason:'Try self verification'},403);
    await run('partner','correction-verify',{...correction,reason:'No posted line yet'},409);
    await run('reviewer','completion-evaluate',{note:'Accepted but unposted remains outstanding'});
    state=await run('partner','completion-evaluation-approve',{version:'1',reason:'Confirmed unposted amount'});
    assert.equal(state.completion.evaluation.inputs.gross,10000);
    await importLedger(60);
    state=await run('partner','correction-verify',{...correction,reason:'Verified partial amount against approved ledger row'});
    assert.equal(state.completion.findings[0].outstanding,4000);
    assert.equal(state.completion.findings[0].correction.response.amount,10000);
    assert.equal(state.completion.findings[0].correction.postings[0].amount,6000);
    assert.equal(state.completion.findings[0].correction.postings[0].rows[0].row,3);
    assert.equal(state.completion.evaluation.current,false);
    await run('partner','fieldwork-resolve-finding',{id:finding,reason:'Assessed outstanding 40 and retained the effect'});
    await run('reviewer','completion-evaluate',{note:'Partial posting reduces gross outstanding to 40'});
    await run('partner','completion-evaluation-approve',{version:'2',reason:'Reviewed remaining effect'});

    const signedFiles={file:await evidence('signed-statements','Signed full financial statements'),
      notes:await evidence('signed-disclosures','Signed disclosures'),authorization:await evidence('management-authorization','Signed approval and authority')};
    const attach={...signedFiles,signer:'Finance Director',capacity:'Authorized management',date:'2026-01-03',basis:'Agrees to exact full statement and note set'};
    await run('reviewer','completion-management-submit',attach);
    await run('partner','completion-management-approve',{version:'1',reason:'Compared actual authorization and exact artifacts'});
    await run('partner','authorize',{},409);
    const representation={requested:'2026-01-01',due:priorDate,signed:'2026-01-03',signer:'Finance Director',capacity:'Authorized management',
      periodStart:create.start,periodEnd:create.end,evidence:await evidence('representation','Actual signed representation'),result:'received',assessment:'Reviewed full signed statement'};
    const rep=await auditRegister('M10-F12',representation);
    const subsequent={type:'subsequent',coverageThrough:priorDate,paper:'3.2.1',evidence:original,work:'Reviewed enquiries and minutes',
      result:'resolved',conclusion:'Covered through the prior report date'};
    const subsequentId=await auditRegister('M07-F10',subsequent);
    state=await run('partner','report-date',{date:today});
    assert.ok(state.gaps.some(g=>g.includes('3.2.1')));
    await auditRegister('M07-F10',{...subsequent,coverageThrough:today,conclusion:'Reviewed actual evidence through the extended date'},'reviewer','partner',subsequentId);
    const communication={paper:'3.1.2',finding,recipient:'Audit committee',message:'Discuss outstanding PPE adjustment',
      channel:'oral',mandatory:'yes',deliveryStatus:'pending'};
    const communicationId=await auditRegister('M10-F13',communication);
    state=await current('partner');
    assert.ok(state.gaps.some(g=>g.includes('M10-F13')));
    await auditRegister('M10-F13',{...communication,deliveryStatus:'delivered',deliveredAt:today,outcome:'Discussed the issue at the recorded meeting'},
      'reviewer','partner',communicationId);
    state=await run('partner','statements',{statements:'Financial statement version two',disclosures:'Reviewed new disclosure'});
    assert.equal(state.completion.management.current,false);
    assert.equal(state.completion.evaluation.current,false);
    assert.ok(state.registers.find(r=>r.id===rep).stale);
    await run('reviewer','completion-management-submit',{...attach,file:await evidence('signed-statements-v2','Revised signed statements'),
      notes:await evidence('signed-disclosures-v2','Revised signed disclosures'),authorization:await evidence('management-authorization-v2','Actual approval of version two')});
    await run('partner','completion-management-approve',{version:'2',reason:'Reviewed updated signed proof'});
    await auditRegister('M10-F12',{...representation,evidence:await evidence('representation-v2','Actual new signed letter'),assessment:'New version explicitly verified'},'reviewer','partner',rep);
    await run('reviewer','completion-evaluate',{note:'Reassessed remaining 40 against the updated statement version'});
    await run('partner','completion-evaluation-approve',{version:'3',reason:'Approved the updated evaluation'});
    const partnerCompletion=work(await paper('4.4',{},'reviewer','partner'),'4.4');
    assert.ok(partnerCompletion.history.some(entry=>entry.version===partnerCompletion.version&&entry.by===accounts.partner));
    await paper('4.1.A1',{},'reviewer','partner');

    const independent=async role=>{
      const response=await service.fetch('/oversight/login','',{role,password:extras[role]});
      assert.equal(response.status,200);
      return response.headers.get('set-cookie').split(';')[0];
    };
    const quality=await independent('quality');
    const qualityReference='Synthetic firm policy edition';
    state=await run('partner','quality-policy',{mode:'unresolved',reference:qualityReference,basis:'Mandatory trigger still under assessment'});
    assert.equal(state.oversight.quality.current,false);
    await run('partner','authorize',{},409);
    const noEqr=await run('partner','quality-policy',{mode:'not-required',reference:qualityReference,basis:'Initial assessment finds no mandatory trigger'});
    assert.equal(noEqr.oversight.quality.current,false);
    assert.deepEqual(noEqr.oversight.quality.approvals,[]);
    assert.ok(!noEqr.gaps.some(gap=>gap.startsWith('4.6')));
    const noEqrAuthorization=(await run('partner','authorize',{})).authorized;
    assert.equal(noEqrAuthorization.current,true);
    const qualityPolicy={mode:'required',reference:qualityReference,basis:'Confirmed trigger requires formal review'};
    let ineligibleEqr;
    for (const eligibilityStatus of ['unresolved','ineligible']) {
      state=await run('partner','quality-policy',{...qualityPolicy,reviewer:'Previously involved reviewer',eligibilityStatus,
        eligibility:eligibilityStatus==='ineligible'?'Prior engagement involvement violates the policy':'Assessment of prior involvement pending'});
      assert.equal(state.oversight.quality.policy.eligibilityStatus,eligibilityStatus);
      assert.equal(state.oversight.quality.current,false);
      assert.equal(state.authorized.current,false);
      const access=(await service.fetch(scoped('/oversight',engagement),quality)).status;
      assert.equal(access,404);
      const denial=await run('partner','authorize',{},409);
      assert.match(denial.error,/4\.6/);
      if (eligibilityStatus==='ineligible') ineligibleEqr={policy:state.oversight.quality.policy,access,denial};
    }
    state=await run('partner','quality-policy',{...qualityPolicy,reviewer:'Independent Reviewer',eligibilityStatus:'eligible',
      eligibility:'Separate credentials, authority, competence and sufficient time checked'});
    assert.equal(state.oversight.quality.policy.reference,qualityReference);
    assert.equal(state.oversight.quality.policy.basis,qualityPolicy.basis);
    assert.equal(state.oversight.quality.policy.by,'partner');
    assert.deepEqual(state.oversight.quality.policies.map(row=>row.eligibilityStatus),['','','unresolved','ineligible','eligible']);
    assert.deepEqual(state.oversight.quality.approvals,[]);
    assert.equal(state.oversight.quality.current,false);
    assert.equal((await service.fetch(scoped('/oversight',engagement),cookies.partner)).status,401);
    await run('partner','authorize',{},409);
    const qualityState=async()=> (await (await service.fetch(scoped('/oversight',engagement),quality)).json());
    const qualityAction=(action,basis,reason)=>service.fetch(scoped('/oversight/action',engagement),quality,{action,basis,reason});
    await run('partner','report-date',{date:priorDate});
    await paper('4.1.A1',{conclusion:'Reviewed the exact earlier-date draft'},'reviewer','partner');
    const lateMaterial=(await qualityState()).material;
    assert.deepEqual(lateMaterial.gaps,[]);
    assert.equal(lateMaterial.reportDate,priorDate);
    const lateApproval=await qualityAction('approve',lateMaterial.basis,'Try to approve after the report date');
    assert.equal(lateApproval.status,409);
    assert.match((await lateApproval.json()).error,/тайлангийн өдөр/);
    await run('partner','report-date',{date:today});
    await paper('4.1.A1',{},'reviewer','partner');
    let q=await qualityState();
    assert.deepEqual(q.material.gaps,[]);
    assert.equal(q.material.consultations[0].decision.result,'resolved');
    const prepared=q.material;
    const planned=['1.3','2.6','3.1.2','3.1.13','3.2.4','4.4','4.1.A1'].sort();
    assert.deepEqual(prepared.papers.map(p=>p.form).sort(),planned);
    assert.ok(prepared.papers.every(p=>p.status==='reviewed'&&p.version===p.reviewedVersion&&p.values.conclusion));
    const partnerPreparation=await current('partner');
    const preparationGaps=partnerPreparation.gaps.filter(gap=>!gap.startsWith('4.6'));
    assert.deepEqual(partnerPreparation.papers.map(p=>p.form).sort(),planned);
    assert.deepEqual(preparationGaps,[]);
    assert.equal((await qualityAction('return',q.material.basis,'Clarify workpaper conclusion')).status,200);
    await run('partner','quality-policy',{mode:'not-required',reference:qualityReference,basis:'Attempted override of unresolved EQR concern'},409);
    q=await qualityState();
    const openEqrDenial=(await qualityAction('approve',q.material.basis,'Without team response')).status;
    assert.equal(openEqrDenial,409);
    const blockedRelease=await run('partner','authorize',{},409);
    assert.match(blockedRelease.error,/4\.6/);
    await run('partner','quality-response',{id:q.quality.notes[0].id,reason:'Initial exact response'});
    const oldBasis=q.material.basis;
    await paper('4.1.A1',{conclusion:'Revised exact report after feedback'},'reviewer','partner');
    q=await qualityState();
    assert.notEqual(q.material.basis,oldBasis);
    const staleEqrDenial=(await qualityAction('approve',oldBasis,'Stale quality approval')).status;
    assert.equal(staleEqrDenial,409);
    assert.equal((await qualityAction('approve',q.material.basis,'Old response for new draft')).status,409);
    await run('partner','quality-response',{id:q.quality.notes[0].id,reason:'Checked the exact revised report'});
    const completedQuality=await qualityAction('approve',q.material.basis,'Reviewed significant judgments and exact draft');
    assert.equal(completedQuality.status,200);
    const qualityRecord=(await completedQuality.json()).quality;
    const eqrApproval=qualityRecord.approvals.at(-1), clearedEqrNote=qualityRecord.notes[0];
    assert.deepEqual([eqrApproval.by,eqrApproval.basis,eqrApproval.artifact,clearedEqrNote.cleared.basis],
      ['quality',q.material.basis,q.material.artifact.sha256,q.material.basis]);
    assert.ok(eqrApproval.at.slice(0,10)<=q.material.reportDate);
    state=await run('partner','authorize',{});
    assert.equal(state.authorized.current,true);
    assert.equal(state.authorized.artifactSha256,eqrApproval.artifact);
    const exactAuthorization=state.authorized;
    await run('partner','issue',{reference:'Before signature'},409);
    state=await run('partner','report-sign',{});
    assert.equal(state.release.signature.artifact,state.authorized.artifactSha256);
    state=await run('partner','issue',{reference:'Synthetic signed issue'});
    assert.equal((await run('partner','issue',{reference:'Retry same issue'})).archive.issue.at,state.archive.issue.at);
    await run('partner','archive-seal',{},409);
    const recipient=state.requestContacts[0].id;
    state=await run('partner','delivery-start',{recipient});
    const endpoint='/delivery/'+state.deliveryLink.token, sha=state.authorized.artifactSha256;
    await run('partner','delivery-start',{recipient},409);
    assert.equal((await service.fetch(endpoint,'',{sha256:sha,response:'Before download'})).status,409);
    const downloaded=await service.fetch(endpoint+'/artifact');
    assert.equal(downloaded.status,200);
    assert.equal(createHash('sha256').update(await downloaded.text()).digest('hex'),sha);
    assert.equal((await service.fetch(endpoint,'',{sha256:sha,response:'Received the exact signed report'})).status,200);
    assert.equal((await service.fetch(endpoint)).status,404);
    state=await run('partner','archive-seal',{});
    const archive=state.archive.packages[0];
    const denied=await current('reviewer');
    assert.equal(denied.archive.sealed,true);
    assert.deepEqual(denied.archive.packages,[]);
    await run('partner','archive-offer-custody',{package:archive.id,recipient:'Independent Custodian'});
    const custodian=await independent('custodian');
    const accept=(digest)=>service.fetch(scoped('/oversight/action',engagement),custodian,
      {action:'accept',package:archive.id,digest,reason:'Read the manifest and verified the exact archive'});
    assert.equal((await accept(archive.digest)).status,409);
    const bundle=await service.fetch(scoped('/oversight/download/'+archive.id,engagement),custodian);
    assert.equal(bundle.status,200);
    const bytes=await bundle.text();
    assert.equal(createHash('sha256').update(bytes).digest('hex'),archive.digest);
    const payload=JSON.parse(bytes);
    assert.equal(payload.issue.signature.artifact,sha);
    assert.equal(payload.deliveries[0].state,'received');
    assert.equal(payload.authorization.completion.evaluation.inputs.gross,4000);
    assert.equal(payload.authorization.completion.consultations[0].current,true);
    assert.deepEqual(payload.authorization.reviewNotes.find(row=>row.form===ppe.form).notes[0].decisions,clearedPpe.notes[0].decisions);
    assert.equal(payload.authorization.quality.current,true);
    assert.equal(payload.authorization.by,accounts.partner);
    assert.equal((await accept('0'.repeat(64))).status,409);
    assert.equal((await accept(archive.digest)).status,200);
    await service.close();
    service=await start(database);
    const reloaded=await fixture(service,false);
    state=await reloaded.view('partner',engagement);
    assert.equal(state.oversight.custody[0].accepted.digest,archive.digest);
    assert.equal(state.authorized.current,true);

    const proof=(id,actor,action,expected,actual,versions)=>({id,engagement,actor,action,expected,actual,versions});
    const returnedWork=['returned','submitted','reviewed',true];
    const actualReturnedWork=[returnedPpe.status,clearedPpe.status,reviewedPpe.status,reviewedPpe.notes[0].cleared];
    const staleWork=['changed',false,'reviewed',true];
    const actualStaleWork=[affected.status,staleConsultation.current,updatedRelated.status,updatedConsultation.current];
    const reviewVersions={first:firstPpeSubmission.version,final:reviewedPpe.reviewedVersion,note:note.id,evidence:replacement.id};
    const relatedVersions={first:earlier.reviewedVersion,replacement:updatedRelated.reviewedVersion,
      previousConsultation:firstConsultationReview.version,newConsultation:updatedConsultation.version};
    recordLifecycleEvidence(t,{lifecycle:'A25',engagement,steps:[
      proof('A25-P1-W1','partner','GET /api/pilot',
        [planned,0,true],[partnerPreparation.papers.map(p=>p.form).sort(),preparationGaps.length,
          partnerPreparation.papers.every(p=>p.version===p.reviewedVersion&&p.values.conclusion)],
        Object.fromEntries(partnerPreparation.papers.map(p=>[p.form,p.reviewedVersion]))),
      proof('A25-P1-W2','reviewer and partner','completion-consultation-record → completion-consultation-review',
        [consultationId,updatedRelated.version,'resolved',further],
        [prepared.consultations[0].id,prepared.consultations[0].paper,prepared.consultations[0].decision.result,prepared.consultations[0].advice.id],
        {consultation:updatedConsultation.version,paper:updatedRelated.reviewedVersion,advice:further}),
      proof('A25-P1-W3','preparer and partner','work-assign → submit → review',
        [accounts.preparer,accounts.partner,routed.version],
        [routed.submittedBy,assigned.assignmentHistory[0].reviewer,earlier.reviewedVersion],
        {work:earlier.id,submission:routed.version,assignment:assigned.assignmentHistory[0].at}),
      proof('A25-P2-W1','preparer and reviewer','return → request-reopen → upload → respond → submit → clear → review',
        [revisedConclusion,response,createHash('sha256').update(schedule).digest('hex'),true],
        [reviewedPpe.values.conclusion,reviewedPpe.notes[0].response,createHash('sha256').update(reviewedBytes).digest('hex'),reviewedPpe.notes[0].cleared],reviewVersions),
      proof('A25-P2-W2','reviewer and partner','completion-consultation-review',
        [true,'returned','resolved'],[/хориг/.test(deniedProhibition.error),returnedConsultation.decision.result,firstConsultationReview.decision.result],
        {id:consultationId,returned:returnedConsultation.version,resolved:firstConsultationReview.version,advice:further}),
      proof('A25-P2-W3','reviewer and partner','register approval → submit → review → completion-consultation-review',
        staleWork,actualStaleWork,relatedVersions),
      proof('A25-P3-W1','partner','review → authorize',
        ['reviewed',accounts.partner,eqrApproval.artifact],
        [partnerCompletion.status,payload.authorization.by,exactAuthorization.artifactSha256],
        {completion:partnerCompletion.reviewedVersion,authorization:exactAuthorization.at,artifact:exactAuthorization.artifactSha256}),
      proof('A25-P3-W2','quality','POST /api/pilot/oversight/action approve',
        ['quality',q.material.basis,q.material.artifact.sha256,true],
        [eqrApproval.by,eqrApproval.basis,eqrApproval.artifact,eqrApproval.at.slice(0,10)<=q.material.reportDate],
        {basis:eqrApproval.basis,approvedAt:eqrApproval.at,reportDate:q.material.reportDate,artifact:eqrApproval.artifact}),
      proof('A25-P3-W3','quality and partner','return → authorize denied → approve → authorize',
        [true,q.material.basis,true],[/4\.6/.test(blockedRelease.error),clearedEqrNote.cleared.basis,state.authorized.current],
        {note:clearedEqrNote.id,clearance:clearedEqrNote.cleared.at,authorization:state.authorized.at}),
    ],branches:[
      proof('review-return-and-resubmit','preparer and reviewer','return → respond → submit → clear → review',
        returnedWork,actualReturnedWork,reviewVersions),
      proof('unresolved-professional-difference','partner','completion-consultation-review',
        [true,'prohibited','returned'],[/хориг/.test(deniedProhibition.error),returnedConsultation.restriction,returnedConsultation.decision.result],
        {id:consultationId,version:returnedConsultation.version}),
      proof('material-change-stales-review','reviewer and partner','approve ownership change → reassess',
        staleWork,actualStaleWork,relatedVersions),
      proof('eqr-not-required','partner','quality-policy → authorize',
        ['not-required',false,0,false,true],[noEqr.oversight.quality.policy.mode,noEqr.oversight.quality.current,
          noEqr.oversight.quality.approvals.length,noEqr.gaps.some(gap=>gap.startsWith('4.6')),noEqrAuthorization.current],
        {policy:noEqr.oversight.quality.policy.version,authorization:noEqrAuthorization.at}),
      proof('eqr-ineligible','partner and quality','quality-policy → GET /api/pilot/oversight → authorize',
        ['ineligible',404,true],[ineligibleEqr.policy.eligibilityStatus,ineligibleEqr.access,/4\.6/.test(ineligibleEqr.denial.error)],
        {policy:ineligibleEqr.policy.version}),
      proof('eqr-stale-or-open-note','quality and partner','approve denied → quality-response → stale approve denied',
        [409,409,true],[openEqrDenial,staleEqrDenial,/4\.6/.test(blockedRelease.error)],
        {note:clearedEqrNote.id,initial:oldBasis,final:eqrApproval.basis}),
      proof('eqr-after-report-date','quality','POST /api/pilot/oversight/action approve',
        [priorDate,0,409],[lateMaterial.reportDate,lateMaterial.gaps.length,lateApproval.status],
        {basis:lateMaterial.basis,reportDate:lateMaterial.reportDate}),
    ]});
  } finally {
    if(service)await service.close();
    for(const suffix of ['', '-shm', '-wal'])await rm(database+suffix,{force:true});
    await rmdir(dir);
  }
});

test('approved materiality and its revision govern the same sample and misstatement evaluation', async t => {
  const dir=await mkdtemp(join(tmpdir(),'audit-materiality-'));
  const database=join(dir,'pilot.sqlite');
  let service;
  try {
    service=await start(database);
    const {cookies,scoped,view,write}=await fixture(service);
    const engagement=(await write('reviewer','firm','create',{...create,synthetic:'yes'})).selected;
    const run=(role,action,fields,status=200)=>write(role,engagement,action,fields,status);
    const paper=(state,form)=>state.papers.find(row=>row.form===form);
    const file=(name,text)=>({name,base64:Buffer.from(text).toString('base64')});
    await run('partner','activate',{assessment:'Synthetic acceptance',independence:'Reviewed',letter:'Agreed'});
    const form='3.1.2', requestFields={form,title:'Signed benchmark and asset schedule',due:'2026-03-31'};
    let state=await run('preparer','request',requestFields);
    const request=state.requests[0].id, part=state.requests[0].parts[0].id;
    const benchmark='revenue,current,prior\nRevenue,1000,900';
    state=await run('preparer','upload',{request,part,source:'Approved finance schedule',...file('benchmark.csv',benchmark)});
    const benchmarkFile=state.requests[0].parts[0].evidence;
    await run('preparer','accept',{request,part});
    state=await run('preparer','support-upload',{source:'Independent ledger control totals',...file('controls.csv','count,total\n2,100')});
    const control=state.evidence.find(row=>row.name==='controls.csv').id;
    await run('reviewer','support-assess',{id:control,result:'accepted',reason:'Matched independent ledger count and total'});
    const ledger=['id,account,amount,entity,date,currency',
      ['asset-a','1500','90',create.registration,'2025-02-01','MNT'].join(','),
      ['asset-b','1500','10',create.registration,'2025-02-02','MNT'].join(',')].join('\n');
    state=await run('preparer','population-import',{source:'Exact ledger export',currency:'MNT',...file('ledger.csv',ledger)});
    state=await run('preparer','population-reconcile',{version:String(state.population.current.version),count:'2',total:'100',
      source:'Independent ledger control',controlEvidence:control,mapping:'1500,PPE',statements:'PPE,100',use:'PPE sampling'});
    state=await run('reviewer','population-approve',{version:String(state.population.current.version),reason:'Verified exact population and PPE bridge'});
    const population=state.population.current.version;

    const basis={
      users:'Bank covenant team and minority owners',benchmarkMeasure:'revenue',alternatives:'Assets and normalized profit',
      benchmarkRationale:'Revenue tracks user decisions better than volatile profit',comparison:'prior-period',priorAmount:'900',
      priorReference:'Prior approved finance schedule',comparisonRationale:'Revenue trend verified against the approved comparative',
      unusualResults:'One-time asset disposal explains the unusual profit change',stability:'stable',
      stabilityRationale:'Revenue remained comparable after checking classification',evidence:benchmarkFile,
      specificDecision:'required',specificReason:'Asset-covenant disclosure matters to lenders',
      specific:[{form,scope:'Lender-sensitive PPE',amount:'15',performance:'9',rationale:'Covenant and disclosure sensitivity'}],
    };
    const materiality={form:'1.3',benchmark:'1000',percentage:'2',performance:'60',trivial:'5',
      benchmarkSource:'Signed finance schedule',execution:'Compared benchmark alternatives',conclusion:'Documented threshold choices'};
    const save=(amounts,basisFields,status=200)=>run('preparer','save',{...materiality,...amounts,materialityBasis:JSON.stringify(basisFields)},status);
    const missing=await save({percentage:''},basis,400);
    const badThreshold=await save({}, {...basis,specific:[{...basis.specific[0],performance:'15'}]},400);
    await save({}, {...basis,specific:[{...basis.specific[0],amount:'21'}]});
    const aboveOverall=await run('preparer','submit',{form:'1.3'},409);
    state=await save({},basis);
    assert.equal(paper(state,'1.3').materialityBasis.evidence.sha256,createHash('sha256').update(benchmark).digest('hex'));
    assert.equal(await (await service.fetch(scoped('/evidence/'+benchmarkFile,engagement),cookies.reviewer)).text(),benchmark);
    state=await run('preparer','submit',{form:'1.3'});
    const firstSubmission=paper(state,'1.3').version;
    const deniedSelfReview=await run('preparer','review',{form:'1.3'},403);
    state=await run('reviewer','return',{form:'1.3',reason:'Explain why the one-off does not distort revenue'});
    const reviewNote=paper(state,'1.3').notes[0].id;
    const updatedBasis={...basis,stabilityRationale:'One-time proceeds are outside revenue and the comparative classification agrees'};
    await save({conclusion:'Revenue excludes one-time disposal proceeds'},updatedBasis);
    await run('preparer','respond',{form:'1.3',note:reviewNote,response:'Added the classification check and linked the exact approved schedule'});
    state=await run('preparer','submit',{form:'1.3'});
    const reviewedVersion=paper(state,'1.3').version;
    const reviewBeforeClear=await run('reviewer','review',{form:'1.3'},409);
    await run('reviewer','clear',{form:'1.3',note:reviewNote,version:String(reviewedVersion),responseVersion:'1',reason:'Checked both versions and approved schedule'});
    state=await run('reviewer','review',{form:'1.3'});
    const initialApproval=paper(state,'1.3');
    assert.ok(initialApproval.history.some(row=>row.version===firstSubmission&&row.evidence.includes(benchmarkFile)));
    const reopenedSource=await run('reviewer','request-reopen',{request,part,reason:'Verify a fresh copy of the relied-upon schedule'});
    const staleBasis=paper(reopenedSource,'1.3');
    assert.deepEqual([staleBasis.status,staleBasis.materiality],['changed',null]);
    assert.ok(staleBasis.history.some(row=>row.version===initialApproval.version&&row.evidence.includes(benchmarkFile)));
    state=await run('preparer','upload',{request,part,source:'Reverified finance schedule',...file('benchmark-replacement.csv',benchmark)});
    const benchmarkReplacement=state.requests[0].parts[0].evidence;
    await run('preparer','accept',{request,part});
    await save({conclusion:'Reverified the replacement copy and kept the benchmark unchanged'},
      {...updatedBasis,evidence:benchmarkReplacement,revisionReason:'Original supporting file was reopened'});
    await run('preparer','submit',{form:'1.3'});
    state=await run('reviewer','review',{form:'1.3'});
    const approved=paper(state,'1.3');

    await run('preparer','save',{form:'2.6',execution:'Evaluated controls',conclusion:'Substantive approach',reliance:'none'});
    await run('preparer','submit',{form:'2.6'});
    state=await run('reviewer','review',{form:'2.6'});
    const controlsVersion=paper(state,'2.6').version;
    const design={form,line:'PPE',size:'2',seed:'3',purpose:'Inspect the exact approved ledger units'};
    state=await run('preparer','sample-design',design);
    const sampleVersion=state.samples[form].version, sampleFields={form,version:String(sampleVersion)};
    await run('reviewer','sample-approve',{...sampleFields,reason:'Approved the scoped performance threshold and population'});
    state=await run('preparer','sample-select',sampleFields);
    const selected=state.samples[form].selected;
    assert.deepEqual(selected.map(row=>row.id).sort(),['asset-a','asset-b']);
    await run('preparer','save',{form,execution:'Inspected both selected units',conclusion:'Retained the identified difference'});
    await run('preparer','sample-test',{...sampleFields,unit:'asset-a',result:'exception',amount:'13',detail:'Difference in asset cost',evidence:benchmarkReplacement});
    await run('preparer','sample-test',{...sampleFields,unit:'asset-b',result:'pass',amount:'0',detail:'Agreed to the schedule',evidence:benchmarkReplacement});
    await run('preparer','submit',{form});
    state=await run('reviewer','review',{form});
    const signedSample=paper(state,form).version;
    await run('partner','statements',{statements:'Signed synthetic statements',disclosures:'Synthetic disclosure'});
    state=await run('reviewer','completion-evaluate',{note:'The 13 difference is below the approved specific threshold of 15'});
    const evalVersion=state.completion.evaluation.version;
    state=await run('partner','completion-evaluation-approve',{version:String(evalVersion),reason:'Independently checked the scoped threshold and amount'});
    const oldEvaluation=state.completion.evaluation, sampleBasis=state.samples[form].basis;
    assert.equal(oldEvaluation.current,true);

    const reducedBasis={...updatedBasis,specific:[{...basis.specific[0],amount:'12',performance:'7'}],
      unusualResults:'New information reduced expected revenue',stability:'adjusted',stabilityRationale:'Recalculated against updated evidence'};
    const revisedSchedule='revenue,current,prior\nRevenue,800,900';
    state=await run('preparer','support-upload',{source:'Corrected finance export',...file('revised-benchmark.csv',revisedSchedule)});
    const revisedFile=state.evidence.find(row=>row.name==='revised-benchmark.csv').id;
    await run('reviewer','support-assess',{id:revisedFile,result:'accepted',reason:'Matched the corrected finance export'});
    const noReason=await save({benchmark:'800'},{...reducedBasis,evidence:revisedFile},400);
    state=await save({benchmark:'800'},{...reducedBasis,evidence:revisedFile,revisionReason:'Approved corrected revenue and tighter covenant scope'});
    const staleState=state;
    assert.equal(paper(staleState,form).status,'changed');
    assert.equal(paper(staleState,'2.6').reviewedVersion,controlsVersion);
    assert.equal(staleState.samples[form].current,false);
    assert.deepEqual(staleState.samples[form].selected,selected);
    assert.equal(staleState.samples[form].version,sampleVersion);
    assert.equal(staleState.completion.evaluation.current,false);
    const staleSampleDenial=await run('preparer','sample-select',sampleFields,409);
    await run('preparer','submit',{form:'1.3'});
    state=await run('reviewer','review',{form:'1.3'});
    const revised=paper(state,'1.3'), impact=state.impacts.find(row=>row.source==='1.3'&&row.targets.includes(form));
    assert.ok(impact.targets.includes('4.4'));
    await run('reviewer','resolve-impact',{id:impact.id,reason:'Require a new PPE sample design and reevaluate the recorded difference'});
    state=await run('reviewer','completion-evaluate',{note:'The 13 difference now exceeds the specific threshold of 12'});
    const newEvalVersion=state.completion.evaluation.version;
    state=await run('partner','completion-evaluation-approve',{version:String(newEvalVersion),reason:'Approved the updated numerical comparison'});
    const newEvaluation=state.completion.evaluation;
    assert.deepEqual(state.completion.evaluationHistory.map(row=>row.version),[evalVersion]);
    assert.ok(paper(state,form).history.some(row=>row.version===signedSample&&row.action==='Хянаж батлав'));

    const reopened=(await run('reviewer','request-reopen',{request,part,reason:'Earlier source version needs replacement'})).requests[0];
    assert.equal(reopened.parts[0].state,'rejected');
    assert.equal(paper(await view('reviewer',engagement),'1.3').reviewedVersion,revised.version);
    await service.close();
    service=await start(database);
    const restarted=await fixture(service,false);
    const retained=await restarted.view('reviewer',engagement);
    assert.equal(paper(retained,'1.3').reviewedVersion,revised.version);
    assert.equal(retained.completion.evaluation.current,true);

    const proof=(id,actor,action,expected,actual,versions)=>{
      assert.deepEqual(actual,expected,id);
      return {id,engagement,actor,action,expected,actual,versions};
    };
    const versions={work:approved.version,evidence:approved.materialityBasis.evidence.sha256};
    recordLifecycleEvidence(t,{lifecycle:'A08',engagement,steps:[
      proof('A08-P1-W1','preparer','save 1.3',[basis.users,'revenue',basis.alternatives],
        [approved.materialityBasis.users,approved.materialityBasis.benchmarkMeasure,approved.materialityBasis.alternatives],versions),
      proof('A08-P1-W2','preparer','save comparative and stability assessment',[900,basis.unusualResults,'stable',updatedBasis.stabilityRationale],
        [approved.materialityBasis.priorAmount,approved.materialityBasis.unusualResults,approved.materialityBasis.stability,approved.materialityBasis.stabilityRationale],versions),
      proof('A08-P1-W3','preparer','save benchmark rationale with accepted source',[basis.benchmarkRationale,benchmarkReplacement],
        [approved.materialityBasis.benchmarkRationale,approved.materialityBasis.evidence.id],versions),
      proof('A08-P2-W1','preparer','calculate overall and performance',[20,12],[approved.materiality.overall,approved.materiality.performance],versions),
      proof('A08-P2-W2','preparer','set scoped PPE materiality',[form,15,9],
        approved.materiality.specific.map(row=>[row.form,row.amount,row.performance])[0],versions),
      proof('A08-P2-W3','preparer','set clearly trivial threshold',1,approved.materiality.trivial,versions),
      proof('A08-P3-W1','reviewer and partner','review exact 1.3 and independently approve threshold-dependent evaluation',
        [reviewedVersion,'cleared','partner'],[initialApproval.reviewedVersion,initialApproval.notes[0].decisions[0].result,oldEvaluation.approval.by],
        {...versions,evaluation:evalVersion}),
      proof('A08-P3-W2','preparer and reviewer','sample-design → sample-approve → completion-evaluate',
        [approved.version,9,15,1300,false],[sampleBasis.materiality,sampleBasis.performance,oldEvaluation.inputs.specific[0].amount,
          oldEvaluation.inputs.specific[0].gross,oldEvaluation.inputs.specific[0].thresholdMet],
        {work:approved.version,population,sample:sampleVersion,evaluation:evalVersion}),
      proof('A08-P3-W3','preparer, reviewer and partner','revise basis → assess impact → approve new evaluation',
        [16,12,true,true],[revised.materiality.overall,newEvaluation.inputs.specific[0].amount,newEvaluation.inputs.specific[0].thresholdMet,retained.completion.evaluation.current],
        {old:approved.version,revised:revised.version,evaluation:newEvalVersion,impact:impact.id}),
    ],branches:[
      proof('missing-benchmark-inputs','preparer','reject missing explicit percentage',true,missing.error.includes('percentage'),{work:approved.version}),
      proof('invalid-scoped-threshold','preparer','reject invalid specific and overall limits',[true,true],
        [/Тусгай гүйцэтгэлийн/.test(badThreshold.error),/Материаллаг байдлын/.test(aboveOverall.error)],{work:approved.version}),
      proof('return-and-independent-review','preparer and reviewer','self review and review before note clearance denied',[true,true],
        [!!deniedSelfReview.error,!!reviewBeforeClear.error],{first:firstSubmission,final:approved.version,note:reviewNote}),
      proof('revision-reopens-dependent-work','preparer and reviewer','preserve selection and refuse stale approval',[true,false,false,true],
        [noReason.error.includes('шалтгаан'),staleState.samples[form].current,staleState.completion.evaluation.current,!!staleSampleDenial.error],
        {old:approved.version,revised:revised.version,sample:sampleVersion}),
      proof('reopened-benchmark-evidence','reviewer','stale the relied-upon source and preserve a separately approved replacement',
        ['changed',null,'rejected',true],[staleBasis.status,staleBasis.materiality,reopened.parts[0].state,retained.completion.evaluation.current],
        {prior:benchmarkFile,replacement:revisedFile,work:revised.version}),
    ]});
  } finally {
    if(service)await service.close();
    for(const suffix of ['', '-shm', '-wal'])await rm(database+suffix,{force:true});
    await rmdir(dir);
  }
});
