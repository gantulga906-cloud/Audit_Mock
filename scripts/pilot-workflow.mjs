import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createCompany, createEngagement, createRequest, updateRequest } from '../src/lib/feature-workflows.ts';
import {
  activateEngagement, authorizeReport, authorizationCurrent, bindStatements, canEdit, canReviewWork,
  changeWork, clearNote, isCurrentReview, recordRequestPart, reportGaps, respondNote,
  returnWork, reviewWork, saveStatements, setEngagementDecision, snapshot, submitWork, workKey,
} from '../src/lib/workspace.ts';

export const accounts = { preparer: 'nomin', reviewer: 'temuulen', partner: 'bat' };
const workstream = '3.1.2';
const pilotForms = [workstream, '4.4', '4.1.A1'];
const forms = JSON.parse(readFileSync(new URL('../src/data/forms.json', import.meta.url), 'utf8'));

export function emptyWorkspace() {
  return {
    schema: 2, person: '', engagement: '', work: {}, engagements: [], evidence: [], requests: [],
    tasks: [], events: [], findings: [], datasets: {}, runs: [], risks: [], impacts: [],
    samples: {}, library: { version: 1, draft: '', phase: 'published', adopted: {}, releases: [] }, activity: [],
  };
}

export class PilotError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function input(data, field, max = 4000) {
  const value = data?.[field];
  if (typeof value !== 'string' || !value.trim() || value.length > max) {
    throw new PilotError(400, `Шаардлагатай утгыг шалгана уу · ${field}`);
  }
  return value.trim();
}

function requireActor(condition) {
  if (!condition) throw new PilotError(403, 'Энэ үйлдлийн томилгоо шаардлагатай.');
}

function evidenceGaps(m) {
  const completed = m.requests.some(r => r.form === workstream && r.dispatch === 'issued' && r.status === 'complete');
  const linked = m.work[workKey(m.engagement, workstream)].evidence.some(id =>
    m.evidence.some(e => e.id === id && e.status === 'accepted'));
  return completed && linked ? [] : ['3.1.2 · Хүсэлтийн хүлээн зөвшөөрсөн эх баримт шаардлагатай.'];
}

function pilotGaps(m) {
  return [
    ...evidenceGaps(m),
    ...(!isCurrentReview(m.work[workKey(m.engagement, workstream)]) ? ['3.1.2 · Одоогийн хувилбарын ахлахын хяналт'] : []),
    ...reportGaps(m, m.engagement),
  ];
}

export function pilotView(m, role, revision, files) {
  const engagement = m.engagements[0];
  if (!engagement) return { role, revision, engagement: null };
  const papers = pilotForms.map(form => {
    const w = m.work[workKey(engagement.id, form)];
    return { ...w, editable: canEdit(m, w), reviewable: canReviewWork(m, w) };
  });
  return {
    role, revision,
    engagement: {
      client: engagement.client, active: engagement.intake.active, period: m.bench.periods[engagement.id],
      reportDate: engagement.reportDate, statements: engagement.statements, decisions: engagement.decisions ?? [],
    },
    papers, requests: m.requests, evidence: m.evidence.map(e => ({ ...e, sha256: files.get(e.id)?.sha256 })),
    gaps: pilotGaps(m), activity: m.activity.slice(0, 30),
    authorized: engagement.authorized && {
      at: engagement.authorized.at, report: engagement.authorized.report, fs: engagement.authorized.fs,
      current: authorizationCurrent(m, engagement), count: engagement.authorizationHistory.length,
    },
  };
}

export function pilotAction(m, role, action, data, files) {
  if (action === 'create') {
    requireActor(role === 'reviewer' || role === 'partner');
    if (m.engagements.length) throw new PilotError(409, 'Туршилтын гэрээт ажил бүртгэгдсэн.');
    const contact = { id: randomUUID(), name: input(data, 'contact', 150), email: input(data, 'email', 254), role: '', body: '', signer: true };
    const company = createCompany(m, {
      name: input(data, 'client', 200), legalForm: input(data, 'legalForm', 50), registration: input(data, 'registration', 50),
      framework: input(data, 'framework', 100), contacts: [contact], bodies: [],
    }, '');
    createEngagement(m, company, { start: input(data, 'start', 10), end: input(data, 'end', 10) },
      input(data, 'reportDate', 10), accounts, forms);
    return;
  }
  const engagement = m.engagements[0];
  if (!engagement) throw new PilotError(409, 'Гэрээт ажил үүсгэнэ үү.');
  if (action === 'activate') {
    requireActor(role === 'partner');
    if (engagement.intake.active) throw new PilotError(409, 'Гэрээт ажил идэвхтэй байна.');
    setEngagementDecision(m, 'independence', true, input(data, 'independence'));
    setEngagementDecision(m, 'termsAgreed', true, input(data, 'letter'));
    setEngagementDecision(m, 'acceptance', 'accepted', input(data, 'assessment'));
    activateEngagement(m);
    return;
  }
  if (!engagement.intake.active) throw new PilotError(409, 'Партнер гэрээт ажлыг идэвхжүүлнэ.');
  if (action === 'request') {
    const title = input(data, 'title', 200);
    createRequest(m, { title, form: workstream, contactId: m.bench.clients[engagement.id].contacts[0].id,
      owner: accounts.preparer, due: input(data, 'due', 10), message: '', parts: [title] });
    updateRequest(m, m.requests[0].id, 'issue');
    return;
  }
  if (action === 'upload' || action === 'accept' || action === 'reject') {
    requireActor(role === 'preparer');
    const request = m.requests.find(r => r.id === data?.request);
    if (!request) throw new PilotError(404, 'Хүсэлт олдсонгүй.');
    const part = request.parts[0];
    if (action !== 'upload') {
      recordRequestPart(m, request.id, part.id, action, action === 'reject' ? input(data, 'reason') : '');
      return;
    }
    const name = input(data, 'name', 180);
    const encoded = input(data, 'base64', 7_000_000);
    if (!/^[^\\/\x00-\x1f\x7f]+\.(pdf|png|jpe?g|docx|xlsx|csv)$/i.test(name) || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
      throw new PilotError(400, 'PDF, зураг, DOCX, XLSX эсвэл CSV файл сонгоно уу.');
    }
    const bytes = Buffer.from(encoded, 'base64');
    if (!bytes.length || bytes.length > 5_000_000 || bytes.toString('base64') !== encoded) throw new PilotError(400, 'Файлын хэмжээ 5 MB хүртэл байна.');
    const id = randomUUID();
    m.evidence.push({ id, name, engagement: engagement.id, version: (m.evidence.find(e => e.id === part.evidence)?.version ?? 0) + 1,
      type: 'FILE', obtained: new Date().toISOString().slice(0, 10), source: input(data, 'source', 200), status: 'received',
      specimen: false, request: request.id, anchor: '', text: '', original: true });
    recordRequestPart(m, request.id, part.id, 'receive', id);
    files.add(id, name, bytes);
    return;
  }
  if (action === 'statements') {
    requireActor(role === 'partner');
    const previous = engagement.fsVersion;
    saveStatements(m, input(data, 'statements'), input(data, 'disclosures'));
    bindStatements(m);
    const report = m.work[workKey(engagement.id, '4.1.A1')];
    if (previous !== engagement.fsVersion && ['submitted', 'reviewed'].includes(report.status)) {
      snapshot(report, m.person, 'Тайлангийн холбогдох СТ багц өөрчлөгдөв');
      report.version++;
      report.status = 'changed';
      report.submittedVersion = undefined;
      report.completedAt = undefined;
    }
    return;
  }
  if (action === 'authorize') {
    requireActor(role === 'partner');
    const gaps = pilotGaps(m);
    if (gaps.length) throw new PilotError(409, gaps.join(' · '));
    if (authorizationCurrent(m, engagement)) return;
    authorizeReport(m);
    files.authorize(engagement.authorized, engagement.authorized.package.evidence.map(e => {
      const file = files.get(e.id);
      if (!file) throw new PilotError(409, 'Зөвшөөрөх багцын эх файл олдсонгүй.');
      return { ...e, ...file };
    }));
    return;
  }
  const paper = pilotForms.includes(data?.form) && m.work[workKey(engagement.id, data.form)];
  if (!paper) throw new PilotError(404, 'Туршилтын ажлын баримт олдсонгүй.');
  switch (action) {
    case 'save':
      requireActor(canEdit(m, paper));
      changeWork(m, paper.id, { ...paper.values, execution: input(data, 'execution'), conclusion: input(data, 'conclusion') });
      break;
    case 'submit':
      requireActor(canEdit(m, paper));
      if (!paper.values.execution || !paper.values.conclusion) throw new PilotError(409, 'Хийсэн ажил ба дүгнэлтийг хадгална уу.');
      if (paper.form === workstream && evidenceGaps(m).length) throw new PilotError(409, evidenceGaps(m)[0]);
      submitWork(m, paper.id);
      break;
    case 'return':
      requireActor(canReviewWork(m, paper));
      returnWork(m, paper.id, input(data, 'reason'), 'conclusion');
      break;
    case 'review':
      requireActor(canReviewWork(m, paper));
      reviewWork(m, paper.id);
      break;
    case 'respond':
    case 'clear': {
      const note = paper.notes.find(n => n.id === data.note && !n.cleared);
      if (!note) throw new PilotError(404, 'Нээлттэй тэмдэглэл олдсонгүй.');
      if (action === 'respond') {
        requireActor(canEdit(m, paper) && ['returned', 'changed', 'in_progress'].includes(paper.status));
        respondNote(m, paper.id, note.id, input(data, 'response'));
      } else {
        requireActor(note.author === m.person && paper.status === 'submitted');
        clearNote(m, paper.id, note.id);
      }
      break;
    }
    default: throw new PilotError(404, 'Үйлдэл олдсонгүй.');
  }
}
