import { validDate } from '../src/lib/feature-workflows.ts';
import { grouped } from './pilot-area-checks.mjs';
import { PilotError } from './pilot-workflow.mjs';

const fail = message => { throw new PilotError(409,message); };
const key = (...parts) => JSON.stringify(parts);
const sum = (rows,field='amount') => rows.reduce((total,row)=>total+row[field],0);
const roundRate = (amount,bps) => {
  const rounded=Number((BigInt(Math.abs(amount))*BigInt(bps)+5000n)/10000n);
  return amount<0?-rounded:rounded;
};

function selectEdition(book,kind,rows,edition) {
  const exact=book.qualified(kind,rows.filter(rule=>rule.edition===edition));
  if (!exact.length) fail('Баталсан дүрмийн хувилбар олдсонгүй · '+edition);
  return grouped(exact,rule=>rule.category);
}

function ruleAt(rules,row) {
  const effective=(rules.get(row.category)??[]).filter(rule=>rule.from<=row.date&&rule.to>=row.date);
  if (effective.length!==1) fail('Нэг хүчинтэй баталсан дүрэм шаардлагатай · '+row.id+' · '+row.category+' · '+row.date);
  return effective[0];
}

function referenceGroups(rows,book,section) {
  for (const row of rows) if (!row.reference) book.add(key(section,row.row),row.id,'unmatched',[row],{posting:row.amount});
  return grouped(rows.filter(row=>row.reference),row=>row.reference);
}

function flagUnmatched(book,section,groups,keys) {
  for (const [reference,rows] of groups) if (!keys.has(reference)) {
    book.add(key(section,reference),reference,'unmatched',rows,{posting:sum(rows)});
  }
}

function payrollAnalytics(scope,inputs,rows,book) {
  const {add,link,qualified}=book;
  const profile=qualified('payrollVariance',inputs.payrollVariance.filter(row=>row.edition===scope.edition));
  if (!profile.length) fail('Баталсан цалингийн харьцуулалтын хувилбар шаардлагатай.');
  const history=qualified('payrollHistory',inputs.payrollHistory);
  const identity=(employee,category,period)=>key(employee,category,period);
  for (const row of history) if (!row.employee||!row.category||!/^\d{4}-\d{2}$/.test(row.period)||!validDate(row.period+'-01')) {
    fail('Харьцуулах цалингийн ажилтан, ангилал, сар буруу · '+row.id);
  }
  const periods=grouped(rows,row=>identity(row.employee,row.category,row.date.slice(0,7)));
  const previous=grouped(history,row=>identity(row.employee,row.category,row.period));
  let payChanges=0, offCycle=0, missingComparator=0;
  for (const [id,group] of periods) {
    const record=group[0], month=record.date.slice(0,7), end=new Date(Date.parse(month+'-01')-86_400_000).toISOString().slice(0,7);
    const matches=profile.filter(rule=>group.every(row=>rule.from<=row.date&&rule.to>=row.date));
    if (matches.length!==1||matches[0].method!=='month_day'||matches[0].pay_day<1||matches[0].pay_day>28) {
      fail('Нэг дэмжигдсэн цалингийн хуваарь, босго шаардлагатай · '+record.id);
    }
    const rule=matches[0], comparators=previous.get(identity(record.employee,record.category,end))??[];
    const prior=comparators.length===1?comparators[0].gross:undefined;
    const gross=sum(group,'gross'), delta=prior!==undefined?gross-prior:undefined;
    const percentExceeded=prior>0&&delta!==undefined&&BigInt(Math.abs(delta))*10000n>BigInt(prior)*BigInt(rule.rate_bps);
    const metrics={gross,...(prior!==undefined&&{priorGross:prior,deltaGross:delta})};
    const trace=[...group,rule,...comparators], caseId=key('payroll-analytics',id), label=record.employee+' / '+month;
    const flagged=(code)=>add(caseId,label,code,trace,metrics);
    if (prior===undefined) {missingComparator++;flagged('comparator');}
    if (delta!==undefined&&(Math.abs(delta)>rule.amount||percentExceeded)) {payChanges++;flagged('payroll_delta');}
    if (group.some(row=>Number(row.date.slice(-2))!==rule.pay_day)) {offCycle++;flagged('off_cycle');}
    link(caseId,label,trace,metrics);
  }
  return {payChanges,offCycle,missingComparator};
}

export function payroll(scope,inputs,ledger,book,extra) {
  const {add,link,qualified}=book;
  const eligible=qualified('payroll',inputs.payroll).filter(row=>{
    if (row.date>=scope.start&&row.date<=scope.end) return true;
    add(key('payroll',row.id),row.id,'cutoff',[row]); return false;
  });
  const paymentKey=row=>key(row.employee,row.category,row.date,row.gross,row.employee_contribution,row.withholding,
    row.employer_contribution,row.other_deductions,row.net_adjustment,row.net);
  const paymentGroups=grouped(eligible,paymentKey);
  for (const [identity,group] of paymentGroups) if (group.length>1) {
    add(key('payroll-duplicate',identity),group[0].employee,'duplicate',group);
  }
  const rows=eligible.filter(row=>paymentGroups.get(paymentKey(row)).length===1);
  if (!rows.length) fail('Тайлант хугацааны хүчинтэй цалингийн мөр байхгүй.');
  const rates=selectEdition(book,'payrollRules',inputs.payrollRules,scope.edition);
  const deposits=qualified('payrollBank',inputs.payrollBank);
  const bankByPay=grouped(deposits,row=>row.payroll);
  const expense=referenceGroups(ledger,book,'expense'), liability=referenceGroups(extra.liability,book,'liability');
  const settlement=referenceGroups(extra.settlement,book,'settlement');
  const ids=new Set(rows.map(row=>row.id));
  for (const [section,groups] of [['expense',expense],['liability',liability],['settlement',settlement]]) flagUnmatched(book,section,groups,ids);
  for (const row of deposits) if (!ids.has(row.payroll)) add(key('payroll-bank',row.id),row.id,'unmatched',[row]);
  const totals={gross:0,expectedNet:0,recordedNet:0,expectedLiability:0,expectedExpense:0,bankPaid:0,
    ledgerExpense:sum(ledger),ledgerLiability:sum(extra.liability),ledgerSettlement:sum(extra.settlement)};
  for (const row of rows) {
    const rule=ruleAt(rates,row), id=key('payroll',row.id), label=row.employee+' / '+row.id;
    if (!row.employee||!['active','inactive'].includes(row.status)) fail(row.id+' · Ажилтны дугаар ба төлөв шаардлагатай.');
    if (!['flat','flat_cap'].includes(rule.method)||!['gross','after_employee'].includes(rule.withholding_base)||
        rule.method==='flat_cap'&&rule.cap<=0||rule.method==='flat'&&rule.cap!==0) {
      fail('Дэмжигдээгүй цалингийн дүрэм · '+rule.id);
    }
    const contributionBase=rule.method==='flat_cap'?Math.min(row.gross,rule.cap):row.gross;
    const employee=roundRate(contributionBase,rule.employee_bps), employer=roundRate(contributionBase,rule.employer_bps);
    const withholding=roundRate(rule.withholding_base==='after_employee'?row.gross-employee:row.gross,rule.withholding_bps);
    const expectedNet=row.gross-employee-withholding-row.other_deductions+row.net_adjustment;
    if (expectedNet<0) fail('Сөрөг цэвэр цалингийн тусгай боловсруулалт шаардлагатай · '+row.id);
    const expectedLiability=employee+employer+withholding+row.other_deductions;
    const expectedExpense=row.gross+employer+row.net_adjustment;
    const e=expense.get(row.id)??[], l=liability.get(row.id)??[], s=settlement.get(row.id)??[];
    const bankRows=bankByPay.get(row.id)??[], bank=bankRows.filter(b=>b.employee===row.employee&&b.date>=row.date&&b.date<=scope.through);
    const paid=bank.length===1?bank[0].amount:0;
    const withinPeriod=bank.length===1&&bank[0].date<=scope.end?paid:0;
    const metrics={gross:row.gross,expectedEmployee:employee,expectedEmployer:employer,expectedWithholding:withholding,
      expectedNet,recordedNet:row.net,expectedLiability,expectedExpense,ledgerExpense:sum(e),ledgerLiability:sum(l),ledgerSettlement:sum(s),bankPaid:paid};
    const trace=[row,rule,...e,...l,...s,...bankRows], flag=code=>add(id,label,code,trace,metrics);
    if (row.status==='inactive') flag('inactive');
    if (employee!==row.employee_contribution||employer!==row.employer_contribution||withholding!==row.withholding||expectedNet!==row.net) flag('statutory');
    if (expectedExpense!==sum(e)||expectedLiability!==sum(l)||withinPeriod!==sum(s)) flag('variance');
    if (bank.length!==bankRows.length||bank.length>1||paid!==expectedNet) flag('settlement');
    link(id,label,trace,metrics);
    totals.gross+=row.gross;totals.expectedNet+=expectedNet;totals.recordedNet+=row.net;
    totals.expectedLiability+=expectedLiability;totals.expectedExpense+=expectedExpense;totals.bankPaid+=paid;
  }
  return {...totals,...(inputs.payrollHistory&&payrollAnalytics(scope,inputs,rows,book))};
}

function periodKey(row) {
  if (!/^\d{4}-\d{2}$/.test(row.period)||!validDate(row.period+'-01')||!row.category||row.category.includes(':')) {
    fail('Татварын сар ба ангилал буруу · '+row.id);
  }
  return row.period+':'+row.category;
}

export function tax(scope,inputs,ledger,book,extra) {
  const {add,link,qualified}=book;
  const rows=qualified('tax',inputs.tax).filter(row=>{
    const correct=row.date>=scope.start&&row.date<=scope.end&&row.date.startsWith(row.period+'-');
    if (!correct) add(key('tax',row.id),row.id,'cutoff',[row]);
    return correct;
  });
  if (!rows.length) fail('Тайлант хугацааны хүчинтэй татварын мөр байхгүй.');
  const rates=selectEdition(book,'taxRules',inputs.taxRules,scope.edition);
  const groups=grouped(rows,periodKey), keys=new Set(groups.keys());
  const returns=grouped(qualified('taxReturns',inputs.taxReturns),periodKey);
  const payments=grouped(qualified('taxPayments',inputs.taxPayments),periodKey);
  const charges=referenceGroups(ledger,book,'tax-charge'), settlements=referenceGroups(extra.settlement,book,'tax-payment');
  for (const [section,collection] of [['tax-charge',charges],['tax-payment',settlements],['tax-return',returns],['payment',payments]]) {
    flagUnmatched(book,section,collection,keys);
  }
  const totals={expectedTax:0,recordedTax:0,deferredTax:0,filedTax:0,taxPaid:0,ledgerTax:sum(ledger),ledgerSettlement:sum(extra.settlement)};
  for (const [id,records] of groups) {
    const methods=records.map(row=>{
      const rule=ruleAt(rates,row);
      const supported={vat:'flat',withholding:'flat',current:'current',deferred:'temporary'}[row.category];
      if (!supported||rule.method!==supported) fail('Дэмжигдээгүй татварын дүрэм · '+rule.id);
      if (row.category!=='current'&&(row.adjustment!==0||row.offset!==0)) fail('Тусгай татварын тохируулга дэмжигдээгүй · '+row.id);
      const base=row.base+row.adjustment, computed=roundRate(base,rule.rate_bps);
      if (row.category==='current'&&(base<0||row.offset>computed)) fail('Алдагдал ба тусгай хөнгөлөлтийн дүрэм шаардлагатай · '+row.id);
      return {row,rule,expected:computed-row.offset};
    });
    const expected=sum(methods,'expected'), recorded=sum(records,'tax'), deferred=records[0].category==='deferred';
    const filed=returns.get(id)??[], bank=payments.get(id)??[];
    const validFiles=filed.filter(row=>row.date>=records[0].period+'-01'&&row.date<=scope.through);
    const validBank=bank.filter(row=>row.date>=records[0].period+'-01'&&row.date<=scope.through);
    const charge=charges.get(id)??[], settlement=settlements.get(id)??[];
    const paid=deferred?0:sum(validBank), periodPaid=deferred?0:sum(validBank.filter(row=>row.date<=scope.end));
    const metrics={expectedTax:expected,recordedTax:recorded,filedTax:sum(validFiles),taxPaid:paid,
      ledgerTax:sum(charge),ledgerSettlement:sum(settlement),unsettledTax:deferred?0:expected-paid};
    const trace=[...records,...methods.map(m=>m.rule),...filed,...bank,...charge,...settlement];
    const caseId=key('tax-period',id), flag=code=>add(caseId,id,code,trace,metrics);
    if (methods.some(m=>m.expected!==m.row.tax)) flag('statutory');
    if (expected!==sum(charge)) flag('variance');
    if (validFiles.length!==1||sum(validFiles)!==expected||filed.length!==validFiles.length) flag('filing');
    if (bank.length!==validBank.length||deferred&&bank.length||periodPaid!==sum(settlement)||!deferred&&paid>expected) flag('settlement');
    link(caseId,id,trace,metrics);
    if (deferred) totals.deferredTax+=expected;
    else {totals.expectedTax+=expected;totals.recordedTax+=recorded;totals.filedTax+=sum(validFiles);totals.taxPaid+=paid;}
  }
  return totals;
}
