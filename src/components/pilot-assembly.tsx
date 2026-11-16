'use client';

import type {AssemblyView} from '@/lib/pilot-assembly';
const kinds:Record<string,string>={report:'Тайлан',statements:'СТ ба тодруулга',paper:'Ажлын баримт',record:'Шийдвэр ба бүртгэл',evidence:'Эх файл'};
const states:Record<string,string>={draft:'Ноорог',submitted:'Хяналтад',returned:'Засварт буцаасан',approved:'Баталсан'};

export function AssemblyDesk({data,sealed}:{data?:AssemblyView;sealed:boolean}){
 if(!data)return null;
 return <section className="card pad bench-card" aria-label="Эцсийн файлын бүрдүүлэлт">
  <div className="section-heading"><h2>Эцсийн файл бүрдүүлэлт</h2><span className="pill">{sealed?'Түгжээтэй':data.current?'Бүрдүүлэлтийг баталсан':data.latest?states[data.latest.status]:'Бүрдүүлэлт хүлээгдэж байна'}</span></div>
  <p>{data.issueAt?'Гаргасан яг багцын индекс, гарын үсэг, эх файл ба холбоосыг шалгана. Бүрдүүлэлтийн зөвшөөрөл, түгжих үйлдэл ба хадгалалтын бодлого тусдаа бүртгэлтэй.':'Тайлангийн гаргалтын дараа эцсийн индекс, эх файлын бүрэн байдал ба холбоосууд энд гарна.'}</p>
  {!!data.gaps.length&&<ul className="text-amber">{data.gaps.map(gap=><li key={gap}>{gap}</li>)}</ul>}
  {data.latest&&<div className="bench-item"><b>Бүрдүүлэлт v{data.latest.version} · {states[data.latest.status]}</b>
   <p>{data.latest.values.classification} · {data.latest.values.policy}</p>
   {data.latest.basis&&<p>Бодлогоор тооцсон бүрдүүлэлтийн эцсийн өдөр · {data.latest.basis.deadline}</p>}
   {data.current&&<p>Бүрдүүлэлт баталсан · {data.latest.at?.slice(0,16)}</p>}
   {data.latest.reason&&<p>{data.latest.reason}</p>}
  </div>}
  {data.items.length>0&&<details className="feature-detail" open><summary>Эцсийн индекс · {data.items.length} бүрдэл</summary><div className="ew-table-scroll"><table className="ew-table"><thead><tr><th>Төрөл</th><th>Баримт / шийдвэр</th><th>Хувилбар</th></tr></thead><tbody>{data.items.map(item=><tr key={item.kind+item.id}><td>{kinds[item.kind]??item.kind}</td><td><b>{item.label}</b><small className="ew-cell-muted">{item.id}</small></td><td>{item.version?'v'+item.version:'—'}{item.sha256&&<small className="ew-cell-muted" title={item.sha256}>SHA-256 {item.sha256.slice(0,12)}…</small>}</td></tr>)}</tbody></table></div></details>}
  {!sealed&&data.issueAt&&!data.current&&<p className="space-top">Доорх бүртгэлээс «Эцсийн файл бүрдүүлэлт ба бүрэн байдлын хяналт»-ыг бөглөж, бодлогын эх ба индексийн үнэлгээг хараат бус партнерын хяналтад илгээнэ.</p>}
 </section>;
}
