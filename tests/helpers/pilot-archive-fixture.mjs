import assert from 'node:assert/strict';
import {DatabaseSync,backup} from 'node:sqlite';
import {createHash,randomUUID} from 'node:crypto';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {start,passwords,today} from './pilot-acceptance-fixture.mjs';
import {reportingFixture,reviewReport} from './pilot-reporting-fixture.mjs';
export const custodianPassword='G07-disposable-custodian';
export const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function snapshotDatabase(source,target){const db=new DatabaseSync(source,{readOnly:true});try{await backup(db,target);}finally{db.close();}}
export const authorityFields=(seed,kind)=>({archiveApprover:seed.people.partner.person,archiveCapacity:({'M12-F02':'file','M12-F04':'file','M12-F07':'disclosure','M12-F08':'retention','M12-F09':'recovery','M12-F10':'disclosure','M12-F11':'disposition'})[kind],archiveAuthority:seed.archiveAuthority,archiveAuthorityBasis:'Actual fictional appointment and separately declared authority for '+kind+'; no report-role override'});
export async function archiveProof(app,id,text,name='G07-archive-authority.csv',owner='reviewer'){
 const before=new Set((await app.view(owner,id)).evidence.map(e=>e.id));const saved=await app.write(owner,id,'archive-support-upload',{name,source:'Actual fictional archive-only policy/authority/result source',base64:Buffer.from(text).toString('base64')}),evidence=saved.evidence.find(e=>!before.has(e.id)).id;
 await app.write(owner==='partner'?'reviewer':'partner',id,'archive-support-assess',{id:evidence,result:'accepted',reason:'Independently inspected actual administrative source bytes, purpose and authority'});return evidence;
}
export async function receiveCurrentReport(app,id){
 const current=await app.view('partner',id),link=(await app.write('partner',id,'delivery-start',{recipient:current.reporting.recipients[0].id})).deliveryLink,token=link.token,metadata=await(await app.request('/delivery/'+token)).json();
 for(const [path,expected] of [['artifact',metadata.sha256],['statements',metadata.statements.sha256],['notes',metadata.notes.sha256]]){const response=await app.request('/delivery/'+token+'/'+path);assert.equal(response.status,200);assert.equal(sha(Buffer.from(await response.arrayBuffer())),expected);}
 const received=await app.request('/delivery/'+token,'',{sha256:metadata.sha256,packageSha256:metadata.packageSha256,response:'Actual fixture recipient inspected report, complete statements and notes'});assert.equal(received.status,200);return link;
}
export async function assembleArchive(app,seed){
 const {id}=seed,assembly=await app.register(id,'M12-F02',{...authorityFields(seed,'M12-F02'),policy:'Actual synthetic final-file policy',policyEvidence:seed.archiveAuthority,anchorKind:'issue',days:'30',classification:'Confidential fictional audit file',retentionBasis:'Retain until actual applicable requirements and restrictions are determined; no automatic legal minimum',indexReview:'Actually inspected exact final report/statement originals, decisions, review history and links'},'preparer','partner');
 const state=await app.write('partner',id,'archive-seal');assert.equal(state.archive.sealed,true);return {assembly,archive:state.archive.packages[0]};
}
export function custodyFields(seed,archive){return {package:archive.id,recipient:'Actual independent fictional archive custodian',custodianName:'Named independent fixture custodian',custodianAuthority:seed.archiveAuthority,independence:'Actual separate custody duty; no audit preparation or report-issue power',location:'Actual isolated fixture archive location',medium:'Actual local SQLite package and original-byte export',confidentiality:'Actual authorized scope and confidential handling; no public release'};}
export async function custodian(app,id){
 const login=await app.request('/oversight/login','',{role:'custodian',password:custodianPassword});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];
 const view=async()=>{const r=await app.request(app.path('/oversight',id),cookie);assert.equal(r.status,200);return r.json();};
 const action=async(fields,status=200)=>{const r=await app.request(app.path('/oversight/action',id),cookie,fields);assert.equal(r.status,status,JSON.stringify(await r.clone().json()).slice(0,240));return r.json();};
 const download=async archive=>{const r=await app.request(app.path('/oversight/download/'+archive.id,id),cookie);assert.equal(r.status,200);const raw=await r.text();assert.equal(sha(raw),archive.digest);return JSON.parse(raw);};
 return {cookie,view,action,download};
}
export function actualReadableItems(bundle){
 assert.ok(bundle.authorization.artifact.html.includes('<html'));assert.equal(sha(bundle.authorization.artifact.html),bundle.issue.reportSha256);
 const items=[{id:'report',sha256:bundle.issue.reportSha256,result:'readable',method:'Actually opened the retained HTML report text and inspected its exact content',reason:'Readable actual fixture HTML; no semantic audit approval'}];
 for(const f of bundle.evidence){const bytes=Buffer.from(f.base64,'base64');assert.equal(sha(bytes),f.sha256);const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);assert.ok(text.length);if(f.name.endsWith('.json'))JSON.parse(text);items.push({id:f.id,sha256:f.sha256,result:'readable',method:'Actually decoded and inspected original UTF-8 fixture content; JSON parsed where applicable',reason:'Actual fictional original is readable in the performed fixture method'});}return items;
}
export function inspectionFields(archive,items,key=randomUUID()){return {action:'inspect',package:archive.id,digest:archive.digest,inspectionKey:key,checkedOn:today(),location:'Actually checked isolated archive target',medium:'Actual downloaded JSON envelope and decoded original files',receipt:'Actually downloaded and inspected this exact package',confidentiality:'Actually checked authorized confidential custody scope',items:JSON.stringify(items)};}
export async function acceptCustody(app,seed,archive){await app.write('partner',seed.id,'archive-offer-custody',custodyFields(seed,archive));const c=await custodian(app,seed.id),bundle=await c.download(archive);await c.action(inspectionFields(archive,actualReadableItems(bundle)));await c.action({action:'accept',package:archive.id,digest:archive.digest,reason:'Independently inspected exact manifest, originals, readability and actual receipt'});return c;}
export async function buildArchiveSeed(directory){
 await mkdir(directory,{recursive:true});const database=join(directory,'source.sqlite'),app=await start(database,true,{custodian:custodianPassword});
 try{const seed=await reportingFixture(app,{synthetic:true});await app.write('partner',seed.id,'archive-enable',{reason:'Actual explicit G07 scope, file authority and custody controls for this fictional engagement'});seed.archiveAuthority=await archiveProof(app,seed.id,'Actual fictional approved final-file authority, named partner and independent custodian appointment; synthetic retention rules require actual declared minima and anchors; all unconfirmed restrictions retain the file.');let state=await reviewReport(app,seed.id,'4.1.A1');assert.deepEqual(state.gaps,[]);await app.write('partner',seed.id,'authorize');await snapshotDatabase(database,join(directory,'dated.sqlite'));await app.write('partner',seed.id,'report-sign');await app.write('partner',seed.id,'issue',{reference:'Actual G07 fixture controlled original issue'});await receiveCurrentReport(app,seed.id);await snapshotDatabase(database,join(directory,'issued.sqlite'));Object.assign(seed,await assembleArchive(app,seed));await snapshotDatabase(database,join(directory,'sealed.sqlite'));return {...seed,directory,credentials:passwords};}finally{await app.close();}
}
