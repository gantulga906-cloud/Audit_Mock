import {useState} from 'react';
import {checkData,evidenceCoverage,profiles,statementSample,type CheckId,type CheckResult} from '@/lib/audit-checks';
import {currentSelection,type Model} from '@/lib/workspace';
import {projectRatio} from '@/lib/audit-checks';

export function DataChecks(){
 const [id,setId]=useState<CheckId>('AUTO-005'),[input,setInput]=useState(''),[reported,setReported]=useState(''),[result,setResult]=useState<CheckResult>(),[error,setError]=useState('');
 const profile=profiles[id];
 return <section className="card pad bench-card space-top"><h2>Данс ба тайлангийн шалгалт</h2><p className="muted">Оруулсан CSV-г ашиглана. Хамрах хүрээ: нэг нэгж, нэг валют, нэг тайлант үе.</p>
 <label>Шалгалт<select value={id} onChange={e=>{setId(e.target.value as CheckId);setResult(undefined);setError('');setInput('');setReported('')}}>{Object.entries(profiles).map(([k,v])=><option value={k} key={k}>{k} · {v.title}</option>)}</select></label>
 <p className="micro">{profile.input}</p><button className="btn secondary" onClick={()=>{setInput(profile.sample);setReported(id==='AUTO-006'?statementSample:'');setResult(undefined);setError('')}}>Зохиомол жишээ ачаалах</button>
 <label>Эх CSV<textarea value={input} onChange={e=>{setInput(e.target.value);setResult(undefined)}}/></label>{id==='AUTO-006'&&<label>Баталсан тайлангийн мөрийн CSV<textarea value={reported} onChange={e=>{setReported(e.target.value);setResult(undefined)}}/></label>}
 <button className="btn primary" disabled={!input.trim()||(id==='AUTO-006'&&!reported.trim())} onClick={()=>{try{setResult(checkData(id,input,reported));setError('')}catch(e){setResult(undefined);setError((e as Error).message)}}}>Шалгах</button>
 {error&&<p className="text-red" role="alert">{error}</p>}
 {result&&<><p className="micro">{result.rows.length} тулгалт · {result.issues.length} зөрүү</p><div className="table-scroll"><table><thead><tr><th>Данс / мөр</th><th>Тооцсон</th><th>Бүртгэсэн</th><th>Зөрүү</th></tr></thead><tbody>{result.rows.map(r=><tr key={r.key}><td>{r.key}</td><td>{r.expected}</td><td>{r.recorded}</td><td>{r.difference}</td></tr>)}</tbody></table></div>{result.issues.map(i=><p className="text-amber" key={i}>{i}</p>)}</>}
 </section>;
}
export function CoverageCheck({model}:{model:Model}){
 const rows=evidenceCoverage(model,model.engagement);
 if(!rows.length)return null;
 const labels={covered:'Бүрэн',partial:'Хэсэгчлэн',missing:'Дутуу',rejected:'Буцаасан'};
 return <section className="card pad bench-card space-top"><h2>Хүсэлтийн хамралт</h2><p className="micro">AUTO-001 · Зөвхөн энэ гэрээт ажлын холбоотой, үнэлж авсан баримтууд.</p><div className="table-scroll"><table><thead><tr><th>Хүсэлт</th><th>Хүлээн авсан</th><th>Хамралт</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.id} · {r.title}</td><td>{r.accepted} / {r.expected}</td><td>{labels[r.status as keyof typeof labels]}</td></tr>)}</tbody></table></div></section>;
}
export function Projection({model}:{model:Model}){
 const id=model.engagement,s=currentSelection(model,id),w=model.work[id+'/3.1.2'];
 if(!s||!w)return null;
 const tested=s.ids.map(i=>({id:i,result:w.values['sample.'+s.stamp+'.'+i],finding:model.findings.find(f=>f.engagement===id&&f.sampleId===i)}));
 const ready=tested.every(x=>x.result?.startsWith('pass:')||x.result?.startsWith('exception:')&&x.finding);
 const population=model.datasets[id].rows.flatMap(r=>r.state==='accepted'&&r.amount!==null?[{id:r.id,amount:r.amount}]:[]);
 let result:ReturnType<typeof projectRatio>|undefined;
 if(ready)try{result=projectRatio(population,tested.map(x=>({id:x.id,error:x.result.startsWith('pass:')?0:x.finding!.amount})));}catch{}
 return <section className="card pad bench-card space-top"><h2>Энгийн харьцааны төсөөлөл</h2><p className="micro">Бүх сонгосон нэгжийн одоогийн үр дүн шаардлагатай. Төсөөллийг аудитын шийдвэр эсвэл бүртгэсэн залруулга гэж үзэхгүй.</p>{result?<p>Шалгасан дүн: {result.tested.toLocaleString()} · Зөрүү: {result.error.toLocaleString()} · Төсөөлсөн: <strong>{result.projection.toLocaleString(undefined,{maximumFractionDigits:2})}</strong></p>:<p className="text-amber">Үр дүн дутуу эсвэл суурь дүн тохирохгүй байна.</p>}</section>;
}
