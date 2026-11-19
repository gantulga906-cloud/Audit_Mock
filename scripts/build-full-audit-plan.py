"""Build the complete authored plan and exact-ID coverage registers; never edit references."""
from pathlib import Path
import csv, json, hashlib, subprocess, re, zipfile, datetime, math
from decimal import Decimal, ROUND_HALF_UP
from collections import Counter
import openpyxl

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'docs/delivery/research/audit-first-2026-11-19'
OUT=BASE/'results/FULL'
OUT.mkdir(parents=True,exist_ok=True)
def read(name):
    with (BASE/'registers'/f'{name}.csv').open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
def jread(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def dump(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
def csvout(name,rows):
    if not rows:return
    keys=list(dict.fromkeys(k for r in rows for k in r))
    with (OUT/f'{name}.csv').open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=keys,lineterminator='\n');w.writeheader()
        for r in rows:w.writerow({k:json.dumps(v,ensure_ascii=False) if isinstance(v,(list,dict)) else v for k,v in r.items()})
def sh(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def load_js(name,key):
    code=f'console.log(JSON.stringify(require("./scripts/{name}.cjs").{key}))'
    return json.loads(subprocess.check_output(['node','-e',code],cwd=ROOT,encoding='utf-8'))
T=read('Research_Tasks');M=read('Method_Research');A=read('Automation_Research');V=read('Fieldwork_Research');D=read('Dependency_Research')
td=load_js('full-audit-plan-data','tasks');md=load_js('full-audit-method-data','methods');ad=load_js('full-audit-item-data','autos');vd=load_js('full-audit-item-data','areas')
source=jread(ROOT/'src/data/source-registers.json')
baseline=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,encoding='utf-8').strip()
date='2026-11-19'

# Source metadata contains pointers and limited interpretations, never copied standard text.
HB='https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf'
refs={}
def ref(i,title,url,extent,status='TARGETED-PASSAGES',limitation='Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability.'):
    refs[i]=dict(id=i,title=title,url_or_path=url,inspection_extent=extent,status=status,limitation=limitation,as_of=date)
ref('AUD-230','ISA230: audit documentation',HB,'Documentation/currentness/assembly requirements; project G07/G08 source and implementation records; comparative ASA230 requirements7-16/A21-A24.','PRIMARY-AND-CARRIED','Current project source records are reused; hashes and independent review are proposed product controls, not verbatim ISA mandates.')
ref('AUD-315','ISA315 Revised2019',HB,'2020 handbook included revised2019 text: objective/definitions and iterative risk assessment; earlier recorded paragraph13-38 review in project standards notes.','PRIMARY-AND-CARRIED','The accepted local compilation remains selected; do not silently substitute later international editions.')
for i,title,extent in [('AUD-240','ISA240 fraud','Relevant journal/fraud risk requirements and recorded G04 implementation research; exact paragraph numbering is edition-specific.'),('AUD-330','ISA330 responses','Existing verified standards notes: requirements5-30; current planning/execution implementation inspected.'),('AUD-265','ISA265 control deficiencies','Candidate governing source for communication work; design is based on existing planning/source obligations; full chosen-edition application review remains adoption work.'),('AUD-300','ISA300 planning','Existing source notes record requirements1-13; actual strategy/change records reviewed.'),('AUD-510','ISA510 opening balances','Existing source notes record requirements1-13; current opening-data and planning boundaries reviewed.'),('AUD-600','ISA600 group audits','D02 full applicable paragraphs9,11,19-20,40-45,50 and related application are reused; do not substitute ISA600Revised2022.'),('AUD-450','ISA450 misstatements','Original2020 handbook4-15 and current canonical correction/evaluation controls read.'),('AUD-501','ISA501 selected items','D02 legal-enquiry requirements9-12 carried; inventory/technical procedures use original source cards and G04; exact applicable full procedure remains method adoption evidence.'),('AUD-540','ISA540 estimates','Source work and current G04/G10/G11 estimate-model boundary reviewed; candidate full chosen-edition clauses remain method-specific adoption evidence.'),('AUD-570','ISA570 going concern','Existing source work and G05/G06/G11 horizon/uncertainty boundaries reviewed; local baseline maintained; revised2024 later international version is separate.'),('AUD-580','ISA580 representations','Current G05/G06 source work distinguishes requested/prepared/obtained/evaluated representations; chosen-edition paragraph review required in firm adoption.'),('AUD-260','ISA260 governance communications','Current G02/G05 source and implementation records; full exact-edition communication requirements remain policy adoption evidence.'),('AUD-700','ISA700 report structure/dating','Original2020 handbook10-19,21-49 selected passages, especially49; current opinion/wording/issue code inspected.'),('AUD-701','ISA701 key audit matters','Current G06 section contract and source obligations; full applicable engagement-specific KAM review remains professional method adoption.'),('AUD-706','ISA706 emphasis/other matter','Current G06 sections and ASA560 restricted-amendment comparison; full wording/applicability remains reviewed template adoption.'),('AUD-720','ISA720 other information','Current G05/G06 actual/expected-later other-information contracts; full applicable template clauses remain adoption evidence.')]:ref(i,title,HB,extent,'PRIMARY-OR-CARRIED-AS-STATED')
ref('AUD-320','ISA320/ASA320 materiality', 'https://standards.auasb.gov.au/node/859','Requirements10-14; original2020 ISA3209-14 read; no mandatory benchmark percentages.','PRIMARY-COMPARATIVE')
ref('AUD-500','ISA500/ASA500 evidence','https://standards.auasb.gov.au/node/1012','Full requirements6-11 and original handbook/source notes; relevance/reliability, entity-data accuracy/completeness and contradictions.','PRIMARY-COMPARATIVE')
ref('AUD-505','ISA505 confirmations',HB,'Requirements7-16 from recorded G03 and earlier verified research; D02 management-expert distinction preserved.','CARRIED-VERIFIED-RESEARCH')
ref('AUD-520','ISA520 analytics',HB,'Earlier recorded requirements1-7 and selected application; actual G03/G04 source/implementation distinctions inspected.','CARRIED-VERIFIED-RESEARCH')
ref('AUD-530','ISA530 and comparative ASA530','https://standards.auasb.gov.au/node/728','Requirements6-15 and application/appendices from node729; original2020 definitions5 and selected requirements read.','PRIMARY-COMPARATIVE','Australian additions/effective dates are not Mongolian law; method choices are proposed engineering policy, not prescribed sample formulas.')
ref('AUD-560','ISA560 and comparative ASA560','https://standards.auasb.gov.au/node/634','Requirements6-17 including12 limited amendment/dual-date condition read; original applicable ISA remains baseline.','PRIMARY-COMPARATIVE','Australian Aus12.1 prohibition is excluded from Mongolian design; actual local permission must be evidenced.')
ref('AUD-705','ISA705 and comparative ASA705','https://standards.auasb.gov.au/asa-705-apr-2022','Definitions5 and requirements6-15, qualified/adverse/disclaimer and rare interacting uncertainties read.','PRIMARY-COMPARATIVE')
ref('AUD-220R','ISA220 Revised original','https://www.irba.co.za/upload/IAASB-International-Standard-Auditing-220-Revised.pdf','D02 verified resources/review/consultation/EQR requirements carried; accepted local integrated quality update.','CARRIED-COMPLETED-D02')
ref('QM-1','ISQM1 integrated local quality baseline',HB,'D02 verified28-32 resources and earlier project34 responses/monitoring context; source B-series audit-facing requirements.','CARRIED-VERIFIED-RESEARCH')
ref('QM-2','ISQM2 original final pronouncement','https://www.ifac.org/system/files/publications/files/IAASB-Quality-Management-ISQM-2-Engagement-Quality-Reviews.pdf','Eligibility17-23 and performance24-27 read; D02 appointment/assistants; completion on/before report date.','PRIMARY-TARGETED')
ref('ACC-IAS2','IAS2 original PDF on UK regulator','https://www.endorsement-board.uk/documents/2184/IAS_2_-_Inventories.pdf','Cost scope/formulas23-27, NRV28-34 and source cost/quantity contracts; original PDF used rather than unverified AI HTML.','PRIMARY-REGULATOR-TEXT','UK adopted text is comparative, not evidence of Mongolian adoption; actual framework/period selected separately.')
ref('ACC-IAS16','IAS16 issuer2022 text','https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2022/issued/part-a/ias-16-property-plant-and-equipment.pdf?bypass=on','Recognition/cost, revaluation35-43, depreciation43-62 and deregognition67-72 selected passages.','PRIMARY-TARGETED','2022 text is not presented as all amendments effective in2026; current official overview/selected profile differences remain recorded.')
ref('ACC-IFRS16','IFRS16 original PDF on UK regulator','https://www.endorsement-board.uk/documents/2148/IFRS_16_-_Leases.pdf','Definition/term9-21, cost/liability22-28, subsequent measurement29-46 selected supported schedule passages.','PRIMARY-REGULATOR-TEXT','UK applicability is excluded; exemptions, options, rate and modifications remain approved inputs/scope.')
ref('ACC-IAS21','IAS21 original PDF on UK regulator','https://www.endorsement-board.uk/documents/2167/IAS_21_-_The_Effects_of_Changes_in_Foreign_Exchange_Rates.pdf','Transaction/functional/presentation roles and selected rates21-23/28/39; original PDF compared with source FX contract.','PRIMARY-REGULATOR-TEXT','Rate tables are actual engagement inputs; no live FX rate or automatic local adoption asserted.')
ref('ACC-IFRS10','IFRS10 original PDF on UK regulator','https://www.endorsement-board.uk/documents/2158/IFRS_10_-_Consolidated_Financial_Statements.pdf','Control/scope and consolidation procedureB86-B93 source path; bounded aggregation/elimination design.','PRIMARY-REGULATOR-TEXT','No UK-specific legal duties adopted; acquisition/NCI/equity-method complexity is explicitly scoped.')
ref('ACC-IFRS15','IFRS15 in AASB15 official compilation','https://standards.aasb.gov.au/sites/default/files/2026-11/AASB15_12-14_COMPdec22_07-26.pdf','Comparison with IFRS15; contract9, modification18-21, obligations22-30, satisfaction31-45, allocation73-86 selected passages.','PRIMARY-COMPARATIVE','Exclude Aus/not-for-profit/Tier2 text; not evidence of Mongolian adoption. Proposed time schedule is bounded arithmetic, not universal recognition.')
ref('ACC-IFRS9','IFRS9 in AASB9 official compilation','https://standards.aasb.gov.au/aasb-9-feb-2025-0','EIR5.4.1-4; impairment5.5.1-20, simplified5.5.15 and measurement5.5.17 read.','PRIMARY-COMPARATIVE','Exclude Aus/Tier2 provisions and local effective-date substitution; no blanket ECL certification.')
ref('ACC-IAS36','IAS36 in AASB136 official compilation','https://standards.aasb.gov.au/aasb-136-jan-2026','Scope2, definitions6, impairment indicators9-10, recoverable measurement18 and asset/CGU/reversal boundary read.','PRIMARY-COMPARATIVE','Exclude Australian NFP additions. Input comparison does not validate valuation assumptions.')
ref('ACC-IAS38','IAS38 in AASB138 official compilation','https://standards.aasb.gov.au/aasb-138-dec-2022-0','Recognition18-24, development52-67 and finite/indefinite life88-108 selected passages.','PRIMARY-COMPARATIVE','Exclude Aus/Tier2 requirements; exact framework/period remains explicit.')
ref('ACC-IAS37','IAS37 in AASB137 official compilation','https://standards.aasb.gov.au/aasb-137-jan-2026-0','Recognition14, best estimate36-40, present value45-47, reimbursements53-59 and obligations scope read.','PRIMARY-COMPARATIVE')
ref('ACC-IAS19','IAS19 in AASB119 official compilation','https://standards.aasb.gov.au/aasb-119-dec-2022','Short-term benefits11 and obligation distinction; source payroll/benefit limits reviewed.','PRIMARY-COMPARATIVE','Local tax/social-insurance rates are not established by IAS19; actuarial methods remain separate.')
ref('ACC-IAS23','IAS23 in AASB123 official compilation','https://standards.aasb.gov.au/aasb-123-mar-2020','Qualifying cost/commencement17, suspension20-21 and cessation22-25 selected passages.','PRIMARY-COMPARATIVE')
ref('ACC-IAS12','IAS12 in AASB112 official compilation','https://standards.aasb.gov.au/aasb-112-sep-2023','Tax-base/temporary-difference recognition and measurement46-51A read; DTA/uncertainty exceptions retained in scope.','PRIMARY-COMPARATIVE','No Mongolian tax rate/cap or tax-law conclusion is certified. Australian-specific provisions excluded.')
ref('ACC-IFRS13','IFRS13 in AASB13 official compilation','https://standards.aasb.gov.au/aasb-13-dec-2022','Measurement9/24, valuation techniques61-67, input hierarchy72-90 including76-80 read; issuer overview cross-checked.','PRIMARY-COMPARATIVE','UK original PDF retrieval failed; Australian primary comparative text supplies the research route. Full-model validation and market/input judgments remain separate from quoted-input arithmetic; exclude Aus additions.')
ref('ACC-IAS10','IAS10 in AASB110 official compilation','https://standards.aasb.gov.au/aasb-110-mar-2020','Definitions3; adjusting/nonadjusting8-11, dividends12-13, going concern14-16 and disclosure17-22; paired with ISA560 chronology.','PRIMARY-COMPARATIVE','Accounting adjustment/disclosure and auditor later-fact procedures have distinct scopes/dates; no automatic event classifier is proposed; exclude Aus additions.')
ref('ACC-PRESENTATION','IAS1 in AASB101; separate IFRS18 profile','https://standards.aasb.gov.au/aasb-101-dec-2022-0','Comparative presentation29-35/38-46; currency/rounding49-53; current/noncurrent69-76 and covenant amendments; earlier IFRS18 issuer effective-date context carried.','PRIMARY-COMPARATIVE','This is not a universally applicable disclosure library. Select framework/version, exclude Aus additions and do not automatically apply future IFRS18.')
ref('ENG-AUTH','OWASP Authorization Cheat Sheet','https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html','Least privilege, deny by default, every request/static resources, lookup IDs, logging and tests read.','PRIMARY-TECHNICAL')
ref('ENG-UPLOAD','OWASP File Upload Cheat Sheet','https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html','G03 existing verified guidance carried; type/size/expansion/isolation/permission design.','CARRIED-TECHNICAL')
ref('ENG-WCAG','W3C WCAG2.2','https://www.w3.org/TR/WCAG22/','Selected task criteria2.1.1,2.4.7,2.4.11,3.3.1,3.3.2,4.1.3; no conformance claim.','PRIMARY-TECHNICAL')
ref('ENG-SQLITE','SQLite Online Backup API','https://www.sqlite.org/backup.html','Current project actual backup/recovery utility and documented API basis; official source route carried.','CARRIED-TECHNICAL')
ref('ENG-OOXML','Existing bounded OOXML reader and native-format design','scripts/pilot-workbook.mjs','Actual parser source and G08 source comparison read; all five workbook bytes scanned read-only in this batch.','OBSERVED-CODE-AND-SOURCES','Reader support is not a full Excel formula engine or visual fidelity proof; native export adapters are proposed work.')
ref('STAT-BINOM','SciPy binomial distribution definition','https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.binom.html','Distribution/CDF documentation; independent elementary binomial fixture calculation executed.','PRIMARY-TECHNICAL','Probability model only, not audit-method approval or mandatory sample size.')
ref('STAT-HYPERGEOM','SciPy hypergeometric distribution definition','https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.hypergeom.html','Without-replacement population/defect/draw definitions and PMF/CDF.','PRIMARY-TECHNICAL','Finite-model defect threshold and acceptable risk require explicit methodology choice.')
ref('VENDOR-MUS','Diligent sample-size documentation','https://help.highbond.com/helpdocs/analytics/15/en-us/Content/analytics/data_preparation/sampling_data/calculating_sample_size_for_a_monetary_unit_sample.htm','Input/size/evaluation dependency and professional-input limitations read.','PRIMARY-VENDOR-METHOD-DOCUMENTATION','Workflow precedent only; vendor examples are not an independent mathematical validation or audit assurance proof.')
ref('D01-LOCAL-LAW','Completed D01 local-baseline/source findings','../D01/Applicability_and_Standards.md','D01 Baseline_Decision.json, primary-law/ethics Sources.csv and settled local baseline reused.','CARRIED-COMPLETED-D01','Do not reopen settled workbook/adoption issues. Retention/tax engagement facts require their own policy inputs.')
ref('D02-M35','Completed D02 capacity method','../D02/Capacity_Method_M35.md','Completed method, schema, literal fixtures/reference and independent checker carried.','CARRIED-COMPLETED-D02')
ref('D02-SPECIALIST','Completed D02 assignment/specialist authority contracts','../D02/Assignment_and_Authority_Contract.md','Assignment, credential/specialist/manual-packet/scoped-sharing contracts carried.','CARRIED-COMPLETED-D02')
for i in sorted(set(x for d in list(td.values())+list(md.values())+list(vd.values()) for x in d['refs'])-refs.keys()):
    ref(i,'Authored design: '+i.replace('DESIGN-','').replace('ENG-','').lower(),'FULL_RESEARCH_AND_EXECUTION_PLAN.md','Original proposed product/engineering convention; independently distinguish from external standards.','AUTHOR-DESIGN-INFERENCE','Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule.')
csvout('Source_Evidence',list(refs.values()))

# Read-only raw workbook census and field anchors. This does not certify semantic/visual fidelity.
forms=[];fields=[];books=[];anchors=[];formula_rows=[]
bookdir=ROOT.parent/'outputs/erd-repaired-2026-11-03'
for stage in range(1,6):
    p=bookdir/f'Audit_Stage_{stage}_Repaired.xlsx'
    before=sh(p); wb=openpyxl.load_workbook(p,data_only=False,read_only=False)
    nformula=ndv=0
    for f in [f for f in source['forms'] if f['stage']==stage]:
        ws=wb[f['sheet']];fsrows=[]
        vals=[(c.coordinate,c.value,c.data_type) for row in ws for c in row if c.value is not None]
        for cell,value,typ in vals:
            if typ=='f':
                here=re.fullmatch(r'([A-Z]+)(\d+)',cell)
                previous=here.group(1)+str(int(here.group(2))-1)
                expr=re.sub(r'\s|\$','',str(value)).upper()
                sequence=expr in ['='+previous+'+1','=+'+previous+'+1','=1+'+previous,'=+1+'+previous]
                nformula+=1;formula_rows.append(dict(form_id=f['id'],sheet=ws.title,cell=cell,expression=value,disposition='PRESENTATION-SEQUENCE-EXPRESSION' if sequence else 'REQUIRES-EXPRESSION-DISPOSITION',execution_claim='Expression classified structurally; not evaluated as audit logic'))
        nd=len(ws.data_validations.dataValidation);ndv+=nd
        row=dict(form_id=f['id'],title=f['title'],stage=stage,family=f['family'],workbook=p.name,working_sha256=before,sheet=ws.title,catalogue_fields=len(f['fields']),source_nonempty_cells=len(vals),formula_cells=sum(t=='f' for _,_,t in vals),validation_definitions=nd,merged_ranges=len(ws.merged_cells.ranges),embedded_images=len(ws._images),purpose=f['purpose'],source_locator=f.get('sourceLocator',''),semantic_review='EXPLICIT-ADOPTION-AND-AUDITOR-OBSERVATION-REQUIRED',native_export='XLSX form output; DOCX where narrative/report contract requires',source_scan='READ-ONLY-BYTE-AND-ANCHOR-CENSUS')
        forms.append(row)
        for field in f['fields']:
            anchor=field.get('source','');match=re.search(r'\$?([A-Z]+)\$?(\d+)',anchor)
            val=ws[f'{match.group(1)}{match.group(2)}'].value if match else None
            if match and val is None:
                coord=f'{match.group(1)}{match.group(2)}'
                for merged in ws.merged_cells.ranges:
                    if coord in merged:val=ws.cell(merged.min_row,merged.min_col).value;break
            fields.append(dict(form_id=f['id'],field_id=field['key'],label=field['label'],type=field['type'],options=field.get('options',[]),source_anchor=anchor,anchor_value=str(val) if val is not None else '',instruction=field.get('instruction',''),unit='EXPLICIT-PER-FIELD-ADOPTION' if field['type'] in ['number','money'] else '',status='EXISTING-SEMANTIC-CANDIDATE; NOT-INDEPENDENTLY-ACCEPTED'))
        anchors.extend(dict(form_id=f['id'],sheet=ws.title,cell=c,source_type=t,source_value=str(v)) for c,v,t in vals)
    wb.close();after=sh(p)
    if after!=before:raise AssertionError('Source changed: '+str(p))
    books.append(dict(file=p.name,sha256=before,form_count=sum(f['stage']==stage for f in source['forms']),formula_count=nformula,validation_definitions=ndv,source_unchanged=True))
csvout('Form_Contracts',forms);csvout('Field_Anchor_Crosswalk',fields);csvout('Formula_Dispositions',formula_rows)
dump(OUT/'Read_Only_Source_Census.json',dict(as_of=date,books=books,forms=len(forms),fields=len(fields),source_cells_read=len(anchors),scope='All selected catalogue form sheets; no formula execution, visual inspection or professional semantic acceptance implied.'))

# Exact original identifiers, text and boundaries survive in the new execution registers.
for t in T:
    if t['id'] not in td:
        domain=t['domain'];td[t['id']]=dict(decision='Reuse the completed '+domain+' research specification and its resolved decisions; engineering remains to implement its actual handoff.',steps=t['execution_steps'].split(' | '),fields='Use exact '+domain+' published field/authority/method contracts.',cases=[t['validation']],files=['results/'+domain+'/README.md'],refs=['D01-LOCAL-LAW' if domain=='D01' else 'D02-SPECIALIST'])
taskrows=[]
for t in T:
    q=td[t['id']]
    taskrows.append({**t,'historical_status':t['status'],'status':'CARRIED-COMPLETED-SPEC' if t['domain'] in ['D01','D02'] else 'RESEARCH-BASED-DESIGN-SPECIFIED','decision':q['decision'],'implementation_steps':q['steps'],'data_contract':q['fields'],'expected_cases':q['cases'],'owning_paths':q['files'],'evidence_refs':q['refs'],'engineering_execution':'NOT-PERFORMED-BY-THIS-BATCH','professional_approval':'NOT-FABRICATED;ACTUAL-ACCEPTANCE-REQUIRED'})
csvout('Task_Execution',taskrows)
methodrows=[{**r,**md[r['id']],'historical_status':r['status'],'status':'PROPOSED-BOUNDED-METHOD-SPECIFICATION','professional_approval':'NOT-FABRICATED'} for r in M]
csvout('Method_Implementation',methodrows)
autorows=[]
for r in A:
    n={**r,**ad[r['id']],'status':'MINIMUM-SPECIFIED;ENGINEERING-AND-ACCEPTANCE-TO-EXECUTE','method_contracts':r['method_ids'],'observed_execution':'NOT-PERFORMED-BY-THIS-BATCH','required_scenarios':'NORMAL;SPECIFIC-ADVERSE;MISSING-UNSUPPORTED;UNAUTHORIZED;CHANGED-SOURCE','change_rule':'Exact relied-upon source/policy changes stale affected run/review; identical retry retains one result; unrelated work remains current.'}
    autorows.append(n)
csvout('Automation_Implementation',autorows)
arearows=[{**r,**vd[r['id']],'status':'VARIANT-SPECIFIED;ACTUAL-SOURCE-ACCEPTANCE-TO-EXECUTE','original_procedure_keys':'Use actual pinned source programme; no invented procedure IDs','handoff':'actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence','required_scenarios':r['id']+'-NORMAL;'+r['id']+'-EXCEPTION;'+r['id']+'-MISSING;'+r['id']+'-UNAUTH;'+r['id']+'-CHANGE'} for r in V]
csvout('Fieldwork_Implementation',arearows)

payloads=[
('Current new-client acceptance outcome and exact approved decision/version','Positive decision-dependent scope conclusion','Changed acceptance/withdrawal reopens relying scope conclusion'),
('Current-period continuance outcome, unresolved conditions and decision/version','Positive continuance-dependent conclusion','Prior-year approval is never silently reused'),
('Exact agreed engagement-letter scope/additional-services terms/version','Conclusion that terms are actually agreed','Amended terms require affected scope/plan reassessment'),
('Independence declaration/threat assessment/current outcome','Positive independence-dependent acceptance conclusion','Unresolved threat remains unknown/review, not satisfactory Yes'),
('Accepted scope, period, terms and restrictions','Approval of affected overall plan','Changed agreed scope produces targeted plan/programme impact'),
('Selected performance materiality amount/currency/version and specific limits','Approval/use of dependent sample design','Changed threshold stales relying design/evaluation, not past selections'),
('Planned reliance, tested-control basis and current outcome','Approval of reliance-dependent sample assumptions','Failed/new control work requires revisiting reliance/size/procedures'),
('Assertion-specific assessed risk and selected response intent','Approval of affected balance-sheet response','Risk change reopens only affected response decision'),
('Applicable PPE response, assertion and actual selected work scope','Approval/execution of tailored PPE programme','Programme scope changes retain prior performed work and require impact review'),
('Actual selected PPE unit IDs, frame/selection version and tests','Conclusion that planned sampled detail tests were performed','Design-only/untested/missing selected item cannot satisfy actual work'),
('Evaluated bank reply or actual approved alternative work plus limitations','Cash-area confirmation/evidence conclusion','Attachment receipt alone cannot fulfill evaluated independent response'),
('Observed PPE exception, actual measured values/evidence and evaluation','Creation/classification of confirmed misstatement','Not every exception is a monetary error;link canonical issue once'),
('Current corrected/uncorrected signed evaluation and compatible final balances','Final analytics and overall evaluation','Agreement-only correction remains outstanding;reversed posting renews evaluation'),
('Current selected materiality/trivial/specific thresholds and qualitative basis','Current aggregate misstatement evaluation','Revision triggers affected renewed judgment, never retroactive number rewrite'),
('Reviewed final findings/sufficiency/qualitative effects','Authorized proposed opinion and correct report form','Unmodified4.1.A1 only if appropriate;modified path retained'),
('Actual obtained/evaluated representation original, signatory/date/scope','Relevant completion conclusion','Unsigned draft is not obtained representation;report-date move reassesses coverage'),
('Actual assigned quality confirmation and separately applicable formal EQR','Relevant completion/readiness action','Generic4.6/R4 is not formal EQR and cannot waive timing/eligibility'),
('Actually issued report/completed work/current reviews','Administrative assembly/controlled lock','Assembly cannot invent missing procedures or backdate conclusions'),
('Exact issued report plus complete approved statements/notes hashes','Archive manifest/custody offer','Offer/download/hash/readability/accepted custody remain separate'),
('Actual current custodian/retrieval authority and scoped access history','Future retrieval/disclosure','Expired/revoked authority denies future access;old receipt retained')]
deprows=[]
for r,p in zip(D,payloads):deprows.append({**r,'status':'TYPED-DEPENDENCY-CONTRACT-SPECIFIED','payload':p[0],'guarded_action':p[1],'change_impact':p[2],'implementation':'Persist upstream/downstream IDs and exact versions, typed use, currentness assessment and actor; independent drafts remain available.','validation':'Change upstream;verify affected action loses current reliance, unrelated draft save works, historical approved versions remain reproducible.'})
csvout('Dependency_Implementation',deprows)

guide_domains={'G00':['D03','D05','D10','D13'],'G01':['D01'],'G02':['D02','D04'],'G03':['D05','D06'],'G04':['D07'],'G05':['D09','D10'],'G06':['D11'],'G07':['D12'],'G08':['D03'],'G09':['D10','D13'],'G10':['D08'],'G11':['D08'],'PILOT':['D04','D07','D09'],'INDEX':['D13']}
orig=jread(ROOT/'docs/delivery/handbooks/registers/task_to_guide.json')
tr=jread(ROOT/'docs/delivery/handbooks/registers/requirement_traceability.json')
def route(r):return guide_domains.get(r.get('guide',''),['D13'])
taskmap=[dict(original_task_id=r['id'],original_title=r['title'],original_guide=r.get('guide',''),original_status=r.get('status',''),original_prerequisites=r.get('original_prerequisites',[]),execution_domains=route(r),research_tasks=[t['id'] for t in T if t['domain'] in route(r)],mapping_basis='Existing owning-guide navigation; exact criterion-to-delta verification is an implementation acceptance task, not a new semantic-closure assertion.') for r in orig]
reqmap=[dict(original_id=r['id'],original_register=r['register'],original_title=r['title'],source=r.get('source',''),source_row_sha256=r.get('sourceRowSha256',''),historical_status=r.get('status',''),guide=r.get('guide',''),owning_code=r.get('owning_module_candidate',''),execution_domains=route(r),plan_task_ids=[t['id'] for t in T if t['domain'] in route(r)],acceptance='PRESERVE ORIGINAL STATUS; EXECUTE EXACT REQUIRED CASES') for r in tr]
csvout('Original_128_Task_Routing',taskmap);csvout('Original_2247_Obligation_Routing',reqmap)

# Batch dependency is explicit; no invented sprint dates, headcount, or release percentage.
batches=[
('B00','Pin settled baselines and complete inventory','D01 D03 D13','', 'D01 resolved profile/source;working census;exact original-ID manifest;isolated baseline','Baseline/schema owner + BA','No historical workbook/adoption re-investigation;all original sets accounted for.'),
('B01','Shared semantic/typed/method contracts','D03 D05 D13','B00','Field/row identity;typed imports;method-run schema;primary allocation/reference distinction','Architect + source BA','Unknown/zero/N/A preserved;history/compatibility plan and exact expected examples.'),
('B02','Named multi-person assignment and scoped authority','D01 D02 D10','B00','Use completed D01/D02 handoffs;many assignees;credential/manual expert packet;server action dictionary','Engineer + security/source reviewer','Multiple people/two engagements;transfer/revoke/self-review cases;past authorship retained.'),
('B03','Form families and native exports','D03','B01','70-form/field crosswalk;family adapters;XLSX/DOCX;all20 typed dependencies','Source-form engineer + auditor/export reviewer','Family normal/adverse and every exceptional form;source/reader observations remain separately recorded.'),
('B04','Population, mappings and method runtime deltas','D05 D06','B01 B02','Controlled XLSX;full-source bridges;split primary allocation;method policy/currentness;derived inspection','Data engineer + QA','Reconciliation,missing/quarantined/scale,concurrent edit,retry,history and exports pass.'),
('B05','Planning, controls, materiality and sampling','D04 D07','B01 B02 B04','Risk/assertion links;D&I/OE separation;M03;M04-M08;approved size/projection boundary','Audit-method analyst + engineer','Independent expectations and risk-failure/sampling-error paths;no unsupported confidence claim.'),
('B06','Revenue/cut-off/receivables complete slice','D06 D07 D08 D09 D11 D12','B03 B04 B05','V05/V16;AUTO011-015,047-048;confirmation;finding/correction;completion;report/archive consequence','Area engineer + reviewer + QA','Both normal and material/unresolved end-to-end paths on exact originals/actors/versions.'),
('B07','Purchases,payables,prepayments,expenses','D08','B06','V07/V10/V11/V19;M12/M19/M31;AUTO016-019;related source procedures','Area engineer + source auditor','Complete obligations/cut-off/accrual/correction path per variant;not calculation-only.'),
('B08','Cash,inventory and cost of sales','D08','B06','V04/V08/V17;M13-M16;AUTO020-026;actual count/ownership and evidence','Area engineer + source auditor','Count-date/transfer/unit/NRV cases and full findings-to-completion handoff.'),
('B09','PPE,intangibles and capitalization','D08','B06','V01/V02;M17-M19/M25;AUTO027-030;finite/indefinite life and actual recognition work','Area engineer + source auditor','Partial-period/component/disposal/impairment boundary cases;native schedule parity.'),
('B10','Payroll,tax and equity','D08','B06','V14/V15/V18;M26-M29;AUTO031-035/039;effective-dated approved local parameters','Area engineer + accounting/legal parameter reviewer','Bracket/cap/period/current-deferred/distribution cases;no fictional rate adoption.'),
('B11','Finance,investments,FX,leases and group','D08','B06','V03/V06/V09/V12/V13/V20/V21/V22;M10/M20-M25/M30;AUTO036-043','Finance/group analyst + engineer','Contract/EIR/lease/FX/ECL/scope/elimination cases;unmatched residuals and specialist work retained.'),
('B12','Full completion,quality and all report outcomes','D09 D10 D11','B06 B07 B08 B09 B10 B11','M31-M33;AUTO044-057;representations,other information,EQR,combined opinion causes,wording/native package','Completion/report engineer + authorized auditor','All required matters and source branches;exact artifacts and EQR timing;no blanket sign-off.'),
('B13','Later facts,dual dating,custody and inspection','D11 D12','B12','M34;AUTO058;conditional restricted amendment;assembly/retention/holds;inspection/manual handoff','Archive/report engineer + custody owner','Before/after issue/lock paths;prior artifacts immutable;readable recovery and denied access.'),
('B14','Whole-scope source and operating acceptance','D03 D08 D10 D13','B03 B12 B13','All128 tasks/2247 obligations dispositioned;70forms,22variants,58minima,20dependencies;operating profile','QA + actual independent auditors + operating owner','Required engineering/source/professional/operating gates genuinely accepted;releaseReady remains false until then.')]
batchrows=[dict(batch_id=b[0],title=b[1],domains=b[2],dependencies=b[3],deliverables=b[4],owner_capacity=b[5],exit_criteria=b[6],estimate='SIZE AFTER CODE/CASE TRIAGE;NO CALENDAR COMMITMENT',status='PLANNED-IMPLEMENTATION') for b in batches]
csvout('Implementation_Batches',batchrows)
as_is=[
dict(domain='D01',existing='Acceptance/continuance/terms and activation controls;completed D01 research',delta='Implement exact D01 blocker/question/import handoff;retain manual legal judgments',evidence='results/D01/AS_IS_and_Engineering_Tickets.md'),
dict(domain='D02',existing='Named identities but fixed capacity seats;single owner/reviewer;actual time;completed D02 design',delta='Many-person appointments,scenarios,credential facts,selected expert packet',evidence='results/D02/AS_IS_and_Engineering_Tickets.md'),
dict(domain='D03',existing='70 catalogue form contracts,typed roundtrip,controlled methodology adoption,HTML exports',delta='Semantic source reconciliation,native XLSX/DOCX,exceptional families,all20 dependencies',evidence='scripts/pilot-forms.mjs;scripts/pilot-workpaper-export.mjs'),
dict(domain='D04',existing='Risk/controls/planning/materiality and conditional contributor records',delta='Complete actual source branches and edition-specific method/response impact',evidence='scripts/pilot-planning.mjs;scripts/pilot-materiality.mjs'),
dict(domain='D05',existing='Controlled CSV,full-source bridges,bounded methods,one primary statement destination',delta='Controlled XLSX,split allocations,separate reference graph,versioned method extensions',evidence='scripts/pilot-data-methods.mjs'),
dict(domain='D06',existing='Purpose-specific evidence,requests,manual confirmation records and local response link',delta='Selected content inspection,fine scoped document access/manual packet,all adverse branches',evidence='scripts/pilot-evidence.mjs;scripts/pilot-confirmations.mjs'),
dict(domain='D07',existing='Actual programme execution,unbiased reproducible selection,restricted point projection,journal candidates',delta='Size/evaluation method contracts,unsupported-design routes,native sampling parity',evidence='scripts/pilot-execution.mjs;scripts/pilot-sampling-v2.mjs'),
dict(domain='D08',existing='22 area-work records and58 minimum locators;bounded G10/G11 profiles',delta='Complete each real source procedure/method/exception and independent acceptance',evidence='docs/research/g10-fieldwork-areas-2026-11-18.md;docs/research/g11-automation-methods-2026-11-18.md'),
dict(domain='D09',existing='Canonical finding/correction,partial-posting verification,eight final assessments',delta='All branches,signed/multi-currency boundaries,disclosures and qualitative/prior effects',evidence='scripts/pilot-completion.mjs;scripts/pilot-finalisation.mjs'),
dict(domain='D10',existing='Named grants,ordinary/formal quality distinction,actual consultation and reviewer notes',delta='Curated configurable permissions across all routes,audit-facing monitoring/remediation',evidence='scripts/pilot-identity.mjs;scripts/pilot-oversight.mjs'),
dict(domain='D11',existing='Five single-cause opinion cases;combined material causes rejected;exact local signed issue package',delta='Professional multi-cause route,reviewed local/native wording,full recipient/amendment cases',evidence='scripts/pilot-reporting.mjs:opinionContradictions'),
dict(domain='D12',existing='Full-redating later-fact paths,assembly/custody/holds and local recovery;dual dating denied',delta='Conditional limited-procedure/dual-date branch,real-format inspection,operating storage/disposal',evidence='scripts/pilot-later-facts.mjs;scripts/pilot-archive-controls.mjs'),
dict(domain='D13',existing='Current workspace,scoped SQLite snapshots,local named accounts and bounded rehearsals',delta='Targeted ERD/UI changes,representative measured operating profile,whole-source acceptance',evidence='scripts/pilot-store.mjs;docs/research/g09-local-access-operations-2026-11-18.md')]
csvout('Current_Behavior_and_Deltas',as_is)

# Independent, literal numerical expectations: separate from application algorithms.
numeric=[]
def check(i,title,expected,actual,scope):
    ok=expected==actual;numeric.append(dict(id=i,title=title,expected=str(expected),actual=str(actual),passed=ok,scope=scope))
check('N01','Signed control total',Decimal('80'),sum(map(Decimal,['100','-20','0'])),'M01 fictional CU')
check('N02','Split primary allocation',100,60+40,'M02 note is nonadditive')
check('N03','Materiality policy',Decimal('50000'),Decimal('1000000')*Decimal('.05'),'M03 fictional policy')
check('N04','Performance amount',Decimal('30000'),Decimal('50000')*Decimal('.6'),'M03 fictional policy')
check('N05','Zero-acceptance size',59,next(n for n in range(1,1000) if Decimal('.95')**n<=Decimal('.05')),'M05 illustrative binomial model only')
check('N06','Ratio projection',Decimal('50'),Decimal('1000')*Decimal('10')/Decimal('200'),'M06 point estimate without risk allowance')
check('N07','Incremental+factual+specific',Decimal('60'),Decimal('40')+Decimal('10')+Decimal('10'),'M06 no double count')
check('N08','Commercial net line',Decimal('180'),Decimal('10')*Decimal('20')*(1-Decimal('.10')),'M11 fictional CU')
check('N09','Inventory quantity',7,10+5-8,'M14 integer units')
check('N10','Periodic average/COS/closing',(Decimal('12'),Decimal('180'),Decimal('60')),(Decimal('240')/20,Decimal('240')/20*15,Decimal('240')-Decimal('240')/20*15),'M15 fictional CU/integer units')
check('N11','NRV write-down',Decimal('15'),(Decimal('12')-(Decimal('11')-Decimal('1')-Decimal('1')))*5,'M16 supplied estimates')
check('N12','Asset carrying amount',Decimal('730'),Decimal('1000')+200-100-(Decimal('300')+100-30),'M17 before impairment')
check('N13','Straight-line charge',Decimal('300'),(Decimal('1000')-100)/3,'M18 full year')
check('N14','Interest day count',Decimal('10'),Decimal('1000')*Decimal('.12')*30/360,'M20 fictional contractual inputs')
pv=Decimal('110')/Decimal('1.1')+Decimal('110')/Decimal('1.1')**2
check('N15','Lease PV',Decimal('190.91'),pv.quantize(Decimal('.01'),rounding=ROUND_HALF_UP),'M21 end-year payments/fictional annual rate')
check('N16','FX difference',Decimal('20'),Decimal('100')*(Decimal('3.2')-Decimal('3')),'M22 CU per foreign unit')
check('N17','Provision matrix',Decimal('70'),Decimal('1000')*Decimal('.02')+Decimal('500')*Decimal('.10'),'M24 supplied fictional loss rates')
check('N18','Recoverable comparison',Decimal('10'),max(Decimal(0),Decimal('100')-max(Decimal('80'),Decimal('90'))),'M25 valuations supplied not validated')
check('N19','Gross-to-net',Decimal('850'),Decimal('1000')-100-50,'M26 fictional deductions')
check('N20','Tax-inclusive extraction',Decimal('10'),Decimal('110')*Decimal('.1')/Decimal('1.1'),'M27 fictional10% not Mongolian rate')
check('N21','Deferred arithmetic',Decimal('40'),Decimal('200')*Decimal('.2'),'M28 fictional20% conditional recognition')
check('N22','Remaining error',Decimal('40'),Decimal('100')-Decimal('60'),'M33 actual verified correction basis')
check('N23','Gross/net effects',(180,20),(abs(100)+abs(-80),100-80),'M33 neither implies materiality conclusion')
check('N24','Capacity ratio',Decimal('1.25'),Decimal('40')/Decimal('32'),'M35 allocation/availability only')
check('N25','Policy anniversary','2036-11-19',datetime.date(2026,11,19).replace(year=2036).isoformat(),'M34 fictional policy,not legal deadline')
dump(OUT/'Independent_Numerical_Checks.json',dict(kind='Executed elementary expected-value checks only;not tests of application implementation or professional method acceptance',checks=numeric,passed=all(r['passed'] for r in numeric)))

names={f'D{i:02}':'' for i in range(1,14)}
names.update(dict(D01='Client acceptance and independence',D02='Staffing,capacity,credentials and specialists',D03='Source forms,native outputs and dependencies',D04='Risk,controls,planning and materiality',D05='Data,mappings and method infrastructure',D06='Evidence,documents,confirmations and sharing',D07='Programmes,sampling,analytics and journals',D08='All fieldwork areas and automation minimums',D09='Findings,corrections and audit completion',D10='Permissions,review,consultation and quality',D11='Opinion,wording,authorization and issuance',D12='Later facts,assembly,custody and retention',D13='UI,ERD,operating tests and release'))
names={k:v.replace(',',', ') for k,v in names.items()}
def table(rows,keys,labels=None):
    def fmt(v):return str(v).replace('|','/').replace('\n',' ')
    return '\n'.join(['| '+' | '.join(labels or keys)+' |','| '+' | '.join('---' for _ in keys)+' |']+['| '+' | '.join(fmt(r.get(k,'')) for k in keys)+' |' for r in rows])+'\n'
def bullets(xs):return '\n'.join('- '+x for x in xs)+'\n'
def steps(xs):return '\n'.join(f'{i+1}. '+x for i,x in enumerate(xs))+'\n'
def linkrefs(ids):return '; '.join(f'[{i}]({refs[i]["url_or_path"]})' if re.match('https?://',refs[i]['url_or_path']) else i for i in ids)
parts=[]
parts.append('''# Full audit: researched implementation design and execution plan

**Decision:** implement the complete financial-statement audit scope across Stages1–5 through bounded, reviewed capabilities. The earlier assignments are now translated into specific design choices, data contracts, implementation steps, discriminating expected cases and an end-to-end batch plan.

**As of:**19 November2026. **Method:** requirements engineering, standards traceability, method specification and risk-based acceptance. All engineering recommendations below are **author-design inferences** from the exact source assignments, observed current code and the evidence register; they are not assertions that standards prescribe these fields or that an auditor approved them.

**Deliverable boundary:** this batch researches/specifies how to implement and validate the whole scope. It does not modify application behavior, conduct interviews, execute production operations, certify all accounting models, fabricate approvals or mark source obligations accepted. Task design completion and actual implementation/acceptance have separate states.

## 1. Read this plan and use its decisions

Use each domain card as a bounded implementation ticket: proposed decision -> ordered change -> fields -> expected cases -> exact original task/method/source links. Use method cards for deterministic logic and supported/unsupported boundaries. Use every original variant/minimum/dependency card, not just a representative sample. Execute batches B00–B14; B07–B11 are independent after B06 when actual team capacity permits.

D01/D02 completed research is carried forward intact. Settled available-workbook acceptance and the Mongolian ISA2020 compilation with integrated ISQM1/2/revised ISA220, plus local ethics basis, are not reopened. Later international editions remain separately selected profiles. Per-engagement judgments are defined product records rather than unanswered software-design questions.

''')
parts.append('**Pinned starting commit:**`'+baseline+'`. All counts below are scope/coverage counts, never product-completion percentages.\n\n'+table([dict(population=k,count=n) for k,n in [('Domain task cards',len(T)),('Method cards',len(M)),('Original fieldwork variants',len(V)),('Original automation minimums',len(A)),('Confirmed dependencies',len(D)),('Source form contracts',len(forms)),('Existing candidate semantic fields',len(fields)),('Original implementation tasks routed',len(orig)),('Original obligations routed',len(tr))]],['population','count']))
parts.append('''## 2. Engineering decisions and sequence

- Extend the current G01–G11 owning records/commands. Preserve original IDs, raw bytes, historical work/reviews and exact report/archive lineage. Schema changes are targeted deltas, not a replacement architecture.
- Keep separate: accounting recognition/measurement; audit procedures; deterministic calculation; professional judgment; evidence acceptance; independent review; release authority. A correct calculation does not establish a correct audit conclusion.
- Use typed unknown/zero/false/N/A states; explicit entity/period/currency/scale; integer minor units or declared decimal precision; half-away-from-zero final rounding where selected. Intermediate ratios retain precision; no unexplained balancing plugs or broad netting.
- Use all60 task designs and36 method cards. Required native automation is implemented where promised. A supported manual professional procedure records actual work and review; it does not silently replace a promised native calculator.
- Actual rate/life/framework/recognition/retention choices are versioned inputs with authority, rationale, scope and reviewer. No invented Mongolian tax rates, universal sampling size, depreciation life or numeric audit-quality score.
- External ERP/credential/dispatch/signature/scan services stay separately owned. Required v1 manual import, controlled packet exchange, actual dispatch evidence and verification routes remain concrete and usable.

''')
parts.append('### Research conclusions that change the implementation\n\n'+table(as_is,['domain','existing','delta','evidence'])+'\nThe fresh source census classifies all272 actual formula expressions as previous-row-plus-one presentation sequences. This does not establish that audit arithmetic is unnecessary: the real calculation contracts come from substantive requirements, approved accounting policies and the M packs. Validation definitions, semantic fields, source cells and required audit rules are different populations. The1,236 fields listed here are existing source-catalogue candidates, not a claim to enumerate every dynamically extended runtime field.\n\n')
parts.append('''### Shared typed run, review and handoff contract

`methodId`, `algorithmVersion`, `inputSchemaVersion` and `policyVersion` are immutable identifiers. `engagementId`, `entityId` and the reporting-period dates define scope. Each source use stores original ID, revision, hash and row/page/cell anchor. Money stores signed integer minor units plus explicit currency and scale; quantity and rates use a declared decimal/rational representation and unit. A missing value is null with a reason, not zero. Calendar dates and instants have separate types/time-zone rules. Repeated rows have durable IDs.

Each run stores typed parameters and their authority, input basis, output rows/totals, signed differences, nonadditive reference links, exception codes, unsupported conditions and completeness state. Output state distinguishes draft, incomplete, computed-with-exceptions, submitted, returned, reviewed-usable, reviewed-with-limitations and stale. A limit is retained alongside its authorized use; limited work cannot silently satisfy a prerequisite requiring a usable complete population. Examples are synthetic expected cases until actual app execution is recorded.

Preparation, submission, independent return/approval and source-change impact are separate events with actor and timestamp. Review pins the exact content/input/method/policy digest. The same idempotency key and same canonical payload returns the earlier result; changed payload is rejected. Concurrent save requires the expected current revision. Exact source changes create a successor and targeted reassessment, preserving prior outputs and reviews. A calculation creates an investigation candidate; an attributable evaluation creates or links the canonical finding. No calculator posts a correction, clears a note, chooses an opinion or issues a report.

All permissions are enforced on actual server actions and file representations. Configurable role bundles remain subject to current identity, scope, appointment, object version, state and independent-duty checks. Native exports carry actual source/method/work/review versions and limitations; generating an export creates no new audit approval.

''')
parts.append(table(batchrows,['batch_id','title','dependencies','deliverables','owner_capacity','exit_criteria']))
parts.append('''### Batch operating procedure and closure

For every batch: pin the input build/source/method versions; inspect the listed owning code; implement only the documented delta; run its literal expected and meaningful adverse cases; exercise actual UI/direct commands/exports and history; record independent source/practitioner acceptance separately; reconcile original IDs; publish verified authored work to the development branch. No automatic main merge or deployment. A dependency requires the earlier outputs needed by that slice; it does not require unrelated domain-wide acceptance first. B14 does require every selected batch output and applicable original item, including the remaining forms and branches.

Before sizing, the engineer breaks a card into schema, command, UI/export and verification changes using its listed fields/cases. Estimate with actual implementers after that inspection. No arbitrary sprint date, team count or staffing forecast is asserted here. If a policy fact is unavailable, implement its explicit missing-state/manual decision path and guard the affected professional action; continue unrelated work.

Engineering exit requires actual observed outcomes on the exact build. Source-semantic exit requires the actual auditor comparing source work/output. Professional exit requires actual authority for method/policy judgments. Operating exit requires measured workload/recovery/security evidence in the selected environment. Passing this document's validator proves coverage and consistency only.

## 3. Domain-by-domain implementation cards

''')
for dom in names:
    section=[f'### {dom} — {names[dom]}\n']
    if dom in ['D01','D02']:section.append(f'Carry forward [completed {dom} results](../{dom}/README.md), its resolved contracts, cases and engineering handoff. No replacement or new approval claim.\n')
    for r in [t for t in taskrows if t['domain']==dom]:
        q=td[r['id']]
        section.append(f'#### {r["id"]} — {r["title"]}\n\n**Proposed implementation decision:** {q["decision"]}\n\n**Original question:**{r["question"]}\n\n**Prerequisites:**{r["dependencies"] or "None beyond the pinned baseline"}. **Original work groups:**{r["original_RW_ids"]}. **Methods:**{r["method_ids"]}.\n\n**How to implement:**\n\n'+steps(q['steps'])+'\n**Data/record contract:**'+q['fields']+'\n\n**Discriminating expected cases:**\n\n'+bullets(q['cases'])+'\n**Owning paths:**'+', '.join('`'+p+'`' for p in q['files'])+'.\n\n**Evidence/context:**'+linkrefs(q['refs'])+'. **Original broader standard candidates:**'+r['standards_to_verify']+'.\n\n**Accountable capacities:**'+r['owner_role']+'; independent review:'+r['independent_reviewer_role']+'. Actual names remain unassigned; no signature is implied.\n')
    text=re.sub(r'(\*\*[^*\n]+:\*\*)(?=\S)',r'\1 ', '\n'.join(section))
    (OUT/f'{dom}_Implementation_Design.md').write_text('# '+names[dom]+'\n\n'+text,encoding='utf-8',newline='\n')
    parts.append(text)
parts.append('## 4. All36 calculation and decision methods\n\nEach card specifies a proposed bounded profile, input/algorithm, retained human judgment, exceptions and an independently understandable fictional example. It does not approve a universal accounting method. Actual expected fixtures must expand to every supported branch before release.\n')
methodparts=[]
for r in methodrows:
    methodparts.append(f'### {r["id"]} — {r["title"]}\n\n**Profile:**{r["profile"]}. **Original automation links:**{r["original_automation_ids"] or "Source workflow/rule support"}.\n\n**Inputs:**{r["inputs"]}\n\n**Algorithm/steps:**\n\n'+steps(r['algorithm'])+'\n**Human judgment:**'+r['judgment']+'\n\n**Exceptions to test:**\n\n'+bullets(r['exceptions'])+'\n**Independent example:**'+r['example']+'\n\n**Evidence/context:**'+linkrefs(r['refs'])+'.\n')
parts.extend(methodparts);(OUT/'All_36_Method_Designs.md').write_text('# All36 method designs\n\n'+'\n'.join(methodparts),encoding='utf-8',newline='\n')
parts.append('## 5. All22 original fieldwork variants\n\nEach variant keeps its exact source identity/locator/input scenario. Procedure tailoring must disposition every actual pinned source step. Run its existing NORMAL/EXCEPTION/MISSING/UNAUTH/CHANGE IDs, plus native export/history/downstream handoff. No invented source procedure IDs are added.\n')
for r in arearows:
    parts.append(f'### {r["id"]} — {r["source_area"]}\n\n**Original source anchors:**`{r["source_locators"]}`\n\n**Original scenario:**{r["source_scenario"]}\n\n**Original required inputs:**{r["source_inputs"]}\n\n**Actual work sequence:**\n\n'+steps(r['work'])+'\n**Methods:**'+r['methods']+'. **Judgments:**'+r['judgments']+'\n\n**Discriminating matter/example:**'+r['matter']+'\n\n**Original exceptions retained:**'+r['exceptions']+'\n\n**Handoff:**'+r['handoff']+'. **Evidence/context:**'+linkrefs(r['refs'])+'.\n')
parts.append('## 6. All58 original automation minimums\n\nThe original minimum, human responsibility and boundary are retained verbatim from the user project register. Authored implementation detail and expected cases follow each. Every card also needs a missing/unsupported, denied-role and changed-source case; these supplement rather than replace its actual original obligation. Pending future extensions remain separate.\n')
for r in autorows:
    parts.append(f'### {r["id"]} — {r["title"]}\n\n**Original minimum:**{r["original_minimum"]}\n\n**Original inputs:**{r["original_inputs"]}\n\n**Original human responsibility:**{r["original_human_responsibility"]}\n\n**Original boundary:**{r["original_boundary"]}\n\n**Proposed implementation/delta:**{r["work"]}\n\n**Expected distinguishing case:**{r["expected"]}\n\n**Methods:**{r["method_ids"]}. **Owning guide:**{r["owning_guide"]}. **Existing evidence locator:**`{r["current_G11_evidence_locator"]}`. **Original source:**{r["source"]}.\n')
parts.append('## 7. All20 confirmed cross-form dependencies\n\nThe upstream and downstream original form IDs/field remain unchanged. The action guard never blocks unrelated draft collection. Each link retains exact upstream/downstream versions, typed payload, currentness/impact assessment and actual actor.\n\n'+table(deprows,['id','from','to','targetField','payload','guarded_action','change_impact']))
parts.append('## 8. All70 form/source contracts and native-output approach\n\nThe census rereads actual available working XLSX bytes and all nonempty source cells in the70 catalogue form sheets. It checks field anchors and inventories formulas, validations, merges and embedded image counts. It does **not** visually inspect every picture, recalculate Excel, establish historical byte equivalence, or professionally validate all candidate field meanings. The implementation/reviewer procedure for these is fully specified in D03.\n\n'+table(books,['file','sha256','form_count','formula_count','validation_definitions','source_unchanged'])+'\n'+table(forms,['form_id','stage','family','catalogue_fields','formula_cells','validation_definitions','embedded_images','native_export']))
parts.append('''### Form-family execution contract

Questionnaire/checklist: source question polarity, permitted answers, conditional follow-ups, evidence, conclusion and responsible review. Narrative: full instruction/clauses, long text, actual evidence and conclusion. Repeated register/schedule: stable row identity, typed columns, units, provenance and totals. Calculation/reconciliation: exact approved M pack, explicit unknown/zero, original inputs and exception bridge. Programme: tailored scope, every procedure disposition, performed work, findings and current independent review. Request/confirmation/representation: drafted, issued, received, evaluated and reviewed are distinct. Approval/report/archive: exact version/package, authority, real event dates and retained predecessor/successor.

For XLSX output, fill a controlled copy of the source/family template from canonical selected records, expand repeat blocks deliberately, rebuild references/print regions and include real provenance/reviews without fabricating signatures. For DOCX output, use mapped paragraphs/tables/bookmarks and exact approved report/letter wording. Keep formula dispositions explicit. Compare semantic values/clauses/evidence/review with the canonical view, then reopen in compatible readers for layout/print/readability observation. HTML roundtrip success is not native parity.

## 9. Exact original-scope routing and acceptance

''')
parts.append(f'All{len(orig)} original implementation tasks and{len(tr)} original obligations have preserved IDs in [Original_128_Task_Routing.csv](Original_128_Task_Routing.csv) and [Original_2247_Obligation_Routing.csv](Original_2247_Obligation_Routing.csv). Navigation routing follows the previously assigned owning guide; it does not claim a new per-criterion semantic audit. The actual implementation must link each changed criterion/branch to its specific current ticket and executed case before acceptance. Original source-row hashes/statuses remain retained.\n\n')
parts.append('''For every selected original item: preserve source locator/hash -> actual interpretation/method decision -> owning record/command -> expected case -> executed result -> native export/downstream consequence -> attributable independent acceptance. Treat missing evidence, unsupported method, conditional N/A, external owner and deferred product scope as distinct dispositions. Do not claim a whole lifecycle from disconnected partial tests. No original future extension is silently promoted or removed.

### Cross-domain rehearsal cases

1. New client + current manual independence evidence +3-person team -> approved scope/plan -> complete reconciled revenue population -> cut-off/receivable work ->40 CU verified partial correction of100 CU issue ->60 CU uncorrected -> reviewed qualitative/materiality/opinion decision -> exact issue/recipient/archive.
2. Control deviation after initial reliance -> revised risk response -> affected sample/procedures -> new actual tests -> revised findings/evaluation; unrelated accepted evidence remains current.
3. One material known misstatement plus separate evidence limitation -> separate cause records, professional multi-cause analysis, actual consultation/wording review; no hard-coded adverse-versus-disclaimer precedence.
4. Later fact before issue, after issue before assembly, and after lock -> real discovery/management response -> full-redate or conditionally permitted limited-amendment path -> exact successor issue and prior-recipient communication; old package retained.
5. Specialist selected packet -> actual secure manual sharing -> actual opinion return -> audit-team evaluation; revoke access and test all file representations without claiming recall of downloaded copies.
6. Source/policy change after calculation review -> only affected run/work/evaluation/report reliance becomes stale; exact retry creates no duplicate issue or financial effect; prior reviewed output remains reproducible.
7. Restore to a new isolated environment -> exact originals/reports/actors/grants/holds restored -> actual compatible-reader inspection and scoped retrieval -> revoked user remains denied.

## 10. Decisions, evidence gaps and actual review work

''')
gaprows=[
dict(item='Settled workbook/local audit/ethics baseline',treatment='CARRY CLOSED D01/D02 decisions;no new permission/recovery loop',blocks='No new blocker'),
dict(item='Source pictures/merged-label meaning across remaining forms',treatment='Use exact70-form census/field anchors;D03 per-family/source observation and explicit discrepancy resolution',blocks='Only affected semantic acceptance;not unrelated design/implementation'),
dict(item='Specialist valuation/transaction methods beyond bounded native profiles',treatment='Primary comparative IFRS13/IAS1/IAS10 text retrieved;each actual complex model or transaction has an explicit supported external-work/evaluation route and method-adoption evidence',blocks='Only unsupported native-model/compliance claim;not the already specified workflow or supported arithmetic'),
dict(item='Local tax/social-insurance/retention and dual-date permission facts',treatment='Effective-dated reviewed rule/policy inputs with sources and human decision;no universal legal engine',blocks='Affected actual calculation/professional/disposal action when required facts absent'),
dict(item='Firm benchmarks/lives/rates/sampling choices',treatment='Use versioned decision records and independently verified method fixtures;ordinary engagement judgments remain supported records',blocks='Affected method adoption/reliance,not the whole project'),
dict(item='Actual auditor interviews and independent acceptance',treatment='Complete protocols/cases are supplied;actual names/observations/signatures cannot be invented',blocks='Professional/source acceptance and release'),
dict(item='Selected production workload/storage/security/RPO/RTO',treatment='Retain current bounded prototype;measure B14 against actual owner-approved deployment profile',blocks='Production readiness only'),
dict(item='Optional external providers/broader firm ERP/future extensions',treatment='HOLD with explicit owner/contract/manual route;separate scope decision before expansion',blocks='No automatic blocker on authorized core manual routes')]
parts.append(table(gaprows,['item','treatment','blocks']))
parts.append('''These are specific evidence/adoption/implementation boundaries, not unassigned “research later” buckets. All listed domain/method/item designs are supplied in this pack. Legal/professional decisions are made by their actual authorities during adoption/use; this document cannot fabricate those decisions. The full fieldwork scope still requires all22 variants and58 minimums, not only the first revenue slice.

## 11. Evidence sources and research limits

The source register separates newly retrieved primary/comparative passages, previously completed verified project research, observed local code/source bytes, author-design inferences and genuine access gaps. Australian/UK adopted texts provide readable comparative accounting/audit requirements; their local additions and effective dates are not imported as Mongolian law. UKEB AI-converted HTML warns it is unverified: original PDFs were used where retrieved; failed originals remain an access limitation. Issuer2021 IFRS PDF routes redirected to subscription pages; no paywall text is invented.

''')
parts.append(table(list(refs.values()),['id','title','url_or_path','inspection_extent','status','limitation']))
parts.append('''## 12. Verification performed on this plan

The supplied validator checks exact ID sets/cardinalities, unique original routing keys, all referenced method/source/code paths, task and batch dependency acyclicity, complete domain coverage, retained original automation text/dependency endpoints, no unlisted domain card, all70 working source sheets and unchanged source hashes. A separate elementary checker calculates the25 fictional expected-value cases in Independent_Numerical_Checks.json. These checks support plan consistency and arithmetic examples only; application runtime, whole-model statistical validation, actual source-user observation and professional/production approval are not claimed.

The complete CSV registers can be filtered without reading the entire narrative. Start engineering from B00–B05, verify the complete B06 slice, then finish B07–B14 without dropping the remaining areas or after-report branches.
''')
full=re.sub(r'(\*\*[^*\n]+:\*\*)(?=\S)',r'\1 ', '\n'.join(parts))
(OUT/'FULL_RESEARCH_AND_EXECUTION_PLAN.md').write_text(full,encoding='utf-8',newline='\n')
dump(OUT/'Plan_Data.json',dict(as_of=date,baseline=baseline,scope='Research-based design and complete implementation/validation plan;not runtime acceptance',counts=dict(domains=13,tasks=len(T),methods=len(M),variants=len(V),automations=len(A),dependencies=len(D),forms=len(forms),candidate_fields=len(fields),original_tasks=len(orig),original_obligations=len(tr)),tasks=taskrows,methods=methodrows,automations=autorows,variants=arearows,dependencies=deprows,batches=batchrows,sources=list(refs.values()),gaps=gaprows))
(OUT/'README.md').write_text('''# Complete audit implementation design

Read [FULL_RESEARCH_AND_EXECUTION_PLAN.md](FULL_RESEARCH_AND_EXECUTION_PLAN.md). It covers all13 domains/60 tasks,36 methods,22 original variants,58 minimum automations,20 confirmed dependencies,70 form contracts and routing for128 original tasks/2247 obligations.

D01/D02 completed research remains intact. New cards give concrete proposed decisions, implementation steps, records, owning code, expected cases and B00–B14 sequence. Exact source/approval/operating limitations are identified; the first revenue slice is a verification pattern, not the endpoint.

CSV files preserve original IDs and can be filtered. Plan_Data.json provides the same structured content. Read_Only_Source_Census.json records actual source hashes/anchor scan, and Independent_Numerical_Checks.json records executed elementary fictional arithmetic checks. Neither is professional acceptance.

The earlier parent PLANNED CSVs remain historical assignment records. Task_Execution.csv here is the current design/handoff layer; implementation and actual acceptance remain separate. No application/source/history/release status was changed.
''',encoding='utf-8',newline='\n')
# Make the current result discoverable without rewriting historical assignment statuses.
banner='> **Current complete result (19 November 2026):** [Researched whole-scope implementation design](results/FULL/FULL_RESEARCH_AND_EXECUTION_PLAN.md) now supplies all60 task designs,36 methods,22 variants,58 minimums,20 dependencies,70 form contracts and the full B00-B14 plan. Earlier PLANNED registers below remain the historical assignment baseline; current design and actual implementation/acceptance states are separate.\n\n'
parent=BASE/'README.md';txt=parent.read_text(encoding='utf-8')
if '**Current complete result (19 November 2026):**' not in txt:
    first,rest=txt.split('\n',1);parent.write_text(first+'\n\n'+banner+rest.lstrip(),encoding='utf-8',newline='\n')
for i in range(3,14):
    file=BASE/'domains'/f'D{i:02}_Research_Plan.md';txt=file.read_text(encoding='utf-8')
    if '**Current implementation design:**' not in txt:
        first,rest=txt.split('\n',1);file.write_text(first+f'\n\n> **Current implementation design:** [D{i:02} researched decisions, steps, data, cases and owning code](../results/FULL/D{i:02}_Implementation_Design.md). The original assignment below is retained; use the linked whole-scope result for the current handoff.\n\n'+rest.lstrip(),encoding='utf-8',newline='\n')
print(json.dumps(dict(output=str(OUT),words=len(full.split()),characters=len(full),counts=jread(OUT/'Plan_Data.json')['counts'],numeric_checks=len(numeric),source_cells_read=len(anchors)),indent=2))
