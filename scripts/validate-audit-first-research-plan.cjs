(function validator(){
const fs=require("fs"),path=require("path"),cp=require("child_process"),crypto=require("crypto");
const root=path.resolve(__dirname,".."),base="docs/delivery/research/audit-first-2026-11-19",out=path.join(root,base);
const errors=[],checks=[];let checkedLinks=0;
const assert=(v,msg)=>{if(!v)errors.push(msg);};
function parseCsv(s){const rows=[];let row=[],v="",q=false;for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){if(q&&s[i+1]==='"'){v+='"';i++;}else q=!q;}else if(c===","&&!q){row.push(v);v="";}else if(c==="\n"&&!q){row.push(v.replace(/\r$/,""));if(row.some(Boolean))rows.push(row);row=[];v="";}else v+=c;}if(v||row.length){row.push(v);rows.push(row);}const head=rows.shift();return rows.map(r=>Object.fromEntries(head.map((k,i)=>[k,r[i]??""])));}
const reg=n=>parseCsv(fs.readFileSync(path.join(out,"registers",n+".csv"),"utf8"));
const original=n=>JSON.parse(fs.readFileSync(path.join(root,"docs/delivery/handbooks/registers",n+".json"),"utf8"));
const tables={Research_Tasks:60,Method_Research:36,Fieldwork_Research:22,Automation_Research:58,Dependency_Research:20,Sources:30,Decisions:12};
const rows=Object.fromEntries(Object.entries(tables).map(([name,n])=>{const r=reg(name);assert(r.length===n,name+" count");const ids=r.map(x=>x.id);assert(new Set(ids).size===r.length,name+" duplicate ID");checks.push(name+": "+r.length+" unique rows");return[name,r];}));
for(const name of ["Research_Tasks","Method_Research","Fieldwork_Research","Automation_Research","Dependency_Research"])assert(rows[name].every(r=>r.status==="PLANNED"),name+" falsely closed");
assert(rows.Decisions.every(r=>r.status==="OPEN"),"Unrecorded decision closed");
const tasks=new Map(rows.Research_Tasks.map(t=>[t.id,t])),methods=new Map(rows.Method_Research.map(t=>[t.id,t])),sources=new Map(rows.Sources.map(t=>[t.id,t]));
for(const t of tasks.values()){
for(const k of ["question","execution_steps","deliverable","validation","owner_role","independent_reviewer_role","standards_to_verify"])assert(Boolean(t[k]),t.id+" missing "+k);
for(const dep of t.dependencies.split(" ").filter(Boolean))assert(tasks.has(dep),t.id+" unknown dependency "+dep);
for(const m of t.method_ids.split(" ").filter(Boolean))assert(methods.has(m),t.id+" unknown method "+m);
}
const seen=new Set(),active=new Set();
function visit(id){if(active.has(id)){errors.push("Cyclic task dependency "+id);return;}if(seen.has(id))return;active.add(id);for(const d of tasks.get(id).dependencies.split(" ").filter(Boolean))if(tasks.has(d))visit(d);active.delete(id);seen.add(id);}
for(const id of tasks.keys())visit(id);checks.push("Task dependencies: referential integrity and acyclic graph");
for(const m of methods.values())for(const s of m.source_ids.split(" ").filter(Boolean))assert(sources.has(s),m.id+" unknown source "+s);
for(const n of ["Fieldwork_Research","Automation_Research"])for(const r of rows[n])for(const m of (r.method_ids||r.methods).split(" ").filter(Boolean))assert(methods.has(m),r.id+" unknown method "+m);
for(const [name,src] of [["Fieldwork_Research","fieldwork_variants"],["Automation_Research","automation_methods"],["Dependency_Research","dependencies"]]){
const orig=original(src),now=rows[name];assert(orig.length===now.length,name+" original count differs");const om=new Map(orig.map(o=>[o.id,o]));for(const r of now){assert(om.has(r.id),name+" invented ID "+r.id);if(!om.has(r.id))continue;const o=om.get(r.id);if(name==="Fieldwork_Research"){assert(r.source_area===o.area,r.id+" source area changed");assert(r.source_locators===JSON.stringify(o.source_locators),r.id+" source locators changed");}if(name==="Automation_Research"){assert(r.original_minimum===o.minimum,r.id+" original minimum changed");assert(r.source===o.source,r.id+" source locator changed");}if(name==="Dependency_Research"){assert(r.from===String(o.from??"")&&r.to===String(o.to??"")&&r.targetField===String(o.targetField??""),r.id+" dependency endpoints changed");}}
checks.push(name+": exact original IDs and selected source semantics preserved");
}
assert(rows.Sources.filter(s=>s.status==="BLOCKED-PRIMARY-TEXT").length===2,"Local-law access gaps not explicit");
assert(rows.Research_Tasks.every(t=>t.source_paragraph_evidence==="PENDING-RESEARCH"&&t.professional_approval==="NOT-OBTAINED"),"Research or professional status incorrectly asserted");
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const parent=path.join(root,"docs/delivery/Audit_Mock_Audit_First_Reprioritized_Plan_2026-11-19.md"),docs=[parent,...files(out).filter(p=>p.endsWith(".md"))];
const slug=s=>s.toLowerCase().replace(/[`*_~]/g,"").replace(/[^\p{L}\p{N}_\-\s]/gu,"").replace(/\s/g,"-");
for(const f of docs){
const content=fs.readFileSync(f,"utf8");
for(const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)){
const href=match[1];if(/^(https?:|mailto:|sandbox:)/.test(href))continue;
const [part,anchor]=href.split("#");const target=path.resolve(path.dirname(f),part||path.basename(f));
assert(target.startsWith(root+path.sep),"Link escapes repository: "+href);assert(fs.existsSync(target),"Missing link: "+path.relative(root,f)+" -> "+href);
if(fs.existsSync(target)&&anchor&&target.endsWith(".md")){const targetText=fs.readFileSync(target,"utf8");const anchors=new Set([...targetText.matchAll(/^#{1,6}\s+(.+)$/gm)].map(m=>slug(m[1])));for(const a of targetText.matchAll(/<a id="([^"]+)"/g))anchors.add(a[1]);assert(anchors.has(anchor),"Missing anchor: "+path.relative(root,f)+" -> "+href);}
checkedLinks++;
}
}
checks.push("Markdown internal links: "+checkedLinks+" targets/anchors valid");
for(let i=1;i<=13;i++){const d="D"+String(i).padStart(2,"0");assert(fs.existsSync(path.join(out,"domains",d+"_Research_Plan.md")),"Missing domain "+d);assert(tasks.has("R-"+d+"-01"),"Missing domain task "+d);}
const expected=new Set([path.relative(root,parent).replaceAll(path.sep,"/"),"scripts/validate-audit-first-research-plan.cjs"]);
const diff=cp.execFileSync("git",["diff","--name-only","ffdf647b2851a4d0239d4766ae0d162c281ea41e"],{cwd:root,encoding:"utf8"}).trim().split(/\r?\n/).filter(Boolean);
for(const p of diff)assert(expected.has(p)||p.startsWith(base+"/"),"Unexpected tracked change "+p);
const immutable=["src","tests","docs/checkpoints","docs/delivery/handbooks","docs/delivery/Audit_Mock_Consolidated_Remaining_Work_2026-11-18.md","AGENTS.md"];
const unchanged=cp.execFileSync("git",["diff","--name-only","ffdf647b2851a4d0239d4766ae0d162c281ea41e","--",...immutable],{cwd:root,encoding:"utf8"}).trim();
assert(unchanged==="","Application/source/historical evidence changed");checks.push("Application, tests, original source registers/checkpoints and consolidated register unchanged");
checks.push("All new research rows PLANNED; decisions OPEN; no professional acceptance claimed");
const report={asOf:"2026-11-19",kind:"Research-plan structural validation only; not runtime/method/legal/professional acceptance",baselineCommit:"ffdf647b2851a4d0239d4766ae0d162c281ea41e",passed:errors.length===0,checks,counts:Object.fromEntries(Object.keys(tables).map(k=>[k,rows[k].length])),errors};
const destination=path.join(out,"Plan_Validation.json");fs.writeFileSync(destination,JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report,null,2));if(errors.length)process.exitCode=1;
})();
