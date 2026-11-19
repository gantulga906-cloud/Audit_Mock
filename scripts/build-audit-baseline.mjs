import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const base='docs/delivery/research/audit-first-2026-11-19';
const read=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex');
const identitySet=values=>{const ids=values.sort();if(new Set(ids).size!==ids.length)throw Error('Duplicate baseline identity');return {count:ids.length,sha256:sha(JSON.stringify(ids)),ids};};
export function buildBaseline(){
 const plan=read(base+'/results/FULL/Plan_Data.json'),sources=read('src/data/source-registers.json'),decision=read(base+'/results/D01/Baseline_Decision.json');
 const sets=Object.fromEntries(['tasks','methods','variants','automations','dependencies'].map(key=>[key,identitySet(plan[key].map(x=>x.id))]));
 sets.forms=identitySet(sources.forms.map(x=>x.id));
 sets.fields=identitySet(sources.forms.flatMap(f=>f.fields.map(x=>f.id+'/'+x.key)));
 sets.originalTasks=identitySet(read('docs/delivery/handbooks/registers/task_to_guide.json').map(x=>x.id));
 sets.originalObligations=identitySet(read('docs/delivery/handbooks/registers/requirement_traceability.json').map(x=>x.register+'/'+x.id));
 return {schemaVersion:1,id:'audit-first-2026-11-19',planningCommit:'469d48cfbd1bb1d6760f5ef2ae90794cd91987b3',
  workingWorkbooks:read(base+'/results/FULL/Read_Only_Source_Census.json').books.map(({file,sha256,form_count})=>({file,sha256,forms:form_count})),
  standards:{audit:decision.standards.audit_baseline,ethics:decision.standards.ethics_baseline,qualityUpdates:decision.standards.included_quality_updates,
   applicability:'Selected engagement applicability and professional judgments remain explicit records; this reference profile is not an automatic legal determination.'},
  sets,sourceCensusSha256:sha(readFileSync(resolve(root,base+'/results/FULL/Read_Only_Source_Census.json')))};
}
export function buildMethodRegistry(){
 const p=read(base+'/results/FULL/Plan_Data.json');
 return {schemaVersion:1,version:'audit-method-contracts-v1',methods:p.methods.map(m=>({id:m.id,title:m.title,profile:m.profile,
  automationIds:m.original_automation_ids.split(/\s+/).filter(Boolean),specificationVersion:1,
  judgment:m.judgment,scope:'Bounded specifications; linked automation support does not imply every method branch is implemented or professionally approved.'}))};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const outputs={'src/data/audit-baseline.json':buildBaseline(),'src/data/audit-method-contracts.json':buildMethodRegistry()};
 for(const [name,value] of Object.entries(outputs)){
  const text=JSON.stringify(value,null,2)+'\n';
  if(process.argv.includes('--check')){if(readFileSync(resolve(root,name),'utf8')!==text)throw Error('Baseline drift: '+name);}
  else writeFileSync(resolve(root,name),text);
 }
 console.log(process.argv.includes('--check')?'Baseline identities and method registry match the pinned research corpus.':'Wrote baseline and method registry.');
}
