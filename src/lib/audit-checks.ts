import type {Model} from './workspace';
import {issuedRequest} from './feature-workflows.ts';

export type CheckId='AUTO-005'|'AUTO-006'|'AUTO-027';
export type CheckResult={rows:{key:string;expected:number;recorded:number;difference:number}[];issues:string[]};
export const profiles:Record<CheckId,{title:string;input:string;sample:string}>={
 'AUTO-005':{title:'Дансны үлдэгдлийн хөдөлгөөн',input:'account,opening,debits,credits,closing',sample:'account,opening,debits,credits,closing\n1100,100000,50000,30000,120000\n1200,40000,20000,30000,35000'},
 'AUTO-006':{title:'Данс → тайлангийн мөр',input:'account,line,closing | line,reported',sample:'account,line,closing\n1100,Cash,120000\n1200,Receivables,30000\n1210,Receivables,5000'},
 'AUTO-027':{title:'Үндсэн хөрөнгийн бүртгэлийн тулгалт',input:'class,opening,additions,disposals,closing,ledger',sample:'class,opening,additions,disposals,closing,ledger\nEquipment,100000,40000,5000,135000,135000\nVehicles,80000,15000,0,95000,90000'},
};
export const statementSample='line,reported\nCash,120000\nReceivables,35000';

function table(text:string,keys:string[]){
 const rows=text.trim().split(/\r?\n/);
 if(rows.shift()?.replace(/^\uFEFF/,'').split(',').map(x=>x.trim()).join(',')!==keys.join(','))throw Error('Баганын дараалал: '+keys.join(','));
 if(!rows.length||rows.length>20000)throw Error('1–20,000 мөр шаардлагатай.');
 return rows.map((r,i)=>{
  const cells=r.split(',').map(s=>s.trim());
  if(cells.length!==keys.length||cells.some(s=>!s))throw Error(`Мөр ${i+2}: хоосон эсвэл баганын тоо буруу.`);
  return cells;
 });
}
function amount(s:string){
 if(!/^-?\d+(\.\d{1,2})?$/.test(s))throw Error('Дүн нь хоёр хүртэл бутархай оронтой тоо байна: '+s);
 const cents=Math.round(Number(s)*100);if(!Number.isSafeInteger(cents)||Math.abs(cents)>1e12)throw Error('Дүн демо хязгаараас их.');
 return cents;
}
function push(r:CheckResult,key:string,expected:number,recorded:number){
 const difference=recorded-expected;r.rows.push({key,expected:expected/100,recorded:recorded/100,difference:difference/100});
 if(difference)r.issues.push(key+' · зөрүү '+(difference/100).toLocaleString());
}
function unique(keys:Set<string>,key:string){if(keys.has(key))throw Error('Таних код давхардсан: '+key);keys.add(key);}
export function checkData(id:CheckId,input:string,statements=''):CheckResult{
 const result:CheckResult={rows:[],issues:[]},seen=new Set<string>();
 if(id==='AUTO-005'){
  for(const [account,o,d,c,close] of table(input,['account','opening','debits','credits','closing'])){
   unique(seen,account);push(result,account,amount(o)+amount(d)-amount(c),amount(close));
  }
 }else if(id==='AUTO-006'){
  const mapped=new Map<string,number>(),recorded=new Map<string,number>();
  for(const [account,line,closing] of table(input,['account','line','closing'])){
   unique(seen,account);const n=amount(closing);
   if(line==='UNMAPPED'){result.issues.push(account+' · холболтгүй: '+n/100);continue;}
   mapped.set(line,(mapped.get(line)??0)+n);
  }
  for(const [line,reported] of table(statements,['line','reported'])){if(recorded.has(line))throw Error('Тайлангийн мөр давхардсан: '+line);recorded.set(line,amount(reported));}
  for(const line of new Set([...mapped.keys(),...recorded.keys()])){
   if(!mapped.has(line)||!recorded.has(line)){result.issues.push(line+' · хослох мөр дутуу');continue;}
   push(result,line,mapped.get(line)!,recorded.get(line)!);
  }
 }else{
  for(const [group,o,a,d,close,ledger] of table(input,['class','opening','additions','disposals','closing','ledger'])){
   unique(seen,group);push(result,group+' · хөдөлгөөн',amount(o)+amount(a)-amount(d),amount(close));push(result,group+' · ерөнхий дэвтэр',amount(close),amount(ledger));
  }
 }
 return result;
}

export function evidenceCoverage(m:Model,id:string){
 return m.requests.filter(r=>r.engagement===id&&issuedRequest(r)).map(r=>{
  const refs=new Set([...r.evidence,...m.evidence.filter(e=>e.engagement===id&&e.request===r.id).map(e=>e.id)]),files=m.evidence.filter(e=>e.engagement===id&&refs.has(e.id));
  const accepted=r.parts?r.parts.filter(p=>p.state==='accepted'&&files.some(e=>e.id===p.evidence&&e.status==='accepted')).length:files.filter(e=>e.status==='accepted').length;
  const status=accepted>=r.expected?'covered':accepted?'partial':files.length&&files.every(e=>e.status==='rejected')?'rejected':'missing';
  return {id:r.id,title:r.title,accepted,expected:r.expected,status};
 });
}

export function projectRatio(population:{id:string;amount:number}[],results:{id:string;error:number}[]){
 const amounts=new Map(population.map(p=>[p.id,p.amount]));
 if(amounts.size!==population.length||!results.length||new Set(results.map(r=>r.id)).size!==results.length||population.some(p=>!Number.isFinite(p.amount)||p.amount<0)||results.some(r=>!amounts.has(r.id)||!Number.isFinite(r.error)))throw Error('Сонгосон нэгж, бүрэн шалгасан үр дүн, эерэг суурийг шалгана уу.');
 const tested=results.reduce((a,r)=>a+amounts.get(r.id)!,0),total=population.reduce((a,p)=>a+p.amount,0),error=results.reduce((a,r)=>a+r.error,0);
 if(tested<=0)throw Error('Шалгасан нэгжийн дүн тэг тул төсөөлөх боломжгүй.');
 return {tested,total,error,projection:error/tested*total};
}
