export const benchmarkMeasures = [
  ['profit-before-tax', 'Татварын өмнөх ашиг'],
  ['revenue', 'Нийт орлого'],
  ['total-assets', 'Нийт хөрөнгө'],
  ['net-assets', 'Цэвэр хөрөнгө'],
  ['other', 'Бусад'],
] as const;

export type ThresholdDecision={mode:'calculated'|'override';amount?:number;rationale:string};
export type MaterialitySelection={version:1;selected:string;stage:'planning'|'final';
 candidates:{measure:string;name:string;amount:number;priorAmount?:number;percentage:number;rationale:string}[];
 overall:ThresholdDecision;performance:ThresholdDecision&{percentage:number};trivial:ThresholdDecision&{percentage:number};
 priorOverall?:{amount:number;reference:string};qualitative:{circumstances:string;reporting:string;disclosures:string};
};
export type SpecificSelection={percentage:number;performancePercentage:number;amountMode:'calculated'|'override';performanceMode:'calculated'|'override';amountRationale:string;performanceRationale:string};
export type SpecificMateriality = {form:string;scope:string;amount:number;performance:number;rationale:string;selection?:SpecificSelection};
export type MaterialityAmounts = {overall:number;performance:number;trivial:number;specific?:SpecificMateriality[]};
export type MaterialityBasis = {
  users:string;
  benchmarkMeasure:typeof benchmarkMeasures[number][0];
  benchmarkOther:string;
  alternatives:string;
  benchmarkRationale:string;
  comparison:'prior-period'|'unavailable';
  priorAmount?:number;
  priorReference:string;
  comparisonRationale:string;
  unusualResults:string;
  stability:'stable'|'adjusted'|'alternative';
  stabilityRationale:string;
  evidence:{id:string;version:number;name:string;sha256:string};
  specificDecision:'required'|'not-required';
  specificReason:string;
  specific:SpecificMateriality[];
  revisionReason:string;
  selection?:MaterialitySelection;
};

export const materialityBasisKey='pilot.materiality.basis';
export const moneyRound=(value:number)=>Math.round((value+Number.EPSILON)*100)/100;
export function selectedMateriality(selection:MaterialitySelection){
 const candidate=selection.candidates.find(row=>row.measure===selection.selected);
 if(!candidate)return null;
 const candidateAmount=moneyRound(candidate.amount*candidate.percentage/100);
 const overall=selection.overall.mode==='override'?selection.overall.amount!:candidateAmount;
 const performanceCandidate=moneyRound(overall*selection.performance.percentage/100);
 const trivialCandidate=moneyRound(overall*selection.trivial.percentage/100);
 const performance=selection.performance.mode==='override'?selection.performance.amount!:performanceCandidate;
 const trivial=selection.trivial.mode==='override'?selection.trivial.amount!:trivialCandidate;
 if(![candidateAmount,overall,performance,trivial].every(v=>Number.isFinite(v)&&Number.isSafeInteger(Math.round(v*100)))||overall<=0||performance<=0||performance>=overall||trivial<0||trivial>performance)return null;
 return {overall,performance,trivial};
}

export function materialitySourceAnswers(basis:MaterialityBasis,previous:Record<string,string>={}){
 const s=basis.selection,totals=s&&selectedMateriality(s);if(!s||!totals)return {};
 const rows:Record<string,string>={};
 for(const [measure,key] of [['profit-before-tax','r17'],['revenue','r18'],['total-assets','r19'],['net-assets','r20'],['other','r21']]){
  const c=s.candidates.find(row=>row.measure===measure);
  rows[key]=c?`${c.name}; Тайлант ${c.amount}; Өмнөх ${c.priorAmount??'мэдээлэлгүй'}; ${c.percentage}%; Боломжит ${moneyRound(c.amount*c.percentage/100)}; ${c.rationale}`:'Энэ үзүүлэлтийг сонгосон жишигт ашиглаагүй. '+basis.alternatives;
 }
 return {...rows,r26:s.priorOverall?`${s.priorOverall.amount}; ${s.priorOverall.reference}`:'Өмнөх баталсан босгын дүн мэдээлэлгүй. '+basis.comparisonRationale,
  r27:s.stage==='planning'?`${totals.overall}; ${s.overall.rationale}`:previous['field.r27']??'Төлөвлөлтийн баталсан босгыг хувилбарын түүхээс үзнэ үү.',
  r28:s.stage==='final'?`${totals.overall}; ${s.overall.rationale}; ${basis.revisionReason}`:'Эцсийн өөрчлөлтийн шийдвэр хараахан бүртгээгүй.',
  r34:s.qualitative.circumstances,r35:s.qualitative.reporting,r36:s.qualitative.disclosures,
  r45:`${totals.performance}; ${s.performance.percentage}%; ${s.performance.mode}; ${s.performance.rationale}`,
  r58:`${totals.trivial}; ${s.trivial.percentage}%; ${s.trivial.mode}; ${s.trivial.rationale}`,
  r61:basis.revisionReason||'Анхны сонгосон босго ба үндэслэлийг хяналтад илгээнэ.'};
}
