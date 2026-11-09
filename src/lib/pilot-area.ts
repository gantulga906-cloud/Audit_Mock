import type {PilotRole} from './pilot-registers.ts';

export const areaProfiles={
 '3.1.16':{method:'sales',title:'Борлуулалт, хугацааны зааг ба үнэ',inputs:['invoices','credits','cash','prices']},
 '3.1.5':{method:'sales',title:'Авлагын насжилт ба дараа үеийн төлөлт',inputs:['invoices','credits','cash','prices']},
 '3.1.10':{method:'purchases',title:'Худалдан авалт, өглөг ба төлбөр',inputs:['receipts','bills','payments']},
 '3.1.8':{method:'bank',title:'Банкны гүйлгээ ба үлдэгдлийн тулгалт',inputs:['bank','reconciliation']},
 '3.1.4':{method:'inventory',title:'Бараа материалын хөдөлгөөн ба тооллого',inputs:['inventory','movements','counts']},
 '3.1.2':{method:'assets',title:'Үндсэн хөрөнгийн бүртгэл ба нэмэгдэл',inputs:['assets','additions']},
} as const;

export const areaSources={
 invoices:{label:'Борлуулалтын нэхэмжлэл',columns:'id,entity,currency,invoice_date,delivery_date,due_date,amount,open_amount,sku,quantity,unit_price,discount'},
 credits:{label:'Кредит баримт',columns:'id,entity,currency,invoice,date,amount'},
 cash:{label:'Дараа үеийн орлого',columns:'id,entity,currency,invoice,date,amount'},
 prices:{label:'Баталсан үнийн жагсаалт',columns:'sku,entity,currency,unit_price,max_discount,from,to'},
 receipts:{label:'Хүлээн авалтын баримт',columns:'id,entity,currency,vendor,date,amount'},
 bills:{label:'Нийлүүлэгчийн нэхэмжлэл',columns:'id,entity,currency,receipt,vendor,date,amount'},
 payments:{label:'Нийлүүлэгчийн төлбөр',columns:'id,entity,currency,invoice,vendor,date,amount'},
 bank:{label:'Банкны хуулга',columns:'id,entity,currency,reference,date,amount'},
 reconciliation:{label:'Банк ба дэвтрийн баталсан үлдэгдэл, тохируулга',columns:'id,entity,currency,kind,reference,date,amount,reason'},
 inventory:{label:'Бараа материалын бүртгэл',columns:'id,entity,currency,item,location,unit,opening_qty,closing_qty,closing_value'},
 movements:{label:'Бараа материалын хөдөлгөөн',columns:'id,entity,currency,item,location,unit,date,kind,quantity'},
 counts:{label:'Баталсан тооллогын хуудас',columns:'id,entity,currency,item,location,unit,date,counted_qty'},
 assets:{label:'Үндсэн хөрөнгийн бүртгэл',columns:'id,entity,currency,class,opening_cost,additions,disposals,transfers,closing_cost,opening_accumulated,charge,disposed_accumulated,adjustments,closing_accumulated'},
 additions:{label:'Үндсэн хөрөнгийн нэмэгдлийн нотолгоо',columns:'id,entity,currency,asset,date,amount'},
} as const;
export type AreaSourceKey=keyof typeof areaSources;
export const areaFlags:Record<string,string>={
 scope:'Байгууллага эсвэл валют зөрсөн', duplicate:'Түлхүүр давхардсан', cutoff:'Хугацааны заагийн зөрүү',
 unmatched:'Яг таарах эх бичилт олдоогүй', variance:'Дүнгийн зөрүү', credit:'Дараа үеийн кредит баримт',
 excess:'Үлдэгдлээс давсан дүн', partial:'Хэсэгчилсэн төлөлт', price:'Үнийн зөвшөөрөгдсөн нөхцөл зөрсөн',
 terms:'Үнийн нөхцөл олдоогүй эсвэл олон таарсан', arithmetic:'Нэхэмжлэлийн арифметик зөрүү',
 liability:'Бүртгэлгүй эсвэл хожимдсон байж болох өглөг', payment_duplicate:'Давхар төлбөр байж болзошгүй',
 chain:'Хүлээн авалт, нэхэмжлэл эсвэл нийлүүлэгчийн холбоос зөрсөн',
 reconciling:'Шалгагдаагүй тулгалтын зүйл', residual:'Үлдэгдлийн тулгалтын зөрүү',
 rollforward:'Хөдөлгөөний тулгалтын зөрүү', count:'Тооллогын зөрүү эсвэл дутуу хамралт',
 stock:'Сөрөг үлдэгдэл эсвэл хөдөлгөөний төрөл буруу', asset:'Үндсэн хөрөнгийн бүртгэл, нэмэгдлийн нотолгоо зөрсөн',
};
export type AreaTrace={source:string;row:number};
export type AreaLink={id:string;label:string;trace:AreaTrace[];metrics:Record<string,number|string>};
export type AreaCase=AreaLink&{
 flags:string[];
 reviews?:AreaDisposition[];
};
type AreaDisposition={result:'explained'|'finding'|'open';note:string;evidence:string;by:PilotRole;at:string;amount:number;finding?:string};
type AreaFile={id:string;name:string;version:number;sha256:string};
export type AreaRun={version:number;current:boolean;population:number;source:string;line:string;through:string;currency:string;stamp:string;
 files:Record<string,AreaFile>;params:{sign:'debit'|'credit'};cases:AreaCase[];links:AreaLink[];summary:Record<string,number>;by:PilotRole;at:string;
 approval?:{by:PilotRole;at:string;conclusion:string};history:{version:number;population:number;at:string;
  files:Record<string,AreaFile>;source:string;approval?:{conclusion:string}}[]};
