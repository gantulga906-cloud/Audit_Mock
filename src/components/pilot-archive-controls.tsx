import {useState,type FormEvent} from 'react';
import type {Evidence} from '@/lib/workspace';
import type {PilotRole} from '@/lib/pilot-registers';
import type {PilotAction} from './pilot-registers';
import {DataAction} from './pilot-population';
type ArchiveEvidence=Evidence&{archiveOnly?:boolean;uploadedBy?:string};
export function ArchiveControlsDesk({enabled,reporting,role,evidence,run,readFile,onError}:{enabled:boolean;reporting:boolean;role:PilotRole;evidence:ArchiveEvidence[];run:PilotAction;readFile:(file:FormDataEntryValue|null)=>Promise<{name:string;base64:string}>;onError:(text:string)=>void}){
 function upload(e:FormEvent<HTMLFormElement>){e.preventDefault();const form=e.currentTarget,d=new FormData(form);void readFile(d.get('file')).then(file=>run('archive-support-upload',{...file,source:String(d.get('source'))})).then(ok=>{if(ok)form.reset();}).catch(e=>onError(e.message));}
 return <section className="card pad bench-card" data-archive-controls><h2>Эцсийн файлын эрх, бодлогын эх ба хязгаар</h2>
 {!enabled?<>{role==='partner'&&reporting?<DataAction run={run} action="archive-enable" button="Файлын тусдаа хяналтын горим сонгох"><label>Энэ ажилд хэрэглэх бодит шийдвэр<textarea name="reason" required/></label></DataAction>:<p>Энэ ажилд G06 тайлагнал ба файлын тусдаа хяналтын шийдвэрийг эхлээд бэлтгэнэ.</p>}</>:<>
 <p>Файл батлах, хязгаарлагдсан задруулга, хадгалалт ба устгалын шийдвэр тус бүр бодит эрхийн эхтэй байна. Шийдээгүй хадгалалтын шаардлага нь файлыг хэвээр хадгалах төлөвтэй.</p>
 <form className="feature-form" onSubmit={upload}><label>Зөвхөн архивын захиргааны эх<input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.csv,.json" required/></label><label>Бодит эх үүсвэр ба зориулалт<input name="source" maxLength={200} required/></label><button className="btn secondary">Захиргааны шинэ эх бүртгэх</button></form>
 <p className="micro">Энэ эх нь гаргасан аудитын нотолгоог өөрчлөхгүй. Хүлээн авсныг тусдаа хүн үнэлсний дараа файлын шийдвэрт холбоно.</p>
 {evidence.filter(e=>e.archiveOnly).map(e=><div className="bench-item" key={e.id}><b>{e.name} · {e.status==='accepted'?'Хянаж зөвшөөрсөн':e.status==='rejected'?'Татгалзсан':'Үнэлгээ хүлээж байна'}</b>{e.assessment&&<p>{e.assessment}</p>}{e.status==='received'&&role!=='preparer'&&e.uploadedBy!==role&&<DataAction run={run} action="archive-support-assess" extra={{id:e.id,result:'accepted'}} button="Яг эхийг тусдаа хүн үнэлэх"><label>Бодит эх, зориулалт ба бүрэн байдлыг шалгасан нь<textarea name="reason" required/></label></DataAction>}</div>)}
 </>}
 </section>;
}
export type CustodyInspectionItem={id:string;name:string;sha256:string};
export type CustodyInspection={version:number;at:string;checkedOn:string;digest:string;location:string;medium:string;receipt:string;confidentiality:string;items:{id:string;sha256:string;result:string;method:string;reason:string}[]};
export function CustodyInspectionForm({items,packageId,digest,run,latest}:{items:CustodyInspectionItem[];packageId:string;digest:string;run:PilotAction;latest?:CustodyInspection}){
 const [inspectionKey]=useState(()=>crypto.randomUUID());
 const [rows,setRows]=useState(items.map(i=>({id:i.id,sha256:i.sha256,result:'unknown',method:'',reason:''}))),[method,setMethod]=useState(''),[reason,setReason]=useState('');
 const update=(id:string,key:string,value:string)=>setRows(rows=>rows.map(r=>r.id===id?{...r,[key]:value}:r));
 return <details className="feature-detail" data-custody-inspection open><summary>Бодит уншигдах байдал ба үргэлжилсэн шалгалт</summary>
 {latest&&<p>Өмнөх бодит шалгалт v{latest.version} · {latest.checkedOn} · {latest.items.every(i=>i.result==='readable')?'Бүрдлүүд уншигдсан':'Уншигдаагүй / боломжгүй бүрдэл үлдсэн'}</p>}
 <div className="field-grid"><label>Бодитоор хэрэглэсэн нийтлэг арга / програм<input value={method} onChange={e=>setMethod(e.target.value)}/></label><label>Нийтлэг бодит шалгалтын тэмдэглэл<input value={reason} onChange={e=>setReason(e.target.value)}/></label></div><button type="button" className="btn secondary" onClick={()=>setRows(rows=>rows.map(r=>({...r,method,reason})))}>Арга ба тэмдэглэлийг мөрүүдэд оруулах</button>
 <DataAction run={run} action="inspect" extra={{package:packageId,digest,inspectionKey,items:JSON.stringify(rows)}} button="Бодит шалгалтын үр дүн хадгалах">
 <div className="field-grid"><label>Бодитоор шалгасан өдөр<input name="checkedOn" type="date" required/></label><label>Бодит байршил<input name="location" required/></label><label>Бодит зөөгч / орчин<input name="medium" required/></label><label>Яг багцыг бодитоор хүлээн авсан тэмдэглэл<textarea name="receipt" required/></label><label>Нууцлал ба эрхийн нөхцөлийг шалгасан нь<textarea name="confidentiality" required/></label></div>
 <div className="ew-table-scroll"><table className="ew-table"><thead><tr><th>Яг бүрдэл</th><th>Бодит үр дүн</th><th>Арга / програм</th><th>Ажиглалт ба үлдсэн ажил</th></tr></thead><tbody>{items.map(i=>{const r=rows.find(r=>r.id===i.id)!;return <tr key={i.id} data-inspection-item={i.id}><td>{i.name}<small className="ew-cell-muted">{i.sha256.slice(0,16)}</small></td><td><select aria-label={i.name+' · үр дүн'} value={r.result} onChange={e=>update(i.id,'result',e.target.value)}><option value="unknown">Хараахан шалгаагүй</option><option value="readable">Бодитоор нээж уншсан</option><option value="unreadable">Байт байгаа ч уншигдахгүй</option><option value="unavailable">Нээх орчин / эх боломжгүй</option></select></td><td><input aria-label={i.name+' · арга'} value={r.method} onChange={e=>update(i.id,'method',e.target.value)} required/></td><td><input aria-label={i.name+' · ажиглалт'} value={r.reason} onChange={e=>update(i.id,'reason',e.target.value)} required/></td></tr>;})}</tbody></table></div>
 </DataAction>
 </details>;
}
