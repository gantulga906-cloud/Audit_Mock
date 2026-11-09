import type {PilotRole} from './pilot-registers';

export type StaffCapacity=PilotRole|'specialist';
export type StaffSeat={
 id:string;version:number;capacity:StaffCapacity;person:string;name:string;rosterVersion:number;account?:PilotRole;
 start:string;end:string;hours:number;credential:{id:string;version:number;title:string;source:string;validTo:string};
 appointment?:{id:string;version:number;title:string};approvedBy:PilotRole;approvedAt:string;
 deliverable?:string;supervisor?:PilotRole;current:boolean;
};
export type StaffingView={
 managed:boolean;members:PilotRole[];seats:StaffSeat[];gaps:string[];
 accepted?:StaffSeat[];
};
export type RosterAvailability={
 id:string;name:string;version:number;status:'active'|'inactive'|'external';account?:PilotRole;start:string;end:string;capacity:number|null;
 committed:number;assignments:{engagement:string;client:string;start:string;end:string;hours:number;capacity:StaffCapacity}[];
 credentials:{id:string;title:string;source:string;issuer:string;from:string;to:string;validity:string;current:boolean}[];
};
export type WorkAssignment={
 at:string;by:string;reason:string;previous:{owner:string;reviewer:string};owner:string;reviewer:string;
 ownerBasis?:StaffSeat;reviewBasis?:StaffSeat;
};
export type StaffSignoff={action:'submit'|'review';at:string;version:number;seat:StaffSeat};
