import type { Client, Contact, Period } from './workbench';
import type { PilotRole } from './pilot-registers';

export type Relationship='prospect'|'pending'|'active'|'suspended'|'former'|'rejected';
export type ClientContact=Contact&{source:string;effective:string;ended?:string};
export const currentClientContact=(c:ClientContact,today:string)=>(!c.effective||c.effective<=today)&&(!c.ended||c.ended>today);
export type ClientProfile=Omit<Client,'contacts'>&{contacts:ClientContact[];industry:string};
export type ClientEvent={by:PilotRole;at:string;note:string;version:number;before?:ClientProfile;previousStatus?:Relationship};
export type IntakeClient={
 id:string;version:number;owner:PilotRole;status:Relationship;profile:ClientProfile;history:ClientEvent[];
 periods:(Period&{id:string;active:boolean;partner:PilotRole})[];
};
export type EnquiryStatus='draft'|'forwarded'|'returned'|'declined'|'converted';
export type Enquiry={
 id:string;owner:PilotRole;status:EnquiryStatus;clientId:string;company:string;contact:string;email:string;
 origin:'client'|'firm';service:string;start:string;end:string;framework:string;facts:string;
 history:{by:PilotRole;at:string;status:EnquiryStatus;note:string;item?:string;before?:Omit<Enquiry,'history'>}[];
 engagement?:string;
};
export type IntakeConfirmation={
 enquiry:string;client:string;version:number;confirmation:number;contact:string;by:PilotRole;at:string;note:string;prior?:string;
};
export type IntakeContext=IntakeConfirmation&{currentVersion?:number;contacts:ClientContact[];history:IntakeConfirmation[]};
export type IntakeTerms={
 version:number;status:'draft'|'approved';evidence:string;sha256:string;reference:string;signatory:string;signedOn:string;
 scope:string;clientVersion:number;confirmation:number;start:string;end:string;by:PilotRole;at:string;
 approvedBy?:PilotRole;approvedAt?:string;approvalBasis?:string;
};
