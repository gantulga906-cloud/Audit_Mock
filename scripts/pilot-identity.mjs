import {randomBytes,randomUUID,createHash,scryptSync,timingSafeEqual} from 'node:crypto';
import {currentIdentity,withIdentity} from './pilot-identity-context.mjs';
import {approvedRows,archiveGrantKinds} from './pilot-registers.mjs';
import {seatFor} from './pilot-staffing.mjs';
import {PilotError} from './pilot-workflow.mjs';

const now=()=>new Date().toISOString(),day=()=>now().slice(0,10),sha=x=>createHash('sha256').update(x).digest('hex');
const capacities=['preparer','reviewer','partner','quality','custodian'];
const fail=(status,message)=>{throw new PilotError(status,message);};
const text=(v,max=200)=>typeof v==='string'&&v.trim()&&v.length<=max?v.trim():fail(400,'A required account field is invalid.');
const username=v=>{v=text(v,80).toLowerCase();if(!/^[a-z0-9][a-z0-9._-]{2,79}$/.test(v))fail(400,'Use 3–80 letters, numbers, dots, underscores or hyphens for the username.');return v;};
const password=v=>{if(typeof v!=='string'||v.length>128||v!=='123'&&v.length<15)fail(400,'For this local preview use 123, or a passphrase of 15–128 characters.');return v;};
const safe=u=>({id:u.id,username:u.username,name:u.name,staff:u.staff,capacity:u.capacity,status:u.status,admin:!!u.admin,firmAccess:!!u.firm_access,epoch:u.epoch});

export function createIdentityStore(db,store){
 db.exec(`CREATE TABLE IF NOT EXISTS pilot_identity_settings(id INTEGER PRIMARY KEY CHECK(id=1),legacy_team INTEGER NOT NULL); INSERT OR IGNORE INTO pilot_identity_settings VALUES(1,1); CREATE TABLE IF NOT EXISTS pilot_identities(id TEXT PRIMARY KEY,username TEXT UNIQUE COLLATE NOCASE NOT NULL,name TEXT NOT NULL,staff TEXT UNIQUE NOT NULL,capacity TEXT NOT NULL,status TEXT NOT NULL,admin INTEGER NOT NULL,firm_access INTEGER NOT NULL,epoch INTEGER NOT NULL,salt TEXT,hash BLOB,invite TEXT,invite_expires INTEGER);
 CREATE TABLE IF NOT EXISTS pilot_identity_sessions(token TEXT PRIMARY KEY,subject TEXT NOT NULL REFERENCES pilot_identities(id),epoch INTEGER NOT NULL,expires INTEGER NOT NULL,last_seen INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS pilot_identity_grants(id TEXT PRIMARY KEY,subject TEXT NOT NULL REFERENCES pilot_identities(id),engagement TEXT NOT NULL,capacity TEXT NOT NULL,first TEXT NOT NULL,last TEXT NOT NULL,by_actor TEXT NOT NULL,at TEXT NOT NULL,reason TEXT NOT NULL,revoked TEXT);
 CREATE INDEX IF NOT EXISTS pilot_identity_grants_scope ON pilot_identity_grants(subject,engagement);
 CREATE TABLE IF NOT EXISTS pilot_identity_events(id TEXT PRIMARY KEY,subject TEXT,by_actor TEXT NOT NULL,at TEXT NOT NULL,operation TEXT NOT NULL,detail TEXT NOT NULL);`);
 const get=id=>db.prepare('SELECT * FROM pilot_identities WHERE id=?').get(id);
 const event=(subject,by,operation,detail)=>db.prepare('INSERT INTO pilot_identity_events VALUES(?,?,?,?,?,?)').run(randomUUID(),subject,by,now(),operation,JSON.stringify(detail));
 const firm=()=>({...JSON.parse(db.prepare('SELECT body FROM workspace WHERE id=1').get().body),pilotRecords:JSON.parse(db.prepare('SELECT records FROM pilot_firm WHERE id=1').get().records)});
 function eligible(u,m=firm()){
  const p=approvedRows(m,'M01-F03').find(p=>p.id===u.staff),appointments=approvedRows(m,'M01-F06');
  return p?.values.status==='active'&&p.values.account===u.capacity&&appointments.some(a=>a.values.person===u.staff&&(a.values.capacity||a.values.role?.toLowerCase())===u.capacity&&a.values.from<=day()&&(!a.values.to||a.values.to>=day()));
 }
 function live(id){const u=get(id),c=currentIdentity();if(!u||u.status!=='active'||c?.id===id&&(c.epoch!==u.epoch||c.expires&&c.expires<=Date.now()||c.authenticatedAt&&c.authenticatedAt<Date.now()-30*60000)||!eligible(u))fail(401,'This named account is inactive or its staff appointment is no longer current.');return u;}
 function admin(){const c=currentIdentity(),u=c&&live(c.id);if(!u?.admin)fail(403,'An explicitly appointed local account administrator is required.');return u;}
 function invite(data,by,bootstrap=false){
  const capacity=text(data.capacity,20);if(!capacities.includes(capacity))fail(400,'Unknown account capacity.');
  const u={id:'U-'+randomUUID(),username:username(data.username),name:text(data.name),staff:text(data.staff,80),capacity};
  if(bootstrap&&capacity!=='partner')fail(400,'Bootstrap the named partner account administrator first.');
  if(!eligible(u))fail(409,'Link the account to an approved active M01-F03 person and a current M01-F06 appointment of the same capacity.');
  if(db.prepare('SELECT 1 FROM pilot_identities WHERE username=? OR staff=?').get(u.username,u.staff))fail(409,'That username or staff record already has a named account.');
  const token=randomBytes(32).toString('hex');
  db.prepare('INSERT INTO pilot_identities VALUES(?,?,?,?,?,?,?,?,1,NULL,NULL,?,?)').run(u.id,u.username,u.name,u.staff,u.capacity,'invited',+(bootstrap||data.admin==='yes'),+(bootstrap||data.firmAccess==='yes'),sha(token),Date.now()+86400000);
  event(u.id,by,'invite',{...u,admin:bootstrap||data.admin==='yes',firmAccess:bootstrap||data.firmAccess==='yes',reason:text(data.reason,4000)});
  return {account:safe(get(u.id)),activationToken:token,expires:nowFrom(Date.now()+86400000),delivery:'Hand this local activation token to the intended person. No email was sent.'};
 }
 function activate(data){
  if(typeof data.token!=='string'||!/^[a-f0-9]{64}$/.test(data.token))fail(401,'Invalid or expired activation token.');
  const u=db.prepare('SELECT * FROM pilot_identities WHERE invite=? AND invite_expires>? AND status=?').get(sha(data.token),Date.now(),'invited');
  if(!u||!eligible(u))fail(401,'Invalid or expired activation token.');
  const salt=randomBytes(16).toString('hex'),hash=scryptSync(password(data.password),salt,64);
  db.prepare("UPDATE pilot_identities SET salt=?,hash=?,status='active',invite=NULL,invite_expires=NULL,epoch=epoch+1 WHERE id=?").run(salt,hash,u.id);event(u.id,u.id,'activate',{profile:'local-preview'});return {activated:true,username:u.username};
 }
 function login(data){
  const name=typeof data.username==='string'?data.username.toLowerCase().trim():'',u=db.prepare('SELECT * FROM pilot_identities WHERE username=?').get(name),salt=u?.salt??'invalid-local-account';
  const valid=typeof data.password==='string'&&data.password.length<=128,computed=scryptSync(valid?data.password:'invalid',salt,64);
  if(!u||u.status!=='active'||!valid||!u.hash||!timingSafeEqual(u.hash,computed)||!eligible(u))fail(401,'Username or password is incorrect, or the account is unavailable.');
  const token=randomBytes(32).toString('hex');db.prepare('INSERT INTO pilot_identity_sessions VALUES(?,?,?,?,?)').run(sha(token),u.id,u.epoch,Date.now()+8*3600000,Date.now());event(u.id,u.id,'login',{});return {token,identity:safe(u)};
 }
 function session(token,touch=true){
  if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token))return;
  const s=db.prepare('SELECT * FROM pilot_identity_sessions WHERE token=?').get(sha(token));if(!s)return;
  const u=get(s.subject);if(!u||u.status!=='active'||u.epoch!==s.epoch||s.expires<=Date.now()||s.last_seen<Date.now()-30*60000||!eligible(u))return;
  if(touch)db.prepare('UPDATE pilot_identity_sessions SET last_seen=? WHERE token=?').run(Date.now(),sha(token));
  return {...safe(u),role:u.capacity,expires:s.expires,authenticatedAt:Date.now()};
 }
 function independentAppointed(u,m){if(u.capacity==='quality')return [m.pilotQuality?.policy,m.pilotFinalQuality?.policy].some(p=>p?.mode==='required'&&p.eligibilityStatus==='eligible'&&[u.id,u.staff].includes(p.reviewer));if(u.capacity==='custodian'){const offer=m.pilotCustody?.at(-1);return offer&&!offer.returned&&[u.id,u.staff].includes(offer.assignment?.custodian);}return false;}
 function grantFor(u,id,m){
  const g=db.prepare('SELECT * FROM pilot_identity_grants WHERE subject=? AND engagement=? AND revoked IS NULL AND first<=? AND last>=?').get(u.id,id,day(),day());
  if(!g||g.capacity!==u.capacity||!eligible(u,m))return;
  if(['quality','custodian'].includes(u.capacity)){if(!independentAppointed(u,m))return;}else if(m.engagements[0]?.intake.active){const seat=seatFor(m,u.capacity,day(),day(),u.staff);if(!seat)return;}
  return g;
 }
 function permitted(id,m){const c=currentIdentity();if(!c)return true;const u=live(c.id);return id?!!grantFor(u,id,m):!!u.firm_access;}
 function bindings(id,m){
  const users=db.prepare('SELECT * FROM pilot_identities ORDER BY id').all();
  const granted=users.filter(u=>u.status==='active'&&eligible(u,m)&&(id?grantFor(u,id,m):u.firm_access));
  const referred=new Set([m.person,currentIdentity().id,...granted.map(u=>u.id)]);for(const w of Object.values(m.work??{})){for(const id of [w.owner,w.reviewer,w.submittedBy,...w.history.map(h=>h.by),...w.notes.flatMap(n=>[n.author,...(n.responses??[]).map(r=>r.by),...(n.decisions??[]).map(r=>r.by)])])referred.add(id);}for(const a of m.activity??[])referred.add(a.by);
  const counts=Map.groupBy(granted,u=>u.capacity),aliases=Object.fromEntries([...counts].filter(([,rows])=>rows.length===1).map(([capacity,rows])=>[capacity,rows[0].id]));
  return {runtimePeople:users.filter(u=>!id&&currentIdentity().firmAccess||referred.has(u.id)).map(u=>({id:u.id,name:u.name,initials:u.name.slice(0,2),role:u.capacity,staff:u.staff,title:u.capacity,scope:id&&granted.includes(u)?[id]:[],support:[]})),runtimeAccounts:aliases,runtimeScope:id?{[id]:granted.map(u=>u.id)}:{},runtimeIdentity:safe(live(currentIdentity().id))};
 }
 function retireAuthority(subject,reason,by){
  const grants=db.prepare('SELECT * FROM pilot_identity_grants WHERE subject=? AND revoked IS NULL').all(subject);
  for(const g of grants){db.prepare('UPDATE pilot_identity_grants SET revoked=? WHERE id=?').run(JSON.stringify({by,at:now(),reason}),g.id);invalidateCapacity(g.engagement,g.capacity,by,reason);}
 }
 function invalidateCapacity(id,capacity,by,reason){
  const row=db.prepare('SELECT body FROM pilot_engagements WHERE id=?').get(id);if(!row)return;const m=JSON.parse(row.body);
  (m.pilotRecipientRevisions??={})[capacity]=(m.pilotRecipientRevisions[capacity]??0)+1;
  for(const r of m.pilotRecords??[])if(archiveGrantKinds.includes(r.kind)&&r.status==='approved'&&r.values.accessor===capacity&&!r.revoked)r.revoked={by,at:now(),reason};
  db.prepare('UPDATE pilot_engagements SET body=?,revision=revision+1 WHERE id=?').run(JSON.stringify(m),id);
 }
 function manage(data){
  const a=admin(),reason=text(data.reason,4000),operation=text(data.operation,30);
  if(operation==='invite')return invite(data,a.id);
  if(operation==='legacy-policy'){if(!['enabled','disabled'].includes(data.policy))fail(400,'Choose an explicit team login policy.');db.prepare('UPDATE pilot_identity_settings SET legacy_team=? WHERE id=1').run(+(data.policy==='enabled'));if(data.policy==='disabled')db.prepare("DELETE FROM sessions WHERE role IN ('preparer','reviewer','partner')").run();event(a.id,a.id,operation,{policy:data.policy,reason});return {saved:true};}
  const u=get(text(data.subject,80));if(!u)fail(404,'Named account not found.');
  if(operation==='grant'){
   if(u.status!=='active')fail(409,'Activate the account before granting an engagement.');
   const id=text(data.engagement,80),row=db.prepare('SELECT body FROM pilot_engagements WHERE id=?').get(id);if(!row)fail(404,'Engagement not found.');
   const m={...JSON.parse(row.body),pilotRecords:[...firm().pilotRecords,...JSON.parse(row.body).pilotRecords??[]]};
   const first=text(data.first,10),last=text(data.last,10);if(!validDay(first)||!validDay(last)||first>last||!eligible(u,m))fail(409,'Select valid grant dates and a current staff appointment.');
   if(['quality','custodian'].includes(u.capacity)){if(!independentAppointed(u,m))fail(409,'The independent policy or custody offer must explicitly appoint this staff ID, with its separate eligibility and authority.');}else if(m.engagements[0].intake.active){const seat=seatFor(m,u.capacity,first,last,u.staff);if(!seat)fail(409,'The named person must hold the approved M04-F06 appointment for the full grant window.');}
   if(db.prepare("SELECT 1 FROM pilot_identity_grants WHERE engagement=? AND capacity=? AND revoked IS NULL AND first<=? AND last>=? AND (subject=? OR capacity IN ('partner','quality','custodian'))").get(id,u.capacity,last,first,u.id))fail(409,'Revoke the overlapping named capacity grant before replacing it.');
   db.prepare('INSERT INTO pilot_identity_grants VALUES(?,?,?,?,?,?,?,?,?,NULL)').run(randomUUID(),u.id,id,u.capacity,first,last,a.id,now(),reason);event(u.id,a.id,'grant',{engagement:id,capacity:u.capacity,first,last,reason});
  }else if(operation==='revoke'){
   const g=db.prepare('SELECT * FROM pilot_identity_grants WHERE id=? AND subject=? AND revoked IS NULL').get(data.grant,u.id);if(!g)fail(404,'Current grant not found.');db.prepare('UPDATE pilot_identity_grants SET revoked=? WHERE id=?').run(JSON.stringify({by:a.id,at:now(),reason}),g.id);invalidateCapacity(g.engagement,g.capacity,a.id,reason);event(u.id,a.id,operation,{grant:g.id,reason});
  }else if(operation==='status'){
   if(!['suspended','departed'].includes(data.status)||u.id===a.id)fail(409,'Select another account to suspend or mark departed.');retireAuthority(u.id,reason,a.id);db.prepare('UPDATE pilot_identities SET status=?,epoch=epoch+1,invite=NULL WHERE id=?').run(data.status,u.id);event(u.id,a.id,operation,{status:data.status,reason});
  }else if(operation==='reinvite'){
   if(!['invited','suspended'].includes(u.status))fail(409,'Reinvite an invited or suspended account. Departed identities remain historical.');const token=randomBytes(32).toString('hex');db.prepare("UPDATE pilot_identities SET status='invited',epoch=epoch+1,invite=?,invite_expires=? WHERE id=?").run(sha(token),Date.now()+86400000,u.id);event(u.id,a.id,operation,{reason});return {activationToken:token,account:safe(get(u.id))};
  }else if(operation==='capacity'){
   const capacity=text(data.capacity,20);if(u.id===a.id||!capacities.includes(capacity)||!eligible({...u,capacity}))fail(409,'Approve the new staff capacity and current firm appointment first; change another account.');retireAuthority(u.id,reason,a.id);db.prepare('UPDATE pilot_identities SET capacity=?,epoch=epoch+1 WHERE id=?').run(capacity,u.id);event(u.id,a.id,operation,{previous:u.capacity,capacity,reason});
  }else if(operation==='label'){
   db.prepare('UPDATE pilot_identities SET name=? WHERE id=?').run(text(data.name),u.id);event(u.id,a.id,operation,{previous:u.name,name:data.name,reason});
  }else fail(400,'Unknown account operation.');
  return {saved:true};
 }
 function directory(){admin();return {profile:'local-preview',legacyTeam:!!db.prepare('SELECT legacy_team FROM pilot_identity_settings WHERE id=1').get().legacy_team,accounts:db.prepare('SELECT * FROM pilot_identities ORDER BY username').all().map(safe),grants:db.prepare('SELECT * FROM pilot_identity_grants ORDER BY at,id').all(),events:db.prepare('SELECT * FROM pilot_identity_events ORDER BY at DESC,id').all().map(e=>({...e,detail:JSON.parse(e.detail)}))};}
 function bootstrap(data){if(db.prepare('SELECT 1 FROM pilot_identities WHERE admin=1').get())fail(409,'The named administrator was already bootstrapped.');return invite({...data,capacity:'partner'},'legacy-local-bootstrap',true);}
 function created(id){const c=currentIdentity();if(!c)return;db.prepare('INSERT INTO pilot_identity_grants VALUES(?,?,?,?,?,?,?,?,?,NULL)').run(randomUUID(),c.id,id,c.capacity,day(),'2099-12-31',c.id,now(),'Creator access for setup; active work still requires approved staffing.');}
 return {login,session,activate,bootstrap,manage,directory,permitted,bindings,created,asPerson:(person,fn)=>person.startsWith('U-')?withIdentity(safe(live(person)),fn):fn(),hasAdministrator:()=>!!db.prepare('SELECT 1 FROM pilot_identities WHERE admin=1').get(),legacyTeam:()=>!!db.prepare('SELECT legacy_team FROM pilot_identity_settings WHERE id=1').get().legacy_team,receipt:(action,scope,revision,fields)=>{const c=currentIdentity();if(c)event(c.id,c.id,'command',{action,scope,revision,fieldsSha256:sha(JSON.stringify(fields))});},logout:token=>db.prepare('DELETE FROM pilot_identity_sessions WHERE token=?').run(sha(token)),configured:role=>!!db.prepare("SELECT 1 FROM pilot_identities WHERE capacity=? AND status='active'").get(role),canAdmin:()=>!!currentIdentity()&&!!get(currentIdentity().id)?.admin};
}
const nowFrom=n=>new Date(n).toISOString();
const validDay=d=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d+'T00:00:00Z'))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;
