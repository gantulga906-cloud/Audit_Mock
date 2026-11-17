import { createHash } from 'node:crypto';
import { currentPackage, reportForm } from '../src/lib/workspace.ts';
import { approvedRows, currentOpinion, formContract } from './pilot-registers.mjs';
import {managedReporting} from './pilot-reporting.mjs';
import {currentManagement} from './pilot-completion.mjs';

export const sha256 = value => createHash('sha256').update(value).digest('hex');
const escape = text => String(text ?? '').replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const paragraph = text => '<p>' + escape(text) + '</p>';

export function renderReport(m) {
  if(managedReporting(m))return renderControlledReport(m);
  const engagement = m.engagements[0], form = reportForm(engagement);
  const template = formContract(form), opinion = currentOpinion(m);
  const { paper, statements } = currentPackage(m, engagement.id);
  const period = m.bench.periods[engagement.id];
  const sections = approvedRows(m, 'M10-F11').filter(r => r.values.opinion === opinion?.id);
  const preparation=approvedRows(m,'M10-F10').find(r=>r.values.opinion===opinion?.id);
  const sectionNames = { kam: 'Аудитын гол асуудал', emphasis: 'Онцлон тэмдэглэх', other: 'Бусад асуудал', going: 'Тасралтгүй ажиллагаа' };
  const lines = Object.entries(m.pilotStatementLines ?? {}).map(([key, amount]) =>
    '<tr><th scope="row">' + escape(key) + '</th><td>' + escape(amount) + '</td></tr>').join('');
  const html = [
    '<!doctype html><html lang="mn"><meta charset="utf-8"><title>' + escape(template.title) + '</title>',
    '<style>body{font:16px system-ui;max-width:48rem;margin:3rem auto;padding:0 1rem}p{white-space:pre-wrap}td,th{padding:.25rem .5rem;text-align:left}</style>',
    '<h1>' + escape(template.title) + '</h1>',
    ...(preparation?['<h2>Хаягласан этгээд</h2>',paragraph(preparation.values.addressee)]:[]),
    paragraph(engagement.client + ' · ' + period.start + ' — ' + period.end),
    paragraph(form + ' · v' + paper.version + ' · ' + engagement.reportDate),
    '<h2>Аудитын хамрах хүрээ</h2>', paragraph(paper.values.execution),
    '<h2>Санал дүгнэлт</h2>', paragraph(paper.values.conclusion),
    ...(opinion ? ['<h2>Санал дүгнэлтийн үндэслэл</h2>', paragraph(opinion.values.basis)] : []),
    ...sections.flatMap(r => ['<h2>' + escape(sectionNames[r.values.type]) + '</h2>', paragraph(r.values.wording)]),
    '<h2>Санхүүгийн тайлан · v' + statements.version + '</h2>', paragraph(statements.statements),
    ...(lines ? ['<table><tbody>' + lines + '</tbody></table>'] : []),
    '<h2>Тодруулга</h2>', paragraph(statements.notes),
    ...(preparation?['<h2>Тайлагнах хүрээ ба эрх бүхий гарын үсэг</h2>',paragraph(preparation.values.signatory),paragraph(preparation.values.edition),paragraph(preparation.values.dutyAssessment)]:[]),'</html>',
  ].join('\n');
  return { form, templateSha256: sha256(JSON.stringify(template)), sha256: sha256(html), html };
}

function renderControlledReport(m){
 const e=m.engagements[0],form=reportForm(e),opinion=currentOpinion(m),prep=approvedRows(m,'M10-F10').find(r=>r.values.opinion===opinion?.id),v=prep?.values??{},period=m.bench.periods[e.id],statements=e.statements,management=currentManagement(m);
 const sections=approvedRows(m,'M10-F11').filter(r=>r.values.opinion===opinion?.id&&r.values.applicability==='include'),names={kam:'Аудитын гол асуудал',going:'Тасралтгүй ажиллагаа',emphasis:'Онцлон тэмдэглэх',other:'Бусад асуудал',otherInformation:'Бусад мэдээлэл',regulatory:'Бусад хууль ба зохицуулалтын тайлагнал'};
 const section=type=>sections.filter(r=>r.values.type===type).flatMap(r=>['<h2>'+names[type]+'</h2>',paragraph(r.values.wording)]);
 const template={source:formContract(form),profile:'G06-reviewed-instance-v1',preparation:prep?.id,version:prep?.version,edition:v.edition,framework:v.framework,jurisdiction:v.jurisdiction,title:v.templateTitle,resolution:v.templateResolution,wording:{opinion:v.opinionText,basis:v.basisText,management:v.managementResponsibilities,auditor:v.auditorResponsibilities},sections:sections.map(r=>({id:r.id,version:r.version,type:r.values.type,wording:r.values.wording}))};
 const statementPackage={version:e.fsVersion,management:management?.version,file:management?.file,notes:management?.notes,authorization:management?.authorization};
 const html=['<!doctype html><html lang="mn"><meta charset="utf-8"><title>'+escape(v.templateTitle??'Хянах тайлангийн шийдвэр дутуу')+'</title>','<style>body{font:16px system-ui;max-width:48rem;margin:3rem auto;padding:0 1rem}p{white-space:pre-wrap;overflow-wrap:anywhere}</style>','<h1>'+escape(v.templateTitle??'Хянах эх')+'</h1>',paragraph(v.addressee),paragraph(e.client+' · '+period.start+' — '+period.end),paragraph(form+' · '+e.reportDate+' · '+(v.edition??'')+' · '+(v.framework??'')), '<h2>Санал дүгнэлт</h2>',paragraph(v.opinionText),'<h2>Санал дүгнэлтийн үндэслэл</h2>',paragraph(v.basisText),...section('going'),...section('kam'),...section('emphasis'),...section('other'),...section('otherInformation'),'<h2>Удирдлагын үүрэг</h2>',paragraph(v.managementResponsibilities),'<h2>Аудиторын үүрэг</h2>',paragraph(v.auditorResponsibilities),...section('regulatory'),'<h2>Гарын үсэг ба тайлагналын хүрээ</h2>',paragraph(v.signatory),paragraph(v.jurisdiction),'<h2>Яг холбосон санхүүгийн тайлан ба тодруулга · v'+e.fsVersion+'</h2>',paragraph(statements?.statements),paragraph(statements?.notes),...['file','notes','authorization'].map(key=>paragraph(key+' · '+(statementPackage[key]?.id??'Бодит эх дутуу')+' · SHA-256 '+(statementPackage[key]?.sha256??''))),'</html>'].join('\n');
 return {form,html,sha256:sha256(html),templateSha256:sha256(JSON.stringify(template)),template,statementPackage,packageSha256:sha256(JSON.stringify([sha256(html),statementPackage]))};
}
