import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { run } from 'node:test';
import { fileURLToPath } from 'node:url';
import { scenarios } from './pilot-source-evidence.mjs';

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
const available={cases:source.cases,criteria:source.criteria,features:source.features,automations:source.automations,
  e2e:source.e2e,forms:source.forms,variants:source.variants};
const idFor=(kind,row)=>kind==='e2e'?row.work_id:row.id;
for (const [kind,rows] of Object.entries(available)) {
  if (rows.length!==new Set(rows.map(row=>idFor(kind,row))).size) throw Error('Duplicate source row in '+kind);
  const ids=new Set(rows.map(row=>idFor(kind,row)));
  for (const scenario of scenarios) for (const id of scenario[kind]??[]) {
    if (!ids.has(id)) throw Error('Unknown source reference '+id+' in '+scenario.test);
  }
}

const files=readdirSync(join(root,'tests')).filter(name=>name.endsWith('.test.mjs')).map(name=>join(root,'tests',name));
const executions=new Map();
const normalize=path=>relative(root,path??root).replaceAll('\\','/');
const executionKey=(file,test)=>JSON.stringify([file,test]);
for await (const {type,data} of run({files,concurrency:1})) {
  if (type!=='test:pass'&&type!=='test:fail') continue;
  const file=normalize(data.file);
  if (data.details?.type==='suite') continue;
  const outcome=data.skip||data.todo?'skipped':type==='test:pass'?'passed':'failed';
  executions.set(executionKey(file,data.name),{name:data.name,file,outcome,ms:data.details?.duration_ms,
    ...(outcome==='failed'&&{error:data.details?.error?.message})});
}
const observed=scenarios.map(scenario=>({...scenario,
  outcome:executions.get(executionKey(scenario.file,scenario.test))?.outcome??'missing'}));
const tests=[...executions.values()];
const testOk=tests.some(test=>test.outcome==='passed')&&!tests.some(test=>test.outcome==='failed')&&observed.every(row=>row.outcome==='passed');
const reports=Object.fromEntries(Object.entries(available).map(([kind,rows])=>[kind,rows.map(row=>{
  const id=idFor(kind,row), direct=observed.filter(s=>s[kind]?.includes(id));
  const relatedCases=kind==='cases'?[id]:kind==='criteria'?[row.case]:row.cases??(row.parent_case?[row.parent_case]:[]);
  const related=observed.filter(s=>s.cases?.some(c=>relatedCases.includes(c)));
  const executed=direct.filter(s=>s.outcome==='passed');
  const scope=kind==='features'&&row.decision==='D03'?'excluded':kind==='features'&&row.decision==='D24'?'conditional':'core';
  const status=scope!=='core'?scope:executed.length?(kind==='criteria'||kind==='e2e'?'fixture-passed':'partial-evidence'):'unverified';
  return {id,title:row.title??row.criterion??row.work??row.area,scope,status,
    source:row.locator??row.sourceLocator??row.source_locator??row.source??row.source_locators,
    relatedCases,observations:direct.map(s=>({test:s.test,file:s.file,action:s.action,actors:s.actors,observed:s.observed,outcome:s.outcome})),
    relatedScenarios:related.filter(s=>!direct.includes(s)).map(s=>s.test)};
})]));
const counts=Object.fromEntries(Object.entries(reports).map(([kind,rows])=>[kind,{
  total:rows.length,fixturePassed:rows.filter(row=>row.status==='fixture-passed').length,
  partial:rows.filter(row=>row.status==='partial-evidence').length,
  open:rows.filter(row=>row.scope==='core'&&row.status!=='fixture-passed').length,
  conditional:rows.filter(row=>row.scope==='conditional').length,excluded:rows.filter(row=>row.scope==='excluded').length,
}]));
const lifecycles=[...new Set(source.e2e.map(row=>row.lifecycle))].map(id=>{
  const rows=source.e2e.filter(row=>row.lifecycle===id);
  const observedSteps=rows.filter(row=>reports.e2e.find(item=>item.id===row.work_id)?.status==='fixture-passed').length;
  return {id,title:rows[0].lifecycle_title,steps:rows.length,observedSteps,complete:observedSteps===rows.length};
});
let buildFailure;
if (options.has('--build')&&testOk) {
  const result=spawnSync(process.execPath,[join(root,'scripts','build.mjs')],{stdio:'inherit'});
  if (result.status!==0||result.error) buildFailure=result.error?.message??'Production build failed';
}
let build;
try { build=JSON.parse(read('out/build-info.json')); } catch { /* Build proof is optional outside strict mode. */ }
const buildCurrent=!!build&&!buildFailure&&clean&&build.commit===commit&&build.dirty===false&&build.sourceManifestSha256===manifestSha;
const releaseReady=testOk&&tests.every(test=>test.outcome==='passed')&&buildCurrent&&Object.values(counts).every(group=>group.open===0);
const summary={commit,clean,buildCurrent,sourceEdition:source.meta.sourceEdition,sourceManifestSha256:manifestSha,
  normalizedSourceSha256:sha(sourceBytes),tests:{passed:tests.filter(t=>t.outcome==='passed').length,failed:tests.filter(t=>t.outcome==='failed').length,
    skipped:tests.filter(t=>t.outcome==='skipped').length},counts,cycles:{total:lifecycles.length,complete:lifecycles.filter(l=>l.complete).length},releaseReady};
const destination=join(root,'.audit-pilot','source-verification.json');
mkdirSync(join(root,'.audit-pilot'),{recursive:true});
const testFiles=files.map(file=>({file:normalize(file),sha256:sha(readFileSync(file))}));
writeFileSync(destination,JSON.stringify({summary,build,buildFailure,scenarios:observed,testFiles,tests,lifecycles,reports},null,2)+'\n');
console.log(JSON.stringify({...summary,report:basename(destination)},null,2));
for (const test of tests.filter(t=>t.outcome==='failed')) console.error(test.file+' · '+test.name+' · '+test.error);
if (!testOk||buildFailure||options.has('--strict')&&!releaseReady) process.exitCode=1;
