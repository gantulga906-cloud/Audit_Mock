import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,mkdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {DatabaseSync,backup} from 'node:sqlite';
import {randomUUID} from 'node:crypto';
import {automationChecks} from '../src/lib/pilot-automation-methods.ts';
import {calculateAutomation} from '../scripts/pilot-automation-checks.mjs';
import {automationSamples,automationContext,policyFor,rawTablesFor,csvFor} from './helpers/pilot-automation-samples.mjs';
import {start,today} from './helpers/pilot-acceptance-fixture.mjs';
import {automationFixture} from './helpers/pilot-automation-fixture.mjs';
import {finalisationFixture,completionCase} from './helpers/pilot-finalisation-fixture.mjs';
import {nativeAutomationDiagnostics} from '../src/lib/pilot-automation-diagnostics.ts';
const proof=[],matrix=[];
after(async()=>{if(process.env.AUDIT_G11_FIXTURE_DIR){const out=resolve(process.env.AUDIT_G11_FIXTURE_DIR);await mkdir(out,{recursive:true});await writeFile(join(out,'G11_Connected_Proof.json'),JSON.stringify({guide:'G11',proof,matrix,scope:'Actual supported method executions and persisted named-role checks. Historical specification examples, existing domain fixtures and whole-minimum acceptance remain distinct.',sourceAcceptance:[],releaseReady:false},null,2)+'\n');}});
const calculate=(id,tables=rawTablesFor(id),policy=policyFor(id))=>calculateAutomation(id,automationContext,tables,policy);
function observed(id,r){
 switch(id){
  case 'AUTO-012':return {cases:r.cases.length,timingCandidates:r.outputs.filter(x=>x.timingCandidate).length};
  case 'AUTO-013':return {daysOverdue:r.outputs.find(x=>x.type==='aging').daysOverdue,residual:r.outputs.find(x=>x.type==='receivable-residual').residual};
  case 'AUTO-018':return {invoiceMinusReceipt:r.outputs.find(x=>x.type==='document-chain').invoiceMinusReceipt};
  case 'AUTO-025':return Object.fromEntries(['issueCost','closingValue','expectedClosingQuantity'].map(k=>[k,r.outputs[0][k]]));
  case 'AUTO-027':return Object.fromEntries(['expectedGross','grossDifference','expectedAccumulated'].map(k=>[k,r.outputs[0][k]]));
  case 'AUTO-041':return Object.fromEntries(['confirmedAmount','disclosureDifference','unconfirmedIndicators'].map(k=>[k,r.outputs[0][k]]));
  case 'AUTO-042':return Object.fromEntries(['matrix','difference','rollforward'].map(k=>[k,r.outputs[0][k]]));
  case 'AUTO-011':return {expected:r.outputs[0].expected,difference:r.outputs[0].difference};
  case 'AUTO-015':return {expected:r.outputs[0].expected,difference:r.outputs[0].difference,expectedDeferred:r.outputs[0].expectedDeferred};
  case 'AUTO-017':return {gross:r.outputs.find(x=>x.type==='unique-source-exposure').gross};
  case 'AUTO-021':return {cases:r.cases.length,gross:r.outputs.find(x=>x.type==='event-exposure').gross};
  case 'AUTO-024':return {quantityResidual:r.outputs[0].quantityResidual,timingReasons:r.outputs[0].timingReasons};
  case 'AUTO-026':return Object.fromEntries(['nrvUnit','shortfall','ageDays','ageIndicator'].map(k=>[k,r.outputs[0][k]]));
  case 'AUTO-028':return Object.fromEntries(['annual','charge','closingAccumulated'].map(k=>[k,r.outputs[0][k]]));
  case 'AUTO-029':case 'AUTO-030':case 'AUTO-045':return {cases:r.cases.length};
  case 'AUTO-043':{const row=r.outputs.find(x=>x.type==='consolidation');return {expected:row.expected,difference:row.difference,reciprocalResidual:r.outputs.find(x=>x.type==='reciprocal').residual};}
  case 'AUTO-044':return Object.fromEntries(['currentRatio','headroom','firstBreachPeriod'].map(k=>[k,r.outputs[0][k]]));
 }
}
test('G11 nineteen source method examples calculate independent expected results and preserve missing unsupported and quarantined outcomes',()=>{
 for(const [id,sample] of Object.entries(automationSamples)){
  const r=calculate(id),actual=observed(id,r);assert.deepEqual(actual,sample.expected,id);proof.push({automation:id,expected:sample.expected,actual,algorithm:r.profile.algorithm,fictionalPolicy:true});
  assert.throws(()=>calculate(id,{}),/source rows/);assert.throws(()=>calculate(id,rawTablesFor(id),{...policyFor(id),algorithm:'unsupported'}),/exact in-scope/);
  const raw=rawTablesFor(id),name=Object.keys(raw)[0];raw[name][0].entity='OTHER';const q=calculate(id,raw);assert.ok(q.issues.length);assert.equal(q.outputs[0].evaluated,false);assert.ok(!q.outputs.some(r=>r.expected!==undefined));
  const missing=rawTablesFor(id);missing[name][0].id='';assert.equal(calculate(id,missing).outputs[0].evaluated,false);
  matrix.push({automation:id,scenario:'independent-example',outcome:'passed',actual},{automation:id,scenario:'missing-or-unsupported',outcome:'passed'},{automation:id,scenario:'scope-or-key-quarantine',outcome:'passed'});
 }
});
test('G11 method boundaries preserve event grain, exact identities, rounding, caps, unknowns and signed direction',()=>{
 let t=rawTablesFor('AUTO-017');t.parties.forEach(p=>p.registration='SAME');assert.equal(calculate('AUTO-017',t).outputs.find(r=>r.type==='unique-source-exposure').gross,30000);
 t=rawTablesFor('AUTO-017');t.parties[1].bank='B-001';assert.equal(calculate('AUTO-017',t).cases.length,0);
 t=rawTablesFor('AUTO-021');t.cash=[{...t.cash[0],id:'A',amount:'1000',reference:'PAIR'},{...t.cash[0],id:'B',account:'BANK-B',amount:'-1000',reference:'PAIR'}];let r=calculate('AUTO-021',t);assert.equal(r.cases.length,1);assert.equal(r.outputs.find(x=>x.type==='event-exposure').gross,100000);
 t=rawTablesFor('AUTO-015');Object.assign(t.contracts[0],{start:'2024-12-01',end:'2025-02-28',price:'900',recorded:'590',recordedDeferred:'0'});assert.equal(calculate('AUTO-015',t,policyFor('AUTO-015',{convention:'actual-days-inclusive'})).outputs[0].expected,59000);
 t=rawTablesFor('AUTO-024');t.movements.push({...t.movements[1],id:'IN2'});assert.ok(calculate('AUTO-024',t).issues.some(i=>i.issue==='unmatched-or-ambiguous-transfer'));assert.ok(!calculate('AUTO-024',t).outputs.some(r=>r.quantityResidual!==undefined));
 t=rawTablesFor('AUTO-026');t.stock[0].quantity='999999999';t.stock[0].cost='1000000000';assert.throws(()=>calculate('AUTO-026',t),/integer range/);
 t=rawTablesFor('AUTO-028');t.assets[0].openingAccumulated='1001';assert.throws(()=>calculate('AUTO-028',t),/prior accumulated/);t.assets[0].life='0';assert.equal(calculate('AUTO-028',t).outputs[0].evaluated,false);
 t=rawTablesFor('AUTO-043');t.components.push({...t.components[0],id:'A2'});r=calculate('AUTO-043',t);assert.equal(r.outputs[0].evaluated,false);
 t=rawTablesFor('AUTO-044');t.balances[0].facilityStatus='unknown';assert.throws(()=>calculate('AUTO-044',t),/not evaluable/);t.balances[0].facilityStatus='approved-accessible';t.balances[0].currentLiabilities='0';assert.throws(()=>calculate('AUTO-044',t),/denominator/);
 t=rawTablesFor('AUTO-045');t.transactions.push({...t.transactions[0],id:'P3'});r=calculate('AUTO-045',t);assert.equal(r.cases.length,1);assert.equal(r.cases[0].metrics.gross,10000);assert.equal(r.outputs.find(r=>r.id==='E1').sourceRows.length,2);
 proof.push({eventExposureNotMultiplied:true,identitySignificantCharactersPreserved:true,actualDayAllocation:true,ambiguousGrainNotEvaluated:true,overflowRejected:true,negativeRemainingBaseNotComputed:true,unknownAvailabilityNotZero:true,sourceEventMultiplicityPreserved:true});
});
test('G11 named accepted original methods preserve independent review changed policy source retry private scope corruption and restart',async()=>{
 const root=await mkdtemp(join(tmpdir(),'audit-g11-')),database=join(root,'workspace.sqlite');let app;
 try{
  app=await start(database,true);const seed=await automationFixture(app),{id,scope,source,users}=seed,checks={},inputs={};
  const current=(state,cid)=>state.dataMethods.checks.find(c=>c.id===cid).current;
  for(const automation of Object.keys(automationSamples)){
   const sources={};for(const input of automationChecks[automation].inputs)sources[input.key]=await source(csvFor(automation,input.key),automation+'-'+input.key+'.csv');const policy=await source(JSON.stringify(policyFor(automation)),automation+'-policy.json'),fields={method:automation,primary:sources[automationChecks[automation].inputs[0].key],use:'Actual supported fictional G11 method; explicit professional limits retained',configuration:JSON.stringify({currency:'MNT',policy,sources})};inputs[automation]={fields,sources,policy};
   await app.write('partner',id,'data-check-run',fields,403);await app.write('preparer',id,'data-check-run',{...fields,configuration:JSON.stringify({currency:'MNT',policy,sources:{}})},409);
   const before=new Set((await app.view('preparer',id)).dataMethods.checks.map(c=>c.id));let state=await app.write('preparer',id,'data-check-run',fields),cid=state.dataMethods.checks.find(c=>!before.has(c.id)).id;checks[automation]=cid;const first=current(state,cid);assert.equal(first.by,users.preparer);assert.deepEqual(observed(automation,first),automationSamples[automation].expected);
   await app.write('preparer',id,'data-check-submit',{id:cid,version:'1'});await app.write('preparer',id,'data-check-approve',{id:cid,version:'1',disposition:'usable',reason:'Cannot self review'},403);
   await app.write('reviewer',id,'data-check-return',{id:cid,version:'1',reason:'Retain explicit actual method limitations and supported calculation boundary'});await app.write('preparer',id,'data-check-submit',{id:cid,version:'1'});
   state=await app.write('reviewer',id,'data-check-approve',{id:cid,version:'1',disposition:first.issues.length?'limited':'usable',reason:'Independently reperformed the actual supplied source example, exact edition, parameters, signed results and unsupported boundary'});assert.equal(current(state,cid).current,true);assert.equal(current(state,cid).review.by,users.reviewer);
   state=await app.write('preparer',id,'data-check-run',{...fields,id:cid});assert.equal(current(state,cid).version,1);assert.equal(current(state,cid).review.by,users.reviewer);
   const primaryKey=automationChecks[automation].inputs[0].key,replaced=await source(csvFor(automation,primaryKey)+'\n',automation+'-replacement-'+primaryKey+'.csv'),nextSources={...sources,[primaryKey]:replaced},nextFields={...fields,primary:replaced,configuration:JSON.stringify({currency:'MNT',policy,sources:nextSources})};state=await app.write('preparer',id,'data-check-run',{...nextFields,id:cid});assert.equal(current(state,cid).version,2);assert.equal(current(state,cid).current,false);assert.equal(state.dataMethods.checks.find(c=>c.id===cid).versions[0].review.by,users.reviewer);assert.notEqual(current(state,cid).inputs.find(r=>r.id===replaced).sha256,first.inputs.find(r=>r.id===fields.primary).sha256);await app.write('preparer',id,'data-check-submit',{id:cid,version:'2'});state=await app.write('reviewer',id,'data-check-approve',{id:cid,version:'2',disposition:current(state,cid).issues.length?'limited':'usable',reason:'Independently assessed the actual replacement original and current method version; earlier bytes and review remain in history'});inputs[automation]={fields:nextFields,sources:nextSources,policy};matrix.push({automation,scenario:'changed-original-renewed-independent-review',outcome:'passed'});
   matrix.push({automation,scenario:'accepted-original-named-independent-review',outcome:'passed',check:cid},{automation,scenario:'missing-denied-self-return-retry',outcome:'passed'});
  }
  const selected='AUTO-015',original=inputs[selected],changedPolicy={...policyFor(selected),edition:'FICTITIOUS-G11-2'};changedPolicy.parameters={convention:'actual-days-inclusive'};const replacement=await source(JSON.stringify(changedPolicy),'replacement-policy.json'),configuration=JSON.parse(original.fields.configuration);configuration.policy=replacement;
  let state=await app.write('preparer',id,'data-check-run',{...original.fields,id:checks[selected],configuration:JSON.stringify(configuration)});assert.equal(current(state,checks[selected]).version,3);assert.equal(state.dataMethods.checks.find(c=>c.id===checks[selected]).versions[0].review.by,users.reviewer);assert.equal(current(state,checks['AUTO-011']).current,true);
  await app.write('preparer',id,'data-check-submit',{id:checks[selected],version:'3'});await app.write('reviewer',id,'data-check-approve',{id:checks[selected],version:'3',disposition:'limited',reason:'Actual declared inclusive-day allocation independently inspected; different edition remains explicit'});
  const bad=await source('{"kind":"audit-automation-policy","broken":true}','invalid-policy.json');await app.write('preparer',id,'data-check-run',{...original.fields,id:checks[selected],configuration:JSON.stringify({...configuration,policy:bad})},409);
  const changedSource=inputs['AUTO-011'].sources.sales;await app.write('preparer',id,'support-scope',{id:changedSource,...scope,evidenceType:'schedule',supplier:'Actual fictional G11 source owner',receivedOn:today(),channel:'manual',reason:'Actual source scope correction creates a new version'});state=await app.view('reviewer',id);assert.equal(current(state,checks['AUTO-011']).current,false);assert.equal(current(state,checks['AUTO-015']).current,true);assert.equal(current(state,checks['AUTO-011']).review.by,users.reviewer);
  const db=new DatabaseSync(database),target=inputs['AUTO-026'].policy,raw=db.prepare('SELECT bytes FROM evidence WHERE id=?').get(target).bytes;db.prepare('UPDATE evidence SET bytes=? WHERE id=?').run(Buffer.from('corrupt-policy'),target);state=await app.view('reviewer',id);assert.equal(current(state,checks['AUTO-026']).current,false);await app.write('preparer',id,'data-check-run',{...inputs['AUTO-026'].fields,id:checks['AUTO-026']},409);db.prepare('UPDATE evidence SET bytes=? WHERE id=?').run(raw,target);db.close();
  const privateState=await app.write('reviewer','firm','create',{client:'Private G11 other engagement',legalForm:'Test',registration:'G11-PRIVATE',framework:'Test',contact:'Private contact',email:'private@example.test',start:'2025-01-01',end:'2025-12-31',reportDate:'2026-12-31'});const denied=await app.request(app.path('/action',privateState.selected),app.cookies.preparer,{action:'data-check-run',revision:0,fields:inputs['AUTO-011'].fields});assert.equal(denied.status,404);
  const snapshot=(await app.view('reviewer',id)).dataMethods.checks;await app.close();app=await start(database,false);const call=async(role)=>{const response=await app.request('/login','',{username:'g11.'+role,password:'123'});assert.equal(response.status,200);app.cookies[role]=response.headers.get('set-cookie').split(';')[0];};await call('preparer');await call('reviewer');const restored=(await app.view('reviewer',id)).dataMethods.checks;assert.deepEqual(restored,snapshot);
  proof.push({actualAcceptedOriginalMethods:Object.keys(automationSamples).length,actualNamedPreparer:users.preparer,actualDifferentReviewer:users.reviewer,returnedAndReviewed:true,exactRetryPreservesApproval:true,changedPolicyCreatesNewVersion:true,selectiveSourceChange:true,corruptPolicyDenied:true,otherEngagementDenied:true,restartPreservesExactHistory:true});
  if(process.env.AUDIT_G11_FIXTURE_DIR){const out=resolve(process.env.AUDIT_G11_FIXTURE_DIR);await mkdir(out,{recursive:true});const db=new DatabaseSync(database,{readOnly:true});try{await backup(db,join(out,'g11-ready.sqlite'));}finally{db.close();}await writeFile(join(out,'g11-fixture.json'),JSON.stringify({database:join(out,'g11-ready.sqlite'),engagement:id,scope,users,checks,inputs,credentials:{username:'g11.preparer',password:'123'}}));}
 }finally{await app?.close();await rm(root,{recursive:true,force:true});}
});
test('G11 native legal going-concern and disclosure diagnostics require actual support judgments anchors and independent review',async()=>{
 const root=await mkdtemp(join(tmpdir(),'audit-g11-native-'));let app;
 try{
  app=await start(join(root,'native.sqlite'),true);const {id,support,notes}=await finalisationFixture(app);
  const legal={paper:'3.1.2',matters:'Actual identified fictional legal matter M1',exposure:'unknown',counsel:'Actual counsel inquiry and outstanding response',alternatives:'Actual alternatives remain unsupported and explicitly limited',accounting:'Actual auditor assessment remains open',disclosure:'Actual disclosure decision remains open'};
  let state=await app.write('preparer',id,'completion-case-save',{kind:'legal',title:'Actual unknown unsupported legal matter',values:JSON.stringify(legal),nextOwner:'reviewer',followup:'Obtain actual legal support and human accounting/disclosure assessment'}),open=state.completion.finalisation.records.find(r=>r.title==='Actual unknown unsupported legal matter');await app.write('preparer',id,'completion-case-submit',{id:open.id,version:'1'},409);
  await completionCase(app,id,'legal',{...legal,matters:'Actual separate legal matter M2',exposure:'100',counsel:'Inspected actual received fictional counsel support',accounting:'Actual auditor selected treatment with supported rationale',disclosure:'Exact selected disclosure and human assessment retained'},support,{title:'Actual supported legal matter'});
  state=await app.view('reviewer',id);let diagnostic=nativeAutomationDiagnostics(state).find(r=>r.id==='AUTO-049');assert.deepEqual({open:diagnostic.metrics.open,ready:diagnostic.metrics.readyForReview,unknown:diagnostic.metrics.unknownExposure},{open:1,ready:1,unknown:1});
  const going={paper:'3.1.2',edition:'Actual fictional source edition',assessment:'Inspected supplied management assessment',conditions:'Actual liquidity condition',plans:'Unsupported financing is not assumed feasible',contrary:'Actual contradictory evidence remains',basis:'',uncertainty:'',disclosure:'',limitation:'Missing actual auditor decisions; forecast arithmetic cannot supply them'};
  state=await app.write('preparer',id,'completion-case-save',{kind:'going',title:'Actual incomplete going-concern work',values:JSON.stringify(going),evidence:support,nextOwner:'reviewer',followup:'Perform and independently review actual assessment and separate report consequences'});const gc=state.completion.finalisation.records.find(r=>r.kind==='going');await app.write('preparer',id,'completion-case-submit',{id:gc.id,version:'1'},409);diagnostic=nativeAutomationDiagnostics(await app.view('reviewer',id)).find(r=>r.id==='AUTO-050');assert.equal(diagnostic.metrics.unresolved,1);assert.equal(diagnostic.metrics.ready,false);
  const requirements=[{id:'A',applicability:'applicable',anchor:'Note 1/page 2',evidence:notes,reason:'Actual selected requirement'},{id:'B',applicability:'applicable',evidence:notes,reason:'Missing exact selected note anchor'},{id:'C',applicability:'na',reason:'Actual entity circumstance independently justified'}],values={edition:'Actual fictional disclosure checklist edition',requirements:JSON.stringify(requirements),conclusion:'Actual selected requirements; semantic compliance remains human'};
  state=await app.write('preparer',id,'completion-case-save',{kind:'disclosures',title:'Actual three disclosure requirements',values:JSON.stringify(values),evidence:support,nextOwner:'reviewer',followup:'Resolve missing note anchor and independently review exact selected note version'});const disclosure=state.completion.finalisation.records.find(r=>r.kind==='disclosures');await app.write('preparer',id,'completion-case-submit',{id:disclosure.id,version:'1'},409);diagnostic=nativeAutomationDiagnostics(await app.view('reviewer',id)).find(r=>r.id==='AUTO-052');assert.equal(diagnostic.metrics.missingApplicable,1);assert.equal(diagnostic.metrics.justifiedNa,1);assert.equal(diagnostic.metrics.ready,false);
  requirements[1].anchor='Note 5/page 9';await completionCase(app,id,'disclosures',{...values,requirements:JSON.stringify(requirements)},support,{id:disclosure.id,title:'Actual three disclosure requirements'});diagnostic=nativeAutomationDiagnostics(await app.view('reviewer',id)).find(r=>r.id==='AUTO-052');assert.equal(diagnostic.metrics.missingApplicable,0);assert.equal(diagnostic.metrics.ready,true);
  proof.push({nativeLegal:{open:1,readyForReview:1,unknownExposure:1},nativeGoing:{unresolved:1,ready:false},nativeDisclosures:{missingBefore:1,justifiedNa:1,readyAfterExactAnchorAndIndependentReview:true},missingEvidenceCannotSubmit:true,noAutomaticProfessionalConclusion:true});
 }finally{await app?.close();await rm(root,{recursive:true,force:true});}
});
test('G11 actual ledger and statement source examples expose expected-minus-recorded while preserving legacy residual conventions',async()=>{
 const root=await mkdtemp(join(tmpdir(),'audit-g11-signs-'));let app;
 try{
  app=await start(join(root,'signs.sqlite'),true);const {id,source}=await automationFixture(app),checks=[];
  const tb=await source('account,opening,debit,credit,closing,entity,currency,period\nA,100,30,20,111,G01-CLIENT,MNT,2025-12-31','G11-tb.csv'),ledger=await source('id,account,date,debit,credit,entity,currency\nL1,A,2025-12-31,30,20,G01-CLIENT,MNT','G11-ledger.csv');
  let state=await app.write('preparer',id,'data-check-run',{method:'AUTO-005',primary:tb,secondary:ledger,use:'Actual original EX-005 sign convention and preserved native residual',configuration:JSON.stringify({currency:'MNT',grain:'account',ledgerScope:'selected',tolerance:'0'})});let current=state.dataMethods.checks.at(-1).current;assert.equal(current.outputs[0].expectedClosing,11000);assert.equal(current.outputs[0].sourceDifference,-100);assert.equal(current.outputs[0].rollforward,100);checks.push(current.id);
  const nodes=await source('id,amount,unit,period,entity,currency\nA,100,1,2025-12-31,G01-CLIENT,MNT\nB,200,1,2025-12-31,G01-CLIENT,MNT\nTOTAL,299,1,2025-12-31,G01-CLIENT,MNT','G11-statements.csv');state=await app.write('preparer',id,'data-check-run',{method:'AUTO-007',primary:nodes,use:'Actual original EX-007 cross-foot and missing exact reference',configuration:JSON.stringify({currency:'MNT',tolerance:'0',totals:[{id:'TOTAL',operands:[{id:'A',sign:1},{id:'B',sign:1}]}],references:[{from:'TOTAL',to:'MISSING-NOTE'}],repeated:[]})});current=state.dataMethods.checks.at(-1).current;assert.equal(current.outputs[0].expectedTotal,30000);assert.equal(current.outputs[0].sourceDifference,100);assert.equal(current.outputs[0].residual,-100);assert.equal(current.issues.filter(r=>r.issue==='unresolved-reference').length,1);checks.push(current.id);
  for(const cid of checks){await app.write('preparer',id,'data-check-submit',{id:cid,version:'1'});await app.write('reviewer',id,'data-check-approve',{id:cid,version:'1',disposition:'limited',reason:'Independently inspected exact source, signed expected-minus-recorded difference and separately retained old residual convention; actual exceptions remain'});}
  proof.push({ledgerSourceExample:{expected:11000,sourceDifference:-100,legacyRollforward:100},statementSourceExample:{expected:30000,sourceDifference:100,legacyResidual:-100,missingReferences:1},actualOriginals:true,independentReview:true});
 }finally{await app?.close();await rm(root,{recursive:true,force:true});}
});
