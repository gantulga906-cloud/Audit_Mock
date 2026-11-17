import type {ReportingView} from '@/lib/pilot-reporting';
import type {PilotRole} from '@/lib/pilot-registers';
import type {PilotAction} from './pilot-registers';
import {DataAction} from './pilot-population';
const sections:Record<string,string>={kam:'Аудитын гол асуудал',going:'Тасралтгүй ажиллагаа',emphasis:'Онцлон тэмдэглэх',other:'Бусад асуудал',otherInformation:'Бусад мэдээлэл',regulatory:'Нэмэлт хууль / зохицуулалт'};
const opinions:Record<string,string>={unmodified:'Өөрчлөлтгүй',qualified:'Хязгаарлалттай',adverse:'Сөрөг',disclaimer:'Дүгнэлт өгөхөөс татгалзсан'};
export function ReportingDesk({data,role,run,completionEnabled}:{data?:ReportingView;role:PilotRole;run:PilotAction;completionEnabled:boolean}){
 return <section className="card pad bench-card" data-reporting><h2>Санал, тайлангийн эх ба гаргалтын хүрээ</h2>
 {!data?.enabled?<><p>Хүний саналын шийдвэр, хянасан яг үг хэллэг, эрх ба зөвшөөрсөн хүлээн авагчдыг холбоно.</p>{role==='partner'&&completionEnabled&&<DataAction action="reporting-enable" run={run} button="Яг тайлангийн хяналтын горим сонгох"><label>Одоогийн ажилд хэрэглэх бодит шийдвэр<textarea name="reason" required/></label></DataAction>}{!completionEnabled&&<p>Эхлээд G05 дуусгалтын горим ба бодит эхийг бэлтгэнэ.</p>}</>:<>
 <p>Сонгосон санал: <b>{data.opinion?opinions[data.opinion.values.opinion]:'Хүний одоогийн шийдвэр хүлээж байна'}</b></p>
 <p>Эх ба эрх: {data.preparation?data.preparation.values.templateTitle+' · '+data.preparation.values.edition+' · v'+data.preparation.version:'Хянасан яг эх хүлээж байна'}</p>
 <p className="micro">Доорх дуусгалтын бүртгэлд M10-F09 санал, M10-F10 яг үг хэллэг ба хүрээ, M10-F11 хэсэг бүрийн оруулах / хасах үндэслэлийг бэлтгэж тусдаа хянуулна.</p>
 <ul>{Object.entries(sections).map(([id,label])=>{const r=data.sections?.find(r=>r.values.type===id);return <li key={id}>{label} · {r?r.values.applicability==='include'?'Хянаж оруулахаар баталсан':'Үндэслэлтэй хассан':'Одоогийн шийдвэр дутуу'}{r?' · '+r.values.basis:''}</li>;})}</ul>
 <h3>Яг зөвшөөрсөн хүлээн авагчид</h3>{data.recipients?.length?data.recipients.map(c=><p key={c.id}>{c.name} · {c.email} · {c.capacity}</p>):<p>Одоогийн хянасан жагсаалт дутуу.</p>}
 {!!data.gaps?.length&&<div className="callout amber"><b>Шийдвэрлэх зөрүү ба дутуу ажил</b><ul>{data.gaps.map(g=><li key={g}>{g}</li>)}</ul></div>}
 {!!data.issues?.length&&<details><summary>Яг гаргасан хувилбарын түүх ({data.issues.length})</summary>{data.issues.map(i=><p className="micro break-all" key={i.at}>{i.at} · {i.reference} · Тайлан {i.reportSha256} · Багц {i.packageSha256}</p>)}</details>}
 </>}
 </section>;
}
