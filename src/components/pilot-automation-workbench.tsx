import {nativeAutomationDiagnostics} from '@/lib/pilot-automation-diagnostics';
import {useState} from 'react';
import catalogue from '@/data/g11-automation-catalogue.json';
import {automationChecks} from '@/lib/pilot-automation-methods';
import {dataMethodNames} from '@/lib/pilot-data-methods';
import type {WorkspacePage} from '@/lib/workspace-navigation';
import type {View} from './pilot-workspace';
import type {PilotAction} from './pilot-registers';
import {DataMethodsDesk} from './pilot-data-methods';

const metricLabels:Record<string,string>={"open":"Шийдээгүй","readyForReview":"Яг эх ба хяналттай","unknownExposure":"Дүн тодорхойгүй","records":"Бүртгэл","unresolved":"Шийдээгүй","ready":"Одоогийн шаардлага хангагдсан","missingApplicable":"Хэрэглэх тодруулга дутуу","justifiedNa":"Үндэслэлтэй хамаарахгүй","unperformedBlockers":"Гүйцэтгээгүй шаардлагатай горим","areas":"Хэсэг","orphanSpecificRisks":"Горимд холбоогүй эрсдэл","orphanOverallArrangements":"Нийт түвшний хариу дутуу","unclearedNotes":"Хаагаагүй хяналтын тэмдэглэл","unreviewedVisiblePapers":"Харагдах хүрээний хянагдаагүй баримт"};
type Reference={id:string;version?:number;state:string;current?:boolean;form?:string};
const areaForms:Record<string,string[]>={
 'AUTO-012':['3.1.16'],'AUTO-013':['3.1.5','3.1.16'],'AUTO-014':['3.1.16'],
 'AUTO-016':['3.1.10'],'AUTO-018':['3.1.10'],'AUTO-019':['3.1.10'],'AUTO-020':['3.1.8'],
 'AUTO-022':['3.1.4'],'AUTO-023':['3.1.4'],'AUTO-025':['3.1.17','3.1.4'],'AUTO-027':['3.1.2'],
 'AUTO-031':['3.1.18'],'AUTO-032':['3.1.18'],'AUTO-033':['3.1.18'],'AUTO-034':['3.1.14'],
 'AUTO-035':['3.1.14'],'AUTO-036':['3.1.9'],'AUTO-037':['3.1.21'],'AUTO-038':['3.1.20'],
 'AUTO-039':['3.1.15'],'AUTO-040':['3.1.3'],
};
const completionKinds:Record<string,string>={'AUTO-049':'legal','AUTO-050':'going','AUTO-051':'events','AUTO-052':'disclosures'};

// A locator of actual owning records, not a second approval or automation-completion register.
export function automationReferences(view:View,id:string):Reference[]{
 const data=(view.dataMethods?.checks??[]).filter(r=>r.current.method===id).map(r=>({id:r.id,version:r.current.version,state:r.current.status+' / '+(r.current.disposition??'хэрэглээ шийдээгүй'),current:r.current.current}));
 if(Object.hasOwn(dataMethodNames,id)&&!areaForms[id]&&!['AUTO-041','AUTO-042'].includes(id))return data;
 const readable=new Set((view.papers??[]).map(p=>p.form));
 if(areaForms[id])return [...data,...areaForms[id].filter(f=>readable.has(f)&&view.areas?.[f]&&(id!=='AUTO-025'||!!view.areas[f].files.costLots)).map(f=>({id:f,form:f,version:view.areas![f].version,state:view.areas![f].approval?'calculation independently reviewed':'calculation awaiting review',current:view.areas![f].current}))];
 if(id==='AUTO-001')return (view.requestCoverage?.items??[]).map(r=>({id:r.request+'/'+r.part,version:r.version,state:r.state}));
 if(id==='AUTO-002')return view.population?[{id:view.population.current.evidence,version:view.population.current.version,state:view.population.usable?'reconciled population':'population not currently usable',current:view.population.usable}]:[];
 if(id==='AUTO-009')return Object.entries(view.journals??{}).filter(([f])=>readable.has(f)).map(([f,r])=>({id:f,form:f,version:r.version,state:r.approval?'independently reviewed':'awaiting review',current:r.current}));
 if(id==='AUTO-047')return Object.entries(view.samples??{}).filter(([f])=>readable.has(f)).map(([f,r])=>({id:f,form:f,version:r.version,state:r.approval?'selection independently reviewed':'selection awaiting review',current:r.current}));
 if(id==='AUTO-046'){const p=view.papers?.find(p=>p.form==='1.3');return p?[{id:p.id,form:p.form,version:p.version,state:p.status,current:p.status==='reviewed'&&!!p.materiality}]:[];}
 if(completionKinds[id])return (view.completion?.finalisation?.records??[]).filter(r=>r.kind===completionKinds[id]).map(r=>({id:r.id,version:r.version,state:r.status+' / '+(r.review?.disposition??'awaiting independent disposition'),current:r.current}));
 if(id==='AUTO-048'){const r=view.completion?.evaluation;return r?[{id:'final-evaluation',version:r.version,state:r.approval?'independently approved':'awaiting independent approval',current:r.current}]:[];}
 if(id==='AUTO-053')return Object.entries(view.execution?.plans??{}).filter(([f])=>readable.has(f)).map(([f,r])=>({id:f,form:f,version:r.version,state:r.conclusion?.disposition??'area conclusion missing',current:r.conclusionCurrent}));
 if(id==='AUTO-054')return (view.planning?.programmes??[]).filter(r=>readable.has(r.form)).map(r=>({id:r.form,form:r.form,state:r.gap??'current planned linkage; actual work remains separate',current:!r.gap}));
 if(id==='AUTO-055')return (view.papers??[]).filter(p=>p.notes.length||p.status==='submitted'||p.status==='changed').map(p=>({id:p.id,form:p.form,version:p.version,state:p.notes.filter(n=>!n.cleared).length+' uncleared notes / '+p.status,current:p.status==='reviewed'&&p.notes.every(n=>n.cleared)}));
 if(id==='AUTO-056')return [view.reporting?.opinion,view.reporting?.preparation].filter(r=>!!r).map(r=>({id:r!.id,version:r!.version,state:r!.status,current:!r!.stale&&r!.status==='approved'}));
 if(id==='AUTO-057')return (view.reporting?.issues??[]).map((r,i)=>({id:r.reference||'issue-'+i,state:r.at+' / '+r.reportSha256}));
 if(id==='AUTO-058')return view.assembly?[{id:'exact-file-assembly',state:'See exact manifest, custody, retention and amendment decisions in the final-file workspace'}]:[];
 if(id==='AUTO-041'||id==='AUTO-042')return [...data,...view.registers.filter(r=>r.kind==='M07-F10'&&r.values.type===(id==='AUTO-041'?'related':'estimate')).map(r=>({id:r.id,version:r.version,state:r.status,current:r.status==='approved'&&!r.stale}))];
 return [];
}
function destination(id:string):WorkspacePage{
 if(id==='AUTO-001')return 'evidence';if(id==='AUTO-054')return 'planning';if(id==='AUTO-055')return 'review';if(id==='AUTO-058')return 'archive';
 if(Number(id.slice(-3))>=48)return 'completion';return 'workpapers';
}
export function AutomationWorkbench({view,run,open}:{view:View;run:PilotAction;open:(page:WorkspacePage,form?:string)=>void}){
 const [query,setQuery]=useState(''),[selected,setSelected]=useState<string>();
 const diagnostics=nativeAutomationDiagnostics(view);
 const rows=catalogue.filter(c=>(c.id+' '+c.title+' '+c.minimum+' '+c.guide).toLowerCase().includes(query.toLowerCase()));
 return <>
  <section className="card pad bench-card" data-automation-catalogue><h2>Автомат шалгалтын арга ба бодит хэрэглээ</h2>
   <p>58 суурь шаардлага · арга бүрийн бодит эх ажил, хяналт ба хязгаарыг тусад нь харуулна. Хийсэн тооцоолол нь мэргэжлийн дүгнэлт эсвэл бүх шаардлагын хүлээн зөвшөөрөл биш.</p>
   <label>Арга, код эсвэл чиглэлээр хайх<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="AUTO-026, inventory, G05…"/></label><p>{rows.length} / {catalogue.length}</p>
   {rows.map(card=>{const diagnostic=diagnostics.find(d=>d.id===card.id),refs=automationReferences(view,card.id),data=Object.hasOwn(dataMethodNames,card.id);return <details className="feature-detail" key={card.id} data-automation={card.id}>
    <summary>{card.id} · {card.title} · {refs.length} бодит холбоос</summary>
    <p>{card.minimum}</p>{diagnostic&&<><p>{Object.entries(diagnostic.metrics).map(([key,value])=>(metricLabels[key]??key)+': '+(typeof value==='boolean'?(value?'Тийм':'Үгүй'):String(value))).join(' · ')}</p><p>{diagnostic.boundary}</p>{!!diagnostic.blockers.length&&<details><summary>Бодит дутуу ажил ({diagnostic.blockers.length})</summary>{diagnostic.blockers.map((b,i)=><p key={i}>{b}</p>)}</details>}</>}<p><strong>Хүний шийдвэр:</strong> {card.human}</p><p><strong>Дэмжээгүй хүрээ:</strong> {card.limits}</p>
    <p>{card.source} · {card.guide} · {card.task_package}</p>
    {refs.length?refs.map((r,i)=><p key={r.id+'/'+i}>{r.id}{r.version!==undefined?' · v'+r.version:''} · {r.state}{r.current===false?' · одоогийн хэрэглээнд шинэ ажил / хяналт шаардлагатай':''}{r.form&&<button className="btn subtle" onClick={()=>open('workpapers',r.form)}>Энэ эх ажилд очих</button>}</p>):<p>Энэ ажлын харагдах хүрээнд гүйцэтгэлийн бүртгэл үүсээгүй байна.</p>}
    <button className="btn secondary" onClick={()=>{if(data){setSelected(card.id);}else open(destination(card.id),refs.find(r=>r.form)?.form??areaForms[card.id]?.find(f=>view.papers?.some(p=>p.form===f)));}}>{data?'Эхүүдээр тооцоолох / хянах':'Хариуцах ажлын орчныг нээх'}</button>
    {automationChecks[card.id]&&<p>{automationChecks[card.id].parameters}</p>}
    <details><summary>Дараах өргөтгөл · хамрах шийдвэр хүлээж буй</summary><p>{card.extensions}</p></details>
   </details>;})}
  </section>
  <DataMethodsDesk key={selected??'default'} selectedMethod={selected} data={view.dataMethods} role={view.role} actor={view.identity?.id} findings={view.completion?.findings??view.fieldFindings??[]} evidence={view.evidence??[]} run={run}/>
 </>;
}
