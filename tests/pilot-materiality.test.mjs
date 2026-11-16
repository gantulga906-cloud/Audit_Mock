import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {randomUUID} from 'node:crypto';
import {mkdtemp,rm,mkdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {DatabaseSync,backup} from 'node:sqlite';
import {createPilot} from '../scripts/pilot-server.mjs';
import {readSelection} from '../scripts/pilot-materiality.mjs';
import {selectedMateriality} from '../src/lib/pilot-materiality.ts';

const selection=()=>({version:1,selected:'revenue',stage:'planning',candidates:[
 {measure:'profit-before-tax',amount:'-100',percentage:'5',rationale:'A loss is not a stable planning benchmark'},
 {measure:'revenue',amount:'1000',priorAmount:'900',percentage:'2',rationale:'Revenue is more representative'},
],overall:{mode:'override',amount:'18',rationale:'Lower amount due to user sensitivity'},
 performance:{mode:'calculated',percentage:'60',rationale:'Risk of aggregation supports this selected rate'},
 trivial:{mode:'override',percentage:'5',amount:'0',rationale:'Accumulate every identified amount'},
 priorOverall:{amount:'25',reference:'Prior approved version 2'},
 qualitative:{circumstances:'Consider opening balances under the lower threshold',reporting:'No additional transaction-specific reporting requirement identified',disclosures:'Lender-sensitive asset disclosures assessed separately'}});

test('materiality overrides recalculate from the selected amount and preserve an intentional zero',()=>{
 const parsed=readSelection(selection());
 assert.deepEqual(selectedMateriality(parsed),{overall:18,performance:10.8,trivial:0});
 const calculated=selection();calculated.overall.mode='calculated';calculated.performance={mode:'override',percentage:'60',amount:'9',rationale:'More cautious performance amount'};calculated.trivial.mode='calculated';
 assert.deepEqual(selectedMateriality(readSelection(calculated)),{overall:20,performance:9,trivial:1});
 for(const corrupt of [s=>s.candidates.push(s.candidates[0]),s=>s.overall.rationale='',s=>s.trivial.amount='',s=>s.performance.percentage='101',s=>s.overall.amount='18.001',s=>s.selected='missing',s=>s.version=99,s=>s.qualitative.disclosures='',s=>s.priorOverall.amount='-1']){
  const invalid=selection();corrupt(invalid);assert.throws(()=>readSelection(invalid));
 }
 const rounding=selection();rounding.overall={mode:'calculated',rationale:'Use the calculated amount'};rounding.candidates[1].amount='1234.56';rounding.candidates[1].percentage='1.2345';
 assert.deepEqual(selectedMateriality(readSelection(rounding)),{overall:15.24,performance:9.14,trivial:0});
});

async function start(database){
 const pilot=createPilot({database,setupCode:'materiality-bootstrap'}),server=createServer((req,res)=>void pilot.handle(req,res,new URL(req.url,'http://127.0.0.1')));
 await new Promise((ok,bad)=>{server.once('error',bad);server.listen(0,'127.0.0.1',ok);});
 const origin='http://127.0.0.1:'+server.address().port;
 return {origin,async fetch(path,cookie,body){return fetch(origin+'/api/pilot'+path,{method:body===undefined?'GET':'POST',headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});},async close(){await new Promise(ok=>server.close(ok));pilot.close();}};
}

test('selected materiality overrides bind source rows and reopen sampling and evaluation without losing signed history',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'audit-selected-materiality-')),database=join(dir,'workspace.sqlite');let service=await start(database);
 const credentials={preparer:'MaterialityPreparer2026!',reviewer:'MaterialityReviewer2026!',partner:'MaterialityPartner2026!'},cookies={};
 try{
  assert.equal((await service.fetch('/setup','',{code:'materiality-bootstrap',...credentials})).status,201);
  const login=async()=>{for(const [role,password] of Object.entries(credentials)){const r=await service.fetch('/login','',{role,password});assert.equal(r.status,200);cookies[role]=r.headers.get('set-cookie').split(';')[0];}};await login();
  const view=async(role,id)=>{const r=await service.fetch('?engagement='+id,cookies[role]);assert.equal(r.status,200);return r.json();};
  const write=async(role,id,action,fields={},status=200)=>{const r=await service.fetch('/action?engagement='+id,cookies[role],{action,fields,revision:(await view(role,id)).revision,idempotencyKey:randomUUID()});const data=await r.json();assert.equal(r.status,status,action+' '+JSON.stringify(data.error));return data;};
  const input={client:'Selected materiality fixture',legalForm:'ХХК',registration:'SELECTED-MAT-1',framework:'Synthetic',contact:'Finance',email:'finance@example.test',start:'2025-01-01',end:'2025-12-31',reportDate:'2026-12-01',synthetic:'yes'};
  const engagement=(await write('reviewer','firm','create',input)).selected,run=(role,action,fields,status)=>write(role,engagement,action,fields,status);
  const paper=(s,form)=>s.papers.find(row=>row.form===form),file=(name,text)=>({name,base64:Buffer.from(text).toString('base64')});
  await run('partner','activate',{assessment:'Synthetic acceptance',independence:'Reviewed',letter:'Agreed'});
  let state=await run('preparer','support-upload',{source:'Reconciled benchmark and independent ledger control',...file('source-controls.csv','count,total,revenue,profit\n2,100,1000,-100')});
  const evidence=state.evidence.find(f=>f.name==='source-controls.csv').id;
  await run('reviewer','support-assess',{id:evidence,result:'accepted',reason:'Independently checked source amounts and complete ledger controls'});
  state=await run('preparer','population-import',{source:'Complete signed ledger',currency:'MNT',...file('ledger.csv','id,account,amount,entity,date,currency\na,1500,90,SELECTED-MAT-1,2025-02-01,MNT\nb,1500,10,SELECTED-MAT-1,2025-02-02,MNT')});
  state=await run('preparer','population-reconcile',{version:String(state.population.current.version),count:'2',total:'100',source:'Independent control',controlEvidence:evidence,mapping:'1500,PPE',statements:'PPE,100',use:'Asset sample'});
  await run('reviewer','population-approve',{version:String(state.population.current.version),reason:'Verified original controls and exact bridge'});
  await run('reviewer','form-use',{form:'1.3',version:'source'});
  const basis={users:'Lenders and owners',benchmarkMeasure:'revenue',alternatives:'Profit and assets compared',benchmarkRationale:'Revenue is more stable',comparison:'prior-period',priorAmount:'900',priorReference:'Prior signed finance export',comparisonRationale:'The current and comparative classifications agree',unusualResults:'Loss from a one-off transaction',stability:'alternative',stabilityRationale:'Use revenue after reviewing the loss',evidence,specificDecision:'required',specificReason:'Lender-sensitive asset disclosure',
   specific:[{form:'3.1.2',scope:'PPE',amount:'999',performance:'999',rationale:'A lower threshold is required',selection:{percentage:'75',performancePercentage:'60',amountMode:'calculated',performanceMode:'calculated',amountRationale:'Use three quarters of the selected overall amount',performanceRationale:'Apply the selected rate to the specific amount'}}],selection:selection()};
  const save=async(basis,extra={},status=200)=>{const p=paper(await view('preparer',engagement),'1.3');return run('preparer','save',{form:'1.3',execution:'Compared candidates and selected thresholds',conclusion:'Documented rationale and scope',benchmarkSource:'Independently accepted source export',templateDigest:p.template.digest,answers:JSON.stringify({r27:'Forged amount 999'}),materialityBasis:JSON.stringify(basis),...extra},status);};
  const invalid=structuredClone(basis);invalid.selection.overall.rationale='';await save(invalid,{},400);
  state=await save(basis);const first=paper(state,'1.3');
  assert.deepEqual(first.materiality,{overall:18,performance:10.8,trivial:0,specific:[{form:'3.1.2',scope:'PPE',amount:13.5,performance:8.1,rationale:'A lower threshold is required',selection:{percentage:75,performancePercentage:60,amountMode:'calculated',performanceMode:'calculated',amountRationale:'Use three quarters of the selected overall amount',performanceRationale:'Apply the selected rate to the specific amount'}}]});
  assert.match(first.values['field.r27'],/^18;/);assert.doesNotMatch(first.values['field.r27'],/999/);assert.equal(first.template.owned.r27,first.values['field.r27']);assert.deepEqual(first.nativeGaps,[]);
  await run('preparer','submit',{form:'1.3'});await run('preparer','review',{form:'1.3'},403);state=await run('reviewer','review',{form:'1.3'});const approved=paper(state,'1.3');
  await run('preparer','save',{form:'2.6',reliance:'none',execution:'Assessed controls',conclusion:'Substantive approach'});await run('preparer','submit',{form:'2.6'});state=await run('reviewer','review',{form:'2.6'});const controlVersion=paper(state,'2.6').reviewedVersion;
  state=await run('preparer','sample-design',{form:'3.1.2',line:'PPE',size:'2',seed:'3',purpose:'Inspect both units'});const sampleVersion=state.samples['3.1.2'].version;
  await run('reviewer','sample-approve',{form:'3.1.2',version:String(sampleVersion),reason:'Approved using the selected specific performance amount'});state=await run('preparer','sample-select',{form:'3.1.2',version:String(sampleVersion)});const selected=state.samples['3.1.2'].selected;
  assert.equal(state.samples['3.1.2'].basis.performance,8.1);
  await run('partner','statements',{statements:'Synthetic signed statements',disclosures:'PPE disclosure'});state=await run('reviewer','completion-evaluate',{note:'Used the independently selected thresholds'});await run('partner','completion-evaluation-approve',{version:String(state.completion.evaluation.version),reason:'Checked selected amounts and source version'});
  const revised=structuredClone(basis);revised.selection.overall.amount='12';revised.selection.stage='final';
  await save(revised,{},400);revised.revisionReason='New disclosure sensitivity requires a reduced overall amount';
  state=await save(revised);const changed=paper(state,'1.3');
  assert.equal(changed.materiality.performance,7.2);assert.equal(changed.materiality.specific[0].amount,9);assert.equal(changed.materiality.specific[0].performance,5.4);
  assert.equal(state.samples['3.1.2'].current,false);assert.deepEqual(state.samples['3.1.2'].selected,selected);assert.equal(state.samples['3.1.2'].version,sampleVersion);assert.equal(state.completion.evaluation.current,false);assert.equal(paper(state,'2.6').reviewedVersion,controlVersion);
  assert.equal(changed.values['field.r27'],approved.values['field.r27']);assert.match(changed.values['field.r28'],/^12;/);assert.ok(changed.history.some(h=>h.version===approved.version&&JSON.parse(h.values['pilot.materiality.basis']).selection.overall.amount===18));
  await run('preparer','sample-select',{form:'3.1.2',version:String(sampleVersion)},409);
  await run('preparer','submit',{form:'1.3'});state=await run('reviewer','review',{form:'1.3'});const finalVersion=paper(state,'1.3').version;
  const downgrade=structuredClone(revised);delete downgrade.selection;await save(downgrade,{benchmark:'1000',percentage:'2',performance:'60',trivial:'5'},400);
  await service.close();service=await start(database);await login();state=await view('reviewer',engagement);assert.equal(paper(state,'1.3').reviewedVersion,finalVersion);assert.equal(paper(state,'1.3').materiality.overall,12);assert.deepEqual(state.samples['3.1.2'].selected,selected);
  if(process.env.AUDIT_MATERIALITY_FIXTURE_DIR){const output=resolve(process.env.AUDIT_MATERIALITY_FIXTURE_DIR);await mkdir(output,{recursive:true});const destination=join(output,'materiality-ready.sqlite'),db=new DatabaseSync(database,{readOnly:true});await backup(db,destination);db.close();await writeFile(join(output,'materiality-fixture.json'),JSON.stringify({database:destination,engagement,credentials},null,2)+'\n');}
 }finally{await service.close();await rm(dir,{recursive:true,force:true});}
});
