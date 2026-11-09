import { grouped } from './pilot-area-checks.mjs';
import { PilotError } from './pilot-workflow.mjs';

const fail = message => { throw new PilotError(409,message); };
const key = (...parts) => JSON.stringify(parts);
const sum = (rows,field='amount') => rows.reduce((total,row)=>total+row[field],0);
const day=86_400_000;
const days=(from,to)=>(Date.parse(to)-Date.parse(from))/day;
const within=(date,scope)=>date>=scope.start&&date<=scope.end;
const round=(numerator,denominator)=>{
  const positive=numerator<0n?-numerator:numerator;
  const result=Number((positive*2n+denominator)/(denominator*2n));
  if (!Number.isSafeInteger(result)) fail('Тооцооны дүн зөвшөөрсөн хэмжээнээс хэтэрсэн.');
  return numerator<0n?-result:result;
};
const ratio=(amount,factor,scale)=>round(BigInt(amount)*BigInt(factor),BigInt(scale));

function versioned(book, kind, rows, edition) {
  const chosen=book.qualified(kind,rows.filter(row=>row.edition===edition));
  if (!chosen.length) fail('Баталсан аргачлалын хувилбар олдсонгүй · '+edition);
  return chosen;
}

function ledgerGroups(book, section, postings, expected) {
  const ids=new Set(expected);
  const groups=grouped(postings,row=>row.reference);
  for (const [id,rows] of groups) if (!id||!ids.has(id)) book.add(key(section,id),id||section,'unmatched',rows,{posting:sum(rows)});
  return groups;
}

function extras(book,section,rows,getId,expected) {
  const ids=new Set(expected);
  for (const row of rows) if (!ids.has(getId(row))) book.add(key(section,row.id),row.id,'unmatched',[row]);
}

function caseFor(book,method,id,trace,metrics) {
  const reference=key(method,id);
  book.link(reference,id,trace,metrics);
  return flag=>book.add(reference,id,flag,trace,metrics);
}

function checkedPv(rows,bps) {
  const base=10000n+BigInt(bps);
  let numerator=0n, denominator=1n, scale=10000n;
  for (const row of rows) {
    numerator=numerator*base+BigInt(row.amount)*scale;
    denominator*=base;
    scale*=10000n;
  }
  return round(numerator,denominator);
}

export function loans(scope,inputs,ledger,book,extra) {
  const register=book.qualified('loans',inputs.loans);
  if (!register.length) fail('Хүчинтэй зээлийн бүртгэл шаардлагатай.');
  const terms=versioned(book,'loanTerms',inputs.loanTerms,scope.edition);
  const segments=book.qualified('loanSegments',inputs.loanSegments);
  const ids=register.map(row=>row.id), termGroups=grouped(terms,row=>row.loan), byLoan=grouped(segments,row=>row.loan);
  const principal=ledgerGroups(book,'loan-principal',ledger,ids), interest=ledgerGroups(book,'loan-interest',extra.interest,ids);
  extras(book,'loan-segment',segments,row=>row.loan,ids); extras(book,'loan-term',terms,row=>row.loan,ids);
  const totals={loanPrincipal:0,loanInterest:0,ledger:sum(ledger),ledgerInterest:sum(extra.interest)};
  for (const row of register) {
    const matching=termGroups.get(row.id)??[], term=matching[0];
    if (matching.length!==1||term.method!=='simple_segment'||!['360','365'].includes(term.day_basis)||
        !['minimum','maximum','none'].includes(term.covenant_direction)||term.covenant_direction!=='none'&&!term.definition||
        term.from<scope.start||term.to>new Date(Date.parse(scope.end)+day).toISOString().slice(0,10)||term.from>=term.to) {
      fail('Дэмжигдсэн зээлийн нөхцөл, хугацаа ба шалгуур шаардлагатай · '+row.id);
    }
    const ordered=[...(byLoan.get(row.id)??[])].sort((a,b)=>a.from.localeCompare(b.from));
    if (!ordered.length||ordered[0].from!==term.from||ordered.at(-1).to!==term.to||
        ordered.some((segment,i)=>segment.from>=segment.to||i>0&&ordered[i-1].to!==segment.from)) {
      fail('Давхардалгүй, тасралтгүй хүүгийн сегмент шаардлагатай · '+row.id);
    }
    const expectedPrincipal=row.opening+row.drawdowns-row.repayments+row.movements;
    if (expectedPrincipal<0) fail('Сөрөг зээлийн үлдэгдэл дэмжигдээгүй · '+row.id);
    const numerator=ordered.reduce((total,s)=>total+BigInt(s.principal)*BigInt(days(s.from,s.to))*BigInt(term.rate_bps),0n);
    const expectedInterest=round(numerator,10000n*BigInt(term.day_basis));
    const p=principal.get(row.id)??[], i=interest.get(row.id)??[];
    const headroom=term.covenant_direction==='none'?undefined:term.covenant_direction==='minimum'
      ?row.covenant_metric-term.covenant_limit:term.covenant_limit-row.covenant_metric;
    const flag=caseFor(book,'loan',row.id,[row,term,...ordered,...p,...i],
      {loanPrincipal:expectedPrincipal,closing:row.closing,loanInterest:expectedInterest,recordedInterest:row.recorded_interest,
        ledger:sum(p),ledgerInterest:sum(i),...(headroom!==undefined&&{headroom})});
    if (expectedPrincipal!==row.closing) flag('rollforward');
    if (expectedPrincipal!==sum(p)||expectedInterest!==sum(i)||expectedInterest!==row.recorded_interest) flag('variance');
    if (headroom!==undefined&&headroom<0) flag('covenant');
    totals.loanPrincipal+=expectedPrincipal; totals.loanInterest+=expectedInterest;
  }
  return totals;
}

export function leases(scope,inputs,ledger,book,extra) {
  const terms=versioned(book,'leases',inputs.leases,scope.edition), payments=book.qualified('leasePayments',inputs.leasePayments);
  const ids=terms.map(row=>row.id), byLease=grouped(payments,row=>row.lease);
  const liability=ledgerGroups(book,'lease-liability',ledger,ids), assets=ledgerGroups(book,'lease-rou',extra.rou,ids);
  extras(book,'lease-payment',payments,row=>row.lease,ids);
  const totals={leaseLiability:0,leaseRou:0,ledger:sum(ledger),ledgerRou:sum(extra.rou)};
  for (const term of terms) {
    const rows=[...(byLease.get(term.id)??[])].sort((a,b)=>a.sequence-b.sequence);
    if (term.method!=='fixed_arrears'||!rows.length||rows.length>120||term.life<1||term.life>120||term.elapsed>rows.length||
        rows.some((row,i)=>row.sequence!==i+1)) fail('Тогтмол төлбөрийн баталсан, дараалсан хуваарь шаардлагатай · '+term.id);
    const initialLiability=checkedPv(rows,term.rate_bps), initialRou=initialLiability+term.initial_adjustment;
    if (initialRou<0) fail('Сөрөг анхны ашиглах эрхийн хөрөнгө · '+term.id);
    let expectedLiability=initialLiability;
    for (const payment of rows.slice(0,term.elapsed)) expectedLiability+=ratio(expectedLiability,term.rate_bps,10000)-payment.amount;
    if (expectedLiability < -1) fail('Түрээсийн хуваарийн сөрөг үлдэгдэл · '+term.id);
    const expectedRou=ratio(initialRou,Math.max(0,term.life-term.elapsed),term.life);
    const l=liability.get(term.id)??[], a=assets.get(term.id)??[];
    const flag=caseFor(book,'lease',term.id,[term,...rows,...l,...a],
      {initialLiability,initialRou,leaseLiability:expectedLiability,leaseRou:expectedRou,recordedLiability:term.recorded_liability,
        recordedRou:term.recorded_rou,ledger:sum(l),ledgerRou:sum(a)});
    if (expectedLiability!==term.recorded_liability||expectedRou!==term.recorded_rou) flag('valuation');
    if (expectedLiability!==sum(l)||expectedRou!==sum(a)) flag('variance');
    totals.leaseLiability+=expectedLiability; totals.leaseRou+=expectedRou;
  }
  return totals;
}

export function fx(scope,inputs,ledger,book) {
  const positions=book.qualified('fxPositions',inputs.fxPositions);
  if (!positions.length) fail('Хүчинтэй валютын гүйлгээ эсвэл мөнгөн үлдэгдэл шаардлагатай.');
  const rates=versioned(book,'fxRates',inputs.fxRates,scope.edition);
  const lookup=grouped(rates,row=>key(row.foreign_currency,row.date));
  const postings=ledgerGroups(book,'fx-ledger',ledger,positions.map(row=>row.id));
  const totals={fxFunctional:0,fxRecorded:0,ledger:sum(ledger)};
  for (const row of positions) {
    if (!/^[A-Z]{3}$/.test(row.foreign_currency)||row.foreign_currency===scope.currency||
        !(row.basis==='transaction'&&within(row.date,scope)||row.basis==='monetary_close'&&row.date===scope.end)) {
      fail('Дэмжигдээгүй валютын суурь, валют эсвэл огноо · '+row.id);
    }
    const approved=lookup.get(key(row.foreign_currency,row.date))??[], rate=approved[0];
    if (approved.length!==1||rate.direction!=='functional_per_foreign'||rate.rate_micros<=0) {
      fail('Яг нэг баталсан чиглэлтэй ханш шаардлагатай · '+row.id+' · '+row.date);
    }
    const expected=ratio(row.foreign_amount,rate.rate_micros,1_000_000), gl=postings.get(row.id)??[];
    const flag=caseFor(book,'fx',row.id,[row,rate,...gl],{fxFunctional:expected,fxRecorded:row.recorded,ledger:sum(gl)});
    if (expected!==row.recorded) flag('valuation');
    if (expected!==sum(gl)) flag('variance');
    totals.fxFunctional+=expected; totals.fxRecorded+=row.recorded;
  }
  return totals;
}

export function equity(scope,inputs,ledger,book) {
  const register=versioned(book,'equity',inputs.equity,scope.edition), actions=book.qualified('equityActions',inputs.equityActions);
  const ids=register.map(row=>row.id), byComponent=grouped(actions,row=>row.component), postings=ledgerGroups(book,'equity',ledger,ids);
  extras(book,'equity-action',actions,row=>row.component,ids);
  const totals={equityClosing:0,ledger:sum(ledger)};
  for (const row of register) {
    if (row.method!=='roll_forward') fail('Дэмжигдээгүй өмчийн бодлого · '+row.id);
    const expected=row.opening+row.profit+row.contributions-row.distributions+row.transfers+row.movements;
    const support=byComponent.get(row.id)??[], valid=support.filter(action=>action.reference&&within(action.date,scope)&&
      ['contribution','distribution'].includes(action.kind));
    const contributions=sum(valid.filter(a=>a.kind==='contribution')), distributions=sum(valid.filter(a=>a.kind==='distribution'));
    const gl=postings.get(row.id)??[], flag=caseFor(book,'equity',row.id,[row,...support,...gl],
      {equityClosing:expected,closing:row.closing,contributions,distributions,ledger:sum(gl)});
    if (expected!==row.closing) flag('rollforward');
    if (expected!==sum(gl)) flag('variance');
    if (contributions!==row.contributions||distributions!==row.distributions||support.length!==valid.length) flag('authority');
    totals.equityClosing+=expected;
  }
  return totals;
}

export function investments(scope,inputs,ledger,book,extra) {
  const positions=versioned(book,'investments',inputs.investments,scope.edition), custody=book.qualified('custody',inputs.custody);
  const flows=book.qualified('investmentCashFlows',inputs.investmentCashFlows.filter(row=>row.edition===scope.edition));
  const ids=positions.map(row=>row.id), custodyGroups=grouped(custody,row=>row.instrument), flowGroups=grouped(flows,row=>row.instrument);
  const costs=ledgerGroups(book,'investment-cost',ledger,ids), income=ledgerGroups(book,'investment-income',extra.income,ids);
  extras(book,'custody',custody,row=>row.instrument,ids); extras(book,'investment-flow',flows,row=>row.instrument,ids);
  const totals={investmentCost:0,investmentIncome:0,valuedInstruments:0,investmentPv:0,ledger:sum(ledger),ledgerIncome:sum(extra.income)};
  for (const row of positions) {
    const expectedUnits=row.opening_units+row.acquired_units-row.disposed_units+row.other_units;
    const expectedCost=row.opening_cost+row.additions-row.disposals+row.transfers;
    const cash=[...(flowGroups.get(row.id)??[])].sort((a,b)=>a.sequence-b.sequence);
    let pv;
    if (row.method==='discounted_cash_flows') {
      if (!cash.length||cash.length>120||cash.some((flow,i)=>flow.method!=='period_end'||flow.sequence!==i+1||flow.rate_bps!==cash[0].rate_bps)) {
        fail('Баталсан тогтмол үеийн хөнгөлөлт ба мөнгөн урсгал шаардлагатай · '+row.id);
      }
      pv=checkedPv(cash,cash[0].rate_bps);
      totals.valuedInstruments++; totals.investmentPv+=pv;
    } else if (row.method!=='cost_only'||cash.length||row.valuation!==0) fail('Дэмжигдээгүй хөрөнгө оруулалтын бодлого · '+row.id);
    const held=custodyGroups.get(row.id)??[], close=held.filter(c=>c.date===scope.end);
    const c=costs.get(row.id)??[], i=income.get(row.id)??[];
    const flag=caseFor(book,'investment',row.id,[row,...held,...cash,...c,...i],{investmentCost:expectedCost,
      expectedUnits,closingUnits:row.closing_units,investmentIncome:row.income,ledger:sum(c),ledgerIncome:sum(i),
      ...(pv!==undefined&&{investmentPv:pv,valuation:row.valuation})});
    if (expectedUnits!==row.closing_units||expectedCost!==row.closing_cost||expectedUnits<0||expectedCost<0) flag('rollforward');
    if (close.length!==1||close[0].closing_units!==row.closing_units||close[0].closing_cost!==row.closing_cost||close[0].income!==row.income) flag('variance');
    if (expectedCost!==sum(c)||row.income!==sum(i)) flag('variance');
    if (pv!==undefined&&pv!==row.valuation) flag('valuation');
    totals.investmentCost+=expectedCost; totals.investmentIncome+=row.income;
  }
  return totals;
}
