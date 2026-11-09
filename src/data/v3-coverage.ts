// Targeted proof overlay. Leave other source dispositions at their prior depth.
export const V3_EVIDENCE:Record<string,{currentIteration:string;currentStatus:string;implementationEvidence:string;verificationLimit:string}>=Object.fromEntries([
 ['P10-UC08-AC01','reporting · package content comparison and stale authorization','revised report and statement content invalidate authorization and retain the issued payload'],
 ['P10-UC08-AC03','reporting · retained package and approval actor','revised report and statement content invalidate authorization and retain the issued payload'],
 ['P02-UC04-AC02','journey / decisions · activation checks','acceptance dependency permits draft but blocks submission while pending'],
 ['P11-UC04-AC02','journey · package-specific formal EQR separated from ordinary review','quality access is distinct and required EQR must match the current package'],
 ['AUTO-047','sampling · population, 1.3 and 2.6 bind design review','selection rejects stale or missing upstream reviews even when design and dataset are unchanged'],
 ['3.3.1','sampling · 1.3 and 2.6 show exact upstream blockers','selection rejects stale or missing upstream reviews even when design and dataset are unchanged'],
 ['3.1.2','journey · request parts, test results and review feed findings','fixed-asset intake, rejection, replacement, sample exception, return, issue and custody'],
].map(([id,action,test])=>[id,{currentIteration:'workspace-v3',currentStatus:'Verified local scenario / partial source coverage',implementationEvidence:action+' · '+test,verificationLimit:'Selected rule/scenario in tests/workspace.test.mjs or tests/journey.test.mjs; not full source or production acceptance.'}]));

export const V5_EVIDENCE:typeof V3_EVIDENCE=Object.fromEntries([
 ['M03-F01','Register a company, legal form, registration number and named contact in the client directory.'],
 ['M03-F05','Record a client relationship status. Suspended and former clients cannot start a new engagement.'],
 ['M03-F06','View and open accessible engagements by client and reporting period.'],
 ['M03-F08','Copy the current client record and contacts into a new engagement after explicitly selecting the client.'],
 ['M05-F01','Create a pending engagement and activate it after partner decisions on acceptance, independence and terms.'],
 ['M05-F02','Record exact reporting dates, target date and client details; initialize the five-stage workpaper index.'],
 ['M05-F06','Assign the preparer, senior reviewer, partner and optional quality reviewer from demo personas.'],
 ['M05-F10','Link a prior period and reuse client context. Workpaper answers, approvals and evidence start blank.'],
 ['M06-F08','Register a risk, assertion, significance and response in an engagement programme.'],
 ['M06-F09','Link a recorded risk to a procedure and its source workpaper.'],
 ['M07-F02','Add or adapt a procedure with a rationale and a risk or assertion link; a senior can mark a procedure inapplicable.'],
 ['M07-F11','Record work performed and a result for each new or adapted procedure.'],
 ['M07-F13','Tailoring preserves the previous structure and answers and requires a fresh review of the revised workpaper.'],
 ['M08-F05','Draft and record issuance, track requested parts, log follow-up and link the exact versions received.'],
 ['M08-F08','Assess request parts individually with a rejection reason and retain superseded evidence.'],
 ['CC03','Show the assigned request, its deadline and next action to the owner. Follow-up is logged locally.'],
].map(([id,evidence])=>[id,{currentIteration:'workspace-v5',currentStatus:'Connected local workflow / partial source coverage',implementationEvidence:evidence,verificationLimit:'See implementation-v5.md and tests/feature-workflows.test.mjs for exercised scenarios and remaining scope.'}]));
