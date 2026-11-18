import {randomUUID,createHash} from 'node:crypto';
import {actorKey} from './pilot-identity-context.mjs';
import {PilotError,input} from './pilot-workflow.mjs';
import {evidenceCurrent} from './pilot-requests.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex'),now=()=>new Date().toISOString();
const fail=(message,status=409)=>{throw new PilotError(status,message);};
const canonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);

// This durable boundary rehearses adapter outcomes locally. It performs no remote delivery,
// signature or ERP mutation and never advances the owning professional workflow.
export function createExternalEffects(db){
 db.exec('CREATE TABLE IF NOT EXISTS pilot_external_effects(id TEXT PRIMARY KEY,engagement TEXT NOT NULL,logical_key TEXT NOT NULL,version INTEGER NOT NULL,body TEXT NOT NULL,UNIQUE(engagement,logical_key,version))');
 const rows=id=>db.prepare('SELECT body FROM pilot_external_effects WHERE engagement=? ORDER BY logical_key,version').all(id).map(r=>JSON.parse(r.body));
 const save=j=>db.prepare('UPDATE pilot_external_effects SET body=? WHERE id=?').run(JSON.stringify(j),j.id);
 function original(m,files,id){const e=m.evidence.find(e=>e.id===id&&evidenceCurrent(m,e)),raw=e&&files.read(e.id);if(!raw||hash(raw.bytes)!==raw.sha256)fail('A current independently accepted original with matching bytes is required.');return {id:e.id,version:e.version,sha256:raw.sha256};}
 function action(m,role,action,data,files){
  if(!m.engagement)fail('Select the actual engagement.');if(role==='preparer')fail('An appointed reviewer or partner is required.',403);
  const actor=actorKey(role),all=rows(m.engagement),op=action.replace('external-','');
  if(op==='prepare'){
   const logicalKey=input(data,'logicalKey',120),kind=input(data,'kind',20);if(!['delivery','signing','erp'].includes(kind))fail('Select delivery, signing or ERP.',400);
   let payload;try{payload=JSON.parse(input(data,'payload',20000));}catch{fail('The exact adapter payload must be valid JSON.',400);}if(!payload||typeof payload!=='object'||Array.isArray(payload))fail('Select an exact object payload.',400);
   const previous=all.filter(j=>j.logicalKey===logicalKey).at(-1),artifact=original(m,files,input(data,'evidence',80));
   if(previous&&data.supersedes!==previous.id)fail('Explicitly identify the prior version before correcting its payload.');
   if(previous?.state==='unknown')fail('Reconcile the unknown outcome before correcting the operation.');
   const j={id:randomUUID(),engagement:m.engagement,logicalKey,version:(previous?.version??0)+1,kind,provider:'local-conformance',scope:'Disposable local adapter-contract rehearsal; no external effect',payload,artifact,digest:hash(canonical({kind,payload,artifact})),by:actor,at:now(),reason:input(data,'reason'),state:'prepared',attempts:[],history:[],...(previous&&{supersedes:previous.id})};
   db.prepare('INSERT INTO pilot_external_effects VALUES(?,?,?,?,?)').run(j.id,j.engagement,j.logicalKey,j.version,JSON.stringify(j));return;
  }
  const j=all.find(j=>j.id===data.id);if(!j)fail('Operation not found.',404);
  if(all.some(n=>n.supersedes===j.id))fail('This operation was superseded. Inspect the current correction.');
  if(data.digest!==j.digest)fail('Review the exact current payload and artifact digest.');
  if(op==='approve'){
   if(role!=='partner'||j.by===actor)fail('A different appointed partner must approve this exact adapter payload.',403);
   if(j.state!=='prepared')fail('Approve a prepared operation.');const current=original(m,files,j.artifact.id);if(canonical(current)!==canonical(j.artifact))fail('The exact original changed.');
   j.approval={by:actor,at:now(),digest:j.digest,reason:input(data,'reason')};j.state='approved';
  }else if(op==='attempt'){
   if(role!=='partner'||!j.approval||!['approved','failed'].includes(j.state))fail('An approved operation with a known retryable outcome is required. Unknown outcomes must be reconciled first.');
   const current=original(m,files,j.artifact.id);if(canonical(current)!==canonical(j.artifact))fail('The approved artifact is no longer current.');
   if(!['succeeded','failed','unknown'].includes(data.outcome))fail('Select the local conformance outcome.',400);
   const prior=j.attempts.at(-1),attempt={id:randomUUID(),providerOperation:j.id,number:j.attempts.length+1,correlation:j.logicalKey,digest:j.digest,artifactSha256:j.artifact.sha256,by:actor,at:now(),outcome:data.outcome,reason:input(data,'reason'),externalEffect:false};
   if(prior?.outcome==='unknown'&&prior.reconciliation?.outcome!=='failed')fail('The prior unknown result is not known to be retryable.');
   j.attempts.push(attempt);j.state=data.outcome;
  }else if(op==='reconcile'){
   const attempt=j.attempts.at(-1);if(role!=='partner'||j.state!=='unknown'||!attempt||!['succeeded','failed'].includes(data.outcome))fail('Reconcile the exact current unknown attempt.');
   const receipt=original(m,files,input(data,'receipt',80));attempt.reconciliation={outcome:data.outcome,receipt,by:actor,at:now(),reason:input(data,'reason'),provider:'local-conformance',externalEffect:false};j.state=data.outcome;
  }else fail('Unknown adapter operation.',400);
  j.history.push({action:op,by:actor,at:now(),state:j.state,digest:j.digest});save(j);
 }
 return {action,view:rows};
}
