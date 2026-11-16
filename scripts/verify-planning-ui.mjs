// Browser verification uses a disposable, explicitly exported G02 fixture; never the preview database.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {readFile,writeFile,mkdir,mkdtemp,copyFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
if(!process.argv[2])throw Error('Pass g02-fixture.json exported by tests/pilot-acceptance.test.mjs with AUDIT_G02_FIXTURE_DIR');
const seed=JSON.parse(await readFile(resolve(process.argv[2]),'utf8')),output=resolve(process.argv[3]??'.audit-pilot/g02-ui');
await mkdir(output,{recursive:true});const fixture=await mkdtemp(join(output,'fixture-')),database=join(fixture,'workspace.sqlite');await copyFile(seed.database,database);
const probe=createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
const origin='http://127.0.0.1:'+port,scope='?engagement='+seed.engagement,url=origin+'/'+scope+'&view=planning';
const server=spawn(process.execPath,['scripts/serve.mjs','--pilot',String(port)],{cwd:process.cwd(),env:{...process.env,AUDIT_PILOT_DB:database},windowsHide:true,stdio:['ignore','pipe','pipe']});
let log='',browser,ws;server.stdout.on('data',b=>{log+=b;});server.stderr.on('data',b=>{log+=b;});
const delay=ms=>new Promise(r=>setTimeout(r,ms)),checks=[],errors=[];
async function until(fn,label){let last;for(let n=0;n<140;n++){try{const value=await fn();if(value)return value;}catch(error){last=error;}await delay(100);}throw Error(label+' timed out'+(last?' · '+last.message:'')+' · '+log.slice(-800));}
try{
 await until(async()=>(await fetch(origin+'/api/pilot')).ok,'server');
 const response=await fetch(origin+'/api/pilot/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({role:'partner',password:seed.credentials.partner})});assert.equal(response.status,200);const cookie=response.headers.get('set-cookie').split(';')[0];
 const get=async scope=>{const response=await fetch(origin+'/api/pilot?engagement='+scope,{headers:{Cookie:cookie}});assert.equal(response.status,200);return response.json();},state=()=>get(seed.engagement);
 browser=spawn(process.env.AUDIT_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--disable-background-networking','--disable-component-update','--disable-sync','--disable-gpu','--user-data-dir='+join(fixture,'chrome'),'about:blank'],{windowsHide:true,stdio:'ignore'});
 const cdpPort=await until(async()=>(await readFile(join(fixture,'chrome/DevToolsActivePort'),'utf8')).split('\n')[0],'Chrome');const pages=await(await fetch('http://127.0.0.1:'+cdpPort+'/json/list')).json();
 ws=new WebSocket(pages.find(row=>row.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',j,{once:true});});
 let serial=0;const pending=new Map(),call=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 ws.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id&&pending.has(message.id)){const p=pending.get(message.id);pending.delete(message.id);message.error?p.reject(Error(message.error.message)):p.resolve(message.result);}if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.exception?.description??message.params.exceptionDetails.text);});
 await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 const evaluate=async expression=>{const response=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(response.exceptionDetails)throw Error(response.exceptionDetails.exception?.description??response.exceptionDetails.text);return response.result.value;};
 const wait=(expression,label)=>until(()=>evaluate(expression),label);
 const fill=(selector,value)=>evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing '+${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(e instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:e instanceof HTMLSelectElement?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return true;})()`);
 const click=(selector,label='')=>evaluate(`(()=>{const e=Array.from(document.querySelectorAll(${JSON.stringify(selector)})).find(e=>e.textContent.includes(${JSON.stringify(label)}));if(!e)throw Error('Missing '+${JSON.stringify(selector+' '+label)});e.scrollIntoView({block:'center'});e.click();return true;})()`);
 const submit=selector=>evaluate(`(()=>{const form=document.querySelector(${JSON.stringify(selector)});if(!form.checkValidity())throw Error('Invalid form: '+Array.from(form.elements).filter(e=>e.willValidate&&!e.checkValidity()).map(e=>e.name));form.requestSubmit();return true;})()`);
 const login=async role=>{await wait('!!document.querySelector("select[name=role]")','login');await fill('select[name=role]',role);await fill('input[name=password]',seed.credentials[role]);await submit('form');await wait('!!document.querySelector(".ew-shell")','workspace');};
 const logout=()=>click('button[aria-label="Гарах"]');
 const shot=async(name,selector='[data-planning-desk]')=>{await evaluate('document.querySelector('+JSON.stringify(selector)+')?.scrollIntoView({block:"start"})');await evaluate('document.fonts.ready.then(()=>true)');await delay(150);const image=await call('Page.captureScreenshot',{format:'png'});await writeFile(join(output,name+'.png'),Buffer.from(image.data,'base64'));};
 await call('Page.navigate',{url});await login(seed.handoff?'reviewer':'partner');await wait('!!document.querySelector("[data-planning-desk]")','planning desk');
 if(seed.handoff){
  await evaluate('document.querySelectorAll("[data-planning-form]").forEach(e=>e.open=true)');
  const initial=await state();assert.equal(initial.planning.managed,true);assert.equal(initial.planning.effort.filter(e=>e.current).reduce((n,e)=>n+e.minutes,0),150);
  assert.equal(await evaluate('document.querySelector("[data-planning-desk]").textContent.includes("бодит 2.50 цаг")'),true);
  checks.push('Current strategy and risk coverage are visible; planned budget and 2.5 actual hours retain separate labels and intervals');await shot('01-planning-baseline');
  const effort='form[data-effort-form]';await fill(effort+' select[name=work]','1.3');await fill(effort+' input[name=from]','2026-01-06T09:00');await fill(effort+' input[name=through]','2026-01-06T10:30');await fill(effort+' textarea[name=purpose]','Browser: actual independent benchmark review');await submit(effort);
  await until(async()=>(await state()).planning.effort.some(e=>e.by==='reviewer'&&e.minutes===90),'persisted actual time');
  let saved=await state();const entry=saved.planning.effort.find(e=>e.by==='reviewer');await fill(effort+' select[name=supersedes]',entry.id);await wait('!!document.querySelector("'+effort+' textarea[name=reason]")','correction reason');await fill(effort+' select[name=work]','1.3');await fill(effort+' input[name=from]','2026-01-06T09:00');await fill(effort+' input[name=through]','2026-01-06T11:00');await fill(effort+' textarea[name=purpose]','Browser: corrected actual independent review');await fill(effort+' textarea[name=reason]','Browser: retained half hour supported by work log');await submit(effort);
  await until(async()=>(await state()).planning.effort.some(e=>e.supersedes===entry.id&&e.minutes===120),'append-only correction');saved=await state();assert.equal(saved.planning.effort.find(e=>e.id===entry.id).current,false);checks.push('Actual hours and correction save through the UI, retain the original entry and exceed the reduced budget');await shot('02-actual-effort','[data-effort-form]');
  const card='details[data-record-id="'+seed.plan+'"]';await fill('#registers>label select','M07-F01');await wait('!!document.querySelector('+JSON.stringify(card)+')','programme record');await evaluate('document.querySelector('+JSON.stringify(card)+').open=true');await click(card+' button','Бүртгэл засах');await wait('!!document.querySelector("[data-response-editor]")','response editor');
  assert.ok(await evaluate('document.querySelectorAll("[data-response-editor] fieldset").length>=4'));
  await fill('[data-response-editor] fieldset label:last-child textarea','Browser: actual PPE scope and assertion retained');await shot('03-multiple-risk-responses','[data-response-editor]');await submit('form[data-register-kind="M07-F01"]');await until(async()=>(await state()).registers.find(r=>r.id===seed.plan).status==='draft','saved changed plan');
  saved=await state();assert.ok(saved.planning.programmes.every(p=>p.form!=='3.1.2'));assert.ok(saved.registers.find(r=>r.id===seed.plan).history.some(h=>h.status==='approved'));checks.push('Many-to-many response editor saves a new draft; the prior approved plan remains in history and current strategy cannot silently pass');
  await fill('#registers>label select','M06-F03');await click('#registers button','Шинэ бүртгэл');await wait('!!document.querySelector('+JSON.stringify('form[data-register-kind="M06-F03"]')+')','control form');
  for(const field of ['design','implementation','operating'])assert.ok(await evaluate('!!document.querySelector('+JSON.stringify('select[name="field.'+field+'"]')+')'));
  checks.push('Control editor presents distinct design, implementation and operating-effectiveness decisions');await shot('04-distinct-controls','form[data-register-kind="M06-F03"]');
 }else{
  const card='details[data-record-id="'+seed.plan+'"]';await fill('#registers>label select','M07-F01');await wait('!!document.querySelector('+JSON.stringify(card)+')','pending migration');await evaluate('document.querySelector('+JSON.stringify(card)+').open=true');await wait('!!document.querySelector("[data-programme-loss-review] input[type=checkbox]")','loss acknowledgement');
  assert.equal(await evaluate('document.querySelector("[data-programme-loss-review]").textContent.includes("Actual explanation changed after the loss preview")'),true);
  const review=card+' .field-grid form';await fill(review+' textarea[name=reason]','Browser: independently reviewed the exact programme migration');await submit(review);await wait('document.body.textContent.includes("Шилжихгүй хариулт")','missing acknowledgement rejection');assert.equal((await state()).registers.find(r=>r.id===seed.plan).status,'submitted');
  checks.push('Programme migration shows the actual incompatible answer and rejects approval without acknowledgement');await shot('01-explicit-loss-review','[data-programme-loss-review]');
  await evaluate('document.querySelector("[data-programme-loss-review] input[type=checkbox]").click()');await submit(review);await until(async()=>(await state()).registers.find(r=>r.id===seed.plan).status==='approved','acknowledged migration');
  const saved=await state(),row=saved.registers.find(r=>r.id===seed.plan),paper=saved.papers.find(p=>p.form==='3.1.2');assert.ok(row.adoptionAcknowledgement?.digest);assert.equal(paper.values['field.legacyNarrative'],undefined);assert.ok(paper.history.some(h=>h.values['field.legacyNarrative']==='Actual explanation changed after the loss preview'));
  checks.push('Explicit current acknowledgement approves migration and preserves the incompatible answer in historical work');await shot('02-acknowledged-migration',card);
 }
 assert.deepEqual(errors,[]);const result={date:new Date().toISOString(),build:JSON.parse(await readFile('out/build-info.json','utf8')),engagement:seed.engagement,checks,runtimeErrors:errors,scope:'Disposable G02 source-grounded test profile; no live database, production deployment or independent source acceptance changes'};
 await writeFile(join(output,'verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}finally{ws?.close();browser?.kill();server.kill();}
