import definitions from '../data/g10-area-cards.json' with {type:'json'};
export const areaCards=definitions;
export type AreaCardDefinition=typeof areaCards[number];
export type AreaCardInput={key:string;evidence:string;locator:string;work:string};
export type AreaCardJudgment={key:string;result:'supported'|'exception'|'unavailable'|'not-applicable';work:string;evidence:string;reason:string};
export type AreaCardMatter={key:string;title:string;kind:'monetary'|'qualitative'|'limitation';difference:string;evidence:string;reason:string;owner:string;existingFinding?:string};
export type AreaCardPacket={version:number;status:'draft'|'submitted'|'returned'|'reviewed';by:string;at:string;definition:AreaCardDefinition;basis:string;mode:'manual'|'calculated';method:string;edition:string;methodEvidence:string;methodWork:string;procedures:string[];inputs:AreaCardInput[];judgments:AreaCardJudgment[];matters:AreaCardMatter[];sources:{id:string;version:number;sha256:string}[];contentDigest:string;current:boolean;review?:{by:string;at:string;result:string;reason:string;digest:string};returned?:{by:string;at:string;reason:string};history:AreaCardPacket[]};
export const areaJudgments=(d:AreaCardDefinition)=>[
 {key:'performed',label:d.preparer},
 {key:'challenged',label:d.reviewer},
 {key:'boundary',label:d.limit},
 {key:'contradictions',label:'Contradictory evidence, classification/disclosure implications and additional work: state what was found, who owns the next action and the effect on the conclusion.'},
];
