import assert from 'node:assert/strict';
import {planningFixture} from './pilot-planning-fixture.mjs';
import {today} from './pilot-acceptance-fixture.mjs';
export async function automationFixture(app){
 const setup=await planningFixture(app),{id,scope,people}=setup;
 const call=async(route,cookie,data,status=200)=>{const response=await app.request(route,cookie,data),body=await response.json();assert.equal(response.status,status,route+' '+JSON.stringify(body));return {body,cookie:response.headers.get('set-cookie')?.split(';')[0]};};
 const boot=await call('/identity/bootstrap',app.cookies.partner,{code:'G01-fixture-only',username:'g11.partner',name:'Actual G11 partner',staff:people.partner.person,reason:'Explicit fictional local administrator'},201);await call('/identity/activate','',{token:boot.body.activationToken,password:'123'});const partner=await call('/login','',{username:'g11.partner',password:'123'}),cookies={partner:partner.cookie},users={partner:boot.body.account.id};
 for(const role of ['preparer','reviewer']){const invited=await call('/identity/manage',cookies.partner,{operation:'invite',username:'g11.'+role,name:'Actual G11 '+role,staff:people[role].person,capacity:role,firmAccess:'yes',reason:'Actual independently appointed fictional staff'});users[role]=invited.body.account.id;await call('/identity/activate','',{token:invited.body.activationToken,password:'123'});cookies[role]=(await call('/login','',{username:'g11.'+role,password:'123'})).cookie;}
 for(const role of ['preparer','reviewer','partner'])await call('/identity/manage',cookies.partner,{operation:'grant',subject:users[role],engagement:id,first:today(),last:'2028-12-31',reason:'Exact actual G11 engagement and capacity'});Object.assign(app.cookies,cookies);
 const source=async(content,name)=>{let s=await app.write('preparer',id,'support-upload',{...scope,evidenceType:'schedule',supplier:'Actual fictional G11 source owner',receivedOn:today(),channel:'manual',name,source:'Actual fictional method source inspected',base64:Buffer.from(content).toString('base64')});const evidence=s.evidence.at(-1).id;await app.write('reviewer',id,'support-assess',{id:evidence,result:'accepted',reason:'Exact original bytes, scope, intended role and content inspected independently'});return evidence;};
 return {...setup,source,call,users};
}
