import type {PilotRole} from './pilot-registers.ts';

export const areaProfiles={
 '3.1.16':{method:'sales',title:'Борлуулалт, хугацааны зааг ба үнэ',inputs:['invoices','credits','cash','prices']},
 '3.1.5':{method:'sales',title:'Авлагын насжилт ба дараа үеийн төлөлт',inputs:['invoices','credits','cash','prices']},
 '3.1.10':{method:'purchases',title:'Худалдан авалт, өглөг ба төлбөр',inputs:['receipts','bills','payments']},
 '3.1.8':{method:'bank',title:'Банкны гүйлгээ ба үлдэгдлийн тулгалт',inputs:['bank','reconciliation']},
 '3.1.4':{method:'inventory',title:'Бараа материалын хөдөлгөөн ба тооллого',inputs:['inventory','movements','counts']},
 '3.1.2':{method:'assets',title:'Үндсэн хөрөнгийн бүртгэл ба нэмэгдэл',inputs:['assets','additions']},
 '3.1.18':{method:'payroll',title:'Цалин, суутгал ба банкны тулгалт',inputs:['payroll','payrollRules','payrollBank']},
 '3.1.14':{method:'tax',title:'Татварын тооцоо, тайлан ба төлөлт',inputs:['tax','taxRules','taxReturns','taxPayments']},
 '3.1.9':{method:'loans',title:'Зээлийн үлдэгдэл, хүү ба гэрээний шалгуур',inputs:['loans','loanTerms','loanSegments']},
 '3.1.21':{method:'leases',title:'Тогтмол төлбөртэй түрээсийн тооцоо',inputs:['leases','leasePayments']},
 '3.1.20':{method:'fx',title:'Валютын дүн ба дахин үнэлгээ',inputs:['fxPositions','fxRates']},
 '3.1.15':{method:'equity',title:'Өмчийн хөдөлгөөн ба зөвшөөрөл',inputs:['equity','equityActions']},
 '3.1.3':{method:'investments',title:'Хөрөнгө оруулалт, кастодиан ба өгөөж',inputs:['investments','custody','investmentCashFlows']},
} as const;

export const areaMethods={
 payroll:{edition:true,primary:'Цалингийн зардлын мөр',lines:[['liability','Суутгал, шимтгэлийн өглөг'],['settlement','Цалингийн банкны төлөлт']]},
 tax:{edition:true,primary:'Татварын өглөгийн мөр',lines:[['settlement','Татварын төлөлт']]},
 loans:{edition:true,primary:'Зээлийн үндсэн үлдэгдэл',lines:[['interest','Зээлийн хүүгийн зардал','debit']]},
 leases:{edition:true,primary:'Түрээсийн өр төлбөр',lines:[['rou','Ашиглах эрхийн хөрөнгө','debit']]},
 fx:{edition:true,primary:'Валютын тулгах дансны мөр',lines:[]},
 equity:{edition:true,primary:'Өмчийн үлдэгдлийн мөр',lines:[]},
 investments:{edition:true,primary:'Хөрөнгө оруулалтын өртгийн мөр',lines:[['income','Хөрөнгө оруулалтын орлого']]},
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
 payroll:{label:'Цалингийн бүртгэл',columns:'id,entity,currency,employee,category,date,status,gross,employee_contribution,withholding,employer_contribution,other_deductions,net_adjustment,net'},
 payrollRules:{label:'Баталсан цалингийн дүрэм',columns:'id,entity,currency,edition,category,method,from,to,employee_bps,employer_bps,withholding_bps,cap,withholding_base'},
 payrollBank:{label:'Цалингийн банкны хуулга',columns:'id,entity,currency,payroll,employee,date,amount'},
 payrollHistory:{label:'Өмнөх сарын харьцуулах цалин',columns:'id,entity,currency,employee,category,period,gross'},
 payrollVariance:{label:'Баталсан цалингийн хэлбэлзэл ба хуваарь',columns:'id,entity,currency,edition,from,to,method,amount,rate_bps,pay_day'},
 tax:{label:'Татварын тооцооны бүртгэл',columns:'id,entity,currency,period,category,date,base,adjustment,offset,tax'},
 taxRules:{label:'Баталсан татварын дүрэм',columns:'id,entity,currency,edition,category,method,from,to,rate_bps'},
 taxReturns:{label:'Илгээсэн тайлан ба хойшлогдсон татварын хүснэгт',columns:'id,entity,currency,period,category,date,amount'},
 taxPayments:{label:'Татварын төлөлтийн баримт',columns:'id,entity,currency,period,category,date,amount'},
 loans:{label:'Зээлийн бүртгэл',columns:'id,entity,currency,opening,drawdowns,repayments,movements,closing,recorded_interest,covenant_metric'},
 loanTerms:{label:'Хянасан зээлийн нөхцөл ба шалгуур',columns:'id,entity,currency,loan,edition,method,from,to,rate_bps,day_basis,covenant_direction,covenant_limit,definition'},
 loanSegments:{label:'Зээлийн хүүгийн үндсэн дүнгийн сегмент',columns:'id,entity,currency,loan,from,to,principal'},
 leases:{label:'Хянасан түрээсийн нөхцөл',columns:'id,entity,currency,edition,method,rate_bps,life,elapsed,initial_adjustment,recorded_liability,recorded_rou'},
 leasePayments:{label:'Түрээсийн тогтмол төлбөрийн хуваарь',columns:'id,entity,currency,lease,sequence,amount'},
 fxPositions:{label:'Валютын ажил гүйлгээ ба мөнгөн үлдэгдэл',columns:'id,entity,currency,foreign_currency,date,basis,foreign_amount,recorded'},
 fxRates:{label:'Чиглэлтэй, баталсан валютын ханш',columns:'id,entity,currency,edition,foreign_currency,date,direction,rate_micros'},
 equity:{label:'Өмчийн хөдөлгөөний бүртгэл',columns:'id,entity,currency,edition,method,opening,profit,contributions,distributions,transfers,movements,closing'},
 equityActions:{label:'Өмчийн хөдөлгөөний баталсан шийдвэр',columns:'id,entity,currency,component,kind,date,amount,reference'},
 investments:{label:'Хөрөнгө оруулалтын бүртгэл',columns:'id,entity,currency,edition,method,opening_units,acquired_units,disposed_units,other_units,closing_units,opening_cost,additions,disposals,transfers,closing_cost,income,valuation'},
 custody:{label:'Кастодианы үлдэгдэл ба орлогын хуулга',columns:'id,entity,currency,instrument,date,closing_units,closing_cost,income'},
 investmentCashFlows:{label:'Хянасан энгийн үнэлгээний мөнгөн урсгал',columns:'id,entity,currency,instrument,edition,method,sequence,rate_bps,amount'},
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
 inactive:'Идэвхгүй ажилтны төлөлт', statutory:'Баталсан дүрмээр дахин тооцсон дүн зөрсөн',
 payroll_delta:'Өмнөх сарын цалингийн босго давсан өөрчлөлт', off_cycle:'Баталсан хуваариас гадуурх цалин',
 comparator:'Өмнөх сарын харьцуулах суурь байхгүй эсвэл олон таарсан',
 filing:'Тайлангийн эсвэл баталсан хүснэгтийн дүн зөрсөн', settlement:'Төлөлтийн дүн эсвэл эх баримт зөрсөн',
 covenant:'Гэрээний шалгуурын нөөц сөрөг', authority:'Баталсан шийдвэртэй тулгалт зөрсөн',
 valuation:'Өгөгдсөн аргачлалын тооцоо бүртгэлтэй зөрсөн',
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
 files:Record<string,AreaFile>;params:{sign:'debit'|'credit';edition?:string;lines?:Record<string,string>};cases:AreaCase[];links:AreaLink[];summary:Record<string,number>;by:PilotRole;at:string;
 approval?:{by:PilotRole;at:string;conclusion:string};history:{version:number;population:number;at:string;
  files:Record<string,AreaFile>;source:string;approval?:{conclusion:string}}[]};
