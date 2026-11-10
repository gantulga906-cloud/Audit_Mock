import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { run } from 'node:test';
import { fileURLToPath } from 'node:url';
import { scenarios } from './pilot-source-evidence.mjs';
import { evidenceKey, reviewContractEvidence, sourceRowId, sourceRowSha } from './pilot-contract-evidence.mjs';
import { createLifecycleEvidenceCollector } from './pilot-lifecycle-evidence.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
process.chdir(root);
const args=process.argv.slice(2), options=new Set(args);
if (args.some(arg=>!['--build','--strict'].includes(arg))) throw Error('Usage: npm run verify:release -- [--build] [--strict]');
const read=path=>readFileSync(join(root,path));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const commit=git('rev-parse','HEAD'), clean=git('status','--porcelain')==='';
const sourceBytes=read('src/data/source-registers.json'), source=JSON.parse(sourceBytes);
const manifestSha=sha(read('docs/research/source-manifest.json'));
const bpmnBytes=read('src/data/source-bpmn-transitions.json'), bpmn=JSON.parse(bpmnBytes);
for (const {stage,gateways,flows} of bpmn.stages) {
  const rows=bpmn.rows.filter(row=>row.stage===stage);
  const xml=source.bpmns.find(model=>model.id==='BPMN-'+stage);
  const xmlGateways=Object.entries(xml?.nodes??{}).filter(([name])=>name.endsWith('Gateway')).reduce((sum,[,count])=>sum+count,0);
  if (rows.length!==gateways+flows||rows.filter(row=>row.kind==='gateway').length!==gateways||
      rows.filter(row=>row.kind==='flow').length!==flows||xmlGateways!==gateways||xml?.flows!==flows) {
    throw Error('BPMN verification inventory differs from source stage '+stage);
  }
}
if (bpmn.rows.length!==bpmn.counts.total||bpmn.counts.total!==bpmn.counts.gateways+bpmn.counts.flows||
    bpmn.stages.reduce((sum,row)=>sum+row.gateways,0)!==bpmn.counts.gateways||
    bpmn.stages.reduce((sum,row)=>sum+row.flows,0)!==bpmn.counts.flows) throw Error('BPMN verification inventory totals differ');
const operational=[
  {id:'OPS-BOOTSTRAP',title:'Start a clean shared app with scoped accounts and a fresh engagement'},
  {id:'OPS-MIGRATION',title:'Rehearse cutover and rollback against a copy of an attributable earlier database'},
  {id:'OPS-RECOVERY',title:'Restore a backup and verify stored records, permissions and exact artifact bytes'},
  {id:'OPS-WORKLOAD',title:'Exercise the approved representative workload and compare with its expected limits'},
  {id:'OPS-DEPLOYMENT',title:'Verify deployment identity, configuration, isolation and release sign-offs'},
].map(row=>({...row,source:'Development plan / WP-25 and cutover gates'}));
const available={cases:source.cases,criteria:source.criteria,features:source.features,automations:source.automations,
  e2e:source.e2e,forms:source.forms,variants:source.variants,dependencies:source.dependencies,extensions:source.extensions,
  transitions:bpmn.rows,operational};
for (const [kind,rows] of Object.entries(available)) {
  if (rows.length!==new Set(rows.map(row=>sourceRowId(kind,row))).size) throw Error('Duplicate source row in '+kind);
  const ids=new Set(rows.map(row=>sourceRowId(kind,row)));
  for (const scenario of scenarios) for (const id of scenario[kind]??[]) {
    if (!ids.has(id)) throw Error('Unknown source reference '+id+' in '+scenario.test);
  }
}

const files=readdirSync(join(root,'tests')).filter(name=>name.endsWith('.test.mjs')).sort().map(name=>join(root,'tests',name));
const normalize=path=>relative(root,path??root).replaceAll('\\','/');
const testHash=path=>sha(readFileSync(path,'utf8').replaceAll('\r\n','\n'));
const testFiles=files.map(file=>({file:normalize(file),sha256:testHash(file)}));
const tests=[];
const executionKey=(file,test)=>JSON.stringify([file,test]);
const collector=createLifecycleEvidenceCollector(normalize);
for await (const event of run({files,concurrency:1})) {
  collector.record(event);
  const {type,data}=event;
  if (type!=='test:pass'&&type!=='test:fail') continue;
  const file=normalize(data.file);
  const suite=data.details?.type==='suite';
  if (suite&&type==='test:pass') continue;
  const outcome=data.skip||data.todo?'skipped':type==='test:pass'?'passed':'failed';
  tests.push({name:data.name,file,line:data.line,suite,outcome,ms:data.details?.duration_ms,
    ...(outcome==='failed'&&{error:data.details?.error?.message})});
}
const executions=Map.groupBy(tests.filter(test=>!test.suite),test=>executionKey(test.file,test.name));
const observed=scenarios.map(scenario=>{
  const matches=executions.get(executionKey(scenario.file,scenario.test))??[];
  return {...scenario,outcome:matches.length===1?matches[0].outcome:matches.length?'ambiguous':'missing'};
});
const testFilesCurrent=testFiles.every(file=>file.sha256===testHash(join(root,file.file)));
const testOk=testFilesCurrent&&tests.some(test=>test.outcome==='passed')&&!tests.some(test=>test.outcome==='failed')&&observed.every(row=>row.outcome==='passed');
const decisions=JSON.parse(read('scripts/pilot-release-acceptance.json'));
const reviewed=reviewContractEvidence(available,decisions,observed,testFiles);
const reports=Object.fromEntries(Object.entries(available).map(([kind,rows])=>[kind,rows.map(row=>{
  const id=sourceRowId(kind,row), direct=observed.filter(s=>s[kind]?.includes(id));
  const relatedCases=kind==='cases'?[id]:kind==='criteria'?[row.case]:row.cases??row.owning_cases??(row.parent_case?[row.parent_case]:[]);
  const related=observed.filter(s=>s.cases?.some(c=>relatedCases.includes(c)));
  const executed=direct.filter(s=>s.outcome==='passed');
  const review=reviewed.get(evidenceKey(kind,id));
  const approvedDecision=review?.current?review.decision:undefined;
  const scope=kind==='features'&&row.decision==='D03'?'excluded':kind==='features'&&row.decision==='D24'?'conditional':
    ['excluded','conditional'].includes(approvedDecision)?approvedDecision:kind==='extensions'&&!approvedDecision?'pending':'core';
  const fixturePassed=executed.length>0&&(kind==='criteria'||kind==='e2e');
  const status=scope==='pending'?'scope-pending':scope!=='core'?scope:approvedDecision==='accepted'?'accepted':
    fixturePassed?'fixture-passed':executed.length?'partial-evidence':'unverified';
  const transition=kind==='transitions'&&bpmn.stages.find(stage=>stage.stage===row.stage);
  return {id,title:row.title??row.criterion??row.work??row.area??row.type??row.description??row.label??row.sourceId,scope,status,
    fixturePassed,review,sourceRowSha256:sourceRowSha(row),
    source:transition?transition.source+' / '+row.sourceId:row.locator??row.sourceLocator??row.source_locator??row.source??row.source_locators,
    ...(transition&&{sourceDisposition:bpmn.source.disposition}),
    relatedCases,observations:direct.map(s=>({test:s.test,file:s.file,action:s.action,actors:s.actors,observed:s.observed,outcome:s.outcome})),
    relatedScenarios:related.filter(s=>!direct.includes(s)).map(s=>s.test)};
})]));
const counts=Object.fromEntries(Object.entries(reports).map(([kind,rows])=>[kind,{
  total:rows.length,fixturePassed:rows.filter(row=>row.fixturePassed).length,
  accepted:rows.filter(row=>row.status==='accepted').length,
  partial:rows.filter(row=>row.status==='partial-evidence').length,
  open:rows.filter(row=>row.scope==='pending'||row.scope==='core'&&row.status!=='accepted').length,
  pendingScope:rows.filter(row=>row.scope==='pending').length,
  conditional:rows.filter(row=>row.scope==='conditional').length,excluded:rows.filter(row=>row.scope==='excluded').length,
}]));
const {lifecycles,errors:lifecycleErrors}=collector.report(source.e2e,reports.e2e,row=>row.scope==='core');
let buildFailure;
if (options.has('--build')&&testOk&&!lifecycleErrors.length) {
  const result=spawnSync(process.execPath,[join(root,'scripts','build.mjs')],{stdio:'inherit'});
  if (result.status!==0||result.error) buildFailure=result.error?.message??'Production build failed';
}
let build;
try { build=JSON.parse(read('out/build-info.json')); } catch { /* Build proof is optional outside strict mode. */ }
const buildCurrent=!!build&&!buildFailure&&clean&&git('rev-parse','HEAD')===commit&&git('status','--porcelain')===''&&
  build.commit===commit&&build.dirty===false&&build.sourceManifestSha256===manifestSha;
const releaseReady=testOk&&tests.every(test=>test.outcome==='passed')&&buildCurrent&&!lifecycleErrors.length&&
  Object.values(counts).every(group=>group.open===0)&&lifecycles.every(cycle=>!cycle.applicableSteps||cycle.applicableComplete);
const summary={commit,clean,buildCurrent,sourceEdition:source.meta.sourceEdition,sourceManifestSha256:manifestSha,
  normalizedSourceSha256:sha(sourceBytes),bpmn:{...bpmn.source,...bpmn.counts,normalizedSha256:sha(bpmnBytes)},testFilesCurrent,
  tests:{passed:tests.filter(t=>t.outcome==='passed').length,failed:tests.filter(t=>t.outcome==='failed').length,
    skipped:tests.filter(t=>t.outcome==='skipped').length},counts,
  cycles:{total:lifecycles.length,complete:lifecycles.filter(l=>l.complete).length,
    applicable:lifecycles.filter(l=>l.applicableSteps).length,applicableComplete:lifecycles.filter(l=>l.applicableComplete).length},
  lifecycleErrors:lifecycleErrors.length,releaseReady};
const destination=join(root,'.audit-pilot','source-verification.json');
mkdirSync(join(root,'.audit-pilot'),{recursive:true});
writeFileSync(destination,JSON.stringify({summary,build,buildFailure,scenarios:observed,testFiles,tests,lifecycles,lifecycleErrors,reports},null,2)+'\n');
console.log(JSON.stringify({...summary,report:basename(destination)},null,2));
for (const test of tests.filter(t=>t.outcome==='failed')) console.error(test.file+' · '+test.name+' · '+test.error);
for (const scenario of observed.filter(item=>['missing','ambiguous'].includes(item.outcome))) {
  console.error(scenario.outcome+' scenario · '+scenario.file+' · '+scenario.test);
}
for (const error of lifecycleErrors) console.error(error);
if (!testOk||buildFailure||lifecycleErrors.length||options.has('--strict')&&!releaseReady) process.exitCode=1;
