// Exact account-grain primary allocations and nonadditive presentation references.
export function allocateStatements(tb,statements,configuration,{money,safe}){
 const issues=[],outputs=[],totals=new Map(),currency=configuration.currency;
 const sources=Map.groupBy(tb,r=>r.account),reported=new Map(statements.map(r=>[r.line,r]));
 const split=configuration.allocations!==undefined;
 const links=split?configuration.allocations:configuration.mapping;
 const references=configuration.presentationReferences??[];
 const bounded=rows=>Array.isArray(rows)&&rows.length<=200&&rows.every(r=>r&&typeof r==='object'&&!Array.isArray(r));
 if(!bounded(links)||!bounded(references)||split&&configuration.mapping?.length)throw Error('Select one bounded primary allocation contract, plus separate presentation references.');
 const linkMap=Map.groupBy(links,r=>r.account);
 for(const link of [...links,...references])if(typeof link.account!=='string'||!link.account||typeof link.line!=='string'||!link.line||![1,-1].includes(link.sign))throw Error('Allocation account, destination and explicit sign are required.');
 if(new Set(links.map(r=>JSON.stringify([r.account,r.line]))).size!==links.length)throw Error('Duplicate primary allocation destination.');
 if(new Set(references.map(r=>JSON.stringify([r.account,r.line]))).size!==references.length)throw Error('Duplicate presentation reference.');
 for(const account of linkMap.keys())if(!sources.has(account))issues.push({issue:'unknown-allocation-source',account});
 for(const [account,rows] of sources){
  const source=rows.reduce((n,r)=>safe(n+r.closing),0),selected=linkMap.get(account)??[];
  if(!selected.length||!split&&selected.length!==1){issues.push({issue:'unmapped-or-multiple-destination',account});continue;}
  const amounts=selected.map(link=>split?money(link.amount,'Primary allocation'):source);
  const allocated=amounts.reduce((n,a)=>safe(n+a),0),residual=safe(source-allocated);
  const offsetting=amounts.some(n=>source===0?n!==0:n!==0&&Math.sign(n)!==Math.sign(source));
  if(residual||offsetting)issues.push({issue:'primary-allocation-residual',account,source,allocated,residual,offsetting});
  for(let i=0;i<selected.length;i++){
   const link=selected[i],amount=amounts[i];
   totals.set(link.line,safe((totals.get(link.line)??0)+amount*link.sign));
   if(split)outputs.push({type:'allocation',account,line:link.line,source,allocated:amount,effect:safe(amount*link.sign),residual,currency,sourceRows:rows.map(r=>r.row),additive:true});
  }
 }
 const tolerance=money(configuration.tolerance,'Tolerance');if(tolerance<0)throw Error('Tolerance cannot be negative.');
 const compare=(line,computed,type='primary')=>{
  const row=reported.get(line),unit=Number(row?.unit);
  if(![1,1000,1000000].includes(unit)){issues.push({issue:'missing-or-invalid-display-unit',line});return;}
  const residual=computed===undefined?null:safe(computed-safe(row.amount*unit));
  outputs.push({...(type==='reference'&&{type:'reference',additive:false}),line,computed,reported:row.amount,unit,residual,currency});
  if(residual===null||Math.abs(residual)>safe(tolerance*unit))issues.push({issue:type==='reference'?'presentation-reference-residual':'statement-mapping-residual',line,residual});
 };
 for(const line of new Set([...totals.keys(),...statements.filter(r=>!references.some(ref=>ref.line===r.line)).map(r=>r.line)]))compare(line,totals.get(line));
 const referenceTotals=new Map();
 for(const ref of references){
  if(totals.has(ref.line)){issues.push({issue:'mixed-primary-and-reference-destination',line:ref.line});continue;}
  const rows=sources.get(ref.account);if(!rows){issues.push({issue:'unknown-reference-source',account:ref.account});continue;}
  const value=rows.reduce((n,r)=>safe(n+r.closing),0)*ref.sign;
  referenceTotals.set(ref.line,safe((referenceTotals.get(ref.line)??0)+value));
 }
 for(const [line,computed] of referenceTotals)compare(line,computed,'reference');
 return {outputs,issues};
}
