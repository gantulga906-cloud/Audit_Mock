import {createHash} from 'node:crypto';
import registry from '../src/data/audit-method-contracts.json' with {type:'json'};
import baseline from '../src/data/audit-baseline.json' with {type:'json'};
import {automationChecks} from '../src/lib/pilot-automation-methods.ts';

// Canonical JSON matches the persisted wire representation. Reject nonfinite numbers.
export function canonical(value){
 if(value===null||typeof value==='string'||typeof value==='boolean')return JSON.stringify(value);
 if(typeof value==='number'){if(!Number.isFinite(value))throw Error('Nonfinite contract number');return JSON.stringify(value);}
 if(Array.isArray(value))return '['+value.map(v=>{if(v===undefined)throw Error('Undefined array entry');return canonical(v);}).join(',')+']';
 if(value&&typeof value==='object'&&[Object.prototype,null].includes(Object.getPrototypeOf(value)))return '{'+Object.keys(value).filter(k=>value[k]!==undefined).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
 throw Error('Unsupported contract value');
}
export const contractDigest=value=>createHash('sha256').update(canonical(value)).digest('hex');
const legacyAlgorithms={'AUTO-003':'full-source-bridge-v1','AUTO-004':'dated-master-match-v1','AUTO-005':'tb-ledger-bridge-v1','AUTO-006':'primary-allocation-bridge-v2','AUTO-007':'statement-reference-check-v1','AUTO-008':'opening-bridge-v1','AUTO-010':'analytical-expectations-v1'};
export function methodDefinition(automation){
 const algorithm=automationChecks[automation]?.algorithm??legacyAlgorithms[automation];
 if(!algorithm)throw Error('No supported calculation contract: '+automation);
 const methodIds=registry.methods.filter(m=>m.automationIds.includes(automation)).map(m=>m.id);
 if(!methodIds.length)throw Error('Calculation has no research-method lineage: '+automation);
 return {automation,methodIds,algorithmVersion:algorithm,inputSchemaVersion:'audit-data-check-v1',registryVersion:registry.version};
}
export function buildMethodRun(model,check,sources=check.inputs){
 const definition=methodDefinition(check.method),period=model.bench.periods[model.engagement];
 const body={schemaVersion:1,definition,scope:{engagement:model.engagement,entity:model.bench.clients[model.engagement].registration,
   start:period.start,end:period.end,currency:check.configuration.currency,amountEncoding:'signed-integer-minor-units',minorUnitScale:2},
  parameters:structuredClone(check.configuration),sources:sources.map(({id,version,sha256})=>({id,version,sha256})),
  policy:check.profile?structuredClone(check.profile):{algorithm:definition.algorithmVersion,authority:'Recorded calculation configuration; no independent policy approval is inferred.'},
  resultDigest:contractDigest({outputs:check.outputs,issues:check.issues,registers:check.registers,populationBasis:check.populationBasis}),
  use:check.use};
 return {...body,digest:contractDigest(body)};
}
export function methodRunCurrent(model,check){
 // Legacy records are read through, never retrospectively relabelled as v1 contract runs.
 if(!check.methodRun)return true;
 try{
  const sources=check.methodRun.sources;
  return Array.isArray(sources)&&sources.every(ref=>check.inputs.some(i=>i.id===ref.id&&i.version===ref.version&&i.sha256===ref.sha256))&&
   contractDigest(buildMethodRun(model,check,sources))===contractDigest(check.methodRun);
 }catch{return false;}
}
export const methodReviewDigest=check=>contractDigest({run:check.methodRun,inputs:check.inputs,cases:check.cases,disposition:check.disposition});
export const foundationView=()=>({schemaVersion:baseline.schemaVersion,baseline:baseline.id,planningCommit:baseline.planningCommit,
 standards:baseline.standards,workingWorkbooks:baseline.workingWorkbooks,counts:Object.fromEntries(Object.entries(baseline.sets).map(([key,v])=>[key,v.count])),methodRegistryVersion:registry.version});
export {registry as methodRegistry};
