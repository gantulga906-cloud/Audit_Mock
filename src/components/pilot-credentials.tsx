'use client';
import {useState,type FormEvent} from 'react';
import type {PilotAction} from './pilot-registers';
import type {RosterAvailability} from '@/lib/pilot-staffing';
import {DataAction} from './pilot-population';
export type CredentialDocument={id:string;person:string;name:string;sha256:string;status:string;by:string;at:string;inspection?:{by:string;at:string;reason:string}};
export function CredentialDesk({documents,roster,actor,run}:{documents:CredentialDocument[];roster:RosterAvailability[];actor:string;run:PilotAction}){
 const [error,setError]=useState('');
 async function upload(event:FormEvent<HTMLFormElement>){event.preventDefault();setError('');const f=new FormData(event.currentTarget),file=f.get('file');if(!(file instanceof File)||!file.size)return;
  try{const base64=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(Error('The qualification file could not be read.'));reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(file);});await run('credential-document-upload',{person:String(f.get('person')),source:String(f.get('source')),reason:String(f.get('reason')),name:file.name,base64});}catch(e){setError(e instanceof Error?e.message:'File upload failed.');}
 }
 return <section className="card pad bench-card" data-credential-desk><h2>Credential facts and qualification files</h2><p>Record issuer, credential ID, expiry and practice scope in the credential register. File inspection and an actual issuer/source check are separate evidence states.</p><form className="feature-form" onSubmit={event=>void upload(event)}><label>Person<select name="person" required><option value="">Choose person</option>{roster.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label><label>Qualification file<input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg" required/></label><label>Source / issuer reference<textarea name="source" required/></label><label>Upload basis<textarea name="reason" required/></label><button className="btn secondary">Preserve qualification original</button></form>{error&&<p role="alert">{error}</p>}
  {documents.map(d=><details key={d.id}><summary>{roster.find(p=>p.id===d.person)?.name} · {d.name} · {d.status}</summary><a href={'/api/pilot/credential-document/'+d.id+'?engagement=firm'}>Open exact qualification file</a><p className="micro">{d.sha256}</p>{d.inspection&&<p>{d.inspection.at} · {d.inspection.reason}</p>}{d.status==='received'&&d.by!==actor&&<DataAction action="credential-document-inspect" extra={{id:d.id}} run={run} button="Record independent file inspection"><label>File result<select name="result"><option value="accepted">File supports the recorded facts</option><option value="rejected">File does not support the recorded facts</option></select></label><label>Actual inspection and limitations<textarea name="reason" required/></label></DataAction>}</details>)}
 </section>;
}
