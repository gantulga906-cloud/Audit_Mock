import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCompany,createEngagement,createRequest,registerRisk,tailorProgram,updateRequest} from '../src/lib/feature-workflows.ts';
import {activateEngagement,canReadWork,changeWork,initialModel,permitted,readiness,recordRequestPart,reportGaps,setEngagementDecision,workKey} from '../src/lib/workspace.ts';
import {missingFields,saveClient,sharedFields} from '../src/lib/workbench.ts';

const {forms}=JSON.parse(readFileSync(new URL('../src/data/source-registers.json',import.meta.url),'utf8'));
const programme=forms.find(f=>f.id==='3.1.2');
const team={preparer:'nomin',reviewer:'temuulen',partner:'bat'};
const period={start:'2025-04-01',end:'2026-03-31'};
const contact={id:'c',name:'Test Finance',role:'CFO',email:'finance@example.test',body:'Board',signer:true};
const profile={name:'Test Company',registration:' 001 A ',legalForm:'ХХК',framework:'IFRS',contacts:[contact],bodies:['Board']};
function setup(){
 const m=initialModel(forms);
 const company=createCompany(m,profile,'Manufacturing');
 const id=createEngagement(m,company,period,'2026-12-20',team,forms);
 return {m,company,id,w:m.work[workKey(id,programme.id)]};
}
function activate(m){
 m.person='bat';
 setEngagementDecision(m,'termsAgreed',true,'Letter v1');
 setEngagementDecision(m,'independence',true,'Independence v1');
 setEngagementDecision(m,'acceptance','accepted','Test decision');
 activateEngagement(m);
}

test('new engagements use typed client data, a blank file and assigned scope',()=>{
 const {m,company,id,w}=setup();
 assert.equal(Object.values(m.work).filter(p=>p.engagement===id).length,70);
 assert.deepEqual(w.values,{});
 assert.equal(m.datasets[id].rows.length,0);
 assert.equal(m.requests.some(r=>r.engagement===id),false);
 assert.equal(sharedFields(m,id).period,'2025-04-01 — 2026-03-31');
 assert.ok(readiness(m,w).length);
 m.person='saruul';assert.equal(permitted(m,id),false);assert.equal(canReadWork(m,w),false);
 m.person='temuulen';
 assert.throws(()=>createCompany(m,{...profile,registration:'001a'},''),/дугаартай/);
 assert.throws(()=>createEngagement(m,company,period,'2027-12-20',team,forms),/давхцаж/);
 assert.throws(()=>createEngagement(m,company,{start:'2026-04-31',end:'2027-03-31'},'2027-12-20',team,forms),/өдрийг/);
 activate(m);
 assert.equal(m.companies[company].status,'active');
 assert.deepEqual(readiness(m,w),[]);
 m.person='nomin';
 changeWork(m,w.id,{assetCost:'100'});
 saveClient(m,id,{...profile,name:'Updated Company'},period);
 m.person='bat';
 const second=createEngagement(m,company,{start:'2026-04-01',end:'2027-03-31'},'2027-12-20',{...team,quality:'saruul'},forms,id);
 const next=m.engagements.at(-1);
 assert.equal(next.carriedFrom,id);
 assert.equal(next.client,'Updated Company');
 assert.equal(next.acceptance,'pending');
 assert.equal(next.decisions,undefined);
 assert.deepEqual(m.work[workKey(second,w.form)].values,{});
 m.person='saruul';assert.equal(permitted(m,second),true);assert.equal(canReadWork(m,m.work[workKey(second,w.form)]),false);
});

test('only issued requests gate work and replacement retains the rejected evidence',()=>{
 const {m,id,w}=setup();
 const input={title:'PBC',form:w.form,contactId:'c',owner:'nomin',due:'2026-11-20',message:'Please provide',parts:['Invoice','Schedule']};
 assert.throws(()=>createRequest(m,input),/Идэвхтэй/);
 activate(m);
 w.status='reviewed';w.reviewedVersion=1;
 createRequest(m,input);
 const r=m.requests[0],[invoice,schedule]=r.parts;
 assert.equal(r.dispatch,'draft');assert.equal(readiness(m,w).length,0);
 assert.equal(r.contactEmail,contact.email);
 updateRequest(m,r.id,'issue');
 assert.equal(w.status,'changed');assert.equal(w.history[0].version,1);
 assert.ok(readiness(m,w).some(g=>g.includes(r.id)));
 updateRequest(m,r.id,'followup','Called CFO');
 assert.equal(r.followUps[0].text,'Called CFO');
 for(const evidence of ['old','corrected','second'])m.evidence.push({id:evidence,engagement:id,status:'received',name:evidence,version:1});
 assert.throws(()=>recordRequestPart(m,r.id,invoice.id,'receive','old'),/эзэн/);
 m.person='nomin';
 recordRequestPart(m,r.id,invoice.id,'receive','old');
 assert.throws(()=>recordRequestPart(m,r.id,invoice.id,'reject'),/шалтгаан/);
 recordRequestPart(m,r.id,invoice.id,'reject','Wrong period');
 assert.equal(r.status,'changes_requested');
 recordRequestPart(m,r.id,invoice.id,'receive','corrected');
 recordRequestPart(m,r.id,invoice.id,'accept');
 assert.equal(m.evidence.find(e=>e.id==='old').status,'rejected');
 assert.equal(m.evidence.find(e=>e.id==='corrected').replaces,'old');
 recordRequestPart(m,r.id,schedule.id,'receive','second');
 assert.equal(r.status,'ready');
 recordRequestPart(m,r.id,schedule.id,'accept');
 assert.equal(r.status,'complete');assert.deepEqual(readiness(m,w),[]);
 assert.deepEqual(w.evidence,['corrected','second']);
 createRequest(m,input);
 const duplicate=m.requests[0];
 updateRequest(m,duplicate.id,'issue');
 updateRequest(m,duplicate.id,'cancel','Already satisfied');
 assert.deepEqual(readiness(m,w),[]);
});

test('engagement programme revisions preserve source procedures and require fresh execution',()=>{
 const {m,w}=setup();
 activate(m);
 const base=programme.fields.find(f=>f.type==='procedure');
 const original=base.label;
 w.values[base.key]='Signed work';w.values[base.key+'.result']='Old result';w.reviewedVersion=1;w.status='reviewed';
 registerRisk(m,w,'Risk for revised test','Completeness','Extend test','Өндөр');
 const risk=m.risks.at(-1);
 tailorProgram(m,w.id,programme,{mode:'adapt',key:base.key,label:'Revised procedure',reason:'New evidence',risk:risk.id});
 assert.equal(w.status,'changed');
 assert.equal(w.history[0].template.fields.find(f=>f.key===base.key).label,original);
 assert.equal(w.history[0].values[base.key],'Signed work');
 assert.equal(w.values[base.key],undefined);
 assert.ok(missingFields(m,w).some(g=>g.includes('Revised procedure')));
 assert.ok(reportGaps(m,w.engagement).some(g=>g.includes(w.form)));
 m.person='nomin';
 assert.throws(()=>tailorProgram(m,w.id,programme,{mode:'na',key:base.key,label:'',reason:'Out of scope'}),/ахлах/);
 tailorProgram(m,w.id,programme,{mode:'add',label:'Extra procedure',reason:'Risk response',risk:risk.id});
 m.person='temuulen';
 tailorProgram(m,w.id,programme,{mode:'na',key:base.key,label:'',reason:'Out of scope'});
 assert.ok(!missingFields(m,w).some(g=>g.includes('Revised procedure')));
 assert.ok(missingFields(m,w).some(g=>g.includes('Extra procedure')));
 assert.equal(base.label,original);
});
