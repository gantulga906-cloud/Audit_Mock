'use client';

import {useEffect,useId,useRef,useState,type FormEvent} from 'react';
import {TypedInput} from './workbench-panels';
import {MethodologyControls,MethodologyFields} from './pilot-methodology';
import {readWorkbook} from '@/lib/office-preview';
import {formKinds,procedureOutcomes,sharedBindings,isNotApplicableAnswer,type LibraryView,type PaperForm,type FormAdoptionPreview,type FormDraft} from '@/lib/pilot-forms';
import {readPilotResponse} from '@/lib/pilot-client';
import {pilotScope as scope,type PilotRole} from '@/lib/pilot-registers';
import {templateFromGrid,visibleField,tableColumns,type Field,type Grid,type Template} from '@/lib/workbench';
import type {Evidence} from '@/lib/workspace';
import type {PilotAction} from './pilot-registers';

type NamedForm={id:string;title:string};
type Answers=Record<string,string>;
const actorName={reviewer:'Ахлах хянагч',preparer:'Бэлтгэгч',partner:'Партнер'};
const newField=():Field=>({key:'q'+crypto.randomUUID(),label:'',type:'text',source:'Захиалгат'});
const editableColumns=(field:Field):NonNullable<Field['columns']>=>field.columns??tableColumns;
const newId=()=> 'F-'+crypto.randomUUID().slice(0,8).toUpperCase();
const blank=():Template=>({id:newId(),title:'',stage:1,fields:[newField()],family:'questionnaire',sheet:'Арга зүйн сан'});

export function NativeFields({template,answers,set,disabled,evidence,shared,linked,owned}:{
 template:Template;answers:Answers;set:(key:string,value:string)=>void;disabled?:boolean;
 evidence?:Evidence[];shared?:PaperForm['shared'];linked?:PaperForm['linked'];owned?:PaperForm['owned'];
}){
 const prefix=useId(),visible=template.fields.filter(f=>visibleField(f,answers));
 const groups=[...new Set(visible.map(f=>f.section||'Ажлын агуулга'))];
 const available=evidence?.filter(e=>e.status==='accepted');
 const render=(f:Field)=><TypedInput field={f} value={answers[f.key]??''} change={v=>set(f.key,v)}
  disabled={disabled} evidence={available} linkedValue={f.binding&&shared?.[f.binding]}/>;
 return <>
  {!!template.clauses?.length&&<details className="feature-detail"><summary>Эх маягтын тогтмол заалтууд</summary>
   {template.clauses.map((clause,i)=><p key={i}>{clause.text??clause.label} <small>{clause.source}</small></p>)}
  </details>}
  {groups.length>1&&<nav className="ew-section-index" aria-label="Маягтын бүлгүүд">{groups.map(group=>{const first=visible.find(f=>(f.section||'Ажлын агуулга')===group)!;return <button key={group} title={group} type="button" onClick={()=>document.getElementById(prefix+first.key)?.scrollIntoView({block:'start',behavior:'smooth'})}>{group}</button>;})}</nav>}
  {visible.map(f=>{
   const outcomes=procedureOutcomes(f);
   return <section className="bench-item ew-native-field" data-native-field={f.key} id={prefix+f.key} key={f.key}>
    <b>{f.label}{f.required?' *':''}</b><p className="micro">{f.section&&f.section+' · '}{template.sheet}!{f.source}</p>
    {f.instruction&&<details><summary>Заавар</summary><p className="micro">{f.instruction}</p></details>}
    {owned&&Object.hasOwn(owned,f.key)?<div className="linked-value">{owned[f.key]} <small>Материаллаг байдлын хадгалсан сонголтоос</small></div>:f.decision?<div className="linked-value">{linked?.[f.key]||'Шийдвэр хүлээгдэж байна'} <small>Хүлээн авах шийдвэрийн бүртгэлээс</small></div>:f.type==='procedure'?<div className="field-grid">
     <div><span>Гүйцэтгэл</span>{render({...f,type:'textarea',label:'Гүйцэтгэл · '+f.source})}</div>
     {!!outcomes.length&&<div><span>Үр дүн</span>{render({...f,key:f.key+'.outcome',type:'select',label:'Үр дүн · '+f.source,options:outcomes})}</div>}
     <div><span>Үнэлсэн эх баримт</span>{render({...f,key:f.key+'.file',type:'evidence',label:'Үнэлсэн эх баримт · '+f.source})}</div>
     {f.columns?.map(c=><div key={c.key}><span>{c.label}</span>{render({...c,key:f.key+'.'+c.key,label:c.label+' · '+f.source,source:c.source??f.source})}</div>)}
    </div>:render(f)}
    {['yesno','select'].includes(f.type)&&isNotApplicableAnswer(answers[f.key])&&
     <label>Хамаарахгүй үндэслэл<textarea value={answers[f.key+'.reason']??''} disabled={disabled} onChange={e=>set(f.key+'.reason',e.target.value)}/></label>}
   </section>;
  })}
 </>;
}

export function AdoptPilotForm({forms,library,pins,run,engagementId}:{
 forms:NamedForm[];library:LibraryView;pins:Record<string,number>;run:PilotAction;engagementId:string;
}){
 const [id,setId]=useState(''),[version,setVersion]=useState('source');
 const [preview,setPreview]=useState<FormAdoptionPreview|null>(null),[ack,setAck]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const request=useRef(0);
 const reset=()=>{request.current++;setPreview(null);setAck(false);setError('');setBusy(false);};
 useEffect(()=>{request.current++;setPreview(null);setAck(false);setError('');setBusy(false);},[engagementId]);
 const inspect=async()=>{
  const serial=++request.current;setBusy(true);setError('');
  try{const result=await readPilotResponse<FormAdoptionPreview>(await fetch('/api/pilot/form-adoption-preview'+scope(engagementId)+'&form='+encodeURIComponent(id)+'&version='+encodeURIComponent(version),{cache:'no-store'}));
   if(serial===request.current){setPreview(result);setAck(false);}
  }catch(e){if(serial===request.current){setPreview(null);setError((e as Error).message);}}
  finally{if(serial===request.current)setBusy(false);}
 };
 const reasons:Record<string,string>={'removed-field':'Талбарыг хассан','changed-type':'Хариултын төрөл өөрчлөгдсөн','invalid-value':'Шинэ сонголттой тохирохгүй','removed-column':'Баганыг хассан','changed-column-type':'Баганын төрөл өөрчлөгдсөн','invalid-cell':'Шинэ баганатай тохирохгүй','not-applicable':'Шинэ нөхцөлд хамаарахгүй'};
 const editions=library.releases.filter(r=>r.id===id),published=editions.at(-1);
 const builtIn=forms.some(f=>f.id===id);
 const catalogue=Array.from(new Map([...forms,...library.releases.filter(r=>r.id.startsWith('F-'))].map(f=>[f.id,f])).values());
 return <details className="card pad bench-card">
  <summary>Эх маягт ба баталсан хувилбар холбох</summary>
  <form className="feature-form" data-form-adoption onSubmit={e=>{e.preventDefault();if(!preview){void inspect();return;}if(preview.sameVersion||preview.requiresReview&&!ack)return;setBusy(true);void run('form-use',{form:id,version,adoptionReview:preview.digest,adoptionAck:ack?'reviewed':''}).finally(reset);}}>
   <label>Маягт<select name="form" value={id} required onChange={e=>{
    reset();setId(e.target.value);const v=library.releases.filter(r=>r.id===e.target.value).at(-1);setVersion(v?String(v.number):'source');
   }}><option value="">Сонгох</option>{catalogue.map(f=><option key={f.id} value={f.id}>{f.id} · {f.title}</option>)}</select></label>
   {id&&<label>Хувилбар<select name="version" value={version} onChange={e=>{reset();setVersion(e.target.value);}}>
    {builtIn&&<option value="source">Эх маягт</option>}{editions.map(r=><option key={r.number} value={r.number}>Баталсан v{r.number} · {r.methodology?.edition??''}</option>)}
   </select></label>}
   {pins[id]!==undefined&&<p className="micro">Ажилд холбосон {pins[id]===0?'эх маягт':'v'+pins[id]}</p>}
   {error&&<p className="callout amber" role="alert">{error}</p>}
   {preview&&<section className="feature-fields" data-adoption-preview>
    <h3>{preview.sameVersion?'Яг энэ хувилбар холбогдсон':'Шинэ хувилбарын нөлөө'}</h3>
    <p>{preview.to.title} · {preview.from?'v'+preview.from.number:'Өмнөх холболтгүй'} → v{preview.to.number} · {preview.retainedAnswers} хариултыг үргэлжлүүлэн ашиглана.</p>
    {preview.reopensReview&&<p className="callout amber">Хянасан эсвэл илгээсэн ажил шинэ хувилбараар дахин хяналт шаардана.</p>}
    {preview.changes.length>0&&<details><summary>Талбарын өөрчлөлт · {preview.changes.length}</summary>{preview.changes.map(c=><p key={c.key}>{c.change==='added'?'Нэмсэн':c.change==='removed'?'Хассан':'Өөрчилсөн'} · {c.label} · {c.source}</p>)}</details>}
    {preview.losses.length>0&&<details open><summary>Одоогийн хувилбарт шилжүүлэхгүй хариулт · {preview.losses.length}</summary>{preview.losses.map((item,i)=><div className="bench-item" key={i}><b>{item.label}{item.row&&' · Мөр '+(item.rowLabel??item.row)}{item.column&&' · Багана '+(item.columnLabel??item.column)}</b><p>{reasons[item.reason]??item.reason}</p><p>{item.displayValue??item.value}</p></div>)}</details>}
    {preview.detachedEvidence.map(file=><p key={file.id}>Одоогийн ажлаас салгах холбоос · {file.name}</p>)}
    {preview.requiresReview&&<><p>Өмнөх хариулт, гарын үсэг ба эх файлууд түүхэнд хадгалагдана. Шинэ ажлын хариулт болон холбоосын өөрчлөлтийг хянана уу.</p><label><input name="adoptionAck" type="checkbox" checked={ack} onChange={e=>setAck(e.target.checked)}/> Шилжүүлэхгүй хариулт ба холбоосыг хянаж, шинэ хувилбарыг сонголоо</label></>}
    <p className="micro">Хуучин {preview.from?.digest.slice(0,12)??'—'} · Шинэ {preview.to.digest.slice(0,12)}</p>
    <button type="button" className="btn secondary" disabled={busy} onClick={()=>void inspect()}>Өөрчлөлтийг дахин шалгах</button>
   </section>}
   <button className="btn primary" disabled={!id||busy||!!preview&&(preview.sameVersion||preview.requiresReview&&!ack)}>{busy?'Шалгаж байна…':preview?'Хувилбарыг энэ ажилд холбох':'Хувилбарын өөрчлөлтийг шалгах'}</button>
  </form>
 </details>;
}

function NoteAction({run,action,id,label,draft,managed=false}:{run:PilotAction;action:string;id:string;label:string;draft?:FormDraft;managed?:boolean}){
 return <form className="feature-form" data-action={action} onSubmit={e=>{
  e.preventDefault();const form=e.currentTarget,note=String(new FormData(form).get('note'));
  const data=new FormData(form);void run(action,{form:id,note,...(managed&&{expectedDraftDigest:draft?.draftDigest??'',reviewDigest:draft?.review?.digest??'',professionalBasis:String(data.get('professionalBasis')??''),validationEvidence:String(data.get('validationEvidence')??''),conclusion:String(data.get('conclusion')??'')})}).then(ok=>{if(ok)form.reset();});
 }}>
  {managed&&action==='template-publish'&&<>{[['professionalBasis','Бодит мэргэжлийн үндэс ба яг өөрчлөлт'],['validationEvidence','Гүйцэтгэсэн хэвийн / нөхцөлт / буруу жишээний шалгалт'],['conclusion','Хэрэглэх хүрээ ба хяналтын дүгнэлт']].map(([key,text])=><label key={key}>{text}<textarea name={key} required/></label>)}</>}<label>Үндэслэл<input name="note" required/></label><button className="btn secondary">{label}</button>
 </form>;
}

export function PilotFormLibrary({role,forms,library,run,onError,onDraftChange}:{
 role:PilotRole;forms:NamedForm[];library:LibraryView;run:PilotAction;onError:(message:string)=>void;onDraftChange?:(active:boolean)=>void;
}){
 const [id,setId]=useState(''),[editor,setEditor]=useState<Template|null>(null),[preview,setPreview]=useState(false);
 const [answers,setAnswers]=useState<Answers>({}),[sheets,setSheets]=useState<Grid[]>([]);
 useEffect(()=>{onDraftChange?.(!!editor);},[editor,onDraftChange]);
 const catalogue=[...forms,...library.releases.filter(r=>!forms.some(f=>f.id===r.id))];
 const begin=(t:Template)=>{setEditor(t);setAnswers({});setPreview(false);};
 async function load(copy:boolean){
  try{
   const result=await fetch('/api/pilot/template/'+encodeURIComponent(id)+scope(null));
   const body=await result.json();
   if(!result.ok)throw Error(body.error);
   if(copy){
    // A copy is a new questionnaire. Procedure references stay on the source form.
    begin({...body,id:newId(),title:body.title+' · Хуулбар',fields:body.fields.map((f:Field)=>f.type==='procedure'?{...f,type:'textarea',columns:undefined}:f)});
   }else begin(body);
  }catch(e){onError((e as Error).message);}
 }
 function edit(key:string,patch:Partial<Field>){
  setEditor(t=>t&&({...t,fields:t.fields.map(f=>f.key===key?{...f,...patch}:f)}));
 }
 function swap(i:number,offset:number){
  setEditor(t=>{
   if(!t||i+offset<0||i+offset>=t.fields.length)return t;
   const fields=[...t.fields];[fields[i],fields[i+offset]]=[fields[i+offset],fields[i]];return {...t,fields};
  });
 }
 function grant(e:FormEvent<HTMLFormElement>){
  e.preventDefault();const form=new FormData(e.currentTarget);
  void run('template-grant',{form:id,actor:String(form.get('actor')),access:String(form.get('access')),note:String(form.get('note'))});
 }
 return <section className="card pad bench-card">
  <div className="section-heading"><div><h2>Маягтын сан ба бүтэц</h2><p>Ноорог · хяналт · нийтлэл · гэрээт ажилд сонгож ашиглах</p></div></div>
  <MethodologyControls library={library} role={role} form={id} run={run} onError={onError}/>
  <label>Маягт<select name="library-form" value={id} onChange={e=>setId(e.target.value)}>
   <option value="">Сонгох</option>{catalogue.map(f=><option key={f.id} value={f.id}>{f.id} · {f.title}</option>)}
  </select></label>
  <div className="row-actions space-top">
   {library.editable.includes(id)&&<button type="button" className="btn secondary" onClick={()=>void load(false)}>Сонгосон маягтын ноорог нээх</button>}
   {role==='reviewer'&&<>
    <button type="button" className="btn secondary" onClick={()=>begin(blank())}>Шинэ маягт</button>
    <button type="button" className="btn secondary" disabled={!id} onClick={()=>void load(true)}>Сонгосноос хуулбарлах</button>
    <label>Excel асуултын жагсаалт<input type="file" aria-label="Маягтын Excel импорт" accept=".xlsx" onChange={async e=>{
     const file=e.target.files?.[0];e.currentTarget.value='';if(!file)return;
     try{setSheets(await readWorkbook(file));}catch(err){onError((err as Error).message);}
    }}/></label>
   </>}
  </div>
  {sheets.length>0&&<div className="bench-item"><p>Excel багана: Question · Type · Choices · Section · Required</p>
   {sheets.map(s=><button type="button" key={s.name} className="quiet" onClick={()=>{try{begin(templateFromGrid(s));setSheets([]);}catch(e){onError((e as Error).message);}}}>{s.name} · {s.rows.length} мөр</button>)}
  </div>}
  {role==='partner'&&id&&<form className="feature-form" onSubmit={grant}>
   <p>Энэ маягтын зохиогчийн эрх · {(library.grants[id]??[]).map(r=>actorName[r as PilotRole]).join(', ')||'Олгоогүй'}</p>
   <div className="field-grid"><label>Дүр<select name="actor"><option value="reviewer">{actorName.reviewer}</option><option value="preparer">{actorName.preparer}</option></select></label>
    <label>Эрх<select name="access"><option value="grant">Олгох</option><option value="revoke">Цуцлах</option></select></label></div>
   <label>Үндэслэл<input name="note" required/></label><button className="btn secondary">Зөвхөн энэ маягтын эрхийг хадгалах</button>
  </form>}
  {library.drafts.map(d=><details data-methodology-draft={d.body.id} key={d.body.id} className="feature-detail">
   <summary>{d.body.title} · {d.submitted?'Хяналтад':'Ноорог'}</summary>
   {d.note&&<p>{d.note}</p>}{d.reviewError&&<p role="alert">{d.reviewError}</p>}{d.review&&<details data-release-comparison><summary>Яг нийтлэлийн өөрчлөлт · {d.review.changes.length}</summary><p className="micro">Агуулгын SHA-256 {d.review.contentSha256}</p>{d.review.changes.map((c,i)=><p key={i}>{c.change} · {c.label}</p>)}</details>}
   {d.body.fields.map(f=><p className="micro" key={f.key}>{f.label} · {formKinds[f.type]} {f.options?.join(' / ')}</p>)}
   {d.by===role&&!d.submitted&&library.editable.includes(d.body.id)&&<>
    <button type="button" className="quiet" onClick={()=>begin(d.body)}>Засах</button>
    <NoteAction run={run} action="template-submit" draft={d} managed={library.managed} id={d.body.id} label="Хяналтад илгээх"/>
   </>}
   {(library.managed?library.canPublish:role==='partner')&&d.submitted&&d.by!==role&&<>
    <NoteAction run={run} action="template-publish" draft={d} managed={library.managed} id={d.body.id} label="Баталж нийтлэх"/>
    <NoteAction run={run} action="template-return" draft={d} managed={library.managed} id={d.body.id} label="Засварт буцаах"/>
   </>}
  </details>)}
  {library.releases.map(r=><p key={r.id} className="micro">{r.title} · {r.id} · {r.status&&r.status!=='approved'?r.status:'Баталсан'} v{r.number} · {r.at.slice(0,10)} · {r.note}</p>)}
  {editor&&<div className="bench-item space-top" data-template-editor>
   <div className="section-heading"><h3>{editor.id} · Ноорог</h3><button type="button" className="btn secondary" onClick={()=>setPreview(!preview)}>{preview?'Бүтэц засах':'Урьдчилан харах'}</button></div>
   <>{library.managed&&<MethodologyFields template={editor} library={library} change={methodology=>setEditor({...editor,methodology})}/>}</><label>Маягтын нэр<input value={editor.title} onChange={e=>setEditor({...editor,title:e.target.value})}/></label>
   {editor.id.startsWith('F-')&&<label>Үе шат<select value={editor.stage} onChange={e=>setEditor({...editor,stage:Number(e.target.value)})}>
    {['Хүлээн авах','Төлөвлөлт','Гүйцэтгэл','Тайлагнал','Архив'].map((s,i)=><option key={s} value={i+1}>{s}</option>)}</select></label>}
   {!!editor.clauses?.length&&!preview&&<fieldset className="feature-fields" data-template-clauses><legend>Тогтмол заалт ба эхийн гарчгууд</legend>{editor.clauses.map((c,i)=><label key={i}>{c.source}<textarea value={c.text??c.label??''} onChange={e=>setEditor({...editor,clauses:editor.clauses?.map((x,n)=>n===i?{...x,text:e.target.value}:x)})}/></label>)}</fieldset>}
   {preview?<NativeFields template={editor} answers={answers} set={(k,v)=>setAnswers({...answers,[k]:v})}/>:editor.fields.map((f,i)=><article className="bench-item" data-template-field={f.key} key={f.key}>
    <div className="row-actions"><b>{i+1}. {f.source}</b><button type="button" className="quiet" onClick={()=>swap(i,-1)}>Дээш</button>
     <button type="button" className="quiet" onClick={()=>swap(i,1)}>Доош</button>
     <button type="button" className="quiet" onClick={()=>setEditor({...editor,fields:editor.fields.filter(x=>x.key!==f.key).map(x=>x.when?.key===f.key?{...x,when:undefined}:x)})}>Хасах</button>
    </div>
    <label>Асуулт<input value={f.label} onChange={e=>edit(f.key,{label:e.target.value})}/></label>
    <div className="field-grid">
     <label>Төрөл<select value={f.type} disabled={!!f.decision||/^r10_(name|legalForm|registration)$/.test(f.key)||editor.id==='1.1.1'&&['r12','r13'].includes(f.key)} onChange={e=>edit(f.key,{type:e.target.value,binding:undefined})}>
      {Object.entries(formKinds).filter(([k])=>k!=='procedure'||f.type==='procedure').map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
     <label>Бүлэг<input value={f.section??''} onChange={e=>edit(f.key,{section:e.target.value})}/></label>
     {['text','textarea'].includes(f.type)&&<label>Компанийн утга<select value={f.binding??''} onChange={e=>edit(f.key,{binding:(e.target.value||undefined) as Field['binding']})}>
      <option value="">Гараар бөглөнө</option>{Object.entries(sharedBindings).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>}
    </div>
    {['select','multiselect'].includes(f.type)&&<label>Сонголтууд (; тусгаарлана)<input defaultValue={f.options?.join('; ')} onChange={e=>edit(f.key,{options:e.target.value.split(';').map(x=>x.trim()).filter(Boolean)})}/></label>}
    {f.type==='table'&&<fieldset className="feature-fields" data-table-columns><legend>Давтагдах хүснэгтийн баганууд</legend>
     {editableColumns(f).map((column,index)=>{
      const columns=editableColumns(f),update=(patch:Partial<typeof column>)=>edit(f.key,{columns:columns.map((c,i)=>i===index?{...c,...patch}:c)});
      return <div key={column.key} className="bench-item"><div className="field-grid">
       <label>Баганын нэр<input value={column.label} onChange={e=>update({label:e.target.value})}/></label>
       <label>Баганын төрөл<select value={column.type} onChange={e=>update({type:e.target.value})}>{Object.entries(formKinds).filter(([type])=>!['table','procedure'].includes(type)).map(([type,label])=><option value={type} key={type}>{label}</option>)}</select></label>
       {['select','multiselect'].includes(column.type)&&<label>Баганын сонголтууд (; тусгаарлана)<input value={column.options?.join('; ')??''} onChange={e=>update({options:e.target.value.split(';').map(v=>v.trim()).filter(Boolean)})}/></label>}
      </div><button type="button" className="quiet" disabled={columns.length<=1} onClick={()=>edit(f.key,{columns:columns.filter((_,i)=>i!==index)})}>Багана хасах</button></div>;
     })}
     <button type="button" className="btn secondary" disabled={(f.columns??tableColumns).length>=30} onClick={()=>edit(f.key,{columns:[...(f.columns??tableColumns),{key:'c'+crypto.randomUUID().replaceAll('-',''),label:'',type:'text'}]})}>Багана нэмэх</button>
    </fieldset>}
    <label>Хамаарах эх асуулт<select value={f.when?.key??''} onChange={e=>edit(f.key,{when:e.target.value?{key:e.target.value,value:''}:undefined})}>
     <option value="">Үргэлж харуулах</option>{editor.fields.filter(x=>x.key!==f.key&&!x.when&&!x.binding&&!x.decision&&['text','textarea','select','yesno','date','number'].includes(x.type)).map(x=><option value={x.key} key={x.key}>{x.label||x.key}</option>)}</select></label>
    {f.when&&<label>Эх асуултын хариулт<input value={f.when.value} onChange={e=>edit(f.key,{when:{key:f.when!.key,value:e.target.value}})}/></label>}
    <label className="checkbox-line"><input type="checkbox" checked={!!f.required} onChange={e=>edit(f.key,{required:e.target.checked})}/>Заавал бөглөх</label>
   </article>)}
   <div className="row-actions space-top">
    {!preview&&<button type="button" className="btn secondary" onClick={()=>setEditor({...editor,fields:[...editor.fields,newField()]})}>Асуулт нэмэх</button>}
    <button type="button" className="btn primary" onClick={()=>void run('template-save',{form:editor.id,body:JSON.stringify(editor),expectedDraftDigest:library.drafts.find(d=>d.body.id===editor.id)?.draftDigest??''}).then(ok=>{if(ok)setEditor(null);})}>Ноорог хадгалах</button>
    <button type="button" className="btn secondary" onClick={()=>setEditor(null)}>Болих</button>
   </div>
  </div>}
 </section>;
}
