import { createHash, randomBytes } from 'node:crypto';
import { recordEvent } from '../src/lib/workspace.ts';
import { accounts, fieldworkForms, input, PilotError } from './pilot-workflow.mjs';
import { requestAction } from './pilot-requests.mjs';
import { requireSeat } from './pilot-staffing.mjs';

const digest = token => createHash('sha256').update(token).digest('hex');
const now = () => new Date().toISOString();
const fail = (message,status=409) => { throw new PilotError(status,message); };
const unavailable = () => fail('Баталгаажуулах холбоос олдсонгүй эсвэл хугацаа дууссан.',404);

export function createConfirmationStore(db,store,filesFor) {
  db.exec(`CREATE TABLE IF NOT EXISTS pilot_confirmation (
    token_hash TEXT PRIMARY KEY, engagement TEXT NOT NULL, request TEXT NOT NULL, part TEXT NOT NULL,
    recipient TEXT NOT NULL, contact TEXT NOT NULL, issuer TEXT NOT NULL, sent TEXT NOT NULL, expires INTEGER NOT NULL,
    state TEXT NOT NULL, response TEXT, received TEXT, evidence TEXT
  ); CREATE INDEX IF NOT EXISTS pilot_confirmation_scope ON pilot_confirmation(engagement,request,part);`);

  function start(m,role,data) {
    if (role==='preparer') fail('Баталгаажуулах хүсэлтийн ахлах хянагч шаардлагатай.',403);
    const files=filesFor(m.engagement);
    if (files.archive.isSealed(m) || !m.engagements[0]?.intake.active) fail('Нээлттэй гэрээт ажил шаардлагатай.');
    requireSeat(m,files,role);
    const request=m.requests.find(r=>r.id===data.request), part=request?.parts.find(p=>p.id===data.part);
    if (request?.dispatch!=='issued' || !fieldworkForms(m).includes(request.form) ||
        !part || !['missing','rejected'].includes(part.state) || !request.contactEmail) fail('Гаргасан хүсэлтийн нээлттэй хэсэг шаардлагатай.');
    const token=randomBytes(32).toString('hex'), at=now();
    db.prepare(`UPDATE pilot_confirmation SET state='revoked' WHERE engagement=? AND request=? AND part=? AND state='pending'`)
      .run(m.engagement,request.id,part.id);
    db.prepare(`INSERT INTO pilot_confirmation (token_hash,engagement,request,part,recipient,contact,issuer,sent,expires,state)
      VALUES (?,?,?,?,?,?,?,?,?,'pending')`).run(digest(token),m.engagement,request.id,part.id,request.contactEmail,
      request.contact,role,at,Date.now()+86_400_000);
    recordEvent(m,request.id+' · Баталгаажуулах холбоос үүсгэв',request.form);
    return {token,request:request.id,part:part.id};
  }

  function pending(token) {
    const invite=db.prepare('SELECT * FROM pilot_confirmation WHERE token_hash=? AND state=? AND expires>?')
      .get(digest(token),'pending',Date.now());
    if (!invite) unavailable();
    const context=store.load(invite.issuer,invite.engagement), m=context.model;
    const request=m.requests.find(r=>r.id===invite.request), part=request?.parts.find(p=>p.id===invite.part);
    if (filesFor(invite.engagement).archive.isSealed(m) || request?.dispatch!=='issued' ||
        request.contactEmail!==invite.recipient || request.contact!==invite.contact ||
        !part || !['missing','rejected'].includes(part.state) || !fieldworkForms(m).includes(request.form)) unavailable();
    return {invite,request,part};
  }

  function receive(token,data) {
    const {invite,request,part}=pending(token);
    const role=Object.keys(accounts).find(role=>accounts[role]===request.owner);
    if (!role) unavailable();
    const context=store.load(role,invite.engagement), m=context.model, files=filesFor(invite.engagement);
    const response=input(data,'response',4000);
    requestAction(m,role,'upload',{request:request.id,part:part.id,name:data.name,base64:data.base64,
      source:'Sandbox confirmation · '+invite.recipient},files,fieldworkForms(m));
    const target=m.requests.find(r=>r.id===request.id).parts.find(p=>p.id===part.id);
    const file=m.evidence.find(e=>e.id===target.evidence), at=now();
    file.channel='sandbox-confirmation';
    delete file.uploadedBy;
    target.uses.at(-1).by=invite.recipient;
    db.prepare(`UPDATE pilot_confirmation SET state='received',response=?,received=?,evidence=? WHERE token_hash=?`)
      .run(response,at,file.id,invite.token_hash);
    store.save(context,'confirmation-receive',{});
    return {request:request.id,received:at};
  }

  return {start,receive,read(token) {
    const {invite,request,part}=pending(token);
    return {request:request.id,part:part.title,recipient:invite.recipient,contact:invite.contact,expires:new Date(invite.expires).toISOString()};
  },view(id) {
    return db.prepare('SELECT request,part,recipient,sent,expires,state,response,received,evidence FROM pilot_confirmation WHERE engagement=? ORDER BY sent DESC')
      .all(id).map(r=>({...r,state:r.state==='pending'&&r.expires<=Date.now()?'expired':r.state}));
  }};
}
