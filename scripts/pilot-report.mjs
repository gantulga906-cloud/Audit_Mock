import { createHash } from 'node:crypto';
import { currentPackage, reportForm } from '../src/lib/workspace.ts';
import { approvedRows, currentOpinion, formContract } from './pilot-registers.mjs';

export const sha256 = value => createHash('sha256').update(value).digest('hex');
const escape = text => String(text ?? '').replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const paragraph = text => '<p>' + escape(text) + '</p>';

export function renderReport(m) {
  const engagement = m.engagements[0], form = reportForm(engagement);
  const template = formContract(form), opinion = currentOpinion(m);
  const { paper, statements } = currentPackage(m, engagement.id);
  const period = m.bench.periods[engagement.id];
  const sections = approvedRows(m, 'M10-F11').filter(r => r.values.opinion === opinion?.id);
  const sectionNames = { kam: 'Аудитын гол асуудал', emphasis: 'Онцлон тэмдэглэх', other: 'Бусад асуудал', going: 'Тасралтгүй ажиллагаа' };
  const lines = Object.entries(m.pilotStatementLines ?? {}).map(([key, amount]) =>
    '<tr><th scope="row">' + escape(key) + '</th><td>' + escape(amount) + '</td></tr>').join('');
  const html = [
    '<!doctype html><html lang="mn"><meta charset="utf-8"><title>' + escape(template.title) + '</title>',
    '<style>body{font:16px system-ui;max-width:48rem;margin:3rem auto;padding:0 1rem}p{white-space:pre-wrap}td,th{padding:.25rem .5rem;text-align:left}</style>',
    '<h1>' + escape(template.title) + '</h1>',
    paragraph(engagement.client + ' · ' + period.start + ' — ' + period.end),
    paragraph(form + ' · v' + paper.version + ' · ' + engagement.reportDate),
    '<h2>Аудитын хамрах хүрээ</h2>', paragraph(paper.values.execution),
    '<h2>Санал дүгнэлт</h2>', paragraph(paper.values.conclusion),
    ...(opinion ? ['<h2>Санал дүгнэлтийн үндэслэл</h2>', paragraph(opinion.values.basis)] : []),
    ...sections.flatMap(r => ['<h2>' + escape(sectionNames[r.values.type]) + '</h2>', paragraph(r.values.wording)]),
    '<h2>Санхүүгийн тайлан · v' + statements.version + '</h2>', paragraph(statements.statements),
    ...(lines ? ['<table><tbody>' + lines + '</tbody></table>'] : []),
    '<h2>Тодруулга</h2>', paragraph(statements.notes), '</html>',
  ].join('\n');
  return { form, templateSha256: sha256(JSON.stringify(template)), sha256: sha256(html), html };
}
