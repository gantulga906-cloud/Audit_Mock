import {createHash} from 'node:crypto';
import {unzipSync} from 'fflate';
import {XMLParser,XMLValidator} from 'fast-xml-parser';
const hash=b=>createHash('sha256').update(b).digest('hex');
const array=v=>v===undefined?[]:Array.isArray(v)?v:[v];
const text=v=>typeof v==='object'&&v!==null?String(v['#text']??''):String(v??'');
const rich=v=>v?.t!==undefined?text(v.t):array(v?.r).map(r=>text(r.t)).join('');
const cell=/^[A-Z]{1,3}[1-9]\d{0,6}$/;
const column=n=>{let s='';for(;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;};
const index=s=>[...s].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0);
export function rangeCells(ref,limit=10000){
 const m=String(ref).replaceAll('$','').match(/^([A-Z]{1,3})([1-9]\d{0,6})(?::([A-Z]{1,3})([1-9]\d{0,6}))?$/);if(!m)throw Error('Unsupported cell range: '+ref);
 const [x1,y1,x2,y2]=[index(m[1]),Number(m[2]),index(m[3]??m[1]),Number(m[4]??m[2])];if(x1>x2||y1>y2||(x2-x1+1)*(y2-y1+1)>limit||x2>16384||y2>1048576)throw Error('Workbook range exceeds supported bounds');
 const result=[];for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)result.push(column(x)+y);return result;
}
export function inspectWorkbook(bytes){
 if(!bytes?.length||bytes.length>5_000_000)throw Error('Workbook must be 5 MB or smaller');
 let count=0,total=0;const names=new Set();
 const parts=unzipSync(bytes,{filter:f=>{if(++count>4000||names.has(f.name)||f.name.includes('..')||f.name.includes('\\')||f.name.startsWith('/')||/^[A-Za-z]:/.test(f.name))throw Error('Invalid or duplicate workbook member');names.add(f.name);if(f.originalSize>12_000_000||(total+=f.originalSize)>64_000_000)throw Error('Workbook expanded size exceeds supported bounds');return /^(?:xl\/.*\.xml|xl\/_rels\/workbook\.xml\.rels|\[Content_Types\]\.xml)$/.test(f.name);}});
 const parser=new XMLParser({ignoreAttributes:false,removeNSPrefix:true,attributeNamePrefix:'@',parseTagValue:false,parseAttributeValue:false,trimValues:false,processEntities:true});
 const xml=(name,optional=false)=>{if(!parts[name]){if(optional)return {};throw Error('Missing workbook member: '+name);}const raw=new TextDecoder('utf-8',{fatal:true}).decode(parts[name]);if(/<!DOCTYPE|<!ENTITY/i.test(raw)||XMLValidator.validate(raw)!==true)throw Error('Invalid or unsafe workbook XML');return parser.parse(raw);};
 const book=xml('xl/workbook.xml').workbook,rels=xml('xl/_rels/workbook.xml.rels').Relationships,strings=array(xml('xl/sharedStrings.xml',true).sst?.si).map(rich);
 const targets=new Map(array(rels?.Relationship).map(r=>[r['@Id'],r])),sheets=[];const sheetNames=new Set();
 for(const sheet of array(book?.sheets?.sheet)){
  if(sheets.length>=100||sheetNames.has(sheet['@name']))throw Error('Duplicate sheet or too many sheets');sheetNames.add(sheet['@name']);
  const rel=targets.get(sheet['@r:id']??sheet['@id']),target=rel?.['@Target'];if(!target||rel['@TargetMode']==='External'||target.includes('..')||target.includes(':')||target.includes('\\'))throw Error('Unsupported worksheet relationship');
  const page=xml(target.startsWith('/')?target.slice(1):'xl/'+target).worksheet;if(!page)throw Error('Missing worksheet content');
  let cellCount=0;const cellAddresses=new Set();const cells={},formulas=[],merges=array(page.mergeCells?.mergeCell).map(m=>m['@ref']),shared=new Map();
  for(const row of array(page.sheetData?.row))for(const c of array(row.c)){
   const address=c['@r'];if(!cell.test(address)||cellAddresses.has(address))throw Error('Invalid or duplicate cell address');
   cellAddresses.add(address);if(++cellCount>100000)throw Error('Too many cells in one sheet');
   const type=c['@t']??'n',raw=text(c.v),value=type==='s'?strings[Number(raw)]:type==='inlineStr'?rich(c.is):raw;if(value===undefined)throw Error('Invalid shared-string reference at '+address+' · '+raw+' / '+strings.length);
   if(value!==''||c.f!==undefined)cells[address]={value,type};
   if(c.f!==undefined){const f=c.f,expression=text(f),kind=typeof f==='object'?f['@t']:'',si=typeof f==='object'?f['@si']:undefined;if(expression&&kind==='shared')shared.set(si,{expression,address});
    formulas.push({cell:address,expression,kind,sharedIndex:si,...(typeof f==='object'&&f['@ref']&&{range:f['@ref']})});}
  }
  for(const f of formulas){const anchor=f.kind==='shared'?shared.get(f.sharedIndex):undefined;f.sharedAnchor=anchor?.address;const expression=(f.expression||anchor?.expression||'').replaceAll(' ','').replace(/^[=+]/,''),match=expression.match(/^(?:1\+([A-Z]+)(\d+)|([A-Z]+)(\d+)\+1)$/),position=(anchor?.address??f.cell).match(/^([A-Z]+)(\d+)$/);f.classification=match&&(match[1]??match[3])===position[1]&&Number(match[2]??match[4])===Number(position[2])-1?'presentation-sequence':'unimplemented-formula';}
  const validations=array(page.dataValidations?.dataValidation).map((v,i)=>({id:'validation-'+i,ranges:v['@sqref']??'',type:v['@type']??'',formula1:text(v.formula1),allowBlank:v['@allowBlank']??'',promptTitle:v['@promptTitle']??'',prompt:v['@prompt']??'',operator:v['@operator']??'',formula2:text(v.formula2)}));
  sheets.push({name:sheet['@name'],state:sheet['@state']??'visible',cells,merges,formulas,validations,dimension:page.dimension?.['@ref']??''});
 }
 for(const sheet of sheets)for(const rule of sheet.validations){
  if(rule.type!=='list'){rule.unsupported='Validation type requires an explicit mapping decision';continue;}
  if(/^"[\s\S]*"$/.test(rule.formula1)){rule.options=rule.formula1.slice(1,-1).split(',');continue;}
  const m=rule.formula1.match(/^(?:(?:'((?:[^']|'')+)'|([^!]+))!)?(\$?[A-Z]+\$?\d+(?::\$?[A-Z]+\$?\d+)?)$/);
  const target=m?(m[1]||m[2]?sheets.find(s=>s.name===(m[1]?.replaceAll("''", "'")??m[2])):sheet):null;
  if(!target){rule.unsupported='Named, external or unsupported validation range';continue;}
  try{rule.options=rangeCells(m[3],500).map(c=>target.cells[c]?.value??'').filter(v=>v!=='');}catch{rule.unsupported='Validation option range exceeds supported bounds';}
  const combined=(rule.promptTitle+' '+rule.prompt+' '+(rule.options??[]).join(' '));rule.classification=/Хариуцлагын түвшин|Prepared by.*Reviewed by/.test(combined)?'responsibility-metadata':'categorical-options';
 }
 return {sha256:hash(bytes),sheets,externalLinks:[...names].filter(n=>/^xl\/externalLinks\//.test(n)),macros:[...names].filter(n=>/vbaProject/i.test(n)),engine:'bounded-ooxml-v1',formulaExecution:false};
}

export function workbookMappingPreview(book,mapping,sourceContract){
 const sheet=book.sheets.find(s=>s.name===mapping.sheet);if(!sheet)throw Error('Select an actual worksheet');
 const diagnostics=[],decisions=mapping.decisions??{},warnings=[];let body;
 const issue=(id,detail)=>{if(!decisions[id]?.trim())diagnostics.push({id,detail});else warnings.push({id,detail,decision:decisions[id]});};
 for(const f of sheet.formulas)if(f.classification==='unimplemented-formula')issue('formula:'+f.cell,'Formula is retained as source text; executable calculation needs a separate implemented method');
 for(const v of sheet.validations)if(v.unsupported)issue(v.id,v.unsupported);
 for(const link of book.externalLinks)issue('external:'+link,'External workbook data is not fetched');
 if(book.macros.length)issue('macros','Macros are not executed or imported as audit logic');
 if(mapping.mode==='source'){
  if(!sourceContract||sourceContract.sheet!==sheet.name)throw Error('The selected source form and exact sheet must match');
  body=structuredClone(sourceContract);
  for(const f of body.fields){
   const positions=String(f.source).split(':')[0].replaceAll('$',''),actual=sheet.cells[positions]?.value??'';
   if(!actual&&!f.columns)issue('field:'+f.key,'The source label/anchor is missing: '+f.source);
   if(actual&&actual!==f.label)issue('label:'+f.key,'Source anchor differs from the registered extracted label: '+f.source);
   if(actual&&actual!==f.label)f.sourceObserved=actual;
   f.sourceMapping={workbookSha256:book.sha256,sheet:sheet.name,coordinate:f.source,answerLocation:f.answerLocation??'',sourceRows:f.sourceRows??[]};
  }
  for(const c of body.clauses??[]){const actual=sheet.cells[c.source?.split(':')[0]]?.value;if(actual!==c.text)issue('clause:'+c.key,'Fixed source clause differs from the registered edition: '+c.source);}
 }else if(mapping.mode==='questions'){
  const columns=mapping.columns??{},head=Number(mapping.headerRow??1);if(!Number.isInteger(head)||head<1||head>1000||!columns.label)throw Error('Select the actual heading row and label column');
  for(const v of Object.values(columns))if(!/^[A-Z]{1,3}$/.test(v))throw Error('Invalid mapping column');
  const at=(row,key)=>sheet.cells[columns[key]+row]?.value??'',fields=[],clauses=[];
  const last=Math.min(2000,Math.max(0,...Object.keys(sheet.cells).map(a=>Number(a.match(/\d+$/)[0]))));
  for(let row=head+1;row<=last;row++){
   const label=at(row,'label');if(!label)continue;const type=at(row,'type')||'textarea',key=at(row,'key')||'r'+row,source=columns.label+row,instruction=at(row,'instruction');
   if(type==='heading'){clauses.push({key,text:label,source,classification:'heading',editable:false});continue;}
   if(type==='clause'){clauses.push({key,text:label,source,classification:'fixed document clause',editable:false});continue;}
   const f={key,label,type,source,instruction,required:['true','yes','1'].includes(at(row,'required').toLowerCase())};
   const rule=sheet.validations.find(v=>{try{return v.ranges.split(/\s+/).some(r=>rangeCells(r,10000).includes(columns.label+row)||columns.answer&&rangeCells(r,10000).includes(columns.answer+row));}catch{return false;}});
   const options=at(row,'options').split(';').map(v=>v.trim()).filter(Boolean);if(options.length)f.options=options;else if(rule?.options&&rule.classification!=='responsibility-metadata')f.options=rule.options;
   if(rule?.classification==='responsibility-metadata')f.roleSource={options:rule.options,source:rule.ranges,grantsAccess:false};
   if(at(row,'section'))f.section=at(row,'section');if(at(row,'whenKey'))f.when={key:at(row,'whenKey'),value:at(row,'whenValue')};
   if(type==='table'){try{f.columns=JSON.parse(at(row,'tableColumns'));}catch{issue('table:'+row,'A repeated table needs explicit typed column JSON');}}
   fields.push(f);
  }
  body={id:mapping.form,title:mapping.title||sheet.name,stage:Number(mapping.stage??1),sheet:sheet.name,family:'questionnaire',fields,clauses};
 }else throw Error('Unsupported mapping mode');
 const duplicate=body.fields.filter((f,i,a)=>a.findIndex(x=>x.key===f.key)!==i);for(const f of duplicate)diagnostics.push({id:'duplicate:'+f.key,detail:'Duplicate stable field identity'});
 body.provenance={engine:book.engine,workbookSha256:book.sha256,sheet:sheet.name,mapping,formulaExecution:false};
 const summary={sha256:book.sha256,sheet:sheet.name,fields:body.fields.map(f=>({key:f.key,label:f.label,type:f.type,source:f.source,options:f.options,columns:f.columns,when:f.when})),clauses:body.clauses,merges:sheet.merges,formulas:sheet.formulas,validations:sheet.validations,diagnostics,warnings,body};
 return {...summary,digest:hash(JSON.stringify(summary)),ready:diagnostics.length===0};
}
