export type AssemblyView={
 enabled:boolean;current:boolean;issueAt?:string;authorizationAt?:string;reportSha256?:string;inventoryDigest?:string;
 gaps:string[];items:{kind:string;id:string;label:string;version?:number;sha256?:string}[];
 latest?:{id:string;version:number;status:string;by?:string;at?:string;reason?:string;values:Record<string,string>;basis?:{deadline:string}};
};
