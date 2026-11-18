import {createHash} from 'node:crypto';
import {workKey} from '../src/lib/workspace.ts';
import {fieldAnswers} from '../src/lib/pilot-forms.ts';
import {visibleField,sharedForWork,tableColumns} from '../src/lib/workbench.ts';
import {PilotError,input} from './pilot-workflow.mjs';
const hash=v=>createHash('sha256').update(typeof v==='string'||v instanceof Uint8Array?v:JSON.stringify(v)).digest('hex');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const fail=(s,status=409)=>{throw new PilotError(status,s);};
function renderAreaWork(value){
 if(!value)return '';let p;try{p=JSON.parse(value);}catch{return '<p class="missing">G10 work record could not be read. Preserve the original and investigate.</p>';}
 const paragraph=s=>'<p>'+escape(s)+'</p>';
 return '<section><h3>G10 · '+escape(p.definition.id+' · '+p.definition.title)+'</h3>'+paragraph('v'+p.version+' · '+p.status+' · preparer '+p.by)+paragraph(p.method+' · '+p.edition+' · '+p.mode)+paragraph(p.methodWork)+paragraph('Selected source procedures: '+p.procedures.join(', '))+
  p.definition.source.map(s=>paragraph(s.source+' · '+s.locator)).join('')+paragraph(p.definition.limit)+
  p.inputs.map(i=>'<h4>'+escape(p.definition.inputs.find(d=>d.key===i.key)?.label??i.key)+'</h4>'+paragraph(i.locator+' · '+i.work)+'<small>'+escape(i.evidence)+'</small>').join('')+
  p.judgments.map(j=>'<h4>'+escape(j.key+' · '+j.result)+'</h4>'+paragraph(j.work)+paragraph(j.reason)).join('')+
  p.matters.map(m=>'<h4>'+escape(m.title)+'</h4>'+paragraph(m.kind+' · '+m.difference+' · next owner '+m.owner)+paragraph(m.reason)).join('')+
  (p.review?paragraph('Independent reviewer '+p.review.by+' · '+p.review.at+' · '+p.review.result+' · '+p.review.reason):paragraph('Independent review remains open.'))+'</section>';
}
function scope(m,files){if(!m.engagements[0])fail('Гэрээт ажил сонгоно.');if(files.archive.isSealed(m))fail('Түгжсэн ажлыг зөвшөөрсөн архивын багц ба хүрээгээр экспортлоно.',403);}
export function searchWorkpapers(m,role,query,files){
 scope(m,files);if(typeof query!=='string'||query.length>200)fail('Хайлтын утгыг шалгана.',400);const q=query.trim().toLowerCase();
 return Object.values(m.work).filter(w=>w.engagement===m.engagement&&(!q||[w.form,w.title,...Object.values(w.values)].join(' ').toLowerCase().includes(q))).slice(0,200).map(w=>({form:w.form,title:w.title??w.form,version:w.version,status:w.status,native:!!w.values.templateDigest}));
}
export function workpaperExportPreview(m,role,fields,files){
 scope(m,files);const purpose=input(fields,'purpose',500),recipient=input(fields,'recipient',300);let selection;try{selection=JSON.parse(fields.selection);}catch{fail('Экспортын сонголтыг шалгана.',400);}
 if(!Array.isArray(selection)||!selection.length||selection.length>70||new Set(selection.map(s=>s.form+'/'+(s.historyAt??'current'))).size!==selection.length)fail('1–70 ялгаатай бодит ажлын хувилбар сонгоно.',400);
 const papers=selection.map(selected=>{
  const current=m.work[workKey(m.engagement,selected.form)];if(!current)fail('Сонгосон ажил олдсонгүй.',404);
  const h=selected.historyAt?current.history.find(h=>h.at===selected.historyAt&&h.version===Number(selected.version)):null;
  if(selected.historyAt&&!h||!h&&Number(selected.version)!==current.version)fail('Ажлын сонгосон хувилбар өөрчлөгдсөн.');
  const values=h?.values??current.values,evidence=h?.evidence??current.evidence,digest=values.templateDigest;
  let template=digest?files.template(digest):null,templateState=digest?(template?'available':'missing'):'not-native';
  if(template&&hash(template)!==digest){template=null;templateState='corrupt';}
  const references=evidence.map(id=>{
   const meta=m.evidence.find(e=>e.id===id&&e.engagement===m.engagement);if(!meta)return {id,state:'missing',name:'Холбоотой эх олдсонгүй'};
   let raw;try{raw=files.read(id);}catch{return {id,name:meta.name,state:'unavailable',version:meta.version};}
   return {id,name:meta.name,version:meta.version,status:meta.status,sha256:raw?.sha256??null,state:!raw?.bytes?'missing':hash(raw.bytes)!==raw.sha256?'corrupt':'available',preview:'Original download available where permitted; format readability is not established by an export listing'};
  });
  const preparation=values['work.preparation']?JSON.parse(values['work.preparation']):null,review=values['work.review']?JSON.parse(values['work.review']):null;
  const answers=fieldAnswers(values),shared=Object.fromEntries(Object.entries(sharedForWork(m,current)).map(([k,v])=>[k,h?values['shared.'+k]??'':v]));
  const warnings=[...(['missing','corrupt'].includes(templateState)?['Яг маягтын эх '+templateState]:[]),...references.filter(r=>r.state!=='available').map(r=>r.id+' · '+r.state)];
  return {form:current.form,title:template?.title??current.title??current.form,version:h?.version??current.version,historyAt:h?.at??null,status:h?'historical':current.status,actor:preparation?.by??h?.by??current.owner,preparedAt:preparation?.at??null,reviewer:review?.by??current.reviewer,reviewedVersion:review?.version===(h?.version??current.version)?review.version:h?null:current.reviewedVersion??null,reviewedAt:review?.at??null,sourceDigest:digest??null,templateState,source:template?{sheet:template.sheet,edition:template.methodology?.edition??'Frozen source catalogue / exact pinned contract',provenance:template.provenance??null}:null,answers,shared,values,evidence:references,warnings,template};
 });
 const manifest=papers.map(({template,values,answers,shared,...p})=>({...p,answerSha256:hash({values,answers,shared}),fieldCount:template?.fields.length??0,limitations:'Engineering export and completeness diagnostics do not perform professional review or approve audit work'}));
 const summary={engagement:m.engagement,actor:role,purpose,recipient,papers:manifest,complete:papers.every(p=>!p.warnings.length),operationalOnly:true};
 return {...summary,digest:hash(summary),_papers:papers};
}
function valueText(field,value,references){
 if(value===undefined||value==='')return '<span class="missing">Бөглөөгүй</span>';
 if(field.type==='evidence'){const ref=references.find(r=>r.id===value);return escape(ref?ref.name+' · '+ref.id+' · '+ref.state:'Unavailable/restricted reference');}
 if(field.type==='table'){
  let rows;try{rows=JSON.parse(value);}catch{return '<p>Хүснэгтийн бүтэц боломжгүй</p>';}
  const columns=field.columns?.length?field.columns:tableColumns;
  return '<table><thead><tr><th>Мөрийн ID</th>'+columns.map(c=>'<th>'+escape(c.label)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr><td>'+escape(r.id)+'</td>'+columns.map(c=>'<td>'+valueText(c,r.values[c.key],references)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
 }
 if(field.type==='multiselect'){try{return escape(JSON.parse(value).join('; '));}catch{return '<span>Сонголтын бүтэц боломжгүй</span>';}}
 return escape(value);
}
export function renderWorkpaperExport(preview){
 const {digest,purpose,recipient,_papers:papers}=preview;
 const html=['<!doctype html><html lang="mn"><meta charset="utf-8"><title>Ажлын сонгосон хувилбарууд</title><style>body{font:15px system-ui;max-width:75rem;margin:2rem auto;padding:1rem;color:#152139}p,dd{white-space:pre-wrap;overflow-wrap:anywhere}table{border-collapse:collapse;width:100%;margin:1rem 0}td,th{border:1px solid #ccd2dc;padding:.4rem;text-align:left;vertical-align:top}.missing{color:#65551b}.paper{break-before:page}small{color:#536077}@media print{body{margin:0;max-width:none}}</style>',
  '<h1>Сонгосон ажлын уншигдах багц</h1><p>'+escape(purpose)+' · '+escape(recipient)+'</p><p>Багцын яг таних хэш · '+digest+'</p><p>Энэ экспорт нь аудитын ажлыг бэлтгэсэн / хянасан гэж шинээр батлахгүй.</p>',
  '<nav><ol>'+papers.map((p,i)=>'<li><a href="#paper-'+i+'">'+escape(p.form+' · '+p.title+' · v'+p.version)+'</a></li>').join('')+'</ol></nav>',
  ...papers.map((p,i)=>'<section class="paper" id="paper-'+i+'"><h2>'+escape(p.form+' · '+p.title)+'</h2><p>'+escape('v'+p.version+' · '+p.status+' · '+p.actor+' · Хянагч '+p.reviewer+(p.historyAt?' · '+p.historyAt:''))+'</p><p>'+escape('Яг маягт '+(p.sourceDigest??'Native template not selected')+' · '+(p.source?.edition??'External/summary representation'))+'</p>'+p.warnings.map(w=>'<p class="missing">'+escape(w)+'</p>').join('')+
   (p.template?(p.template.clauses??[]).map(c=>'<p>'+escape(c.text??c.label)+' <small>'+escape(c.source)+'</small></p>').join('')+p.template.fields.filter(f=>visibleField(f,p.answers)).map(f=>'<article><h3>'+escape(f.label)+'</h3><small>'+escape(p.template.sheet+'!'+f.source)+'</small>'+(f.instruction?'<p>'+escape(f.instruction)+'</p>':'')+'<p>'+valueText(f,f.binding?p.shared[f.binding]:f.decision?p.values['linked.'+f.key]:p.answers[f.key],p.evidence)+'</p>'+(f.type==='procedure'?Object.entries(p.answers).filter(([k])=>k.startsWith(f.key+'.')).map(([k,v])=>'<p>'+escape(k)+' · '+escape(v)+'</p>').join(''):'')+(p.answers[f.key+'.reason']?'<p>'+escape(p.answers[f.key+'.reason'])+'</p>':'')+'</article>').join(''):'')+
   renderAreaWork(p.values['g10.card'])+
   '<h3>Бодит гүйцэтгэл</h3><p>'+escape(p.values.execution??'')+'</p><h3>Дүгнэлт</h3><p>'+escape(p.values.conclusion??'')+'</p><h3>Бодит эхийн ишлэл</h3><ul>'+p.evidence.map(r=>'<li>'+escape(r.name+' · '+r.id+' · v'+r.version+' · '+r.state+' · '+(r.sha256??'')+' · '+(r.status??''))+'</li>').join('')+'</ul></section>'),'</html>'].join('\n');
 return {html,sha256:hash(html),manifest:(({_papers,...p})=>p)(preview)};
}
