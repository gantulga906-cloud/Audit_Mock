import type { Field, Template } from './workbench';

export const formKinds:Record<string,string>={
 text:'Богино текст',textarea:'Дэлгэрэнгүй текст',yesno:'Тийм / Үгүй',select:'Нэг сонголт',multiselect:'Олон сонголт',
 date:'Огноо',number:'Тоо / Дүн',evidence:'Нотлох баримт',table:'Давтагдах мөр',procedure:'Аудитын горим',
};
export const yesNo=['Тийм','Үгүй','Тодорхойгүй','Хамаарахгүй'];
export const sharedBindings:Record<NonNullable<Field['binding']>,string>={
 name:'Байгууллагын нэр',legalForm:'Хуулийн хэлбэр',registration:'Бүртгэлийн дугаар',period:'Тайлант үе',contacts:'Удирдлага ба холбоо барих хүмүүс',
 framework:'Тайлагналын хүрээ',industry:'Салбар',
};
export const fieldPrefix='field.';
export const procedureOutcomes=(f:Field)=>f.options?.filter(o=>o.startsWith('Горимын үр дүн:'))??[];
export const fieldAnswers=(values:Record<string,string>)=>Object.fromEntries(Object.entries(values)
 .filter(([k])=>k.startsWith(fieldPrefix)).map(([k,v])=>[k.slice(fieldPrefix.length),v]));
export type FormVersion={digest:string;number:number;author:string;publisher:string;at:string;note:string};
export type FormDraft={body:Template;by:string;submitted:boolean;note:string};
export type FormLibrary={
 grants:Record<string,string[]>;
 drafts:Record<string,FormDraft>;
 releases:Record<string,FormVersion[]>;
};
export type PublishedForm=FormVersion&{id:string;title:string};
export type LibraryView={editable:string[];grants:FormLibrary['grants'];drafts:FormDraft[];releases:PublishedForm[]};
export type PaperForm={digest:string;number:number;body:Template;shared:Record<NonNullable<Field['binding']>,string>;linked:Record<string,string>;owned?:Record<string,string>};
export type FormAdoptionPreview={form:string;digest:string;from:{digest:string;number:number}|null;to:{digest:string;number:number;title:string};workVersion?:number;
 sameVersion:boolean;retainedAnswers:number;requiresReview:boolean;reopensReview:boolean;
 changes:{key:string;label:string;change:'added'|'changed'|'removed';source?:string}[];
 losses:{key:string;label:string;value:string;displayValue?:string;reason:string;row?:string;rowLabel?:string;column?:string;columnLabel?:string}[];
 detachedEvidence:{id:string;name:string}[];
};
