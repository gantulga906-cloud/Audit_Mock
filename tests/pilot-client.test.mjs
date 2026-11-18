import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PilotRequestError,readPilotResponse} from '../src/lib/pilot-client.ts';

test('API failures retain access and missing-record statuses while an absent API is a connection failure',async()=>{
 for(const status of [403,404,409])await assert.rejects(readPilotResponse(Response.json({error:'Scoped request denied'},{status})),error=>error instanceof PilotRequestError&&error.status===status);
 await assert.rejects(readPilotResponse(new Response('<html>missing route</html>',{status:404})),error=>!(error instanceof PilotRequestError)&&error.message.includes('сервертэй'));
 assert.deepEqual(await readPilotResponse(Response.json({selected:null})),{selected:null});
});
