export const workspacePages = {
 home: {label:'Миний ажил',description:'Танд хуваарилсан ажил, хяналт болон дараагийн шийдвэр.'},
 clients: {label:'Үйлчлүүлэгчид',description:'Үйлчлүүлэгч, аудитын хүсэлт болон гэрээт ажлууд.'},
 overview: {label:'Ерөнхий тойм',description:'Гэрээт ажлын бэлэн байдал, хариуцлага болон шийдвэр.'},
 workpapers: {label:'Ажлын баримтууд',description:'Хөтөлбөр, горим болон ажлын баримтын нэгдсэн бүртгэл.'},
 evidence: {label:'Нотлох баримт',description:'Эх файл, хүсэлт, хүлээн авалт болон үнэлгээ.'},
 data: {label:'Өгөгдөл ба шинжилгээ',description:'Эх өгөгдлөөс хянаж зөвшөөрсөн олонлог хүртэл.'},
 planning: {label:'Төлөвлөгөө',description:'Эрсдэл, хариу арга хэмжээ, багийн ажил болон хугацаа.'},
 review: {label:'Хяналт',description:'Илгээсэн хувилбар, нээлттэй тэмдэглэл болон өөрчлөлтийн нөлөө.'},
 completion: {label:'Дуусгалт ба тайлан',description:'Илэрсэн асуудлаас яг баталсан тайлангийн багц хүртэл.'},
 archive: {label:'Эцсийн файл',description:'Архив, хадгалалтын хүлээлцэх болон хяналттай өөрчлөлт.'},
 people: {label:'Баг ба нөөц',description:'Ажилтны мэргэшил, боломжит цаг болон томилгоо.'},
 library: {label:'Маягтын сан',description:'Эрх олгосон маягт, хувилбар болон нийтлэх шийдвэр.'},
 admin: {label:'Фирмийн бүртгэл',description:'Фирмийн мэдээлэл болон эрхийн хүрээнд хийх бүртгэл.'},
 history: {label:'Үйлдлийн түүх',description:'Бодит үйлдэл, хариуцсан хүн болон огноо.'},
} as const;
export type WorkspacePage = keyof typeof workspacePages;
export const workspaceFilters=['all','mine','review','returned','blocked','reviewed'] as const;
export type WorkspaceFilter=typeof workspaceFilters[number];
export type WorkspaceRoute = {engagement:string|null;page:WorkspacePage;paper:string|null;filter?:WorkspaceFilter;stage?:string};
export function readWorkspaceRoute(search:string):WorkspaceRoute {
 const params=new URLSearchParams(search),value=params.get('view')??'home',id=params.get('engagement');
 const page=Object.hasOwn(workspacePages,value)?value as WorkspacePage:'home',list=page==='workpapers'||page==='review';
 const filter=params.get('filter'),stage=params.get('stage');
 return {engagement:id&&id!=='firm'?id:null,page,paper:params.get('paper')||null,
  ...(list&&workspaceFilters.includes(filter as WorkspaceFilter)?{filter:filter as WorkspaceFilter}:{}),
  ...(list&&stage!==null&&/^[1-5]?$/.test(stage)?{stage}:{}),};
}
export function workspaceUrl(route:WorkspaceRoute,pathname='/pilot') {
 const query=new URLSearchParams({engagement:route.engagement??'firm',view:route.page});
 if(route.paper&&route.page==='workpapers')query.set('paper',route.paper);
 if(route.page==='workpapers'||route.page==='review'){
  if(route.filter)query.set('filter',route.filter);
  if(route.stage!==undefined)query.set('stage',route.stage);
 }
 return pathname+'?'+query.toString();
}
export function paperAttention(paper:{status:string;pendingPlanning?:boolean;fieldGap?:string;requestGap?:string;nativeGaps?:string[];notes:{cleared?:unknown}[]}) {
 return paper.pendingPlanning||paper.fieldGap||paper.requestGap||paper.nativeGaps?.length?'blocked':
  paper.status==='returned'||paper.status==='changed'?'returned':paper.status==='submitted'?'review':paper.status==='reviewed'?'reviewed':'prepare';
}
