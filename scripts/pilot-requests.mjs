import { randomUUID } from 'node:crypto';
import { createRequest, updateRequest } from '../src/lib/feature-workflows.ts';
import { recordEvent, recordRequestPart, snapshot, workKey } from '../src/lib/workspace.ts';
import { accounts, fileInput, input, PilotError } from './pilot-workflow.mjs';
import { requireSeat } from './pilot-staffing.mjs';
import { populationOptionalFields, populationRequiredFields } from '../src/lib/pilot-population.ts';
import {managedEvidence} from './pilot-data-methods.mjs';
import {approvedRows,programmeDecision} from './pilot-registers.mjs';
import {partRequirements,receiptMetadata,validPartAcceptance,evidenceRequestAction,syncRequestCoverage,checkUploadSignature,scopeMatches} from './pilot-evidence.mjs';

const fail = (message,status=409) => { throw new PilotError(status,message); };
const now = () => new Date().toISOString();
const creation = ['request','request-draft'];
const transitions = ['request-issue','request-cancel','request-followup'];
const extended=['request-scope','request-link','request-alternative','request-alternative-approve','request-alternative-return'];
export const isRequestAction = action => [...creation,...transitions,...extended,'request-reopen','upload','accept','reject'].includes(action);

export function evidenceCurrent(m, evidence) {
  if (evidence?.archiveOnly||evidence?.status!=='accepted') return false;
  if (!evidence.request) return true;
  const request=m.requests.find(r=>r.id===evidence.request);
  return !!request && request.dispatch!=='cancelled' &&
    !!request.parts?.some(part=>part.evidence===evidence.id&&part.state==='accepted'&&(!part.requirement||scopeMatches(evidence.scope,part.requirement)));
}

function extractSpec(m, data, parts) {
  if (!data.extractSystem && !data.extractFields) return undefined;
  if (parts.length!==1) fail('Эх олонлогийн хүсэлтэд нэг CSV файл сонгоно уу.',400);
  const system=input(data,'extractSystem',200);
  const fields=input(data,'extractFields',200).split(',').map(key=>key.trim().toLowerCase());
  if (new Set(fields).size!==fields.length || populationRequiredFields.some(key=>!fields.includes(key)) ||
      fields.some(key=>![...populationRequiredFields,...populationOptionalFields].includes(key))) {
    fail('Эх CSV файлын зайлшгүй баганууд болон зөвшөөрсөн нэмэлт багануудыг сонгоно уу.',400);
  }
  const {start,end}=m.bench.periods[m.engagement];
  return {system,start,end,fields};
}

function reopen(m, request, part, reason) {
  if (request.dispatch!=='issued'||part.state!=='accepted'||!part.evidence) fail('Хүлээн авсан хүсэлтийн хэсгийг сонгоно уу.');
  const at=now(), evidence=m.evidence.find(e=>e.id===part.evidence);
  (part.uses??=[]).push({evidence:part.evidence,state:'reopened',reason,at,by:m.person});
  part.state='rejected';
  part.reason=reason;
  request.status='changes_requested';
  request.history.push(at+' · '+part.title+' · '+reason);
  const active=evidenceCurrent(m,evidence);
  for (const paper of Object.values(m.work)) {
    const owning=paper.form===request.form, linked=!active&&paper.evidence.includes(part.evidence);
    if (!owning&&!linked) continue;
    snapshot(paper,m.person,'Эх баримтын өмнөх хэрэглээг хадгалав');
    paper.version++;
    if (linked) paper.evidence=paper.evidence.filter(id=>id!==part.evidence);
    paper.status='changed';
    paper.submittedVersion=undefined;
    paper.completedAt=undefined;
  }
  recordEvent(m,request.id+' · '+part.title+' · Дахин хүсэв',request.form);
}

export function requestAction(m,role,action,data,files,forms,defaultForm) {
  requireSeat(m,files,role);
  if (creation.includes(action)) {
    const title=input(data,'title',200), form=data.form||defaultForm;
    if (!forms.includes(form)) fail('Хэрэгжүүлсэн хөтөлбөр сонгоно уу.');
    const owner=m.work[workKey(m.engagement,form)].owner;
    requireSeat(m,files,Object.keys(accounts).find(role=>accounts[role]===owner));
    const parts=data.parts ? input(data,'parts',5000).split(/\r?\n/).map(p=>p.trim()).filter(Boolean) : [title];
    if (parts.length>25||parts.some(p=>p.length>200)) fail('25 хүртэл ялгаатай хэсэг оруулна уу.',400);
    const contacts=m.bench.clients[m.engagement].contacts;
    const contactId=data.contactId||contacts[0]?.id;
    const extract=extractSpec(m,data,parts);
    const requirements=partRequirements(m,data,parts);
    createRequest(m,{title,form,contactId,owner,due:managedEvidence(m)?(data.due??''):input(data,'due',10),unagreedDue:managedEvidence(m),
      message:data.message?input(data,'message'): '',parts});
    if(requirements)m.requests[0].parts.forEach((part,i)=>{part.requirement=requirements[i];});
    if(data.confirmationCase){
      const record=approvedRows(m,'M07-F08').find(r=>r.id===data.confirmationCase&&r.values.programme===programmeDecision(m,form)?.id);
      if(!record||record.values.result!=='pending'||record.values.dispatch!=='prepared')fail('Энэ хөтөлбөрийн хараат бусаар хянасан бодит баталгаажуулалтын бэлтгэлийг сонгоно уу.');
      Object.assign(m.requests[0],{confirmationCase:record.id,contact:record.values.recipient,contactEmail:record.values.address});
    }
    if (extract) m.requests[0].extract=extract;
    if (action==='request') updateRequest(m,m.requests[0].id,'issue');
    return action==='request';
  }
  const request=m.requests.find(r=>r.id===data?.request);
  if (!request) fail('Хүсэлт олдсонгүй.',404);
  if (!forms.includes(request.form)) fail('Хамаарахгүй эсвэл шинэ хяналт хүлээж буй хөтөлбөрийн хүсэлт.');
  if(extended.includes(action)){
    if(request.dispatch!=='issued')fail('Зөвхөн гаргасан хүсэлтэд хэрэглээ үнэлнэ үү.');
    evidenceRequestAction(m,role,action,data,files,request,request.parts.find(p=>p.id===data.part));return true;
  }
  if (transitions.includes(action)) {
    const operation=action.slice('request-'.length);
    const priorUses=request.parts.some(part=>part.state==='accepted');
    updateRequest(m,request.id,operation,operation==='issue'?'':input(data,'reason'));
    return operation==='issue'||operation==='cancel'&&priorUses;
  }
  if (request.owner!==m.person && !(action==='request-reopen'&&role!=='preparer')) fail('Хүсэлтийн эзэн шаардлагатай.',403);
  if (action==='upload') {
    const selected=data.parts?input(data,'parts',1200).split(','):[data.part||request.parts[0].id];
    const parts=selected.map(id=>request.parts.find(p=>p.id===id));
    if (!parts.length||new Set(selected).size!==selected.length||parts.some(p=>!p||!['missing','rejected'].includes(p.state))) {
      fail('Хүлээгдэж буй хүсэлтийн хэсгийг сонгоно уу.');
    }
    const {name,bytes}=fileInput(data), id=randomUUID(), source=input(data,'source',200);
    const receipt=managedEvidence(m)?receiptMetadata(data):{};if(managedEvidence(m))checkUploadSignature(name,bytes);
    const prior=parts.map(p=>m.evidence.find(e=>e.id===p.evidence)).filter(Boolean);
    m.evidence.push({id,name,engagement:m.engagement,version:1+Math.max(0,...prior.map(e=>e.version)),
      type:'FILE',obtained:now().slice(0,10),source,status:'received',specimen:false,request:request.id,
      anchor:'',text:'',original:true,uploadedBy:role,...(request.extract&&{channel:'auditor-upload',population:true}),...receipt});
    for (const part of parts) recordRequestPart(m,request.id,part.id,'receive',id,true);
    files.add(id,name,bytes);
    return false;
  }
  const part=data.part?request.parts.find(p=>p.id===data.part):request.parts[0];
  if (!part) fail('Хүсэлтийн хэсэг олдсонгүй.',404);
  if (action==='request-reopen') reopen(m,request,part,input(data,'reason'));
  else{
    if(action==='accept')validPartAcceptance(m,request,part);
    const file=m.evidence.find(e=>e.id===part.evidence),independent=file?.standaloneAssessment;
    recordRequestPart(m,request.id,part.id,action,action==='reject'?input(data,'reason'):'');
    if(independent)file.status=independent.result;
  }
  syncRequestCoverage(m,request);
  return action==='request-reopen';
}
