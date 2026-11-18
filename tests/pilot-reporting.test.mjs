import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {createServer} from 'node:http';
import {mkdtemp,rm,mkdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createPilot} from '../scripts/pilot-server.mjs';
import {recordLifecycleEvidence} from '../scripts/pilot-lifecycle-evidence.mjs';
import {assemblyDeadline} from '../scripts/pilot-assembly.mjs';
import {distributionGaps} from '../scripts/pilot-release.mjs';
import {DatabaseSync,backup} from 'node:sqlite';

const hash=value=>createHash('sha256').update(value).digest('hex');
const passwords={preparer:'LocalPreparer2026!',reviewer:'LocalReviewer2026!',partner:'LocalPartner2026!',custodian:'LocalCustodian2026!'};

async function start(database){
 const pilot=createPilot({database,setupCode:'report-bootstrap'});
 const server=createServer((req,res)=>void pilot.handle(req,res,new URL(req.url,'http://127.0.0.1')));
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const origin='http://127.0.0.1:'+server.address().port;
 return {async request(path,cookie,body){return fetch(origin+'/api/pilot'+path,{method:body===undefined?'GET':'POST',headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});},async close(){await new Promise(resolve=>server.close(resolve));pilot.close();}};
}

test('assembly clocks use the declared calendar-day policy without inventing a retention anchor',()=>{
 const m={engagements:[{reportDate:'2024-02-28'}],pilotIssue:{at:'2024-02-29T12:00:00Z'}};
 assert.equal(assemblyDeadline(m,{anchorKind:'report',days:'1'}),'2024-02-29');
 assert.equal(assemblyDeadline(m,{anchorKind:'issue',days:'1'}),'2024-03-01');
 assert.equal(assemblyDeadline(m,{anchorKind:'specified',anchor:'2024-12-31',days:'0'}),'2024-12-31');
 assert.throws(()=>assemblyDeadline(m,{anchorKind:'specified',anchor:'',days:'30'}));
 assert.throws(()=>assemblyDeadline(m,{anchorKind:'issue',days:'-1'}));
});

test('a received recipient does not hide another unresolved distribution outcome',()=>{
 const m={pilotRecords:[{kind:'M10-F10'}],pilotIssue:{at:'issue-1'}};
 const rows=[{recipient:'second',issued:'issue-1',state:'unknown'},{recipient:'first',issued:'issue-1',state:'received'}];
 assert.equal(distributionGaps(m,rows).length,1);
 assert.deepEqual(distributionGaps(m,[{...rows[0],state:'withdrawn'},rows[1]]),[]);
 assert.deepEqual(distributionGaps(m,[{...rows[0],issued:'old-issue'},rows[1]]),[]);
});

test('approved report preparation connects exact issue to independently completed assembly and custody',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'audit-report-assembly-')),database=join(dir,'workspace.sqlite');
 let service=await start(database);
 try{
  assert.equal((await service.request('/setup','',{code:'report-bootstrap',...passwords})).status,201);
  const cookies={};
  const login=async role=>{const response=await service.request(role==='custodian'?'/oversight/login':'/login','',{role,password:passwords[role]});assert.equal(response.status,200);cookies[role]=response.headers.get('set-cookie').split(';')[0];};
  for(const role of Object.keys(passwords))await login(role);
  const today=new Date().toISOString().slice(0,10),scope=(path,id)=>path+'?engagement='+id;
  const state=async(role,id)=>{const response=await service.request(scope('',id),cookies[role]);assert.equal(response.status,200);return response.json();};
  const write=async(role,id,action,fields={},status=200,key)=>{
   const view=await state(role,id);const response=await service.request(scope('/action',id),cookies[role],{action,fields,revision:view.revision,idempotencyKey:key??randomUUID()});const result=await response.json();assert.equal(response.status,status,action+' · '+JSON.stringify(result).slice(0,260));Object.defineProperty(result,'_httpStatus',{value:response.status});return result;
  };
  const created=await write('reviewer','firm','create',{client:'Source reporting fixture',legalForm:'ХХК',registration:'REPORT-01',framework:'Synthetic framework',contact:'Reviewed Finance',email:'report@example.test',start:'2025-01-01',end:'2025-12-31',reportDate:today,synthetic:'yes'});
  const id=created.selected,run=(role,action,fields={},status=200,key)=>write(role,id,action,fields,status,key),view=role=>state(role,id);
  const save=async(kind,values,owner='reviewer',record)=>{const result=await run(owner,'register',{kind,id:record,operation:'save',...Object.fromEntries(Object.entries(values).map(([k,v])=>['field.'+k,v]))});return record??result.registers.findLast(r=>r.kind===kind).id;};
  const action=(kind,record,operation,role='reviewer',status=200)=>run(role,'register',{kind,id:record,operation,reason:'Independent source and exact version checked'},status);
  const approve=async(kind,values,owner='reviewer',record)=>{const next=await save(kind,values,owner,record);await action(kind,next,'submit',owner);await action(kind,next,'approve','partner');return next;};
  const evidence=async(name,text)=>{const result=await run('reviewer','support-upload',{name,source:'Retained synthetic original',base64:Buffer.from(text).toString('base64')});const file=result.evidence.find(f=>f.name===name);await run('partner','support-assess',{id:file.id,result:'accepted',reason:'Independent original assessment'});return file.id;};
  const paper=async(form,extra={},owner='preparer',reviewer='reviewer')=>{await run(owner,'save',{form,execution:'Performed supported procedures on original sources',conclusion:'Retained human conclusion and limitations',...extra});await run(owner,'submit',{form});return run(reviewer,'review',{form});};
  const currentPaper=(v,form)=>v.papers.find(p=>p.form===form);
  let checkpointDir;
  const checkpoint=async label=>{
   if(!process.env.AUDIT_REPORT_FIXTURE_DIR)return;
   if(!checkpointDir){await mkdir(process.env.AUDIT_REPORT_FIXTURE_DIR,{recursive:true});checkpointDir=await mkdtemp(join(process.env.AUDIT_REPORT_FIXTURE_DIR,'report-fixture-'));}
   const target=join(checkpointDir,label+'.sqlite'),reader=new DatabaseSync(database,{readOnly:true});
   try{await backup(reader,target);}finally{reader.close();}
   await writeFile(join(process.env.AUDIT_REPORT_FIXTURE_DIR,'reporting-fixture.json'),JSON.stringify({engagement:id,directory:checkpointDir,latest:label,credentials:passwords},null,2));
  };
  await run('partner','activate',{assessment:'Accepted reference scope',independence:'Confirmed',letter:'Signed scope retained'});
  const authority=await evidence('report-authority.csv','Synthetic report template edition and evaluated reporting duties');
  const fs=await evidence('final-statements.csv','Final statement original'),notes=await evidence('final-notes.csv','Final notes original'),management=await evidence('management-authorization.csv','Signed management authorization and representation original');
  const intake=await run('reviewer','form-use',{form:'1.1.1',version:'source'});
  await paper('1.1.1',{templateDigest:currentPaper(intake,'1.1.1').template.digest,answers:JSON.stringify({r26:'Current client scope and terms confirmed'})});
  const controls=await evidence('independent-controls.csv','count,total\n1,100\n');
  const imported=await run('preparer','population-import',{name:'ledger.csv',source:'Controlled ledger original',currency:'MNT',base64:Buffer.from('id,account,amount,entity,date,currency\nROW-1,1500,100,REPORT-01,2025-12-31,MNT\n').toString('base64')});
  await run('preparer','population-reconcile',{version:String(imported.population.current.version),count:'1',total:'100',source:'Independent source count and signed total',controlEvidence:controls,mapping:'1500,PPE',statements:'PPE,100',use:'Approved reporting basis'});
  const population=(await view('reviewer')).population.current;await run('reviewer','population-approve',{version:String(population.version),reason:'Matched independent source controls'});
  await paper('1.3',{benchmark:'10000',percentage:'1',performance:'50',trivial:'5',benchmarkSource:'Reviewed source benchmark'});await paper('2.6',{reliance:'none'});
  for(const impact of (await view('reviewer')).impacts)await run('reviewer','resolve-impact',{id:impact.id,reason:'Assessed the approved planning changes'});
  const request=(await run('reviewer','request',{title:'Asset evidence',due:today})).requests[0].id;
  await run('preparer','upload',{request,name:'asset-original.csv',source:'Asset owner',base64:Buffer.from('asset,value\nA,100\n').toString('base64')});await run('preparer','accept',{request});await paper('3.1.2');
  await run('partner','statements',{statements:'Final approved statement text',disclosures:'Final approved disclosure text'});
  const findingState=await run('reviewer','completion-finding-record',{form:'3.1.2',classification:'factual',amount:'25',title:'Uncorrected source difference',reference:'REPORT-FINDING-1',evidence:authority,criterion:'Approved synthetic measurement basis',effect:'Auditor assesses effect with the scope limitation'});
  const finding=findingState.completion.findings.find(f=>f.title==='Uncorrected source difference');
  await run('partner','fieldwork-resolve-finding',{id:finding.id,reason:'Uncorrected 25 retained in evaluation; separate material nonpervasive scope limitation determines opinion'});
  let evaluated=await run('reviewer','completion-evaluate',{note:'Uncorrected 25 compared with overall 100; human qualitative assessment retained'});
  await run('partner','completion-evaluation-approve',{version:String(evaluated.completion.evaluation.version),reason:'Confirmed uncorrected and qualitative effects'});
  let source=await run('reviewer','completion-management-submit',{file:fs,notes,authorization:management,signer:'Reviewed management signer',capacity:'Documented management authority',date:today,basis:'Exact statement version and original approvals'});
  await run('partner','completion-management-approve',{version:String(source.completion.management.version),reason:'Originals and signer authority reviewed'});
  const analytics=await approve('M10-F06',{line:'PPE',expected:'100',actual:'100',threshold:'1',paper:'3.1.2',conclusion:'Final supported expectation reconciles'});
  const sufficiency=await approve('M10-F08',{analytics,limitations:'Material nonpervasive missing asset evidence',contradictions:'Investigated retained sources',findings:'Uncorrected 25 retained with human evaluation',result:'limited',basis:'Other assertions supported; scope limitation evaluated'});
  const opinion=await approve('M10-F09',{sufficiency,opinion:'qualified',basisType:'evidence',assessment:'Material but not pervasive limitation; uncorrected amount assessed',basis:'Qualified scope limitation basis'});
  const prep={opinion,template:'4.1.A2',reportDate:today,addressee:'Reviewed shareholders',signatory:'Authorized partner under synthetic appointment',edition:'Synthetic report edition 1',authorityEvidence:authority,duties:'none',dutyAssessment:'Auditor evaluated applicable synthetic reporting duties; none additional in this fixture',basis:'Exact statement, entity, period, addressee and signature authority checked'};
  const wrong=await save('M10-F10',{...prep,template:'4.1.A1'},'preparer');const wrongTemplate=await action('M10-F10',wrong,'submit','preparer',409);
  const preparation=await approve('M10-F10',prep,'preparer',wrong);
  await approve('M10-F11',{opinion,template:'4.1.A2',type:'other',wording:'Approved additional reporting matter',basis:'Specific source-supported case'});
  await approve('M07-F10',{type:'subsequent',paper:'3.2.1',evidence:authority,work:'Inquiry and source review through report date',coverageThrough:today,result:'resolved',conclusion:'Coverage complete through intended report date'});
  await approve('M10-F12',{requested:today,due:today,result:'received',signed:today,signer:'Reviewed management signer',capacity:'Authorized management',periodStart:'2025-01-01',periodEnd:'2025-12-31',evidence:management,assessment:'Full representations inspected'});
  await run('partner','quality-policy',{mode:'not-required',reference:'Synthetic applicability policy',basis:'Partner assessed this fixture; formal EQR not required'});
  await paper('4.4',{},'reviewer','partner');await paper('4.1.A2',{conclusion:'Qualified opinion from reviewed scope limitation'},'reviewer','partner');
  assert.deepEqual((await view('partner')).gaps,[]);
  await checkpoint('report-ready');
  const unauthorized=await run('reviewer','authorize',{},403);await run('preparer','report-sign',{},403);
  const firstApproval=await run('partner','authorize'),firstDigest=firstApproval.authorized.artifactSha256;
  const unsigned=await run('partner','issue',{reference:'Unsigned attempt'},409);await run('partner','report-sign');
  await save('M10-F10',{...prep,addressee:'Updated reviewed shareholders'},'preparer',preparation);
  assert.equal((await view('partner')).authorized.current,false);const staleIssue=await run('partner','issue',{reference:'Stale preparation'},409);
  await action('M10-F10',preparation,'submit','preparer');await action('M10-F10',preparation,'approve','partner');
  await paper('4.1.A2',{conclusion:'Qualified opinion from reviewed scope limitation'},'reviewer','partner');
  const approved=await run('partner','authorize');assert.notEqual(approved.authorized.artifactSha256,firstDigest);const signed=await run('partner','report-sign');
  const signedHtml=await service.request(scope('/report',id),cookies.partner);assert.equal(signedHtml.status,200);const html=await signedHtml.text();assert.match(html,/Updated reviewed shareholders/);assert.match(html,/Synthetic report edition 1/);assert.match(html,/Qualified scope limitation basis/);assert.equal(hash(html),approved.authorized.artifactSha256);
  const issueKey=randomUUID(),issued=await run('partner','issue',{reference:'Controlled report issue'},200,issueKey);const issuedAt=issued.archive.issue.at;
  assert.equal((await run('partner','issue',{reference:'Controlled report issue'},200,issueKey)).archive.issue.at,issuedAt);
  const changedRetry=await run('partner','issue',{reference:'Changed issue payload'},409,issueKey);
  const recipient=issued.requestContacts[0].id;
  const firstDelivery=await run('partner','delivery-start',{recipient});
  await run('reviewer','delivery-result',{id:firstDelivery.deliveryLink.id,state:'unknown',reference:'Unknown attempt',reason:'Must be partner'},403);
  await run('partner','delivery-result',{id:firstDelivery.deliveryLink.id,state:'unknown',reference:'UNKNOWN-1',reason:'External outcome not yet established; partner owns reconciliation'});
  const unknownRetry=await run('partner','delivery-start',{recipient},409);
  const reconciled=await run('partner','delivery-result',{id:firstDelivery.deliveryLink.id,state:'failed',reference:'RECONCILED-1',reason:'Confirmed no delivery effect; owner approves retry'});
  assert.deepEqual(reconciled.release.deliveries[0].events.map(e=>e.state),['unknown','failed']);
  assert.equal((await service.request('/delivery/'+firstDelivery.deliveryLink.token,'')).status,404);
  const delivery=await run('partner','delivery-start',{recipient}),token=delivery.deliveryLink.token;
  const recipientSource=await (await service.request('/delivery/'+token,'')).json();
  assert.equal((await service.request('/delivery/'+token,'',{sha256:recipientSource.sha256,response:'Not downloaded yet'})).status,409);
  const unreceivedLock=await run('partner','archive-seal',{},409);
  const downloaded=await service.request('/delivery/'+token+'/artifact','');assert.equal(downloaded.status,200);assert.equal(hash(await downloaded.text()),approved.authorized.artifactSha256);
  assert.equal((await service.request('/delivery/'+token,'',{sha256:recipientSource.sha256,response:'Exact controlled original received'})).status,200);
  assert.equal((await service.request('/delivery/'+token,'')).status,404);
  const received=await view('partner');
  const policy=await evidence('assembly-policy.csv','Synthetic classification, 30 calendar days from issue; retention uses explicit approved issue anchor');
  await checkpoint('assembly-ready');
  const assemblyFields={policy:'Synthetic assembly policy edition 1',policyEvidence:policy,anchorKind:'issue',days:'30',classification:'Confidential audit file',retentionBasis:'Synthetic approved ten-year schedule from actual issue; holds separately controlled',indexReview:'Reviewed exact report, final statements, work, original files and links'};
  const assembly=await save('M12-F02',assemblyFields,'preparer');
  const unassembled=await run('partner','archive-seal',{},409);
  const damage=new DatabaseSync(database),originalAuthority=damage.prepare('SELECT bytes FROM evidence WHERE id=? AND engagement_id=?').get(authority,id).bytes;
  let corruptAssembly;
  try{damage.prepare('UPDATE evidence SET bytes=? WHERE id=? AND engagement_id=?').run(Buffer.from('corrupt original'),authority,id);assert((await view('partner')).assembly.gaps.some(g=>g.includes('report-authority.csv')));corruptAssembly=await action('M12-F02',assembly,'submit','preparer',409);}
  finally{damage.prepare('UPDATE evidence SET bytes=? WHERE id=? AND engagement_id=?').run(originalAuthority,authority,id);damage.close();}
  await action('M12-F02',assembly,'submit','preparer');const ownAssemblyApproval=await action('M12-F02',assembly,'approve','preparer',403);
  await action('M12-F02',assembly,'return','partner');await action('M12-F02',assembly,'submit','preparer');
  const assembled=await action('M12-F02',assembly,'approve','partner');assert.equal(assembled.assembly.current,true);assert.equal(assembled.authorized.current,true);assert.deepEqual(assembled.assembly.gaps,[]);
  const sealed=await run('partner','archive-seal'),archive=sealed.archive.packages[0];
  assert.equal((await view('reviewer')).registers.some(r=>r.kind==='M12-F02'),false);
  const lockedEdit=await run('preparer','save',{form:'3.1.2',execution:'Cannot change locked work',conclusion:'Denied'},409);
  const grant=await approve('M12-F07',{package:archive.id,accessor:'reviewer',reason:'Approved independent retrieval',until:'2099-01-01'});
  const retention=await approve('M12-F08',{package:archive.id,type:'policy',reference:'Synthetic approved retention edition',anchor:issuedAt.slice(0,10),years:'10',basis:'Explicit fixture policy; no inferred legal clock'});
  const hold=await approve('M12-F08',{package:archive.id,type:'hold',reference:'Active inspection request',basis:'Preserve during inspection'});
  await run('partner','archive-offer-custody',{package:archive.id,recipient:'Independent archive custodian'});
  const independent=await service.request(scope('/oversight',id),cookies.custodian);assert.equal(independent.status,200);
  const manifest=(await independent.json()).custody;
  assert.equal((await service.request(scope('/oversight/action',id),cookies.custodian,{action:'accept',package:archive.id,digest:archive.digest,reason:'Not downloaded'})).status,409);
  const original=await service.request(scope('/oversight/download/'+archive.id,id),cookies.custodian);assert.equal(original.status,200);const payload=await original.text(),bundle=JSON.parse(payload);
  assert.equal(hash(payload),archive.digest);assert.equal(bundle.assembly.id,assembly);assert.equal(bundle.assembly.basis.reportSha256,approved.authorized.artifactSha256);assert.notEqual(bundle.assembly.completedAt,bundle.issue.at);assert.equal(hash(bundle.authorization.artifact.html),bundle.issue.reportSha256);assert(bundle.evidence.some(e=>e.id===policy&&hash(Buffer.from(e.base64,'base64'))===e.sha256));
  assert(bundle.assembly.authorizationHistory.some(row=>row.authorization.artifact.sha256===firstDigest));assert(bundle.assembly.history.records.find(row=>row.id===preparation).history.length>=6);
  assert.equal((await service.request(scope('/oversight/action',id),cookies.custodian,{action:'accept',package:archive.id,digest:'wrong',reason:'Wrong manifest'})).status,409);
  const damagedArchive=new DatabaseSync(database);damagedArchive.prepare('UPDATE pilot_archives SET payload=? WHERE id=? AND engagement_id=?').run('{}',archive.id,id);
  const failedManifest=await (await service.request(scope('/oversight',id),cookies.custodian)).json();assert(failedManifest.manifestError);assert.equal(failedManifest.custody.digest,archive.digest);
  const returnedCustody=await service.request(scope('/oversight/action',id),cookies.custodian,{action:'return',package:archive.id,digest:archive.digest,owner:'partner',reason:'Manifest integrity mismatch; partner must restore verified original'});assert.equal(returnedCustody.status,200);
  assert.equal((await returnedCustody.json()).custody.returned.owner,'partner');
  damagedArchive.prepare('UPDATE pilot_archives SET payload=? WHERE id=? AND engagement_id=?').run(payload,archive.id,id);damagedArchive.close();
  await run('partner','archive-offer-custody',{package:archive.id,recipient:'Independent archive custodian'},400);
  const reoffered=await run('partner','archive-offer-custody',{package:archive.id,recipient:'Independent archive custodian',resolution:'Restored the exact retained payload and verified original digest'});
  assert.equal(reoffered.oversight.custody.length,2);assert(reoffered.oversight.custody[0].returned);
  const verifiedAgain=await service.request(scope('/oversight/download/'+archive.id,id),cookies.custodian);assert.equal(hash(await verifiedAgain.text()),archive.digest);
  assert.equal((await service.request(scope('/oversight/action',id),cookies.custodian,{action:'accept',package:archive.id,digest:archive.digest,reason:'Verified readable originals, index and report; exact digest retained'})).status,200);
  const retrieved=await service.request(scope('/archive-export/'+grant,id),cookies.reviewer,{reason:'Read-only archived original'});assert.equal(retrieved.status,200);const retrievedBundle=await retrieved.json();assert.equal(retrievedBundle.digest,archive.digest);assert.equal(hash(JSON.stringify(retrievedBundle.content)),archive.digest);
  const expired=await approve('M12-F07',{package:archive.id,accessor:'reviewer',reason:'Expired inspection purpose',until:'2020-01-01'});
  const expiredExport=await service.request(scope('/archive-export/'+expired,id),cookies.reviewer,{reason:'Expired grant denied'});assert.equal(expiredExport.status,403);
  const successorRequest=await approve('M12-F04',{package:archive.id,type:'administrative',changes:'Clarify the archive index caption',basis:'No audit conclusion or report bytes changed'});
  let lineage=await view('partner');const successorId=lineage.registers.find(r=>r.id===successorRequest).successor;
  const successorGrant=await approve('M12-F07',{package:successorId,accessor:'reviewer',reason:'Approved successor inspection',until:'2099-01-01'});
  const shorter=await approve('M12-F08',{package:successorId,type:'policy',reference:'Synthetic shorter local rule',anchor:'2000-01-01',years:'1',basis:'Cannot override the longer inherited policy'});
  lineage=await view('partner');const successor=lineage.archive.packages.find(p=>p.id===successorId);
  assert.equal(successor.previous,archive.id);assert.equal(successor.retention.policy,retention);assert.equal(successor.holds,1);
  const dispose=await save('M12-F11',{package:successorId,policy:shorter,basis:'Attempt to use shorter rule'});
  const shortened=await action('M12-F11',dispose,'submit','reviewer',409);assert(shortened.error.includes(successor.retention.expires));
  const successorExport=await (await service.request(scope('/archive-export/'+successorGrant,id),cookies.reviewer,{reason:'Read successor'})).json();
  const {changes,...originalContent}=successorExport.content;assert.equal(hash(JSON.stringify(originalContent)),archive.digest);assert.equal(changes.approvedBy,'partner');
  await run('partner','register',{kind:'M12-F07',id:grant,operation:'revoke',reason:'Original inspection finished'});
  const revokedExport=await service.request(scope('/archive-export/'+grant,id),cookies.reviewer,{reason:'Revoked grant denied'});assert.equal(revokedExport.status,403);
  await service.close();service=await start(database);for(const role of Object.keys(passwords))await login(role);
  const restored=await view('partner');assert.equal(restored.archive.packages.find(p=>p.id===archive.id).digest,archive.digest);assert(restored.archive.packages[0].retention);assert.equal(restored.assembly.current,true);
  const persistedExport=await (await service.request(scope('/archive-export/'+successorGrant,id),cookies.reviewer,{reason:'Read exact successor after restart'})).json();assert.equal(persistedExport.digest,successorExport.digest);
  assert((await view('partner')).registers.some(r=>r.id===preparation&&r.kind==='M10-F10'));assert((await view('partner')).registers.some(r=>r.id===assembly&&r.kind==='M12-F02'));
  await checkpoint('completed');
  const prepared=restored.registers.find(r=>r.id===preparation),opined=restored.registers.find(r=>r.id===opinion),sufficient=restored.registers.find(r=>r.id===sufficiency);
  const proof=(step,actor,action,expected,actual,versions)=>({id:step,engagement:id,actor,action,expected,actual,versions});
  const reportVersions={preparation:prepared.version,statements:prepared.statementVersion,report:approved.authorized.report,digest:approved.authorized.artifactSha256};
  recordLifecycleEvidence(t,{lifecycle:'A26',engagement:id,scope:'Qualified report with a supported nonpervasive scope limitation; local signature/delivery profile; no independent source acceptance.',steps:[
    proof('A26-P1-W1','reviewer/partner','Review supported evidence, final analytics and retained limitations',{analytics,result:'limited'},{analytics:sufficient.values.analytics,result:sufficient.values.result},{sufficiency:sufficient.version}),
    proof('A26-P1-W2','reviewer/partner','Evaluate uncorrected 25 and the separate scope limitation',{gross:2500,overall:100,by:'partner'},{gross:signed.completion.evaluation.inputs.gross,overall:signed.completion.evaluation.inputs.limits.overall,by:signed.completion.evaluation.approval.by},{evaluation:signed.completion.evaluation.version,materiality:signed.completion.evaluation.inputs.materiality}),
    proof('A26-P1-W3','partner','Approve the chosen opinion and matching source template',{opinion:'qualified',basis:'evidence',template:'4.1.A2'},{opinion:opined.values.opinion,basis:opined.values.basisType,template:prepared.template.form},{opinion:opined.version,preparation:prepared.version}),
    proof('A26-P2-W1','preparer/partner','Prepare and approve a versioned report against the selected edition',{edition:'Synthetic report edition 1',status:'approved',form:'4.1.A2'},{edition:prepared.values.edition,status:prepared.status,form:prepared.values.template},reportVersions),
    proof('A26-P2-W2','preparer/partner','Check exact statements, date, addressee and signature authority',{date:today,addressee:'Updated reviewed shareholders',signatory:prep.signatory},{date:prepared.values.reportDate,addressee:prepared.values.addressee,signatory:prepared.values.signatory},reportVersions),
    proof('A26-P2-W3','preparer/partner','Record reporting-duty applicability, supporting edition and human assessment',{duties:'none',evidence:authority,by:'partner'},{duties:prepared.values.duties,evidence:prepared.values.authorityEvidence,by:prepared.by},{preparation:prepared.version,authority:prepared.references[opinion]}),
    proof('A26-P3-W1','partner','Authorize the final management-approved package',{current:true,management:'partner',representations:'received'},{current:approved.authorized.current,management:approved.completion.management.approval.by,representations:approved.registers.find(r=>r.kind==='M10-F12').values.result},reportVersions),
    proof('A26-P3-W2','partner','Sign only the current exact authorized bytes',{method:'pilot-ed25519',digest:approved.authorized.artifactSha256},{method:signed.release.signature.method,digest:signed.release.signature.artifact},{authorization:approved.authorized.at,signature:signed.release.signature.at}),
    proof('A26-P3-W3','partner/local recipient','Issue the controlled report and retain actual download and receipt',{digest:approved.authorized.artifactSha256,state:'received'},{digest:issued.archive.issue.reportSha256,state:received.release.deliveries.find(d=>d.id===delivery.deliveryLink.id).state},{issue:issuedAt,receipt:received.release.deliveries.find(d=>d.id===delivery.deliveryLink.id).received}),
  ],branches:[
    proof('wrong-template-or-stale-package','preparer','Reject mismatched report form',409,wrongTemplate._httpStatus,reportVersions),
    proof('independent-issuer-required','reviewer','Reject unauthorized report authorization',403,unauthorized._httpStatus,reportVersions),
    proof('renewed-preparation-stales-release','partner','Reject old authorization after preparation changes',409,staleIssue._httpStatus,{oldDigest:firstDigest,newDigest:approved.authorized.artifactSha256}),
    proof('signature-and-receipt-required','partner','Reject unsigned issue and premature archive',{issue:409,lock:409},{issue:unsigned._httpStatus,lock:unreceivedLock._httpStatus},reportVersions),
    proof('idempotent-issue-and-changed-payload','partner','Reject reuse of an issue retry identity with changed content',409,changedRetry._httpStatus,{issue:issuedAt,key:issueKey}),
    proof('ambiguous-delivery-reconciled-before-retry','partner','Reconcile unknown outcome before issuing another recipient link',{retry:409,events:['unknown','failed']},{retry:unknownRetry._httpStatus,events:reconciled.release.deliveries[0].events.map(e=>e.state)},{first:firstDelivery.deliveryLink.id,retry:delivery.deliveryLink.id}),
  ]});
  const archiveVersions={original:archive.id,digest:archive.digest,assembly:bundle.assembly.version};
  recordLifecycleEvidence(t,{lifecycle:'A27',engagement:id,scope:'Policy-configured calendar-day assembly, qualified report, retained originals/history, local independent custody and administrative successor.',steps:[
    proof('A27-P1-W1','preparer','Index the signed report, statements, work, records and originals',['evidence','paper','record','report','statements'],[...new Set(bundle.assembly.items.map(i=>i.kind))].sort(),archiveVersions),
    proof('A27-P1-W2','preparer/partner','Diagnose review-note and cross-reference completeness',[],assembled.assembly.gaps,{inventory:bundle.assembly.basis.inventoryDigest}),
    proof('A27-P1-W3','partner','Approve assembly without altering the report conclusion',approved.authorized.artifactSha256,hash(bundle.authorization.artifact.html),archiveVersions),
    proof('A27-P2-W1','partner','Apply the supplied assembly deadline policy',new Date(Date.parse(issuedAt.slice(0,10)+'T00:00:00Z')+30*86_400_000).toISOString().slice(0,10),bundle.assembly.basis.deadline,{policy:policy,completed:bundle.assembly.completedAt}),
    proof('A27-P2-W2','partner','Lock the independently completed exact file and reject ordinary changes',{sealed:true,denied:409},{sealed:sealed.archive.sealed,denied:lockedEdit._httpStatus},archiveVersions),
    proof('A27-P2-W3','partner','Preserve earlier report authorizations and preparation history',{oldDigest:firstDigest,history:true},{oldDigest:bundle.assembly.authorizationHistory[0].authorization.artifact.sha256,history:bundle.assembly.history.records.find(r=>r.id===preparation).history.length>=6},archiveVersions),
    proof('A27-P3-W1','partner','Record an explicit retention policy and active hold',{policy:retention,holds:1},{policy:successor.retention.policy,holds:successor.holds},{retention,hold}),
    proof('A27-P3-W2','partner/custodian','Transfer, return a corrupt package, restore and independently accept',{by:'custodian',digest:archive.digest},{by:restored.oversight.custody.at(-1).accepted.by,digest:restored.oversight.custody.at(-1).accepted.digest},{offer:restored.oversight.custody.at(-1).offeredAt,received:restored.oversight.custody.at(-1).accepted.at}),
    proof('A27-P3-W3','reviewer','Retrieve an authorized successor after restart',successorExport.digest,persistedExport.digest,{successor:successorId,grant:successorGrant}),
  ],branches:[
    proof('missing-or-corrupt-source-blocks-assembly','preparer','Reject corrupted original during assembly',409,corruptAssembly._httpStatus,archiveVersions),
    proof('assembly-return-and-independent-approval','preparer/partner','Return, resubmit and reject self approval',{unapproved:409,self:403,current:true},{unapproved:unassembled._httpStatus,self:ownAssemblyApproval._httpStatus,current:assembled.assembly.current},archiveVersions),
    proof('locked-edit-denied','preparer','Deny ordinary changes after locking',409,lockedEdit._httpStatus,archiveVersions),
    proof('corrupt-custody-return-and-reoffer','custodian/partner','Keep discrepancy and corrective re-offer history',{offers:2,owner:'partner',resolution:true},{offers:restored.oversight.custody.length,owner:restored.oversight.custody[0].returned.owner,resolution:!!restored.oversight.custody[1].resolution},archiveVersions),
    proof('scoped-and-expiring-retrieval','reviewer','Reject expired and revoked archive grants',{expired:403,revoked:403},{expired:expiredExport.status,revoked:revokedExport.status},{expiredGrant:expired,revokedGrant:grant}),
    proof('successor-retains-original-hold-and-retention','partner','Preserve original and reject shorter successor retention',{original:archive.digest,policy:retention,holds:1,denied:409},{original:hash(JSON.stringify(originalContent)),policy:successor.retention.policy,holds:successor.holds,denied:shortened._httpStatus},{original:archive.id,successor:successorId}),
    proof('restart-preserves-exact-archive','reviewer','Recover the identical successor with its access and manifest',successorExport.digest,persistedExport.digest,{successor:successorId,grant:successorGrant}),
  ]});
 }finally{await service.close();await rm(dir,{recursive:true,force:true});}
});
