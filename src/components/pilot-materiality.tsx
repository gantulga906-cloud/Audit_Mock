import { useState } from 'react';
import { benchmarkMeasures,moneyRound, type MaterialityBasis, type SpecificMateriality,type SpecificSelection } from '@/lib/pilot-materiality';
import {MaterialitySelectionFields,selectionDraft,selectionPayload,selectionPreview} from './materiality-selection';
import { pilotScope } from '@/lib/pilot-registers';
import type { Evidence } from '@/lib/workspace';

export type MaterialityTarget={form:string;title:string};
type DraftThreshold=Omit<SpecificMateriality,'amount'|'performance'|'selection'>&{amount:string;performance:string;selection?:Omit<SpecificSelection,'percentage'|'performancePercentage'>&{percentage:string;performancePercentage:string}};
const blankThreshold={form:'',scope:'',amount:'',performance:'',rationale:''};
const labels={
  users:'Тайланг ашиглах талууд ба тэдний хэрэгцээ',
  alternatives:'Харьцуулсан бусад суурь',
  benchmarkRationale:'Суурийг сонгосон үндэслэл',
  comparisonRationale:'Харьцуулалтын дүгнэлт',
  unusualResults:'Хэвийн бус үзүүлэлт ба тайлбар',
  stabilityRationale:'Тогтвортой байдлын үндэслэл',
  specificReason:'Тусгай босго хэрэглэх шийдвэрийн үндэслэл',
} as const;

export function MaterialityBasisFields({basis,existing,targets,evidence,values}:{
  basis?:MaterialityBasis|null;existing:boolean;targets:MaterialityTarget[];
  evidence:(Evidence&{current?:boolean})[];
  values:Record<string,string>;
}){
  const [enabled,setEnabled]=useState(!!basis||!existing);
  const [modern,setModern]=useState(!!basis?.selection||!existing);
  const [selection,setSelection]=useState(()=>selectionDraft(basis?.selection,values,basis?.benchmarkMeasure));
  const [draft,setDraft]=useState({
    users:basis?.users??'',benchmarkMeasure:basis?.benchmarkMeasure??'',benchmarkOther:basis?.benchmarkOther??'',
    alternatives:basis?.alternatives??'',benchmarkRationale:basis?.benchmarkRationale??'',
    comparison:basis?.comparison??'',priorAmount:String(basis?.priorAmount??''),priorReference:basis?.priorReference??'',
    comparisonRationale:basis?.comparisonRationale??'',unusualResults:basis?.unusualResults??'',
    stability:basis?.stability??'',stabilityRationale:basis?.stabilityRationale??'',evidence:basis?.evidence.id??'',
    specificDecision:basis?.specificDecision??'',specificReason:basis?.specificReason??'',revisionReason:'',
  });
  const [specific,setSpecific]=useState<DraftThreshold[]>(()=>basis?.specific.map(row=>({
    ...row,amount:String(row.amount),performance:String(row.performance),selection:row.selection?{...row.selection,percentage:String(row.selection.percentage),performancePercentage:String(row.selection.performancePercentage)}:undefined,
  }))??[]);
  const set=(key:keyof typeof draft,value:string)=>setDraft(previous=>({...previous,[key]:value}));
  const setThreshold=(index:number,key:keyof DraftThreshold,value:string)=>
    setSpecific(previous=>previous.map((row,i)=>i===index?{...row,[key]:value}:row));
  const setSpecificSelection=(index:number,key:keyof NonNullable<DraftThreshold['selection']>,value:string)=>setSpecific(previous=>previous.map((row,i)=>i===index&&row.selection?{...row,selection:{...row.selection,[key]:value}}:row));
  const selected=selection.candidates.find(row=>row.measure===selection.selected),totals=modern?selectionPreview(selection):null;
  const files=evidence.filter(file=>file.status==='accepted'&&file.current!==false);
  const text=(key:keyof typeof labels)=><label>{labels[key]}<textarea value={draft[key]} onChange={e=>set(key,e.target.value)} required/></label>;

  return <>
    {existing&&!basis&&<label><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/> Суурь ба тусгай босгыг дэлгэрэнгүй баримтжуулах</label>}
    {enabled&&<fieldset className="feature-fields">
      <legend>Материаллаг байдлын шийдвэрийн үндэслэл</legend>
      {existing&&!basis?.selection&&<label><input type="checkbox" checked={modern} onChange={e=>setModern(e.target.checked)}/> Жишиг ба аудиторын сонгосон босгыг тусад нь бүртгэх</label>}
      <input type="hidden" name="materialityBasis" value={JSON.stringify({...draft,...(modern&&{selection:selectionPayload(selection),benchmarkMeasure:selection.selected,benchmarkOther:selected?.name??'',comparison:selected?.priorAmount?'prior-period':'unavailable',priorAmount:selected?.priorAmount??''}),specific:draft.specificDecision==='required'?specific:[]})}/>
      {modern&&<MaterialitySelectionFields draft={selection} set={setSelection}/>}
      <div className="field-grid">
        {!modern&&<><label>Суурь үзүүлэлт<select value={draft.benchmarkMeasure} onChange={e=>set('benchmarkMeasure',e.target.value)} required>
          <option value="">Сонгох</option>{benchmarkMeasures.map(([value,label])=><option key={value} value={value}>{label}</option>)}
        </select></label>
        {draft.benchmarkMeasure==='other'&&<label>Суурь үзүүлэлтийн нэр<input value={draft.benchmarkOther} onChange={e=>set('benchmarkOther',e.target.value)} required/></label>}</>}
        <label>Үнэлж зөвшөөрсөн суурь баримт<select value={draft.evidence} onChange={e=>set('evidence',e.target.value)} required>
          <option value="">Сонгох</option>{files.map(file=><option key={file.id} value={file.id}>{file.name} · v{file.version}</option>)}
        </select></label>
        {!modern&&<><label>Харьцуулах боломж<select value={draft.comparison} onChange={e=>set('comparison',e.target.value)} required>
          <option value="">Сонгох</option><option value="prior-period">Өмнөх үетэй харьцуулсан</option><option value="unavailable">Харьцуулах дүн байхгүй</option>
        </select></label>
        {draft.comparison==='prior-period'&&<>
          <label>Өмнөх үеийн дүн<input type="number" step="any" value={draft.priorAmount} onChange={e=>set('priorAmount',e.target.value)} required/></label>
          <label>Өмнөх үеийн эх сурвалж<input value={draft.priorReference} onChange={e=>set('priorReference',e.target.value)} required/></label>
        </>}</>}
        <label>Суурийн тогтвортой байдал<select value={draft.stability} onChange={e=>set('stability',e.target.value)} required>
          <option value="">Сонгох</option><option value="stable">Тогтвортой</option><option value="adjusted">Залруулсан</option><option value="alternative">Өөр суурь сонгосон</option>
        </select></label>
        {text('users')}{text('alternatives')}{text('benchmarkRationale')}{text('comparisonRationale')}{text('unusualResults')}{text('stabilityRationale')}
      </div>
      <div className="field-grid">
        <label>Тусгай босго<select value={draft.specificDecision} onChange={e=>set('specificDecision',e.target.value)} required>
          <option value="">Сонгох</option><option value="required">Хэрэгтэй</option><option value="not-required">Хэрэггүй</option>
        </select></label>
        {text('specificReason')}
      </div>
      {draft.specificDecision==='required'&&<>
        {specific.map((row,i)=><div className="field-grid bench-item" key={i}>
          <label>Холбоотой гүйцэтгэлийн ажил<select value={row.form} onChange={e=>setThreshold(i,'form',e.target.value)} required>
            <option value="">Сонгох</option>{targets.map(target=><option key={target.form} value={target.form}
              disabled={target.form!==row.form&&specific.some(item=>item.form===target.form)}>{target.form} · {target.title}</option>)}
          </select></label>
          <label>Данс, гүйлгээ эсвэл тодруулга<input value={row.scope} onChange={e=>setThreshold(i,'scope',e.target.value)} required/></label>
          {modern&&!row.selection&&<button type="button" className="btn secondary" onClick={()=>setSpecific(previous=>previous.map((item,index)=>index===i?{...item,selection:{percentage:'',performancePercentage:'',amountMode:'calculated',performanceMode:'calculated',amountRationale:'',performanceRationale:''}}:item))}>Тусгай босгын тооцоо ба сонголт нэмэх</button>}
          {row.selection&&<>
           <label>Нийт босгын хувь<input type="number" min="0" max="100" step="0.0001" value={row.selection.percentage} onChange={e=>setSpecificSelection(i,'percentage',e.target.value)} required/></label>
           <label>Тусгай гүйцэтгэлийн хувь<input type="number" min="0" max="100" step="0.0001" value={row.selection.performancePercentage} onChange={e=>setSpecificSelection(i,'performancePercentage',e.target.value)} required/></label>
           {(['amountMode','performanceMode'] as const).map(key=><label key={key}>{key==='amountMode'?'Тусгай босгын арга':'Тусгай гүйцэтгэлийн арга'}<select value={row.selection![key]} onChange={e=>setSpecificSelection(i,key,e.target.value)}><option value="calculated">Тооцоолсон</option><option value="override">Аудитор өөр дүн тогтоох</option></select></label>)}
           {(['amountRationale','performanceRationale'] as const).map(key=><label key={key}>{key==='amountRationale'?'Тусгай босгын шийдвэрийн үндэслэл':'Тусгай гүйцэтгэлийн шийдвэрийн үндэслэл'}<textarea value={row.selection![key]} onChange={e=>setSpecificSelection(i,key,e.target.value)} required/></label>)}
          </>}
          <label>Тусгай босго<input type="number" step="0.01" min="0.01" readOnly={row.selection?.amountMode==='calculated'} value={row.selection?.amountMode==='calculated'?(totals&&row.selection.percentage?moneyRound(totals.overall*Number(row.selection.percentage)/100):''):row.amount} onChange={e=>setThreshold(i,'amount',e.target.value)} required/></label>
          <label>Тусгай гүйцэтгэлийн босго<input type="number" step="0.01" min="0.01" readOnly={row.selection?.performanceMode==='calculated'} value={row.selection?.performanceMode==='calculated'?(totals&&row.selection.performancePercentage?moneyRound((row.selection.amountMode==='calculated'?moneyRound(totals.overall*Number(row.selection.percentage)/100):Number(row.amount))*Number(row.selection.performancePercentage)/100):''):row.performance} onChange={e=>setThreshold(i,'performance',e.target.value)} required/></label>
          <label>Үндэслэл<textarea value={row.rationale} onChange={e=>setThreshold(i,'rationale',e.target.value)} required/></label>
          <button type="button" className="btn secondary" onClick={()=>setSpecific(previous=>previous.filter((_,index)=>index!==i))}>Мөр хасах</button>
        </div>)}
        <button type="button" className="btn secondary" disabled={specific.length>=Math.min(targets.length,20)}
          onClick={()=>setSpecific(previous=>[...previous,blankThreshold])}>Тусгай босго нэмэх</button>
      </>}
      {existing&&<label>Хянасан үндэслэлийг өөрчлөх шалтгаан<textarea name="materiality.revisionReason" value={draft.revisionReason} onChange={e=>set('revisionReason',e.target.value)}/></label>}
    </fieldset>}
  </>;
}

export function MaterialityBasisSummary({basis,engagement}:{
  basis:MaterialityBasis;engagement:string|null;
}){
  const benchmark=benchmarkMeasures.find(([key])=>key===basis.benchmarkMeasure)?.[1];
  return <details className="feature-detail">
    <summary>Суурийн нотолгоо, үнэлгээ ба тусгай босго</summary>
    <p>{benchmark} {basis.benchmarkOther} · {basis.users}</p>
    <p>{basis.alternatives} · {basis.benchmarkRationale}</p>
    {basis.selection&&<><p>{basis.selection.stage==='final'?'Эцсийн':'Төлөвлөлтийн'} сонголт · {basis.selection.selected}</p><table className="data-table"><thead><tr><th>Жишиг</th><th>Тайлант</th><th>Өмнөх</th><th>Хувь</th><th>Боломжит босго</th><th>Үндэслэл</th></tr></thead><tbody>{basis.selection.candidates.map(row=><tr key={row.measure}><td>{row.name}</td><td>{row.amount.toLocaleString()}</td><td>{row.priorAmount?.toLocaleString()??'—'}</td><td>{row.percentage}</td><td>{moneyRound(row.amount*row.percentage/100).toLocaleString()}</td><td>{row.rationale}</td></tr>)}</tbody></table>
     {(['overall','performance','trivial'] as const).map(key=><p key={key}>{key} · {basis.selection![key].mode==='override'?'Аудиторын өөрчилсөн дүн '+basis.selection![key].amount:'Тооцоолсон дүн'} · {basis.selection![key].rationale}</p>)}
     {Object.values(basis.selection.qualitative).map((text,i)=><p key={i}>{text}</p>)}
    </>}
    {basis.priorAmount!==undefined&&<p>{basis.priorReference} · {basis.priorAmount.toLocaleString()}</p>}
    <p>{basis.comparisonRationale} · {basis.unusualResults} · {basis.stabilityRationale}</p>
    <p><a href={'/api/pilot/evidence/'+basis.evidence.id+pilotScope(engagement)}>{basis.evidence.name} · v{basis.evidence.version}</a> · SHA-256 {basis.evidence.sha256.slice(0,16)}</p>
    <p>{basis.specificReason}</p>
    {basis.specific.map(row=><p key={row.form}>{row.form} · {row.scope} · {row.amount.toLocaleString()} · {row.performance.toLocaleString()} · {row.rationale}</p>)}
    {basis.revisionReason&&<p>{basis.revisionReason}</p>}
  </details>;
}
