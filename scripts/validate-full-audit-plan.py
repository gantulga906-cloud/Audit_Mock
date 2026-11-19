"""Validate authored coverage, lineage and illustrative math, not audit acceptance."""
from pathlib import Path
import json,csv,re,hashlib,subprocess
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'docs/delivery/research/audit-first-2026-11-19'
OUT=BASE/'results/FULL'
p=json.loads((OUT/'Plan_Data.json').read_text(encoding='utf-8'))
errors=[];checks=[]
def need(v,msg):
    if not v:errors.append(msg)
def rows(name):
    with (BASE/'registers'/f'{name}.csv').open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
def keyset(xs):return {x['id'] for x in xs}
for field,old,n in [('tasks','Research_Tasks',60),('methods','Method_Research',36),('variants','Fieldwork_Research',22),('automations','Automation_Research',58),('dependencies','Dependency_Research',20)]:
    need(len(p[field])==n,field+' count')
    need(len(keyset(p[field]))==n,field+' uniqueness')
    need(keyset(p[field])==keyset(rows(old)),field+' original IDs preserved')
    checks.append(f'{field}: {n} exact original unique IDs')
need({x['domain'] for x in p['tasks']}=={f'D{i:02}' for i in range(1,14)},'domain coverage')
sources=keyset(p['sources']);methods=keyset(p['methods']);tasks={x['id']:x for x in p['tasks']}
for t in p['tasks']:
    for k in ['decision','implementation_steps','data_contract','expected_cases','owning_paths','evidence_refs']:need(bool(t[k]),t['id']+' missing '+k)
    for m in t['method_ids'].split():need(m in methods,t['id']+' missing method '+m)
    for s in t['evidence_refs']:need(s in sources,t['id']+' missing source '+s)
    for f in t['owning_paths']:
        path=BASE/f if f.startswith('results/') else ROOT/f
        need(path.exists(),t['id']+' missing owning path '+f)
    need(t['professional_approval'].startswith('NOT-FABRICATED'),t['id']+' invented approval')
for m in p['methods']:
    for k in ['profile','inputs','algorithm','judgment','exceptions','example','refs']:need(bool(m[k]),m['id']+' missing '+k)
    for s in m['refs']:need(s in sources,m['id']+' missing source '+s)
for kind in ['tasks','batches']:
    key='id' if kind=='tasks' else 'batch_id';graph={x[key]:x['dependencies'].split() for x in p[kind]};seen=set();active=set()
    def visit(x):
        if x in active:errors.append(kind+' dependency cycle '+x);return
        if x in seen:return
        active.add(x)
        for d in graph[x]:
            if d not in graph:errors.append(kind+' unknown dependency '+d)
            else:visit(d)
        active.remove(x);seen.add(x)
    for k in graph:visit(k)
    checks.append(kind+' dependency graph: referential/acyclic check')
om={r['id']:r for r in rows('Automation_Research')}
for r in p['automations']:
    for k in ['original_minimum','original_inputs','original_human_responsibility','original_boundary','source']:need(r[k]==om[r['id']][k],r['id']+' original content changed '+k)
    need(bool(r['work']) and bool(r['expected']),r['id']+' missing distinct design/case')
need(len({r['expected'] for r in p['automations']})==58,'automation expected cases not distinct')
ov={r['id']:r for r in rows('Fieldwork_Research')}
for r in p['variants']:
    need(r['source_area']==ov[r['id']]['source_area'] and r['source_locators']==ov[r['id']]['source_locators'],r['id']+' original variant changed')
    need(len(r['work'])>=3 and bool(r['judgments']) and bool(r['matter']),r['id']+' incomplete specific work')
od={r['id']:r for r in rows('Dependency_Research')}
for r in p['dependencies']:
    for k in ['from','to','targetField','original_description']:need(r[k]==od[r['id']][k],r['id']+' source dependency changed')
    need(bool(r['payload']) and bool(r['guarded_action']) and bool(r['change_impact']),r['id']+' incomplete dependency')
def outrows(name):
    with (OUT/f'{name}.csv').open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
formrows=outrows('Form_Contracts');fieldrows=outrows('Field_Anchor_Crosswalk')
catalogue=json.loads((ROOT/'src/data/source-registers.json').read_text(encoding='utf-8'))['forms']
need(len(formrows)==70,'70 source form contracts')
need({f['form_id'] for f in formrows}=={f['id'] for f in catalogue},'exact source form IDs')
need(len(fieldrows)==sum(len(f['fields']) for f in catalogue),'candidate field census')
need(len({(f['form_id'],f['field_id']) for f in fieldrows})==len(fieldrows),'unique form/field key')
for name,k,original in [('Original_128_Task_Routing','original_task_id','task_to_guide'),('Original_2247_Obligation_Routing','original_id','requirement_traceability')]:
    r=outrows(name);o=json.loads((ROOT/f'docs/delivery/handbooks/registers/{original}.json').read_text(encoding='utf-8'))
    # Obligations are unique by (register,id), not id alone; preserve that grain.
    if k=='original_id':
        need({(x['original_register'],x[k]) for x in r}=={(x['register'],x['id']) for x in o},name+' exact register/id set')
    else:need({x[k] for x in r}=={x['id'] for x in o},name+' exact ID set')
    need(len(r)==len(o),name+' count')
    need(all(x['execution_domains'] and x.get('research_tasks',x.get('plan_task_ids')) for x in r),name+' routing gap')
    checks.append(name+': exact original identity grain preserved')
census=json.loads((OUT/'Read_Only_Source_Census.json').read_text(encoding='utf-8'))
for b in census['books']:
    fp=ROOT.parent/'outputs/erd-repaired-2026-11-03'/b['file']
    need(hashlib.sha256(fp.read_bytes()).hexdigest()==b['sha256'],b['file']+' changed after scan')
maths=json.loads((OUT/'Independent_Numerical_Checks.json').read_text(encoding='utf-8'))
need(len(maths['checks'])==25 and maths['passed'] and all(x['passed'] for x in maths['checks']),'independent illustrative arithmetic')
checks.append('Five source hashes unchanged;70 form contracts and all candidate field keys accounted for')
checks.append('25 elementary independent numerical expectations passed;no application execution implied')
text=(OUT/'FULL_RESEARCH_AND_EXECUTION_PLAN.md').read_text(encoding='utf-8')
for d in range(1,14):need((OUT/f'D{d:02}_Implementation_Design.md').exists(),f'D{d:02} result document')
for r in p['tasks']+p['methods']+p['variants']+p['automations']:need(r['id'] in text,r['id']+' missing full narrative')
# Check actual local relative links. Source registry references are text/code, not fabricated hyperlink targets.
for file in OUT.glob('*.md'):
    for href in re.findall(r'\[[^\]]+\]\(([^)]+)\)',file.read_text(encoding='utf-8')):
        if href.startswith(('http:','https:','mailto:')):continue
        need((file.parent/href.split('#')[0]).resolve().exists(),file.name+' broken link '+href)
changed=subprocess.check_output(['git','diff','--name-only',p['baseline'],'--','src','tests','docs/checkpoints','docs/delivery/handbooks'],cwd=ROOT,encoding='utf-8').strip()
need(not changed,'application/tests/historical source evidence changed')
checks.append('Application,tests,checkpoints and original handbook registers unchanged from pinned starting commit')
report=dict(as_of='2026-11-19',kind='Plan coverage/lineage consistency and elementary arithmetic only',passed=not errors,counts=p['counts'],checks=checks,errors=errors,professional_acceptance='NOT-PERFORMED',application_execution='NOT-PERFORMED',release_ready_changed=False)
(OUT/'Validation.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
print(json.dumps(report,indent=2))
raise SystemExit(0 if not errors else 1)
