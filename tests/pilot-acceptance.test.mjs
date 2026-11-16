import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {createServer} from 'node:http';
import {mkdtemp,rm,mkdir,writeFile,copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createPilot} from '../scripts/pilot-server.mjs';
import {acceptanceChecks} from '../src/lib/pilot-acceptance.ts';
import {recordLifecycleEvidence} from '../scripts/pilot-lifecycle-evidence.mjs';

const passwords={preparer:'G01-fixture-preparer',reviewer:'G01-fixture-reviewer',partner:'G01-fixture-partner'};
const today=()=>new Date().toISOString().slice(0,10);
const dates={start:'2025-01-01',end:'2025-12-31',reportDate:'2026-12-31'};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
async function start(database,setup=false){
 const pilot=createPilot({database,setupCode:'G01-fixture-only'}),server=createServer((req,res)=>void pilot.handle(req,res,new URL(req.url,'http://127.0.0.1')));
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const origin='http://127.0.0.1:'+server.address().port;
 const request=(path,cookie,data)=>fetch(origin+'/api/pilot'+path,{method:data===undefined?'GET':'POST',headers:{...(cookie&&{Cookie:cookie}),...(data!==undefined&&{'Content-Type':'application/json',Origin:origin})},body:data===undefined?undefined:JSON.stringify(data)});
 const cookies={};
 try{
  if(setup)assert.equal((await request('/setup','',{code:'G01-fixture-only',...passwords})).status,201);
  for(const role of Object.keys(passwords)){const r=await request('/login','',{role,password:passwords[role]});assert.equal(r.status,200);cookies[role]=r.headers.get('set-cookie').split(';')[0];}
  const path=(route,id)=>route+'?engagement='+id;
  const view=async(role,id,status=200)=>{const r=await request(path('',id),cookies[role]);assert.equal(r.status,status);return r.json();};
  const write=async(role,id,action,fields={},status=200,extra={})=>{
   const revision=(await view(role,id)).revision,r=await request(path('/action',id),cookies[role],{action,fields,revision,...extra}),result=await r.json();
   assert.equal(r.status,status,action+' '+JSON.stringify(result.error));return result;
  };
  const register=async(scope,kind,values,owner='reviewer',approver='partner')=>{
   const fields=Object.fromEntries(Object.entries(values).map(([key,value])=>['field.'+key,value]));
   const before=new Set((await view(owner,scope)).registers.map(row=>row.id));
   const saved=await write(owner,scope,'register',{kind,operation:'save',...fields}),id=saved.registers.find(row=>!before.has(row.id)).id;
   await write(owner,scope,'register',{kind,id,operation:'submit'});await write(approver,scope,'register',{kind,id,operation:'approve',reason:'Independent fixture evidence review'});return id;
  };
  const file=async(id,content='Synthetic G01 acceptance facts, rule editions, signed authority and agreement')=>{
   const bytes=Buffer.from(content),saved=await write('reviewer',id,'support-upload',{name:'G01-fixture.csv',source:'Fictional source owner / test policy',base64:bytes.toString('base64')}),evidence=saved.evidence.at(-1).id;
   await write('partner',id,'support-assess',{id:evidence,result:'accepted',reason:'Compared exact fixture content, actor, client and period'});return evidence;
  };
  return {cookies,path,request,view,write,register,file,async close(){await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));pilot.close();}};
 }catch(error){await new Promise(resolve=>server.close(resolve));pilot.close();throw error;}
}
async function firm(app){
 await app.register('firm','M01-F01',{name:'G01 fictional firm',licence:'TEST-ONLY',reporting:'G01 audit test',contact:'firm@example.test'});
 const people={};
 for(const role of ['preparer','reviewer','partner']){
  const person=await app.register('firm','M01-F03',{name:'Named fixture '+role,reference:'G01-'+role,status:'active',account:role,
   availableFrom:'2020-01-01',availableTo:'2099-12-31',capacityHours:'10000'});
  const credential=await app.register('firm','M01-F04',{person,qualification:'Synthetic audit credential',sector:'Test',skill:'Audit',issuer:'Fictional test issuer',validity:'dated',validFrom:'2020-01-01',validTo:'2099-12-31',source:'Inspected test qualification'});
  const appointment=await app.register('firm','M01-F06',{person,role:'Fictional appointed '+role,capacity:role,employment:'employee',from:'2020-01-01',to:'2099-12-31',basis:'Fictional dated appointment'});
  people[role]={person,credential,appointment};
 }
 return people;
}
async function enquiry(app,origin='client',clientId=''){
 const saved=await app.write('preparer','firm','intake-save',{company:'G01 fictional client',origin,service:'Financial statement audit',contact:'Finance contact',email:'finance@example.test',clientId,facts:'Known service; period/framework initially unknown',nextOwner:'reviewer',intendedUsers:'Fictional owners and board'});
 return saved.intake.enquiries[0];
}
async function convert(app,client,contact,draft,period=dates,prior=''){
 await app.write('preparer','firm','intake-forward',{id:draft.id,note:'Assess the actual available facts'});
 const packet={action:'intake-convert',fields:{id:draft.id,clientId:client,contactId:contact,...period,prior,note:'Confirmed exact current client context'},revision:(await app.view('reviewer','firm')).revision,idempotencyKey:randomUUID()};
 const response=await app.request(app.path('/action','firm'),app.cookies.reviewer,packet),result=await response.json();assert.equal(response.status,200,JSON.stringify(result));
 return {id:result.selected,packet,state:result};
}
async function client(app){
 const saved=await app.write('reviewer','firm','client-save',{name:'G01 fictional client',registration:'G01-CLIENT',legalForm:'ХХК',framework:'Test framework 1',industry:'Test',bodies:'Board',note:'Client-supplied dated source'});
 const id=saved.intake.clients[0].id;
 const updated=await app.write('reviewer','firm','client-contact',{id,name:'Actual fixture director',email:'director@example.test',capacity:'Authorized client director',body:'Board',signer:'yes',effective:'2020-01-01',source:'Fictional signed board authority',note:'Record capacities without granting software access'});
 return {id,contact:updated.intake.clients[0].profile.contacts[0].id};
}
async function setupEngagement(app,people,clientId,contact,draft,period=dates,prior=''){
 const converted=await convert(app,clientId,contact,draft,period,prior),id=converted.id,evidence=await app.file(id);
 assert.equal(converted.state.acceptance.profile,1);assert.equal(converted.state.engagement.active,false);
 await app.register(id,'M03-F04',{name:'Fictional owner',registration:'G01-OWNER',relation:'owner',share:'100',effective:'2025-01-01',source:'Dated fictional ownership list',basis:'Client-supplied fact; no automatic verification or canonical consolidation'});
 await app.register(id,'M04-F02',{concern:'Integrity background',source:'Fictional named records',evidence,owner:'reviewer',result:'none',basis:'Actual synthetic inquiries recorded; no automatic inference'});
 const declarations={};
 for(const role of ['preparer','reviewer','partner']){
  await app.register(id,'M04-F06',{capacity:role,...people[role],assignmentDate:'2026-01-01',assignmentEnd:'2028-12-31',hours:'100',needs:'Explicit scoped preparation/review',result:'suitable',basis:'Checked synthetic credentials and available hours'});
  const before=new Set((await app.view('preparer',id)).registers.map(row=>row.id));
  const saved=await app.write('preparer',id,'register',{kind:'M04-F04',operation:'save','field.assignee':role,'field.person':people[role].person,'field.scope':'Audit of '+period.start+' through '+period.end,'field.due':'2026-12-31'});
  const row=saved.registers.find(row=>!before.has(row.id)).id;declarations[role]=row;
  if(role!=='preparer')await app.write('preparer',id,'register',{kind:'M04-F04',id:row,operation:'declare',reason:'Cannot sign for another person',signedOn:today(),disposition:'none'},403);
  await app.write(role,id,'register',{kind:'M04-F04',id:row,operation:'declare',reason:'My exact fictional independence statement for this engagement and period',signedOn:today(),disposition:'none'});
  await app.write('preparer',id,'register',{kind:'M04-F04',id:row,operation:'submit'});
  await app.write(role,id,'register',{kind:'M04-F04',id:row,operation:'approve',reason:'Self approval'},403);
  await app.write(role==='partner'?'reviewer':'partner',id,'register',{kind:'M04-F04',id:row,operation:'approve',reason:'Independently evaluated the exact named declaration'});
 }
 return {...converted,evidence,declarations};
}
function assessmentFields(evidence,kind='initial',overrides={}){
 return {kind,assessmentScope:'Financial statement audit for the identified period',requirement:'Fictional approved engagement policy; local statutory applicability needs actual owner confirmation',edition:'G01 TEST v1; separate firm/partner tenure and same-year services assessed',ruleEvidence:evidence,
  ...Object.fromEntries(acceptanceChecks.flatMap(([key])=>[['result.'+key,'supported'],['basis.'+key,'Explicit fictional assessment for '+key+' against the accepted dated facts and rule edition'],['evidence.'+key,evidence]])),...overrides};
}
async function assess(app,id,evidence,kind='initial'){
 await app.write('preparer',id,'acceptance-assess',assessmentFields(evidence,kind));
 const submitted=await app.write('preparer',id,'acceptance-submit');
 await app.write('preparer',id,'acceptance-review',{version:String(submitted.acceptance.assessment.version),recommendation:'accept',reason:'Self review'},403);
 return app.write('reviewer',id,'acceptance-review',{version:String(submitted.acceptance.assessment.version),recommendation:'accept',reason:'Reviewed exact facts, separate checks, persons and method applicability'});
}
const proposal={scope:'Financial statement audit for the identified period',framework:'Test framework 1',templateReference:'Fictional source letter 1.4.3 edition 1',
 auditorResponsibilities:'Perform the agreed audit and report',managementResponsibilities:'Prepare statements, maintain controls, provide information and unrestricted access to people',
 deliverable:'Audit report on the identified financial statements',timetable:'Completion at the agreed target date',fees:'Fictional agreed fee and payment schedule',
 treatment:'new',treatmentBasis:'Initial agreement',assuranceChange:'same',justification:'No assurance reduction or unsupported scope restriction'};
async function terms(app,id,context,evidence,contact,fields=proposal){
 const saved=await app.write('preparer',id,'intake-terms-propose',fields),version=String(saved.acceptance.proposal.version);
 await app.write('preparer',id,'intake-terms-review',{version,reason:'Self review'},403);
 await app.write('reviewer',id,'intake-terms-review',{version,reason:'Independent firm review of scope, responsibilities and justification'});
 const sent=await app.write('reviewer',id,'intake-terms-send',{version,reference:'Manual delivery to the actual fixture director; exact proposal edition'});
 assert.deepEqual(sent.intakeTerms,saved.intakeTerms);
 const agreement={proposalVersion:version,client:context.client,start:context.period.start,end:context.period.end,evidence,reference:'Signed fixture letter '+version,
  signatoryContact:contact,signatoryEvidence:evidence,signedOn:today(),agreementVerification:'Compared signed content, authorized party, scope and dates against the reviewed proposal',
  ...(saved.engagement.active&&{amendmentReason:'Actual revised agreement adds a separately identified deliverable'})};
 await app.write('preparer',id,'intake-terms-save',{...agreement,start:'2001-01-01'},409);
 await app.write('preparer',id,'intake-terms-save',{...agreement,client:randomUUID()},409);
 await app.write('preparer',id,'intake-terms-save',{...agreement,signedOn:'1900-01-01'},409);
 const agreed=await app.write('preparer',id,'intake-terms-save',agreement);
 assert.equal(agreed.intakeTerms.signatory,'Actual fixture director');
 const approvalFields={version:String(agreed.intakeTerms.version),reason:'Approved the exact written agreement, authority and dated period',...(saved.engagement.active&&{scopeAssessment:'Reassessed the actual changed scope, independence and resources'})};
 await app.write('partner',id,'intake-terms-approve',{...approvalFields,version:String(agreed.intakeTerms.version+1)},409);
 const approvalPacket={action:'intake-terms-approve',fields:approvalFields,revision:(await app.view('partner',id)).revision,idempotencyKey:randomUUID()};
 const response=await app.request(app.path('/action',id),app.cookies.partner,approvalPacket),approved=await response.json();assert.equal(response.status,200,JSON.stringify(approved.error));
 return {agreement,approved,approvalPacket};
}
const decision=(evidence,outcome='accept')=>({outcome,authority:'Fictional partner appointment and decision authority',authorityEvidence:evidence,rationale:'Supported current assessment and exact agreed terms',validThrough:'2099-12-31'});
const activation={assessment:'Refer to separate current G01 decision',independence:'Exact approved declarations and applicable conclusions',letter:'No client-provided bypass'};

test('G01 connected acceptance binds named declarations, exact terms and independent decisions through revision and restart',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'audit-g01-')),database=join(dir,'case.sqlite');let app;
 try{
  app=await start(database,true);const people=await firm(app),profile=await client(app),draft=await enquiry(app);
  assert.equal(draft.start,'');assert.equal(draft.framework,'');assert.equal(draft.nextOwner,'reviewer');
  const {id,evidence,declarations,packet}=await setupEngagement(app,people,profile.id,profile.contact,draft);
  await app.write('partner',id,'activate',activation,409);
  const reviewed=await assess(app,id,evidence);assert.equal(reviewed.engagement.active,false);
  await app.write('partner',id,'acceptance-decide',decision(evidence),409);
  const agreed=await terms(app,id,reviewed.intakeContext,evidence,profile.contact);
  if(process.env.AUDIT_G01_FIXTURE_DIR){
   const fixture=process.env.AUDIT_G01_FIXTURE_DIR;await mkdir(fixture,{recursive:true});await app.close();app=null;
   await copyFile(database,join(fixture,'workspace.sqlite'));
   await writeFile(join(fixture,'g01-fixture.json'),JSON.stringify({database:join(fixture,'workspace.sqlite'),engagement:id,evidence,credentials:passwords,scope:proposal.scope},null,2)+'\n');
   app=await start(database);
  }
  await app.write('reviewer',id,'acceptance-decide',decision(evidence),403);
  const accepted=await app.write('partner',id,'acceptance-decide',decision(evidence));
  assert.equal(accepted.acceptance.current,true);assert.equal(accepted.engagement.active,false);
  assert.equal(accepted.acceptance.decisions[0].setupAuthorized,true);
  assert.equal(accepted.acceptance.decisions[0].person.name,'Named fixture partner');
  const activated=await app.write('partner',id,'activate',activation);assert.equal(activated.engagement.active,true);
  const before=structuredClone(activated.acceptance.decisions[0]),oldTerms=structuredClone(activated.intakeTerms);
  const received=await app.request(app.path('/evidence/'+evidence,id),app.cookies.partner);
  const original=Buffer.from(await received.arrayBuffer());assert.equal(hash(original),agreed.approved.intakeTerms.sha256);

  const specialist=await app.register('firm','M01-F03',{name:'Actual external fixture expert',reference:'G01-EXTERNAL',status:'external'});
  const raw=await app.write('preparer',id,'register',{kind:'M04-F04',operation:'save','field.assignee':'external','field.person':specialist,'field.scope':'Expert support in the same engagement','field.due':'2026-12-31'});
  const ext=raw.registers.at(-1).id;
  assert.equal(raw.acceptance.current,false);
  const held=await app.write('reviewer',id,'request',{title:'Must pause after a new relevant declaration',due:'2026-12-31'},409);assert.match(held.error,/G01/);
  await app.write('preparer',id,'register',{kind:'M04-F04',id:ext,operation:'declare',reason:'Pretend native expert statement',signedOn:today(),disposition:'none'},409);
  await app.write('preparer',id,'register',{kind:'M04-F04',id:ext,operation:'declare',mode:'signed-copy',reason:'Actual fictional signed expert statement',source:randomUUID(),signedOn:today(),disposition:'none'},409);
  await app.write('preparer',id,'register',{kind:'M04-F04',id:ext,operation:'declare',mode:'signed-copy',reason:'Actual fictional signed expert statement',source:evidence,signedOn:today(),disposition:'disclosure'});
  await app.write('preparer',id,'register',{kind:'M04-F04',id:ext,operation:'submit'});
  const disclosed=await app.write('reviewer',id,'register',{kind:'M04-F04',id:ext,operation:'approve',reason:'Received and independently evaluated actual source; disclosure still requires separate treatment'});
  const deferred=await app.write('partner',id,'acceptance-decide',{...decision(evidence,'defer'),rationale:'Escalated the new disclosure; no positive clearance is inferred from receipt'});
  const responseFields={threat:'Self-interest from the expert relationship',significance:'medium',owner:'reviewer',safeguard:'Independently performed response',followup:'2026-12-31',residual:'acceptable',basis:'Evaluated actual response',treatment:'prohibition',declaration:ext,requirement:'Fictional applicable requirement',edition:'TEST v1',resolutionEvidence:evidence};
  const threatDraft=await app.write('reviewer',id,'register',{kind:'M04-F05',operation:'save',...Object.fromEntries(Object.entries(responseFields).map(([key,value])=>['field.'+key,value]))}),threat=threatDraft.registers.at(-1).id;
  await app.write('reviewer',id,'register',{kind:'M04-F05',id:threat,operation:'submit'},409);
  const waiverDenied=await app.view('reviewer',id);
  await app.write('reviewer',id,'register',{kind:'M04-F05',id:threat,operation:'save',...Object.fromEntries(Object.entries({...responseFields,treatment:'threat',basis:'Actual fictional requirement review established that the prohibition does not apply; the remaining threat needs a documented response'}).map(([key,value])=>['field.'+key,value]))});
  await app.write('reviewer',id,'register',{kind:'M04-F05',id:threat,operation:'submit'});
  const resolved=await app.write('partner',id,'register',{kind:'M04-F05',id:threat,operation:'approve',reason:'Independently confirmed the exact requirement, revised classification and actual response; old draft retained'});
  await assess(app,id,evidence);const renewed=await app.write('partner',id,'acceptance-decide',decision(evidence));
  assert.equal(renewed.acceptance.current,true);assert.deepEqual(renewed.acceptance.decisions[0],before);assert.deepEqual(renewed.intakeTerms,oldTerms);
  assert.equal((await app.request(app.path('/evidence/'+evidence,'E-'+randomUUID()),app.cookies.partner)).status,404);
  await app.write('partner',id,'access',{role:'preparer',access:'revoke',reason:'Assignment ended'});
  await app.view('preparer',id,404);
  // Membership itself changes required declarations; existing personnel source checks remain explicit.
  const final=await app.view('partner',id);
  await app.close();app=null;app=await start(database);
  const replay=await app.request(app.path('/action','firm'),app.cookies.reviewer,packet);assert.equal(replay.status,200);
  assert.equal((await replay.json()).selected,id);assert.equal((await app.view('reviewer','firm')).portfolio.length,1);
  const restored=await app.view('partner',id);assert.deepEqual(restored.acceptance.decisions,final.acceptance.decisions);
  const approvalReplay=await app.request(app.path('/action',id),app.cookies.partner,agreed.approvalPacket);assert.equal(approvalReplay.status,200);assert.deepEqual((await approvalReplay.json()).intakeTerms,oldTerms);
  assert.equal(restored.acceptance.current,true);assert.deepEqual(restored.intakeTerms,oldTerms);await app.view('preparer',id,404);
  assert.deepEqual(Buffer.from(await (await app.request(app.path('/evidence/'+evidence,id),app.cookies.reviewer)).arrayBuffer()),original);
  const proof={guide:'G01',engagement:id,client:profile.id,actors:Object.keys(people),assessment:restored.acceptance.assessment.version,
   decisionVersions:restored.acceptance.decisions.map(row=>row.version),terms:oldTerms.version,original:{id:evidence,sha256:hash(original)},
   checks:{normal:true,missingFact:true,wrongPeriod:true,selfReview:true,changedBasis:true,manualExpert:true,revokedScope:true,restartAndRetry:true},
   profile:'Persisted fictional standard intake with approved named roster, independent declarations and dated manual rule checks; no professional/source acceptance granted'};
  t.diagnostic('audit-g01-v1 '+JSON.stringify(proof));
  const initial=before.snapshot.assessment,versions={assessment:initial.version,terms:oldTerms.version,finalDecision:restored.acceptance.decisions.at(-1).version};
  const entry=(key,actor,action,expected,actual)=>({id:key,engagement:id,actor,action,expected,actual,versions});
  const a01=[
   ['A01-P1-W1','reviewer','Identify exact client and supplied owner', {registration:'G01-CLIENT',owners:1},{registration:before.snapshot.scope.profile.registration,owners:activated.registers.filter(row=>row.kind==='M03-F04').length}],
   ['A01-P1-W2','preparer','Record period and intended users',{start:dates.start,end:dates.end,users:'Fictional owners and board'},{start:activated.intakeContext.period.start,end:activated.intakeContext.period.end,users:activated.intakeContext.intendedUsers}],
   ['A01-P1-W3','preparer','Identify initial assessment','initial',initial.kind],
   ...[['A01-P2-W1','integrity'],['A01-P2-W2','resources'],['A01-P2-W3','firmTenure'],['A01-P2-W4','otherServices'],['A01-P2-W5','predecessor']].map(([key,check])=>[key,'reviewer','Review the explicit manual '+check+' result, original and policy edition',{result:'supported',evidence},{result:initial.checks[check].result,evidence:initial.checks[check].evidence}]),
   ['A01-P3-W1','reviewer','Escalate reviewed recommendation','accept',initial.recommendation],
   ['A01-P3-W2','reviewer','Recommendation does not activate the engagement',false,reviewed.engagement.active],
   ['A01-P3-W3','partner','Record exact decision and separately activate',true,activated.engagement.active&&activated.acceptance.decisions[0].setupAuthorized],
  ].map(args=>entry(...args));
  recordLifecycleEvidence(t,{lifecycle:'A01',engagement:id,profile:proof.profile,steps:a01,branches:[
   entry('unknown-intake-facts','preparer','Retain unknown values and next owner',['','','reviewer'],[draft.start,draft.framework,draft.nextOwner]),
   entry('missing-positive-prerequisites','partner','No activation from a reviewed assessment alone',false,reviewed.engagement.active),
   entry('independent-current-decision','partner','Prepared, reviewed and decided by separate capacities',true,initial.by!==initial.reviewedBy&&before.by==='partner'),
   entry('exact-party-period-terms','partner','Approve exact current scoped signed source',hash(original),oldTerms.sha256),
   entry('changed-basis-retains-history','partner','Retain initial accepted decision after renewed assessment',hash(JSON.stringify(before)),hash(JSON.stringify(restored.acceptance.decisions[0]))),
   entry('conversion-and-approval-retry','partner','Restart and replay conversion and terms approval without duplicates',1,(await app.view('reviewer','firm')).portfolio.length),
  ]});
  const response=resolved.registers.find(row=>row.id===threat),external=restored.registers.find(row=>row.id===ext).declaration;
  recordLifecycleEvidence(t,{lifecycle:'A02',engagement:id,profile:proof.profile,steps:[
   entry('A02-P1-W1','preparer','Obtain own named statements from the assigned team',3,activated.registers.filter(row=>row.kind==='M04-F04'&&row.declaration?.person).length),
   entry('A02-P1-W2','reviewer','Assess current concurrent-service/network context','supported',initial.checks.otherServices.result),
   entry('A02-P1-W3','preparer','Register actual expert signed original with person/scope/date','G01-EXTERNAL',external.person.reference),
   entry('A02-P2-W1','reviewer','Identify the actual disclosed relationship',ext,response.values.declaration),
   entry('A02-P2-W2','partner','Independently review requirement, treatment and evidence','threat',response.values.treatment),
   entry('A02-P2-W3','partner','Retain deferral while the new disclosure is unresolved','defer',deferred.acceptance.decisions.at(-1).outcome),
   entry('A02-P3-W1','partner','Record renewed independent acceptance','accept',renewed.acceptance.decisions.at(-1).outcome),
   entry('A02-P3-W2','partner','Record the actual performed response','acceptable',response.values.residual),
   entry('A02-P3-W3','reviewer','Changed relationship reopens current reliance and renewal survives restart',true,!raw.acceptance.current&&restored.acceptance.current),
  ],branches:[
   entry('actual-declarant','partner','Native declaration names the actor-bound person','G01-partner',activated.registers.find(row=>row.id===declarations.partner).declaration.person.reference),
   entry('manual-original','preparer','Manual registration retains exact signed original',hash(original),external.sha256),
   entry('no-prohibition-waiver','reviewer','Generic safeguard cannot submit a waived prohibition','draft',waiverDenied.registers.find(row=>row.id===threat).status),
   entry('disclosure-remains-separate','reviewer','Receipt/approval of a disclosure is not acceptance',false,disclosed.acceptance.current),
   entry('independent-response','partner','Reviewer preparation has separate partner approval',true,response.by!==response.owner&&response.values.resolutionEvidence===evidence),
   entry('change-and-restart','partner','Renewed position and original decision retained',true,restored.acceptance.current&&restored.acceptance.decisions[0].basis===before.basis),
  ]});
  if(process.env.AUDIT_G01_EVIDENCE_DIR){await mkdir(process.env.AUDIT_G01_EVIDENCE_DIR,{recursive:true});await writeFile(join(process.env.AUDIT_G01_EVIDENCE_DIR,'g01-connected-evidence.json'),JSON.stringify(proof,null,2)+'\n');}
 }finally{if(app)await app.close();for(const suffix of ['','-wal','-shm'])await rm(database+suffix,{force:true});await rm(dir,{recursive:true,force:true});}
});

test('G01 retains unresolved and prohibited outcomes without releasing setup',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'audit-g01-negative-')),database=join(dir,'case.sqlite');let app;
 try{
  app=await start(database,true);const people=await firm(app),profile=await client(app),draft=await enquiry(app,'firm');
  const {id,evidence}=await setupEngagement(app,people,profile.id,profile.contact,draft);
  const adopted=await app.write('reviewer',id,'form-use',{form:'1.4.1',version:'source'});
  const questionnaire=await app.write('preparer',id,'save',{form:'1.4.1',execution:'Actual predecessor dispute disclosed',conclusion:'Requires evaluation; no automatic favorable answer',
   templateDigest:adopted.papers.find(row=>row.form==='1.4.1').template.digest,answers:JSON.stringify({r12:'Хариулт: Тийм'})});
  assert.equal(questionnaire.papers.find(row=>row.form==='1.4.1').values['field.r12'],'Хариулт: Тийм');assert.equal(questionnaire.acceptance.current,false);
  await app.write('preparer',id,'acceptance-assess',{kind:'initial'});await app.write('preparer',id,'acceptance-submit',{},409);
  const adverse=assessmentFields(evidence,'initial',{'result.firmTenure':'adverse','owner.firmTenure':'reviewer','due.firmTenure':'2026-12-31','followup.firmTenure':'Obtain the applicable dated tenure/return restriction and owner decision'});
  await app.write('preparer',id,'acceptance-assess',adverse);const submitted=await app.write('preparer',id,'acceptance-submit');
  await app.write('reviewer',id,'acceptance-review',{version:String(submitted.acceptance.assessment.version),recommendation:'accept',reason:'Generic override'},409);
  const refused=await app.write('reviewer',id,'acceptance-review',{version:String(submitted.acceptance.assessment.version),recommendation:'decline',reason:'Retain the adverse dated firm-tenure assessment'});
  const declined=await app.write('partner',id,'acceptance-decide',{...decision(evidence,'decline'),rationale:'Decline with unresolved positive prerequisites; actual authority retained'});
  assert.equal(declined.acceptance.decisions[0].outcome,'decline');assert.equal(declined.engagement.active,false);
  assert.equal(declined.acceptance.decisions[0].setupAuthorized,false);
  await app.write('partner',id,'activate',activation,409);
  const conditional=await app.write('partner',id,'acceptance-decide',{...decision(evidence,'conditional'),condition:'Obtain a supported current policy determination',conditionOwner:'reviewer',conditionDue:'2026-12-31',conditionEffect:'Preparation only; no release of substantive work'});
  assert.equal(conditional.acceptance.current,false);await app.write('partner',id,'activate',activation,409);
  await app.write('partner',id,'acceptance-decide',{...decision(evidence,'defer'),validThrough:'2000-01-01'},400);
  const threat={'field.threat':'Explicit applicable prohibition','field.significance':'high','field.owner':'reviewer','field.safeguard':'Generic review cannot waive a prohibition','field.followup':'2026-12-31','field.residual':'acceptable','field.basis':'Keep the actual requirement','field.treatment':'prohibition','field.requirement':'Applicable rule in fixture','field.edition':'TEST v1'};
  const saved=await app.write('reviewer',id,'register',{kind:'M04-F05',operation:'save',...threat}),record=saved.registers.at(-1).id;
  await app.write('reviewer',id,'register',{kind:'M04-F05',id:record,operation:'submit'},409);
  await app.write('reviewer',id,'register',{kind:'M04-F05',id:record,operation:'save',...threat,'field.residual':'unacceptable'});
  await app.write('reviewer',id,'register',{kind:'M04-F05',id:record,operation:'submit'});
  await app.write('partner',id,'register',{kind:'M04-F05',id:record,operation:'approve',reason:'Prohibition retained; positive setup remains barred'});
  await assess(app,id,evidence).then(()=>assert.fail('Prohibition cannot be cleared by a generic assessment'),error=>assert.match(error.message,/acceptance-review/));
  const returned=await app.write('reviewer',id,'acceptance-return',{version:String((await app.view('reviewer',id)).acceptance.assessment.version),reason:'Resolve actual rule; preserve original prohibition and adverse history'});
  assert.ok(returned.acceptance.assessments.some(row=>row.recommendation==='decline'));
  assert.deepEqual(returned.acceptance.decisions[0],declined.acceptance.decisions[0]);
  await app.close();app=null;app=await start(database);assert.equal((await app.view('partner',id)).engagement.active,false);
 }finally{if(app)await app.close();for(const suffix of ['','-wal','-shm'])await rm(database+suffix,{force:true});await rm(dir,{recursive:true,force:true});}
});

test('G01 current-period confirmations and amended terms reopen only the affected acceptance with history retained',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'audit-g01-change-')),database=join(dir,'case.sqlite');let app;
 try{
  app=await start(database,true);const people=await firm(app),profile=await client(app);
  const a=await setupEngagement(app,people,profile.id,profile.contact,await enquiry(app));
  const first=await assess(app,a.id,a.evidence);await terms(app,a.id,first.intakeContext,a.evidence,profile.contact);
  await app.write('partner',a.id,'acceptance-decide',decision(a.evidence));const activeA=await app.write('partner',a.id,'activate',activation);
  const priorDecision=structuredClone(activeA.acceptance.decisions),priorTerms=structuredClone(activeA.intakeTerms);

  const declinedDraft=await enquiry(app,'firm');
  assert.equal(declinedDraft.origin,'firm');assert.equal(declinedDraft.start,'');assert.equal(declinedDraft.framework,'');assert.equal(declinedDraft.nextOwner,'reviewer');
  await app.write('preparer','firm','intake-forward',{id:declinedDraft.id,note:'Known contact, unknown framework and period'});
  await app.write('reviewer','firm','intake-return',{id:declinedDraft.id,item:'Proposed period',note:'Obtain the actual intended period'});
  await app.write('preparer','firm','intake-save',{id:declinedDraft.id,company:'G01 fictional client',origin:'firm',service:'Financial statement audit',contact:'Finance contact',facts:'Period remains explicitly unknown'});
  await app.write('preparer','firm','intake-forward',{id:declinedDraft.id,note:'Reconsider whether any offer should be made'});
  const refused=await app.write('partner','firm','intake-decline',{id:declinedDraft.id,note:'No supported offer; missing facts remain recorded'});
  const refusedRow=refused.intake.enquiries.find(row=>row.id===declinedDraft.id);assert.equal(refusedRow.engagement,undefined);assert.ok(refusedRow.history.some(row=>row.item==='Proposed period'));
  await app.write('reviewer','firm','intake-convert',{id:declinedDraft.id,clientId:profile.id,contactId:profile.contact,...dates,note:'Cannot convert a declined enquiry'},409);

  const next=await enquiry(app,'firm',profile.id),period={start:'2026-01-01',end:'2026-12-31',reportDate:'2027-12-31'};
  const b=await setupEngagement(app,people,profile.id,profile.contact,next,period,a.id);
  assert.equal(b.state.intakeContext.prior,a.id);assert.deepEqual(b.state.acceptance.decisions,[]);assert.deepEqual(b.state.evidence,[]);
  await app.write('reviewer',b.id,'intake-context-item',{item:'Prior ownership fact',status:'returned',owner:'preparer',due:'2026-12-31',note:'Prior origin is retained; obtain current ownership confirmation'});
  await app.write('reviewer',b.id,'intake-context-item',{item:'Framework',status:'confirmed',owner:'reviewer',due:'2026-12-31',note:'Confirmed unchanged framework for the exact new period'});
  await app.write('preparer',b.id,'acceptance-assess',assessmentFields(b.evidence,'continuance'));const submitted=await app.write('preparer',b.id,'acceptance-submit');
  await app.write('reviewer',b.id,'acceptance-review',{version:String(submitted.acceptance.assessment.version),recommendation:'accept',reason:'Cannot ignore the returned fact'},409);
  await app.write('reviewer',b.id,'acceptance-return',{version:String(submitted.acceptance.assessment.version),reason:'Obtain current ownership support'});
  const answer={item:'Prior ownership fact',status:'responded',owner:'preparer',due:'2026-12-31',note:'Actual current-period client confirmation obtained; prior fact comparison retained'};
  await app.write('partner',b.id,'intake-context-item',answer,403);
  await app.write('preparer',b.id,'intake-context-item',answer);
  await app.write('preparer',b.id,'intake-context-item',{...answer,status:'confirmed'},403);
  const confirmed=await app.write('reviewer',b.id,'intake-context-item',{...answer,status:'confirmed',note:'Reviewed the actual current-period response'});
  assert.equal(confirmed.intakeContext.items.find(row=>row.item==='Prior ownership fact').history.length,2);
  const assessed=await assess(app,b.id,b.evidence,'continuance');await terms(app,b.id,assessed.intakeContext,b.evidence,profile.contact,{...proposal,treatment:'unchanged',treatmentBasis:'Independent current-period determination and reminder of unchanged provisions'});
  await app.write('partner',b.id,'acceptance-decide',decision(b.evidence,'accept'),409);
  await app.write('partner',b.id,'acceptance-decide',decision(b.evidence,'continue'));
  const activeB=await app.write('partner',b.id,'activate',activation),originalB=structuredClone(activeB.acceptance.decisions[0]);

  await app.write('reviewer','firm','client-contact',{id:profile.id,contactId:profile.contact,name:'Actual fixture director',email:'changed@example.test',capacity:'Authorized client director',body:'Board',signer:'yes',effective:'2020-01-01',source:'New dated client confirmation',note:'Correct only the current source; earlier correspondence remains attributable'});
  const refresh=await app.write('reviewer',b.id,'intake-refresh',{contactId:profile.contact,note:'Explicitly reconfirmed current-period source facts'});
  assert.equal(refresh.acceptance.current,false);assert.deepEqual(refresh.acceptance.decisions[0],originalB);
  assert.match((await app.write('reviewer',b.id,'request',{title:'Held source change',due:'2026-12-31'},409)).error,/G01/);
  await app.write('partner',b.id,'acceptance-decide',decision(b.evidence,'continue'),409);
  const newEvidence=await app.file(b.id,'New signed current-context agreement with an additional governance schedule');
  const amendedAgreement=await terms(app,b.id,refresh.intakeContext,newEvidence,profile.contact,{...proposal,scope:'Financial statement audit plus a governance schedule',treatment:'revised',treatmentBasis:'Actual changed client facts and agreed additional scope'});
  await app.write('partner',b.id,'acceptance-decide',decision(newEvidence,'continue'),409);
  await app.write('preparer',b.id,'acceptance-assess',assessmentFields(newEvidence,'continuance', {assessmentScope:'Financial statement audit plus a governance schedule'}));
  const revised=await app.write('preparer',b.id,'acceptance-submit');
  await app.write('reviewer',b.id,'acceptance-review',{version:String(revised.acceptance.assessment.version),recommendation:'accept',reason:'Reassessed exact new scope and current-period support'});
  const resumed=await app.write('partner',b.id,'acceptance-decide',decision(newEvidence,'continue'));
  assert.equal(resumed.acceptance.current,true);assert.deepEqual(resumed.acceptance.decisions[0],originalB);assert.equal(resumed.intakeTermsHistory[0].sha256,activeB.intakeTerms.sha256);
  assert.deepEqual((await app.view('partner',a.id)).acceptance.decisions,priorDecision);assert.deepEqual((await app.view('partner',a.id)).intakeTerms,priorTerms);
  await app.close();app=null;app=await start(database);
  assert.deepEqual((await app.view('partner',b.id)).acceptance.decisions,resumed.acceptance.decisions);
  const firmState=await app.view('reviewer','firm');assert.equal(firmState.intake.enquiries.find(row=>row.id===declinedDraft.id).status,'declined');
  assert.deepEqual(firmState.intake.clients[0].periods.map(row=>row.id),[b.id,a.id]);
  const retry=await app.request(app.path('/action',b.id),app.cookies.partner,amendedAgreement.approvalPacket);assert.equal(retry.status,200);const reloaded=await retry.json();assert.deepEqual(reloaded.intakeTerms,resumed.intakeTerms);
  const versions={assessment:resumed.acceptance.assessment.version,terms:resumed.intakeTerms.version,decision:resumed.acceptance.decisions.at(-1).version};
  const entry=(key,actor,action,expected,actual)=>({id:key,engagement:b.id,actor,action,expected,actual,versions});
  recordLifecycleEvidence(t,{lifecycle:'A03',engagement:b.id,profile:'Fictional current-period written agreement and material amendment; manual client authority/standards applicability, not regulated e-signing',steps:[
   entry('A03-P1-W1','reviewer','Confirm the actual framework','Test framework 1',resumed.intakeTerms.framework),
   entry('A03-P1-W2','reviewer','Record management responsibilities and access',proposal.managementResponsibilities,resumed.intakeTerms.managementResponsibilities),
   entry('A03-P1-W3','reviewer','Assess scope limitations under current preconditions','supported',resumed.acceptance.assessment.checks.preconditions.result),
   entry('A03-P2-W1','preparer','Record exact new-period scope, deliverable and timetable','Financial statement audit plus a governance schedule',resumed.intakeTerms.scope),
   entry('A03-P2-W2','reviewer','Record agreed firm/client responsibilities and fees',proposal.fees,resumed.intakeTerms.fees),
   entry('A03-P2-W3','reviewer','Reassess whether prior terms need revision or reminder','unchanged',activeB.intakeTerms.proposalSnapshot.treatment),
   entry('A03-P3-W1','partner','Review actual authorized written agreement','Actual fixture director',resumed.intakeTerms.signatory),
   entry('A03-P3-W2','partner','Retain exact agreed version and original identity',hash(Buffer.from('New signed current-context agreement with an additional governance schedule')),resumed.intakeTerms.sha256),
   entry('A03-P3-W3','partner','Reapprove changed terms and acceptance before renewed current reliance',true,resumed.acceptance.current&&resumed.intakeTerms.status==='approved'),
  ],branches:[
   entry('draft-and-send-not-agreement','reviewer','Sending a proposal does not activate the pending period',false,assessed.engagement.active),
   entry('exact-party-period-version','partner','Bind the approved written agreement to the new period',period.start,resumed.intakeTerms.start),
   entry('independent-firm-review','reviewer','Preparation and review remain separate',true,resumed.intakeTerms.proposalSnapshot.by!==resumed.intakeTerms.proposalSnapshot.reviewedBy),
   entry('current-period-confirmation','reviewer','Changed current-period source reopens acceptance',false,refresh.acceptance.current),
   entry('new-scope-needs-reassessment','reviewer','Reassessment names the actual signed revised scope',resumed.intakeTerms.scope,resumed.acceptance.assessment.scope),
   entry('amendment-and-retry','partner','Restart/retry retains the agreed amendment version',resumed.intakeTerms.version,reloaded.intakeTerms.version),
  ]});
 }finally{if(app)await app.close();for(const suffix of ['','-wal','-shm'])await rm(database+suffix,{force:true});await rm(dir,{recursive:true,force:true});}
});
