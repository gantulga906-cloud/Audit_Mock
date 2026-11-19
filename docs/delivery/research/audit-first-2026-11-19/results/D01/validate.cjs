/* Structural research validation only; does not implement or test an importer. */
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const repo=path.resolve(__dirname,'../../../../../..');
const root=path.join(repo,'docs/delivery/research/audit-first-2026-11-19/results/D01');
function parseCSV(s){
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){if(quoted&&s[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
    else if(c===','&&!quoted){row.push(cell);cell='';}else if(c==='\n'&&!quoted){row.push(cell.replace(/\r$/,''));if(row.some(Boolean))rows.push(row);row=[];cell='';}else cell+=c;}
  assert(!quoted,'Unclosed CSV quote');if(cell||row.length){row.push(cell);rows.push(row);}const head=rows.shift();
  assert.equal(new Set(head).size,head.length,'Duplicate CSV header');return rows.map(r=>{assert.equal(r.length,head.length,'CSV field count');return Object.fromEntries(head.map((h,i)=>[h,r[i]]));});
}
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const table=n=>parseCSV(read(n));
const registers=JSON.parse(fs.readFileSync(path.join(repo,'src/data/source-registers.json'),'utf8'));
const expected=registers.e2e.filter(r=>['A01','A02','A03'].includes(r.lifecycle));
const cross=table('Source_and_Branch_Crosswalk.csv'),rules=table('Blocker_Register.csv'),cases=table('Acceptance_Scenarios.csv'),imports=table('Import_Scenarios.csv'),sources=table('Sources.csv'),decisions=table('Decisions_Open.csv'),fields=table('Client_Fields.csv');
function unique(rows,key){assert.equal(new Set(rows.map(r=>r[key])).size,rows.length,key+' duplicate');}
for(const [rows,key]of[[cross,'source_step_id'],[rules,'rule_id'],[cases,'scenario_id'],[imports,'scenario_id'],[sources,'source_id'],[decisions,'decision_id']])unique(rows,key);
assert.deepEqual(cross.map(r=>r.source_step_id).sort(),expected.map(r=>r.work_id).sort(),'Full exact A01-A03 coverage');
const ruleIds=new Set(rules.map(r=>r.rule_id)),caseIds=new Set(cases.map(r=>r.scenario_id)),sourceIds=new Set(sources.map(r=>r.source_id)),decisionIds=new Set(decisions.map(r=>r.decision_id));
const tickets=new Set([...read('AS_IS_and_Engineering_Tickets.md').matchAll(/\| (D01-T\d+) \|/g)].map(m=>m[1]));
for(const r of cross){const original=expected.find(x=>x.work_id===r.source_step_id);assert.equal(r.original_work,original.work);assert.equal(r.source_locator,original.locator);assert.equal(r.source_id,original.source);assert.equal(r.original_case_ids,original.cases.join(';'));assert.equal(r.original_roles,original.roles.join(';'));
  for(const x of r.rule_ids.split(';'))assert(ruleIds.has(x),x);for(const x of r.scenario_ids.split(';'))assert(caseIds.has(x),x);for(const x of r.ticket_ids.split(';'))assert(tickets.has(x),x);}
for(const r of rules){assert.equal(r.approval_status,'RESEARCH_DRAFT_NOT_ACTIVE');assert(decisionIds.has(r.open_decision),r.open_decision);for(const x of r.source_ids.split(';'))assert(sourceIds.has(x),x);}
for(const r of cases){assert(expected.some(x=>x.work_id===r.source_step_id));for(const x of r.rule_ids.split(';'))assert(ruleIds.has(x),x);}
assert(decisions.every(r=>r.status==='OPEN'),'Do not invent approvals');
const schema=JSON.parse(read('Client_Import_Schema.json')),sample=JSON.parse(read('examples/valid_package.json'));
for(const group of ['clients','contacts']){const props=schema.properties[group].items.properties,required=schema.properties[group].items.required;
  assert.deepEqual(Object.keys(props).sort(),fields.filter(r=>r.table===group.toUpperCase()).map(r=>r.field).sort());
  for(const row of sample[group]){for(const k of required)assert(row[k],group+':'+k);for(const[k,v]of Object.entries(row)){assert(props[k],k);assert.equal(typeof v,'string');if(props[k].maxLength)assert(v.length<=props[k].maxLength);if(props[k].enum)assert(props[k].enum.includes(v));}}
  const headers=read('examples/'+group.toUpperCase()+'_template.csv').trim().split(',').map(x=>x.replaceAll('"',''));assert.deepEqual(headers,Object.keys(props));}
assert.equal(sample.clients[0].registration_number,'00012345');
assert.equal(table('examples/CLIENTS_invalid_duplicates.csv').length,2);
for(const c of sample.contacts)assert(sample.clients.some(r=>r.source_client_key===c.source_client_key));
let linkCount=0;const files=[];function walk(p){for(const d of fs.readdirSync(p,{withFileTypes:true})){const q=path.join(p,d.name);d.isDirectory()?walk(q):files.push(q);}}walk(root);
for(const p of files.filter(p=>p.endsWith('.md'))){const text=fs.readFileSync(p,'utf8');assert(!text.includes('\u001a'),'Corrupt control char');for(const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){let target=m[1].split('#')[0];if(!target||/^[a-z]+:/i.test(target))continue;const resolved=path.resolve(path.dirname(p),target);assert(resolved===path.join(root,'D01_Validation.json')||fs.existsSync(resolved),'Missing link '+target);linkCount++;}}
const report={as_of:'2026-11-19',baseline_commit:'13322c8a6aaa3d0a4ebda56ba94086da62545712',scope:'D01 / M36 research and specification only',result:'PASS',checks:{exact_source_steps:cross.length,source_step_counts:Object.fromEntries(['A01','A02','A03'].map(k=>[k,expected.filter(r=>r.lifecycle===k).length])),rules:rules.length,acceptance_scenarios:cases.length,import_scenarios:imports.length,source_records:sources.length,open_decisions:decisions.length,field_definitions:fields.length,engineering_tickets:tickets.size,local_markdown_links:linkCount,original_work_case_role_locator_preserved:true,dangling_cross_references:0,all_rules_unapproved_draft:true,synthetic_package_and_template_structure:'PASS'},limitations:['Structural validation only; not application runtime tests','Not legal or professional approval','No importer implemented; expected scenarios are specifications','Local adoption and authoritative workbook edition remain unresolved']};
fs.writeFileSync(path.join(root,'D01_Validation.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
