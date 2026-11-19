export type AuditScalar={state:'known';type:'text'|'boolean'|'decimal'|'date';value:string|boolean}|{state:'unknown'|'not-applicable';reason:string};
export type AuditFieldValue={fieldId:string;source:string;value:AuditScalar}|{fieldId:string;source:string;rows:{rowId:string;values:Record<string,AuditScalar>}[]};
export type AuditAnswerContract={schemaVersion:1;templateDigest:string;fields:AuditFieldValue[]};

export function auditScalar(type:string,raw:unknown,options:{yes?:string;no?:string;unknown?:string;na?:string;reason?:string;draft?:boolean}={}):AuditScalar{
 if(raw===undefined||raw===null||raw==='')return {state:'unknown',reason:options.reason||'Not answered'};
 if(type==='yesno'){
  if(raw===false||raw===options.no)return {state:'known',type:'boolean',value:false};
  if(raw===true||raw===options.yes)return {state:'known',type:'boolean',value:true};
  if(raw===options.unknown)return {state:'unknown',reason:options.reason||'Explicitly unknown'};
  if(raw===options.na){if(!options.reason?.trim()&&!options.draft)throw Error('N/A requires a recorded reason');return {state:'not-applicable',reason:options.reason||''};}
  throw Error('Unrecognized boolean answer');
 }
 if(type==='number'){
  if(typeof raw!=='string'||!(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/).test(raw))throw Error('An exact decimal string is required');
  return {state:'known',type:'decimal',value:raw};
 }
 if(typeof raw!=='string')throw Error('A textual or date answer must remain a string');
 if(type==='date'&&(!/^\d{4}-\d{2}-\d{2}$/.test(raw)||!Number.isFinite(Date.parse(raw+'T00:00:00Z'))||new Date(raw+'T00:00:00Z').toISOString().slice(0,10)!==raw))throw Error('A real calendar date is required');
 return {state:'known',type:type==='date'?'date':'text',value:raw};
}
