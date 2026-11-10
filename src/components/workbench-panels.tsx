import {useEffect,useState} from 'react';
import {ArrowDown,ArrowUp,Copy,FileText,Plus,Trash2,Upload} from 'lucide-react';
import {applyTemplate,bench,grant,publish,saveClient,saveDraft,sharedFields,tableColumns,templateFromGrid,today,type Client,type Field,type Grid,type Period,type Template,type Theme} from '@/lib/workbench';
import {loadFile,readWord,readWorkbook,retainFile} from '@/lib/office-preview';
import {issuedRequest} from '@/lib/feature-workflows';
import {canReadWork,inScope,PERSONS,personById,type Evidence,type Model,type WorkItem} from '@/lib/workspace';

type Props={model:Model;change:(fn:(m:Model)=>void)=>void};
const kind:Record<string,string>={text:'Богино текст',textarea:'Дэлгэрэнгүй текст',yesno:'Тийм / Үгүй',select:'Нэг сонголт',multiselect:'Олон сонголт',date:'Огноо',number:'Тоо / Дүн',evidence:'Баримтын холбоос',table:'Давтагдах мөр',procedure:'Аудитын горим'};
const binding:Record<NonNullable<Field['binding']>,string>={name:'Байгууллагын нэр',legalForm:'Хуулийн хэлбэр',registration:'Регистрийн дугаар',period:'Тайлант үе',contacts:'Удирдлага ба холбоо барих хүмүүс',framework:'Тайлагналын хүрээ',industry:'Салбар'};
const input=(id:string):Template=>({id,title:'',stage:1,family:'questionnaire',sheet:'Арга зүйн сан',fields:[{key:'q'+crypto.randomUUID(),label:'',type:'text',source:'Захиалгат'}]});

export function ClientRegister({model,change}:Props){
 const id=model.engagement,e=model.engagements.find(x=>x.id===id)!,b=model.bench!,[draft,setDraft]=useState<Client>(structuredClone(b.clients[id])),[p,setP]=useState<Period|undefined>(b.periods[id]),[year,setYear]=useState(e.period||'2025'),[body,setBody]=useState('');
 const [saved,setSaved]=useState(false),disabled=e.locked||personById(model.person).role==='quality';
 const contact=(i:number,patch:Partial<Client['contacts'][number]>)=>setDraft({...draft,contacts:draft.contacts.map((c,j)=>i===j?{...c,...patch}:c)});
 return <div className="workbench-grid"><section className="card pad bench-card"><span className="eyebrow">ҮЙЛЧЛҮҮЛЭГЧ</span><h2>Компанийн бүртгэл</h2>
  <label>Байгууллагын нэр<input disabled={disabled} value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><div className="field-grid">
  <label>Хууль ёсны хэлбэр<select disabled={disabled} value={draft.legalForm} onChange={e=>setDraft({...draft,legalForm:e.target.value})}><option value="">Сонгоогүй</option>{['ХХК','ХК','ТӨҮГ','ТББ','Бусад'].map(x=><option key={x}>{x}</option>)}</select></label>
  <label>Бүртгэлийн дугаар<input disabled={disabled} value={draft.registration} onChange={e=>setDraft({...draft,registration:e.target.value})}/></label></div>
  <label>Тайлагналын хүрээ<input disabled={disabled} value={draft.framework} onChange={e=>setDraft({...draft,framework:e.target.value})}/></label>
  <h3>Тайлант үе</h3><div className="row-actions"><label>Хуанлийн жил<input disabled={disabled} type="number" min="1900" max="2100" value={year} onChange={e=>setYear(e.target.value)}/></label><button className="btn secondary" disabled={disabled||!/^\d{4}$/.test(year)} onClick={()=>setP({start:year+'-01-01',end:year+'-12-31'})}>Бүтэн жил</button></div>
  <div className="field-grid"><label>Эхлэх огноо<input disabled={disabled} type="date" value={p?.start??''} onChange={e=>setP({start:e.target.value,end:p?.end??''})}/></label><label>Дуусах огноо<input disabled={disabled} type="date" value={p?.end??''} onChange={e=>setP({start:p?.start??'',end:e.target.value})}/></label></div>
  <button className="quiet" disabled={disabled||!p||e.intake?.active} onClick={()=>setP(undefined)}>Тодорхойгүй гэж тэмдэглэх</button>
  <p className="micro">Тайлан гаргах зорилтот өдөр: {e.reportDate}. Компанийн мэдээлэл 1.1.1, 1.4.3 болон холбосон маягтуудад ашиглагдана.</p>
  <button className="btn primary" disabled={disabled||!draft.name.trim()} onClick={()=>{change(m=>saveClient(m,id,draft,p));setSaved(true)}}>Компанийн мэдээлэл хадгалах</button>{saved&&JSON.stringify(model.bench?.clients[id])===JSON.stringify(draft)&&JSON.stringify(model.bench?.periods[id])===JSON.stringify(p)&&<p className="text-green">Хадгалсан мэдээлэл холбогдсон ажилд харагдана.</p>}
 </section><section className="card pad bench-card"><span className="eyebrow">ХОЛБОО БАРИХ</span><h2>Засаглал ба хүмүүс</h2>
  <label>Засаглах байгууллага<input disabled={disabled} placeholder="ТУЗ, Аудитын хороо…" value={body} onChange={e=>setBody(e.target.value)}/></label><button className="btn secondary" disabled={disabled||!body.trim()||draft.bodies.includes(body.trim())} onClick={()=>{setDraft({...draft,bodies:[...draft.bodies,body.trim()]});setBody('')}}>Байгууллага нэмэх</button>
  <p className="muted">{draft.bodies.join(' · ')}</p>
  {draft.contacts.map((c,i)=><div className="bench-item" key={c.id}><div className="field-grid"><label>Нэр<input disabled={disabled} value={c.name} onChange={e=>contact(i,{name:e.target.value})}/></label><label>Албан үүрэг<input disabled={disabled} value={c.role} onChange={e=>contact(i,{role:e.target.value})}/></label><label>И-мэйл<input disabled={disabled} type="email" value={c.email} onChange={e=>contact(i,{email:e.target.value})}/></label><label>Харьяалах байгууллага<select disabled={disabled} value={c.body} onChange={e=>contact(i,{body:e.target.value})}><option value="">Сонгоогүй</option>{draft.bodies.map(x=><option key={x}>{x}</option>)}</select></label></div><label className="checkbox-line"><input disabled={disabled} type="checkbox" checked={c.signer} onChange={e=>contact(i,{signer:e.target.checked})}/>Гарын үсэг зурах эрхтэй</label><button className="quiet" disabled={disabled} onClick={()=>setDraft({...draft,contacts:draft.contacts.filter(x=>x.id!==c.id)})}>Жагсаалтаас хасах</button></div>)}
  <button className="btn secondary" disabled={disabled} onClick={()=>setDraft({...draft,contacts:[...draft.contacts,{id:crypto.randomUUID(),name:'',role:'',email:'',body:'',signer:false}]})}><Plus size={15}/>Хүн нэмэх</button>
 </section></div>;
}

export function TypedInput({field,value,change,disabled,model,evidence,linkedValue}:{
 field:Field;value:string;change:(s:string)=>void;disabled?:boolean;model?:Model;
 evidence?:Pick<Evidence,'id'|'name'|'version'>[];linkedValue?:string;
}){
 const {type}=field;
 if(field.binding)return <div className="linked-value">{(linkedValue??(model&&sharedFields(model,model.engagement)[field.binding]))||'Мэдээлэл оруулаагүй'} <small>Компанийн бүртгэлээс</small></div>;
 if(type==='multiselect'){
  let chosen:string[]=[];try{chosen=JSON.parse(value||'[]')}catch{}
  return <div>{field.options?.map(o=><label className="checkbox-line" key={o}><input type="checkbox" disabled={disabled} checked={chosen.includes(o)} onChange={e=>change(JSON.stringify(e.target.checked?[...chosen,o]:chosen.filter(x=>x!==o)))}/>{o}</label>)}</div>;
 }
 if(type==='table'){
  let rows:{id:string;values:Record<string,string>}[]=[];try{const decoded=JSON.parse(value||'[]');if(Array.isArray(decoded))rows=decoded;}catch{}
  const cols=field.columns?.length?field.columns:tableColumns;
  return <div><div className="table-scroll"><table><thead><tr>{cols.map(c=><th key={c.key}>{c.label}</th>)}<th/></tr></thead><tbody>{rows.map((row,i)=><tr key={row.id}>{cols.map(c=><td key={c.key}><input aria-label={c.label+' '+(i+1)} disabled={disabled} type={c.type==='number'||c.type==='date'?c.type:'text'} step={c.type==='number'?'any':undefined} value={row.values[c.key]??''} onChange={e=>change(JSON.stringify(rows.map(r=>r.id===row.id?{...r,values:{...r.values,[c.key]:e.target.value}}:r)))}/></td>)}<td><button type="button" className="quiet" disabled={disabled} onClick={()=>change(JSON.stringify(rows.filter(r=>r.id!==row.id)))}>Хасах</button></td></tr>)}</tbody></table></div><button type="button" className="quiet" disabled={disabled} onClick={()=>change(JSON.stringify([...rows,{id:crypto.randomUUID(),values:{}}]))}>+ Мөр</button></div>;
 }
 if(['yesno','select','evidence'].includes(type)){
  const opts=type==='yesno'?['Тийм','Үгүй','Тодорхойгүй','Хамаарахгүй']:field.options??[];
  return <select aria-label={field.label} disabled={disabled} value={value} onChange={e=>change(e.target.value)}><option value="">Сонгоогүй</option>{type==='evidence'?(evidence??model?.evidence.filter(e=>e.engagement===model.engagement)??[]).map(e=><option value={e.id} key={e.id}>{e.name} · v{e.version}</option>):opts.map(o=><option key={o}>{o}</option>)}</select>;
 }
 return type==='textarea'||type==='procedure'?<textarea aria-label={field.label} disabled={disabled} value={value} onChange={e=>change(e.target.value)}/>:<input aria-label={field.label} type={type==='number'||type==='date'?type:'text'} step={type==='number'?'any':undefined} disabled={disabled} value={value} onChange={e=>change(e.target.value)}/>;
}

export function FormBuilder({model,change,sources,open}:Props&{sources:Template[];open:(form:string)=>void}){
 const role=personById(model.person).role,b=model.bench!,canAuthor=personById(model.person).support.includes('methodology-author'),canPublish=personById(model.person).support.includes('methodology-publisher');
 const [t,setT]=useState<Template|null>(null),[base,setBase]=useState(''),[note,setNote]=useState(''),[preview,setPreview]=useState(false),[answers,setAnswers]=useState<Record<string,string>>({}),[grids,setGrids]=useState<Grid[]>([]),[importError,setError]=useState('');
 const edit=(i:number,patch:Partial<Field>)=>t&&setT({...t,fields:t.fields.map((f,j)=>i===j?{...f,...patch}:f)});
 const begin=(draft:Template)=>{setT(structuredClone(draft));setPreview(false);setAnswers({});setNote('');};
 const swap=(i:number,j:number)=>{if(!t||j<0||j>=t.fields.length)return;const fields=[...t.fields];[fields[i],fields[j]]=[fields[j],fields[i]];setT({...t,fields});};
 const apply=(draft:Template)=>{const owner=role==='reviewer'?'nomin':model.person,reviewer=owner==='temuulen'?'bat':'temuulen';change(m=>applyTemplate(m,model.engagement,draft,inScope(m,owner,m.engagement)?owner:'bat',reviewer));};
 return <><div className="workbench-grid"><section className="card pad bench-card"><h2>Маягт үүсгэх</h2><p className="muted">Гэрээт ажилд нэмэх эсвэл фирмийн хувилбарыг хяналтад илгээх.</p><div className="row-actions"><button className="btn primary" onClick={()=>begin(input('F-'+crypto.randomUUID().slice(0,8).toUpperCase()))}><Plus size={16}/>Хоосон маягт</button><label className="btn secondary"><Upload size={15}/>Excel импорт<input className="bench-hidden" aria-label="Маягтын Excel импорт" type="file" accept=".xlsx" onChange={async e=>{const f=e.target.files?.[0];e.currentTarget.value='';if(!f)return;try{setGrids(await readWorkbook(f));setError('')}catch(e){setError((e as Error).message)}}}/></label></div>
  <label>Эх маягт<select value={base} onChange={e=>setBase(e.target.value)}><option value="">Сонгох</option>{sources.map(s=><option value={s.id} key={s.id}>{s.id} · {s.title}</option>)}</select></label><button className="btn secondary" disabled={!base} onClick={()=>{const s=sources.find(s=>s.id===base);if(s)begin({...s,id:'F-'+crypto.randomUUID().slice(0,8).toUpperCase(),title:s.title+' · Хуулбар'})}}><Copy size={14}/>Хуулбар үүсгэх</button>
  {grids.length>0&&<div className="bench-item"><b>Excel → ноорог</b><p className="micro">Эхний мөр: Question · Type · Choices (; тусгаарлана) · Section · Required</p>{grids.map(g=><div className="row-actions" key={g.name}><button className="quiet" onClick={()=>{try{begin(templateFromGrid(g));setError('')}catch(e){setError((e as Error).message)}}}>{g.name} · {g.rows.length} мөр</button><small>{g.notes?.join(' ')}</small></div>)}</div>}{importError&&<p className="text-red" role="alert">{importError}</p>}
 </section><section className="card pad bench-card"><h2>Ноорог ба хувилбарууд</h2>
 {Object.values(b.drafts).filter(d=>d.by===model.person||canPublish&&d.submitted).map(d=><div className="bench-item" key={d.body.id}><b>{d.body.title}</b><p className="micro">{d.submitted?'Хяналт хүлээж байна':'Ноорог'} · {d.note||'Тайлбаргүй'} · {d.body.fields.length} асуулт</p><div className="row-actions">{d.by===model.person?<button className="quiet" onClick={()=>{begin(d.body);setNote(d.note)}}>Нээх</button>:<details><summary>Илгээсэн бүтцийг үзэх</summary>{d.body.fields.map(f=><p key={f.key} className="micro">{f.label} · {kind[f.type]??f.type} {f.options?.join(' / ')}</p>)}</details>}{canPublish&&d.submitted&&d.by!==model.person&&<button className="btn primary" onClick={()=>change(m=>publish(m,d.body.id))}>Хянаж нийтлэх</button>}</div></div>)}
 {Object.values(b.releases).flatMap(list=>list.slice(-1)).map(r=><div className="bench-item" key={r.body.id}><b>{r.body.title} · v{r.number}</b><p className="micro">{r.note} · {r.at.slice(0,10)}</p><div className="row-actions"><button className="quiet" onClick={()=>begin(r.body)}>Шинэ ноорог</button><button className="btn secondary" onClick={()=>apply(r.body)}>Энэ ажилд ашиглах</button></div></div>)}
 {Object.entries(b.applied).filter(([id])=>id.startsWith(model.engagement+'/')&&model.work[id]&&canReadWork(model,model.work[id])).map(([id,x])=><div className="bench-item" key={id}><b>{x.title}</b><div className="row-actions"><button className="quiet" onClick={()=>open(x.id)}>Ажлын маягт нээх</button>{model.work[id]?.owner===model.person&&<button className="quiet" onClick={()=>begin(x)}>Энэ ажлын бүтцийг засах</button>}</div></div>)}
 </section></div>
 {t&&<section className="card pad bench-card space-top"><div className="section-heading"><div><span className="eyebrow">{t.id}</span><h2>Маягтын бүтэц</h2></div><button className="btn secondary" onClick={()=>setPreview(!preview)}>{preview?'Бүтэц засах':'Урьдчилан харах'}</button></div>
 <div className="field-grid"><label>Маягтын нэр<input value={t.title} onChange={e=>setT({...t,title:e.target.value})}/></label><label>Үе шат<select value={t.stage} onChange={e=>setT({...t,stage:Number(e.target.value)})}>{['Хүлээн авах','Төлөвлөлт','Гүйцэтгэл','Тайлагнал','Архив'].map((s,i)=><option key={s} value={i+1}>{s}</option>)}</select></label></div>
 {preview?t.fields.filter(f=>!f.when||answers[f.when.key]===f.when.value).map(f=><div className="bench-item" key={f.key}><b>{f.label}{f.required?' *':''}</b><TypedInput field={f} value={answers[f.key]??''} change={v=>setAnswers({...answers,[f.key]:v})} model={model}/></div>):t.fields.map((f,i)=><article className="bench-item" key={f.key}><div className="section-heading"><b>{i+1}. {f.source}</b><div className="row-actions"><button className="quiet" aria-label="Дээш зөөх" onClick={()=>swap(i,i-1)}><ArrowUp size={14}/></button><button className="quiet" aria-label="Доош зөөх" onClick={()=>swap(i,i+1)}><ArrowDown size={14}/></button><button className="quiet" aria-label="Асуулт хасах" onClick={()=>setT({...t,fields:t.fields.filter(x=>x.key!==f.key).map(x=>x.when?.key===f.key?{...x,when:undefined}:x)})}><Trash2 size={15}/></button></div></div>
 <div className="field-grid"><label>Асуулт<input value={f.label} onChange={e=>edit(i,{label:e.target.value})}/></label><label>Хариултын төрөл<select value={f.type} onChange={e=>edit(i,{type:e.target.value})}>{!(f.type in kind)&&<option value={f.type}>{f.type}</option>}{Object.entries(kind).map(([key,name])=><option value={key} key={key}>{name}</option>)}</select></label>
 <label>Бүлэг<input value={f.section??''} onChange={e=>edit(i,{section:e.target.value})}/></label><label>Компанийн утга холбох<select value={f.binding??''} onChange={e=>edit(i,{binding:(e.target.value||undefined) as Field['binding']})}><option value="">Гараар бөглөнө</option>{Object.entries(binding).map(([k,v])=><option value={k} key={k}>{v}</option>)}</select></label></div>
 {['select','multiselect'].includes(f.type)&&<label>Сонголтууд (; тусгаарлана)<input key={f.key+'-options'} defaultValue={f.options?.join('; ')} onChange={e=>edit(i,{options:e.target.value.split(';').map(x=>x.trim()).filter(Boolean)})}/></label>}
 <div className="field-grid"><label>Хамаарах эх асуулт<select value={f.when?.key??''} onChange={e=>edit(i,{when:e.target.value?{key:e.target.value,value:''}:undefined})}><option value="">Үргэлж харуулах</option>{t.fields.slice(0,i).filter(x=>!x.when).map(x=><option value={x.key} key={x.key}>{x.label||x.key}</option>)}</select></label>{f.when&&<label>Хүлээх хариулт<input value={f.when.value} onChange={e=>edit(i,{when:{key:f.when!.key,value:e.target.value}})}/></label>}</div>
 <label className="checkbox-line"><input type="checkbox" checked={!!f.required} onChange={e=>edit(i,{required:e.target.checked})}/>Заавал бөглөх</label></article>)}
 {!preview&&<button className="btn secondary" onClick={()=>setT({...t,fields:[...t.fields,{key:'q'+crypto.randomUUID(),label:'',type:'text',source:'Захиалгат'}]})}><Plus size={16}/>Асуулт нэмэх</button>}
 <label>Өөрчлөлтийн тайлбар<textarea value={note} onChange={e=>setNote(e.target.value)}/></label>
 <div className="row-actions"><button className="btn primary" onClick={()=>apply(t)}>Гэрээт ажилд хадгалах</button><button className="btn secondary" onClick={()=>change(m=>saveDraft(m,t,false,note))}>Ноорог хадгалах</button>{canAuthor&&<button className="btn secondary" onClick={()=>change(m=>saveDraft(m,t,true,note))}>Фирмийн хяналтад илгээх</button>}</div>
 </section>}</>;
}

export function AccessMatrix({model,change,items}:Props&{items:WorkItem[]}){
 const [id,setId]=useState(''),w=items.find(w=>w.id===id)??items[0],actor=personById(model.person);
 if(!w)return null;
 return <section className="card pad bench-card space-top"><h2>Ажлын эрхийн матриц</h2><p className="muted">Хоосон өөрчлөлт нь ажлын үндсэн томилгоог дагана. Шийдвэрийн болон арга зүйн эрх тусдаа.</p><label>Ажлын баримт<select value={w.id} onChange={e=>setId(e.target.value)}>{items.map(w=><option value={w.id} key={w.id}>{w.form} · {w.title}</option>)}</select></label><div className="table-scroll"><table><thead><tr><th>Хүн</th><th>Харах</th><th>Бэлтгэх</th><th>Хянах</th><th>Томилох</th></tr></thead><tbody>{PERSONS.filter(p=>inScope(model,p.id,w.engagement)&&p.role!=='quality').map(p=><tr key={p.id}><td>{p.name}</td>{(['view','prepare','review','assign'] as const).map(a=><td key={a}><select aria-label={p.name+' '+a} disabled={p.id===actor.id||(a==='assign'&&actor.role!=='partner')} value={String(model.bench?.access[w.id]?.[p.id]?.[a]??'default')} onChange={e=>change(m=>grant(m,m.work[w.id],actor,p,a,e.target.value==='default'?undefined:e.target.value==='true'))}><option value="default">Үндсэн</option><option value="true">Зөвшөөрөх</option><option value="false">Хаах</option></select></td>)}</tr>)}</tbody></table></div>
 <details><summary>Өөрчлөлтийн түүх</summary>{model.activity.filter(a=>a.engagement===w.engagement&&a.form===w.form&&/ → (default|allow|deny)/.test(a.text)).map(a=><p key={a.id} className="micro">{a.at} · {personById(a.by).name} · {a.text}</p>)}</details></section>;
}

export function Preferences({model,change}:Props){return <section className="card pad bench-card"><h2>Харагдац</h2><label>Өнгөний горим<select value={model.bench!.theme} onChange={e=>change(m=>{bench(m).theme=e.target.value as Theme})}><option value="system">Системийн тохиргоо</option><option value="light">Цайвар</option><option value="dark">Харанхуй</option></select></label></section>;}

export function EvidenceLibrary({model,change,show}:Props&{show:(id:string)=>void}){
 const [file,setFile]=useState<File>(),[source,setSource]=useState(''),[channel,setChannel]=useState('request'),[request,setRequest]=useState(''),[obtained,setObtained]=useState(today),[query,setQuery]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[replace,setReplace]=useState('');
 const scope=model.engagement,items=model.evidence.filter(e=>e.engagement===scope),filtered=items.filter(e=>[e.name,e.source,e.channel,e.request,e.status].join(' ').toLowerCase().includes(query.toLowerCase()));
 const locked=model.engagements.find(e=>e.id===scope)?.locked;
 async function add(){
  if(!file||!source.trim()||!obtained||locked)return;
  if(!/\.(pdf|jpe?g|png|webp|gif|docx?|xlsx?|csv)$/i.test(file.name)){setError('PDF, зураг, Word, Excel эсвэл CSV сонгоно уу.');return;}
  if(file.size>16_000_000){setError('Файл 16 MB-аас бага байх ёстой.');return;}
  setBusy(true);setError('');
  try{const id=crypto.randomUUID(),old=items.find(e=>e.id===replace);await retainFile(id,file);
   change(m=>{if(m.engagement!==scope||m.engagements.find(e=>e.id===scope)?.locked)throw Error('Гэрээт ажлын хүрээ өөрчлөгдсөн.');if(request&&!m.requests.some(r=>r.id===request&&r.engagement===scope&&issuedRequest(r)&&r.status!=='complete'))throw Error('Нээлттэй хүсэлт сонгоно уу.');m.evidence.push({id,engagement:scope,name:file.name,type:file.type||'FILE',obtained,source:source.trim(),status:'received',version:(old?.version??0)+1,replaces:old?.id,channel,request:request||undefined,anchor:'',text:'',specimen:false,original:true});});
   setFile(undefined);setReplace('');
  }catch(e){setError((e as Error).message)}finally{setBusy(false)}
 }
 return <div className="workbench-grid"><section className="card pad bench-card"><h2>Баримтын сан</h2><label>Хайх<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Файлын нэр, эх сурвалж…"/></label>{filtered.map(e=><div className="bench-item" key={e.id}><div className="section-heading"><b>{e.name} · v{e.version}</b><button className="quiet" onClick={()=>show(e.id)}>Нээх</button></div><p className="micro">{e.source} · {e.obtained} · {e.request||e.channel||'Демо'} · {e.status}</p>{e.assessment&&<p>{e.assessment}</p>}{e.replaces&&<button className="quiet" onClick={()=>show(e.replaces!)}>Өмнөх хувилбар</button>}</div>)}</section>
 <section className="card pad bench-card"><h2>Эх файл бүртгэх</h2><label>Файл<input type="file" disabled={locked||busy} accept=".pdf,image/*,.doc,.docx,.xls,.xlsx,.csv" onChange={e=>setFile(e.target.files?.[0])}/></label><label>Ирсэн суваг<select value={channel} onChange={e=>setChannel(e.target.value)}><option value="request">Үйлчлүүлэгчийн хүсэлт</option><option value="manual">И-мэйл / газар дээр авсан</option><option value="accounting">Нягтлан бодох бүртгэлийн экспорт</option><option value="third-party">Гуравдагч талын баталгаа</option></select></label>
 <div className="field-grid"><label>Нийлүүлсэн хүн, байгууллага<input value={source} onChange={e=>setSource(e.target.value)}/></label><label>Ирсэн огноо<input type="date" value={obtained} onChange={e=>setObtained(e.target.value)}/></label></div>
 <label>Холбогдох хүсэлт<select value={request} onChange={e=>setRequest(e.target.value)}><option value="">Холбоогүй</option>{model.requests.filter(r=>r.engagement===scope&&issuedRequest(r)&&r.status!=='complete').map(r=><option key={r.id} value={r.id}>{r.id} · {r.title}</option>)}</select></label>
 <label>Солих эх файл<select value={replace} onChange={e=>setReplace(e.target.value)}><option value="">Шинээр</option>{items.map(e=><option key={e.id} value={e.id}>{e.name} · v{e.version}</option>)}</select></label>
 <button className="btn primary" disabled={locked||busy||!file||!source.trim()||!obtained} onClick={add}><Upload size={15}/>Бүртгэх</button>{error&&<p className="text-red" role="alert">{error}</p>}</section></div>;
}

export function EvidencePreview({e,model,change,anchor}:Props&{e:Evidence;anchor?:string}){
 const [view,setView]=useState<{url?:string;text?:string;rows?:Grid[];error?:string;mime?:string}>({}),[sheet,setSheet]=useState(0),[reason,setReason]=useState(e.assessment??'');
 const linked=model.requests.some(r=>r.dispatch&&r.parts?.some(p=>p.evidence===e.id))||model.requests.some(r=>r.dispatch&&issuedRequest(r)&&r.id===e.request);
 const locked=model.engagements.find(x=>x.id===e.engagement)?.locked||linked;
 useEffect(()=>{let live=true,url='';setView({});setSheet(0);
  if(e.original)loadFile(e.id).then(async f=>{if(!live)return;if(!f)throw Error('Эх файл энэ хөтөч дээр олдсонгүй.');url=URL.createObjectURL(f);setView({url,mime:f.type});
   try{if(/\.xlsx$/i.test(e.name)){const rows=await readWorkbook(f);if(live){setView({url,rows});const target=rows.findIndex(r=>anchor?.startsWith(r.name+'!'));if(target>=0)setSheet(target);}}
    else if(/\.docx$/i.test(e.name)){const text=await readWord(f);if(live)setView({url,text});}
    else if(/\.csv$/i.test(e.name)){const text=(await f.text()).slice(0,25000);if(live)setView({url,text});}}
   catch(err){if(live)setView({url,error:(err as Error).message});}
  }).catch(err=>{if(live)setView({error:(err as Error).message});});
  return ()=>{live=false;if(url)URL.revokeObjectURL(url)};
 },[e.id,e.name,e.original,anchor]);
 const url=view.url??e.dataUrl,mime=view.mime??e.type,pg=anchor?.match(/(?:page|хуудас|^p\.?)[ .:]*([1-9]\d*)/i)?.[1],row=Number(anchor?.match(/![A-Z]*([1-9]\d*)/i)?.[1]??0),grid=view.rows?.[sheet],offset=row?Math.max(0,row-8):0;
 return <div className="bench-card"><h2>{e.name} · v{e.version}</h2><p className="muted">{e.source} · {e.obtained} · {anchor||e.anchor||'Байршил сонгоогүй'}</p>
 {url&&<a className="btn secondary" href={url} download={e.name}>Эх файлыг татах</a>}
 {view.error&&<p className="text-amber">{view.error}</p>}
 {url&&(/pdf/i.test(mime)||/\.pdf$/i.test(e.name))?<iframe title="PDF баримт" src={url+(pg?'#page='+pg:'')}/>:url&&/^image\/(png|jpeg|gif|webp)/.test(mime)?<img className="bench-preview-image" src={url} alt={e.name}/>:grid?<><label>Excel хуудас<select value={sheet} onChange={e=>setSheet(Number(e.target.value))}>{view.rows!.map((g,i)=><option value={i} key={g.name}>{g.name}</option>)}</select></label><div className="table-scroll"><table><tbody>{grid.rows.slice(offset,offset+32).map((r,i)=><tr className={offset+i+1===row?'selected-row':''} key={offset+i}><th>{offset+i+1}</th>{r.slice(0,16).map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table></div></>:view.text?<pre className="bench-preview-text">{view.text}</pre>:<p className="micro">{e.text||'Энэ төрөлд урьдчилан харах боломжгүй. Эх файлыг татаж нээнэ.'}</p>}
 {linked&&<p className="micro">Үнэлгээг холбогдох хүсэлтийн бүртгэлээс хийнэ.</p>}
 {personById(model.person).role!=='quality'&&!locked&&<><label>Үнэлгээний үндэслэл<input value={reason} onChange={e=>setReason(e.target.value)}/></label><div className="row-actions">{(['accepted','rejected'] as const).map(s=><button className="btn secondary" key={s} disabled={!reason.trim()} onClick={()=>change(m=>{const target=m.evidence.find(x=>x.id===e.id&&x.engagement===m.engagement);if(!target||m.engagements.find(x=>x.id===m.engagement)?.locked)throw Error('Баримтыг өөрчлөх боломжгүй.');target.status=s;target.assessment=reason.trim();})}>{s==='accepted'?'Хүлээн авах':'Буцаах'}</button>)}</div></>}
 </div>;
}
