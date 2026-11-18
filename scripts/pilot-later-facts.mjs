import {actorKey} from './pilot-identity-context.mjs';
import { randomUUID,createHash } from 'node:crypto';
import { validDate } from '../src/lib/feature-workflows.ts';
import { recordEvent,snapshot } from '../src/lib/workspace.ts';
import {controlledArchive} from './pilot-archive-controls.mjs';
import {validateUnsealedRework,archiveWorkBasis} from './pilot-archive.mjs';
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

export const laterFactAuthorityRef=m=>{if(!controlledArchive(m))return '';const rows=all(m).filter(r=>r.original.phase&&!(r.original.issued&&r.closed&&r.plan?.outcome==='no-change')).map(r=>({id:r.id,original:r.original,source:r.source,discoveredAt:r.discoveredAt,impact:r.impact,impactReason:r.impactReason,screeningHistory:r.screeningHistory,plan:r.plan,discussions:r.communications.filter(c=>c.audience!=='users')}));return rows.length?createHash('sha256').update(JSON.stringify(rows)).digest('hex'):'';};
export function laterFactGap(m) {
  if (m.archiveReopen?.laterFact) return '';
  if(controlledArchive(m)&&all(m).some(r=>r.original.phase&&(!r.closed||r.plan?.outcome==='prevent-reliance'&&r.original.issued===m.pilotIssue?.at)))return 'Тайлангийн өдрөөс хойших бодит нөхцөл · хэлэлцүүлэг, шийдвэр ба шаардлагатай шинэ ажлыг дуусгана.';
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
    const successor=row.successor??m.pilotRecords?.find(item=>item.kind==='M12-F04'&&item.id===row.amendment)?.successor;
    return {...row,successor};
  });
}

export function laterFactAction(m,role,action,data,files) {
  if (role!=='partner') fail('Партнерын эрх шаардлагатай.',403);
  if (action==='later-fact-record') {
    if (open(m)||!controlledArchive(m)&&!files.archive.isSealed(m)) fail('Түгжсэн тайлан ба шийдэгдсэн өмнөх бүртгэл шаардлагатай.');
    let packageId,digest,bundle,phase,authorizationAt,recipients,reportDate;
    if(files.archive.isSealed(m)){packageId=input(data,'package',36);const original=files.archive.inspectCustody(m,packageId,true);({bundle,digest}=original);reportDate=bundle.authorization.package?.reportDate??m.engagements[0].reportDate;authorizationAt=bundle.authorization.at;recipients=[...new Set((bundle.deliveries??[]).filter(r=>r.state==='received').map(r=>r.recipient))];if(!bundle.issue.signature||!recipients.length)fail('Гарын үсэгтэй, хүргэлт баталгаажсан эх тайлан шаардлагатай.');if(controlledArchive(m))phase='sealed';}
    else{const signed=files.authorization(),a=signed?.authorization;if(!a?.artifact||createHash('sha256').update(a.artifact.html).digest('hex')!==a.artifact.sha256||a.at!==m.engagements[0].authorized?.at)fail('Яг хадгалсан огноотой зөвшөөрсөн тайлан шаардлагатай.');const issue=m.pilotIssue;phase=issue?'issued-unsealed':'dated-unissued';if(issue&&issue.authorizationAt!==a.at)fail('Яг гаргасан тайлангийн зөвшөөрсөн хувилбарыг сонгоно.');packageId=null;authorizationAt=a.at;reportDate=a.package.reportDate??m.engagements[0].reportDate;bundle={authorization:a,issue:issue??{at:null,reportSha256:a.artifact.sha256}};digest=createHash('sha256').update(JSON.stringify(a)).digest('hex');recipients=issue?[...new Set([...(issue.recipients??[]).map(r=>r.email),...files.deliveries().filter(r=>r.issued===issue.at).map(r=>r.recipient)])]:[];}
    const discovered=date(data,'discovered'),occurred=data.occurred?date(data,'occurred'):null;
    if(discovered<reportDate||discovered>now().slice(0,10)||occurred&&occurred>discovered)fail('Нөхцөл, илрүүлэлт, тайлангийн огноог шалгана уу.',400);
    let discoveredAt;if(controlledArchive(m)){discoveredAt=input(data,'discoveredAt',40);if(!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(discoveredAt)||!Number.isFinite(Date.parse(discoveredAt))||Date.parse(discoveredAt)>Date.now()||Date.parse(discoveredAt)<Date.parse(bundle.issue.at??authorizationAt)||new Date(discoveredAt).toISOString().slice(0,10)!==discovered)fail('Илрүүлсэн бодит агшинг эх тайлан / гаргалттай харьцуулж бүртгэнэ.',400);discoveredAt=new Date(discoveredAt).toISOString();}
    const impact=impactFor(data);
    const {name,bytes}=fileInput(data), id=randomUUID(), sourceId=randomUUID();
    const facts=input(data,'facts'), knownAtReport=input(data,'knownAtReport');
    files.add(sourceId,name,bytes);
    (m.pilotLaterFacts??=[]).push({id,by:actorKey(role),at:now(),occurred,discovered,facts,knownAtReport,...impact,
      ...(phase&&{discoveredAt}),original:{...(phase&&{phase,authorizationAt}),package:packageId,digest,issued:bundle.issue.at,reportDate,reportSha256:bundle.issue.reportSha256,
        statements:bundle.authorization.fs,recipients},
      source:{id:sourceId,name,sha256:files.get(sourceId).sha256},communications:[]});
  } else {
    const row=open(m);
    if (!row||row.id!==data.id) fail('Нээлттэй бүртгэл олдсонгүй.',404);
    if (action==='later-fact-screen') {
      if (row.plan) fail('Шийдвэр баталсны дараа анхны үнэлгээг солихгүй.');
      const next=impactFor(data);
      if (row.impact===next.impact&&row.impactReason===next.impactReason) return;
      (row.screeningHistory??=[]).push({impact:row.impact,impactReason:row.impactReason,by:actorKey(role),at:row.screenedAt??row.at});
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
      row.communications.push({id:randomUUID(),audience,state,recipient,day,by:actorKey(role),at:now(),
        reference:input(data,'reference',300),detail:input(data,'detail')});
    } else if (action==='later-fact-decide') {
      if (row.plan||!['management','governance'].every(audience=>delivered(row,audience).length)) {
        fail('Удирдлага ба засаглалын бодит хэлэлцүүлгийн бүртгэл шаардлагатай.');
      }
      const {outcome,revisedStatements}=data;
      if(!controlledArchive(m)&&outcome==='revise-before-issue')fail('Энэ шинэ цаг үеийн замд G07 тусдаа горим шаардлагатай.',400);
      if (!(row.impact==='none'&&outcome==='no-change'||row.impact==='possible'&&['reissue','revise-before-issue','prevent-reliance'].includes(outcome))||
          !['yes','no'].includes(revisedStatements)||outcome==='no-change'&&revisedStatements==='yes') {
        fail('Нөлөөллийн үнэлгээнд тохирох шийдвэрийг сонгоно уу.',400);
      }
      if(controlledArchive(m)){if(row.original.phase==='dated-unissued'&&outcome==='reissue'||row.original.phase!=='dated-unissued'&&outcome==='revise-before-issue'||row.original.phase==='dated-unissued'&&outcome==='prevent-reliance')fail('Гараагүй тайланг дахин гаргасан / хүргэсэн гэж бүртгэхгүй. Зөв цаг үеийн шийдвэрийг сонгоно.');if(data.dateMode&&data.dateMode!=='full')fail('Хос огнооны хязгаарласан горим ба мэргэжлийн тусгай баталгаа хараахан дэмжигдээгүй. Энэ шаардлага нээлттэй хэвээр.');}
      const plan={outcome,revisedStatements,procedures:input(data,'procedures'),users:input(data,'users'),
        authority:input(data,'authority'),advice:input(data,'advice'),reason:input(data,'reason'),by:actorKey(role),at:now()};
      if (['reissue','revise-before-issue'].includes(outcome)) {
        plan.paper=input(data,'paper',32);
        plan.reportDate=date(data,'reportDate');
        if (plan.reportDate<now().slice(0,10)) fail('Дахин гаргах тайлангийн огноо өнөөдрөөс эртгүй байна.');
        if(row.original.package)files.archive.validateAmendmentWork(m,row.original.package,plan.paper,plan.reportDate);else validateUnsealedRework(m,files.authorizationAt(row.original.authorizationAt)?.authorization,plan.paper,plan.reportDate);
      }
      row.plan=plan;
      if(controlledArchive(m)&&!row.original.package&&['reissue','revise-before-issue'].includes(outcome)){if(m.archiveReopen)fail('Өмнөх хяналттай өөрчлөлтийг дуусгана.');const paper=validateUnsealedRework(m,files.authorizationAt(row.original.authorizationAt)?.authorization,plan.paper,plan.reportDate);m.archiveReopen={id:row.id,type:'substantive',laterFact:row.id,previousDigest:row.original.digest,originalAuthorization:row.original.authorizationAt,target:{id:paper.id,form:paper.form,version:paper.version,basis:archiveWorkBasis(paper)},reportDate:plan.reportDate,at:now(),approvedBy:role,basis:plan.reason};snapshot(paper,m.person,'Огноотой / гараад түгжээгүй эхийн өмнөх хянасан ажил');paper.version++;paper.status='changed';delete paper.submittedVersion;delete paper.completedAt;invalidateReport(m,'Дараа илэрсэн нөхцөлийн баталсан бодит ажлын төлөвлөгөө');}
    } else if (action==='later-fact-reschedule') {
      if (!['reissue','revise-before-issue'].includes(row.plan?.outcome)||(m.pilotIssue?.at??null)!==(row.original.issued??null)) fail('Гараагүй шинэ тайлангийн огноог өөрчилнө.');
      const reportDate=date(data,'reportDate');
      if (reportDate<=row.plan.reportDate||reportDate<now().slice(0,10)) fail('Илүү хожуу тайлангийн огноо сонгоно уу.');
      (row.plan.dateHistory??=[]).push({from:row.plan.reportDate,to:reportDate,reason:input(data,'reason'),by:actorKey(role),at:now()});
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
      if (['reissue','revise-before-issue'].includes(outcome)) {
        successor=laterFactView(m).find(item=>item.id===row.id).successor;
        const receipt=m.pilotCustody?.find(item=>item.id===successor)?.accepted;
        if (!successor||!receipt) fail('Дахин гаргасан багцын бие даасан хүлээн авалт шаардлагатай.');
        const {bundle,digest}=files.archive.inspectCustody(m,successor);
        if (digest!==receipt.digest||bundle.authorization.laterFact?.id!==row.id) fail('Яг энэ дахин гаргалтын багцыг шалгана уу.');
      }
      row.closed={by:actorKey(role),at:now(),reason:input(data,'reason'),...(successor&&{successor})};
    } else fail('Үйлдэл олдсонгүй.',404);
  }
  recordEvent(m,action);
}
