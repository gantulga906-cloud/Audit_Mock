import {actorKey} from './pilot-identity-context.mjs';
import {createHash,randomUUID} from 'node:crypto';
import {approvedRows} from './pilot-registers.mjs';
import {evidenceCurrent} from './pilot-requests.mjs';
import {managedReporting} from './pilot-reporting.mjs';
import {fileInput,input,PilotError} from './pilot-workflow.mjs';
import {recordEvent} from '../src/lib/workspace.ts';
import {validDate} from '../src/lib/feature-workflows.ts';
export const controlledArchive=m=>m.pilotArchiveControls?.profile===1;
const sha=v=>createHash('sha256').update(v).digest('hex');
const today=()=>new Date().toISOString().slice(0,10);
const fail=(text,status=409)=>{throw new PilotError(status,text);};
export const archiveCapacities={'M12-F02':'file','M12-F04':'file','M12-F07':'disclosure','M12-F08':'retention','M12-F09':'recovery','M12-F10':'disclosure','M12-F11':'disposition'};
export function enableArchive(m,role,data){
 if(role!=='partner')fail('Эцсийн файлын горимыг партнер сонгоно.',403);
 if(!m.engagements[0]?.intake.active||!managedReporting(m)||m.pilotLaterFacts?.some(r=>!r.closed))fail('G06 горимтой идэвхтэй ажил ба шийдсэн өмнөх нөхцөл шаардлагатай.');
 if(controlledArchive(m))return;
 m.pilotArchiveControls={profile:1,by:actorKey(role),at:new Date().toISOString(),reason:input(data,'reason')};
 recordEvent(m,'G07 · Бүрдүүлэлт, бодит хадгалалтын хүлээн авалт ба хязгаарлагдсан хандалтын горим сонгов');
}
export function archiveOriginal(m,id,read){
 const meta=m.evidence.find(e=>e.id===id),file=read(id);
 if(!meta||!(meta.archiveOnly?meta.status==='accepted':evidenceCurrent(m,meta))||!file?.bytes||sha(file.bytes)!==file.sha256)fail('Хянасан бодит эрх / бодлогын эх ба яг хэш шаардлагатай.');
 return {id,version:meta.version,sha256:file.sha256};
}
export function archiveAuthority(m,row,read){
 if(!controlledArchive(m))return;
 const v=row.values,person=approvedRows(m,'M01-F03').find(r=>r.id===v.archiveApprover),capacity=archiveCapacities[row.kind];
 if(!capacity||v.archiveCapacity!==capacity||!v.archiveAuthorityBasis||person?.values.account!=='partner'||!approvedRows(m,'M01-F06').some(r=>r.values.person===person.id&&r.values.capacity==='partner'&&r.values.from<=today()&&r.values.to>=today()))fail('Тайлан гаргах эрхээс тусдаа, яг хүн ба энэ файлын үйлдлийн бодит эрхийг холбоно.');
 return {person:person.id,personVersion:person.version,capacity,basis:v.archiveAuthorityBasis,evidence:archiveOriginal(m,v.archiveAuthority,read)};
}
export function checkArchiveControls(m,row,files){
 if(!controlledArchive(m)||!archiveCapacities[row.kind])return;
 const v=row.values,authority=archiveAuthority(m,row,files.read);
 const basis={authority};
 if(row.kind==='M12-F08'){
  if(!['confirmed','unresolved'].includes(v.determination)||!v.jurisdiction||!v.edition||!v.restrictions)fail('Хадгалалтын хэрэглэгдэх хүрээ, хэвлэл ба тодорхой / шийдээгүй төлөвийг бүртгэнэ.');
  basis.policy=archiveOriginal(m,v.policyEvidence,files.read);
  if(v.type==='policy'){
   if(v.determination==='confirmed'&&(!validDate(v.anchor)||!/^\d{1,2}$/.test(v.minimumYears??'')||Number(v.minimumYears)<1||!/^\d{1,2}$/.test(v.years??'')||Number(v.years)<Number(v.minimumYears)||!v.anchorBasis))fail('Бодит эхлэх үйл явдал ба хэрэглэх доод / урт хугацааны баталсан шийдвэр шаардлагатай.');
   if(v.supersedes){const prior=(m.pilotRecords??[]).find(r=>r.id===v.supersedes&&r.kind==='M12-F08'&&r.values.type==='policy'&&r.values.package===v.package&&r.status==='approved');if(!prior)fail('Яг энэ багцын өмнөх баталсан бодлогын шийдвэрийг холбоно.');}
  }
  if(v.type==='release'&&v.determination!=='confirmed')fail('Шийдээгүй хоригийг чөлөөлөхгүй.');
 }
 if(['M12-F07','M12-F10'].includes(row.kind)&&(!v.requester||!v.confidentiality||!v.disclosureAuthority))fail('Бодит хүсэлт гаргагч, зорилго, задруулах эрх ба нууцлалын хүрээ шаардлагатай.');
 if(row.kind==='M12-F04'&&v.type==='administrative'&&(!v.administrativeScope||v.conclusionEffect!=='none'))fail('Зөвхөн бодит захиргааны индексийн хүрээг тусдаа тодорхойлно. Шинэ дүгнэлтэд агуулгын өөрчлөлтийн зам хэрэглэнэ.');
 if(row.kind==='M12-F09'&&v.type==='restore'){if(!v.recoveryMethod)fail('Бодит сэргээх арга шаардлагатай.');basis.recovery=archiveOriginal(m,v.recoveryEvidence,files.read);}
 if(row.kind==='M12-F11'&&(!v.copyScope||!v.disposalMethod||!v.residualPlan))fail('Яг хуулбарын хүрээ, төлөвлөсөн арга ба үлдэх хуулбарын шийдвэр шаардлагатай.');
 if(row.archiveControlBasis&&row.status==='submitted'&&JSON.stringify(row.archiveControlBasis)!==JSON.stringify(basis))fail('Файлын эрх / бодлогын эх өөрчлөгдсөн. Буцааж шинэ хувилбараар хянана.');
 row.archiveControlBasis=basis;
}
export function archiveControlStale(m,row){
 if(!controlledArchive(m)||!archiveCapacities[row.kind]||row.status!=='approved'&&row.status!=='submitted')return false;
 const b=row.archiveControlBasis;if(!b)return true;
 const person=approvedRows(m,'M01-F03').find(r=>r.id===b.authority.person);
 return !person||person.version!==b.authority.personVersion||[b.authority.evidence,b.policy,b.recovery].filter(Boolean).some(ref=>!m.evidence.some(e=>e.id===ref.id&&e.version===ref.version&&(e.archiveOnly?e.status==='accepted':evidenceCurrent(m,e))));
}
export function inspectionItems(bundle){
 return [{id:'report',name:'Аудиторын яг тайлан',sha256:bundle.authorization.artifact.sha256},...bundle.evidence.map(f=>({id:f.id,name:f.name,sha256:f.sha256}))];
}
export function custodyInspection(m,offer,bundle,data,role){
 let items;try{items=JSON.parse(data.items);}catch{fail('Уншигдах байдлын бодит шалгалтын мөрүүд шаардлагатай.');}
 const expected=inspectionItems(bundle);
 if(!Array.isArray(items)||items.length!==expected.length||new Set(items.map(r=>r.id)).size!==expected.length)fail('Яг тайлан ба эх файл бүрийн бодит уншилтыг тусдаа бүртгэнэ.');
 for(const e of expected){const row=items.find(r=>r.id===e.id);if(!row||row.sha256!==e.sha256||!['readable','unreadable','unavailable','unknown'].includes(row.result)||typeof row.method!=='string'||!row.method.trim()||typeof row.reason!=='string'||!row.reason.trim()||row.method.length>1000||row.reason.length>4000)fail('Бүрдэл бүрийн яг хэш, ашигласан арга / програм ба бодит үр дүн шаардлагатай.');}
 const day=input(data,'checkedOn',10);if(!validDate(day)||day>today()||day<offer.offeredAt.slice(0,10))fail('Бодитоор шалгасан өдрийг бүртгэнэ.');
 const key=input(data,'inspectionKey',36);if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(key))fail('Шалгалтын дахин илгээх яг таних тэмдэг шаардлагатай.');
 const inspection={key,version:(offer.inspections?.length??0)+1,by:actorKey(role),at:new Date().toISOString(),checkedOn:day,digest:offer.digest,location:input(data,'location',300),medium:input(data,'medium',200),receipt:input(data,'receipt'),confidentiality:input(data,'confidentiality'),items};
 const payload=JSON.stringify({checkedOn:inspection.checkedOn,digest:inspection.digest,location:inspection.location,medium:inspection.medium,receipt:inspection.receipt,confidentiality:inspection.confidentiality,items:inspection.items});const fingerprint=sha(payload),prior=offer.inspections?.find(r=>r.key===key);if(prior){if(prior.fingerprint!==fingerprint)fail('Нэг шалгалтын таних тэмдэгтэй өөр агуулга илгээхгүй.');return prior;}if(offer.inspections?.at(-1)?.checkedOn>day)fail('Одоогийн үр дүнг хуучин өдрийн шалгалтаар орлуулахгүй.');inspection.fingerprint=fingerprint;
 (offer.inspections??=[]).push(inspection);return inspection;
}
export function custodyReady(offer){const r=offer.inspections?.at(-1);return !!r&&r.digest===offer.digest&&r.items.every(i=>i.result==='readable');}

export function archiveSupportAction(m,role,action,data,files){
 if(!controlledArchive(m))fail('G07 файлын горим шаардлагатай.');
 if(action==='archive-support-upload'){const original=input(data,'name',180),json=/\.json$/i.test(original),parsed=fileInput(json?{...data,name:original.replace(/\.json$/i,'.csv')}:data),name=json?original:parsed.name,bytes=parsed.bytes,id=randomUUID();if(json){try{JSON.parse(bytes.toString('utf8'));}catch{fail('JSON эхийн бодит бүтэц буруу байна.',400);}}files.add(id,name,bytes);m.evidence.push({id,name,engagement:m.engagement,version:1,type:'FILE',obtained:today(),source:input(data,'source',200),status:'received',specimen:false,anchor:'',text:'',original:true,uploadedBy:actorKey(role),archiveOnly:true});}
 else{const item=m.evidence.find(e=>e.id===data.id&&e.archiveOnly&&e.status==='received');if(!item||role==='preparer'||actorKey(role)===item.uploadedBy)fail('Шинэ захиргааны эхийг тусдаа хүн үнэлнэ.',403);if(!['accepted','rejected'].includes(data.result))fail('Бодит үнэлгээ шаардлагатай.');item.status=data.result;item.assessment=input(data,'reason');item.standaloneAssessment={result:data.result,by:actorKey(role),at:new Date().toISOString(),reason:item.assessment};}
 recordEvent(m,action);
}
