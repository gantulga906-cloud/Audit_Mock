import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,mkdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {DatabaseSync,backup} from 'node:sqlite';
import {start,firm,today} from './helpers/pilot-acceptance-fixture.mjs';
import {withIdentity} from '../scripts/pilot-identity-context.mjs';
import {acceptanceActor} from '../scripts/pilot-acceptance.mjs';
import {operationsView} from '../scripts/pilot-operations.mjs';
import {recoveryManifest,rehearseRecovery} from '../scripts/pilot-recovery.mjs';
import {migrationInventory,rehearseOperations} from '../scripts/pilot-operations-rehearsal.mjs';
const proof=[];let root;
const observe=(name,actual)=>proof.push({name,actual});
before(async()=>{root=await mkdtemp(join(tmpdir(),'audit-g09-'));});
after(async()=>{if(process.env.AUDIT_G09_FIXTURE_DIR){await mkdir(resolve(process.env.AUDIT_G09_FIXTURE_DIR),{recursive:true});await writeFile(join(resolve(process.env.AUDIT_G09_FIXTURE_DIR),'G09_Assertions.json'),JSON.stringify(proof,null,2)+'\n');}await rm(root,{recursive:true,force:true});});
async function fixture(fn){
 const dir=await mkdtemp(join(root,'case-')),database=join(dir,'local.sqlite'),app=await start(database,true);
 const call=async(path,cookie,data,status=200)=>{const r=await app.request(path,cookie,data),body=await r.json();assert.equal(r.status,status,path+' '+JSON.stringify(body));return {body,cookie:r.headers.get('set-cookie')?.split(';')[0]};};
 try{
  const people=await firm(app);
  const create=registration=>app.write('reviewer','firm','create',{client:'G09 fictional '+registration,legalForm:'Test',registration,framework:'Test',contact:'Test contact',email:'test@example.test',start:'2025-01-01',end:'2025-12-31',reportDate:'2026-12-31'});
  const id=(await create('G09-A')).selected,other=(await create('G09-B')).selected;
  await app.write('partner',id,'activate',{assessment:'Actual synthetic G09 acceptance',independence:'Fictional independent capacity evidence',letter:'Actual local fixture agreement'});
  for(const role of ['preparer','reviewer','partner'])await app.register(id,'M04-F06',{capacity:role,...people[role],assignmentDate:'2026-01-01',assignmentEnd:'2028-12-31',hours:'100',needs:'Explicit scoped preparation/review',result:'suitable',basis:'Checked synthetic credentials and capacity for the complete local grant window'});
  const boot=await call('/identity/bootstrap',app.cookies.partner,{code:'G01-fixture-only',username:'g09.partner',name:'G09 named partner',staff:people.partner.person,reason:'Explicit local pilot administrator appointment'},201);
  await call('/identity/activate','',{token:boot.body.activationToken,password:'123'});
  const login=await call('/login','',{username:'g09.partner',password:'123'}),cookies={partner:login.cookie},users={partner:boot.body.account.id};
  for(const role of ['preparer','reviewer']){const invited=await call('/identity/manage',cookies.partner,{operation:'invite',username:'g09.'+role,name:'G09 named '+role,staff:people[role].person,capacity:role,firmAccess:'yes',reason:'Actual named local work capacity'});users[role]=invited.body.account.id;await call('/identity/activate','',{token:invited.body.activationToken,password:'123'});cookies[role]=(await call('/login','',{username:'g09.'+role,password:'123'})).cookie;}
  const manage=data=>call('/identity/manage',cookies.partner,{...data,reason:'Actual G09 scoped local appointment'});
  for(const role of ['preparer','reviewer','partner'])await manage({operation:'grant',subject:users[role],engagement:id,first:today(),last:'2028-12-31'});
  const view=async(role,scope=id,status=200)=>(await call('?engagement='+scope,cookies[role],undefined,status)).body;
  const write=async(role,action,fields={},status=200)=>{const state=await view(role);return (await call('/action?engagement='+id,cookies[role],{revision:state.revision,action,fields},status)).body;};
  await fn({app,database,people,id,other,call,cookies,users,manage,view,write,boot,create});
 }finally{await app.close();}
}

test('G09 named local activation and explicit grants preserve legacy actors and prevent role-title access',async()=>{
 await fixture(async({app,id,other,call,cookies,users,view,write,boot,database})=>{
  assert.equal((await view('reviewer')).identity.id,users.reviewer);assert.deepEqual((await view('reviewer','firm')).portfolio.map(e=>e.id),[id]);await view('reviewer',other,404);
  await call('/identity/activate','',{token:boot.body.activationToken,password:'123'},401);
  await call('/identity/directory',app.cookies.partner,undefined,403);await call('/identity/manage',cookies.reviewer,{operation:'status',subject:users.preparer,status:'suspended',reason:'Role title is not admin authority'},403);
  const before=(await app.view('reviewer',id)).papers.find(p=>p.form==='3.1.2');assert.equal(before.owner,'nomin');
  let s=await write('partner','work-assign',{form:'3.1.2',owner:'reviewer',reviewer:'partner',reason:'Explicitly reassign future work to actual named people'});let p=s.papers.find(p=>p.form==='3.1.2');assert.equal(p.owner,users.reviewer);assert.equal(p.reviewer,users.partner);
  s=await write('reviewer','save',{form:'3.1.2',execution:'Actual named preparer work',conclusion:'Actual separately reviewable conclusion'});p=s.papers.find(p=>p.form==='3.1.2');assert.ok(p.history.some(h=>h.by===users.reviewer));assert.equal(s.activity[0].by,users.reviewer);
  await write('reviewer','review',{form:'3.1.2'},403);
  const db=new DatabaseSync(database,{readOnly:true}),m=JSON.parse(db.prepare('SELECT body FROM pilot_engagements WHERE id=?').get(id).body);db.close();assert.equal(m.runtimeIdentity,undefined);assert.ok(m.activity.some(a=>a.by==='temuulen'));assert.ok(m.activity.some(a=>a.by===users.reviewer));
  const reader=new DatabaseSync(database,{readOnly:true}),records=JSON.parse(reader.prepare('SELECT records FROM pilot_firm WHERE id=1').get().records);reader.close();const staff=(await view('reviewer')).identity.staff,actual=records.find(r=>r.id===staff),different={...structuredClone(actual),id:'F-DIFFERENT',values:{...actual.values,name:'Different staff member with the same capacity'}};assert.equal(withIdentity({id:users.reviewer,staff},()=>acceptanceActor({pilotRecords:[different,...records]},'reviewer')).id,staff);
  observe('local-identity-and-explicit-future-reassignment',{individualActors:true,legacyHistoryPreserved:true,otherEngagementDenied:true,nonAdminDenied:true,selfReviewDenied:true});
 });
});

test('G09 grant revocation suspension departure and relabeling cover every team resource without rewriting history',async()=>{
 await fixture(async({app,id,other,call,cookies,users,manage,view,write,database})=>{
  await write('partner','work-assign',{form:'3.1.2',owner:'reviewer',reviewer:'partner',reason:'Actual named ownership'});await write('reviewer','save',{form:'3.1.2',execution:'Preserved exact answer 0007',conclusion:'Preserved signed numeric -0.50'});
  const before=JSON.stringify((await view('partner')).papers.find(p=>p.form==='3.1.2'));
  await manage({operation:'label',subject:users.reviewer,name:'Renamed display only'});assert.equal(JSON.stringify((await view('partner')).papers.find(p=>p.form==='3.1.2')),before);
  const directory=(await call('/identity/directory',cookies.partner)).body,grant=directory.grants.find(g=>g.subject===users.reviewer);
  await manage({operation:'revoke',subject:users.reviewer,grant:grant.id});assert.ok(!(await view('reviewer','firm')).portfolio.some(e=>e.id===id));
  for(const endpoint of ['', '/workpaper-search','/template/3.1.2','/evidence/00000000-0000-4000-8000-000000000001','/report','/authorizations'])await call(endpoint+'?engagement='+id,cookies.reviewer,undefined,404);
  for(const endpoint of ['/action','/workpaper-export-preview','/workpaper-export'])await call(endpoint+'?engagement='+id,cookies.reviewer,endpoint==='/action'?{action:'save',revision:0,fields:{form:'3.1.2'}}:{selection:'[]'},404);
  await manage({operation:'status',subject:users.preparer,status:'suspended'});assert.deepEqual(await view('preparer',id),{setup:false});await call('/login','',{username:'g09.preparer',password:'123'},401);
  await manage({operation:'status',subject:users.reviewer,status:'departed'});assert.deepEqual(await view('reviewer','firm'),{setup:false});await call('/identity/manage',cookies.partner,{operation:'reinvite',subject:users.reviewer,reason:'Cannot reuse departed person'},409);
  assert.equal(JSON.stringify((await view('partner')).papers.find(p=>p.form==='3.1.2')),before);
  const db=new DatabaseSync(database);db.prepare('UPDATE pilot_identity_grants SET last=? WHERE subject=?').run('2020-01-01',users.partner);db.close();await view('partner',id,404);
  observe('revocation-across-team-surfaces',{scopedEndpoints:9,sessionRevoked:true,departurePreservesAnswers:true,expiryEnforced:true});
 });
});

test('G09 queues drill through exact populations preserve review notes and disclose unknown dates without external notification',async()=>{
 await fixture(async({id,view,write,users})=>{
  await write('partner','work-assign',{form:'3.1.2',owner:'reviewer',reviewer:'partner',reason:'Actual dashboard next owner'});
  await write('reviewer','task-add',{title:'Exact linked task',assignee:'reviewer',due:'2020-01-01',form:'3.1.2'});
  let s=await view('reviewer'),ops=s.operations,metric=ops.metrics.find(m=>m.id==='overdue-assigned');assert.ok(metric.count>=1);assert.equal(metric.count,metric.rows.length);assert.ok(metric.rows.every(id=>ops.queue.some(r=>r.id===id&&r.overdue&&r.assigned)));assert.equal(ops.notifications.externalEmailSent,false);
  const task=s.delivery.tasks.find(t=>t.title==='Exact linked task');const paperBefore=JSON.stringify(s.papers.find(p=>p.form==='3.1.2'));await write('reviewer','task-status',{id:task.id,done:'yes'});s=await view('reviewer');assert.equal(JSON.stringify(s.papers.find(p=>p.form==='3.1.2')),paperBefore);assert.ok(!s.operations.queue.some(r=>r.id===task.id));
  const p=s.papers.find(p=>p.form==='3.1.2'),m={schema:2,person:users.reviewer,engagement:id,engagements:[{id,team:{reviewer:users.reviewer}}],runtimePeople:[{id:users.reviewer,role:'reviewer'}],bench:{access:{}}};
  const returned={...p,status:'returned',due:'2026-02-30',notes:[{id:'note-actual',author:users.partner,text:'Actual returned reason',cleared:false}],editable:true};const payload={revision:7,papers:[returned],delivery:{tasks:[]}},v=operationsView(m,payload,'2026-11-18T06:00:00.000Z');assert.equal(v.queue[0].owner,users.reviewer);assert.equal(v.queue[0].reason,'Actual returned reason');assert.equal(v.metrics.find(m=>m.id==='unknown-dates').count,1);assert.equal(v.metrics.find(m=>m.id==='overdue-assigned').count,0);assert.match(v.progress.meaning,/not an audit-risk/);
  observe('exact-queue-and-metric-definitions',{drillThroughReconciles:true,taskCloseLeavesWorkUntouched:true,unknownDateNotOverdue:true,returnedReasonAndOwner:true,externalSent:false});
 });
});

test('G09 supported backup restores named users grants history and exact records while credentials remain private',async()=>{
 await fixture(async({database,users,id,manage,view,cookies})=>{
  const source=recoveryManifest(database),{result}=await rehearseRecovery(database,join(root,'restore-'+users.partner));assert.equal(result.verified,true);assert.deepEqual(result.sourceManifest,result.restoredManifest);
  const restored=await start(join(root,'restore-'+users.partner,'restored.sqlite'));
  try{const r=await restored.request('/login','',{username:'g09.reviewer',password:'123'});assert.equal(r.status,200);const body=await r.json();assert.equal(body.identity.id,users.reviewer);assert.ok(body.portfolio.some(e=>e.id===id));}finally{await restored.close();}
  if(process.env.AUDIT_G09_FIXTURE_DIR){const out=resolve(process.env.AUDIT_G09_FIXTURE_DIR);await mkdir(out,{recursive:true});const db=new DatabaseSync(database,{readOnly:true});try{await backup(db,join(out,'g09-ready.sqlite'));}finally{db.close();}await writeFile(join(out,'g09-fixture.json'),JSON.stringify({database:join(out,'g09-ready.sqlite'),engagement:id,users,credentials:{username:'g09.partner',password:'123'}}));}
  observe('named-recovery',{verified:result.verified,namedIdentityPreserved:true,scopePreserved:true});
 });
});

test('G09 actual named preparation independent return response clearance and review retain exact actor identities',async()=>{
 await fixture(async({id,call,cookies,users,write,view})=>{
  const form='F-G09LOCAL',body={id:form,title:'G09 actual fictional local work contract',stage:1,sheet:'Actual local fixture',clauses:[{text:'Exact fixed fixture clause',source:'G09 fixture'}],fields:[{key:'reference',label:'Actual exact reference',type:'text',required:true}]};
  const firmWrite=async(role,action,fields)=>{const state=(await call('?engagement=firm',cookies[role])).body;return (await call('/action?engagement=firm',cookies[role],{action,fields,revision:state.revision})).body;};
  await firmWrite('reviewer','template-save',{form,body:JSON.stringify(body)});await firmWrite('reviewer','template-submit',{form,note:'Exact named author submits fictional local test contract'});await firmWrite('partner','template-publish',{form,note:'Different named partner independently inspects exact test contract'});
  let state=await write('reviewer','form-use',{form,version:'1'}),p=state.papers.find(p=>p.form===form),templateDigest=p.template.digest;
  await write('reviewer','save',{form,templateDigest,answers:JSON.stringify({reference:'0007'})});await write('reviewer','submit',{form});await write('reviewer','review',{form},403);
  state=await write('partner','return',{form,anchor:'reference',reason:'Actual named review needs the dated source reference'});let note=state.papers.find(p=>p.form===form).notes.find(n=>!n.cleared);assert.equal(note.author,users.partner);
  await write('reviewer','task-add',{title:'Follow up returned work',assignee:'reviewer',form,due:today()});state=await view('reviewer');const task=state.delivery.tasks.find(t=>t.title==='Follow up returned work');await write('reviewer','task-status',{id:task.id,done:'yes'});assert.equal((await view('reviewer')).papers.find(p=>p.form===form).notes.find(n=>n.id===note.id).cleared,false);
  const returned=(await view('reviewer')).operations.queue.find(q=>q.form===form&&q.kind==='workpaper');assert.equal(returned.owner,users.reviewer);assert.equal(returned.reason,note.text);assert.equal(returned.target.record,id+'/'+form);
  await write('reviewer','save',{form,templateDigest,answers:JSON.stringify({reference:'INV-0007 dated 2026-11-18'})});await write('reviewer','respond',{form,note:note.id,response:'Actual named preparer inspected the original and supplied its exact date'});state=await write('reviewer','submit',{form});p=state.papers.find(p=>p.form===form);note=p.notes.find(n=>n.id===note.id);
  await write('partner','clear',{form,note:note.id,version:String(p.version),responseVersion:String(note.responses.at(-1).version),reason:'Named note author independently compared the exact current response'});state=await write('partner','review',{form});p=state.papers.find(p=>p.form===form);assert.equal(p.reviewedVersion,p.version);assert.equal(p.submittedBy,users.reviewer);assert.equal(p.history[0].by,users.partner);assert.equal(p.notes[0].responses[0].by,users.reviewer);assert.equal(p.notes[0].decisions[0].by,users.partner);
  observe('named-professional-review-cycle',{preparedBy:users.reviewer,returnedBy:users.partner,responseBy:users.reviewer,clearedBy:users.partner,reviewedBy:users.partner,taskCloseDidNotClearNote:true});
 });
});

test('G09 independent named capacity requires explicit person appointment and remains outside team and unrelated files',async()=>{
 await fixture(async({app,id,other,people,call,cookies,manage})=>{
  const independent={};for(const capacity of ['quality','custodian']){
   const staff=await app.register('firm','M01-F03',{name:'G09 independent '+capacity,reference:'G09-'+capacity,status:'active',account:capacity});await app.register('firm','M01-F06',{person:staff,role:'Independent '+capacity,capacity,employment:'employee',from:'2020-01-01',to:'2099-12-31',basis:'Actual separate independent fixture appointment'});
   const invited=await manage({operation:'invite',username:'g09.'+capacity,name:'G09 independent '+capacity,staff,capacity});await call('/identity/activate','',{token:invited.body.activationToken,password:'123'});const login=await call('/oversight/login','',{role:capacity,username:'g09.'+capacity,password:'123'});assert.deepEqual(login.body.assignments,[]);independent[capacity]={id:invited.body.account.id,staff,cookie:login.cookie};
   await call('/identity/manage',cookies.partner,{operation:'grant',subject:invited.body.account.id,engagement:id,first:today(),last:'2028-12-31',reason:'A capacity alone is insufficient'},409);await call('/action',independent[capacity].cookie,{action:'save',revision:0,fields:{form:'3.1.2'}},401);
  }
  await app.write('partner',id,'quality-policy',{mode:'required',reference:'Actual formal EQR requirement in fictional fixture',basis:'Independent appointment does not prepare or supervise the team',reviewer:independent.quality.staff,eligibility:'Actually inspected separate source',eligibilityStatus:'eligible'});
  await manage({operation:'grant',subject:independent.quality.id,engagement:id,first:today(),last:'2028-12-31'});
  const state=(await call('/oversight?engagement='+id,independent.quality.cookie)).body;assert.equal(state.selected,id);assert.equal(state.assignments.length,1);assert.ok(!('papers' in state));
  const returned=(await call('/oversight/action?engagement='+id,independent.quality.cookie,{action:'return',basis:state.material.basis,reason:'Actual independent quality concern on the exact available package'})).body;assert.equal(returned.quality.notes.at(-1).by,independent.quality.id);
  await call('/oversight?engagement='+other,independent.quality.cookie,undefined,404);await call('/oversight/download/00000000-0000-4000-8000-000000000001?engagement='+id,independent.quality.cookie,undefined,404);
  await manage({operation:'status',subject:independent.quality.id,status:'suspended'});await call('/oversight?engagement='+id,independent.quality.cookie,undefined,401);
  observe('named-independent-capacities',{qualityNamed:true,custodianNamed:true,capacityAloneDenied:true,qualityConcernAttributed:true,otherEngagementDenied:true,unrelatedFileDenied:true,suspensionEnforced:true});
 });
});

test('G09 unknown local adapter outcomes require exact reconciliation before retry and never imply external effects',async()=>{
 await fixture(async({app,id,other,write,view,users})=>{
  const evidence=await app.file(id,'Actual fictional exact payload source 0007'),receipt=await app.file(id,'Actual local conformance receipt says the timed-out trial had no effect');
  let state=await write('reviewer','external-prepare',{logicalKey:'G09-operation-0007',kind:'erp',evidence,payload:JSON.stringify({reference:'0007',amount:'-0.50'}),reason:'Explicit exact local adapter trial'}),job=state.externalEffects.at(-1);
  assert.equal(job.by,users.reviewer);assert.equal(job.provider,'local-conformance');await write('reviewer','external-approve',{id:job.id,digest:job.digest,reason:'Cannot self approve'},403);
  state=await write('partner','external-approve',{id:job.id,digest:job.digest,reason:'Different actual named partner approves exact bytes and payload'});await write('partner','external-attempt',{id:job.id,digest:'wrong',outcome:'succeeded',reason:'Wrong hash'},409);
  state=await write('partner','external-attempt',{id:job.id,digest:job.digest,outcome:'unknown',reason:'Trial timeout after attempted operation'});job=state.externalEffects.at(-1);assert.equal(job.state,'unknown');await write('partner','external-attempt',{id:job.id,digest:job.digest,outcome:'succeeded',reason:'Unsafe blind retry'},409);await write('reviewer','external-prepare',{logicalKey:job.logicalKey,kind:'erp',evidence,payload:'{}',supersedes:job.id,reason:'Cannot hide unknown operation'},409);
  await write('partner','external-reconcile',{id:job.id,digest:job.digest,outcome:'failed',receipt,reason:'Actual local receipt confirms no effect'});state=await write('partner','external-attempt',{id:job.id,digest:job.digest,outcome:'succeeded',reason:'Retry after known no-effect reconciliation'});job=state.externalEffects.at(-1);assert.equal(job.attempts.length,2);assert.equal(job.attempts[0].reconciliation.outcome,'failed');assert.equal(job.attempts[1].externalEffect,false);assert.equal(job.attempts[0].providerOperation,job.attempts[1].providerOperation);
  state=await write('reviewer','external-prepare',{logicalKey:job.logicalKey,kind:'erp',evidence,payload:JSON.stringify({reference:'INV-0007 correction'}),supersedes:job.id,reason:'Preserve prior exact operation while correcting payload'});assert.equal(state.externalEffects.length,2);assert.notEqual(state.externalEffects[1].digest,job.digest);assert.equal(state.externalEffects[0].attempts.length,2);assert.equal((await app.view('reviewer',other)).externalEffects.length,0);
  observe('local-adapter-correlation-and-reconciliation',{externalEffect:false,attempts:2,unknownRetryDenied:true,exactPayloadApproved:true,correctionPreservesPrior:true,scopePreserved:true});
 });
});

test('G09 copy migration rollback restore and bounded workload preserve meaningful data without approving production targets',async()=>{
 await fixture(async({database,users,write})=>{
  await write('partner','work-assign',{form:'3.1.2',owner:'reviewer',reviewer:'partner',reason:'Meaningful named prior ownership for migration'});await write('reviewer','save',{form:'3.1.2',execution:'Actual prior work 0007',conclusion:'Exact prior conclusion -0.50'});
  const before=migrationInventory(database),result=await rehearseOperations({source:database,targetDirectory:join(root,'ops-'+users.partner),credentials:{username:'g09.reviewer',password:'123'},requests:12,concurrency:2});assert.deepEqual(migrationInventory(database),before);assert.equal(result.migrationPreserved,true);assert.equal(result.rollbackCopyPreserved,true);assert.equal(result.recoveryVerified,true);assert.equal(result.workload.failures,0);assert.equal(result.workload.targetMet,undefined);assert.equal(result.releaseReady,false);
  if(process.env.AUDIT_G09_FIXTURE_DIR){await mkdir(resolve(process.env.AUDIT_G09_FIXTURE_DIR),{recursive:true});await writeFile(join(resolve(process.env.AUDIT_G09_FIXTURE_DIR),'G09_Operations_Receipt.json'),JSON.stringify(result,null,2)+'\n');}
  observe('five-operational-families',{bootstrap:true,copyMigration:true,rollback:true,restore:true,boundedReads:12,approvedWorkloadTarget:false,deployed:false,releaseReady:false});
 });
});

test('G09 explicit shared-team closure expires old sessions while named local accounts retain only their dated grants',async()=>{
 await fixture(async({app,id,other,call,cookies,manage,view})=>{
  await manage({operation:'legacy-policy',policy:'disabled'});assert.deepEqual(await app.view('preparer',id),{setup:false});await call('/login','',{role:'partner',password:'G01-fixture-partner'},401);assert.equal((await view('partner')).identity.name,'G09 named partner');await view('partner',other,404);
  await manage({operation:'legacy-policy',policy:'enabled'});await call('/login','',{role:'partner',password:'G01-fixture-partner'});observe('explicit-shared-entrance-cutover',{legacyTeamClosed:true,oldSessionInvalid:true,namedScopeRetained:true,reversiblePolicy:true});
 });
});
