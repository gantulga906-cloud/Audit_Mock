import type {ProgrammeBasis,PilotRole} from './pilot-registers';
export type EffortEntry={id:string;person:string;by:PilotRole;assignment?:{id:string;version:number};from:string;through:string;minutes:number;work:string;purpose:string;supersedes?:string;correction?:string;at:string;current:boolean};
export type PlanningView={managed:boolean;effort:EffortEntry[];programmes:{form:string;gap:string;risks:{id:string;name:string;version:number;status:string;type:string}[];responses:NonNullable<ProgrammeBasis['responses']>}[]};
