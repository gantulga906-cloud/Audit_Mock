import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculateMateriality,saveRevision,submitRevision,reviewRevision,needsAcceptance} from '../src/lib/workflow.ts';
const record=()=>({status:'in_progress',version:1,values:{},preparer:'preparer',notes:[],history:[],evidence:[]});
test('review targets the submitted version; editing reviewed work preserves its prior review',()=>{
  const submitted=submitRevision(record(),'preparer');
  const reviewed=reviewRevision(submitted,'reviewer');
  const changed=saveRevision(reviewed,'preparer');
  assert.equal(changed.status,'changed');assert.equal(changed.reviewedVersion,1);assert.equal(changed.version,2);assert.equal(changed.submittedVersion,undefined);
});
test('preparer cannot review own submission and unanswered notes cannot be cleared by status alone',()=>{
  const r=submitRevision(record(),'preparer');assert.throws(()=>reviewRevision(r,'preparer'));
  r.notes=[{cleared:false,response:'Added evidence'}];assert.throws(()=>reviewRevision(r,'reviewer'));
});
test('submitted answer snapshot is preserved when the working answer changes',()=>{
  const r=record();r.values={answer:'Original answer'};
  const submitted=submitRevision(r,'preparer');
  const edited={...submitted,values:{answer:'Changed answer'}};
  assert.equal(edited.snapshots[1].answer,'Original answer');
});
test('dependent work is available only after an explicit acceptance decision',()=>{
  assert.equal(needsAcceptance('1.1.1',{'1.4.1':record()}),true);
  assert.equal(needsAcceptance('1.1.1',{'1.4.1':{...record(),values:{acceptance:'Хүлээн авах'}}}),false);
  assert.equal(needsAcceptance('3.1.2',{}),false);
});
test('materiality preserves valid zero and distinguishes missing and invalid inputs',()=>{
  assert.equal(calculateMateriality('5000000000','1.5'),75000000);assert.equal(calculateMateriality('1000','0'),0);assert.equal(calculateMateriality('','1'),null);assert.equal(calculateMateriality('1000','-1'),null);assert.equal(calculateMateriality('NaN','1'),null);
});
