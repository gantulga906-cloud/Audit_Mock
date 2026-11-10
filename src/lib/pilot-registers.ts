export type PilotRole='preparer'|'reviewer'|'partner';
export const pilotScope=(id:string|null)=>'?engagement='+encodeURIComponent(id??'firm');
export const latestArchiveSelection='latest-sealed';
export type RecordStatus='draft'|'submitted'|'returned'|'approved';
type Choice=readonly [value:string,label:string];
export type RegisterField={key:string;label:string;type?:'long'|'date'|'number'|'choice'|'record'|'evidence'|'form'|'programme';optional?:boolean;choices?:readonly Choice[];target?:string;forTypes?:string[]};
type Register={id:string;label:string;section:string;writers:readonly PilotRole[];approvers:readonly PilotRole[];fields:readonly RegisterField[]};
export type ProgrammeBasis={
 risk:{id:string;version:number;name:string;target:string;assertion:string;response:string};
 materiality?:{version:number;overall:number;performance:number;trivial:number;source?:string};
 reliance?:{version:number;level:string;basis:string;evidence?:string;evidenceVersion?:number};
 procedure?:{key:string;label:string;nature:string;timing:string;extent:string};
};
export type RegisterRevision={version:number;status:RecordStatus;values:Record<string,string>;references:Record<string,number>;by:PilotRole;at:string;reason:string;
 programmeBasis?:ProgrammeBasis;template?:{form:string;sheet:string;digest:string;number?:number};
 populationBasis?:{version:number;evidence:string;line:string;sha256:string}};
export type PilotRecord=RegisterRevision&{
 id:string;kind:string;owner:PilotRole;history:RegisterRevision[];stale?:boolean;
 statementVersion?:number;
 paperVersions?:Record<string,number>;
 declaration?:{text:string;by:PilotRole;at:string;evidence?:string};
 discussion?:{text:string;by:PilotRole;at:string}[];
 verification?:{by:PilotRole;at:string;files:number;digest?:string;restored:boolean;ok:boolean;error?:string};
 eligibility?:{policy:string;expires:string;synthetic:boolean};executedAt?:string;successor?:string;
 revoked?:{by:PilotRole;at:string;reason:string};
};
const short=(key:string,label:string,optional=false):RegisterField=>({key,label,optional});
const long=(key:string,label:string,optional=false):RegisterField=>({key,label,type:'long',optional});
const date=(key:string,label:string,optional=false):RegisterField=>({key,label,type:'date',optional});
const number=(key:string,label:string,optional=false):RegisterField=>({key,label,type:'number',optional});
const choice=(key:string,label:string,...choices:Choice[]):RegisterField=>({key,label,type:'choice',choices});
const link=(key:string,label:string,target:string,optional=false):RegisterField=>({key,label,type:'record',target,optional});
const evidence=(key:string,label:string,optional=false):RegisterField=>({key,label,type:'evidence',optional});
const form=(key:string,label:string,optional=false):RegisterField=>({key,label,type:'form',optional});
const define=(id:string,label:string,section:string,fields:RegisterField[],writers:PilotRole[]=['reviewer'],approvers:PilotRole[]=['partner']):Register=>({id,label,section,fields,writers,approvers});
const forTypes=(field:RegisterField,...types:string[]):RegisterField=>({...field,optional:true,forTypes:types});
const team=['preparer','reviewer'] as PilotRole[];
const senior=['reviewer','partner'] as PilotRole[];
export const roleChoices:readonly Choice[]=[['preparer','Бэлтгэгч'],['reviewer','Ахлах хянагч'],['partner','Партнер']];
export const staffingChoices:readonly Choice[]=[...roleChoices,['specialist','Гадаад мэргэжилтэн']];
export const sections=[['firm','Фирм ба арга зүй'],['acceptance','Хүлээн авах ба хараат бус байдал'],['planning','Төлөвлөлт ба эрсдэл'],['fieldwork','Гүйцэтгэл ба нотлох баримт'],['completion','Дуусгалт ба тайлагнал'],['archive','Архив ба хадгалалт']] as const;
export const registers:readonly Register[]=[
 define('M01-F01','Фирмийн бүртгэл','firm',[short('name','Хуулийн нэр'),short('licence','Бүртгэл / тусгай зөвшөөрлийн ишлэл'),short('reporting','Тайланд хэрэглэх нэр'),short('contact','Үйл ажиллагааны холбоо барих мэдээлэл')]),
 define('M01-F02','Алба, салбар ба баг','firm',[short('name','Нэр'),choice('type','Төрөл',['office','Салбар'],['practice','Практикийн бүлэг'],['team','Баг']),link('parent','Харьяалах нэгж','M01-F02',true),choice('status','Төлөв',['active','Идэвхтэй'],['inactive','Идэвхгүй'])]),
 define('M01-F03','Мэргэжилтний бүртгэл','firm',[short('name','Нэр'),short('reference','Ажилтны давтагдашгүй дугаар'),link('unit','Харьяалах нэгж','M01-F02',true),choice('status','Төлөв',['active','Идэвхтэй'],['inactive','Идэвхгүй'],['external','Гадаад']),{...choice('account','Туршилтын нэвтрэх дүр',...roleChoices),optional:true},date('availableFrom','Боломжтой эхлэх өдөр',true),date('availableTo','Боломжтой дуусах өдөр',true),number('capacityHours','Энэ хугацаанд боломжит нийт цаг',true)]),
 define('M01-F04','Мэргэшил ба үнэмлэх','firm',[link('person','Мэргэжилтэн','M01-F03'),short('qualification','Мэргэшил, үнэмлэх'),short('sector','Салбар'),short('skill','Ур чадвар'),short('issuer','Олгосон байгууллага',true),date('validFrom','Хүчинтэй эхлэх өдөр',true),date('validTo','Хүчинтэй дуусах өдөр',true),{...choice('validity','Хүчинтэй хугацааны төрөл',['dated','Огноотой'],['no-expiry','Хугацаагүй'],['unknown','Тодорхойгүй']),optional:true},short('source','Эх сурвалжийн ишлэл')]),
 define('M01-F06','Фирмийн үүрэг ба хөдөлмөрийн төлөв','firm',[link('person','Мэргэжилтэн','M01-F03'),short('role','Фирмийн үүрэг'),{...choice('capacity','Томилсон аудитын үүрэг',...staffingChoices),optional:true},choice('employment','Хөдөлмөрийн хэлбэр',['employee','Ажилтан'],['contractor','Гэрээт'],['external','Гадаад']),date('from','Хүчинтэй эхлэх өдөр'),date('to','Хүчинтэй дуусах өдөр',true),long('basis','Томилгооны үндэслэл')]),
 define('M02-F05','Хөтөлбөр хэрэглэх дүрэм','firm',[{key:'programme',label:'Эх хөтөлбөр',type:'programme'},choice('profile','Нөхцөлийн төрөл',['all','Бүх ажил'],['framework','Тайлагналын стандарт'],['legalForm','Хуулийн хэлбэр']),short('match','Нөхцөлийн утга',true),choice('outcome','Хэрэглэх төлөв',['required','Заавал'],['optional','Сонголтоор'],['excluded','Хамаарахгүй']),choice('override','Зөрүү зөвшөөрөх эсэх',['no','Үгүй'],['yes','Тийм']),long('basis','Дүрмийн үндэслэл')]),
 define('M03-F04','Өмчлөл ба бүлгийн холбоо','acceptance',[short('name','Талын нэр'),short('registration','Бүртгэлийн дугаар',true),choice('relation','Харилцаа',['owner','Өмчлөгч'],['controller','Хяналттай тал'],['related','Холбоотой тал'],['group','Группийн нэгж']),number('share','Өмчлөлийн хувь',true),date('effective','Хүчинтэй өдөр'),short('source','Эх сурвалж'),long('basis','Харилцааны тайлбар')],team,senior),
 define('M04-F02','Үйлчлүүлэгчийн шударга байдал ба эрсдэл','acceptance',[short('concern','Асуудал / шалгасан чиглэл'),link('party','Холбоотой тал','M03-F04',true),short('source','Эх сурвалж'),evidence('evidence','Үнэлгээний эх файл',true),choice('owner','Хариуцах хүн',...roleChoices),choice('result','Шийдвэр',['open','Шийдэгдээгүй'],['addressed','Шийдвэрлэсэн'],['none','Асуудал илрээгүй']),long('basis','Үнэлгээ ба үндэслэл')],team),
 define('M04-F04','Хараат бус байдлын мэдүүлэг','acceptance',[choice('assignee','Багийн мэдүүлэгч',['preparer','Бэлтгэгч'],['reviewer','Ахлах хянагч'],['partner','Партнер'],['external','Гадаад мэргэжилтэн']),link('person','Гадаад мэргэжилтэн','M01-F03',true),long('scope','Мэдүүлгийн хамрах хүрээ'),date('due','Өгөх хугацаа')],['reviewer','partner'],senior),
 define('M04-F05','Хараат бус байдлын эрсдэл ба хамгаалалт','acceptance',[short('threat','Эрсдэл'),link('party','Холбоотой тал','M03-F04',true),choice('significance','Ач холбогдол',['low','Бага'],['medium','Дунд'],['high','Өндөр']),choice('owner','Хариуцагч',...roleChoices),long('safeguard','Хамгаалалт'),date('followup','Дагаж хянах өдөр'),choice('residual','Үлдэгдэл үнэлгээ',['open','Шийдэгдээгүй'],['acceptable','Хүлээн зөвшөөрөх'],['unacceptable','Хүлээн авах боломжгүй']),long('basis','Үнэлгээний үндэслэл')],team),
 define('M04-F06','Багийн нөөц ба тохирох байдал','acceptance',[choice('capacity','Гэрээт ажлын үүрэг',...staffingChoices),link('person','Томилох мэргэжилтэн','M01-F03'),link('credential','Холбогдох мэргэшил','M01-F04',true),link('appointment','Фирмийн хүчинтэй томилгоо','M01-F06',true),date('assignmentDate','Томилгооны эхлэх өдөр'),date('assignmentEnd','Томилгооны дуусах өдөр',true),number('hours','Төлөвлөсөн цаг'),link('declaration','Гадаад мэргэжилтний мэдүүлэг','M04-F04',true),{...choice('supervisor','Хариуцах аудитор',roleChoices[1],roleChoices[2]),optional:true},long('deliverable','Хүлээж буй үр дүн',true),long('needs','Ур чадвар, цаг ба мэргэжилтний хэрэгцээ'),choice('result','Үнэлгээ',['gap','Нөөц дутуу'],['suitable','Тохирно']),long('basis','Тохирох байдлын үндэслэл')]),
 define('M06-F02','Байгууллага ба тайлагналын ойлголт','planning',[long('business','Бизнесийн загвар'),long('objectives','Зорилго'),long('governance','Засаглал'),long('environment','Гадаад хүчин зүйл'),short('framework','Тайлагналын стандарт'),link('party','Группийн холбоос','M03-F04',true),short('source','Эх сурвалж')],team,senior),
 define('M06-F04','Залилангийн эрсдэлийн үнэлгээ','planning',[short('risk','Эрсдэлийн нэр'),link('entity','Байгууллагын ойлголтын бүртгэл','M06-F02',true),long('factors','Нөхцөл ба хүчин зүйл'),long('inquiry','Лавлагаа ба эх сурвалж'),long('presumption','Таамаглал / онцгой нөхцөлийн үндэслэл'),short('assertion','Батламж'),long('response','Төлөвлөсөн хариу арга хэмжээ')],team,senior),
 define('M06-F05','Бусдын ажил ба эхний үлдэгдэл','planning',[short('area','Данс / тайлангийн хэсэг'),long('reliance','Ашигласан өмнөх буюу бусдын ажил'),long('test','Эхний үлдэгдлийн шалгалт'),evidence('evidence','Нотлох баримт',true),long('limitations','Хязгаарлалт'),long('effect','Одоогийн аудитын хандлагад үзүүлэх нөлөө')],team,senior),
 define('M06-F06','Урьдчилсан шинжилгээ ба хамрах хүрээ','planning',[short('area','Данс / мөчлөг'),short('populationLine','Баталсан эх олонлогийн мөр',true),number('expected','Өмнөх үе эсвэл хүлээгдэж буй дүн'),number('actual','Бүртгэлтэй дүн'),number('threshold','Сонгосон босго'),short('source','Оролтын эх сурвалж'),long('investigation','Зөрүүний шинжилгээ',true),long('scope','Мөчлөгийн хамрах хүрээ ба дүгнэлт')],team,senior),
 define('M06-F09','Эрсдэл ба тайлангийн хэсгийн холбоос','planning',[short('risk','Эрсдэлийн нэр'),link('entity','Байгууллагын ойлголтын бүртгэл','M06-F02',true),link('fraud','Залилангийн эрсдэлийн бүртгэл','M06-F04',true),link('analytics','Урьдчилсан шинжилгээ','M06-F06',true),choice('type','Холбоосын төрөл',['account','Данс'],['line','Тайлангийн мөр'],['disclosure','Тодруулга'],['process','Процесс'],['control','Хяналт']),short('target','Данс, мөр эсвэл хяналтын код'),short('assertion','Батламж'),long('response','Төлөвлөсөн хариу арга хэмжээ'),{key:'programme',label:'Санал болгох хөтөлбөр',type:'programme'}],team,senior),
 define('M07-F01','Хэрэгжүүлэх хөтөлбөрийг сонгох','planning',[link('rule','Батлагдсан арга зүйн дүрэм','M02-F05'),link('risk','Батлагдсан эрсдэл ба хариу','M06-F09'),choice('decision','Гэрээт ажлын сонголт',['adopt','Хэрэгжүүлнэ'],['exclude','Хамаарахгүй']),long('basis','Шийдвэр / зөрүүний үндэслэл'),
  { ...choice('approach','Аудитын арга хандлага',['substantive','Хяналтад найдахгүй · мөн чанарын горим'],['reliance','Хяналтад найдаж, мөн чанарын горим хэрэгжүүлэх']), optional:true },
  short('templateVersion','Хөтөлбөрийн маягтын хувилбар',true),short('procedure','Хариу горим',true),
  long('nature','Горимын шинж',true),long('timing','Хугацааны төлөвлөгөө',true),long('extent','Хамрах хүрээ',true)]),
 define('M07-F06','Мөн чанарын шинжилгээ','fieldwork',[link('programme','Хэрэгжүүлсэн хөтөлбөр','M07-F01'),number('expected','Хүлээгдэж буй дүн'),number('actual','Бодит дүн'),number('precision','Нарийвчлал'),number('threshold','Зөрүүний босго'),long('reliability','Өгөгдлийн найдвартай байдал'),evidence('evidence','Нотлох баримт'),long('investigation','Шинжилгээ',true),long('conclusion','Дүгнэлт')],team,senior),
 define('M07-F08','Гуравдагч талын баталгаажуулалт','fieldwork',[link('programme','Хэрэгжүүлсэн хөтөлбөр','M07-F01'),short('recipient','Хүлээн авагч'),short('address','Хянасан холбоо барих хаяг'),date('sent','Бодитоор гаргасан өдөр',true),date('due','Хариу авах өдөр'),choice('result','Хариуны төлөв',['pending','Хүлээгдэж буй'],['received','Ирсэн'],['difference','Зөрүүтэй'],['none','Хариугүй']),evidence('response','Ирсэн эх файл',true),long('provenance','Суваг, гарал үүсэл, хяналт'),long('resolution','Зөрүү / өөр горимын шийдэл',true)],team,senior),
 define('M07-F09','Журналын бичилтийн сорил','fieldwork',[link('programme','Хэрэгжүүлсэн хөтөлбөр','M07-F01'),evidence('population','Эх олонлогийн файл'),short('entry','Сонгосон бичилтийн ID'),short('line','Мөр / дансны код'),long('selection','Сонгосон шалгуур'),evidence('evidence','Шалгалтын нотолгоо'),long('test','Гүйцэтгэсэн сорил'),long('exception','Зөрүү / илрүүлэлт',true),long('conclusion','Дүгнэлт')],team,senior),
 define('M07-F10','Дуусгалтад нөлөөлөх тусгай горим','fieldwork',[choice('type','Ажлын төрөл',['subsequent','Дараа үеийн үйл явдал'],['going','Тасралтгүй ажиллагаа'],['legal','Хууль, болзошгүй өр төлбөр'],['related','Холбоотой тал'],['minutes','Хурлын тэмдэглэл'],['estimate','Нягтлан бодох бүртгэлийн тооцоолол'],['component','Группийн бүрэлдэхүүн хэсэг']),
  forTypes(date('coverageThrough','Шалгалтын хамрах эцсийн өдөр'),'subsequent','going'),
  form('paper','Холбогдох ажлын баримт'),evidence('evidence','Нотлох баримт',true),
  forTypes(link('party','Баталсан өмчлөл / бүлгийн холбоо','M03-F04'),'related','component'),
  forTypes(short('sourceRef','Гүйлгээ, асуудал эсвэл бүрэлдэхүүний лавлагаа'),'related','component','estimate','legal','minutes'),
  forTypes(short('criterion','Хэрэглэсэн аргачлал, хэвлэл эсвэл шаардлага'),'estimate','component','going'),
  forTypes(long('assumptions','Таамаглал, өгөгдөл ба эрсдэл'),'estimate','going'),
  forTypes(number('recorded','Удирдлагын тооцоолол'),'estimate'),
  forTypes(number('low','Дэмжигдсэн доод дүн'),'estimate'),
  forTypes(number('high','Дэмжигдсэн дээд дүн'),'estimate'),
  forTypes(short('contributor','Хариуцсан бүрэлдэхүүний аудитор'),'component'),
  forTypes(long('scope','Хамрах хүрээ, өгсөн заавар ба материаллаг байдал'),'component'),
  forTypes(long('eligibility','Мэргэшил, хараат бус байдал ба группийн оролцоо'),'component'),
  forTypes(long('contrary','Зөрчилтэй нотолгоо, хязгаарлалт ба дагах ажил'),'estimate','component','related','going','legal'),
  forTypes(long('effect','Нягтлан бодох бүртгэл, тодруулга эсвэл группийн дүгнэлтэд үзүүлэх нөлөө'),'estimate','component','related','going','legal'),
  long('work','Гүйцэтгэсэн ажил'),choice('result','Төлөв',['open','Шийдэгдээгүй'],['resolved','Шийдвэрлэсэн'],['limited','Хязгаарлалттай'],['na','Хамаарахгүй']),long('conclusion','Дүгнэлт ба үндэслэл')],team,senior),
 define('M08-F07','Эх баримтын тэмдэглэгээ','fieldwork',[evidence('evidence','Эх баримтын хувилбар'),choice('anchorKind','Байршлын төрөл',['page','PDF хуудас'],['cell','Хүснэгтийн нүд'],['location','Бусад байршил']),short('anchor','Хуудасны дугаар, Sheet!A1 эсвэл байршил'),choice('mark','Тэмдэглэгээ',['tick','Тулгасан тэмдэг'],['comment','Тайлбар'],['question','Асуулт']),long('comment','Тайлбар')],['preparer','reviewer','partner'],senior),
 define('M10-F06','Эцсийн шинжилгээ','completion',[short('line','Батлагдсан тайлангийн мөр'),number('expected','Хүлээгдэж буй дүн'),number('actual','Эцсийн дүн'),number('threshold','Сонгосон босго'),link('risk','Холбогдох эрсдэл','M06-F09',true),form('paper','Холбогдох ажлын баримт',true),long('investigation','Зөрүүний шинжилгээ',true),long('conclusion','Дүгнэлт')],team,senior),
 define('M10-F08','Нотолгооны хангалттай байдлын дүгнэлт','completion',[link('analytics','Эцсийн шинжилгээ','M10-F06'),long('limitations','Хамрах хүрээний хязгаарлалт'),long('contradictions','Зөрчилтэй баримт'),long('findings','Материаллаг илрүүлэлтүүд'),choice('result','Үнэлгээ',['pending','Шийдэгдээгүй'],['sufficient','Хангалттай'],['limited','Хязгаарлалттай']),long('basis','Дүгнэлт ба үндэслэл')]),
 define('M10-F09','Аудитын санал дүгнэлтийн шийдвэр','completion',[link('sufficiency','Хянасан нотолгооны дүгнэлт','M10-F08'),choice('opinion','Сонгосон санал дүгнэлт',['unmodified','Өөрчлөлтгүй'],['qualified','Хязгаарлалттай'],['adverse','Сөрөг'],['disclaimer','Дүгнэлт өгөхөөс татгалзсан']),choice('basisType','Шийдвэрийн суурь',['none','Өөрчлөлт шаардаагүй'],['evidence','Нотолгооны хязгаарлалт'],['misstatement','Буруу илэрхийлэл']),long('assessment','Материаллаг болон өргөн тархалтын үнэлгээ'),long('basis','Шийдвэрийн үндэслэл')]),
 define('M10-F11','Тайлангийн нэмэлт хэсэг','completion',[link('opinion','Баталсан санал дүгнэлт','M10-F09'),form('template','Батлагдсан тайлангийн эх загвар'),choice('type','Хэсгийн төрөл',['kam','Аудитын гол асуудал'],['emphasis','Онцлон тэмдэглэх'],['other','Бусад асуудал'],['going','Тасралтгүй ажиллагаа']),long('wording','Хэсгийн үг хэллэг'),long('basis','Хэрэглэх үндэслэл')]),
 define('M10-F12','Бичгээрх мэдэгдэл','completion',[date('requested','Хүсэлт гаргасан өдөр'),date('due','Хүлээн авах хугацаа'),choice('result','Үнэлгээ',['pending','Хүлээгдэж буй'],['received','Бүрэн хүлээн авсан'],['qualified','Нөхцөлтэй'],['missing','Ирээгүй']),date('signed','Гарын үсэг зурсан өдөр',true),
  short('signer','Гарын үсэг зурсан хүн',true),short('capacity','Албан тушаал ба эрх',true),date('periodStart','Хамарсан хугацааны эхлэл',true),date('periodEnd','Хамарсан хугацааны төгсгөл',true),
  evidence('evidence','Гарын үсэгтэй эх файл',true),long('assessment','Бүрдэл ба тайланд үзүүлэх нөлөө')],team),
 define('M10-F13','Удирдлага, засаглалд хүргэх мэдээлэл','completion',[form('paper','Илрүүлэлтийн эх ажил'),link('journal','Журналын илрүүлэлт','M07-F09',true),link('analytics','Шинжилгээний илрүүлэлт','M07-F06',true),short('finding','Бусад илрүүлэлтийн ишлэл',true),short('recipient','Хүлээн авагч'),long('message','Хянах агуулга'),long('response','Удирдлагын хариу',true),
  {...choice('channel','Суваг',['written','Бичгээр'],['oral','Амаар']),optional:true},
  {...choice('deliveryStatus','Бодит хүргэлтийн төлөв',['pending','Хүлээгдэж буй'],['delivered','Хүрсэн'],['failed','Амжилтгүй']),optional:true},
  {...choice('mandatory','Гаргалтаас өмнө заавал хүргэх',['yes','Тийм'],['no','Үгүй']),optional:true},date('deliveredAt','Бодит оролдлогын өдөр',true),
  long('outcome','Хүргэлтийн бодит үр дүн / тэмдэглэл',true),evidence('delivery','Хүргэлтийн эх баримт',true)],team,senior),
 define('M12-F04','Түгжсэн багцын өөрчлөлт','archive',[short('package','Архивын багцын ID'),choice('type','Өөрчлөлтийн төрөл',['administrative','Захиргааны'],['substantive','Агуулгын']),
  forTypes(form('paper','Анхны багцын дахин хянах ажил'),'substantive'),forTypes(date('reportDate','Дахин гаргах тайлангийн огноо'),'substantive'),
  long('changes','Нөлөөлөх бүртгэл ба хүссэн өөрчлөлт'),long('basis','Үндэслэл')]),
 define('M12-F07','Архивын хандалтын зөвшөөрөл','archive',[short('package','Архивын багцын ID'),choice('accessor','Хандах эрхтэй дүр',...roleChoices),long('reason','Хандалтын шалтгаан'),date('until','Хүчинтэй эцсийн өдөр')],team),
 define('M12-F08','Хадгалалтын хугацаа ба хориг','archive',[short('package','Архивын багцын ID'),choice('type','Бүртгэлийн төрөл',['policy','Хадгалалтын бодлого'],['hold','Хориг'],['release','Хориг цуцлах']),short('reference','Бодлогын ишлэл эсвэл хоригийн ID'),date('anchor','Хадгалалтын эхлэх өдөр',true),number('years','Хадгалах жил',true),long('basis','Үндэслэл')]),
 define('M12-F09','Бүрэн байдал ба сэргээх шалгалт','archive',[short('package','Архивын багцын ID'),choice('type','Шалгалтын төрөл',['verify','Бүрэн байдал'],['restore','Туршилтын сэргээх шалгалт']),long('basis','Шалгалтын тэмдэглэл')]),
 define('M12-F10','Хяналт шалгалтын багц','archive',[short('package','Архивын багцын ID'),choice('accessor','Хандах эрхтэй дүр',...roleChoices),choice('scope','Хамрах хүрээ',['report','Зөвхөн тайлан'],['evidence','Сонгосон нэг баримт']),short('evidenceId','Сонгосон баримтын ID',true),date('until','Хүчинтэй эцсийн өдөр'),long('reason','Сонголтын үндэслэл')]),
 define('M12-F11','Хадгалалт дууссаны шийдвэр','archive',[short('package','Архивын багцын ID'),link('policy','Баталсан хадгалалтын бодлого','M12-F08'),long('basis','Шалгуурын үнэлгээ ба үндэслэл')]),
];
