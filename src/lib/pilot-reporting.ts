import type {PilotRecord} from './pilot-registers';
export type ReportingView={enabled:boolean;gaps?:string[];opinion?:PilotRecord;preparation?:PilotRecord;sections?:PilotRecord[];recipients?:{id:string;name:string;email:string;capacity:string}[];issues?:{at:string;by:string;reference:string;reportSha256:string;packageSha256:string}[]};
