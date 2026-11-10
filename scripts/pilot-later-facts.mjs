import { randomUUID } from 'node:crypto';
import { validDate } from '../src/lib/feature-workflows.ts';
import { recordEvent } from '../src/lib/workspace.ts';
import { fileInput, input, invalidateReport, PilotError } from './pilot-workflow.mjs';

const fail=(message,status=409)=>{throw new PilotError(status,message);};
const now=()=>new Date().toISOString();
const all=m=>m.pilotLaterFacts??[];
const open=m=>all(m).find(row=>!row.closed);
const delivered=(row,audience)=>row.communications.filter(entry=>entry.audience===audience&&entry.state==='delivered');
const impactFor=data=>{
  if (!['possible','none'].includes(data.impact)) fail('Анхны тайланд нөлөөлөх эсэхийг үнэлнэ үү.',400);
  return {impact:data.impact,impactReason:input(data,'impactReason')};
};
const date=(data,key)=> {
  const value=input(data,key,10);
  if (!validDate(value)) fail('Огноог шалгана уу · '+key,400);
  return value;
};

export function laterFactGap(m) {
  if (m.archiveReopen?.laterFact) return '';
  const issued=m.pilotIssue?.at;
  return all(m).some(row=>row.original.issued===issued&&row.impact==='possible'&&
    (!row.closed||row.plan?.outcome==='prevent-reliance'))
    ?'Гаргалтын дараах нөхцөл · Хуучин тайланд найдах асуудлыг шийдвэрлэнэ үү.':'';
}

export function checkLaterFactArchive(m, row) {
  const fact=open(m), values=row.values;
  if (!fact) return undefined;
  if (values.type!=='substantive'||fact.plan?.outcome!=='reissue'||values.package!==fact.original.package||
      values.paper!==fact.plan.paper||values.reportDate!==fact.plan.reportDate) {
    fail('Дараа илэрсэн нөхцөлийн баталсан дахин гаргалт, ажил, огноог ашиглана уу.');
  }
  return fact;
}

export const laterFactForRelease=m=>all(m).find(row=>row.id===m.archiveReopen?.laterFact);
export const laterFactFiles=m=>all(m).map(row=>row.source.id);
export function laterFactView(m) {
  return all(m).map(row=>{
    const successor=m.pilotRecords?.find(item=>item.kind==='M12-F04'&&item.id===row.amendment)?.successor;
    return {...row,successor};
  });
}

export function laterFactAction(m,role,action,data,files) {
  if (role!=='partner') fail('Партнерын эрх шаардлагатай.',403);
  if (action==='later-fact-record') {
    if (open(m)||!files.archive.isSealed(m)) fail('Түгжсэн тайлан ба шийдэгдсэн өмнөх бүртгэл шаардлагатай.');
    const packageId=input(data,'package',36), original=files.archive.inspectCustody(m,packageId,true);
    const {bundle,digest}=original, reportDate=bundle.authorization.package?.reportDate??m.engagements[0].reportDate;
    const recipients=[...new Set((bundle.deliveries??[]).filter(row=>row.state==='received').map(row=>row.recipient))];
    if (!bundle.issue.signature||!recipients.length) fail('Гарын үсэгтэй, хүргэлт баталгаажсан эх тайлан шаардлагатай.');
    const discovered=date(data,'discovered'), occurred=data.occurred?date(data,'occurred'):null;
    if (discovered<reportDate||discovered>now().slice(0,10)||occurred&&occurred>discovered) fail('Нөхцөл, илрүүлэлт, тайлангийн огноог шалгана уу.',400);
    const impact=impactFor(data);
    const {name,bytes}=fileInput(data), id=randomUUID(), sourceId=randomUUID();
    const facts=input(data,'facts'), knownAtReport=input(data,'knownAtReport');
    files.add(sourceId,name,bytes);
    (m.pilotLaterFacts??=[]).push({id,by:role,at:now(),occurred,discovered,facts,knownAtReport,...impact,
      original:{package:packageId,digest,issued:bundle.issue.at,reportDate,reportSha256:bundle.issue.reportSha256,
        statements:bundle.authorization.fs,recipients},
      source:{id:sourceId,name,sha256:files.get(sourceId).sha256},communications:[]});
  } else {
    const row=open(m);
    if (!row||row.id!==data.id) fail('Нээлттэй бүртгэл олдсонгүй.',404);
    if (action==='later-fact-screen') {
      if (row.plan) fail('Шийдвэр баталсны дараа анхны үнэлгээг солихгүй.');
      const next=impactFor(data);
      if (row.impact===next.impact&&row.impactReason===next.impactReason) return;
      (row.screeningHistory??=[]).push({impact:row.impact,impactReason:row.impactReason,by:role,at:row.screenedAt??row.at});
      Object.assign(row,next,{screenedAt:now()});
    } else if (action==='later-fact-communicate') {
      const {audience,state}=data;
      if (!['management','governance','users'].includes(audience)||!['pending','failed','delivered'].includes(state)) {
        fail('Хүлээн авагч ба хүргэлтийн төлөвийг сонгоно уу.',400);
      }
      if (row.plan&&(row.plan.outcome!=='prevent-reliance'||audience!=='users')) fail('Баталсан шийдвэрийн өмнөх хэлэлцүүлгийг өөрчлөхгүй.');
      const recipient=input(data,'recipient',200), day=date(data,'day');
      if (day<row.discovered||day>now().slice(0,10)||
          audience==='users'&&(!row.original.recipients.includes(recipient)||row.plan?.outcome!=='prevent-reliance')) {
        fail('Одоогийн огноо ба өмнөх тайлангийн хүлээн авагчийг шалгана уу.');
      }
      row.communications.push({id:randomUUID(),audience,state,recipient,day,by:role,at:now(),
        reference:input(data,'reference',300),detail:input(data,'detail')});
    } else if (action==='later-fact-decide') {
      if (row.plan||!['management','governance'].every(audience=>delivered(row,audience).length)) {
        fail('Удирдлага ба засаглалын бодит хэлэлцүүлгийн бүртгэл шаардлагатай.');
      }
      const {outcome,revisedStatements}=data;
      if (!(row.impact==='none'&&outcome==='no-change'||row.impact==='possible'&&['reissue','prevent-reliance'].includes(outcome))||
          !['yes','no'].includes(revisedStatements)||outcome==='no-change'&&revisedStatements==='yes') {
        fail('Нөлөөллийн үнэлгээнд тохирох шийдвэрийг сонгоно уу.',400);
      }
      const plan={outcome,revisedStatements,procedures:input(data,'procedures'),users:input(data,'users'),
        authority:input(data,'authority'),advice:input(data,'advice'),reason:input(data,'reason'),by:role,at:now()};
      if (outcome==='reissue') {
        plan.paper=input(data,'paper',32);
        plan.reportDate=date(data,'reportDate');
        if (plan.reportDate<now().slice(0,10)) fail('Дахин гаргах тайлангийн огноо өнөөдрөөс эртгүй байна.');
        files.archive.validateAmendmentWork(m,row.original.package,plan.paper,plan.reportDate);
      }
      row.plan=plan;
    } else if (action==='later-fact-reschedule') {
      if (row.plan?.outcome!=='reissue'||m.pilotIssue?.at!==row.original.issued) fail('Гараагүй шинэ тайлангийн огноог өөрчилнө.');
      const reportDate=date(data,'reportDate');
      if (reportDate<=row.plan.reportDate||reportDate<now().slice(0,10)) fail('Илүү хожуу тайлангийн огноо сонгоно уу.');
      (row.plan.dateHistory??=[]).push({from:row.plan.reportDate,to:reportDate,reason:input(data,'reason'),by:role,at:now()});
      row.plan.reportDate=reportDate;
      if (m.archiveReopen?.laterFact===row.id) {
        m.archiveReopen.reportDate=reportDate;
        invalidateReport(m,'Дахин гаргах тайлангийн баталсан огноо өөрчлөгдөв');
      }
    } else if (action==='later-fact-close') {
      if (!row.plan) fail('Партнерын шийдвэр шаардлагатай.');
      const {outcome}=row.plan;
      let successor;
      if (outcome==='prevent-reliance'&&!row.original.recipients.every(recipient=>delivered(row,'users').some(entry=>entry.recipient===recipient))) {
        fail('Өмнөх тайлангийн бүх баталгаажсан хүлээн авагчид хүргэсэн бүртгэл шаардлагатай.');
      }
      if (outcome==='reissue') {
        successor=laterFactView(m).find(item=>item.id===row.id).successor;
        const receipt=m.pilotCustody?.find(item=>item.id===successor)?.accepted;
        if (!successor||!receipt) fail('Дахин гаргасан багцын бие даасан хүлээн авалт шаардлагатай.');
        const {bundle,digest}=files.archive.inspectCustody(m,successor);
        if (digest!==receipt.digest||bundle.authorization.laterFact?.id!==row.id) fail('Яг энэ дахин гаргалтын багцыг шалгана уу.');
      }
      row.closed={by:role,at:now(),reason:input(data,'reason'),...(successor&&{successor})};
    } else fail('Үйлдэл олдсонгүй.',404);
  }
  recordEvent(m,action);
}
