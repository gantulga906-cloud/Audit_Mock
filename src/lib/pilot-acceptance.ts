import type {PilotRole} from './pilot-registers';

export const acceptanceChecks = [
 ['integrity','Удирдлагын шударга байдал, эрсдэл','A01-P2-W1'],
 ['resources','Ур чадвар, хугацаа ба бодит нөөц','A01-P2-W2'],
 ['firmTenure','Фирмийн ажилласан хугацаа ба буцаж ажиллах хориг','A01-P2-W3'],
 ['partnerTenure','Партнерын хугацаа, холбогдох шаардлага','G01 / D21–D22'],
 ['otherServices','Ижил жилийн татвар, нягтлан бодох болон бусад үйлчилгээ','A01-P2-W4 / A02-P1-W2'],
 ['predecessor','Өмнөх аудитор ба сөрөг мэдээлэл','A01-P2-W5'],
 ['preconditions','Тайлагналын хүрээ, удирдлагын үүрэг, мэдээлэлд хандах эрх, хязгаарлалт','A03-P1-W1–W3'],
] as const;
export type AcceptanceCheck = {result:'unknown'|'supported'|'adverse'|'na';basis:string;evidence:string;owner:string;due:string;followup:string};
export type AcceptanceAssessment = {version:number;scope:string;status:'draft'|'submitted'|'returned'|'reviewed';kind:'initial'|'continuance';
 byPerson?:{name:string;reference:string};reviewedPerson?:{name:string;reference:string};
 by:PilotRole;at:string;checks:Record<string,AcceptanceCheck>;requirement:string;edition:string;ruleEvidence:string;
 recommendation?:'accept'|'defer'|'decline';reviewedBy?:PilotRole;reviewedAt?:string;reviewReason?:string;basis?:string;
 history:{status:string;by:PilotRole;at:string;reason:string;version:number}[]};
export type AcceptanceDecision = {version:number;outcome:'accept'|'continue'|'defer'|'decline'|'conditional';by:PilotRole;at:string;
 setupAuthorized:boolean;
 person:{id:string;name:string;reference:string;version:number};authority:string;authorityEvidence:string;rationale:string;
 validThrough:string;assessmentVersion?:number;termsVersion?:number;basis:string;condition?:{text:string;owner:string;due:string;effect:string}};
export type TermsProposal = {version:number;status:'draft'|'returned'|'reviewed';by:PilotRole;at:string;scope:string;framework:string;
 templateReference:string;auditorResponsibilities:string;managementResponsibilities:string;deliverable:string;timetable:string;fees:string;
 treatment:'new'|'revised'|'unchanged';treatmentBasis:string;assuranceChange:'same'|'lower';justification:string;
 reviewedBy?:PilotRole;reviewedAt?:string;reviewReason?:string;sent?:{by:PilotRole;at:string;reference:string}[]};
export type AcceptanceView = {profile:1;framework:string;assessment?:AcceptanceAssessment;assessments:AcceptanceAssessment[];decisions:AcceptanceDecision[];
 proposal?:TermsProposal;proposals:TermsProposal[];current:boolean;gaps:string[];people:{id:string;name:string;reference:string;account?:string;status:string}[]};
