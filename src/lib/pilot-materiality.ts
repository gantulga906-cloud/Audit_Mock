export const benchmarkMeasures = [
  ['profit-before-tax', 'Татварын өмнөх ашиг'],
  ['revenue', 'Нийт орлого'],
  ['total-assets', 'Нийт хөрөнгө'],
  ['net-assets', 'Цэвэр хөрөнгө'],
  ['other', 'Бусад'],
] as const;

export type SpecificMateriality = {form:string;scope:string;amount:number;performance:number;rationale:string};
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
};
