import {DatabaseSync,backup} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
import {createPilot} from './pilot-server.mjs';
import {rehearseRecovery} from './pilot-recovery.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');

// Private logical comparison: exact earlier records, originals and permissions, excluding
// expiring sessions. Receipt contains hashes/counts, never passwords or session tokens.
export function migrationInventory(database){
 const db=new DatabaseSync(resolve(database),{readOnly:true});
 try{return Object.fromEntries(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(r=>r.name).filter(table=>!['accounts','sessions','pilot_identity_sessions'].includes(table)).map(table=>{
  const exclude=new Set(['salt','hash','invite','invite_expires']),columns=db.prepare('PRAGMA table_info('+table+')').all().map(c=>c.name).filter(c=>!exclude.has(c));
  const rows=db.prepare('SELECT '+columns.map(c=>'"'+c+'"').join(',')+' FROM '+table).all().map(r=>JSON.stringify(r,(_,v)=>v instanceof Uint8Array?Buffer.from(v).toString('base64'):v)).sort();
  return [table,{count:rows.length,sha256:hash(rows.join('\n'))}];
 }));}finally{db.close();}
}

export async function rehearseOperations({source,targetDirectory,credentials,requests=20,concurrency=2,approvedTarget}){
 const target=resolve(targetDirectory),sourcePath=resolve(source);if(!Number.isInteger(requests)||requests<1||requests>10000||!Number.isInteger(concurrency)||concurrency<1||concurrency>32)throw Error('Select 1–10000 requests and 1–32 workers.');
 if(approvedTarget&&(!approvedTarget.owner||!approvedTarget.basis||!Number.isFinite(approvedTarget.p95Ms)||approvedTarget.p95Ms<=0||!Number.isFinite(approvedTarget.failureRate)||approvedTarget.failureRate<0||approvedTarget.failureRate>1))throw Error('An approved workload target needs an owner, basis, positive p95 milliseconds and a failure rate from zero to one.');
 await mkdir(target,{recursive:false});const original=join(target,'rollback.sqlite'),migrated=join(target,'migrated.sqlite'),reader=new DatabaseSync(sourcePath,{readOnly:true});try{await backup(reader,original);}finally{reader.close();}
 const prior=migrationInventory(original),before=new DatabaseSync(original,{readOnly:true});try{await backup(before,migrated);}finally{before.close();}
 const pilot=createPilot({database:migrated}),after=migrationInventory(migrated);for(const [table,expected] of Object.entries(prior))assert.deepEqual(after[table],expected,'Migration preserves '+table);
 const server=createServer((req,res)=>void pilot.handle(req,res,new URL(req.url,'http://127.0.0.1')));await new Promise((r,j)=>{server.once('error',j);server.listen(0,'127.0.0.1',r);});const origin='http://127.0.0.1:'+server.address().port;
 let workload;
 try{
  const initial=await fetch(origin+'/api/pilot');assert.equal(initial.status,200);assert.ok('setup' in await initial.json());
  const login=await fetch(origin+'/api/pilot/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(credentials)});assert.equal(login.status,200,'Authenticate the copied local account');const cookie=login.headers.get('set-cookie').split(';')[0],view=await login.json();
  const scope=view.portfolio[0]?.id??'firm',samples=[];let sequence=0;
  await Promise.all(Array.from({length:concurrency},async()=>{while(sequence<requests){const index=sequence++,started=performance.now();const response=await fetch(origin+'/api/pilot?engagement='+scope,{headers:{Cookie:cookie}});const body=await response.json();samples.push({index,ms:performance.now()-started,ok:response.status===200&&body.role===view.role,revision:body.revision});}}));
  const sorted=samples.map(s=>s.ms).sort((a,b)=>a-b),p95Ms=sorted[Math.ceil(sorted.length*0.95)-1],failures=samples.filter(s=>!s.ok).length;
  workload={profile:approvedTarget?'operator-supplied-approved-target':'bounded-engineering-fixture',requests,concurrency,engagements:view.portfolio.length,p95Ms,failures,failureRate:failures/requests,scope:'Authenticated scoped reads on the disposable migrated copy; writes, large originals, provider latency and representative firm-scale loads require their own approved profiles.',...(approvedTarget&&{target:approvedTarget,targetMet:p95Ms<=approvedTarget.p95Ms&&failures/requests<=approvedTarget.failureRate}),samples};
 }finally{await new Promise(r=>server.close(r));pilot.close();}
 assert.deepEqual(migrationInventory(original),prior,'Rollback copy stays unchanged');
 const {result:recovery}=await rehearseRecovery(migrated,join(target,'recovery'));
 // A completely fresh database is bootstrapped separately from meaningful migrated data.
 const clean=createPilot({database:join(target,'bootstrap.sqlite'),setupCode:'G09-disposable-bootstrap-only'});assert.ok(clean.setupCode);clean.close();
 const receipt={kind:'audit-g09-operations-rehearsal-v1',at:new Date().toISOString(),sourcePathHash:hash(sourcePath),originalInventory:prior,migratedInventory:after,preservedTables:Object.keys(prior),migrationPreserved:true,rollbackCopyPreserved:true,recoveryVerified:recovery.verified,cleanBootstrap:true,workload,
  operational:[{id:'OPS-BOOTSTRAP',status:'fixture-passed'},{id:'OPS-MIGRATION',status:'copy-rehearsal-passed'},{id:'OPS-RECOVERY',status:'copy-rehearsal-passed'},{id:'OPS-WORKLOAD',status:approvedTarget?(workload.targetMet?'selected-target-met':'selected-target-failed'):'engineering-observation-only'},{id:'OPS-DEPLOYMENT',status:'not-deployed-or-accepted'}],releaseReady:false,boundary:'No live cutover, production RPO/RTO, representative workload approval, storage provider acceptance, security certification or independent release acceptance is inferred.'};
 await writeFile(join(target,'operations-receipt.json'),JSON.stringify(receipt,null,2)+'\n');return receipt;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const [source,targetDirectory,privateConfig]=process.argv.slice(2);if(!source||!targetDirectory||!privateConfig)throw Error('Usage: node scripts/pilot-operations-rehearsal.mjs source.sqlite new-output-directory private-config.json');
 const result=await rehearseOperations({source,targetDirectory,...JSON.parse(await readFile(resolve(privateConfig),'utf8'))});console.log(JSON.stringify({migrationPreserved:result.migrationPreserved,recoveryVerified:result.recoveryVerified,operational:result.operational,releaseReady:false}));
}
