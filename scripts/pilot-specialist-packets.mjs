import {randomUUID,createHash} from 'node:crypto';
import {zipSync,strToU8} from 'fflate';
import {actorKey} from './pilot-identity-context.mjs';
import {PilotError,input} from './pilot-workflow.mjs';
import {approvedRows} from './pilot-registers.mjs';
import {requireSeat} from './pilot-staffing.mjs';
import {evidenceCurrent} from './pilot-requests.mjs';
import {contractDigest} from './pilot-method-contracts.mjs';
import {validDate} from '../src/lib/feature-workflows.ts';
const fail=(message,status=409)=>{throw new PilotError(status,message);};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const packets=m=>m.pilotSpecialistPackets??=[];
const stamp=value=>{if(typeof value!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d)?(?:Z|[+-]\d\d:\d\d)$/.test(value)||!validDate(value.slice(0,10))||!Number.isFinite(Date.parse(value)))fail('Use an explicit real timestamp with its UTC offset.',400);return Date.parse(value);};
function authority(m,role,files){if(role==='preparer')fail('A currently appointed senior or partner must share specialist material.',403);if(!m.engagements[0]?.intake.active||files.archive.isSealed(m))fail('An open active engagement is required.');requireSeat(m,files,role);}
function original(m,id,files,accepted=true){
 const evidence=m.evidence.find(e=>e.id===id&&e.engagement===m.engagement&&!e.archiveOnly),file=evidence&&files.read(id);
 if(!evidence||accepted&&!evidenceCurrent(m,evidence)||!file||hash(file.bytes)!==file.sha256)fail('Select an exact available original in this engagement with the required evidence state.');
 return {id,version:evidence.version,sha256:file.sha256,name:evidence.name,bytes:file.bytes};
}
const reference=({bytes,...ref})=>ref;
const packetDigest=p=>contractDigest({engagement:p.engagement,version:p.version,contribution:p.contribution,recipient:p.recipient,purpose:p.purpose,scope:p.scope,manifest:p.manifest,agreement:p.agreement,disclosure:p.disclosure,notBefore:p.notBefore,expiresAt:p.expiresAt});
function requireCurrent(m,packet,files,validity=true){
 if(packetDigest(packet)!==packet.digest)fail('The frozen packet metadata changed. Prepare a new version.');
 if(packet.revoked||!['authorized','dispatched','received','unknown','failed'].includes(packet.status))fail('This packet is not currently authorized for outbound access.');
 if(validity&&(Date.now()<stamp(packet.notBefore)||Date.now()>=stamp(packet.expiresAt)))fail('This outbound packet is not within its authorized validity interval.');
 const contribution=approvedRows(m,'M06-F05').find(r=>r.id===packet.contribution.id&&r.version===packet.contribution.version);
 if(!contribution)fail('The specialist contribution scope changed. Prepare a new packet version.');
 if(!approvedRows(m,'M01-F03').some(r=>r.id===packet.recipient.person&&r.version===packet.recipient.personVersion&&r.values.status==='external'))fail('The intended external recipient changed. Prepare a newly authorized packet.');
 for(const ref of [...packet.manifest,packet.agreement,packet.disclosure]){const actual=original(m,ref.id,files);if(actual.version!==ref.version||actual.sha256!==ref.sha256)fail('A packet source changed. Prepare a new frozen version.');}
}
export function specialistPacketAction(m,role,action,data,files){
 authority(m,role,files);const all=packets(m),by=actorKey(role),at=new Date().toISOString(),reason=input(data,'reason');
 if(action==='specialist-packet-create'){
  const contribution=approvedRows(m,'M06-F05').find(r=>r.id===data.contribution&&['auditor-expert','management-expert','internal-function','direct-assistance','component'].includes(r.values.type));
  if(!contribution||!contribution.values.suitability||!contribution.values.partyName)fail('Approve the category-specific contributor scope and suitability record first.');
  const recipient=approvedRows(m,'M01-F03').find(r=>r.id===data.recipientPerson&&r.values.status==='external');if(!recipient)fail('Select the actual external recipient person record; sharing does not create a team login.');
  const selected=(()=>{try{return JSON.parse(input(data,'selection',20000));}catch{fail('Select an explicit frozen file list.',400);}})();
  if(!Array.isArray(selected)||!selected.length||selected.length>50||selected.some(x=>!x||typeof x.id!=='string'||!Number.isInteger(x.version)||x.version<1)||new Set(selected.map(x=>x.id)).size!==selected.length)fail('Choose 1-50 distinct exact file versions.',400);
  const manifest=selected.map(ref=>{const actual=original(m,ref.id,files);if(String(ref.version)!==String(actual.version))fail('A selected source version changed.');return reference(actual);});
  const size=manifest.reduce((n,r)=>n+files.read(r.id).bytes.length,0);if(size>25_000_000)fail('The bounded manual packet supports at most 25 MB of selected originals.',400);
  const notBefore=input(data,'notBefore',40),expiresAt=input(data,'expiresAt',40);if(stamp(notBefore)>=stamp(expiresAt))fail('The outbound end must follow its start.');
  const prior=data.previous&&all.find(p=>p.id===data.previous);if(data.previous&&!prior)fail('Prior packet is outside this engagement.');
  const packet={id:randomUUID(),version:(prior?.version??0)+1,...(prior&&{previous:prior.id}),status:'prepared',engagement:m.engagement,
   contribution:{id:contribution.id,version:contribution.version,category:contribution.values.type},recipient:{person:recipient.id,personVersion:recipient.version,name:recipient.values.name,organization:input(data,'recipientOrganization',300),contact:input(data,'recipientContact',300)},
   purpose:input(data,'purpose'),scope:input(data,'scope'),manifest,agreement:reference(original(m,input(data,'agreement',80),files)),disclosure:reference(original(m,input(data,'disclosure',80),files)),
   notBefore,expiresAt,preparedBy:by,preparedAt:at,reason,events:[],attempts:[],returns:[]};
  packet.digest=packetDigest(packet);all.push(packet);return;
 }
 const packet=all.find(p=>p.id===data.id);if(!packet)fail('Specialist packet not found.',404);
 if(data.digest!==packet.digest)fail('Act on the exact frozen packet digest.');
 if(action==='specialist-packet-authorize'){
  if(packet.status!=='prepared'||packet.revoked)fail('Authorize a prepared packet.');
  if(stamp(packet.expiresAt)<=Date.now())fail('An expired outbound packet cannot be newly authorized.');
  // Check current source versions before granting outbound access; no second admin approval.
  const probe={...packet,status:'authorized'};requireCurrent(m,probe,files,false);
  packet.authorization={by,at,reason,recipientCheck:input(data,'recipientCheck'),confidentiality:input(data,'confidentiality')};packet.status='authorized';
 }else if(action==='specialist-packet-dispatch'){
  requireCurrent(m,packet,files);if(!['authorized','failed'].includes(packet.status))fail('Reconcile a prior unknown/successful send before recording another dispatch.');
  const evidence=reference(original(m,input(data,'evidence',80),files)),sent=input(data,'sentAt',40);if(stamp(sent)>Date.now()||stamp(sent)<stamp(packet.notBefore)||stamp(sent)>=stamp(packet.expiresAt))fail('Record an actual in-window dispatch time, never a future send.');
  const result=input(data,'result',20);if(!['dispatched','failed','unknown'].includes(result))fail('Record the observed manual dispatch outcome.',400);
  packet.attempts.push({number:packet.attempts.length+1,by,at,sentAt:sent,channel:input(data,'channel',300),approvedChannelBasis:input(data,'approvedChannelBasis'),evidence,result,reason,automaticDelivery:false});packet.status=result;
 }else if(action==='specialist-packet-reconcile'){
  if(packet.status!=='unknown')fail('Only an unknown send needs this reconciliation.');
  const result=input(data,'result',20);if(!['dispatched','failed'].includes(result))fail('Record observed successful dispatch or definite failure.',400);
  packet.attempts.at(-1).reconciliation={by,at,result,evidence:reference(original(m,input(data,'evidence',80),files)),reason};packet.status=result;
 }else if(action==='specialist-packet-receipt'){
  if(packet.revoked||packet.status!=='dispatched')fail('Record receipt against an actual dispatched packet.');
  const receivedAt=input(data,'receivedAt',40);if(stamp(receivedAt)>Date.now()||stamp(receivedAt)<stamp(packet.attempts.at(-1).sentAt))fail('Receipt time must follow actual dispatch and cannot be future.');
  packet.receipt={by,at,receivedAt,recipientConfirmation:input(data,'recipientConfirmation'),evidence:reference(original(m,input(data,'evidence',80),files)),reason};packet.status='received';
 }else if(action==='specialist-packet-return'){
  // Internal manual receipt remains possible after outbound expiry/revocation.
  const ref=original(m,input(data,'evidence',80),files,false),receivedAt=input(data,'receivedAt',40);
  if(packet.manifest.some(f=>f.id===ref.id)||m.evidence.find(e=>e.id===ref.id).status!=='received')fail('Upload a new unaccepted specialist return; an outbound original is not a returned opinion.');
  if(stamp(receivedAt)>Date.now()||stamp(receivedAt)<stamp(packet.preparedAt.slice(0,19)+'Z'))fail('Record an actual return received after this packet was prepared.');
  packet.returns.push({id:randomUUID(),evidence:reference(ref),actualSender:input(data,'actualSender',300),channel:input(data,'channel',300),receivedAt,recordedBy:by,recordedAt:at,reason,evidenceAcceptance:'pending',adequacyEvaluation:'pending'});
 }else if(action==='specialist-packet-revoke'){
  if(packet.revoked)return false;packet.revoked={by,at,reason,providerAction:input(data,'providerAction')};
 }else fail('Unknown specialist packet action.',404);
 packet.events.push({action,by,at,reason});
}
export function specialistPacketExport(m,role,data,files){
 authority(m,role,files);const p=packets(m).find(x=>x.id===data.id);if(!p)fail('Specialist packet not found.',404);if(p.digest!==data.digest)fail('Inspect the exact current packet before export.');requireCurrent(m,p,files);
 const archive={},manifest=p.manifest.map((ref,index)=>{const {bytes}=original(m,ref.id,files);const file=String(index+1).padStart(2,'0')+'_'+ref.name.replace(/[^\p{L}\p{N}._-]/gu,'_');archive['documents/'+file]=new Uint8Array(bytes);return {file:'documents/'+file,sha256:ref.sha256,sourceId:ref.id,version:ref.version};});
 archive['manifest.json']=strToU8(JSON.stringify({kind:'audit-specialist-manual-packet-v1',packetId:p.id,version:p.version,digest:p.digest,recipient:p.recipient,purpose:p.purpose,scope:p.scope,notBefore:p.notBefore,expiresAt:p.expiresAt,files:manifest,boundary:'Exact selected copies only. No message was sent. Use an approved recipient-restricted or encrypted channel; already delivered bytes cannot be recalled.'},null,2));
 const bytes=Buffer.from(zipSync(archive)),sha256=hash(bytes);files.logSpecialistExport({packet:p.id,version:p.version,digest:p.digest,by:actorKey(role),at:new Date().toISOString(),sha256,reason:input(data,'reason')});return {bytes,sha256};
}
export const specialistPacketView=(m,role)=>role==='preparer'?undefined:packets(m).map(p=>({...p,returns:p.returns.map(r=>{const file=m.evidence.find(e=>e.id===r.evidence.id),evaluation=approvedRows(m,'M06-F05').find(x=>x.id===p.contribution.id&&x.values.evidence===r.evidence.id);return {...r,evidenceAcceptance:file?.status??'unavailable',adequacyEvaluation:evaluation?'evaluated-'+evaluation.values.result:'pending',...(evaluation&&{evaluationBasis:{id:evaluation.id,version:evaluation.version,by:evaluation.by,at:evaluation.at}})};}),outboundExpired:Date.now()>=stamp(p.expiresAt),portalAvailable:false,automaticDelivery:false}));
