export class PilotRequestError extends Error {
 readonly status:number;
 constructor(message:string,status:number){super(message);this.name='PilotRequestError';this.status=status;}
}

export async function readPilotResponse<T>(response:Response):Promise<T>{
 let result;
 try{result=await response.json();}
 catch{throw Error('Ажлын орчны сервертэй холбогдож чадсангүй. Холболтоо шалгаад дахин оролдоно уу.');}
 if(!response.ok)throw new PilotRequestError(typeof result?.error==='string'?result.error:'Хүсэлтийг гүйцэтгэж чадсангүй.',response.status);
 return result as T;
}
