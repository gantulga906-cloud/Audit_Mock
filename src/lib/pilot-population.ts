import type {PilotRole} from './pilot-registers.ts';

export const populationRequiredFields = ['id','account','amount','entity','date','currency'];
export const populationOptionalFields = ['journal','entry_type','reference'];
export type PopulationExtractSpec={system:string;start:string;end:string;fields:string[]};
type PopulationExtract=PopulationExtractSpec&{request:string;part:string;fileVersion:number;contact:string;contactEmail:string};
export type PopulationRow={
 row:number;id:string;account:string;entity:string;date:string;currency:string;rawAmount:string;cents:number|null;
 journal?:string;entryType?:string;reference?:string;
 issues:string[];state:'accepted'|'quarantined'|'excluded';reason?:string;
};
export type PopulationControls={count:number;cents:number;source:string;mapping:string;statements:string;exclusions:string;use:string;investigation?:string;
 certifiedCount?:number;sourceTotals?:Record<string,number>;methods?:{id:string;version:number}[];
 evidence:{id:string;version:number;sha256:string}};
export type PopulationBridge={line:string;accounts:string[];computed:number;reported:number|null;difference:number|null};
export type PopulationRevision={
 version:number;name:string;source:string;evidence:string;evidenceVersion?:number;sha256:string;currency:string;
 extract?:PopulationExtract;
 profile?:{id:string;version:number;definition:Record<string,unknown>};
 importedBy:PilotRole;at:string;rows:PopulationRow[];issues:string[];
 counts:{read:number;accepted:number;quarantined:number;excluded:number;invalidAmounts:number};
 readCents:number;readTotals:Record<string,number>;acceptedCents:number;controls?:PopulationControls;bridge:PopulationBridge[];gaps:string[];
 preparedBy:PilotRole;approval?:{by:PilotRole;at:string;reason:string};
};
export type PopulationView={current:PopulationRevision;usable:boolean;extractCurrent?:boolean;history:Omit<PopulationRevision,'rows'>[]};

export type SampleUnit={id:string;row:number;account:string;date:string;cents:number;group?:string};
export type SampleTest={unit:string;row:number;result:'pass'|'exception'|'unavailable'|'alternative';detail:string;cents:number;book?:number;audited?:number;signedDifference?:number|null;cause?:string;followup?:string;nextOwner?:string;
 evidence:string;evidenceVersion:number;by:PilotRole;at:string;finding?:string};
export type SampleDesignVersion={version:number;form:string;size:number;seed:number;purpose:string;method:string;stamp:string;
 basis:{population:number;source:string;sha256:string;line:string;materiality:number;performance:number;controls:number;level:string;
  specificMateriality?:{scope:string;amount:number};
  controlEvidence:[string,number][];decision?:[string,number];owner:string;reviewer:string};
 preparedBy:PilotRole;at:string;approval?:{by:PilotRole;at:string;reason:string};selected?:SampleUnit[];tests:SampleTest[];
 groups?:{specific:string[];excluded:string[];residual:string[];specificBasis:string;exclusionBasis:string};unit?:string;objective?:string;assumptions?:string;orderedKeysHash?:string;populationCents?:number;groupTotals?:Record<string,number>;expansion?:{from:number;reason:string};
 convention?:{method:string;reason:string;by:string;evidence:string};resultReview?:{evaluation:number;disposition:string;reason:string;by:string;followup?:string};resultCurrent?:boolean;
 evaluations?:{version:number;status:string;reasons?:string[];denominator?:number;population?:number;factual?:number;total?:number;incremental?:number;specific?:number;qualitative:string;additionalWork:string;samplingRisk?:string}[]};
export type SampleView=SampleDesignVersion&{current:boolean;resultCurrent?:boolean;history:SampleDesignVersion[]};

export type JournalReview={result:'explained'|'finding'|'incomplete';purpose:string;authority:string;accounting:string;
 evidence:string;evidenceVersion:number;cents:number;by:PilotRole;at:string;finding?:string};
export type JournalCase={id:string;criteria:string[];postings:SampleUnit[];investigations:JournalReview[];grossDebit?:number;grossCredit?:number;net?:number;duplicates?:string[]};
type JournalBasis={version:number;form:string;population:number;source:string;sha256:string;method:string;stamp:string;
 threshold:number;days:number;at:string;by:PilotRole;approval?:{by:PilotRole;at:string;reason:string;investigationStamp:string}};
export type JournalRun=JournalBasis&{cases:JournalCase[];current:boolean;history:(JournalBasis&{count:number})[]};
