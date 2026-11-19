import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {start} from './helpers/pilot-acceptance-fixture.mjs';
import {planningFixture} from './helpers/pilot-planning-fixture.mjs';
import {auditScalar} from '../src/lib/audit-values.ts';
import {yesNo} from '../src/lib/pilot-forms.ts';
import {readTypedAnswers} from '../scripts/pilot-forms.mjs';
import {snapshot} from '../src/lib/workspace.ts';
import {buildMethodRun,methodRunCurrent,methodReviewDigest,contractDigest,methodRegistry,foundationView} from '../scripts/pilot-method-contracts.mjs';
import {buildBaseline,buildMethodRegistry} from '../scripts/build-audit-baseline.mjs';
import baseline from '../src/data/audit-baseline.json' with {type:'json'};

test('B00 freezes exact identity populations and the settled working/adoption profile',()=>{
 assert.deepEqual(buildBaseline(),baseline);assert.deepEqual(buildMethodRegistry(),methodRegistry);
 assert.equal(methodRegistry.methods.length,36);assert.equal(baseline.sets.originalObligations.count,2247);
 assert.equal(baseline.workingWorkbooks[0].sha256,'5fde7db15e766cdb616cb816d25a8fe6a6d5718f9975d4c0f885c344b079602c');
 assert.ok(baseline.standards.qualityUpdates.includes('ISA 220 (Revised)'));
 assert.equal(foundationView().counts.fields,1236);
});

test('B01 typed values preserve zero, false, unknown, N/A reason and exact decimal precision',()=>{
 const options={yes:yesNo[0],no:yesNo[1],unknown:yesNo[2],na:yesNo[3]};
 assert.deepEqual(auditScalar('number','0'),{state:'known',type:'decimal',value:'0'});
 assert.deepEqual(auditScalar('number','-0.005'),{state:'known',type:'decimal',value:'-0.005'});
 assert.deepEqual(auditScalar('yesno',yesNo[1],options),{state:'known',type:'boolean',value:false});
 assert.equal(auditScalar('yesno',yesNo[2],options).state,'unknown');
 assert.equal(auditScalar('number','').state,'unknown');
 assert.throws(()=>auditScalar('number',' '));assert.throws(()=>auditScalar('number','1e3'));
 assert.throws(()=>auditScalar('yesno',yesNo[3],options),/reason/);
 assert.deepEqual(auditScalar('yesno',yesNo[3],{...options,reason:'No such transaction'}),{state:'not-applicable',reason:'No such transaction'});
 assert.notEqual(contractDigest({v:null}),contractDigest({v:0}));
 assert.equal(contractDigest({b:0,a:false}),contractDigest({a:false,b:0}));assert.throws(()=>contractDigest({a:NaN}));
});

test('B01 native typed adapter retains repeated-row identity through reordering',()=>{
 const fields=[{key:'answer',type:'yesno',source:'B12'},
  {key:'schedule',type:'table',source:'C20',columns:[{key:'amount',type:'number'},{key:'label',type:'text'}]}];
 const model={engagement:'E',pilotForms:{test:{digest:'pinned-template'}},evidence:[],requests:[]};
 const paper={form:'test',values:{},evidence:[]};
 const rows=[{id:'row-A',values:{amount:'0',label:'First'}},{id:'row-B',values:{amount:'-10.05',label:'Second'}}];
 const read=items=>readTypedAnswers(model,paper,{templateDigest:'pinned-template',answers:JSON.stringify({answer:yesNo[1],schedule:JSON.stringify(items)})},{template:()=>({fields})});
 const first=read(rows),second=read([...rows].reverse());
 assert.equal(first.answerContract.fields[0].value.value,false);
 const at=(value,id)=>value.answerContract.fields[1].rows.find(r=>r.rowId===id);
 assert.deepEqual(at(first,'row-A'),at(second,'row-A'));
 assert.equal(at(first,'row-A').values.amount.value,'0');
 const work={version:1,values:first.values,evidence:[],history:[],answerContract:structuredClone(first.answerContract)};
 snapshot(work,'actual-actor','saved');work.answerContract.fields[1].rows[0].values.amount.value='99';
 assert.equal(work.history[0].answerContract.fields[1].rows[0].values.amount.value,'0','Historical typed snapshot stays exact');
 assert.throws(()=>read([rows[0],rows[0]]));
});

test('B01 actual API persists split allocations, nonadditive notes, reviewed digests and source-change impact',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'audit-b01-'));let app;
 try{
  const database=join(dir,'case.sqlite');app=await start(database,true);
  const {id,scope}=await planningFixture(app);
  const upload=async(name,text)=>{
   const saved=await app.write('preparer',id,'support-upload',{name,source:'Synthetic independently reviewed B01 source',base64:Buffer.from(text).toString('base64'),...scope,evidenceType:'ledger',supplier:'Fixture source owner',receivedOn:'2026-11-19',channel:'manual'});
   const file=saved.evidence.at(-1).id;await app.write('reviewer',id,'support-assess',{id:file,result:'accepted',reason:'Compared exact synthetic bytes and reporting scope'});return file;
  };
  const primary=await upload('tb.csv','account,closing,entity,currency,period\nA,100,G01-CLIENT,MNT,2025-12-31');
  const secondary=await upload('statements.csv','line,amount,entity,currency,unit,period\nCURRENT,60,G01-CLIENT,MNT,1,2025-12-31\nNONCURRENT,40,G01-CLIENT,MNT,1,2025-12-31\nNOTE,100,G01-CLIENT,MNT,1,2025-12-31');
  const configuration={currency:'MNT',tolerance:'0',allocations:[{account:'A',line:'CURRENT',amount:'60',sign:1},{account:'A',line:'NONCURRENT',amount:'40',sign:1}],presentationReferences:[{account:'A',line:'NOTE',sign:1}]};
  const run=async(existing='',config=configuration,status=200)=>app.write('preparer',id,'data-check-run',{id:existing,method:'AUTO-006',primary,secondary,use:'Explicit account-grain split and separately repeated note',configuration:JSON.stringify(config)},status);
  let view=await run(),check=view.dataMethods.checks.at(-1).id;
  const current=v=>v.dataMethods.checks.find(c=>c.id===check).current;
  assert.deepEqual(current(view).issues,[]);assert.ok(current(view).methodRun.definition.methodIds.includes('M02'));
  assert.equal(current(view).outputs.filter(r=>r.additive===true).reduce((n,r)=>n+r.effect,0),10000);
  assert.equal(current(view).outputs.find(r=>r.additive===false).computed,10000);
  assert.equal(current(await run(check)).version,1,'Identical calculation retry is stable');
  await app.write('preparer',id,'data-check-submit',{id:check,version:'1'});
  view=await app.write('reviewer',id,'data-check-approve',{id:check,version:'1',disposition:'usable',reason:'Independent literal 60+40=100; repeated note has no extra primary effect'});
  assert.equal(current(view).usable,true);assert.match(current(view).review.digest,/^[a-f0-9]{64}$/);
  const reader=new DatabaseSync(database,{readOnly:true});const model=JSON.parse(reader.prepare('SELECT body FROM pilot_engagements WHERE id=?').get(id).body);reader.close();
  const approved=model.pilotData.checks.find(c=>c.id===check).versions[0];
  assert.equal(methodRunCurrent(model,approved),true);assert.equal(approved.review.digest,methodReviewDigest(approved));
  const mutated=structuredClone(approved);mutated.outputs[0].allocated++;
  assert.equal(methodRunCurrent(model,mutated),false,'Output tamper invalidates run');
  const moved=structuredClone(model);moved.bench.periods[id].end='2025-12-30';assert.equal(methodRunCurrent(moved,approved),false,'Changed period invalidates reliance');
  const bad={...configuration,allocations:configuration.allocations.map(a=>({...a,amount:'60'}))};
  view=await run(check,bad);assert.equal(current(view).version,2);assert.ok(current(view).issues.some(i=>i.issue==='primary-allocation-residual'&&i.residual===-2000));
  await app.write('preparer',id,'data-check-submit',{id:check,version:'2'});
  await app.write('reviewer',id,'data-check-approve',{id:check,version:'2',disposition:'usable',reason:'Must fail unallocated residual'},409);
  const old=(await app.view('reviewer',id)).dataMethods.checks.find(c=>c.id===check).versions[0];assert.equal(old.review.digest,approved.review.digest);
  await app.write('reviewer',id,'data-check-return',{id:check,version:'2',reason:'Correct the residual while preserving original reviewed version'});
  await run(check,{...configuration,allocations:[configuration.allocations[0],configuration.allocations[0]]},400);
  await app.write('preparer',id,'support-scope',{id:primary,...scope,evidenceType:'ledger',supplier:'Fixture source owner',receivedOn:'2026-11-19',channel:'manual',reason:'Corrected source scope'});
  view=await app.view('reviewer',id);assert.equal(current(view).usable,false);
  assert.equal(buildMethodRun(model,approved).digest,approved.methodRun.digest);
  assert.equal(methodRunCurrent(model,{...approved,methodRun:undefined}),true,'Legacy adapter does not rewrite historical runs');
  const paper=(await app.view('preparer',id)).papers.find(p=>p.form==='3.1.2');assert.ok(paper.template);
  const save=execution=>app.write('preparer',id,'save',{form:paper.form,templateDigest:paper.template.digest,answers:'{}',execution,conclusion:'Draft scope retained; no completed procedure is claimed'});
  await save('First typed draft');await save('Second typed draft');
  const savedReader=new DatabaseSync(database,{readOnly:true}),savedModel=JSON.parse(savedReader.prepare('SELECT body FROM pilot_engagements WHERE id=?').get(id).body);savedReader.close();
  const savedWork=Object.values(savedModel.work).find(w=>w.form===paper.form);
  assert.equal(savedWork.answerContract.templateDigest,paper.template.digest);
  assert.ok(savedWork.history.some(h=>h.answerContract?.templateDigest===paper.template.digest));
  await app.close();app=await start(database);const reopened=(await app.view('reviewer',id)).dataMethods.checks.find(c=>c.id===check);
  assert.equal(reopened.versions[0].methodRun.digest,approved.methodRun.digest,'Restart preserves exact original calculation');
 }finally{await app?.close();await rm(dir,{recursive:true,force:true});}
});
