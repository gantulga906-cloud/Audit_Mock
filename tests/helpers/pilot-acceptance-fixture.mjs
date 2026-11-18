import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {createServer} from 'node:http';
import {mkdtemp,rm,mkdir,writeFile,copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createPilot} from '../../scripts/pilot-server.mjs';
import {acceptanceChecks} from '../../src/lib/pilot-acceptance.ts';

const passwords={preparer:'G01-fixture-preparer',reviewer:'G01-fixture-reviewer',partner:'G01-fixture-partner'};
const today=()=>new Date().toISOString().slice(0,10);
const dates={start:'2025-01-01',end:'2025-12-31',reportDate:'2026-12-31'};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
async function start(database,setup=false,oversight={}){
 const pilot=createPilot({database,setupCode:'G01-fixture-only'}),server=createServer((req,res)=>void pilot.handle(req,res,new URL(req.url,'http://127.0.0.1')));
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const origin='http://127.0.0.1:'+server.address().port;
 const request=(path,cookie,data)=>fetch(origin+'/api/pilot'+path,{method:data===undefined?'GET':'POST',headers:{...(cookie&&{Cookie:cookie}),...(data!==undefined&&{'Content-Type':'application/json',Origin:origin})},body:data===undefined?undefined:JSON.stringify(data)});
 const cookies={};
 try{
  if(setup)assert.equal((await request('/setup','',{code:'G01-fixture-only',...passwords,...oversight})).status,201);
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


export {start,firm,enquiry,client,convert,setupEngagement,assessmentFields,assess,proposal,terms,decision,activation,today,dates,hash,passwords};
