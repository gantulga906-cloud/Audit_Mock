import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 activateEngagement,advanceCustody,approveSample,authorizationCurrent,authorizeReport,bindStatements,canReadWork,
 changeWork,clearNote,completeEqr,currentSelection,executeRun,initialModel,issueReport,outstanding,prepareDemo,
 recordRequestPart,recordSampleTest,reportGaps,reschedule,resolveFinding,respondNote,returnWork,reviewWork,
 saveIntake,saveStatements,setEngagementDecision,submitWork,workKey,
} from '../src/lib/workspace.ts';
const forms=JSON.parse(fs.readFileSync(new URL('../src/data/forms.json',import.meta.url),'utf8'));
const fresh=()=>prepareDemo(initialModel(forms));
const at=(m,f)=>m.work[workKey(m.engagement,f)];
function reviewedFixture(m,f){const w=at(m,f);w.status='reviewed';w.reviewedVersion=w.version;}
function approveInputs(m){
 reviewedFixture(m,'1.3');
 at(m,'2.6').values={controlsReliance:'none',relianceBasis:'Fixture: substantive procedures only'};
 reviewedFixture(m,'2.6');
}
function releaseFixture(m){
 const e=m.engagements.find(x=>x.id===m.engagement);e.reportFsVersion=e.fsVersion;
 reviewedFixture(m,'4.4');reviewedFixture(m,'4.1.A1');
 Object.values(m.work).filter(w=>w.engagement===e.id).forEach(w=>w.notes=[]);
 m.findings.filter(f=>f.engagement===e.id).forEach(f=>f.resolution='Fixture: effect evaluated');
}
test('revised report and statement content invalidate authorization and retain the issued payload',()=>{
 const m=fresh(),e=m.engagements[0];releaseFixture(m);m.person='bat';authorizeReport(m);issueReport(m);
 const before=e.releaseHistory[0].package;
 m.person='nomin';const report=at(m,'4.1.A1');changeWork(m,report.id,{conclusion:'Revised report'});submitWork(m,report.id);
 m.person='temuulen';reviewWork(m,report.id);
 m.person='bat';assert.equal(authorizationCurrent(m,e),false);assert.throws(()=>issueReport(m));
 assert.equal(before.paper.version,1);assert.notEqual(before.paper.values.conclusion,'Revised report');
 authorizeReport(m);saveStatements(m,'Changed balance sheet','Changed notes');assert.throws(()=>issueReport(m));bindStatements(m);
 assert.throws(()=>issueReport(m));authorizeReport(m);issueReport(m);assert.equal(e.releaseHistory.length,2);
 assert.equal(e.releaseHistory[0].package.statements.version,2);assert.equal(e.authorizationHistory.length,3);
});
test('selection rejects stale or missing upstream reviews even when design and dataset are unchanged',()=>{
 const m=fresh();m.person='temuulen';assert.throws(()=>approveSample(m),/1.3/);approveInputs(m);approveSample(m);
 executeRun(m,'AUTO-047');const previous=currentSelection(m,'E1');
 const w=at(m,'1.3');m.person='nomin';changeWork(m,w.id,{...w.values,performance:'60'});
 assert.throws(()=>executeRun(m,'AUTO-047'),/1.3/);assert.equal(currentSelection(m,'E1'),undefined);
 assert.deepEqual(m.samples.E1.selections,[previous]);submitWork(m,w.id);
 m.person='temuulen';reviewWork(m,w.id);assert.throws(()=>executeRun(m,'AUTO-047'),/дахин/);
 approveSample(m);executeRun(m,'AUTO-047');assert.equal(m.samples.E1.selections.length,2);
});
test('fixed-asset intake, rejection, replacement, sample exception, return, issue and custody',()=>{
 const m=fresh();m.engagement='E2';const e=m.engagements[1],work=at(m,'3.1.2');m.person='nomin';
 saveIntake(m,{origin:'client',period:'',contact:'Fixture contact',facts:'Asset additions'});
 assert.throws(()=>submitWork(m,work.id),/идэвхжүүл/);
 m.person='bat';assert.throws(()=>activateEngagement(m));setEngagementDecision(m,'independence',true,'Independence v1');
 setEngagementDecision(m,'termsAgreed',true,'Letter v1');setEngagementDecision(m,'acceptance','accepted','Assessment v1');
 assert.throws(()=>activateEngagement(m),/Тайлант жил/);saveIntake(m,{...e.intake,period:'2025'});activateEngagement(m);
 m.person='temuulen';reschedule(m,work.id,'2026-11-16');approveInputs(m);approveSample(m);
 m.person='nomin';executeRun(m,'AUTO-047');const units=currentSelection(m,'E2').ids;
 recordRequestPart(m,'REQ-04','register','receive','E2-ASSET-1');recordRequestPart(m,'REQ-04','register','accept');
 recordRequestPart(m,'REQ-04','invoice','receive','E2-ASSET-2');recordRequestPart(m,'REQ-04','invoice','reject','Missing receipt');
 assert.throws(()=>recordSampleTest(m,units[0],'pass','Invoice checked',0));assert.throws(()=>submitWork(m,work.id),/REQ-04/);
 recordRequestPart(m,'REQ-04','invoice','receive','E2-ASSET-3');recordRequestPart(m,'REQ-04','invoice','accept');
 assert.deepEqual(work.evidence,['E2-ASSET-1','E2-ASSET-3']);assert.throws(()=>submitWork(m,work.id),/нэгж/);
 units.forEach((id,i)=>recordSampleTest(m,id,i===0?'exception':'pass',i===0?'Depreciation difference':'Reconciled',i===0?250000:0));
 submitWork(m,work.id);m.person='temuulen';returnWork(m,work.id,'Explain depreciation difference');
 const note=work.notes[0];m.person='nomin';respondNote(m,work.id,note.id,'Attached reconciliation and invoice');submitWork(m,work.id);
 m.person='temuulen';assert.throws(()=>reviewWork(m,work.id));clearNote(m,work.id,note.id);reviewWork(m,work.id);
 const finding=m.findings.find(f=>f.engagement==='E2');assert.equal(finding.sampleId,units[0]);assert.equal(outstanding(m,'E2'),250000);
 for(const f of ['4.4','4.1.A1']){m.person='nomin';const w=at(m,f);changeWork(m,w.id,{conclusion:'Reviewed demo content'});submitWork(m,w.id);m.person='temuulen';reviewWork(m,w.id);}
 m.person='bat';assert.throws(()=>advanceCustody(m,'lock'));assert.throws(()=>authorizeReport(m),/илрүүлэлт/);
 resolveFinding(m,finding.id,'Unposted difference evaluated; retain in summary');authorizeReport(m);issueReport(m);
 advanceCustody(m,'lock');advanceCustody(m,'offer');advanceCustody(m,'accept');
 assert.equal(e.custody,'accepted');assert.equal(e.releaseHistory[0].package.sample.ids.length,units.length);
 assert.throws(()=>reschedule(m,work.id,'2026-11-17'));assert.equal(outstanding(m,'E2'),250000);
});
test('quality access is distinct and required EQR must match the current package',()=>{
 const m=fresh();m.engagement='E3';const e=m.engagements[2];releaseFixture(m);
 e.qualityConcerns=[];m.person='bat';assert.throws(()=>authorizeReport(m),/EQR/);assert.throws(()=>completeEqr(m));
 m.person='saruul';assert.ok(canReadWork(m,at(m,'4.6')));assert.equal(canReadWork(m,at(m,'3.1.2')),false);completeEqr(m);
 assert.ok(!reportGaps(m,'E3').some(g=>g.includes('EQR')));
 m.person='bat';authorizeReport(m);saveStatements(m,'Changed statements','Changed notes');bindStatements(m);assert.throws(()=>issueReport(m),/EQR/);
});
test('import automation flags missing and mismatched independently supplied control totals',()=>{
 const m=fresh(),d=m.datasets.E1;
 assert.ok(executeRun(m,'AUTO-003').exceptions.some(e=>e.includes('оруулаагүй')));
 d.controlTotal=d.sourceTotal+10;
 assert.ok(executeRun(m,'AUTO-003').rows.some(r=>r.value==='-10'));
 assert.ok(executeRun(m,'AUTO-003').exceptions.some(e=>e.includes('зөрсөн')));
});
