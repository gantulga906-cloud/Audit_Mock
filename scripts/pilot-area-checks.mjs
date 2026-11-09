import { validDate } from '../src/lib/feature-workflows.ts';
import { cents, csvRows } from './pilot-population.mjs';
import { areaSources } from '../src/lib/pilot-area.ts';
import { PilotError } from './pilot-workflow.mjs';

const fail = message => { throw new PilotError(400,message); };
const day = 86_400_000;
const dates = ['date','invoice_date','delivery_date','due_date','from','to'];
const amounts = ['amount','open_amount','unit_price','discount','max_discount','closing_value','opening_cost','additions',
  'disposals','transfers','closing_cost','opening_accumulated','charge','disposed_accumulated','adjustments','closing_accumulated'];
const quantities = ['quantity','opening_qty','closing_qty','counted_qty'];
const entityKey = value => value.replace(/\s/g,'').toLowerCase();
const sum = (rows,key='amount') => rows.reduce((total,row)=>total+row[key],0);
const key = (...parts) => JSON.stringify(parts);

function grouped(rows, value) {
  const result=new Map();
  for (const row of rows) {
    const id=value(row), list=result.get(id)??[];
    list.push(row); result.set(id,list);
  }
  return result;
}

export function parseAreaFile(kind, bytes) {
  let text;
  try { text = new TextDecoder('utf-8',{fatal:true}).decode(bytes); }
  catch { fail(kind+' · UTF-8 CSV шаардлагатай.'); }
  const [head,...lines]=csvRows(text), expected=areaSources[kind].columns.split(',');
  const columns=head?.cells.map(cell=>cell.toLowerCase())??[];
  if (columns.length!==expected.length||new Set(columns).size!==columns.length||expected.some(column=>!columns.includes(column))) {
    fail(kind+' · '+areaSources[kind].columns);
  }
  return lines.map(({line,cells})=>{
    if (cells.length!==columns.length) fail(kind+' · Багана зөрсөн · '+line);
    const row=Object.fromEntries(columns.map((column,i)=>[column,cells[i]]));
    if (!row[kind==='prices'?'sku':'id']||!row.entity||!row.currency) fail(kind+' · Түлхүүр/байгууллага/валют · '+line);
    for (const name of dates) if (name in row&&!validDate(row[name])) fail(kind+' · Огноо · '+line+' · '+name);
    for (const name of amounts) if (name in row) {
      const amount=cents(row[name]), signed=['transfers','adjustments'].includes(name)||['bank','reconciliation'].includes(kind)&&name==='amount';
      if (amount===null||!signed&&amount<0) fail(kind+' · Дүн · '+line+' · '+name);
      row[name]=amount;
    }
    for (const name of quantities) if (name in row) {
      const value=row[name], number=Number(value);
      const signed=['opening_qty','closing_qty'].includes(name)||kind==='movements'&&row.kind==='adjustment';
      if (!/^-?\d{1,9}$/.test(value)||!signed&&number<0||kind==='invoices'&&(number<1||number>99999)) {
        fail(kind+' · Тоо ширхэг · '+line+' · '+name);
      }
      row[name]=number;
    }
    if (kind==='prices'&&row.from>row.to) fail(kind+' · Үнийн хугацаа · '+line);
    if (kind==='invoices'&&row.due_date<row.invoice_date) fail(kind+' · Төлөх хугацаа нэхэмжлэлийн өдрөөс өмнө · '+line);
    return {...row,source:kind,row:line};
  });
}

function caseBook(scope) {
  const cases=new Map(), traces=new Map(), links=[];
  function add(id,label,flag,rows=[],metrics={}) {
    const entry=cases.get(id)??{id,label,flags:[],trace:[],metrics:{}};
    const seen=traces.get(id)??new Set();
    if (!entry.flags.includes(flag)) entry.flags.push(flag);
    for (const row of rows) if (row) {
      const reference=key(row.source,row.row);
      if (!seen.has(reference)) {
        entry.trace.push({source:row.source,row:row.row});
        seen.add(reference);
      }
    }
    Object.assign(entry.metrics,metrics);
    cases.set(id,entry);
    traces.set(id,seen);
  }
  const link=(id,label,rows,metrics)=>links.push({id,label,trace:rows.filter(Boolean).map(({source,row})=>({source,row})),metrics});
  function qualified(source, rows, unique=true) {
    const scoped=rows.filter(row=>{
      const eligible=entityKey(row.entity)===entityKey(scope.entity)&&row.currency.toUpperCase()===scope.currency;
      if (!eligible) add(key(source,row.row),row.id??row.sku,'scope',[row]);
      return eligible;
    });
    if (!unique) return scoped;
    const groups=grouped(scoped,row=>row.id);
    for (const [id,group] of groups) if (group.length>1) add(key(source,id),id,'duplicate',group);
    return scoped.filter(row=>groups.get(row.id).length===1);
  }
  return {add,link,qualified,results:()=>({cases:[...cases.values()],links})};
}

function timing(date,scope) { return date<scope.start?'before':date>scope.end?'after':'current'; }

function ledgerByReference(ledger,book) {
  for (const row of ledger) if (!row.reference) book.add(key('ledger',row.row),row.id,'unmatched',[row],{posting:row.amount});
  return grouped(ledger.filter(row=>row.reference),row=>row.reference);
}

function sales(scope,inputs,ledger,book) {
  const {add,link,qualified}=book;
  const invoices=qualified('invoices',inputs.invoices), credits=qualified('credits',inputs.credits);
  const cash=qualified('cash',inputs.cash), terms=grouped(qualified('prices',inputs.prices,false),row=>row.sku);
  const lookup=new Map(invoices.map(invoice=>[invoice.id,invoice]));
  const postings=ledgerByReference(ledger,book);
  const totals={invoices:0,ledger:sum(ledger),creditAtClose:0,open:0,subsequentCash:0,remaining:0};
  const aging={notDue:0,days1to30:0,days31to60:0,days61to90:0,over90:0};
  const creditsByInvoice=grouped(credits,row=>row.invoice);
  const cashByInvoice=grouped(cash,row=>row.invoice);
  for (const row of [...credits,...cash]) if (!lookup.has(row.invoice)) add(key(row.source,row.id),row.id,'unmatched',[row]);
  for (const [id,rows] of postings) if (!lookup.has(id)) add(key('posting',id),id,'unmatched',rows,{posting:sum(rows)});
  for (const invoice of invoices) {
    const id=key('invoice',invoice.id), flag=(code,extra=[],metrics={})=>add(id,invoice.id,code,[invoice,...extra],metrics);
    const ledgerRows=postings.get(invoice.id)??[], recorded=sum(ledgerRows);
    const inPeriod=timing(invoice.invoice_date,scope)==='current';
    if (inPeriod) totals.invoices+=invoice.amount;
    if (invoice.invoice_date>scope.through||invoice.delivery_date>scope.through) flag('cutoff',[],{invoiceDate:invoice.invoice_date,deliveryDate:invoice.delivery_date});
    if (timing(invoice.delivery_date,scope)!==timing(invoice.invoice_date,scope)||!inPeriod&&ledgerRows.length) {
      flag('cutoff',ledgerRows,{invoiceDate:invoice.invoice_date,deliveryDate:invoice.delivery_date});
    }
    if (inPeriod&&!ledgerRows.length) flag('unmatched',[],{invoice:invoice.amount});
    if ((inPeriod||ledgerRows.length)&&recorded!==invoice.amount) flag('variance',ledgerRows,{invoice:invoice.amount,posting:recorded});
    const arith=invoice.quantity*invoice.unit_price-invoice.discount;
    if (!Number.isSafeInteger(arith)) fail(invoice.id+' · Үнийн үржвэр зөвшөөрсөн хэмжээнээс хэтэрсэн.');
    if (arith!==invoice.amount||arith<0) flag('arithmetic',[],{expected:arith,invoice:invoice.amount});
    const available=(terms.get(invoice.sku)??[]).filter(p=>p.from<=invoice.invoice_date&&p.to>=invoice.invoice_date);
    if (available.length!==1) flag('terms',available);
    else if (available[0].unit_price!==invoice.unit_price||invoice.discount>available[0].max_discount) {
      flag('price',available,{allowedPrice:available[0].unit_price,allowedDiscount:available[0].max_discount,price:invoice.unit_price,discount:invoice.discount});
    }
    let preClose=0;
    for (const row of creditsByInvoice.get(invoice.id)??[]) {
      if (row.date<invoice.invoice_date||row.date>scope.through) flag('cutoff',[row]);
      else if (row.date>scope.end&&invoice.invoice_date<=scope.end) flag('credit',[row],{credit:row.amount});
      else if (row.date<=scope.end) preClose+=row.amount;
    }
    totals.creditAtClose+=preClose;
    if (preClose>invoice.amount||invoice.open_amount>Math.max(0,invoice.amount-preClose)||
        invoice.invoice_date>scope.end&&invoice.open_amount>0) flag('excess',creditsByInvoice.get(invoice.id),{open:invoice.open_amount,credits:preClose});
    const open=invoice.invoice_date<=scope.end?invoice.open_amount:0;
    totals.open+=open;
    const signedDays=Math.round((Date.parse(scope.end)-Date.parse(invoice.due_date))/day);
    const bucket=signedDays<=0?'notDue':signedDays<=30?'days1to30':signedDays<=60?'days31to60':signedDays<=90?'days61to90':'over90';
    aging[bucket]+=open;
    let remaining=open;
    const receipts=[...(cashByInvoice.get(invoice.id)??[])].sort((a,b)=>a.date.localeCompare(b.date)||a.row-b.row);
    for (const row of receipts) {
      if (row.date<=scope.end||row.date>scope.through||row.date<invoice.invoice_date) {flag('cutoff',[row]);continue;}
      const allocation=Math.min(row.amount,remaining);
      remaining-=allocation; totals.subsequentCash+=allocation;
      link(key('allocation',row.id),row.id,[invoice,row],{reference:invoice.id,receipt:row.amount,allocated:allocation,remaining});
      if (allocation!==row.amount) flag('excess',[row],{receipt:row.amount,allocated:allocation});
    }
    totals.remaining+=remaining;
    if (remaining>0&&remaining<open) flag('partial',receipts,{open,remaining,allocated:open-remaining});
    link(id,invoice.id,[invoice,...ledgerRows,...(creditsByInvoice.get(invoice.id)??[]),...receipts],
      {invoice:invoice.amount,posting:recorded,open,remaining,allocated:open-remaining});
  }
  return {...totals,...aging};
}

function purchases(scope,inputs,ledger,book) {
  const {add,link,qualified}=book;
  const receipts=qualified('receipts',inputs.receipts), bills=qualified('bills',inputs.bills), payments=qualified('payments',inputs.payments);
  const receiptMap=new Map(receipts.map(row=>[row.id,row])), billMap=new Map(bills.map(row=>[row.id,row]));
  const accruals=ledgerByReference(ledger,book);
  const receiptBills=grouped(bills,row=>row.receipt);
  const paymentGroups=grouped(payments,row=>key(row.invoice,row.vendor,row.date,row.amount));
  const billPayments=grouped(payments,row=>row.invoice);
  const totals={receipts:0,invoices:0,payments:0,ledger:sum(ledger),candidateLiability:0};
  for (const row of receipts) if (timing(row.date,scope)==='current') totals.receipts+=row.amount;
  for (const row of bills) {
    const receipt=receiptMap.get(row.receipt), billsPosted=accruals.get(row.id)??[], receiptsPosted=accruals.get(row.receipt)??[];
    const postings=row.id===row.receipt?billsPosted:[...billsPosted,...receiptsPosted], prior=receipt&&timing(receipt.date,scope)==='current';
    const id=key('bill',row.id), flag=(code,rows=[],metrics={})=>add(id,row.id,code,[row,receipt,...rows],metrics);
    if (timing(row.date,scope)==='current') totals.invoices+=row.amount;
    if (!receipt||receipt.vendor!==row.vendor||row.date<receipt.date||receiptBills.get(row.receipt).length!==1) flag('chain');
    if (receipt&&receipt.amount!==row.amount) flag('variance',[],{received:receipt.amount,invoiced:row.amount});
    if (prior&&row.date>scope.end) flag('cutoff',postings,{receiptDate:receipt.date,invoiceDate:row.date});
    if (row.date>scope.through) flag('cutoff',postings,{invoiceDate:row.date});
    if ((prior||timing(row.date,scope)==='current')&&!postings.length) {
      flag('liability',[],{candidate:row.amount}); totals.candidateLiability+=row.amount;
    } else if (postings.length&&sum(postings)!==row.amount) flag('variance',postings,{posting:sum(postings),invoice:row.amount});
    const paid=(billPayments.get(row.id)??[]).filter(payment=>payment.vendor===row.vendor&&payment.date>=row.date&&payment.date<=scope.through&&
      paymentGroups.get(key(payment.invoice,payment.vendor,payment.date,payment.amount)).length===1);
    if (sum(paid)>row.amount) flag('excess',paid,{paid:sum(paid),invoice:row.amount});
    link(id,row.id,[receipt,row,...postings,...paid],{invoice:row.amount,posting:sum(postings),paid:sum(paid),remaining:Math.max(0,row.amount-sum(paid))});
  }
  for (const row of receipts) if (timing(row.date,scope)==='current'&&!receiptBills.has(row.id)&&!accruals.has(row.id)) {
    add(key('receipt',row.id),row.id,'liability',[row],{candidate:row.amount}); totals.candidateLiability+=row.amount;
  }
  for (const [identity,candidates] of paymentGroups) if (candidates.length>1) {
    add(key('duplicate-payment',identity),candidates[0].invoice,'payment_duplicate',candidates,{payment:candidates[0].amount});
  }
  for (const row of payments) {
    const related=billMap.get(row.invoice), candidates=paymentGroups.get(key(row.invoice,row.vendor,row.date,row.amount));
    const id=key('payment',row.id);
    if (!related||related.vendor!==row.vendor) add(id,row.id,'unmatched',[row,related],{payment:row.amount});
    if (row.date>scope.through||related&&row.date<related.date) add(id,row.id,'cutoff',[row,related]);
    else if (related?.vendor===row.vendor&&candidates.length===1) totals.payments+=row.amount;
  }
  for (const [id,rows] of accruals) if (!billMap.has(id)&&!receiptMap.has(id)) add(key('ledger',id),id,'unmatched',rows,{posting:sum(rows)});
  return totals;
}

function bank(scope,inputs,ledger,book) {
  const {add,link,qualified}=book;
  const statement=qualified('bank',inputs.bank).filter(row=>{
    if (timing(row.date,scope)==='current') return true;
    add(key('bank',row.id),row.id,'cutoff',[row]); return false;
  });
  const recon=qualified('reconciliation',inputs.reconciliation);
  const bankRefs=grouped(statement,row=>row.reference), bookRefs=grouped(ledger,row=>row.reference);
  const matched=new Set();
  const ambiguous=new Set();
  for (const row of statement) {
    const candidates=bookRefs.get(row.reference)??[];
    if (row.reference&&(bankRefs.get(row.reference).length>1||candidates.length>1)) {
      if (!ambiguous.has(row.reference)) add(key('bank-reference',row.reference),row.reference,'unmatched',[...bankRefs.get(row.reference),...candidates]);
      ambiguous.add(row.reference); continue;
    }
    if (row.reference&&bankRefs.get(row.reference).length===1&&candidates.length===1&&row.amount===candidates[0].amount) {
      matched.add(row.reference);
      link(key('bank-match',row.id),row.reference,[row,candidates[0]],{bank:row.amount,posting:candidates[0].amount});
    }
    else add(key('bank',row.id),row.id,candidates.length===1&&row.reference?'variance':'unmatched',[row,...candidates],{bank:row.amount});
  }
  for (const row of ledger) if (!matched.has(row.reference)&&!ambiguous.has(row.reference)) add(key('book',row.id),row.id,'unmatched',[row],{posting:row.amount});
  const totals={bankMovements:sum(statement),bookMovements:sum(ledger),matched:matched.size};
  for (const side of ['bank','book']) {
    const opening=recon.filter(row=>row.kind===side+'_opening'&&row.date===scope.start);
    const closing=recon.filter(row=>row.kind===side+'_closing'&&row.date===scope.end);
    if (opening.length!==1||closing.length!==1) fail(side+' · Тайлант үеийн эхний ба эцсийн үлдэгдэл тус бүр нэг байна.');
    const residual=opening[0].amount+totals[side+'Movements']-closing[0].amount;
    if (residual!==0) add(key('rollforward',side),side,'residual',[...opening,...closing],{residual});
    const adjustments=recon.filter(row=>row.kind===side+'_adjustment');
    for (const item of adjustments) {
      const candidates=side==='bank'?bookRefs.get(item.reference):bankRefs.get(item.reference);
      const supported=item.reference&&item.reason&&item.date===scope.end&&!matched.has(item.reference)&&candidates?.length===1&&item.amount===candidates[0].amount;
      add(key('adjustment',item.id),item.id,'reconciling',[item,...(candidates??[])],{adjustment:item.amount,reference:item.reference});
      if (!supported) add(key('adjustment',item.id),item.id,'unmatched',[item]);
      item.supported=!!supported;
    }
    const valid=adjustments.filter(item=>item.supported&&adjustments.filter(x=>x.reference===item.reference).length===1);
    totals[side+'Adjusted']=closing[0].amount+sum(valid);
  }
  if (recon.some(row=>! /^(bank|book)_(opening|closing|adjustment)$/.test(row.kind))) fail('Тулгалтын мөрийн төрөл буруу.');
  totals.residual=totals.bankAdjusted-totals.bookAdjusted;
  if (totals.residual!==0) add(key('reconciliation','residual'),'Банк ба дэвтэр','residual',recon,{residual:totals.residual});
  return totals;
}

function inventory(scope,inputs,ledger,book) {
  const {add,link,qualified}=book;
  const items=qualified('inventory',inputs.inventory), movements=qualified('movements',inputs.movements), counts=qualified('counts',inputs.counts);
  const identity=row=>key(row.item,row.location,row.unit);
  const itemGroups=grouped(items,identity), movementGroups=grouped(movements,identity), countGroups=grouped(counts,identity);
  const totals={inventoryValue:0,ledger:sum(ledger),countedItems:0,unresolvedCounts:0};
  for (const [id,group] of itemGroups) {
    const item=group[0], label=[item.item,item.location,item.unit].join(' / ');
    if (!item.item||!item.location||!item.unit||group.length!==1) {
      add(key('inventory',id),label,group.length>1?'duplicate':'unmatched',group); continue;
    }
    totals.inventoryValue+=item.closing_value;
    const itemMoves=movementGroups.get(id)??[], itemCounts=countGroups.get(id)??[];
    const flag=(code,rows=[],metrics={})=>add(key('inventory',id),label,code,[item,...rows],metrics);
    let expected=item.opening_qty;
    for (const move of itemMoves) {
      if (timing(move.date,scope)!=='current') {flag('cutoff',[move]);continue;}
      if (!['receipt','issue','adjustment'].includes(move.kind)) {flag('stock',[move]);continue;}
      expected+=move.kind==='issue'?-move.quantity:move.quantity;
    }
    if (expected!==item.closing_qty) flag('rollforward',itemMoves,{expectedQuantity:expected,closingQuantity:item.closing_qty});
    if (item.opening_qty<0||item.closing_qty<0||expected<0) flag('stock',itemMoves,{expectedQuantity:expected,closingQuantity:item.closing_qty});
    const yearEndCounts=itemCounts.filter(row=>row.date===scope.end);
    if (yearEndCounts.length===1) totals.countedItems++;
    if (yearEndCounts.length!==1||yearEndCounts[0].counted_qty!==item.closing_qty) {
      totals.unresolvedCounts++;
      flag('count',itemCounts,{closingQuantity:item.closing_qty,...(yearEndCounts.length===1&&{countedQuantity:yearEndCounts[0].counted_qty})});
    }
    link(key('inventory',id),label,[item,...itemMoves,...itemCounts],{expectedQuantity:expected,closingQuantity:item.closing_qty,
      ...(yearEndCounts.length===1&&{countedQuantity:yearEndCounts[0].counted_qty})});
  }
  for (const row of [...movements,...counts]) if (itemGroups.get(identity(row))?.length!==1) {
    add(key(row.source,row.id),row.id,'unmatched',[row],{item:row.item,location:row.location,unit:row.unit});
  }
  const residual=totals.inventoryValue-totals.ledger;
  if (residual) add(key('inventory','ledger'),'Бараа материал ба дэвтэр','residual',[...items,...ledger],{residual});
  return {...totals,residual};
}

function assets(scope,inputs,ledger,book) {
  const {add,link,qualified}=book;
  const register=qualified('assets',inputs.assets), additions=qualified('additions',inputs.additions);
  const assetIds=new Set(register.map(row=>row.id)), additionGroups=grouped(additions,row=>row.asset);
  const totals={assetCost:0,accumulated:0,carrying:0,additions:0,ledger:sum(ledger)};
  for (const row of additions) if (!assetIds.has(row.asset)) add(key('addition',row.id),row.id,'unmatched',[row],{addition:row.amount});
  for (const asset of register) {
    const flag=(code,rows=[],metrics={})=>add(key('asset',asset.id),asset.id,code,[asset,...rows],metrics);
    const expectedCost=asset.opening_cost+asset.additions-asset.disposals+asset.transfers;
    const expectedAccumulated=asset.opening_accumulated+asset.charge-asset.disposed_accumulated+asset.adjustments;
    totals.assetCost+=asset.closing_cost; totals.accumulated+=asset.closing_accumulated; totals.additions+=asset.additions;
    if (expectedCost!==asset.closing_cost||expectedAccumulated!==asset.closing_accumulated) {
      flag('rollforward',[],{expectedCost,expectedAccumulated,cost:asset.closing_cost,accumulated:asset.closing_accumulated});
    }
    if (!asset.class||asset.closing_accumulated>asset.closing_cost) flag('asset');
    const evidence=additionGroups.get(asset.id)??[], inPeriod=evidence.filter(row=>timing(row.date,scope)==='current');
    if (inPeriod.length!==evidence.length) flag('cutoff',evidence);
    const supported=sum(inPeriod);
    if (supported!==asset.additions) flag('asset',evidence,{additions:asset.additions,supported});
    link(key('asset',asset.id),asset.id,[asset,...evidence],{expectedCost,expectedAccumulated,additions:asset.additions,supported});
  }
  totals.carrying=totals.assetCost-totals.accumulated;
  const residual=totals.carrying-totals.ledger;
  if (residual) add(key('asset','ledger'),'Хөрөнгийн бүртгэл ба дэвтэр','residual',[...register,...ledger],{residual});
  return {...totals,residual};
}

export function runAreaChecks(method,scope,inputs,postings) {
  const book=caseBook(scope);
  const summary=({sales,purchases,bank,inventory,assets})[method](scope,inputs,postings,book);
  return {summary,...book.results()};
}
