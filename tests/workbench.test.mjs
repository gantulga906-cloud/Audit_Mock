import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {applyTemplate,bench,grant,missingFields,publish,saveClient,saveDraft,sharedForWork,templateFromGrid} from '../src/lib/workbench.ts';
import {canEdit,canReadWork,exportWorkspace,initialModel,personById,prepareDemo,submitWork} from '../src/lib/workspace.ts';
import {checkData,evidenceCoverage,projectRatio} from '../src/lib/audit-checks.ts';
const forms=JSON.parse(fs.readFileSync(new URL('../src/data/forms.json',import.meta.url),'utf8'));
const fresh=()=>{const m=prepareDemo(initialModel(forms));bench(m);return m};
const custom=()=>templateFromGrid({name:'Inventory visits',rows:[['Question','Type','Choices','Required'],['Count completed?','yesno','','yes'],['Location','single','A;B','yes']]});
test('company and period reach later forms and stale submitted work retains original values',()=>{
 const m=fresh(),w=m.work['E1/1.4.3'],c=m.bench.clients.E1;
 const prior={...c,name:'Company A',registration:'001234'};
 saveClient(m,'E1',prior,{start:'2025-07-01',end:'2026-06-30'});
 assert.equal(sharedForWork(m,w).period,'2025-07-01 — 2026-06-30');
 m.person=w.owner;w.values.conclusion='Draft';submitWork(m,w.id);
 assert.equal(w.values['shared.registration'],'001234');
 saveClient(m,'E1',{...prior,name:'Company B'},m.bench.periods.E1);
 assert.equal(w.status,'changed');
 assert.equal(w.history[0].values['shared.name'],'Company A');
 assert.equal(sharedForWork(m,w).name,'Company B');
 assert.throws(()=>saveClient(m,'E1',prior,{start:'2026-02-31',end:'2026-03-01'}));
});
test('template can be drafted, separately published, and applied without rewriting answers or history',()=>{
 const m=fresh(),t=custom();
 saveDraft(m,t,true,'Add location to visit checklist');
 assert.throws(()=>publish(m,t.id));m.person='bat';publish(m,t.id);
 const id=applyTemplate(m,'E1',t,'nomin','temuulen'),w=m.work[id];
 assert.equal(missingFields(m,w).length,2);
 m.person='nomin';w.values[t.fields[0].key]='Хамаарахгүй';w.values[t.fields[1].key]='A';
 assert.throws(()=>submitWork(m,id),/үндэслэл/);
 w.values[t.fields[0].key+'.reason']='No stock count applicable';submitWork(m,id);
 applyTemplate(m,'E1',{...t,fields:[{...t.fields[0],label:'Revised label'},t.fields[1]]},'nomin','temuulen');
 assert.equal(w.status,'changed');
 assert.equal(w.values[t.fields[0].key],'Хамаарахгүй');
 assert.equal(w.history[0].template.fields[0].label,'Count completed?');
});
test('responsibility exceptions grant and revoke scoped access without giving review of own work',()=>{
 const m=fresh(),w=m.work['E1/3.1.2'],actor=personById(m.person),user=personById('nomin'),other=personById('bat');
 grant(m,w,actor,user,'prepare',false);m.person=user.id;assert.equal(canEdit(m,w),false);
 m.person=actor.id;grant(m,w,actor,other,'prepare',true);m.person=other.id;assert.equal(canEdit(m,w),true);
 m.person=actor.id;grant(m,w,actor,user,'view',false);m.person=user.id;assert.equal(canReadWork(m,w),false);
 assert.equal(exportWorkspace(m).work[w.id],undefined);
 assert.ok(!('E3' in exportWorkspace(m).bench.clients));
 m.person=actor.id;assert.throws(()=>grant(m,w,actor,user,'review',true));
});
test('structured template import rejects unsupported types and preserves intentional zero',()=>{
 assert.equal(custom().fields[1].options[0],'A');
 assert.throws(()=>templateFromGrid({name:'Bad',rows:[['Question','Type'],['A','magic']]}));
 const m=fresh(),t=custom();t.fields=[{key:'n',label:'Amount',source:'Draft',type:'number',required:true}];
 const id=applyTemplate(m,'E1',t,'nomin','temuulen');m.work[id].values.n='0';
 assert.deepEqual(missingFields(m,m.work[id]),[]);
});
test('data checks distinguish unmatched mappings, invalid input and actual roll-forward residuals',()=>{
 assert.equal(checkData('AUTO-005','account,opening,debits,credits,closing\n100,100.11,10,20,90.12').rows[0].difference,0.01);
 assert.throws(()=>checkData('AUTO-005','account,opening,debits,credits,closing\n100,,10,20,90'));
 const mapping=checkData('AUTO-006','account,line,closing\n100,Cash,90\n200,UNMAPPED,20','line,reported\nCash,100\nReceivables,45');
 assert.equal(mapping.rows[0].difference,10);assert.equal(mapping.issues.length,3);
 assert.equal(checkData('AUTO-027','class,opening,additions,disposals,closing,ledger\nVehicle,100,10,5,105,100').rows[1].difference,-5);
});
test('evidence coverage excludes wrong engagement and ratio projection avoids counting sampled errors twice',()=>{
 const m=fresh(),request=m.requests.find(r=>r.id==='REQ-04');
 request.evidence=['EV1'];
 assert.equal(evidenceCoverage(m,'E2').find(r=>r.id==='REQ-04').status,'missing');
 const out=projectRatio([{id:'a',amount:100},{id:'b',amount:900}],[{id:'a',error:10}]);
 assert.equal(out.projection,100);
 assert.throws(()=>projectRatio([{id:'a',amount:0}],[{id:'a',error:0}]));
});
