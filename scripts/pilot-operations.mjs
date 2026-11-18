import {canReadWork,isCurrentReview} from '../src/lib/workspace.ts';

const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
export function operationsView(m,payload,asOf=new Date().toISOString()){
 const today=asOf.slice(0,10),papers=(payload.papers??[]).filter(p=>canReadWork(m,p)),visible=new Set(papers.map(p=>p.form));
 const applicable=papers.filter(p=>p.required&&!p.naReason),reviewed=applicable.filter(p=>isCurrentReview(p)&&!p.pendingPlanning&&!p.fieldGap);
 const queue=papers.filter(p=>!isCurrentReview(p)||p.pendingPlanning||p.fieldGap).map(p=>{
  const review=p.status==='submitted',note=p.notes.filter(n=>!n.cleared).at(-1),owner=review?p.reviewer:p.owner;
  return {id:p.id,kind:'workpaper',form:p.form,title:p.title,version:p.version,status:p.status,owner,due:p.due||null,dateState:date(p.due)?'known':'unknown',assigned:owner===m.person,
   overdue:date(p.due)&&p.due<today,reason:p.status==='returned'?note?.text||'Returned work requires a recorded reason.':p.fieldGap||p.nativeGaps?.join(' · ')||'',
   nextAction:review?'Review the submitted current version':p.status==='returned'?'Correct the work and respond to its open review note':'Prepare the current work',
   executable:review?p.reviewable:p.editable,target:{page:'workpapers',form:p.form,record:p.id}};
 });
 const tasks=(payload.delivery?.tasks??[]).filter(t=>!t.form||visible.has(t.form));
 const taskRows=tasks.filter(t=>!t.done).map(t=>({id:t.id,kind:'task',form:t.form||null,title:t.title,owner:t.owner,status:'open',due:t.due||null,dateState:date(t.due)?'known':'unknown',assigned:t.owner===m.person,overdue:date(t.due)&&t.due<today,reason:'Closing this task does not clear a review note, review a workpaper or make a professional decision.',nextAction:t.form?'Open the linked workpaper':'Complete the assigned task',executable:t.owner===m.person,target:{page:t.form?'workpapers':'planning',form:t.form||null,record:t.id}}));
 const rows=[...queue,...taskRows].sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999')||a.id.localeCompare(b.id));
 const metrics=[
  {id:'overdue-assigned',label:'Overdue assigned items',grain:'One open workpaper or manual task whose next owner is the signed-in person.',definition:'Due date is before the as-of UTC day. Submitted work belongs to its reviewer; other open work belongs to its preparer. Closed tasks and current reviews are excluded.',rows:rows.filter(r=>r.assigned&&r.overdue).map(r=>r.id)},
  {id:'returned-work',label:'Returned workpapers',grain:'One visible returned workpaper.',definition:'Current status is returned. The reason and next preparer remain attached to the exact workpaper.',rows:rows.filter(r=>r.kind==='workpaper'&&r.status==='returned').map(r=>r.id)},
  {id:'review-queue',label:'Submitted workpapers',grain:'One visible submitted workpaper.',definition:'Current submitted status. A count does not authorize review or resolve outstanding prerequisites.',rows:rows.filter(r=>r.kind==='workpaper'&&r.status==='submitted').map(r=>r.id)},
  {id:'unknown-dates',label:'Open items with unknown due dates',grain:'One visible open workpaper or task.',definition:'Due date is missing or invalid; these items are excluded from the overdue count.',rows:rows.filter(r=>r.dateState==='unknown').map(r=>r.id)},
 ].map(metric=>({...metric,count:metric.rows.length}));
 return {asOf,day:today,timeZone:'UTC',engagement:m.engagement||null,revision:payload.revision,scope:'Only records returned by the current authorized engagement view. Restricted engagements and workpapers do not contribute to totals.',freshness:{state:'current-server-snapshot',observedAt:asOf,externalInputs:'Source freshness and external outcomes remain unknown unless separately evidenced.'},queue:rows,metrics,
  progress:{label:'Currently reviewed applicable workpapers',numerator:reviewed.length,denominator:applicable.length,percent:applicable.length?Math.round(reviewed.length/applicable.length*100):null,grain:'Visible required workpaper; justified N/A excluded.',rows:applicable.map(p=>p.id),reviewedRows:reviewed.map(p=>p.id),meaning:'Workflow completion only. This is not an audit-risk or audit-quality score.'},
  tasks:{done:tasks.filter(t=>t.done).length,total:tasks.length,percent:tasks.length?Math.round(tasks.filter(t=>t.done).length/tasks.length*100):null},notifications:{channel:'in-app',externalEmailSent:false,clientNotificationSent:false}};
}
