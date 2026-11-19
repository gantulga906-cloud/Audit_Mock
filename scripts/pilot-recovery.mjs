import {DatabaseSync,backup} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const sha=v=>createHash('sha256').update(v).digest('hex');
export function recoveryManifest(path){
 const db=new DatabaseSync(resolve(path),{readOnly:true});
 try{
  assert.deepEqual(db.prepare('PRAGMA integrity_check').all().map(r=>r.integrity_check),['ok'],'SQLite integrity');
  assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(),[],'SQLite foreign keys');
  const evidence=db.prepare('SELECT id,engagement_id,name,sha256,bytes FROM evidence ORDER BY engagement_id,id').all().map(f=>{assert.equal(sha(f.bytes),f.sha256,'Original '+f.id);return {id:f.id,engagement:f.engagement_id,name:f.name,sha256:f.sha256,bytes:f.bytes.length};});
  const authorizations=db.prepare('SELECT id,engagement_id,snapshot FROM authorizations ORDER BY id').all().map(r=>{const a=JSON.parse(r.snapshot).authorization,report=a.artifact;if(report)assert.equal(sha(report.html),report.sha256,'Authorized report');return {id:r.id,engagement:r.engagement_id,at:a.at,report:report?.sha256,statement:a.fs,package:report?.packageSha256??null};});
  const archives=db.prepare('SELECT id,engagement_id,previous,digest,payload FROM pilot_archives ORDER BY id').all().map(r=>{if(r.payload){assert.equal(sha(r.payload),r.digest,'Archive '+r.id);const b=JSON.parse(r.payload);if(b.authorization.artifact)assert.equal(sha(b.authorization.artifact.html),b.issue.reportSha256,'Archived report');for(const f of b.evidence)assert.equal(sha(Buffer.from(f.base64,'base64')),f.sha256,'Archived original');}return {id:r.id,engagement:r.engagement_id,previous:r.previous,digest:r.digest,disposed:r.payload===null};});
  const memberships=db.prepare('SELECT engagement_id,role FROM pilot_engagement_members ORDER BY engagement_id,role').all();
  const grants=db.prepare('SELECT id,body FROM pilot_engagements ORDER BY id').all().flatMap(row=>(JSON.parse(row.body).pilotRecords??[]).filter(r=>['M12-F07','M12-F10'].includes(r.kind)).map(r=>({engagement:row.id,id:r.id,version:r.version,status:r.status,scope:r.kind==='M12-F07'?'full':r.values.scope,package:r.values.package,accessor:r.values.accessor,until:r.values.until,revoked:!!r.revoked})));
  const exists=name=>!!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(name);
  const named=exists('pilot_identities')?{users:db.prepare('SELECT id,username,name,staff,capacity,status,admin,firm_access,epoch FROM pilot_identities ORDER BY id').all(),grants:db.prepare('SELECT * FROM pilot_identity_grants ORDER BY id').all(),events:db.prepare('SELECT * FROM pilot_identity_events ORDER BY id').all(),settings:db.prepare('SELECT * FROM pilot_identity_settings ORDER BY id').all()}:undefined;
  const records=Object.fromEntries(['pilot_firm','pilot_engagements','pilot_form_library','pilot_templates','pilot_external_effects','pilot_capacity_state','pilot_credential_documents','pilot_specialist_exports'].filter(exists).map(table=>{const rows=db.prepare('SELECT * FROM '+table).all().map(r=>JSON.stringify(r)).sort();return [table,{count:rows.length,sha256:sha(rows.join('\n'))}];}));
  const scopeDigest=sha(JSON.stringify({memberships,grants,...(named&&{named})}));
  return {evidence,authorizations,archives,memberships,grants,scopeDigest,records,...(named&&{named})};
 }finally{db.close();}
}
export async function rehearseRecovery(source,targetDirectory){
 const sourcePath=resolve(source),target=resolve(targetDirectory),started=Date.now();
 // A new directory prevents either backup destination from overwriting an existing file.
 await mkdir(target,{recursive:false});
 const snapshot=join(target,'snapshot.sqlite'),restored=join(target,'restored.sqlite'),reader=new DatabaseSync(sourcePath,{readOnly:true});
 try{await backup(reader,snapshot);}finally{reader.close();}
 const saved=new DatabaseSync(snapshot,{readOnly:true});try{await backup(saved,restored);}finally{saved.close();}
 const sourceManifest=recoveryManifest(snapshot),restoredManifest=recoveryManifest(restored);assert.deepEqual(restoredManifest,sourceManifest,'Recovered exact IDs, scope and originals');
 const result={kind:'audit-pilot-sqlite-recovery-v1',at:new Date().toISOString(),verified:true,elapsedMs:Date.now()-started,sourceManifest,restoredManifest,boundary:'Disposable supported SQLite backup/restore rehearsal; credentials, sessions and database files remain private. No production RPO/RTO or proprietary-file readability is established.'};
 await writeFile(join(target,'verification.json'),JSON.stringify(result,null,2)+'\n');
 return {restored,result};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length!==4)throw Error('Usage: node scripts/pilot-recovery.mjs SOURCE.sqlite NEW-TARGET-DIRECTORY');
 const {result}=await rehearseRecovery(process.argv[2],process.argv[3]);console.log(JSON.stringify({verified:result.verified,archives:result.sourceManifest.archives.length,originals:result.sourceManifest.evidence.length,elapsedMs:result.elapsedMs,boundary:result.boundary}));
}
