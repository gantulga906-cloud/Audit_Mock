export type Role = 'preparer' | 'reviewer' | 'partner' | 'quality';
export type Status = 'not_started' | 'in_progress' | 'waiting' | 'submitted' | 'returned' | 'reviewed' | 'changed';
export interface Note { id: string; text: string; author: Role; response: string; cleared: boolean; version: number; }
export interface WorkRecord { status: Status; version: number; values: Record<string,string>; preparer: Role; notes: Note[]; history: {text:string;date:string;role:Role;version:number}[]; reviewedVersion?: number; submittedVersion?:number; evidence: string[]; snapshots?:Record<number,Record<string,string>>; qualityConfirmedVersion?:number; }
export interface FormDefinition {id:string; title:string; stage:number; kind:string; sheet:string; fields:{key:string;label:string;source:string}[];}
export const people: Record<Role,{name:string;initials:string;title:string;capacity:string;description:string}> = {
  preparer:{name:'Б. Номин',initials:'БН',title:'Туслах аудитор',capacity:'R1 · Бэлтгэсэн',description:'Миний даалгавар, нотлох баримт, хариу тайлбар'},
  reviewer:{name:'Т. Тэмүүлэн',initials:'ТТ',title:'Ахлах аудитор',capacity:'R2 · Хянасан 1',description:'Багийн ажил, ирсэн хяналт, нээлттэй тэмдэглэл'},
  partner:{name:'Д. Бат-Эрдэнэ',initials:'ДБ',title:'Гэрээт ажлын партнер',capacity:'R3 · Хянасан 2',description:'Чухал шийдвэр, материаллаг байдал, тайлагнал'},
  quality:{name:'С. Саруул',initials:'СС',title:'Чанарын хянагч',capacity:'R4 · Баталгаажуулсан',description:'Томилсон чанарын хяналт, шийдэгдээгүй асуудал'},
};
export const statusLabels:Record<Status,string>={not_started:'Эхлээгүй',in_progress:'Гүйцэтгэж буй',waiting:'Мэдээлэл хүлээж буй',submitted:'Хяналт хүлээж буй',returned:'Засварт буцаасан',reviewed:'Хянагдсан',changed:'Дахин хянах'};
export const stageNames=['Хүлээн авах, гэрээт ажил','Төлөвлөлт, эрсдэл','Горим, тестийн гүйцэтгэл','Дуусгалт, тайлагнал','Архив, хадгалалт'];
export const priorityIds=['3.1.2','1.1.1','1.3','3.1.4','2.6','1.4.1','4.6'];
export function canPrepare(role:Role,record:WorkRecord){return role===record.preparer && role!=='quality';}
export function canReview(role:Role,record:WorkRecord){return role!==record.preparer && ((role==='reviewer' && record.status==='submitted') || (role==='partner' && record.status==='submitted'));}
export function needsAcceptance(id:string,records:Record<string,WorkRecord>){return id==='1.1.1' && records['1.4.1']?.values.acceptance!=='Хүлээн авах';}
export function calculateMateriality(benchmark:string,percentage:string){
  if(benchmark.trim()===''||percentage.trim()==='')return null;
  const b=Number(benchmark),p=Number(percentage);
  if(!Number.isFinite(b)||!Number.isFinite(p)||b<=0||p<0||p>100)return null;
  return b*p/100;
}
export function saveRevision(record:WorkRecord,role:Role):WorkRecord{
  if(!canPrepare(role,record))throw new Error('Энэ ажлыг өөрчлөх томилгоо байхгүй.');
  return {...record,snapshots:{...record.snapshots,[record.version]:{...record.values}},version:record.version+1,status:record.reviewedVersion?'changed':'in_progress',submittedVersion:undefined,history:[{text:record.reviewedVersion?'Хянагдсан агуулга өөрчлөгдөв. Дахин хяналт шаардлагатай.':'Ажлын шинэ хувилбарыг хадгалав.',date:new Date().toISOString(),role,version:record.version+1},...record.history]};
}
export function submitRevision(record:WorkRecord,role:Role):WorkRecord{
  if(!canPrepare(role,record))throw new Error('Зөвхөн томилсон бэлтгэгч илгээнэ.');
  return {...record,snapshots:{...record.snapshots,[record.version]:{...record.values}},status:'submitted',submittedVersion:record.version,history:[{text:'Т. Тэмүүлэнгийн хяналтын дараалалд илгээв.',date:new Date().toISOString(),role,version:record.version},...record.history]};
}
export function reviewRevision(record:WorkRecord,role:Role):WorkRecord{
  if(!canReview(role,record))throw new Error('Энэ хувилбарыг хянах эрх байхгүй.');
  if(record.notes.some(n=>!n.cleared))throw new Error('Нээлттэй тэмдэглэлийг эхлээд шийдвэрлэнэ үү.');
  if(record.submittedVersion!==record.version)throw new Error('Илгээсэн хувилбар өөрчлөгдсөн байна.');
  return {...record,status:'reviewed',reviewedVersion:record.version,history:[{text:'Илгээсэн яг энэ хувилбарыг хянаж батлав.',date:new Date().toISOString(),role,version:record.version},...record.history]};
}
export function seedRecords(forms:FormDefinition[]):Record<string,WorkRecord>{
  return Object.fromEntries(forms.map((f,i)=>{
    let status:Status=i<12?'reviewed':i<21?'in_progress':'not_started';
    if(['3.1.2','1.3','3.1.4','2.6'].includes(f.id))status='in_progress';
    if(f.id==='1.1.1')status='waiting';
    if(['3.1.5','2.1.5','4.6'].includes(f.id))status='submitted';
    if(f.id==='1.4.1')status='in_progress';
    if(f.id==='3.1.8')status='returned';
    const values:Record<string,string>={};
    if(f.id==='1.1.1'){values.r10='Хан Алтай Үйлдвэрлэл ХХК · ХХК · РД 0000000 (жишээ)';values.r11='Үйлдвэрлэл, тоног төхөөрөмжийн худалдаа';values.r12='2025.01.01 – 2025.12.31';}
    if(f.id==='1.3'){values.benchmark='5000000000';values.percentage='1.5';values.basis='Орлогын суурийг жишээ гэрээт ажлын нөхцөлд сонгосон. Хувь нь загварын өгөгдөл.';}
    if(f.id==='3.1.2'){if(f.fields[0])values[f.fields[0].key]='Үндсэн хөрөнгийн бодлогыг хүлээн авч, өртгийн загвар ашиглаж байгааг тэмдэглэв.';if(f.fields[1])values[f.fields[1].key]='Нэмэгдлийн жагсаалтыг ерөнхий дэвтэртэй тулгасан. E-003 баримтыг үзнэ үү.';}
    const version=status==='reviewed'?2:1;
    return [f.id,{status,version,values,preparer:'preparer',notes:f.id==='3.1.8'?[{id:'seed-note',text:'Банкны тулгалтын үлдэгдэл зөрүүний тайлбар, баримтыг нэмж холбоно уу.',author:'reviewer',response:'',cleared:false,version:1}]:[],history:[{text:status==='reviewed'?'Жишээ ажлын хянагдсан хувилбар.':'Ажлын маягт үүсгэв.',date:'2026-11-02T09:00:00.000Z',role:'preparer',version}],...(status==='reviewed'?{reviewedVersion:version}:{}),...(status==='submitted'?{submittedVersion:version}:{}),evidence:f.id==='3.1.2'?['E-003']:[]} satisfies WorkRecord];
  }));
}
