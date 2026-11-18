import { createHash, randomBytes } from 'node:crypto';
import { recordEvent } from '../src/lib/workspace.ts';
import { accounts, accountFor, fieldworkForms, input, PilotError } from './pilot-workflow.mjs';
import { requestAction } from './pilot-requests.mjs';
import { requireSeat } from './pilot-staffing.mjs';
import {approvedRows,programmeDecision} from './pilot-registers.mjs';
import {managedEvidence} from './pilot-data-methods.mjs';
import {activeTermsGap} from './pilot-intake.mjs';

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

  if(!db.prepare('PRAGMA table_info(pilot_confirmation)').all().some(column=>column.name==='basis'))db.exec('ALTER TABLE pilot_confirmation ADD COLUMN basis TEXT');

  function start(m,role,data) {
    if (role==='preparer') fail('Баталгаажуулах хүсэлтийн ахлах хянагч шаардлагатай.',403);
    const files=filesFor(m.engagement);
    if (files.archive.isSealed(m) || !m.engagements[0]?.intake.active) fail('Нээлттэй гэрээт ажил шаардлагатай.');
    requireSeat(m,files,role);
    const request=m.requests.find(r=>r.id===data.request), part=request?.parts.find(p=>p.id===data.part);
    if (request?.dispatch!=='issued' || !fieldworkForms(m).includes(request.form) ||
        !part || !['missing','rejected'].includes(part.state) || !request.contactEmail) fail('Гаргасан хүсэлтийн нээлттэй хэсэг шаардлагатай.');
    let basis;
    if(managedEvidence(m)){
      const record=approvedRows(m,'M07-F08').find(r=>r.id===(data.caseId??request.confirmationCase));
      if(!part.requirement||!record||record.values.programme!==programmeDecision(m,request.form)?.id||record.values.address!==request.contactEmail||record.values.dispatch!=='prepared'||record.values.result!=='pending')fail('Яг хүлээн авагч, шууд суваг ба бэлтгэсэн хүрээг хараат бусаар хянасан баталгаажуулалтын бүртгэл шаардлагатай.');
      basis={record:record.id,version:record.version,requirement:digest(JSON.stringify(part.requirement))};
    }
    const token=randomBytes(32).toString('hex'), at=now();
    db.prepare(`UPDATE pilot_confirmation SET state='revoked' WHERE engagement=? AND request=? AND part=? AND state='pending'`)
      .run(m.engagement,request.id,part.id);
    db.prepare(`INSERT INTO pilot_confirmation (token_hash,engagement,request,part,recipient,contact,issuer,sent,expires,state,basis)
      VALUES (?,?,?,?,?,?,?,?,?,'pending',?)`).run(digest(token),m.engagement,request.id,part.id,request.contactEmail,
      request.contact,role,at,Date.now()+86_400_000,basis?JSON.stringify(basis):null);
    recordEvent(m,request.id+' · Баталгаажуулах холбоос үүсгэв',request.form);
    return {token,request:request.id,part:part.id};
  }

  function pending(token) {
    const invite=db.prepare('SELECT * FROM pilot_confirmation WHERE token_hash=? AND state=? AND expires>?')
      .get(digest(token),'pending',Date.now());
    if (!invite) unavailable();
    let context;try{context=store.load(invite.issuer,invite.engagement);requireSeat(context.model,filesFor(invite.engagement),invite.issuer);}catch{unavailable();}const m=context.model;
    const request=m.requests.find(r=>r.id===invite.request), part=request?.parts.find(p=>p.id===invite.part);
    if (filesFor(invite.engagement).archive.isSealed(m)||activeTermsGap(m) || request?.dispatch!=='issued' ||
        request.contactEmail!==invite.recipient || request.contact!==invite.contact ||
        !part || !['missing','rejected'].includes(part.state) || !fieldworkForms(m).includes(request.form)) unavailable();
    if(invite.basis){const basis=JSON.parse(invite.basis);if(!approvedRows(m,'M07-F08').some(r=>r.id===basis.record&&r.version===basis.version)||digest(JSON.stringify(part.requirement))!==basis.requirement)unavailable();}
    return {invite,request,part,model:m};
  }

  function receive(token,data){const {request}=pending(token);return store.asPerson(request.owner,()=>receiveScoped(token,data));}
  function receiveScoped(token,data) {
    const {invite,request,part,model}=pending(token);
    const role=Object.keys(accounts).find(role=>accountFor(model,role)===request.owner);
    if (!role) unavailable();
    const context=store.load(role,invite.engagement), m=context.model, files=filesFor(invite.engagement);
    const response=input(data,'response',4000);
    if(managedEvidence(m)&&data.scopeConfirmed!=='yes')fail('Хариулж буй зүйл, байгууллага ба үеийг тодорхой батална уу.',400);
    const declared=managedEvidence(m)?{...part.requirement,receivedOn:now().slice(0,10),channel:'direct-response',supplier:invite.recipient}:{};
    requestAction(m,role,'upload',{request:request.id,part:part.id,name:data.name,base64:data.base64,
      source:'Sandbox confirmation · '+invite.recipient,...declared},files,fieldworkForms(m));
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
    return {request:request.id,part:part.title,recipient:invite.recipient,contact:invite.contact,expires:new Date(invite.expires).toISOString(),scope:part.requirement,requiresScopeConfirmation:managedEvidence(store.load(invite.issuer,invite.engagement).model)};
  },view(id) {
    return db.prepare('SELECT request,part,recipient,sent,expires,state,response,received,evidence FROM pilot_confirmation WHERE engagement=? ORDER BY sent DESC')
      .all(id).map(r=>({...r,state:r.state==='pending'&&r.expires<=Date.now()?'expired':r.state}));
  }};
}
