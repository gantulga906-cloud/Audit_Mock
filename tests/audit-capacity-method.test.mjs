import {test} from 'node:test';
import assert from 'node:assert/strict';
import fixtures from '../docs/delivery/research/audit-first-2026-11-19/results/D02/M35_Fixtures.json' with {type:'json'};
import {calculateM35} from '../scripts/pilot-capacity-method.mjs';
for(const row of fixtures.cases)test('B02 runtime '+row.id,()=>{
 if(row.expectedError)assert.throws(()=>calculateM35(structuredClone(row.input)),error=>error.message===row.expectedError);
 else assert.deepEqual(calculateM35(structuredClone(row.input)),row.expected);
});
