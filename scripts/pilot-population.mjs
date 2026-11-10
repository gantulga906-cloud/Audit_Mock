import { createHash, randomUUID } from 'node:crypto';
import { validDate } from '../src/lib/feature-workflows.ts';
import { populationRequiredFields } from '../src/lib/pilot-population.ts';
import { recordEvent } from '../src/lib/workspace.ts';
import { fileInput, input, PilotError } from './pilot-workflow.mjs';
import { evidenceCurrent } from './pilot-requests.mjs';

const fail = (message,status=409) => { throw new PilotError(status,message); };
const now = () => new Date().toISOString();
const entityKey = value => value.replace(/\s/g,'').toLowerCase();
const revisions = m => m.pilotPopulation ?? [];
const current = m => revisions(m).at(-1);
const currentControl = (m,control) => control&&m.evidence.some(e=>e.id===control.id&&e.version===control.version&&evidenceCurrent(m,e));
const sourcePart = (request, part) => request?.dispatch==='issued'&&request.parts?.find(row=>row.id===part&&row.state==='accepted');
function currentExtract(m, revision) {
  if (!revision?.extract) return true;
  const {request,part,fileVersion}=revision.extract;
  const accepted=sourcePart(m.requests.find(row=>row.id===request),part);
  return accepted?.evidence===revision.evidence&&m.evidence.some(file=>file.id===revision.evidence&&
    file.request===request&&file.version===fileVersion&&file.status==='accepted');
}
export const approvedPopulation = m => {
  const revision=current(m);
  return revision?.approval&&currentExtract(m,revision)&&currentControl(m,revision.controls?.evidence)?revision:undefined;
};
export const populationView = m => current(m) && {
  current:current(m), usable:!!approvedPopulation(m), extractCurrent:currentExtract(m,current(m)),
  history:revisions(m).slice(0,-1).reverse().map(({rows:_,...revision})=>revision),
};

export function csvRows(text) {
  const rows = [];
  let row = [], cell = '', line = 1, start = 1, quoted = false, closed = false;
  const pushCell = () => { row.push(cell.trim()); cell = ''; closed = false; };
  const pushRow = () => {
    pushCell();
    if (row.some(Boolean)) rows.push({line:start,cells:row});
    if (rows.length > 3001) fail('CSV файл 3,000 өгөгдлийн мөр хүртэл байна.',400);
    row = [];
  };
  for (let i=0; i<text.length; i++) {
    const c=text[i];
    if (quoted) {
      if (c==='"' && text[i+1]==='"') { cell+='"'; i++; }
      else if (c==='"') { quoted=false; closed=true; }
      else { cell+=c; if (c==='\n') line++; }
    } else if (c===',') pushCell();
    else if (c==='\n' || c==='\r' && text[i+1]==='\n') {
      if (c==='\r') i++;
      pushRow(); start=++line;
    } else if (c==='"' && cell==='' && !closed) quoted=true;
    else {
      if (closed || c==='"' || c==='\r') fail('CSV бүтэц буруу · мөр '+line,400);
      cell+=c;
    }
  }
  if (quoted) fail('CSV хаалтын хашилт дутуу · мөр '+start,400);
  if (row.length || cell || closed) pushRow();
  return rows;
}

export function cents(value) {
  if (!/^[+-]?\d+(?:\.\d{1,2})?$/.test(value)) return null;
  const [whole,fraction=''] = value.replace(/^[+-]/,'').split('.');
  const amount = Number(whole)*100 + Number(fraction.padEnd(2,'0'));
  if (!Number.isSafeInteger(amount) || amount > 100_000_000_000) return null;
  return amount && value.startsWith('-') ? -amount : amount;
}

function parseRows(m, text, currency, extract) {
  const [head,...records] = csvRows(text);
  if (!head || !records.length) fail('CSV толгой болон өгөгдлийн мөр оруулна уу.',400);
  const columns = head.cells.map(x=>x.toLowerCase());
  const missing = (extract?.fields??populationRequiredFields).filter(x=>!columns.includes(x));
  const issues = [];
  if (missing.length) issues.push('Дутуу багана · '+missing.join(', '));
  if (new Set(columns).size !== columns.length) issues.push('Баганын нэр давхардсан.');
  const indexes = populationRequiredFields.map(key=>columns.indexOf(key));
  const journalIndex=columns.indexOf('journal'), typeIndex=columns.indexOf('entry_type'), referenceIndex=columns.indexOf('reference');
  const engagement = m.engagements[0];
  const {start,end} = extract??m.bench.periods[engagement.id];
  const entity = m.bench.clients[engagement.id].registration;
  if (!entity) fail('Гэрээт ажлын бүртгэлийн дугаар шаардлагатай.');
  const rows = records.map(({line,cells})=>{
    const [id,account,rawAmount,rowEntity,date,rowCurrency] = indexes.map(i=>cells[i]??'');
    const amount = cents(rawAmount), rowIssues = [];
    if (issues.length || cells.length!==columns.length) rowIssues.push('columns');
    if (!id || !account) rowIssues.push('key');
    if (amount===null) rowIssues.push('amount');
    if (entityKey(rowEntity)!==entityKey(entity)) rowIssues.push('entity');
    if (!validDate(date)) rowIssues.push('date');
    else if (date<start || date>end) rowIssues.push('period');
    if (rowCurrency.toUpperCase()!==currency) rowIssues.push('currency');
    return {row:line,id,account,entity:rowEntity,date,currency:rowCurrency.toUpperCase(),rawAmount,cents:amount,issues:rowIssues,
      journal:cells[journalIndex]||undefined,entryType:cells[typeIndex]?.toLowerCase()||undefined,reference:cells[referenceIndex]||undefined};
  });
  return {rows,issues};
}

function pairs(text, validate) {
  const result = new Map();
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim()) continue;
    const [key,value,extra] = raw.split(',').map(s=>s.trim());
    if (!key || !value || extra!==undefined || !validate(value)) fail('Тулгалтын мөрийг шалгана уу · '+raw,400);
    const entries = result.get(key)??[];
    entries.push(value);
    result.set(key,entries);
  }
  return result;
}

function calculate(base, controls) {
  const gaps = [...base.issues], exclusions = new Map();
  if (controls) for (const line of controls.exclusions.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const match = /^(\d+),\s*(\S.*)$/.exec(line.trim());
    const row = Number(match?.[1]);
    if (!match || exclusions.has(row)) fail('Хасалтын мөр ба үндэслэл буруу · '+line,400);
    exclusions.set(row,match[2]);
  }
  const keys = new Map();
  const eligibleKey = row => row.id && !row.issues.some(issue=>['columns','entity','date','period','currency'].includes(issue));
  for (const row of base.rows) if (!exclusions.has(row.row)&&eligibleKey(row)) keys.set(row.id,(keys.get(row.id)??0)+1);
  const rows = base.rows.map(row=>{
    const reason=exclusions.get(row.row);
    exclusions.delete(row.row);
    const issues=row.issues.filter(issue=>issue!=='duplicate');
    if (eligibleKey(row)&&keys.get(row.id)>1) issues.push('duplicate');
    return {...row,issues,reason,state:reason?'excluded':issues.length?'quarantined':'accepted'};
  });
  if (exclusions.size) fail('Хасах эх мөр олдсонгүй.',400);
  const accepted = rows.filter(r=>r.state==='accepted');
  const counts = {read:rows.length,accepted:accepted.length,excluded:rows.filter(r=>r.state==='excluded').length,
    quarantined:rows.filter(r=>r.state==='quarantined').length,invalidAmounts:rows.filter(r=>r.cents===null).length};
  const sum = values => values.reduce((total,row)=>total+(row.cents??0),0);
  const acceptedCents = sum(accepted), bridge = [], readTotals=new Map();
  for (const row of rows) if (row.cents!==null) {
    const currency=/^[A-Z]{3}$/.test(row.currency)?row.currency:'unknown';
    readTotals.set(currency,(readTotals.get(currency)??0)+row.cents);
  }
  if (counts.quarantined) gaps.push('Шийдэгдээгүй тусгаарласан мөр · '+counts.quarantined);
  if (!accepted.length) gaps.push('Хамрах хүрээнд зөвшөөрөх мөр алга.');
  if (!controls) gaps.push('Хараат бус хяналтын тоо, дүн ба тайлангийн тулгалтыг оруулна уу.');
  else {
    if (controls.count!==accepted.length || controls.cents!==acceptedCents) gaps.push('Хүлээн авах мөрийн тоо эсвэл дүн хараат бус хяналттай тохирохгүй.');
    const mapping = pairs(controls.mapping,()=>true), statements = pairs(controls.statements,v=>cents(v)!==null);
    const groups = new Map(), accounts = new Map();
    for (const row of accepted) accounts.set(row.account,(accounts.get(row.account)??0)+row.cents);
    for (const [account,total] of accounts) {
      const links = mapping.get(account);
      if (links?.length!==1) { gaps.push((links?'Давхар зураглал · ':'Зураглалгүй данс · ')+account); continue; }
      const line = links[0], group=groups.get(line)??{computed:0,accounts:[]};
      group.computed+=total; group.accounts.push(account); groups.set(line,group);
    }
    for (const line of new Set([...groups.keys(),...statements.keys()])) {
      const group = groups.get(line)??{computed:0,accounts:[]}, amounts = statements.get(line);
      const reported = amounts?.length===1 ? cents(amounts[0]) : null;
      const difference = reported===null?null:group.computed-reported;
      if (!group.accounts.length || difference===null || difference!==0) gaps.push('Санхүүгийн тайлангийн мөрийн зөрүү · '+line);
      bridge.push({line,...group,reported,difference});
    }
  }
  return {...base,rows,counts,readCents:readTotals.get(base.currency)??0,readTotals:Object.fromEntries(readTotals),acceptedCents,controls,bridge,gaps};
}

function extractInput(m, data, files) {
  if (data.name||data.base64||data.source) fail('Хүсэлтээс сонгосон эх файлд шинэ агуулга оруулахгүй.',400);
  const evidence=input(data,'requestEvidence',64);
  const file=m.evidence.find(row=>row.id===evidence);
  const request=m.requests.find(row=>row.id===file?.request);
  const part=request?.parts?.find(row=>row.evidence===evidence);
  const original=files.read(evidence);
  if (!request?.extract||!sourcePart(request,part?.id)||file.status!=='accepted'||String(file.version)!==data.evidenceVersion||
      !original||createHash('sha256').update(original.bytes).digest('hex')!==original.sha256) {
    fail('Хүсэлтийн одоогийн зөвшөөрсөн эх файл ба хувилбарыг сонгоно уу.');
  }
  const extract={...request.extract,request:request.id,part:part.id,fileVersion:file.version,
    contact:request.contact,contactEmail:request.contactEmail};
  return {name:file.name,bytes:original.bytes,evidence,sha256:original.sha256,source:file.source,extract};
}

export function populationAction(m, role, action, data, files) {
  const prior = current(m);
  const version = (prior?.version??0)+1;
  const history = m.pilotPopulation ??= [];
  if (action==='population-import') {
    if (role==='partner') fail('Өгөгдөл бэлтгэх томилгоо шаардлагатай.',403);
    const sourceExtract=data.requestEvidence?extractInput(m,data,files):undefined;
    if (!sourceExtract&&m.requests.some(row=>row.extract&&row.dispatch==='issued')) {
      fail('Гаргасан эх олонлогийн хүсэлтийн зөвшөөрсөн файлаас сонгоно уу.');
    }
    const {name,bytes}=sourceExtract??fileInput(data);
    if (!/\.csv$/i.test(name) || bytes.length>750_000) fail('UTF-8 CSV файл 750 KB хүртэл байна.',400);
    const currency=input(data,'currency',3).toUpperCase(), source=sourceExtract?.source??input(data,'source',200);
    if (!/^[A-Z]{3}$/.test(currency)) fail('Валютын 3 үсэгтэй кодыг оруулна уу.',400);
    let text;
    try { text = new TextDecoder('utf-8',{fatal:true}).decode(bytes); } catch { /* Keep malformed original and display its defect. */ }
    let parsed={rows:[],issues:['UTF-8 CSV файл шаардлагатай.']};
    try {
      if (text!==undefined) parsed=parseRows(m,text,currency,sourceExtract?.extract);
    } catch (error) {
      if (!(error instanceof PilotError)||error.status!==400) throw error;
      parsed={rows:[],issues:[error.message]};
    }
    const evidence=sourceExtract?.evidence??randomUUID(), at=now();
    if (!sourceExtract) {
      files.add(evidence,name,bytes);
      m.evidence.push({id:evidence,engagement:m.engagement,name,source,version,status:'received',
        type:'FILE',obtained:at.slice(0,10),original:true,specimen:false,anchor:'',text:'',uploadedBy:role,population:true});
    }
    history.push(calculate({...parsed,version,name,source,evidence,sha256:sourceExtract?.sha256??files.get(evidence).sha256,
      currency,importedBy:role,preparedBy:role,at,...(sourceExtract&&{extract:sourceExtract.extract})},undefined));
  } else {
    if (!prior || data.version!==String(prior.version)) fail('Өгөгдлийн одоогийн хувилбарыг сонгоно уу.');
    if (!currentExtract(m,prior)) fail('Хүсэлтийн эх файл өөрчлөгдсөн. Одоогийн файлыг дахин бүртгэнэ үү.');
    if (action==='population-reconcile') {
      if (role==='partner' || prior.preparedBy!==role) fail('Өгөгдлийн томилсон бэлтгэгч шаардлагатай.',403);
      const count=input(data,'count',8), amount=cents(input(data,'total',24));
      if (!/^\d+$/.test(count) || amount===null) fail('Хараат бус тоо ба дүнг шалгана уу.',400);
      const file=m.evidence.find(e=>e.id===data.controlEvidence&&!e.population&&evidenceCurrent(m,e));
      const original=file&&files.get(file.id);
      if (!original||original.sha256===prior.sha256) fail('Тусдаа, үнэлж зөвшөөрсөн хяналтын эх файл шаардлагатай.');
      const controls={count:Number(count),cents:amount,source:input(data,'source',300),mapping:input(data,'mapping',100_000),
        statements:input(data,'statements',100_000),exclusions:data.exclusions ? input(data,'exclusions',100_000) : '',use:input(data,'use',300),
        evidence:{id:file.id,version:file.version,sha256:original.sha256}};
      if (data.investigation || prior.extract&&(controls.exclusions||prior.controls&&prior.gaps.length)) {
        controls.investigation=input(data,'investigation');
      }
      const {approval:_,...base}=prior;
      history.push(calculate({...base,version,at:now()},controls));
    } else if (action==='population-approve') {
      if (role==='preparer' || role===prior.preparedBy) fail('Хараат бус өгөгдлийн хянагч шаардлагатай.',403);
      if (prior.approval) return;
      if (prior.gaps.length) fail(prior.gaps.slice(0,8).join(' · '));
      if (!currentControl(m,prior.controls?.evidence)) fail('Хяналтын эх файлын одоогийн зөвшөөрөл шаардлагатай.');
      const reason=input(data,'reason');
      prior.approval={by:role,at:now(),reason};
      if (!prior.extract) {
        const original=m.evidence.find(e=>e.id===prior.evidence);
        original.status='accepted';
        original.assessment=reason;
      }
    } else fail('Өгөгдлийн үйлдэл олдсонгүй.',404);
  }
  recordEvent(m,'Эх олонлог · v'+current(m).version+' · '+action);
}
