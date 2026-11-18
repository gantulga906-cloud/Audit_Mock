import {PilotError} from './pilot-workflow.mjs';
const fail=message=>{throw new PilotError(409,message);};
const key=(...parts)=>JSON.stringify(parts);
const sum=(rows,field='amount')=>safe(rows.reduce((n,r)=>n+BigInt(r[field]),0n));
const safe=n=>{const v=Number(n);if(!Number.isSafeInteger(v))fail('Calculation exceeds the supported integer range.');return v;};
const add=(a,b)=>safe(BigInt(a)+BigInt(b));
const difference=(a,b)=>safe(BigInt(a)-BigInt(b));
const ratio=(amount,n,d)=>{if(d<=0)fail('A positive denominator is required.');const a=BigInt(amount)*BigInt(n),b=BigInt(d),v=a<0n?-a:a;return safe((a<0n?-1n:1n)*((2n*v+b)/(2n*b)));};
const group=(rows,fn)=>Map.groupBy(rows,fn);
function primary(book,kind,inputs,scope,method){
 const rows=book.qualified(kind,inputs[kind]);if(!rows.length)fail('A nonempty, uniquely identified, in-scope primary source is required.');
 if(rows.some(r=>r.edition!==scope.edition||r.method!==method))fail('Select the exact supported method and source edition; unsupported methods are not converted.');return rows;
}
function ledger(book,rows,expected,label){const actual=sum(rows);if(actual!==expected)book.add(key(label,'ledger'),label+' / ledger','residual',rows,{expected,ledger:actual,residual:difference(expected,actual)});return actual;}
function compare(book,section,row,expected,trace=[],extra={}){
 const metrics={expected,recorded:row.recorded,difference:difference(expected,row.recorded),...extra};
 if(expected!==row.recorded)book.add(key(section,row.id),row.id,'variance',[row,...trace],metrics);
 book.link(key(section,row.id),row.id,[row,...trace],metrics);return metrics;
}

export function assetSchedule(scope,inputs,postings,book){
 const rows=primary(book,'assetSchedule',inputs,scope,'straight_line_full_year');let charge=0,carrying=0;
 for(const row of rows){if(row.life<1||row.elapsed>row.life||row.cost<row.residual)fail('Supported full-year straight-line cost, residual and life are required.');
  const expectedCharge=ratio(row.cost-row.residual,1,row.life),accumulated=ratio(row.cost-row.residual,row.elapsed,row.life),expectedCarrying=row.cost-accumulated;
  compare(book,'asset-method',row,expectedCarrying,[],{annualCharge:expectedCharge,recordedCharge:row.charge,carrying:expectedCarrying});
  if(expectedCharge!==row.charge)book.add(key('asset-method',row.id),row.id,'variance',[row],{annualCharge:expectedCharge,recordedCharge:row.charge});
  charge=add(charge,expectedCharge);carrying=add(carrying,expectedCarrying);
 }
 return {annualCharge:safe(BigInt(charge)),carrying:safe(BigInt(carrying)),ledger:ledger(book,postings,carrying,'carrying'),professionalJudgment:'Rights, recognition, useful life and impairment require separate evidenced work.'};
}

export function longReceivables(scope,inputs,postings,book){
 const rows=primary(book,'receivableSchedule',inputs,scope,'contractual_rollforward');let closing=0;
 for(const row of rows){if(!row.terms)fail('Exact contractual rights and repayment terms are required.');const expected=safe(BigInt(row.opening)+BigInt(row.additions)-BigInt(row.repayments));if(expected<0)fail('Negative contractual receivable profile is unsupported.');
  if(expected!==row.closing)book.add(key('receivable',row.id),row.id,'rollforward',[row],{expected,closing:row.closing});
  book.add(key('receivable',row.id),row.id,'judgment',[row],{expected,dueDate:row.due_date,classification:'Framework/operating-cycle and recovery assessment required; no automatic current/noncurrent decision.'});
  book.link(key('receivable',row.id),row.id,[row],{expected,closing:row.closing,dueDate:row.due_date});closing=add(closing,expected);
 }
 return {closing:safe(BigInt(closing)),ledger:ledger(book,postings,closing,'receivables')};
}

export function allocations(scope,inputs,postings,book){
 const rows=primary(book,'allocationSchedule',inputs,scope,'equal_months');let remaining=0,released=0;
 for(const row of rows){const [year,month]=row.from.split('-').map(Number),lastDay=new Date(Date.UTC(year,month-1+row.months,1)-86400000),cutoff=new Date(Date.parse(scope.end)+86400000),elapsed=Math.min(row.months,Math.max(0,(Number(scope.end.slice(0,4))-year)*12+Number(scope.end.slice(5,7))-month+1));if(row.months<1||row.months>1200||!row.from.endsWith('-01')||!Number.isFinite(lastDay.getTime())||lastDay.toISOString().slice(0,10)!==row.to||cutoff.getUTCDate()!==1||row.elapsed!==elapsed)fail('An exact full-calendar-month schedule and elapsed months at the actual period end are required. Partial or nonuniform methods remain unsupported.');
  const earned=ratio(row.amount,row.elapsed,row.months),unexpired=row.amount-earned;compare(book,'allocation',row,unexpired,[],{released:earned,remaining:unexpired,months:row.months,elapsed:row.elapsed});remaining=add(remaining,unexpired);released=add(released,earned);
 }
 return {remaining:safe(BigInt(remaining)),released:safe(BigInt(released)),ledger:ledger(book,postings,remaining,'allocation'),professionalJudgment:'Actual consumption/performance, cancellation, conditions and classification require separate evidence.'};
}

export function accruals(scope,inputs,postings,book){
 const rows=primary(book,'accrualSchedule',inputs,scope,'supported_service_cutoff');let expected=0;
 for(const row of rows){if(!row.support||row.service_date>scope.end||row.service_date<scope.start||row.invoice_date<=scope.end||row.invoice_date>scope.through)fail('Supported in-period service and an actually inspected subsequent invoice are required.');compare(book,'accrual',row,row.amount,[],{serviceDate:row.service_date,invoiceDate:row.invoice_date});expected=add(expected,row.amount);}
 return {expected:safe(BigInt(expected)),ledger:ledger(book,postings,expected,'accrual'),professionalJudgment:'The service, obligation and period basis must be corroborated; invoice timing alone is insufficient.'};
}

export function intercompany(scope,inputs,postings,book){
 const own=primary(book,'intercompanyBalances',inputs,scope,'reciprocal_comparison'),other=primary(book,'reciprocalBalances',inputs,scope,'reciprocal_comparison');
 const identity=r=>key(r.counterparty,r.reference,r.date),groups=group(other,identity),ownGroups=group(own,identity);let ownTotal=0,reciprocal=0;
 for(const row of [...own,...other])if(!row.counterparty||!row.reference||row.date!==scope.end||!['receivable','payable'].includes(row.direction))fail('Exact counterparty, reference, period-end date and reciprocal direction are required.');
 for(const row of own){const matches=groups.get(identity(row))??[];ownTotal=add(ownTotal,row.amount);
  if(matches.length!==1||ownGroups.get(identity(row)).length!==1||matches[0].direction===row.direction){book.add(key('intercompany',row.id),row.id,'unmatched',[row,...matches],{own:row.amount,reciprocal:'unknown'});continue;}
  const balance=matches[0];reciprocal=add(reciprocal,balance.amount);const delta=difference(row.amount,balance.amount);book.link(key('intercompany',row.id),row.id,[row,balance],{own:row.amount,reciprocal:balance.amount,difference:delta});if(delta)book.add(key('intercompany',row.id),row.id,'variance',[row,balance],{difference:delta,own:row.amount,reciprocal:balance.amount});
 }
 for(const row of other)if(!ownGroups.has(identity(row)))book.add(key('reciprocal',row.id),row.id,'unmatched',[row],{reciprocal:row.amount});
 return {own:ownTotal,reciprocal,ledger:ledger(book,postings,ownTotal,'intercompany'),professionalJudgment:'No canonical party merge, arm\'s-length opinion or automatic elimination journal is produced.'};
}

export function costOfSales(scope,inputs,postings,book,extra){
 const lots=primary(book,'costLots',inputs,scope,'periodic_weighted_average'),issues=primary(book,'costIssues',inputs,scope,'periodic_weighted_average'),identity=r=>key(r.item,r.location,r.unit),groups=group(lots,identity),out=group(issues,identity);let cost=0,closing=0;
 for(const row of [...lots,...issues])if(!row.item||!row.location||!row.unit||row.quantity<1||row.date<scope.start||row.date>scope.end)fail('Actual positive units, exact item/location/unit and in-period dates are required.');
 for(const row of lots)if(!['opening','receipt'].includes(row.kind)||row.kind==='opening'&&row.date!==scope.start)fail('Explicit opening and receipt lots are required.');
 for(const [id,rows] of groups){const selected=out.get(id)??[],quantity=sum(rows,'quantity'),issued=sum(selected,'quantity');if(issued>quantity)fail('Issues exceed the supported available quantity.');const value=safe(rows.reduce((n,r)=>n+BigInt(r.quantity)*BigInt(r.unit_price),0n)),expected=ratio(value,issued,quantity),remaining=value-expected,recorded=sum(selected,'recorded');cost=add(cost,expected);closing=add(closing,remaining);
  book.link(key('costing',id),rows[0].item,[...rows,...selected],{availableQuantity:quantity,issuedQuantity:issued,availableCost:value,expectedCostOfSales:expected,expectedClosing:remaining,recorded});
  if(recorded!==expected)book.add(key('costing',id),rows[0].item,'variance',[...rows,...selected],{expected,recorded,difference:difference(expected,recorded)});
 }
 for(const [id,rows] of out)if(!groups.has(id))fail('An issue has no exact item/location/unit cost basis; no zero-cost fallback is allowed.');
 return {costOfSales:safe(BigInt(cost)),closingInventory:safe(BigInt(closing)),ledger:ledger(book,postings,cost,'cost-of-sales'),ledgerInventory:ledger(book,extra.inventory,closing,'closing-inventory'),method:'periodic_weighted_average; round half away from zero in currency minor units',professionalJudgment:'Completeness, cost components, cut-off, NRV and the applicable costing method require actual source work.'};
}

export function expenses(scope,inputs,postings,book){
 const rows=primary(book,'expenseSchedule',inputs,scope,'supported_expense'),support=book.qualified('expenseSupport',inputs.expenseSupport),by=group(support,r=>r.expense);let expected=0;
 for(const row of rows){if(!row.contract||row.date<scope.start||row.date>scope.end)fail('Actual contract and in-period expense basis are required.');const sources=by.get(row.id)??[];
  if(!sources.length||sources.some(s=>!s.basis||s.date<scope.start||s.date>scope.end))fail('The exact expense requires corroborating in-period service evidence.');const amount=sum(sources);compare(book,'expense',row,amount,sources);expected=add(expected,amount);
 }
 const ids=new Set(rows.map(r=>r.id));for(const row of support)if(!ids.has(row.expense))book.add(key('expense-support',row.id),row.id,'unmatched',[row],{amount:row.amount});
 return {supported:safe(BigInt(expected)),ledger:ledger(book,postings,expected,'expenses'),professionalJudgment:'Occurrence, business purpose, classification and completeness remain evidenced judgments.'};
}

export function otherIncome(scope,inputs,postings,book){
 const rows=primary(book,'otherIncomeSchedule',inputs,scope,'supported_disposal_gain');let gain=0;
 for(const row of rows){if(!row.support||row.date<scope.start||row.date>scope.end)fail('Actual disposal support and in-period date are required.');const expected=row.proceeds-row.carrying;compare(book,'disposal-gain',row,expected,[],{proceeds:row.proceeds,carrying:row.carrying});gain=add(gain,expected);}
 return {gain:safe(BigInt(gain)),ledger:ledger(book,postings,gain,'other-income'),professionalJudgment:'Other transaction types, legal rights, recognition, conditions and restrictions require their actual selected manual or specialist method.'};
}
