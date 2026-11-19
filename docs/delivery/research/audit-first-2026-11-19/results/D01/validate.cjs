/* Structural research validation only; does not implement or test an importer. */
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),cp=require('child_process');
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
for(const r of rules){assert.equal(r.approval_status,'RESEARCH_DRAFT_NOT_ACTIVE');assert(decisionIds.has(r.open_decision),r.open_decision);for(const x of r.source_ids.split(';'))assert(sourceIds.has(x),x);assert(r.standards_profile);assert(r.baseline_source_ids);for(const x of r.baseline_source_ids.split(';')){assert(sourceIds.has(x),x);assert(!['IAASB-2026','IESBA-2026'].includes(x),'Newer comparison cannot silently replace local baseline');}for(const x of r.comparison_source_ids.split(';').filter(Boolean))assert(sourceIds.has(x),x);}
for(const r of cases){assert(expected.some(x=>x.work_id===r.source_step_id));for(const x of r.rule_ids.split(';'))assert(ruleIds.has(x),x);}
const allowedDispositions=new Set(['CLOSED_MONICPA_IFAC_BASELINE_SET','CLOSED_USER_CONFIRMED','MANUAL_METHOD_SPECIFIED','MANUAL_RULE_CHECK_SPECIFIED','MANUAL_WORKFLOW_SPECIFIED','ANSWER_CONTRACT_SPECIFIED','DESIGN_DECIDED']);
assert(decisions.every(r=>allowedDispositions.has(r.status)&&r.resolution&&r.resolution_reference==='D01_Resolved_Design.md'),'Every historical question needs explicit disposition; no invented professional approval');
const answers=table('Question_Answer_Contract.csv'),tenure=table('Tenure_Method_Cases.csv');
const answerForms=new Set(['1.1.1','1.4.1','1.4.2','1.4.3','1.4.5','1.4.6','1.4.7']);
const originalFields=registers.forms.filter(f=>answerForms.has(f.id)).flatMap(f=>f.fields.map(q=>({form:f.id,...q})));
assert.deepEqual(answers.map(r=>r.form_id+':'+r.original_field_key).sort(),originalFields.map(r=>r.form+':'+r.key).sort(),'Exact D01 field coverage');
for(const r of answers){const q=originalFields.find(q=>q.form===r.form_id&&q.key===r.original_field_key);assert.equal(JSON.parse(r.original_label_json),q.label);assert.equal(r.original_source_cell,q.source);assert.equal(r.status,'SPECIFIED_NOT_IMPLEMENTED');assert(r.meaning_kind&&r.implementation_contract);if(r.parent_group)assert(answers.some(a=>a.form_id+':'+a.original_field_key===r.parent_group));}
assert(tenure.every(r=>r.automatic_legal_calculation==='EXCLUDED_V1'),'Do not invent an implemented legal calculator');
const comparison=JSON.parse(read('Workbook_Comparison.json'));
assert.equal(comparison.working_baseline_sha256,'5fde7db15e766cdb616cb816d25a8fe6a6d5718f9975d4c0f885c344b079602c');
assert.equal(comparison.deployed_field_comparison.total,147);assert.equal(comparison.deployed_field_comparison.exact_whitespace_normalized,141);assert.equal(comparison.deployed_field_comparison.differences.length,6);
const baseline=JSON.parse(read('Baseline_Decision.json'));
assert.equal(baseline.workbook.status,'CLOSED_USER_CONFIRMED');assert.equal(baseline.workbook.historical_binary_recovery_required,false);assert.equal(baseline.workbook.sha256,comparison.working_baseline_sha256);
assert.equal(comparison.project_decision.status,'CLOSED_USER_CONFIRMED');assert.equal(comparison.project_decision.further_historical_recovery_required,false);
assert.equal(baseline.standards.status,'CLOSED_IFAC_AND_MONICPA_CONFIRMED');assert.equal(baseline.standards.audit_base_edition,'2020');assert.equal(baseline.standards.local_publication_notice.url,'https://www.monicpa.mn/c/576093?content=3856683');
for(const x of ['ISQM 1','ISQM 2','ISA 220 (Revised)','Related conforming amendments'])assert(baseline.standards.included_quality_updates.includes(x),x);
assert.equal(baseline.standards.ministerial_instrument_retrieval_required_to_continue_D01,false);assert.equal(baseline.closure.open_baseline_blockers,0);assert.equal(baseline.closure.closed_baseline_issues.length,2);
assert.equal(decisions.find(r=>r.decision_id==='L01').status,'CLOSED_MONICPA_IFAC_BASELINE_SET');assert.equal(decisions.find(r=>r.decision_id==='S01').status,'CLOSED_USER_CONFIRMED');
assert(sources.some(r=>r.source_id==='MN-MONICPA-PUBLICATION2023')&&sources.some(r=>r.source_id==='IAASB-ISA220-REVISED2020'));
assert(rules.find(r=>r.rule_id==='B15').baseline_source_ids.includes('IAASB-ISA220-REVISED2020'));
assert(sources.some(r=>r.source_id==='MN-ETHICS-2023')&&sources.some(r=>r.source_id==='MN-COMPANY')&&sources.some(r=>r.source_id==='MN-GIFT-DEFINITIONS'));
const changed=cp.execFileSync('git',['diff','--name-only','4bf0fca0155144246e3d5ff6e082ae0298cd3646'],{cwd:repo,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const prefix='docs/delivery/research/audit-first-2026-11-19/';
assert(changed.every(p=>p.startsWith(prefix+'results/D01/')||p===prefix+'domains/D01_Research_Plan.md'),'D01-only changes');
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
for(const p of ['README.md','D01_Resolved_Design.md','Applicability_and_Standards.md','AS_IS_and_Engineering_Tickets.md'])assert(!/two limits remain|two evidence limits remain|remain(?:s)? an explicit evidence limit|remain(?:s)? bounded evidence limits/i.test(read(p)),'Stale baseline blocker wording in '+p);
assert(!read('Applicability_and_Standards.md').includes('2020 ISA 220 paragraphs 12-14'),'Superseded ISA 220 cannot be current baseline');
const report={as_of:'2026-11-19',baseline_commit:'554822d84319adbe04decda3054ccd363b863913',scope:'D01 / M36 research and specification only',result:'PASS',checks:{exact_source_steps:cross.length,source_step_counts:Object.fromEntries(['A01','A02','A03'].map(k=>[k,expected.filter(r=>r.lifecycle===k).length])),rules:rules.length,acceptance_scenarios:cases.length,import_scenarios:imports.length,source_records:sources.length,historical_questions_with_explicit_dispositions:decisions.length,open_user_decisions:decisions.filter(r=>r.status==='OPEN').length,closed_baseline_issues:baseline.closure.closed_baseline_issues.length,open_baseline_blockers:baseline.closure.open_baseline_blockers,baseline_compilation:baseline.standards.audit_baseline,field_definitions:fields.length,question_answer_contract_fields:answers.length,tenure_method_cases:tenure.length,deployed_field_labels_compared:comparison.deployed_field_comparison.total,explicit_instruction_table_mappings:comparison.deployed_field_comparison.differences.length,engineering_tickets:tickets.size,local_markdown_links:linkCount,original_work_case_role_locator_preserved:true,dangling_cross_references:0,comparison_editions_separate_from_baseline:true,stale_baseline_blocker_wording:0,all_rules_not_deployed_or_professionally_approved:true,synthetic_package_and_template_structure:'PASS',D01_only_scope:'PASS'},limitations:['Structural validation only; not application runtime tests','Not legal or professional release approval','No importer implemented; expected scenarios are specifications']};
fs.writeFileSync(path.join(root,'D01_Validation.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
