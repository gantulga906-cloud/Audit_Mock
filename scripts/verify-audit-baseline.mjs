import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import baseline from '../src/data/audit-baseline.json' with {type:'json'};
import methods from '../src/data/audit-method-contracts.json' with {type:'json'};
import {buildBaseline,buildMethodRegistry} from './build-audit-baseline.mjs';
assert.deepEqual(buildBaseline(),baseline,'Frozen original identity/source profile drift');
assert.deepEqual(buildMethodRegistry(),methods,'Method lineage drift');
assert.deepEqual(Object.fromEntries(Object.entries(baseline.sets).map(([key,value])=>[key,value.count])),{tasks:60,methods:36,variants:22,automations:58,dependencies:20,forms:70,fields:1236,originalTasks:128,originalObligations:2247});
const index=process.argv.indexOf('--source-root');
let sourceHashes='not-requested';
if(index>=0){
 assert.ok(process.argv[index+1],'Supply a read-only source directory');
 for(const book of baseline.workingWorkbooks){const bytes=readFileSync(resolve(process.argv[index+1],book.file));assert.equal(createHash('sha256').update(bytes).digest('hex'),book.sha256,book.file+' hash drift');}
 sourceHashes='all-five-match';
}
console.log(JSON.stringify({baseline:baseline.id,identitySets:'exact-match',methodContracts:36,sourceHashes,professionalAcceptance:'not-performed',releaseReadyChanged:false},null,2));
