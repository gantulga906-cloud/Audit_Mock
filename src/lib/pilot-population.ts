import type {PilotRole} from './pilot-registers.ts';

export type PopulationRow={
 row:number;id:string;account:string;entity:string;date:string;currency:string;rawAmount:string;cents:number|null;
 journal?:string;entryType?:string;reference?:string;
 issues:string[];state:'accepted'|'quarantined'|'excluded';reason?:string;
};
export type PopulationControls={count:number;cents:number;source:string;mapping:string;statements:string;exclusions:string;use:string;
 evidence:{id:string;version:number;sha256:string}};
export type PopulationBridge={line:string;accounts:string[];computed:number;reported:number|null;difference:number|null};
export type PopulationRevision={
 version:number;name:string;source:string;evidence:string;sha256:string;currency:string;
 importedBy:PilotRole;at:string;rows:PopulationRow[];issues:string[];
 counts:{read:number;accepted:number;quarantined:number;excluded:number;invalidAmounts:number};
 readCents:number;readTotals:Record<string,number>;acceptedCents:number;controls?:PopulationControls;bridge:PopulationBridge[];gaps:string[];
 preparedBy:PilotRole;approval?:{by:PilotRole;at:string;reason:string};
};
export type PopulationView={current:PopulationRevision;usable:boolean;history:Omit<PopulationRevision,'rows'>[]};

export type SampleUnit={id:string;row:number;account:string;date:string;cents:number};
export type SampleTest={unit:string;row:number;result:'pass'|'exception';detail:string;cents:number;
 evidence:string;evidenceVersion:number;by:PilotRole;at:string;finding?:string};
export type SampleDesignVersion={version:number;form:string;size:number;seed:number;purpose:string;method:string;stamp:string;
 basis:{population:number;source:string;sha256:string;line:string;materiality:number;performance:number;controls:number;level:string;
  controlEvidence:[string,number][];decision?:[string,number];owner:string;reviewer:string};
 preparedBy:PilotRole;at:string;approval?:{by:PilotRole;at:string;reason:string};selected?:SampleUnit[];tests:SampleTest[]};
export type SampleView=SampleDesignVersion&{current:boolean;history:SampleDesignVersion[]};

export type JournalReview={result:'explained'|'finding'|'incomplete';purpose:string;authority:string;accounting:string;
 evidence:string;evidenceVersion:number;cents:number;by:PilotRole;at:string;finding?:string};
export type JournalCase={id:string;criteria:string[];postings:SampleUnit[];investigations:JournalReview[]};
type JournalBasis={version:number;form:string;population:number;source:string;sha256:string;method:string;stamp:string;
 threshold:number;days:number;at:string;by:PilotRole;approval?:{by:PilotRole;at:string;reason:string;investigationStamp:string}};
export type JournalRun=JournalBasis&{cases:JournalCase[];current:boolean;history:(JournalBasis&{count:number})[]};
