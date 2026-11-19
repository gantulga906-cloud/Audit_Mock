import {PilotError,accounts} from './pilot-workflow.mjs';
import {requireSeat} from './pilot-staffing.mjs';
import {approvedRows} from './pilot-registers.mjs';
import {inScope,personById,reassign,recordEvent} from '../src/lib/workspace.ts';
const fail=(message,status=409)=>{throw new PilotError(status,message);};
const text=(value,label)=>{if(typeof value!=='string'||!value.trim()||value.length>4000)fail('An explicit '+label+' is required.',400);return value.trim();};
export function assignmentPerson(m,reference,files,start,end){
 let id=reference;
 if(Object.hasOwn(accounts,reference)){
  const people=(m.runtimePeople??[]).filter(p=>p.role===reference&&inScope(m,p.id,m.engagement));
  if(people.length>1)fail('Choose a named person; this capacity has multiple current members.');
  id=people[0]?.id??accounts[reference];
 }
 const person=personById(id,m);
 if(!person||!['preparer','reviewer','partner'].includes(person.role)||!inScope(m,id,m.engagement))fail('Choose a current named engagement team member.',403);
 const basis=requireSeat(m,files,person.role,start,end,person.staff);
 if(m.pilotAcceptance){
  const staff=person.staff??basis?.person,today=new Date().toISOString().slice(0,10);
  const declaration=approvedRows(m,'M04-F04').find(r=>r.values.person===staff&&r.declaration&&r.values.due>=today&&r.declaration.signedOn<=today&&
   (r.declaration.disposition==='none'||r.declaration.disposition==='disclosure'&&approvedRows(m,'M04-F05').some(t=>t.values.declaration===r.id&&t.values.treatment==='threat'&&t.values.residual==='acceptable')));
  if(!declaration)fail('The exact named person needs a current independently evaluated independence declaration before this work assignment or sign-off.');
  if(basis)basis.declaration={id:declaration.id,version:declaration.version};
 }
 return {id,role:person.role,basis};
}
function list(raw,fallback,label){
 if(raw===undefined)return fallback;
 let rows;try{rows=JSON.parse(raw);}catch{fail('Invalid '+label+' selection.',400);}
 if(!Array.isArray(rows)||rows.length>20||rows.some(x=>typeof x!=='string'||!x||x.length>80)||new Set(rows).size!==rows.length)fail('Choose up to 20 distinct '+label+'.',400);
 return rows;
}
export function assignWork(m,paper,data,files){
 const reason=text(data.reason,'assignment reason');
 if(data.expectedAssignmentRevision!==undefined&&String(paper.assignmentRevision??0)!==String(data.expectedAssignmentRevision))fail('The assignment changed. Refresh its exact revision before transferring.');
 const start=paper.start||paper.due,end=paper.due||paper.start;
 const owner=assignmentPerson(m,text(data.owner,'lead preparer'),files,start,end),reviewer=assignmentPerson(m,text(data.reviewer,'lead reviewer'),files,start,end);
 const v2=paper.assignmentContractVersion===2||String(data.owner).startsWith('U-')||data.contributors!==undefined||data.reviewers!==undefined;
 const contributors=[...new Set([owner.id,...list(data.contributors,v2?(paper.contributors??[]).filter(id=>id!==paper.owner):[],'contributors').map(id=>assignmentPerson(m,id,files,start,end).id)])].sort();
 const reviewPeople=[reviewer,...list(data.reviewers,v2?(paper.reviewers??[]).filter(id=>id!==paper.reviewer):[],'reviewers').map(id=>assignmentPerson(m,id,files,start,end))];
 const reviewers=[...new Set(reviewPeople.map(p=>p.id))].sort();
 if(owner.id===reviewer.id||reviewers.some(id=>contributors.includes(id)||paper.preparationAuthors?.includes(id)||paper.submittedBy===id))fail('A preparer or substantive author cannot review the same work.');
 if(v2&&reviewPeople.some(p=>p.role==='preparer'))fail('Assign an eligible reviewer capacity for independent review.');
 if(paper.owner===owner.id&&paper.reviewer===reviewer.id&&(!v2||paper.assignmentContractVersion===2&&JSON.stringify(paper.contributors)===JSON.stringify(contributors)&&JSON.stringify(paper.reviewers)===JSON.stringify(reviewers)))return false;
 const previous={owner:paper.owner,reviewer:paper.reviewer,contributors:paper.contributors??[paper.owner],reviewers:paper.reviewers??[paper.reviewer]};
 reassign(m,paper.id,owner.id,reviewer.id);
 paper.assignmentRevision=(paper.assignmentRevision??0)+1;
 if(v2){paper.assignmentContractVersion=2;paper.contributors=contributors;paper.reviewers=reviewers;paper.handoff={revision:paper.assignmentRevision,pending:[...new Set([...contributors,...reviewers])],by:m.person,at:new Date().toISOString(),reason};}
 if(previous.owner!==paper.owner)for(const request of m.requests.filter(r=>r.form===paper.form&&r.owner===previous.owner&&r.status!=='complete'&&r.dispatch!=='cancelled')){
  request.owner=paper.owner;request.history.push(`${new Date().toISOString()} - ${previous.owner} -> ${paper.owner} - ${reason}`);
 }
 ((m.pilotWorkAssignments??={})[paper.form]??=[]).unshift({revision:paper.assignmentRevision,contractVersion:v2?2:1,at:new Date().toISOString(),by:m.person,reason,previous,owner:paper.owner,reviewer:paper.reviewer,
  ...(v2&&{contributors,reviewers}),ownerBasis:owner.basis,reviewBasis:reviewer.basis});
 recordEvent(m,paper.form+' - assigned named leads and work scope',paper.form);
 return true;
}
export function acknowledgeHandoff(m,paper,data){
 if(!paper.handoff||String(data.assignmentRevision)!==String(paper.assignmentRevision)||paper.handoff.revision!==paper.assignmentRevision)fail('Acknowledge the exact current assignment revision.');
 if(![...(paper.contributors??[]),...(paper.reviewers??[])].includes(m.person))fail('Only the current named recipient can acknowledge the handoff.',403);
 if(!paper.handoff.pending.includes(m.person))return false;
 paper.handoff.pending=paper.handoff.pending.filter(id=>id!==m.person);
 ((m.pilotHandoffAcknowledgements??={})[paper.form]??=[]).push({revision:paper.assignmentRevision,by:m.person,at:new Date().toISOString(),reason:text(data.reason,'handoff acknowledgement')});
 recordEvent(m,paper.form+' - acknowledged exact assignment and outstanding work',paper.form);return true;
}
export function requireAcknowledgement(m,paper){if(paper.assignmentContractVersion===2&&paper.handoff?.pending.includes(m.person))fail('Acknowledge the current handoff and outstanding notes before this sign-off.');}
