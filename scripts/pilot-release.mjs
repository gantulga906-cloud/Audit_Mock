import { createHash, generateKeyPairSync, randomBytes, sign, verify } from 'node:crypto';
import { recordEvent } from '../src/lib/workspace.ts';
import { currentApproval, input, PilotError } from './pilot-workflow.mjs';

const fail=(message,status=409)=>{throw new PilotError(status,message);};
const now=()=>new Date().toISOString();
const hash=value=>createHash('sha256').update(value).digest('hex');
const missing=()=>fail('Тайлан хүргэх холбоос байхгүй эсвэл хугацаа дууссан.',404);

export const strictRelease=m=>!!(m.pilotManagement||m.pilotQuality||m.pilotSignatures);
export function signatureMatches(signature,artifact) {
  if (!signature||!artifact||signature.artifact!==artifact.sha256||hash(artifact.html)!==artifact.sha256) return false;
  try { return verify(null,Buffer.from(artifact.html),signature.publicKey,Buffer.from(signature.value,'base64')); }
  catch { return false; }
}

export function currentSignature(m,files) {
  const signature=m.pilotSignatures?.at(-1), signed=files.authorization()?.authorization;
  return signature&&signed?.at===signature.authorizationAt&&signatureMatches(signature,signed.artifact)?signature:undefined;
}

export function signReport(m,role,files) {
  if (role!=='partner') fail('Тайлангийн эрх бүхий партнер шаардлагатай.',403);
  if (!currentApproval(m,m.engagements[0])) fail('Одоогийн яг тайлангийн зөвшөөрөл шаардлагатай.');
  if (currentSignature(m,files)) return;
  if (m.pilotIssue?.authorizationAt===m.engagements[0].authorized.at) fail('Өмнө гаргасан тайланд шинэ гарын үсэг оруулахын тулд дахин зөвшөөрнө үү.');
  const signed=files.authorization()?.authorization, artifact=signed?.artifact;
  if (!artifact||hash(artifact.html)!==artifact.sha256) fail('Зөвшөөрсөн тайлангийн эх таарахгүй.');
  const {privateKey,publicKey}=generateKeyPairSync('ed25519');
  const signature={authorizationAt:signed.at,artifact:artifact.sha256,method:'pilot-ed25519',by:role,at:now(),
    publicKey:publicKey.export({type:'spki',format:'pem'}),value:sign(null,Buffer.from(artifact.html),privateKey).toString('base64')};
  (m.pilotSignatures??=[]).push(signature);
  recordEvent(m,'Тайлангийн яг эхэд локал гарын үсэг зурсан',artifact.form);
}

export function createReleaseStore(db,store,filesFor) {
  db.exec(`CREATE TABLE IF NOT EXISTS pilot_report_delivery (
    token_hash TEXT PRIMARY KEY, id TEXT NOT NULL UNIQUE, engagement TEXT NOT NULL, issued TEXT NOT NULL,
    authorization TEXT NOT NULL, artifact TEXT NOT NULL, recipient TEXT NOT NULL, contact TEXT NOT NULL,
    created TEXT NOT NULL, expires INTEGER NOT NULL, state TEXT NOT NULL, downloaded TEXT, received TEXT, response TEXT
  ); CREATE INDEX IF NOT EXISTS pilot_report_delivery_scope ON pilot_report_delivery(engagement,issued);`);
  const state=(row)=>row.state==='pending'&&row.expires<=Date.now()?'expired':row.state;
  function view(id) {
    return db.prepare('SELECT id,issued,artifact,recipient,contact,created,expires,state,downloaded,received,response FROM pilot_report_delivery WHERE engagement=? ORDER BY created DESC')
      .all(id).map(row=>({...row,state:state(row)}));
  }
  function start(m,role,data) {
    if (role!=='partner') fail('Хүргэлт бүртгэх партнер шаардлагатай.',403);
    const files=filesFor(m.engagement), issue=m.pilotIssue;
    if (files.archive.isSealed(m)||!issue||!currentApproval(m,m.engagements[0])||!issue.signature||
        issue.authorizationAt!==m.engagements[0].authorized?.at||!currentSignature(m,files)) fail('Одоогийн гарын үсэгтэй гаргалт шаардлагатай.');
    const contact=m.bench.clients[m.engagement].contacts.find(c=>c.id===data.recipient);
    if (!contact?.email||!contact.name) fail('Хянасан хүлээн авагч сонгоно уу.');
    const pending=db.prepare(`SELECT 1 FROM pilot_report_delivery WHERE engagement=? AND issued=? AND recipient=? AND
      (state='received' OR state='pending' AND expires>?)`).get(m.engagement,issue.at,contact.email,Date.now());
    if (pending) fail('Энэ гаргалтын холбоос эсвэл хүлээн авалт бүртгэгдсэн.');
    const token=randomBytes(32).toString('hex'), id=randomBytes(16).toString('hex');
    db.prepare(`INSERT INTO pilot_report_delivery (token_hash,id,engagement,issued,authorization,artifact,recipient,contact,created,expires,state)
      VALUES (?,?,?,?,?,?,?,?,?,?,'pending')`).run(hash(token),id,m.engagement,issue.at,issue.authorizationAt,issue.reportSha256,
        contact.email,contact.name,now(),Date.now()+86_400_000);
    recordEvent(m,'Локал тайлангийн хүргэлт үүсгэв · '+contact.name);
    return {token,id,recipient:contact.email};
  }
  function available(token) {
    const row=db.prepare("SELECT * FROM pilot_report_delivery WHERE token_hash=? AND state='pending' AND expires>?").get(hash(token),Date.now());
    if (!row) missing();
    const {model:m}=store.load('partner',row.engagement), files=filesFor(row.engagement), issue=m.pilotIssue;
    const artifact=files.authorization()?.authorization.artifact;
    if (issue?.at!==row.issued||issue.authorizationAt!==row.authorization||artifact?.sha256!==row.artifact||
        !currentApproval(m,m.engagements[0])||!signatureMatches(issue.signature,artifact)) missing();
    return {row,issue,artifact};
  }
  function read(token) {
    const {row,issue,artifact}=available(token);
    return {recipient:row.recipient,contact:row.contact,form:artifact.form,sha256:artifact.sha256,
      signedAt:issue.signature.at,downloaded:row.downloaded};
  }
  function download(token) {
    const {row,artifact}=available(token);
    db.prepare('UPDATE pilot_report_delivery SET downloaded=COALESCE(downloaded,?) WHERE id=?').run(now(),row.id);
    return artifact;
  }
  function receive(token,data) {
    const {row}=available(token);
    if (!row.downloaded||data.sha256!==row.artifact) fail('Яг энэ тайланг татаж хүлээн авна уу.');
    const at=now(), response=input(data,'response',1000);
    db.prepare("UPDATE pilot_report_delivery SET state='received',received=?,response=? WHERE id=?").run(at,response,row.id);
    return {at,sha256:row.artifact};
  }
  return {start,view,read,download,receive};
}
