import type {Grid} from './workbench';

type Entry={offset:number;size:number;method:number;plain:number};
async function office(file:Blob){
 if(file.size>16_000_000)throw Error('16 MB хүртэл файлыг урьдчилан үзнэ.');
 const bytes=new Uint8Array(await file.arrayBuffer()),v=new DataView(bytes.buffer),entries=new Map<string,Entry>();
 const u16=(p:number)=>v.getUint16(p,true),u32=(p:number)=>v.getUint32(p,true);
 let end=bytes.length-22;while(end>=Math.max(0,bytes.length-65557)&&u32(end)!==0x06054b50)end--;
 if(end<0||end<bytes.length-65557)throw Error('Office файлын бүтэц танигдсангүй.');
 let i=u32(end+16);const count=u16(end+10);if(count>4000)throw Error('Файлын бүтэц хэт том.');
 const d=new TextDecoder();
 for(let n=0;n<count;n++){
  if(u32(i)!==0x02014b50)throw Error('Office файлын индекс эвдэрсэн.');
  const len=u16(i+28),name=d.decode(bytes.slice(i+46,i+46+len));
  entries.set(name,{offset:u32(i+42),size:u32(i+20),plain:u32(i+24),method:u16(i+10)});
  i+=46+len+u16(i+30)+u16(i+32);
 }
 return async (name:string,optional=false)=>{
  const f=entries.get(name);
  if(!f){if(optional)return new DOMParser().parseFromString('<empty/>','application/xml');throw Error('Office дотор шаардлагатай хэсэг алга.');}
  if(f.plain>10_000_000||u32(f.offset)!==0x04034b50)throw Error('Office хэсэг эвдэрсэн эсвэл хэт том.');
  const start=f.offset+30+u16(f.offset+26)+u16(f.offset+28),data=bytes.slice(start,start+f.size);
  let output:string;
  if(f.method===0)output=d.decode(data);
  else if(f.method===8){
   const stream=new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw')),reader=stream.getReader();let total=0;const chunks:string[]=[];
   while(true){const step=await reader.read();if(step.done)break;total+=step.value.byteLength;if(total>10_000_000){await reader.cancel();throw Error('Office хэсэг хэт том.');}chunks.push(d.decode(step.value,{stream:true}));}
   output=chunks.join('')+d.decode();
  }else throw Error('Файлын шахалтын хэлбэрийг дэмжихгүй.');
  if(/<!DOCTYPE|<!ENTITY/i.test(output))throw Error('Office XML бүтэц танигдсангүй.');
  const xml=new DOMParser().parseFromString(output,'application/xml');
  if(xml.getElementsByTagName('parsererror').length)throw Error('Office XML бүтэц эвдэрсэн.');
  return xml;
 };
}
const nodes=(node:Document|Element,name:string)=>Array.from(node.getElementsByTagNameNS('*',name));
const value=(node:Element,name:string)=>nodes(node,name)[0]?.textContent??'';
export async function readWorkbook(file:Blob):Promise<Grid[]>{
 const xml=await office(file);
 const [book,rels,strings]=await Promise.all([xml('xl/workbook.xml'),xml('xl/_rels/workbook.xml.rels'),xml('xl/sharedStrings.xml',true)]);
 const shared=nodes(strings,'si').map(el=>nodes(el,'t').map(x=>x.textContent).join(''));
 const targets=new Map(nodes(rels,'Relationship').map(n=>[n.getAttribute('Id'),n.getAttribute('Target')]));
 const sheets=nodes(book,'sheet').slice(0,12);
 return Promise.all(sheets.map(async sheet=>{
  const id=sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')??sheet.getAttribute('r:id'),target=targets.get(id);
  if(!target||target.includes('..')||target.includes(':'))throw Error('Хуудасны холбоос дэмжигдэхгүй.');
  const page=await xml(target.startsWith('/')?target.slice(1):'xl/'+target);
  const rows:string[][]=[];
  for(const row of nodes(page,'row').slice(0,1000)){
   const index=Math.min(1000,Number(row.getAttribute('r'))||rows.length+1)-1;
   const cells:string[]=[];
   for(const c of nodes(row,'c')){
    const address=(c.getAttribute('r')??'').match(/^[A-Z]+/)?.[0];if(!address)continue;
    const col=[...address].reduce((sum,ch)=>sum*26+ch.charCodeAt(0)-64,0)-1;if(col>99)continue;
    const raw=value(c,'v'),type=c.getAttribute('t');
    cells[col]=type==='s'?shared[Number(raw)]??'':type==='inlineStr'?nodes(c,'t').map(t=>t.textContent).join(''):raw;
   }
   rows[index]=Array.from(cells,x=>x??'');
  }
  return {name:sheet.getAttribute('name')??'Хуудас',rows:Array.from(rows,x=>x??[]),notes:[...(nodes(page,'f').length?['Томьёоны хадгалсан утгыг л үзүүлэв; тооцооллыг импортлоогүй.']:[]),...(nodes(page,'dataValidation').length?['Excel-ийн validation дүрмийг автоматаар хөрвүүлээгүй.']:[])]};
 }));
}
export async function readWord(file:Blob){const xml=await office(file),doc=await xml('word/document.xml');return nodes(doc,'p').slice(0,160).map(p=>nodes(p,'t').map(t=>t.textContent).join('')).join('\n');}
function openFiles(){
 return new Promise<IDBDatabase>((resolve,reject)=>{const db=indexedDB.open('audit-evidence-local',1);db.onupgradeneeded=()=>db.result.createObjectStore('originals');db.onsuccess=()=>resolve(db.result);db.onerror=()=>reject(db.error);});
}
export async function retainFile(id:string,file:Blob){
 const db=await openFiles();
 try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('originals','readwrite');tx.objectStore('originals').put(file,id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}
}
export async function loadFile(id:string){
 const db=await openFiles();
 try{return await new Promise<Blob|undefined>((resolve,reject)=>{const r=db.transaction('originals','readonly').objectStore('originals').get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}finally{db.close();}
}
