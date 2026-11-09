import { randomUUID } from 'node:crypto';
import { createRequest, updateRequest } from '../src/lib/feature-workflows.ts';
import { recordEvent, recordRequestPart, snapshot, workKey } from '../src/lib/workspace.ts';
import { accounts, fileInput, input, PilotError } from './pilot-workflow.mjs';
import { requireSeat } from './pilot-staffing.mjs';

const fail = (message,status=409) => { throw new PilotError(status,message); };
const now = () => new Date().toISOString();
const creation = ['request','request-draft'];
const transitions = ['request-issue','request-cancel','request-followup'];
export const isRequestAction = action => [...creation,...transitions,'request-reopen','upload','accept','reject'].includes(action);

export function evidenceCurrent(m, evidence) {
  if (evidence?.status!=='accepted') return false;
  if (!evidence.request) return true;
  const request=m.requests.find(r=>r.id===evidence.request);
  return !!request && request.dispatch!=='cancelled' &&
    !!request.parts?.some(part=>part.evidence===evidence.id&&part.state==='accepted');
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
    createRequest(m,{title,form,contactId,owner,due:input(data,'due',10),
      message:data.message?input(data,'message'): '',parts});
    if (action==='request') updateRequest(m,m.requests[0].id,'issue');
    return action==='request';
  }
  const request=m.requests.find(r=>r.id===data?.request);
  if (!request) fail('Хүсэлт олдсонгүй.',404);
  if (!forms.includes(request.form)) fail('Хамаарахгүй эсвэл шинэ хяналт хүлээж буй хөтөлбөрийн хүсэлт.');
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
    const prior=parts.map(p=>m.evidence.find(e=>e.id===p.evidence)).filter(Boolean);
    m.evidence.push({id,name,engagement:m.engagement,version:1+Math.max(0,...prior.map(e=>e.version)),
      type:'FILE',obtained:now().slice(0,10),source,status:'received',specimen:false,request:request.id,
      anchor:'',text:'',original:true,uploadedBy:role});
    for (const part of parts) recordRequestPart(m,request.id,part.id,'receive',id,true);
    files.add(id,name,bytes);
    return false;
  }
  const part=data.part?request.parts.find(p=>p.id===data.part):request.parts[0];
  if (!part) fail('Хүсэлтийн хэсэг олдсонгүй.',404);
  if (action==='request-reopen') reopen(m,request,part,input(data,'reason'));
  else recordRequestPart(m,request.id,part.id,action,action==='reject'?input(data,'reason'):'');
  return action==='request-reopen';
}
