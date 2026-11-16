import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {randomUUID} from 'node:crypto';
import {mkdtemp,mkdir,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {DatabaseSync,backup} from 'node:sqlite';
import {createPilot} from '../scripts/pilot-server.mjs';

const credentials={preparer:'AdoptionPreparer2026!',reviewer:'AdoptionReviewer2026!',partner:'AdoptionPartner2026!'};
async function start(database){
 const pilot=createPilot({database,setupCode:'adoption-bootstrap'}),server=createServer((req,res)=>void pilot.handle(req,res,new URL(req.url,'http://127.0.0.1')));
 await new Promise((ok,bad)=>{server.once('error',bad);server.listen(0,'127.0.0.1',ok);});const origin='http://127.0.0.1:'+server.address().port;
 return {async fetch(path,cookie,body){return fetch(origin+'/api/pilot'+path,{method:body===undefined?'GET':'POST',headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});},async close(){await new Promise(ok=>server.close(ok));pilot.close();}};
}
async function fixture(service,setup=true){
 if(setup)assert.equal((await service.fetch('/setup','',{code:'adoption-bootstrap',...credentials})).status,201);
 const cookies={};for(const [role,password] of Object.entries(credentials)){const r=await service.fetch('/login','',{role,password});assert.equal(r.status,200);cookies[role]=r.headers.get('set-cookie').split(';')[0];}
 const view=async(role,id)=>{const r=await service.fetch('?engagement='+id,cookies[role]);assert.equal(r.status,200);return r.json();};
 const write=async(role,id,action,fields,status=200)=>{const r=await service.fetch('/action?engagement='+id,cookies[role],{action,fields,revision:(await view(role,id)).revision,idempotencyKey:randomUUID()});const data=await r.json();assert.equal(r.status,status,action+' '+data.error);return data;};
 const preview=async(id,form,version,role='reviewer',status=200)=>{const r=await service.fetch('/form-adoption-preview?engagement='+id+'&form='+form+'&version='+version,cookies[role]);assert.equal(r.status,status);return r.json();};
 const create=async()=>{const id=(await write('reviewer','firm','create',{client:'Form adoption fixture',legalForm:'ХХК',registration:'ADOPT-1',framework:'Synthetic',contact:'Finance',email:'finance@example.test',start:'2025-01-01',end:'2025-12-31',reportDate:'2026-12-01',synthetic:'yes'})).selected;await write('partner',id,'activate',{assessment:'Accepted',independence:'Reviewed',letter:'Agreed'});return id;};
 return {cookies,view,write,preview,create};
}

test('adoption preview preserves compatible table cells and pins explicit review of incompatible answers',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'audit-form-adoption-')),database=join(dir,'workspace.sqlite');let service=await start(database);
 try{
  let f=await fixture(service);const id=await f.create(),form='F-ADOPT001',rows=[{id:'row_one',values:{reference:'0007',amount:'0',old:'Legacy detail',choice:'A'}},{id:'row_two',values:{reference:'INV-08',amount:'-1.25',old:'Other detail',choice:'B'}}];
  const template={id:form,title:'Controlled migration schedule',stage:1,family:'custom',sheet:'Custom',fields:[
   {key:'switch',label:'Applicability',source:'J1',type:'select',options:['yes','no']},
   {key:'conditional',label:'Conditional narrative',source:'J2',type:'text',when:{key:'switch',value:'yes'}},
   {key:'proof',label:'Source evidence',source:'J3',type:'evidence'},
   {key:'rows',label:'Schedule',source:'J4',type:'table',columns:[{key:'reference',label:'Reference',type:'text'},{key:'amount',label:'Amount',type:'number'},{key:'old',label:'Old narrative',type:'text'},{key:'choice',label:'Choice',type:'select',options:['A','B']},{key:'attachment',label:'Supporting original',type:'evidence'}]},
  ]};
  const publish=async body=>{await f.write('reviewer','firm','template-save',{form,body:JSON.stringify(body),note:'Reconcile source changes'});await f.write('reviewer','firm','template-submit',{form,note:'Ready for independent publication'});return f.write('partner','firm','template-publish',{form,note:'Independently reviewed template edition'});};
  for(const damage of [columns=>columns.push(columns[0]),columns=>columns[0].type='table',columns=>columns[3].options=[],columns=>columns[0].options='invalid']){
    const invalid=structuredClone(template);damage(invalid.fields.find(field=>field.key==='rows').columns);
    await f.write('reviewer','firm','template-save',{form,body:JSON.stringify(invalid)},400);
  }
  await publish(template);let state=await f.write('reviewer',id,'form-use',{form,version:'1'});const paper=s=>s.papers.find(p=>p.form===form),firstDigest=paper(state).template.digest;
  state=await f.write('preparer',id,'support-upload',{source:'Controlled original',name:'adoption-source.csv',base64:Buffer.from('retained original').toString('base64')});const evidence=state.evidence.find(e=>e.name==='adoption-source.csv').id;await f.write('reviewer',id,'support-assess',{id:evidence,result:'accepted',reason:'Checked original bytes'});
  for(const row of rows)row.values.attachment=evidence;
  const answers={switch:'yes',conditional:'Keep the signed earlier explanation',proof:evidence,rows:JSON.stringify(rows)};
  const save=async values=>f.write('reviewer',id,'save',{form,answers:JSON.stringify(values),templateDigest:firstDigest});
  const forged=structuredClone(rows);forged[0].values.attachment='not-an-accepted-original';
  await f.write('reviewer',id,'save',{form,answers:JSON.stringify({...answers,rows:JSON.stringify(forged)}),templateDigest:firstDigest},400);
  assert.ok(paper(await save({...answers,proof:''})).evidence.includes(evidence));
  await save(answers);await f.write('reviewer',id,'submit',{form});state=await f.write('partner',id,'review',{form});const signed=paper(state);
  const target=structuredClone(template);target.fields=target.fields.filter(field=>field.key!=='proof');target.fields.find(field=>field.key==='conditional').when.value='no';const columns=target.fields.find(field=>field.key==='rows').columns;for(const key of ['old','attachment'])columns.splice(columns.findIndex(c=>c.key===key),1);columns.find(c=>c.key==='amount').type='text';columns.find(c=>c.key==='choice').options=['B'];
  await publish(target);const before=await f.view('reviewer',id),preview=await f.preview(id,form,'2');const after=await f.view('reviewer',id);
  assert.equal(after.revision,before.revision);assert.deepEqual(paper(after),paper(before));assert.equal(preview.requiresReview,true);assert.equal(preview.reopensReview,true);assert.equal(preview.detachedEvidence[0].id,evidence);assert.ok(preview.losses.some(loss=>loss.row==='row_one'&&loss.column==='amount'&&loss.value==='0'));assert.ok(preview.losses.some(loss=>loss.reason==='not-applicable'&&loss.key==='conditional'));
  await f.preview(id,form,'2','preparer',403);await f.preview('firm',form,'2','reviewer',409);
  await f.preview(id,form,'1','reviewer',409);
  await f.write('partner',id,'access',{role:'reviewer',access:'revoke',reason:'Verify scoped preview denial'});await f.preview(id,form,'2','reviewer',404);await f.write('partner',id,'access',{role:'reviewer',access:'grant',reason:'Restore fixture access'});
  await f.write('reviewer',id,'form-use',{form,version:'2'},409);await f.write('reviewer',id,'form-use',{form,version:'2',adoptionAck:'reviewed',adoptionReview:'wrong'},409);
  await save({...answers,conditional:'Current explanation changed after preview'});await f.write('reviewer',id,'form-use',{form,version:'2',adoptionAck:'reviewed',adoptionReview:preview.digest},409);
  const current=await f.preview(id,form,'2');assert.notEqual(current.digest,preview.digest);
  if(process.env.AUDIT_ADOPTION_FIXTURE_DIR){const output=resolve(process.env.AUDIT_ADOPTION_FIXTURE_DIR);await mkdir(output,{recursive:true});const destination=join(output,'adoption-ready.sqlite'),db=new DatabaseSync(database,{readOnly:true});await backup(db,destination);db.close();await writeFile(join(output,'adoption-fixture.json'),JSON.stringify({database:destination,engagement:id,form,version:'2',credentials},null,2)+'\n');}
  state=await f.write('reviewer',id,'form-use',{form,version:'2',adoptionAck:'reviewed',adoptionReview:current.digest});const updated=paper(state);
  assert.equal(updated.status,'changed');assert.equal(updated.values['field.conditional'],undefined);assert.equal(updated.values['field.proof'],undefined);assert.deepEqual(JSON.parse(updated.values['field.rows']),[{id:'row_one',values:{reference:'0007'}},{id:'row_two',values:{reference:'INV-08',choice:'B'}}]);
  assert.equal(updated.evidence.includes(evidence),false);assert.ok(updated.history.some(h=>h.version===signed.version&&h.values['field.rows']===JSON.stringify(rows)&&h.evidence.includes(evidence)));assert.ok(updated.oldTemplates[firstDigest]);assert.equal(await(await service.fetch('/evidence/'+evidence+'?engagement='+id,f.cookies.reviewer)).text(),'retained original');
  const duplicate=await f.preview(id,form,'2');assert.equal(duplicate.sameVersion,true);const version=updated.version;assert.equal(paper(await f.write('reviewer',id,'form-use',{form,version:'2'})).version,version);
  await service.close();service=await start(database);f=await fixture(service,false);const restored=paper(await f.view('partner',id));assert.equal(restored.version,version);assert.equal(JSON.parse(restored.values['template.adoption']).digest,current.digest);assert.equal(JSON.parse(restored.values['field.rows'])[0].values.reference,'0007');
 }finally{await service.close();await rm(dir,{recursive:true,force:true});}
});

test('source schedules retain alphanumeric sample identifiers and narrative asset results with signed numeric differences',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'audit-source-types-'));const service=await start(join(dir,'workspace.sqlite'));
 try{
  const f=await fixture(service),id=await f.create();
  for(const [form,field,rows] of [
   ['3.1.2','r28',[{id:'asset_row',values:{B:'1',C:'Additional inspection',I:'Inspected invoice INV-0007 and documented the exception',K:'0',L:'1.5'}}]],
   ['3.3.1','r37',[{id:'sample_row',values:{A:'1',B:'INV-0007',C:'2025-02-01',D:'100',E:'98.75',F:'-1.25'}}]],
  ]){
   let s=await f.write('reviewer',id,'form-use',{form,version:'source'});const p=s.papers.find(p=>p.form===form),role={nomin:'preparer',temuulen:'reviewer',bat:'partner'}[p.owner];
   s=await f.write(role,id,'save',{form,execution:'Performed source-linked work',conclusion:'Documented actual findings',templateDigest:p.template.digest,answers:JSON.stringify({[field]:JSON.stringify(rows)})});
   assert.deepEqual(JSON.parse(s.papers.find(p=>p.form===form).values['field.'+field]),rows);
   if(form==='3.3.1'){const invalid=structuredClone(rows);invalid[0].values.F='unexplained';await f.write(role,id,'save',{form,execution:'Work',conclusion:'Conclusion',templateDigest:p.template.digest,answers:JSON.stringify({[field]:JSON.stringify(invalid)})},400);}
  }
 }finally{await service.close();await rm(dir,{recursive:true,force:true});}
});
