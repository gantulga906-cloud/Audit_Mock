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
