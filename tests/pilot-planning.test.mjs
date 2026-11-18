import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,mkdir,writeFile,copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {DatabaseSync,backup} from 'node:sqlite';
import {formContract} from '../scripts/pilot-registers.mjs';
import {start,firm,client,enquiry,setupEngagement,assess,terms,decision,activation,passwords,today} from './helpers/pilot-acceptance-fixture.mjs';

const fieldValues=values=>Object.fromEntries(Object.entries(values).map(([key,value])=>['field.'+key,value]));
const record=(state,id)=>state.registers.find(r=>r.id===id);
async function save(app,id,kind,values,row){
 const before=new Set((await app.view('reviewer',id)).registers.map(r=>r.id));
 const state=await app.write('reviewer',id,'register',{kind,operation:'save',id:row??'',...fieldValues(values)});
 return row??state.registers.find(r=>!before.has(r.id)).id;
}
const operation=(app,id,kind,row,operation,fields={},status=200)=>app.write(operation==='approve'||operation==='return'?'partner':'reviewer',id,'register',{kind,id:row,operation,...fields},status);
async function activated(app,people){
 const context=await client(app),draft=await enquiry(app),setup=await setupEngagement(app,people,context.id,context.contact,draft),{id,evidence}=setup;
 const state=await assess(app,id,evidence);await terms(app,id,state.intakeContext,evidence,context.contact);
 await app.write('partner',id,'acceptance-decide',decision(evidence));await app.write('partner',id,'activate',activation);
 return {...setup,profile:context};
}
async function materiality(app,id){
 await app.write('preparer',id,'save',{form:'1.3',benchmark:'1000',percentage:'2',performance:'60',trivial:'5',benchmarkSource:'Actual fictional trial balance; selected by preparer',execution:'Compared source benchmark',conclusion:'Selected explicit method'});
 await app.write('preparer',id,'submit',{form:'1.3'});await app.write('reviewer',id,'review',{form:'1.3',reason:'Independently reviewed the chosen materiality'});
}
const profileValues=evidence=>({authority:'Exact G01 signed authority and period; current source 1.4.3',edition:'Fictional G02 TEST methodology edition 1; not a Mongolian adoption determination',evidence,assertions:'Existence\nValuation\nCompleteness',group:'no',scope:'PPE and inventory, substantive work remains required for material areas'});
const understanding={business:'Manufacturing and inventory',objectives:'Deliver orders',governance:'Board',environment:'Industry and legal inquiries retained as actual facts',framework:'Test framework 1',source:'Actual fictional interview and records',systems:'Ledger / inventory interface; service organization inquiry retained',transactions:'Asset purchases, disposals, inventory; prior changes and accounting policies',openFacts:'Outstanding IT answer: assigned reviewer; risk remains visible until evaluated'};
const riskValues=(entity,programme='3.1.2',risk='Asset existence')=>({risk,entity,type:'account',target:programme==='3.1.2'?'PPE':'Inventory',assertion:'Existence',response:'Inspect actual source records; test transactions and reconcile',programme,assessment:'Explicit inherent / significance rationale; no inferred score',contradictions:'Known conflicting interview identified; current response includes corroboration'});
const controlValues=(risk,evidence)=>({risk,name:'Authorized asset purchase',objective:'Prevent unsupported asset additions',owner:'Finance manager',frequency:'Each purchase',system:'Ledger / purchase system',design:'adequate',implementation:'observed',walkthrough:evidence,walkthroughBasis:'Observed transaction, inspected authorization and traced to ledger, beyond inquiry',operating:'effective',from:'2025-01-01',through:'2025-12-31',population:'All recorded additions; reconciled completeness',sample:'Documented targeted and representative selection; no invented default size',performance:evidence,deviations:'One deviation investigated, isolated; expanded support evaluated',reliance:'supported',evaluation:'Separately assessed design, implementation, performance and deviation significance'});
const response=(risk,procedure,control)=>({risk,procedure,nature:'Inspect and reperform',timing:'Year end',extent:'Explicit documented stratum',scope:'Actual target and assertion covered by tested records',...(control&&{control})});
const programmeValues=(rule,risk,extras={})=>({rule,risk,decision:'adopt',basis:'Actual risk-responsive scope; low questionnaire scores do not remove substantive work',approach:'substantive',templateVersion:'source',procedure:'r10',nature:'Inspect actual source',timing:'Year end',extent:'Selected documented population',...extras});

test('G02 connected planning preserves staffing, proves control distinctions, many-to-many coverage, selective revision, handoff and append-only effort',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'audit-g02-')),database=join(dir,'planning.sqlite');let app;
 const proof=[];
 const observed=(id,expected,actual,versions={})=>{assert.deepEqual(actual,expected,id);proof.push({id,expected,actual,versions});};
 try{
  app=await start(database,true);const people=await firm(app),{id,evidence}=await activated(app,people);
  observed('standard-conversion-enables-current-planning',true,(await app.view('reviewer',id)).planning.managed);
  const profile=await app.register(id,'M05-F02',profileValues(evidence)),entity=await app.register(id,'M06-F02',understanding);
  const fraud=await app.register(id,'M06-F04',{risk:'Override candidate, not an automatic finding',entity,factors:'Incentives and management override considered',inquiry:'Actual named fictional interviews and corroborating records',presumption:'Required categories and any rebuttal need actual approved methodology; no automatic score',assertion:'Existence',response:'Unpredictable transaction and journal work plus supervision'});
  const analytics=await app.register(id,'M06-F06',{area:'PPE',expected:'100',actual:'120',threshold:'10',source:'Fictional comparable source ledger',investigation:'20 variance is a candidate requiring investigation, not a fraud finding',scope:'Actual current-year PPE and changes'});
  const risk=await app.register(id,'M06-F09',{...riskValues(entity),fraud,analytics});
  const shared=await app.register(id,'M06-F09',{...riskValues(entity,'3.1.2','Cross-area completeness'),assertion:'Completeness',programmes:'3.1.4'});
  const stockRisk=await app.register(id,'M06-F09',riskValues(entity,'3.1.4','Inventory existence'));
  const overall=await app.register(id,'M06-F09',{risk:'Management override and staffing',entity,type:'overall',response:'Experienced staff, supervision and unpredictable work',assessment:'Overall pervasive risk',contradictions:'No unsupported removal of contradictory facts'});
  const invalid=await save(app,id,'M06-F09',{...riskValues(entity),assertion:'Invented-assertion'});
  await operation(app,id,'M06-F09',invalid,'submit',{},409);
  await save(app,id,'M06-F09',{...riskValues(entity),risk:'Returned unknown assertion corrected',programmes:'',assessment:'Explicit professional reassessment',contradictions:'Unresolved inquiry remains an explicit restriction'},invalid);
  // The additional risk remains open until explicitly reviewed and covered; it is never silently omitted.
  await operation(app,id,'M06-F09',invalid,'submit');await operation(app,id,'M06-F09',invalid,'approve',{reason:'Evaluated actual scope'});
  const control=await save(app,id,'M06-F03',{...controlValues(risk,evidence),operating:'not-tested',reliance:'supported'});
  await operation(app,id,'M06-F03',control,'submit',{},409);
  await save(app,id,'M06-F03',controlValues(risk,evidence),control);await operation(app,id,'M06-F03',control,'submit');
  await app.write('reviewer',id,'register',{kind:'M06-F03',id:control,operation:'approve',reason:'Self review'},403);
  await operation(app,id,'M06-F03',control,'approve',{reason:'Independent design, implementation, operating period, deviations and reliance evaluation'});
  observed('control-has-separate-design-implementation-and-operating-evidence','effective',record(await app.view('partner',id),control).values.operating,{control:record(await app.view('partner',id),control).version});
  await materiality(app,id);
  const rules={};for(const form of ['3.1.2','3.1.4'])rules[form]=await app.register('firm','M02-F05',{programme:form,profile:'all',outcome:'required',override:'no',basis:'Fictional approved material-area methodology'});
  const links=[response(risk,'r10',control),response(shared,'r10'),response(shared,'r11'),response(invalid,'r12')];
  const plan=await app.register(id,'M07-F01',programmeValues(rules['3.1.2'],risk,{responses:JSON.stringify(links)}));
  const stock=await app.register(id,'M07-F01',programmeValues(rules['3.1.4'],stockRisk,{responses:JSON.stringify([response(stockRisk,'r10'),response(shared,'r11')])}));
  let state=await app.view('reviewer',id);
  observed('one-procedure-addresses-multiple-risks',2,record(state,plan).programmeBasis.responses.filter(r=>r.procedure==='r10').length);
  observed('one-risk-addressed-by-multiple-procedures',2,record(state,plan).programmeBasis.responses.filter(r=>r.risk===shared).length);
  observed('one-risk-addressed-in-multiple-programmes',true,record(state,stock).programmeBasis.responses.some(r=>r.risk===shared));
  observed('programme-has-current-materiality',20,record(state,plan).programmeBasis.materiality.overall);
  const discussion=await app.register(id,'M06-F13',{type:'invited',date:today(),participants:'Partner/reviewer/preparer and finance director',topics:'Fraud, scope, requests, channels and deadlines',decisions:'Invitation only; no fictitious attendance',owner:'reviewer',openActions:'Obtain actual responses and record owners'});
  const milestone=await app.register(id,'M05-F04',{milestone:'Planned fieldwork handoff',start:'2026-01-01',due:'2026-12-31',type:'target',conflict:'open',owner:'partner',resolution:'Resource pressure unresolved; no waiver of required work or EQR'});
  const budget=await app.register(id,'M05-F05',{start:'2026-01-01',end:'2026-12-31',hours:'1',scope:'This engagement; all assigned capacities',basis:'Initial budget; actual hours remain separately recorded'});
  const strategyValues={profile,programme:plan,discussion,milestone,budget,direction:'Named supervision, specialist consultation, governance communication and deadlines',restrictions:'Outstanding IT answer owned by reviewer; permitted work scope identified, no stage-complete inference',impact:'PPE responses and current materiality pinned; inventory assessed independently'};
  const strategy=await save(app,id,'M06-F14',strategyValues);
  await operation(app,id,'M06-F14',strategy,'submit',{},409);
  await save(app,id,'M06-F13',{type:'held',date:today(),participants:'Named preparer, reviewer, partner, finance director; actual capacities',topics:'Fraud, scope, requests, channels and deadlines',decisions:'Held: agreed responsibilities and source requests; open IT answer retained',owner:'reviewer',evidence,openActions:'IT answer: reviewer by target date; corroborate with other evidence'},discussion);
  await operation(app,id,'M06-F13',discussion,'submit');await operation(app,id,'M06-F13',discussion,'approve',{reason:'Inspected actual minutes, not invitation'});
  await operation(app,id,'M06-F14',strategy,'submit',{},409);
  await save(app,id,'M05-F04',{milestone:'Planned fieldwork handoff',start:'2026-01-01',due:'2026-12-31',type:'target',conflict:'accepted',owner:'partner',resolution:'Partner accepts documented scheduling risk with additional supervision; no audit / EQR requirement waived'},milestone);
  await operation(app,id,'M05-F04',milestone,'submit');await operation(app,id,'M05-F04',milestone,'approve',{reason:'Authorized capacity and delivery risk resolution'});
  await operation(app,id,'M06-F14',strategy,'submit',{},409); // Overall risk is still uncovered.
  await app.register(id,'M06-F11',{risk:overall,staffing:'Named experienced team',supervision:'Partner direction and unpredictable journal procedures; not a fake account link',owner:'partner',evidence});
  await operation(app,id,'M06-F14',strategy,'submit');await operation(app,id,'M06-F14',strategy,'return',{reason:'Make restriction and next-owner route explicit'});
  await operation(app,id,'M06-F14',strategy,'submit');await operation(app,id,'M06-F14',strategy,'approve',{reason:'Reviewed exact programme, risks, assignment, materiality and scope versions'});
  const stockStrategy=await app.register(id,'M06-F14',{...strategyValues,programme:stock,impact:'Inventory remains supported by separate substantive responses; no PPE control dependence'});
  const handoff=await app.register(id,'M05-F08',{strategy,nextOwner:'preparer',readiness:'restricted',openWork:'Await explicit assigned source response before starting this programme'});
  state=await app.view('preparer',id);observed('restricted-handoff-remains-open',true,!!state.planning.programmes.find(p=>p.form==='3.1.2').gap);
  await save(app,id,'M05-F08',{strategy,nextOwner:'preparer',readiness:'ready',openWork:'Proceed with supported PPE work; reviewer owns remaining IT inquiry; stop at affected control if facts change'},handoff);
  await operation(app,id,'M05-F08',handoff,'submit');await operation(app,id,'M05-F08',handoff,'approve',{reason:'Exact baseline, open work and next owner inspected'});
  await app.register(id,'M05-F08',{strategy:stockStrategy,nextOwner:'preparer',readiness:'ready',openWork:'Inventory approved scope and current source version available'});
  state=await app.view('preparer',id);observed('ready-handoff-pins-actual-programme-version','',state.planning.programmes.find(p=>p.form==='3.1.2').gap,{programme:record(state,plan).version,strategy:record(state,strategy).version});
  await app.write('partner',id,'access',{role:'preparer',access:'revoke',reason:'Temporarily unavailable; retain original attribution'});
  await app.view('preparer',id,404);state=await app.view('reviewer',id);
  observed('revoked-next-owner-reopens-handoff',true,record(state,handoff).stale);
  await app.write('partner',id,'access',{role:'preparer',access:'grant',reason:'Availability restored with current named appointment'});
  state=await app.view('reviewer',id);observed('restored-access-does-not-resurrect-old-handoff',true,record(state,handoff).stale);
  await save(app,id,'M05-F08',{strategy,nextOwner:'preparer',readiness:'ready',openWork:'Explicitly renewed after restored access; keep prior handoff and signatures'},handoff);await operation(app,id,'M05-F08',handoff,'submit');await operation(app,id,'M05-F08',handoff,'approve',{reason:'Reconfirmed actual recipient access and outstanding route'});
  const before=record(state,plan).version;
  const failed={...controlValues(risk,evidence),operating:'failed',reliance:'none',followup:'Expand substantive work and communicate deficiency to governance'};
  await save(app,id,'M06-F03',failed,control);await operation(app,id,'M06-F03',control,'submit');await operation(app,id,'M06-F03',control,'approve',{reason:'Failed current-period test; no supported reliance'});
  state=await app.view('reviewer',id);
  observed('changed-control-stales-only-linked-programme',true,record(state,plan).stale);
  observed('unrelated-inventory-programme-remains-current',false,record(state,stock).stale);
  observed('unrelated-strategy-retains-supported-work',false,record(state,stockStrategy).stale);
  observed('historical-programme-retained',before,record(state,plan).version);
  await save(app,id,'M06-F09',{...riskValues(entity),fraud,analytics,assessment:'Reassessed risk after actual failed control test; substantive response expanded',contradictions:'Failed control contradicts the earlier planned support; retain original risk and control evidence'},risk);await operation(app,id,'M06-F09',risk,'submit');await operation(app,id,'M06-F09',risk,'approve',{reason:'Independent contradictory-evidence reassessment'});
  // Reassessment removes planned reliance, keeps the performed source answers/history and updates only its own baseline.
  await save(app,id,'M07-F01',programmeValues(rules['3.1.2'],risk,{responses:JSON.stringify(links.map(({control,...r})=>r))}),plan);
  await operation(app,id,'M07-F01',plan,'submit');await operation(app,id,'M07-F01',plan,'approve',{reason:'Revised substantive coverage after failed control test'});
  await save(app,id,'M06-F14',{...strategyValues,impact:'PPE control failed: substantive scope revised; inventory separate work retained with recorded reasons'},strategy);
  await operation(app,id,'M06-F14',strategy,'submit');await operation(app,id,'M06-F14',strategy,'approve',{reason:'Reassessed changed support, retained unrelated work'});
  await save(app,id,'M05-F08',{strategy,nextOwner:'preparer',readiness:'ready',openWork:'Use revised substantive plan; retain historical control failure and action owner'},handoff);
  await operation(app,id,'M05-F08',handoff,'submit');await operation(app,id,'M05-F08',handoff,'approve',{reason:'Revised exact version handoff'});
  await app.write('preparer',id,'effort-log',{work:'1.3',from:'2026-01-05T09:00:00.000Z',through:'2026-01-05T11:00:00.000Z',purpose:'Actual benchmark investigation'});
  state=await app.view('preparer',id);const original=state.planning.effort[0];observed('actual-effort-may-exceed-budget',120,original.minutes);
  await app.write('preparer',id,'effort-log',{work:'1.3',from:'2026-01-05T10:00:00Z',through:'2026-01-05T12:00:00Z',purpose:'Overlapping actual time'},409);
  await app.write('reviewer',id,'effort-log',{work:'1.3',from:'2026-01-05T09:00:00Z',through:'2026-01-05T10:00:00Z',purpose:'Different named person may work in parallel',supersedes:original.id,reason:'Cannot rewrite another person'},409);
  await app.write('preparer',id,'effort-log',{work:'1.3',from:'2026-01-05T09:00:00Z',through:'2026-01-05T11:30:00Z',purpose:'Correct actual elapsed work',supersedes:original.id,reason:'Missed documented half hour'});
  const budgetRevised={start:'2026-01-01',end:'2026-12-31',hours:'0.5',scope:'Same engagement scope',basis:'Commercial budget reduced; actual effort and required audit work unchanged'};
  await save(app,id,'M05-F05',budgetRevised,budget);await operation(app,id,'M05-F05',budget,'submit');await operation(app,id,'M05-F05',budget,'approve',{reason:'Budget does not waive audit requirements'});
  state=await app.view('preparer',id);observed('budget-change-preserves-actual-effort',[120,150],state.planning.effort.map(e=>e.minutes));
  observed('correction-retains-original-history',[false,true],state.planning.effort.map(e=>e.current));
  // Restore the reviewed budget reference before producing a reusable browser fixture.
  await save(app,id,'M06-F14',strategyValues,strategy);await operation(app,id,'M06-F14',strategy,'submit');await operation(app,id,'M06-F14',strategy,'approve',{reason:'Reviewed the revised budget without reducing actual effort'});
  await save(app,id,'M05-F08',{strategy,nextOwner:'preparer',readiness:'ready',openWork:'Usable exact programme version, owner and outstanding-source restriction'},handoff);await operation(app,id,'M05-F08',handoff,'submit');await operation(app,id,'M05-F08',handoff,'approve',{reason:'Current version and restriction inspected'});
  const first=await app.view('reviewer',id);await app.close();app=await start(database);state=await app.view('reviewer',id);
  observed('restart-preserves-history-and-exact-bases',first.planning,state.planning,{revision:state.revision});
  if(process.env.AUDIT_PLANNING_FIXTURE_DIR){const output=resolve(process.env.AUDIT_PLANNING_FIXTURE_DIR);await mkdir(output,{recursive:true});const destination=join(output,'planning-ready.sqlite'),db=new DatabaseSync(database,{readOnly:true});await backup(db,destination);db.close();await writeFile(join(output,'planning-fixture.json'),JSON.stringify({database:destination,engagement:id,credentials:passwords,plan,strategy,handoff,risk,control,budget,stock},null,2)+'\n');await writeFile(join(output,'G02_Connected_Proof.json'),JSON.stringify({engagement:id,proof,scope:'Synthetic source-grounded engineering fixture; independent source acceptance not recorded'},null,2)+'\n');}
 }finally{await app?.close();await rm(dir,{recursive:true,force:true});}
});

test('G02 programme adoption requires current explicit loss acknowledgement and preserves incompatible answers in history',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'audit-g02-adoption-'));let app;
 try{
  app=await start(join(dir,'adoption.sqlite'),true);const people=await firm(app),{id,evidence}=await activated(app,people);
  await app.register(id,'M05-F02',profileValues(evidence));const entity=await app.register(id,'M06-F02',understanding),risk=await app.register(id,'M06-F09',riskValues(entity));await materiality(app,id);
  const form='3.1.2',rule=await app.register('firm','M02-F05',{programme:form,profile:'all',outcome:'required',override:'no',basis:'Fictional exact programme scope'});
  await app.write('partner','firm','template-grant',{form,actor:'reviewer',access:'grant',note:'PPE source adoption review'});
  const template={...structuredClone(formContract(form)),fields:[...structuredClone(formContract(form).fields),{key:'legacyNarrative',label:'Prior signed explanation',source:'G02 controlled test addition',type:'textarea'}]};
  const publish=async body=>{await app.write('reviewer','firm','template-save',{form,body:JSON.stringify(body)});await app.write('reviewer','firm','template-submit',{form,note:'Exact controlled edition'});await app.write('partner','firm','template-publish',{form,note:'Independent publication of exact fields'});};
  await publish(template);const values=programmeValues(rule,risk,{templateVersion:'1'}),plan=await app.register(id,'M07-F01',values);
  let state=await app.view('reviewer',id),paper=state.papers.find(p=>p.form===form),owner={nomin:'preparer',temuulen:'reviewer',bat:'partner'}[paper.owner];
  const original=paper.template.digest;
  const saveAnswers=text=>app.write(owner,id,'save',{form,execution:'Actual current programme evidence and narrative',conclusion:'Draft source-grounded outcome; no approval inferred',templateDigest:original,answers:JSON.stringify({legacyNarrative:text})});
  await saveAnswers('Original actual explanation that the new edition will not carry');
  await publish({...template,fields:template.fields.filter(f=>f.key!=='legacyNarrative')});
  await save(app,id,'M07-F01',{...values,templateVersion:'2'},plan);await operation(app,id,'M07-F01',plan,'submit');
  state=await app.view('partner',id);const preview=record(state,plan).adoptionPreview;assert.equal(preview.requiresReview,true);assert.ok(preview.losses.some(l=>l.key==='legacyNarrative'));
  await operation(app,id,'M07-F01',plan,'approve',{reason:'Missing acknowledgement'},409);
  await operation(app,id,'M07-F01',plan,'approve',{reason:'Wrong digest',adoptionAck:'reviewed',adoptionReview:'wrong'},409);
  await saveAnswers('Actual explanation changed after the loss preview');
  await operation(app,id,'M07-F01',plan,'approve',{reason:'Stale preview',adoptionAck:'reviewed',adoptionReview:preview.digest},409);
  await operation(app,id,'M07-F01',plan,'return',{reason:'Refresh the exact current losses'});await operation(app,id,'M07-F01',plan,'submit');
  state=await app.view('partner',id);const refreshed=record(state,plan).adoptionPreview;assert.notEqual(refreshed.digest,preview.digest);
  if(process.env.AUDIT_PLANNING_FIXTURE_DIR){const output=resolve(process.env.AUDIT_PLANNING_FIXTURE_DIR),destination=join(output,'planning-loss.sqlite'),db=new DatabaseSync(join(dir,'adoption.sqlite'),{readOnly:true});await backup(db,destination);db.close();await writeFile(join(output,'planning-loss-fixture.json'),JSON.stringify({database:destination,engagement:id,credentials:passwords,plan},null,2)+'\n');}
  state=await operation(app,id,'M07-F01',plan,'approve',{reason:'Reviewed the actual incompatible answer and retained history',adoptionAck:'reviewed',adoptionReview:refreshed.digest});paper=state.papers.find(p=>p.form===form);
  assert.equal(paper.values['field.legacyNarrative'],undefined);assert.ok(paper.history.some(h=>h.values['field.legacyNarrative']==='Actual explanation changed after the loss preview'));
  assert.equal(record(state,plan).adoptionAcknowledgement.digest,refreshed.digest);assert.equal(JSON.parse(paper.values['template.adoption']).digest,refreshed.digest);
 }finally{await app?.close();await rm(dir,{recursive:true,force:true});}
});

test('G02 scope and contributor safeguards retain unknowns, opening limitations and conditional legal applicability',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'audit-g02-branches-'));let app;
 try{
  app=await start(join(dir,'branches.sqlite'),true);const people=await firm(app),{id,evidence}=await activated(app,people);
  const profile=await app.register(id,'M05-F02',profileValues(evidence));
  const statutory=await save(app,id,'M05-F04',{milestone:'Claimed legal deadline',start:'2026-01-01',due:'2026-12-31',type:'statutory',conflict:'none',owner:'reviewer',resolution:'No legal authority supplied'});await operation(app,id,'M05-F04',statutory,'submit',{},409);
  const common={area:'PPE',reliance:'Delivered report is not automatically sufficient audit evidence',test:'Auditor performs and evaluates corroborating work',limitations:'Actual remaining limitations',effect:'Retain current-work and reporting implications',partyName:'Named fictional contributor',suitability:'Competence, capability, objectivity / independence and responsible auditor checked',evaluation:'Auditor evaluates methods, significant assumptions, data and findings',result:'sufficient',evidence};
  for(const type of ['auditor-expert','management-expert','internal-function'])await app.register(id,'M06-F05',{...common,type});
  const opening=await save(app,id,'M06-F05',{...common,type:'opening',result:'limited',evidence:''});await operation(app,id,'M06-F05',opening,'submit',{},409);
  await save(app,id,'M06-F05',{...common,type:'opening',result:'limited',comparatives:'Compared prior report where permitted, rollforward and policy consistency; alternative work remains open',followup:'Additional current procedures and possible reporting limitation; not a clean conclusion'},opening);await operation(app,id,'M06-F05',opening,'submit');await operation(app,id,'M06-F05',opening,'approve',{reason:'Auditor retains unresolved opening limitation'});
  const direct=await save(app,id,'M06-F05',{...common,type:'direct-assistance'});await operation(app,id,'M06-F05',direct,'submit',{},409);
  await save(app,id,'M06-F05',{...common,type:'direct-assistance',permission:'Fictional test-only permissible scope, objectivity, competence and written agreement; not a local legal conclusion',permissionEvidence:evidence},direct);await operation(app,id,'M06-F05',direct,'submit');await operation(app,id,'M06-F05',direct,'approve',{reason:'Conditional direct assistance; no independent portal, note clearance or opinion authority granted'});
  const component=await save(app,id,'M06-F05',{...common,type:'component'});await operation(app,id,'M06-F05',component,'submit',{},409);
  await save(app,id,'M05-F02',{...profileValues(evidence),group:'yes',components:'Named fictional component, group auditor responsibilities, communication and scoped deliverable'},profile);await operation(app,id,'M05-F02',profile,'submit');await operation(app,id,'M05-F02',profile,'approve',{reason:'Actual relevant group scope recorded'});
  await operation(app,id,'M06-F05',component,'submit');await operation(app,id,'M06-F05',component,'approve',{reason:'Group auditor evaluates the component work; no automatic sufficiency'});
  assert.equal((await app.view('reviewer',id)).registers.filter(r=>r.kind==='M06-F05'&&r.status==='approved').length,6);
 }finally{await app?.close();await rm(dir,{recursive:true,force:true});}
});

test('G02 actual effort rejects cross-engagement overlap without revealing hidden work and preserves scoped portfolio intervals',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'audit-g02-effort-'));let app;
 try{
  app=await start(join(dir,'effort.sqlite'),true);const people=await firm(app),first=await activated(app,people),profile=first.profile;
  const second=await setupEngagement(app,people,profile.id,profile.contact,await enquiry(app,'client',profile.id),{start:'2024-01-01',end:'2024-12-31',reportDate:'2026-12-31'});
  const assessed=await assess(app,second.id,second.evidence);await terms(app,second.id,assessed.intakeContext,second.evidence,profile.contact);await app.write('partner',second.id,'acceptance-decide',decision(second.evidence));await app.write('partner',second.id,'activate',activation);
  const actual={work:'1.3',from:'2026-01-05T09:00:00Z',through:'2026-01-05T10:00:00Z',purpose:'Actual separately assigned work'};
  await app.write('preparer',first.id,'effort-log',actual);
  const denied=await app.write('preparer',second.id,'effort-log',{...actual,from:'2026-01-05T09:30:00Z',through:'2026-01-05T10:30:00Z'},409);assert.equal(denied.error.includes(first.id),false);
  await app.write('preparer',second.id,'effort-log',{...actual,from:'2026-01-05T13:00:00Z',through:'2026-01-05T14:00:00Z'});
  await app.write('partner',second.id,'access',{role:'reviewer',access:'revoke',reason:'Reviewer has no permission to see this engagement'});
  const scoped=await app.view('reviewer','firm'),person=scoped.roster.find(r=>r.id===people.preparer.person);
  assert.deepEqual(person.actual.map(e=>e.engagement),[first.id]);assert.equal(person.actual[0].minutes,60);
  assert.equal(JSON.stringify(person).includes(second.id),false);
  const total=(await app.view('partner','firm')).roster.find(r=>r.id===people.preparer.person);assert.equal(total.actual.length,2);assert.ok(total.actual.every(e=>e.from&&e.through&&e.minutes===60));
 }finally{await app?.close();await rm(dir,{recursive:true,force:true});}
});
