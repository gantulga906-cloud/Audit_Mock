import {benchmarkMeasures,moneyRound,selectedMateriality,type MaterialitySelection} from '@/lib/pilot-materiality';

type DraftDecision={mode:'calculated'|'override';amount:string;rationale:string;percentage:string};
export type SelectionDraft={version:1;selected:string;stage:'planning'|'final';
 candidates:{measure:string;name:string;amount:string;priorAmount:string;percentage:string;rationale:string}[];
 overall:DraftDecision;performance:DraftDecision;trivial:DraftDecision;
 priorOverall:{amount:string;reference:string};qualitative:MaterialitySelection['qualitative'];
};
const decision=(row?:MaterialitySelection['overall']&{percentage?:number},percentage=''):DraftDecision=>({mode:row?.mode??'calculated',amount:String(row?.amount??''),rationale:row?.rationale??'',percentage:String(row?.percentage??percentage)});
export function selectionDraft(selection:MaterialitySelection|undefined,values:Record<string,string>,measure=''):SelectionDraft{
 return {version:1,selected:selection?.selected??measure,stage:selection?.stage??'planning',
  candidates:selection?.candidates.map(row=>({...row,amount:String(row.amount),priorAmount:String(row.priorAmount??''),percentage:String(row.percentage)}))??[{measure,name:'',amount:values.benchmark??'',priorAmount:'',percentage:values.percentage??'',rationale:''}],
  overall:decision(selection?.overall),performance:decision(selection?.performance,values.performance),trivial:decision(selection?.trivial,values.trivial),
  priorOverall:{amount:String(selection?.priorOverall?.amount??''),reference:selection?.priorOverall?.reference??''},
  qualitative:selection?.qualitative??{circumstances:'',reporting:'',disclosures:''}};
}
export const selectionPayload=(draft:SelectionDraft)=>({...draft,...(!draft.priorOverall.amount?{priorOverall:undefined}:{})});
export function selectionPreview(draft:SelectionDraft){
 if(draft.candidates.some(row=>!row.amount.trim()||!row.percentage.trim())||[draft.performance,draft.trivial].some(row=>!row.percentage.trim())||[draft.overall,draft.performance,draft.trivial].some(row=>row.mode==='override'&&!row.amount.trim()))return null;
 return selectedMateriality({...draft,candidates:draft.candidates.map(row=>({...row,amount:Number(row.amount),percentage:Number(row.percentage),priorAmount:row.priorAmount?Number(row.priorAmount):undefined})),
  overall:{...draft.overall,amount:Number(draft.overall.amount)},performance:{...draft.performance,amount:Number(draft.performance.amount),percentage:Number(draft.performance.percentage)},trivial:{...draft.trivial,amount:Number(draft.trivial.amount),percentage:Number(draft.trivial.percentage)},priorOverall:undefined});
}
export function MaterialitySelectionFields({draft,set}:{draft:SelectionDraft;set:(value:SelectionDraft)=>void}){
 const totals=selectionPreview(draft),candidate=draft.candidates.find(row=>row.measure===draft.selected);
 const update=(index:number,key:keyof SelectionDraft['candidates'][number],value:string)=>set({...draft,candidates:draft.candidates.map((row,i)=>i===index?{...row,[key]:value}:row)});
 const show=(value:number|undefined)=>value===undefined||!Number.isFinite(value)?'—':value.toLocaleString(undefined,{maximumFractionDigits:2});
 const threshold=(key:'overall'|'performance'|'trivial',label:string,calculated:number|undefined)=>{
  const row=draft[key],change=(field:keyof DraftDecision,value:string)=>set({...draft,[key]:{...row,[field]:value}});
  return <fieldset className="feature-fields"><legend>{label}</legend><div className="field-grid">
   {key!=='overall'&&<label>Сонгосон нийт босгын хувь<input name={'selection.'+key+'.percentage'} type="number" min="0" max="100" step="0.0001" value={row.percentage} onChange={e=>change('percentage',e.target.value)} required/></label>}
   <label>Сонгох арга<select name={'selection.'+key+'.mode'} value={row.mode} onChange={e=>change('mode',e.target.value)}><option value="calculated">Тооцоолсон дүнг сонгох</option><option value="override">Аудитор өөр дүн тогтоох</option></select></label>
   <p>Тооцоолсон дүн · {show(calculated)}{key==='overall'?' · D17:D21 × F17:F21':''}</p>
   {row.mode==='override'&&<label>Аудиторын сонгосон дүн<input name={'selection.'+key+'.amount'} type="number" min={key==='trivial'?'0':'0.01'} step="0.01" value={row.amount} onChange={e=>change('amount',e.target.value)} required/></label>}
   <label>Сонгосон дүн ба өөрчилсөн бол үндэслэл<textarea name={'selection.'+key+'.rationale'} value={row.rationale} onChange={e=>change('rationale',e.target.value)} required/></label>
  </div></fieldset>;
 };
 return <section data-materiality-selection><p className="micro">1.3А!D17:I21 · Жишиг дүн ба хувь нь сонголтыг дэмжинэ. Аргачлалын жишиг хувийг автоматаар мөрдөхгүй.</p>
  {draft.candidates.map((row,i)=><fieldset className="feature-fields" key={i}><legend>Жишиг {i+1}</legend><div className="field-grid">
   <label>Үзүүлэлт<select name={'selection.candidate.'+i+'.measure'} value={row.measure} onChange={e=>update(i,'measure',e.target.value)} required><option value="">Сонгох</option>{benchmarkMeasures.map(([id,label])=><option key={id} value={id} disabled={id!==row.measure&&draft.candidates.some(c=>c.measure===id)}>{label}</option>)}</select></label>
   {row.measure==='other'&&<label>Бусад үзүүлэлтийн нэр<input value={row.name} onChange={e=>update(i,'name',e.target.value)} required/></label>}
   {(['amount','priorAmount','percentage'] as const).map(key=><label key={key}>{key==='amount'?'Тайлант үеийн дүн':key==='priorAmount'?'Өмнөх үеийн дүн (байгаа бол)':'Аудиторын сонгосон хувь'}<input name={'selection.candidate.'+i+'.'+key} type="number" step={key==='percentage'?'0.0001':'0.01'} min={key==='percentage'?'0':undefined} max={key==='percentage'?'100':undefined} value={row[key]} onChange={e=>update(i,key,e.target.value)} required={key!=='priorAmount'}/></label>)}
   <label>Суурь ба хувь сонгох үндэслэл<textarea name={'selection.candidate.'+i+'.rationale'} value={row.rationale} onChange={e=>update(i,'rationale',e.target.value)} required/></label>
   <p>Боломжит босго · {show(row.amount&&row.percentage?moneyRound(Number(row.amount)*Number(row.percentage)/100):undefined)}</p>
  </div>{draft.candidates.length>1&&<button type="button" className="btn secondary" onClick={()=>set({...draft,candidates:draft.candidates.filter((_,index)=>index!==i)})}>Жишиг хасах</button>}</fieldset>)}
  <button type="button" className="btn secondary" disabled={draft.candidates.length>=5} onClick={()=>set({...draft,candidates:[...draft.candidates,{measure:'',name:'',amount:'',priorAmount:'',percentage:'',rationale:''}]})}>Жишиг нэмэх</button>
  <div className="field-grid space-top"><label>Тооцоонд ашиглах жишиг<select name="selection.selected" value={draft.selected} onChange={e=>set({...draft,selected:e.target.value})} required><option value="">Сонгох</option>{draft.candidates.filter(row=>row.measure).map((row,i)=><option key={i} value={row.measure}>{row.name||benchmarkMeasures.find(([id])=>id===row.measure)?.[1]}</option>)}</select></label>
   <label>Шийдвэрийн үе<select name="selection.stage" value={draft.stage} onChange={e=>set({...draft,stage:e.target.value as 'planning'|'final'})}><option value="planning">Төлөвлөлт · E27</option><option value="final">Эцсийн өөрчлөлт · E28</option></select></label>
   <label>Өмнөх жилийн нийт материаллаг (байгаа бол) · E26<input name="selection.priorOverall.amount" type="number" min="0" step="0.01" value={draft.priorOverall.amount} onChange={e=>set({...draft,priorOverall:{...draft.priorOverall,amount:e.target.value}})}/></label>
   {draft.priorOverall.amount&&<label>Өмнөх баталсан босгын эх ба хувилбар<input name="selection.priorOverall.reference" value={draft.priorOverall.reference} onChange={e=>set({...draft,priorOverall:{...draft.priorOverall,reference:e.target.value}})} required/></label>}
  </div>
  {threshold('overall','Нийт материаллаг · E27 / E28',candidate?.amount&&candidate.percentage?moneyRound(Number(candidate.amount)*Number(candidate.percentage)/100):undefined)}
  {threshold('performance','Гүйцэтгэлийн материаллаг · B45',totals?moneyRound(totals.overall*Number(draft.performance.percentage)/100):undefined)}
  {threshold('trivial','Илт бага зөрүүний босго · E58',totals?moneyRound(totals.overall*Number(draft.trivial.percentage)/100):undefined)}
  <div className="field-grid">{([['circumstances','Чанарын нөхцөл ба эхний үлдэгдлийн нөлөө · B30 / F34:H34'],['reporting','Тайлагналын шаардлага ба онцгой нөхцөл · F35:H35'],['disclosures','Нөлөөлөх данс, тодруулга ба хэрэглэгч · F36:H36']] as const).map(([key,label])=><label key={key}>{label}<textarea name={'selection.qualitative.'+key} value={draft.qualitative[key]} onChange={e=>set({...draft,qualitative:{...draft.qualitative,[key]:e.target.value}})} required/></label>)}</div>
  <p role="status">Сонгосон дүн · Нийт {show(totals?.overall)} · Гүйцэтгэл {show(totals?.performance)} · Илт бага {show(totals?.trivial)}</p>
 </section>;
}
