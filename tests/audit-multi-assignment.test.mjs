import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {planningFixture} from './helpers/pilot-planning-fixture.mjs';
import {start,firm,today,assessmentFields,decision} from './helpers/pilot-acceptance-fixture.mjs';
import {canReviewWork} from '../src/lib/workspace.ts';
import {unzipSync,strFromU8} from 'fflate';
import {DatabaseSync} from 'node:sqlite';

async function fixture(fn,normal=false){
 const dir=await mkdtemp(join(tmpdir(),'audit-b02-'));let app;
 try{
  app=await start(join(dir,'case.sqlite'),true);const seed=normal?await planningFixture(app):null,people=seed?.people??await firm(app);
  for(const [key,capacity] of [['preparer2','preparer'],['reviewer2','reviewer']]){
   const person=await app.register('firm','M01-F03',{name:'Fictional named '+key,reference:'B02-'+key,status:'active',account:capacity,availableFrom:'2020-01-01',availableTo:'2099-12-31',capacityHours:'10000'});
   const credential=await app.register('firm','M01-F04',{person,qualification:'Synthetic audit credential',sector:'Test',skill:'Audit',issuer:'Fictional issuer',validity:'dated',validFrom:'2020-01-01',validTo:'2099-12-31',source:'Actual synthetic source inspection'});
   const appointment=await app.register('firm','M01-F06',{person,role:'Fictional '+capacity,capacity,employment:'employee',from:'2020-01-01',to:'2099-12-31',basis:'Explicit synthetic appointment'});
   people[key]={person,credential,appointment};
  }
  const create=async registration=>{const id=(await app.write('reviewer','firm','create',{client:'B02 fictional '+registration,legalForm:'Test',registration,framework:'Test',contact:'Finance',email:'fixture@example.test',start:'2025-01-01',end:'2025-12-31',reportDate:'2026-12-31'})).selected;
   await app.write('partner',id,'activate',{assessment:'Synthetic accepted',independence:'Synthetic assessed',letter:'Synthetic agreed'});return id;};
  const id=seed?.id??await create('B02-A'),other=await create('B02-B');
  const forms=['F-MULTI001','F-MULTI002'];
  for(const form of forms){const body={id:form,title:'B02 exact contribution test',stage:1,sheet:'Fixture',fields:[{key:'reference',label:'Actual reference',type:'text',required:true}]};
   await app.write('reviewer','firm','template-save',{form,body:JSON.stringify(body)});await app.write('reviewer','firm','template-submit',{form,note:'Synthetic authored template'});await app.write('partner','firm','template-publish',{form,note:'Different publisher checked exact synthetic template'});await app.write('reviewer',id,'form-use',{form,version:'1'});
  }
  for(const scope of [id,other])for(const [key,person] of Object.entries(people))if(!(normal&&scope===id&&!key.endsWith('2')))await app.register(scope,'M04-F06',{capacity:key.replace('2',''),...person,assignmentDate:'2026-01-01',assignmentEnd:'2028-12-31',hours:'100',needs:'Actual fictional scoped work',result:'suitable',basis:'Compared exact credentials and appointment'});
  for(const scope of [id,other])if(!(normal&&scope===id))await app.write('partner',scope,'staffing-enable');
  const call=async(path,cookie,data,status=200)=>{const response=await app.request(path,cookie,data),body=await response.json();assert.equal(response.status,status,path+' '+JSON.stringify(body));return {body,cookie:response.headers.get('set-cookie')?.split(';')[0]};};
  const boot=await call('/identity/bootstrap',app.cookies.partner,{code:'G01-fixture-only',username:'b02.partner',name:'B02 partner',staff:people.partner.person,reason:'Actual synthetic administrator'},201);
  const users={partner:boot.body.account.id},cookies={};
  await call('/identity/activate','',{token:boot.body.activationToken,password:'123'});
  cookies.partner=(await call('/login','',{username:'b02.partner',password:'123'})).cookie;
  for(const [key,p] of Object.entries(people)){
   if(key==='partner')continue;
   const invited=await call('/identity/manage',cookies.partner,{operation:'invite',username:'b02.'+key,name:'Fictional '+key,staff:p.person,capacity:key.replace('2',''),firmAccess:'yes',reason:'Actual named synthetic account'});users[key]=invited.body.account.id;const token=invited.body.activationToken;
   await call('/identity/activate','',{token,password:'123'});cookies[key]=(await call('/login','',{username:'b02.'+key,password:'123'})).cookie;
  }
  for(const key of Object.keys(people))for(const scope of [id,other])await call('/identity/manage',cookies.partner,{operation:'grant',subject:users[key],engagement:scope,first:today(),last:'2028-12-31',reason:'Explicit person-specific multi-engagement grant'});
  const view=async(key,scope=id)=>(await call('?engagement='+scope,cookies[key])).body;
  const write=async(key,action,fields={},status=200,scope=id)=>(await call('/action?engagement='+scope,cookies[key],{revision:(await view(key,scope)).revision,action,fields},status)).body;
  await fn({app,id,other,people,forms,users,cookies,call,view,write,database:join(dir,'case.sqlite'),seed});
 }finally{await app?.close();await rm(dir,{recursive:true,force:true});}
}

test('B02 several named preparers and reviewers preserve authorship, explicit handoffs and independent final review',async()=>{
 await fixture(async({id,other,forms,users,people,view,write})=>{
  const form=forms[0],paper=v=>v.papers.find(p=>p.form===form);
  assert.equal((await view('partner')).identity.people.filter(p=>p.role==='preparer'&&p.scope.includes(id)).length,2);
  assert.ok((await view('preparer2',other)).engagement.active,'Same person holds a second scoped engagement');
  await write('partner','work-assign',{form,owner:'preparer',reviewer:users.reviewer,reason:'Ambiguous role is not a named assignment'},409);
  let state=await write('partner','work-assign',{form,owner:users.preparer,reviewer:users.reviewer,contributors:JSON.stringify([users.preparer2]),reviewers:JSON.stringify([users.reviewer2]),expectedAssignmentRevision:'0',reason:'Explicit many-person work scope'});
  assert.deepEqual(new Set(paper(state).contributors),new Set([users.preparer,users.preparer2]));
  const digest=paper(state).template.digest;
  await write('preparer2','save',{form,templateDigest:digest,answers:JSON.stringify({reference:'Initial contribution by second preparer'})});
  await write('preparer','save',{form,templateDigest:digest,answers:JSON.stringify({reference:'Final combined answer with retained contribution history'})});
  await write('preparer2','submit',{form},403);
  await write('preparer','submit',{form},409);
  for(const key of ['preparer','reviewer','reviewer2'])await write(key,'work-acknowledge',{form,assignmentRevision:'1',reason:'Read exact current work, responsibilities and unresolved notes'});
  await write('preparer','work-acknowledge',{form,assignmentRevision:'0',reason:'Stale acknowledgement'},409);
  await write('preparer','submit',{form});
  state=await write('reviewer2','return',{form,anchor:'reference',reason:'Retain explicit corroborating source'});
  const note=paper(state).notes.at(-1);assert.equal(note.author,users.reviewer2);
  await write('preparer2','respond',{form,note:note.id,response:'Actual contributor explains the source; no review authority is inferred'});
  state=await write('preparer','submit',{form});const submitted=paper(state),response=submitted.notes.at(-1).responses.at(-1);
  await write('preparer2','clear',{form,note:note.id,version:String(submitted.version),responseVersion:String(response.version),reason:'Own contribution cannot clear'},403);
  await write('reviewer2','clear',{form,note:note.id,version:String(submitted.version),responseVersion:String(response.version),reason:'Actual independent note author checked the response'});
  await write('reviewer2','review',{form},403);
  state=await write('reviewer','review',{form});assert.equal(paper(state).reviewedVersion,paper(state).version);
  assert.deepEqual(new Set(paper(state).preparationAuthors),new Set([users.preparer,users.preparer2]));
  assert.ok(paper(state).history.some(h=>h.by===users.preparer2));
  await write('partner','planning-enable',{reason:'Enable actual named-worker time evidence'});
  state=await write('preparer2','effort-log',{from:'2026-11-18T01:00:00Z',through:'2026-11-18T02:00:00Z',work:form,purpose:'Actual second named preparer worked one hour'});
  assert.equal(state.planning.effort.at(-1).person,people.preparer2.person,'Same-capacity workers never inherit the first seat identity');
  assert.equal((await view('preparer')).planning.effort.length,0,'Private individual time remains scoped');
  const proxyFields={worker:people.preparer2.person,timeZone:'Asia/Ulaanbaatar',from:'2026-11-18T03:00:00Z',through:'2026-11-18T04:00:00Z',work:form,purpose:'Actual one-hour work recorded by an authorized proxy',proxyReason:'Actual synthetic worker confirmation and current senior authority'};
  await write('preparer','effort-log',proxyFields,403);
  state=await write('reviewer','effort-log',proxyFields);const proxy=state.planning.effort.at(-1);assert.equal(proxy.person,people.preparer2.person);assert.equal(proxy.by,users.reviewer);assert.equal(proxy.proxy.forPerson,people.preparer2.person);
  assert.equal((await view('preparer2')).planning.effort.filter(e=>e.current).length,2,'Actual worker sees own proxy-recorded time');
  state=await write('reviewer','effort-log',{...proxyFields,from:'2026-11-18T03:00:00Z',through:'2026-11-18T04:30:00Z',supersedes:proxy.id,reason:'Actual source confirms a 90-minute interval'});assert.equal(state.planning.effort.find(e=>e.id===proxy.id).current,false);assert.equal(state.planning.effort.at(-1).minutes,90);
  state=await write('preparer2','effort-log',{timeZone:'Asia/Ulaanbaatar',from:'2025-12-31T16:00:00Z',through:'2025-12-31T16:30:00Z',work:form,purpose:'Actual work on first local appointment day'});assert.deepEqual(state.planning.effort.at(-1).calendarDates,{from:'2026-01-01',through:'2026-01-01'});
  await write('partner','work-assign',{form,owner:users.reviewer2,reviewer:users.preparer2,contributors:'[]',reviewers:'[]',reason:'Former substantive author cannot review the retained work'},409);
 });
});

test('B02 selected multi-item transfer is atomic, stale assignments fail and one revocation leaves other members active',async()=>{
 await fixture(async({forms,users,cookies,call,view,write,id})=>{
  const before=await view('partner'),work=v=>v.papers.filter(p=>forms.includes(p.form)).map(p=>({form:p.form,owner:p.owner,reviewer:p.reviewer,revision:p.assignmentRevision??0}));
  const valid={form:forms[0],owner:users.preparer,reviewer:users.reviewer,contributors:'[]',reviewers:'[]',expectedAssignmentRevision:'0'};
  await write('partner','work-transfer',{items:JSON.stringify([valid,{...valid,form:forms[1],reviewer:'U-not-granted'}]),reason:'Last invalid target must roll back every item'},403);
  assert.deepEqual(work(await view('partner')),work(before));
  let state=await write('partner','work-transfer',{items:JSON.stringify([valid,{...valid,form:forms[1],owner:users.preparer2}]),reason:'Transfer only the selected open work'});
  assert.ok(work(state).every(w=>w.revision===1));
  await write('partner','work-assign',{...valid,reason:'Stale per-work revision'},409);
  const directory=(await call('/identity/directory',cookies.partner)).body;
  const grant=directory.grants.find(g=>g.subject===users.preparer&&g.engagement===id&&!g.revoked);
  await call('/identity/manage',cookies.partner,{operation:'revoke',subject:users.preparer,grant:grant.id,reason:'Actual single-person scope revocation'});
  await call('?engagement='+id,cookies.preparer,undefined,404);
  assert.equal((await view('preparer2')).identity.id,users.preparer2,'Revoking first preparer preserves another named preparer');
  await call('/template/'+forms[0]+'?engagement='+id,cookies.preparer,undefined,404);
  state=await write('partner','work-assign',{...valid,owner:users.preparer2,expectedAssignmentRevision:'1',reason:'Reassign future work after departure'});
  assert.equal(state.papers.find(p=>p.form===forms[0]).owner,users.preparer2);
 });
});

test('B02 daily capacity alternatives are exclusive, stale commits fail and hidden commitments stay anonymous',async()=>{
 await fixture(async({id,other,people,users,forms,cookies,call,view,write})=>{
  const person=people.preparer2.person,date=today(),firm=(key='reviewer')=>view(key,'firm');
  const save=(action,data,status=200)=>write('reviewer',action,{...data,reason:'Explicit actual fictional planning decision'},status,'firm');
  const calendar={person,date,timeZone:'Asia/Ulaanbaatar',dayMinutes:'1440',schedule:JSON.stringify([[540,1020]]),unavailable:JSON.stringify([[600,720],[690,780]]),authority:'Actual fictional elapsed-minute calendar, overlapping leave deducted once'};
  let state=await save('capacity-calendar',calendar);assert.equal(state.capacity.rows[0].availableMinutes,300);
  await save('capacity-allocation',{person,date,engagement:id,minutes:'180'});
  await save('capacity-allocation',{person,date,engagement:other,minutes:'150'},409);
  state=await save('capacity-allocation',{person,date,engagement:other,minutes:'120'});assert.equal(state.capacity.rows[0].plannedMinutes,300);
  const original=state.capacity.allocations.find(a=>a.engagement===id);
  const alternative=async(minutes,name)=>save('capacity-scenario-save',{name,removeIds:JSON.stringify([original.id]),add:JSON.stringify([{id:crypto.randomUUID(),person,date,engagement:id,minutes}]),...(name==='Alternative 1'&&{transfers:JSON.stringify([{engagement:id,form:forms[0],owner:users.preparer2,reviewer:users.partner,expectedAssignmentRevision:'0'}])})});
  await alternative(120,'Alternative 1');state=await alternative(150,'Alternative 2');
  assert.deepEqual(state.capacity.scenarios.map(s=>s.preview.rows[0].plannedMinutes),[240,270]);
  const selected=state.capacity.scenarios[0],otherAlternative=state.capacity.scenarios[1];
  state=await save('capacity-scenario-commit',{id:selected.id,digest:selected.digest});assert.equal(state.capacity.rows[0].plannedMinutes,240);
  assert.equal((await view('partner')).papers.find(p=>p.form===forms[0]).owner,users.preparer2,'Selected planned allocation and explicit work/queue handoff commit together');
  await save('capacity-scenario-commit',{id:otherAlternative.id,digest:otherAlternative.digest},409);
  const directory=(await call('/identity/directory',cookies.partner)).body,grant=directory.grants.find(g=>g.subject===users.reviewer2&&g.engagement===other&&!g.revoked);
  await call('/identity/manage',cookies.partner,{operation:'revoke',subject:users.reviewer2,grant:grant.id,reason:'Limit planning visibility to the first client'});
  const hidden=(await firm('reviewer2')).capacity;assert.equal(JSON.stringify(hidden).includes(other),false);assert.equal(hidden.hiddenCommitments[0].minutes,120);
  const freshOriginal=(await firm()).capacity.allocations.find(a=>a.engagement===id);
  state=await save('capacity-scenario-save',{name:'Calendar-sensitive alternative',removeIds:JSON.stringify([freshOriginal.id]),add:JSON.stringify([{id:crypto.randomUUID(),person,date,engagement:id,minutes:60}])});
  const fresh=state.capacity.scenarios.at(-1);await save('capacity-calendar',{...calendar,unavailable:'[]'});
  await save('capacity-scenario-commit',{id:fresh.id,digest:fresh.digest},409);
  const baseline=(await firm()).capacity.allocations;
  state=await save('capacity-scenario-save',{name:'Assignment-sensitive alternative',removeIds:JSON.stringify([freshOriginal.id]),add:JSON.stringify([{id:crypto.randomUUID(),person,date,engagement:id,minutes:60}]),transfers:JSON.stringify([{engagement:id,form:forms[0],owner:users.preparer,reviewer:users.reviewer,expectedAssignmentRevision:'1'}])});
  const scoped=state.capacity.scenarios.at(-1);
  await write('partner','work-assign',{form:forms[1],owner:users.reviewer2,reviewer:users.partner,contributors:'[]',reviewers:'[]',reason:'Intervening engagement work revision'});
  await save('capacity-scenario-commit',{id:scoped.id,digest:scoped.digest},409);
  assert.deepEqual((await firm()).capacity.allocations,baseline,'A stale work preview cannot partially change allocations');
  await write('preparer','capacity-calendar',{...calendar,reason:'Preparer cannot issue firm capacity authority'},403,'firm');
 });
});

test('B02 an engagement with two participating capacities does not require a phantom third team member',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'audit-b02-two-'));let app;
 try{
  app=await start(join(dir,'case.sqlite'),true);const people=await firm(app);
  const id=(await app.write('reviewer','firm','create',{client:'Two-person fixture',registration:'B02-TWO',legalForm:'Test',framework:'Test',contact:'Finance',email:'two@example.test',start:'2025-01-01',end:'2025-12-31',reportDate:'2026-12-31',includePreparer:'no'})).selected;
  await app.write('partner',id,'activate',{assessment:'Synthetic acceptance',independence:'Synthetic independence',letter:'Synthetic terms'});
  for(const role of ['reviewer','partner'])await app.register(id,'M04-F06',{capacity:role,...people[role],assignmentDate:'2026-01-01',assignmentEnd:'2028-12-31',hours:'100',needs:'Two actual distinct audit participants',result:'suitable',basis:'Explicit different preparer/reviewer scopes'});
  const state=await app.write('partner',id,'staffing-enable');assert.deepEqual(state.staffing.members,['partner','reviewer']);assert.deepEqual(state.staffing.gaps,[]);assert.equal(state.staffing.seats.filter(s=>s.current).length,2);
  const assigned=await app.write('partner',id,'work-assign',{form:'3.1.2',owner:'reviewer',reviewer:'partner',reason:'Senior prepares and separate partner reviews'});assert.notEqual(assigned.papers.find(p=>p.form==='3.1.2').owner,assigned.papers.find(p=>p.form==='3.1.2').reviewer);
 }finally{await app?.close();await rm(dir,{recursive:true,force:true});}
});

test('B02 credential originals, manual evidence states and issuer checks stay separate',async()=>{
 await fixture(async({app,id,people,users,cookies,view,write})=>{
  const bytes=Buffer.from('%PDF-1.4\n% Synthetic qualification facts for API tests, not a real credential\n%%EOF');
  let state=await write('reviewer','credential-document-upload',{person:people.preparer2.person,name:'synthetic-qualification.pdf',base64:bytes.toString('base64'),source:'Explicit synthetic source owner',reason:'Preserve the supplied synthetic original'},200,'firm');
  const document=state.credentialDocuments.at(-1);assert.equal(document.status,'received');
  await write('reviewer','credential-document-inspect',{id:document.id,result:'accepted',reason:'Uploader cannot independently inspect own submission'},403,'firm');
  await write('partner','credential-document-inspect',{id:document.id,result:'accepted',reason:'Different actual synthetic person inspected the exact bytes; no issuer verification claimed'},200,'firm');
  const response=await app.request('/credential-document/'+document.id+'?engagement=firm',cookies.reviewer);assert.equal(response.status,200);assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes);
  assert.equal((await app.request('/credential-document/'+document.id+'?engagement='+id,cookies.reviewer)).status,403);
  assert.equal((await app.request('/credential-document/'+document.id+'?engagement=firm',cookies.preparer)).status,403);
  const base={person:people.preparer2.person,qualification:'Synthetic professional designation',sector:'Test',skill:'Audit',issuer:'Fictional issuer',validity:'dated',validFrom:'2020-01-01',validTo:'2099-12-31',source:'Actual synthetic evidence register',credentialType:'designation',credentialId:'SYNTHETIC-007',credentialDocument:document.id,verificationState:'file-reviewed',authorityStatus:'unknown'};
  const save=async values=>{const before=new Set((await view('reviewer','firm')).registers.map(r=>r.id)),saved=await write('reviewer','register',{kind:'M01-F04',operation:'save',...Object.fromEntries(Object.entries(values).map(([k,v])=>['field.'+k,v]))},200,'firm');return saved.registers.find(r=>!before.has(r.id)).id;};
  const credential=await save(base);await write('reviewer','register',{kind:'M01-F04',id:credential,operation:'submit'},200,'firm');
  await write('reviewer','register',{kind:'M01-F04',id:credential,operation:'approve',reason:'Same actual author cannot approve'},403,'firm');
  state=await write('partner','register',{kind:'M01-F04',id:credential,operation:'approve',reason:'Authorized different actual partner inspected the exact record and manual file basis'},200,'firm');
  assert.equal(state.registers.find(r=>r.id===credential).values.verificationState,'file-reviewed');
  const invalid=await save({...base,verificationState:'externally-verified'});
  await write('reviewer','register',{kind:'M01-F04',id:invalid,operation:'submit'},409,'firm');
  const missingAuthority=await save({...base,verificationState:'',authorityStatus:'current',practiceScope:'Statutory audit',verificationSource:''});
  await write('reviewer','register',{kind:'M01-F04',id:missingAuthority,operation:'submit'},409,'firm');
  assert.notEqual(document.by,users.partner);
 });
});

test('B02 manual specialist packets freeze only selected originals and keep actual dispatch, receipt and unaccepted return distinct',async()=>{
 await fixture(async({app,id,other,cookies,view,write})=>{
  const recipient=await app.register('firm','M01-F03',{name:'Fictional external lawyer',reference:'B02-LAWYER',status:'external'});
  const upload=async(name,content,accept=true)=>{let s=await write('reviewer','support-upload',{name,source:'Exact fictional audit source',base64:Buffer.from(content).toString('base64')});const file=s.evidence.at(-1).id;if(accept)await write('partner','support-assess',{id:file,result:'accepted',reason:'Different actual synthetic auditor inspected the exact evidence'});return file;};
  const content='Selected fictional contract and explicit disclosure authority';
  const chosen=await upload('selected-contract.csv',content),hidden=await upload('unselected-client-file.csv','This must never enter a specialist export');
  const contribution=await app.register(id,'M06-F05',{type:'auditor-expert',area:'Legal contract interpretation',reliance:'Legal expertise only; audit conclusions remain with the team',test:'Send the exact selected contract',evidence:chosen,limitations:'Returned opinion and its adequacy remain pending',effect:'Investigate actual legal implications',partyName:'Fictional external lawyer',suitability:'Competence, capability, objectivity and confidentiality assessed in this synthetic fixture',evaluation:'Agreed scope, assumptions and the eventual adequacy criteria; no return evaluated yet',result:'limited',followup:'Receive original opinion and independently evaluate it'});
  const timestamp=ms=>new Date(ms).toISOString().slice(0,19)+'Z';
  let state=await write('reviewer','specialist-packet-create',{contribution,recipientPerson:recipient,recipientOrganization:'Fictional law firm',recipientContact:'lawyer@example.test',purpose:'Interpret this selected contract only',scope:'One selected document; no audit-opinion authority',selection:JSON.stringify([{id:chosen,version:1}]),agreement:chosen,disclosure:chosen,notBefore:timestamp(Date.now()-60000),expiresAt:timestamp(Date.now()+3600000),reason:'Actual bounded synthetic manual handoff'});
  const packet=state.specialistPackets.at(-1),extra={id:packet.id,digest:packet.digest};
  const exportPacket=async(scope=id,status=200)=>{const response=await app.request('/specialist-packet-export?engagement='+scope,cookies.reviewer,{...extra,revision:(await view('reviewer',scope)).revision,reason:'Export the exact authorized copies for approved manual handling'});assert.equal(response.status,status);return response;};
  await exportPacket(id,409);
  await write('reviewer','specialist-packet-authorize',{...extra,recipientCheck:'Actual recipient identity and mandate checked',confidentiality:'Reviewed explicit disclosure authority, agreement and approved secure channel requirement',reason:'Senior authorizes the exact frozen packet'});
  const exported=unzipSync(new Uint8Array(await (await exportPacket()).arrayBuffer()));
  assert.deepEqual(Object.keys(exported).sort(),['documents/01_selected-contract.csv','manifest.json']);assert.equal(strFromU8(exported['documents/01_selected-contract.csv']),content);
  assert.equal(JSON.stringify(Object.keys(exported)).includes(hidden),false);assert.equal(JSON.parse(strFromU8(exported['manifest.json'])).recipient.person,recipient);
  await exportPacket(other,404);
  await write('preparer','specialist-packet-revoke',{...extra,reason:'Preparer cannot revoke a senior sharing mandate',providerAction:'No external action'},403);
  await write('reviewer','specialist-packet-dispatch',{...extra,evidence:chosen,sentAt:timestamp(Date.now()),channel:'Fictional approved recipient-restricted service',approvedChannelBasis:'Actual synthetic channel policy inspected; this test sends nothing externally',result:'unknown',reason:'Manual outcome is unconfirmed'});
  await write('reviewer','specialist-packet-dispatch',{...extra,evidence:chosen,sentAt:timestamp(Date.now()),channel:'Fixture',approvedChannelBasis:'Fixture',result:'dispatched',reason:'Unreconciled resend must fail'},409);
  await write('reviewer','specialist-packet-reconcile',{...extra,evidence:chosen,result:'dispatched',reason:'Actual manual record was checked; no automated provider receipt inferred'});
  state=await write('reviewer','specialist-packet-receipt',{...extra,evidence:chosen,receivedAt:timestamp(Date.now()),recipientConfirmation:'Actual fictional recipient confirmation recorded',reason:'Separate manual receipt record'});
  assert.equal(state.specialistPackets.at(-1).status,'received');assert.equal(state.specialistPackets.at(-1).automaticDelivery,false);
  await write('reviewer','specialist-packet-revoke',{...extra,reason:'End future outbound sharing',providerAction:'Provider access revocation still requires the actual channel owner; local future exports denied'});
  await exportPacket(id,409);
  const returned=await upload('returned-legal-opinion.csv','Actual fictional received legal opinion; audit acceptance pending',false);
  state=await write('reviewer','specialist-packet-return',{...extra,evidence:returned,receivedAt:timestamp(Date.now()),actualSender:'Fictional external lawyer via the approved manual channel',channel:'Fictional approved manual receipt',reason:'Receive original without reopening revoked outbound access'});
  assert.equal(state.specialistPackets.at(-1).returns.at(-1).evidenceAcceptance,'received');assert.equal(state.specialistPackets.at(-1).returns.at(-1).adequacyEvaluation,'pending');assert.equal(state.evidence.find(e=>e.id===returned).status,'received');
 });
});

test('B02 budget and effort comparisons use exact historical daily scope and disclose provisional actuals',async()=>{
 await fixture(async({database,id,forms,people,view,write})=>{
  const person=people.preparer2.person,yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10),todayDate=today();
  await write('partner','planning-enable',{reason:'Enable actual time for named capacity comparison'});
  await write('preparer2','effort-log',{from:yesterday+'T01:00:00Z',through:yesterday+'T02:00:00Z',work:forms[0],purpose:'One actual hour recorded by the second named preparer'});
  const save=(action,data,status=200)=>write('reviewer',action,{...data,reason:'Exact scoped historical planning fixture'},status,'firm');
  await save('capacity-calendar',{person,date:yesterday,timeZone:'Asia/Ulaanbaatar',dayMinutes:'1440',schedule:'[[0,480]]',unavailable:'[]',authority:'Fictional supported prior calendar'});
  await save('capacity-allocation',{person,date:yesterday,engagement:id,minutes:'240'},409);
  // Seed a genuine prior-plan fixture, not a runtime command that fabricates past planning.
  const db=new DatabaseSync(database),s=JSON.parse(db.prepare('SELECT body FROM pilot_capacity_state WHERE id=1').get().body);
  s.allocations.push({id:'fixture-prior-commitment',person,date:yesterday,engagement:id,minutes:240,by:'prior-fixture-manager',at:yesterday+'T00:00:00+08:00'});s.revision++;
  db.prepare('UPDATE pilot_capacity_state SET body=? WHERE id=1').run(JSON.stringify(s));db.close();
  const budget={person,engagement:id,from:yesterday,through:yesterday,authority:'Explicit fictional approved budget source'};
  await save('capacity-budget',{...budget,minutes:'600'});let state=await save('capacity-budget',{...budget,minutes:'720'}),current=state.capacity.budgets.at(-1);
  const fields={budget:current.id,from:yesterday+'T00:00:00+08:00',cutoff:todayDate+'T00:00:00+08:00',timeZone:'Asia/Ulaanbaatar',coverage:'partial',remainingEstimate:'480'};
  state=await save('capacity-variance',fields);const result=state.capacity.variances.at(-1).output;
  assert.equal(result.recordedMinutes,60);assert.equal(result.actualMinutes,null);assert.equal(result.provisional,true);assert.equal(result.varianceMinutes,-180);assert.equal(result.variancePercent,-75);assert.equal(result.budgetDeltaMinutes,120);assert.equal(result.forecastMinutes,540);assert.equal(result.forecastVarianceMinutes,-180);
  await save('capacity-variance',{...fields,cutoff:yesterday+'T12:00:00+08:00'},409);
  await save('capacity-variance',{...fields,coverage:'unsubmitted'},400);
  assert.equal((await view('reviewer','firm')).capacity.budgets.length,2,'Original and revised budget versions remain available');
 });
});

test('B02 normal accepted engagement requires each added named contributor own current independence record',async()=>{
 await fixture(async({people,users,forms,view,write,seed})=>{
  const form=forms[0],assignment={form,owner:users.preparer,reviewer:users.reviewer,contributors:JSON.stringify([users.preparer2]),reviewers:JSON.stringify([users.reviewer2]),reason:'Real standard-profile many-person assignment'};
  await write('partner','work-assign',assignment,409);
  for(const key of ['preparer2','reviewer2']){
   const before=new Set((await view('reviewer')).registers.map(r=>r.id));
   let s=await write('reviewer','register',{kind:'M04-F04',operation:'save','field.assignee':key.replace('2',''),'field.person':people[key].person,'field.scope':'Financial statement audit of G01-CLIENT, 2025-01-01 through 2025-12-31','field.due':'2028-12-31'});
   const row=s.registers.find(r=>!before.has(r.id)).id;
   await write(key,'register',{kind:'M04-F04',id:row,operation:'declare',reason:'My actual synthetic personal independence declaration',signedOn:today(),disposition:'none'});
   await write('reviewer','register',{kind:'M04-F04',id:row,operation:'submit'});
   await write('reviewer','register',{kind:'M04-F04',id:row,operation:'approve',reason:'Different actual person evaluated the exact named declaration'});
  }
  await write('preparer','acceptance-assess',assessmentFields(seed.evidence));
  let reassessed=await write('preparer','acceptance-submit');
  await write('reviewer','acceptance-review',{version:String(reassessed.acceptance.assessment.version),recommendation:'accept',reason:'Actual synthetic reviewer reassesses the added named resources and current declarations'});
  await write('partner','acceptance-decide',decision(seed.evidence));
  const state=await write('partner','work-assign',assignment);assert.equal(state.papers.find(p=>p.form===form).contributors.length,2);
 },true);
});
