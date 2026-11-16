import {createHash} from 'node:crypto';
import {validDate} from '../src/lib/feature-workflows.ts';
import {isCurrentReview} from '../src/lib/workspace.ts';
import {evidenceCurrent} from './pilot-requests.mjs';

const hash=value=>createHash('sha256').update(value).digest('hex');
export const assemblyRows=m=>(m.pilotRecords??[]).filter(r=>r.kind==='M12-F02');
export const assemblyRecord=m=>assemblyRows(m).at(-1);

export function assemblyInventory(m,signed,readEvidence){
 const issue=m.pilotIssue,authorization=signed?.authorization,pack=authorization?.package,artifact=authorization?.artifact;
 const gaps=[],items=[],references=[],history={papers:[],records:[]},seen=new Map(),historicPapers=new Set();
 const add=item=>{const key=item.kind+':'+item.id;const previous=seen.get(key);if(previous&&JSON.stringify(previous)!==JSON.stringify(item))gaps.push(item.label+' · Индексийн хувилбар зөрүүтэй');if(!previous){seen.set(key,item);items.push(item);}};
 if(!issue||!pack||!artifact)return {items,references,history,gaps:['Тайлангийн яг зөвшөөрсөн багцыг эхлээд гаргана уу.']};
 if(issue.authorizationAt!==authorization.at||issue.reportSha256!==artifact.sha256||hash(artifact.html)!==artifact.sha256)gaps.push('Гаргалт, зөвшөөрөл ба тайлангийн эх зөрүүтэй');
 if(pack.statements.version!==m.engagements[0].fsVersion||!pack.statements.statements||!pack.statements.notes)gaps.push('Эцсийн СТ ба тодруулгын одоогийн хувилбар шаардлагатай');
 add({kind:'report',id:artifact.form,label:'Гаргасан аудиторын тайлан',version:pack.paper.version,sha256:artifact.sha256});
 add({kind:'statements',id:'statements',label:'Эцсийн СТ ба тодруулга',version:pack.statements.version,sha256:hash(JSON.stringify(pack.statements))});
 const papers=[pack.paper,...(pack.reliedOn??[]),...(authorization.programmePapers??[]),...(authorization.nativePapers??[]),...(authorization.technicalPapers??[])];
 for(const paper of papers){
  const current=m.work[paper.id],required=current?.required&&!current.naReason||paper.id===pack.paper.id;
  if(current&&!historicPapers.has(paper.id)){history.papers.push({id:paper.id,history:structuredClone(current.history??[])});historicPapers.add(paper.id);}
  add({kind:'paper',id:paper.id,label:current?.title??paper.id,version:paper.version});
  if(!current||current.version!==paper.version||required&&(!isCurrentReview(current)||paper.reviewedVersion!==paper.version))gaps.push((current?.form??paper.id)+' · Эцсийн ажлын одоогийн хяналт дутуу');
  if(paper.evidence.some(id=>!signed.evidence.some(e=>e.id===id)))gaps.push((current?.form??paper.id)+' · Эх файлын холбоос тасарсан');
 }
 for(const {form,notes} of authorization.reviewNotes??[])if(notes.some(n=>!n.cleared))gaps.push(form+' · Нээлттэй хяналтын тэмдэглэл');
 const pending=[...(authorization.registers??[])],visited=new Set();
 while(pending.length){
  const record=pending.shift();if(visited.has(record.id))continue;visited.add(record.id);
  const live=(m.pilotRecords??[]).find(r=>r.id===record.id);
  history.records.push({id:record.id,history:structuredClone(live?.history??[])});
  add({kind:'record',id:record.id,label:record.kind,version:record.version});
  for(const [id,version] of Object.entries(record.references??{})){
   const target=(m.pilotRecords??[]).find(r=>r.id===id);
   if(!target||target.status!=='approved'||target.version!==version){gaps.push(record.kind+' · Бүртгэлийн холбоосын хувилбар зөрсөн');continue;}
   if(!visited.has(id)){const {history,...snapshot}=target;references.push(structuredClone(snapshot));pending.push(target);}
  }
 }
 for(const file of signed.evidence){
  add({kind:'evidence',id:file.id,label:file.name,version:file.version,sha256:file.sha256});
  const stored=readEvidence(file.id);
  if(!stored?.bytes?.length||hash(stored.bytes)!==file.sha256)gaps.push(file.name+' · Эх файл байхгүй эсвэл бүрэн байдал зөрсөн');
 }
 items.sort((a,b)=>(a.kind+':'+a.id).localeCompare(b.kind+':'+b.id));
 references.sort((a,b)=>a.id.localeCompare(b.id));
 history.papers.sort((a,b)=>a.id.localeCompare(b.id));history.records.sort((a,b)=>a.id.localeCompare(b.id));
 return {issueAt:issue.at,authorizationAt:authorization.at,reportSha256:artifact.sha256,items,references,history,gaps:[...new Set(gaps)],
  inventoryDigest:hash(JSON.stringify({issueAt:issue.at,authorizationAt:authorization.at,items,references,history}))};
}

export function assemblyDeadline(m,values){
 const days=Number(values.days),issueDate=m.pilotIssue?.at.slice(0,10);
 const anchor=values.anchorKind==='issue'?issueDate:values.anchorKind==='report'?m.engagements[0].reportDate:values.anchor;
 if(!validDate(anchor??'')||!/^\d+$/.test(values.days)||!Number.isSafeInteger(days)||days>3650)throw Error('Бодлогын эхлэх өдөр ба 0–3650 календарь хоногийг шалгана уу.');
 return new Date(Date.parse(anchor+'T00:00:00Z')+days*86_400_000).toISOString().slice(0,10);
}

export function assemblyStatus(m,signed,readEvidence,includeHistory=false){
 const inventory=assemblyInventory(m,signed,readEvidence),latest=assemblyRecord(m);
 const current=latest?.status==='approved'&&latest.assemblyBasis?.issueAt===inventory.issueAt&&latest.assemblyBasis?.inventoryDigest===inventory.inventoryDigest;
 const {history,references,...visible}=inventory;
 return {...visible,...(includeHistory&&{history,references}),enabled:assemblyRows(m).length>0,current:!!current,
  ...(latest&&{latest:{id:latest.id,version:latest.version,status:latest.status,by:latest.by,at:latest.at,reason:latest.reason,values:latest.values,basis:latest.assemblyBasis}})};
}

export function checkAssemblyRecord(m,row,signed,readEvidence){
 const inventory=assemblyInventory(m,signed,readEvidence);
 if(inventory.gaps.length)throw Error(inventory.gaps.join(' · '));
 const stored=readEvidence(row.values.policyEvidence),metadata=m.evidence.find(e=>e.id===row.values.policyEvidence&&evidenceCurrent(m,e));
 if(!stored?.bytes||!metadata||hash(stored.bytes)!==stored.sha256)throw Error('Бүрдүүлэлт ба хадгалалтын зөвшөөрсөн бодлогын эх шаардлагатай.');
 const deadline=assemblyDeadline(m,row.values);
 const completionDay=row.status==='approved'?row.at.slice(0,10):new Date().toISOString().slice(0,10);
 if(completionDay>deadline&&!row.values.lateReason)throw Error('Бүрдүүлэлтийн хугацаа хэтэрсэн тайлбар ба шийдвэр шаардлагатай.');
 const basis={issueAt:inventory.issueAt,authorizationAt:inventory.authorizationAt,reportSha256:inventory.reportSha256,inventoryDigest:inventory.inventoryDigest,deadline,
  policyEvidence:{id:metadata.id,version:metadata.version,sha256:stored.sha256}};
 if(['submitted','approved'].includes(row.status)&&JSON.stringify(row.assemblyBasis)!==JSON.stringify(basis))throw Error('Хянах индекс эсвэл бодлогын эх өөрчлөгдсөн. Засварт буцааж шинэчилнэ үү.');
 row.assemblyBasis=basis;
 row.paperVersions=Object.fromEntries(inventory.items.filter(i=>i.kind==='paper').map(i=>[m.work[i.id].form,i.version]));
 return basis;
}

export function assemblySnapshot(m,signed,readEvidence){
 if(!assemblyRows(m).length)return undefined;
 const state=assemblyStatus(m,signed,readEvidence,true),row=assemblyRecord(m);
 if(!state.current||state.gaps.length||assemblyRows(m).some(r=>r!==row&&r.status!=='approved'&&(!r.assemblyBasis||r.assemblyBasis.issueAt===m.pilotIssue.at)))throw Error('Эцсийн файлын одоогийн индекс, бүрэн байдлын хяналт ба хараат бус зөвшөөрөл шаардлагатай.');
 const basis=checkAssemblyRecord(m,row,signed,readEvidence);
 return {id:row.id,version:row.version,completedAt:row.at,completedBy:row.by,preparedBy:row.owner,values:{...row.values},basis,items:state.items,references:state.references,history:state.history};
}
