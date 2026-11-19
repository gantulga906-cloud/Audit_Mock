import {randomUUID,createHash} from 'node:crypto';
import {actorKey} from './pilot-identity-context.mjs';
import {PilotError,input,fileInput} from './pilot-workflow.mjs';
import {approvedRows} from './pilot-registers.mjs';
import {checkUploadSignature} from './pilot-evidence.mjs';
const fail=(message,status=409)=>{throw new PilotError(status,message);};
export function credentialAction(m,role,action,data,files){
 if(role==='preparer')fail('A roster custodian or partner is required.',403);
 const docs=m.pilotCredentialDocuments??=[],by=actorKey(role),at=new Date().toISOString();
 if(action==='credential-document-upload'){
  const person=input(data,'person',80);if(!approvedRows(m,'M01-F03').some(p=>p.id===person))fail('Select an approved person record.');
  const {name,bytes}=fileInput(data);if(!/\.(?:pdf|png|jpe?g)$/i.test(name))fail('Use a bounded PDF, PNG or JPEG qualification document.',400);checkUploadSignature(name,bytes);
  const id=randomUUID();files.add(id,name,bytes);const saved=files.get(id);
  docs.push({id,person,name,sha256:saved.sha256,status:'received',by,at,source:input(data,'source'),reason:input(data,'reason')});m.pilotCredentialDocuments=docs;
 }else if(action==='credential-document-inspect'){
  const doc=docs.find(d=>d.id===data.id),reason=input(data,'reason');
  if(!doc||doc.status!=='received')fail('Inspect an unreviewed original document.');
  if(doc.by===by)fail('A different actual person must inspect the uploaded file.',403);
  if(!['accepted','rejected'].includes(data.result))fail('Record an explicit file-inspection result.',400);
  const original=files.read(doc.id);if(!original||original.sha256!==doc.sha256||createHash('sha256').update(original.bytes).digest('hex')!==doc.sha256)fail('The exact original is unavailable.');
  Object.assign(doc,{status:data.result,inspection:{by,at,reason}});
 }else fail('Unknown credential document action.',404);
}
export function checkCredentialRecord(m,row,files){
 const v=row.values,state=v.verificationState;
 if(['file-reviewed','externally-verified'].includes(state)){
  const doc=files.credentialDocument?.(v.credentialDocument);
  if(!doc||doc.person!==v.person||doc.status!=='accepted')fail('Select an independently inspected qualification document for this exact person.');
  const original=files.credentialOriginal?.(doc.id);if(!original||createHash('sha256').update(original.bytes).digest('hex')!==doc.sha256)fail('The pinned credential original is unavailable or changed.');
  row.credentialBasis={id:doc.id,sha256:doc.sha256,inspection:doc.inspection,person:doc.person};
 }
 if(state==='externally-verified'&&(!v.verificationSource||!v.verifiedOn||!v.evaluator))fail('External verification needs the actual issuer/source reference, evaluator and date. Uploaded files alone are not issuer verification.');
 if(v.verifiedOn&&v.verifiedOn>new Date().toISOString().slice(0,10))fail('A future verification date is not an observed check.');
 if(v.authorityStatus==='current'&&(!v.practiceScope||!v.verificationSource))fail('Current practice authority needs its explicit scope and supporting source.');
}
