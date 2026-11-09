import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createCompany, createEngagement, createRequest, updateRequest, validDate } from '../src/lib/feature-workflows.ts';
import {
  activateEngagement, authorizeReport, authorizationCurrent, bindStatements, canEdit, canReviewWork,
  changeWork, clearNote, currentRelease, isCurrentReview, issueReport, materiality, recordEvent, recordRequestPart, reportGaps, respondNote,
  reportForm, reschedule, returnWork, reviewWork, saveStatements, setEngagementDecision, snapshot, submitWork, workKey,
} from '../src/lib/workspace.ts';
import {
  acceptanceRegisterGaps, adoptedForms, archiveGrantKinds, completionRegisterGaps, currentOpinion, firmSnapshot, formContract, opinionForm, pilotProgrammes, programmeView,
  registerAction, registerEvidence, registerPackage, registerStamp, registerView,
} from './pilot-registers.mjs';
import { registers } from '../src/lib/pilot-registers.ts';
import { renderReport, sha256 } from './pilot-report.mjs';
import { bindForm, effectiveForm, nativeGaps, nativePapers, nativeReviewGaps, paperFormView, pinLinkedDecisions, readTypedAnswers } from './pilot-forms.mjs';

export const accounts = { preparer: 'nomin', reviewer: 'temuulen', partner: 'bat' };
const workstream = '3.1.2';
const forms = JSON.parse(readFileSync(new URL('../src/data/forms.json', import.meta.url), 'utf8'));
const shownForms = m => [...new Set([...(m.extendedPilot ? ['1.3','2.6','4.4'] : [workstream,'4.4']),
  reportForm(m.engagements[0]), ...adoptedForms(m), ...nativePapers(m).map(w => w.form)])];
const fieldworkForms = m => m.extendedPilot ? adoptedForms(m) : [workstream, ...adoptedForms(m).filter(f => f !== workstream)];

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

function evidenceGaps(m, form) {
  const completed = m.requests.some(r => r.form === form && r.dispatch === 'issued' && r.status === 'complete');
  const linked = m.work[workKey(m.engagement, form)].evidence.some(id =>
    m.evidence.some(e => e.id === id && e.status === 'accepted'));
  return completed && linked ? [] : [form + ' · Хүсэлтийн хүлээн зөвшөөрсөн эх баримт шаардлагатай.'];
}

function pilotGaps(m) {
  return [
    ...fieldworkForms(m).flatMap(form => evidenceGaps(m, form)),
    ...(!m.extendedPilot && !isCurrentReview(m.work[workKey(m.engagement, workstream)]) ? ['3.1.2 · Одоогийн хувилбарын ахлахын хяналт'] : []),
    ...reportGaps(m, m.engagement),
    ...completionRegisterGaps(m),
    ...nativeReviewGaps(m),
  ];
}

function currentApproval(m, engagement) {
  return authorizationCurrent(m, engagement) &&
    (m.pilotAuthorization ? m.pilotAuthorization === registerStamp(m) : !registerPackage(m).length) &&
    (!m.extendedPilot || !!m.pilotReportDigest) &&
    !completionRegisterGaps(m).length && !nativeReviewGaps(m).length;
}

export function invalidateReport(m, reason) {
  const report = m.work[workKey(m.engagement, reportForm(m.engagements[0]))];
  if (!report || !['submitted', 'reviewed'].includes(report.status)) return;
  snapshot(report, m.person, reason);
  report.version++;
  report.status = 'changed';
  report.submittedVersion = undefined;
  report.completedAt = undefined;
}

export function syncReportForm(m) {
  if (!m.engagements.length) return;
  const engagement = m.engagements[0], decision = currentOpinion(m);
  if (!m.extendedPilot && !decision) return;
  const form = (decision && opinionForm(decision.values.opinion)) ?? reportForm(engagement);
  const previous = reportForm(engagement);
  engagement.reportForm = form;
  const paper = m.work[workKey(m.engagement, form)];
  paper.owner = engagement.team.reviewer;
  paper.reviewer = engagement.team.partner;
  if (form !== previous) invalidateReport(m, 'Санал дүгнэлтийн эх загвар өөрчлөгдөв');
}

export function pilotReport(m, files) {
  if (!m.engagements[0]?.intake.active) throw new PilotError(409, 'Идэвхтэй гэрээт ажил шаардлагатай.');
  if (currentApproval(m, m.engagements[0])) {
    const artifact = files.authorization()?.authorization.artifact;
    if (artifact) return artifact;
  }
  if (files.archive.isSealed(m) || pilotGaps(m).length) throw new PilotError(409, 'Тайлангийн одоогийн хяналт шаардлагатай.');
  return renderReport(m);
}

export function pilotView(m, role, revision, files) {
  const engagement = m.engagements[0];
  const resources = { registers: registerView(m), programmes: pilotProgrammes, rules: programmeView(m), forms: forms.map(({ id, title }) => ({ id, title })),
    archive: files.archive.view(m, role), extended: !!m.extendedPilot };
  if (!engagement) return { role, revision, engagement: null, ...resources };
  const sealed = resources.archive.packages.length > 0 && !resources.archive.reopened;
  if (sealed && role !== 'partner') {
    const archiveKinds = new Set(registers.filter(r => ['archive','firm'].includes(r.section)).map(r => r.id));
    const hideDigest = ({ verification, ...row }) => {
      if (!verification) return row;
      const { digest: _, ...safe } = verification;
      return { ...row, verification: safe };
    };
    return {
      role, revision, ...resources, rules: [], registers: resources.registers.filter(r =>
        archiveKinds.has(r.kind) && (!archiveGrantKinds.includes(r.kind) || r.owner === role || r.values.accessor === role)
      ).map(r => ({ ...hideDigest(r), history: r.history.map(hideDigest) })),
      engagement: { client: engagement.client, active: engagement.intake.active, period: m.bench.periods[engagement.id],
        reportDate: engagement.reportDate, decisions: [], acceptanceGaps: [], firm: [] },
      papers: [], requests: [], evidence: [],
    };
  }
  const papers = shownForms(m).map(form => {
    const w = m.work[workKey(engagement.id, form)];
    const template = paperFormView(m, w, files);
    const oldDigests = new Set(w.history.flatMap(h => h.values.templateDigest && h.values.templateDigest !== template?.digest ? [h.values.templateDigest] : []));
    return { ...w, ...(template && { template, nativeGaps: nativeGaps(m, w, files) }),
      ...(oldDigests.size && { oldTemplates: Object.fromEntries([...oldDigests].map(hash => [hash, files.template(hash)])) }),
      editable: !sealed && canEdit(m, w), reviewable: !sealed && canReviewWork(m, w) };
  });
  return {
    role, revision, ...resources, fieldwork: fieldworkForms(m), statementLines: m.pilotStatementLines ?? {},
    delivery: {
      id: engagement.id, person: m.person,
      tasks: m.tasks.filter(t => t.engagement === engagement.id && (role !== 'preparer' || t.owner === m.person)),
      events: m.events.filter(e => e.engagement === engagement.id && (role !== 'preparer' || e.owner === m.person)),
    },
    impacts: m.impacts.filter(i => !i.resolved),
    engagement: {
      client: engagement.client, active: engagement.intake.active, period: m.bench.periods[engagement.id],
      reportDate: engagement.reportDate, statements: engagement.statements, decisions: engagement.decisions ?? [],
      acceptanceGaps: acceptanceRegisterGaps(m), firm: m.pilotFirm ?? [],
    },
    papers, requests: m.requests, evidence: m.evidence.map(e => ({ ...e, sha256: files.get(e.id)?.sha256 })),
    gaps: pilotGaps(m), activity: m.activity.slice(0, 30),
    authorized: engagement.authorized && {
      at: engagement.authorized.at, report: engagement.authorized.report, fs: engagement.authorized.fs,
      current: currentApproval(m, engagement), count: engagement.authorizationHistory.length,
      artifactSha256: m.pilotReportDigest,
    },
  };
}

export function deliverySummary(m, role, archive) {
  const engagement = m.engagements[0];
  if (!engagement.intake.active || archive.isSealed(m)) return null;
  const papers = shownForms(m).map(form => m.work[workKey(engagement.id, form)])
    .filter(w => w.required && !w.naReason && (role !== 'preparer' || w.owner === m.person));
  const open = papers.filter(w => !isCurrentReview(w));
  return {
    reviewed: papers.length - open.length,
    applicable: papers.length,
    tasks: m.tasks.filter(t => t.engagement === engagement.id && !t.done && (role !== 'preparer' || t.owner === m.person)).length,
    deadlines: open.filter(w => w.due).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 3)
      .map(({ form, title, due }) => ({ form, title, due })),
  };
}

export function pilotAction(m, role, action, data, files) {
  const sealed = files.archive.isSealed(m);
  if (action === 'register') {
    const section = registers.find(r => r.id === data?.kind)?.section;
    if (sealed && section && !['archive', 'firm'].includes(section)) throw new PilotError(409, 'Архив түгжээтэй. Агуулгын өөрчлөлт зөвшөөрнө үү.');
    const before = registerStamp(m);
    registerAction(m, role, data, files);
    if (m.engagements.length) syncReportForm(m);
    if (before !== registerStamp(m) && !sealed) invalidateReport(m, 'Тайланд ашиглах бүртгэлийн хувилбар өөрчлөгдөв');
    return;
  }
  if (action === 'create') {
    requireActor(role === 'reviewer' || role === 'partner');
    if (m.engagements.length) throw new PilotError(409, 'Туршилтын гэрээт ажил бүртгэгдсэн.');
    if (data?.includePreparer !== undefined && !['yes','no'].includes(data.includePreparer)) throw new PilotError(400, 'Бэлтгэгчийн томилгоог шалгана уу.');
    const contact = { id: randomUUID(), name: input(data, 'contact', 150), email: input(data, 'email', 254), role: '', body: '', signer: true };
    const company = createCompany(m, {
      name: input(data, 'client', 200), legalForm: input(data, 'legalForm', 50), registration: input(data, 'registration', 50),
      framework: input(data, 'framework', 100), contacts: [contact], bodies: [],
    }, '');
    createEngagement(m, company, { start: input(data, 'start', 10), end: input(data, 'end', 10) },
      input(data, 'reportDate', 10), accounts, forms);
    m.extendedPilot = data.extended === 'yes';
    m.syntheticPilot = data.synthetic === 'yes';
    syncReportForm(m);
    return;
  }
  const engagement = m.engagements[0];
  if (!engagement) throw new PilotError(409, 'Гэрээт ажил үүсгэнэ үү.');
  if (action === 'activate') {
    requireActor(role === 'partner');
    if (engagement.intake.active) throw new PilotError(409, 'Гэрээт ажил идэвхтэй байна.');
    const gaps = acceptanceRegisterGaps(m);
    if (gaps.length) throw new PilotError(409, gaps.join(' · '));
    setEngagementDecision(m, 'independence', true, input(data, 'independence'));
    setEngagementDecision(m, 'termsAgreed', true, input(data, 'letter'));
    setEngagementDecision(m, 'acceptance', 'accepted', input(data, 'assessment'));
    activateEngagement(m);
    m.pilotFirm = firmSnapshot(m);
    return;
  }
  if (action === 'support-upload' || action === 'support-assess') {
    if (sealed) throw new PilotError(409, 'Архив түгжээтэй.');
    if (action === 'support-upload') {
      const { name, bytes } = fileInput(data), id = randomUUID();
      m.evidence.push({ id, name, engagement: engagement.id, version: 1, type: 'FILE',
        obtained: new Date().toISOString().slice(0, 10), source: input(data, 'source', 200),
        status: 'received', specimen: false, anchor: '', text: '', original: true, uploadedBy: role });
      files.add(id, name, bytes);
      recordEvent(m, 'Үнэлэх эх файл бүртгэв · ' + name);
    } else {
      const item = m.evidence.find(e => e.id === data?.id && e.engagement === m.engagement && !e.request);
      requireActor(item && role !== 'preparer' && item.uploadedBy !== role);
      if (item.status !== 'received' || !['accepted','rejected'].includes(data.result)) throw new PilotError(409, 'Үнэлэх шинэ эх файл шаардлагатай.');
      item.status = data.result;
      item.assessment = input(data, 'reason');
      recordEvent(m, 'Эх файлын үнэлгээ · ' + item.name);
    }
    return;
  }
  if (action === 'form-use') {
    requireActor(role !== 'preparer');
    if (sealed) throw new PilotError(409, 'Архив түгжээтэй.');
    const form = input(data, 'form', 32);
    if (/^4\.1\.A[1-4]$/.test(form) && form !== reportForm(engagement)) throw new PilotError(409, 'Одоогийн санал дүгнэлтийн маягтыг ашиглана уу.');
    if (m.extendedPilot && formContract(form)?.family === 'programme' && !adoptedForms(m).includes(form)) {
      throw new PilotError(409, 'Баталж хэрэгжүүлсэн аудитын хөтөлбөр шаардлагатай.');
    }
    if (bindForm(m, role, form, data, files) && form !== reportForm(engagement)) invalidateReport(m, 'Тайланд ашиглах маягтын хувилбар өөрчлөгдөв');
    return;
  }
  const earlyPaper = ['save','submit','review','return','respond','clear'].includes(action) && m.pilotForms?.[data?.form] &&
    m.work[workKey(m.engagement, data.form)]?.stage === 1;
  if (!engagement.intake.active && !earlyPaper) throw new PilotError(409, 'Партнер гэрээт ажлыг идэвхжүүлнэ.');
  if (action === 'archive-seal' || action === 'archive-dispose') {
    requireActor(role === 'partner');
    if (action === 'archive-seal') {
      if (!currentRelease(m, engagement) || !currentApproval(m, engagement) || m.pilotIssue?.authorizationAt !== engagement.authorized.at) throw new PilotError(409, 'Одоогийн зөвшөөрсөн багцыг гаргана уу.');
      files.archive.seal(m, files.authorization());
    } else files.archive.dispose(m, input(data, 'id', 40));
    recordEvent(m, action === 'archive-seal' ? 'Эцсийн архивын багцыг түгжив' : 'Туршилтын архивын устгалын шийдвэрийг хэрэгжүүлэв');
    return;
  }
  if (sealed) throw new PilotError(409, 'Архив түгжээтэй. Агуулгын өөрчлөлт зөвшөөрнө үү.');
  if (action === 'report-date') {
    requireActor(role === 'partner');
    if (!m.extendedPilot) throw new PilotError(409, 'Дэлгэрэнгүй горим шаардлагатай.');
    const date = input(data, 'date', 10);
    if (!validDate(date) || date < m.bench.periods[engagement.id].end) throw new PilotError(400, 'Зорилтот тайлангийн өдрийг шалгана уу.');
    if (date === engagement.reportDate) return;
    const previous = engagement.reportDate;
    engagement.reportDate = date;
    engagement.reportVersion++;
    invalidateReport(m, 'Зорилтот тайлангийн өдөр өөрчлөгдөв');
    recordEvent(m, `Тайлангийн өдөр ${previous} → ${date}`);
    return;
  }
  if (action === 'issue') {
    requireActor(role === 'partner');
    if (!currentApproval(m, engagement) || pilotGaps(m).length) throw new PilotError(409, 'Одоогийн багцын зөвшөөрөл шаардлагатай.');
    if (m.pilotIssue?.authorizationAt === engagement.authorized.at) return;
    const reference = input(data, 'reference', 200);
    issueReport(m);
    const artifact = files.authorization()?.authorization.artifact;
    if (m.pilotReportDigest && (!artifact || artifact.sha256 !== m.pilotReportDigest || sha256(artifact.html) !== artifact.sha256)) {
      throw new PilotError(409, 'Зөвшөөрсөн тайлангийн хэш таарахгүй.');
    }
    m.pilotIssue = { at: new Date().toISOString(), by: role, reference, authorizationAt: engagement.authorized.at, reportSha256: artifact?.sha256 };
    return;
  }
  if (action === 'request') {
    const title = input(data, 'title', 200);
    const form = data.form || workstream;
    if (!fieldworkForms(m).includes(form)) throw new PilotError(409, 'Хэрэгжүүлсэн хөтөлбөр сонгоно уу.');
    createRequest(m, { title, form, contactId: m.bench.clients[engagement.id].contacts[0].id,
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
    const { name, bytes } = fileInput(data);
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
    const lines = m.extendedPilot ? parseStatementLines(input(data, 'lines')) : {};
    const previous = engagement.fsVersion;
    saveStatements(m, input(data, 'statements'), input(data, 'disclosures'));
    if (JSON.stringify(lines) !== JSON.stringify(m.pilotStatementLines ?? {}) && previous === engagement.fsVersion) {
      engagement.fsVersion++;
      engagement.statements.version = engagement.fsVersion;
      recordEvent(m, 'СТ мөрийн багцын шинэ хувилбар хадгалав');
    }
    m.pilotStatementLines = lines;
    bindStatements(m);
    if (previous !== engagement.fsVersion) invalidateReport(m, 'Тайлангийн холбогдох СТ багц өөрчлөгдөв');
    return;
  }
  if (action === 'authorize') {
    requireActor(role === 'partner');
    const gaps = pilotGaps(m);
    if (gaps.length) throw new PilotError(409, gaps.join(' · '));
    if (currentApproval(m, engagement)) return;
    if (authorizationCurrent(m, engagement)) engagement.reportVersion++;
    authorizeReport(m);
    m.pilotAuthorization = registerStamp(m);
    const programmes = adoptedForms(m).map(form => m.work[workKey(m.engagement, form)]);
    const native = nativePapers(m);
    const supporting = registerPackage(m);
    const artifact = renderReport(m);
    files.storeTemplate(artifact.templateSha256, formContract(artifact.form));
    const templateIds = [artifact.templateSha256, ...supporting.flatMap(r => r.template ? [r.template.digest] : []), ...native.map(w => w.values.templateDigest)];
    const templates = [...new Set(templateIds)].map(hash => ({ hash, contract: files.template(hash) }));
    if (templates.some(t => !t.contract)) throw new PilotError(409, 'Баталсан эх загварын хувилбар олдсонгүй.');
    const ids = new Set([...engagement.authorized.package.evidence.map(e => e.id), ...registerEvidence(m), ...[...programmes,...native].flatMap(w => w.evidence)]);
    const linked = m.evidence.filter(e => ids.has(e.id)).map(({ id, version, status }) => ({ id, version, status }));
    m.pilotReportDigest = artifact.sha256;
    files.authorize({
      ...engagement.authorized, artifact, registerStamp: m.pilotAuthorization, registers: supporting, templates,
      firm: m.pilotFirm, statementLines: m.pilotStatementLines, programmePapers: programmes.map(w => ({
        id: w.id, version: w.version, reviewedVersion: w.reviewedVersion, values: { ...w.values }, evidence: [...w.evidence],
      })),
      ...(native.length && { nativePapers: native.map(w => ({
        id: w.id, version: w.version, reviewedVersion: w.reviewedVersion, values: { ...w.values }, evidence: [...w.evidence],
      })) }),
    }, linked.map(e => {
      const file = files.get(e.id);
      if (!file) throw new PilotError(409, 'Зөвшөөрөх багцын эх файл олдсонгүй.');
      return { ...e, ...file };
    }));
    return;
  }
  if (action === 'resolve-impact') {
    requireActor(role === 'reviewer');
    const impact = m.impacts.find(i => i.id === data?.id && i.engagement === m.engagement && !i.resolved);
    if (!impact || !isCurrentReview(m.work[workKey(m.engagement, impact.source)])) throw new PilotError(409, 'Эх ажлын одоогийн хяналт шаардлагатай.');
    impact.resolution = input(data, 'reason');
    impact.resolved = true;
    recordEvent(m, impact.source + ' · Өөрчлөлтийн нөлөөг үнэлэв');
    return;
  }
  if (action === 'task-add') {
    const due = input(data, 'due', 10), title = input(data, 'title', 200);
    const assignee = data?.owner || role;
    requireActor(Object.hasOwn(accounts, assignee) && (role !== 'preparer' || assignee === role));
    if (!validDate(due)) throw new PilotError(400, 'Даалгаврын огноог шалгана уу.');
    const form = data.form || undefined;
    if (form && !shownForms(m).includes(form)) throw new PilotError(404, 'Туршилтын ажлын баримт олдсонгүй.');
    m.tasks.push({ id: randomUUID(), engagement: engagement.id, title, owner: accounts[assignee], due, done: false, kind: 'task', form });
    recordEvent(m, 'Даалгавар нэмэв · ' + title, form);
    return;
  }
  if (action === 'task-status') {
    const task = m.tasks.find(t => t.id === data?.id && t.engagement === engagement.id);
    requireActor(task?.owner === m.person);
    if (!['yes','no'].includes(data.done)) throw new PilotError(400, 'Даалгаврын төлөвийг шалгана уу.');
    const done = data.done === 'yes';
    if (done === task.done) return;
    task.done = done;
    recordEvent(m, (done ? 'Даалгавар дуусгав · ' : 'Даалгавар дахин нээв · ') + task.title, task.form);
    return;
  }
  const paper = shownForms(m).includes(data?.form) && m.work[workKey(engagement.id, data.form)];
  if (!paper) throw new PilotError(404, 'Туршилтын ажлын баримт олдсонгүй.');
  switch (action) {
    case 'schedule': {
      requireActor(role !== 'preparer');
      const start = input(data, 'start', 10), due = input(data, 'due', 10);
      if (!validDate(start) || !validDate(due) || start > due) throw new PilotError(400, 'Ажлын төлөвлөсөн хугацааг шалгана уу.');
      if (paper.start === start && paper.due === due) return;
      reschedule(m, paper.id, due, start);
      if (!paper.baselineDue) {
        paper.baselineStart = start;
        paper.baselineDue = due;
      }
      break;
    }
    case 'save': {
      requireActor(canEdit(m, paper));
      const version = paper.version;
      const typed = data?.answers !== undefined ? readTypedAnswers(m, paper, data, files) : null;
      const values = { ...(typed?.values ?? paper.values) };
      if (!paper.form.startsWith('F-')) {
        values.execution = input(data, 'execution');
        values.conclusion = input(data, 'conclusion');
      }
      if (paper.form === '1.3') for (const key of ['benchmark','percentage','performance','trivial']) values[key] = input(data, key, 32);
      if (paper.form === '2.6') {
        if (!['none','partial','full','na'].includes(data.reliance)) throw new PilotError(400, 'Хяналтад найдах шийдвэр шаардлагатай.');
        values.controlsReliance = data.reliance;
        values.relianceBasis = values.conclusion;
      }
      changeWork(m, paper.id, values, typed?.evidence);
      if (paper.form !== reportForm(engagement) && version !== paper.version) invalidateReport(m, 'Тайланд тулгуурласан ажлын хувилбар өөрчлөгдөв');
      break;
    }
    case 'submit':
      requireActor(canEdit(m, paper));
      if (!paper.form.startsWith('F-') && (!paper.values.execution || !paper.values.conclusion)) throw new PilotError(409, 'Хийсэн ажил ба дүгнэлтийг хадгална уу.');
      checkNative(m, paper, files);
      if (fieldworkForms(m).includes(paper.form) && evidenceGaps(m, paper.form).length) throw new PilotError(409, evidenceGaps(m, paper.form)[0]);
      if (paper.form === '1.3' && !materiality(m, m.engagement)) throw new PilotError(409, 'Материаллаг байдлын дүн ба хувийг шалгана уу.');
      pinLinkedDecisions(m, paper, files);
      submitWork(m, paper.id);
      break;
    case 'return':
      requireActor(canReviewWork(m, paper));
      returnWork(m, paper.id, input(data, 'reason'), 'conclusion');
      break;
    case 'review':
      requireActor(canReviewWork(m, paper));
      checkNative(m, paper, files);
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

function checkNative(m, paper, files) {
  if (!effectiveForm(m, paper.form, files)) return;
  if (m.extendedPilot && formContract(paper.form)?.family === 'programme' && !adoptedForms(m).includes(paper.form)) {
    throw new PilotError(409, 'Аудитын хөтөлбөрийн одоогийн шийдвэр шаардлагатай.');
  }
  const gaps = nativeGaps(m, paper, files);
  if (gaps.length) throw new PilotError(409, gaps.join(' · '));
}

function parseStatementLines(text) {
  const rows = new Map();
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const [code, amount, extra] = line.split(',').map(value => value.trim());
    if (!code || !/^-?\d+(\.\d+)?$/.test(amount ?? '') || !Number.isFinite(Number(amount)) || extra !== undefined || rows.has(code)) {
      throw new PilotError(400, 'СТ мөр бүр давхардалгүй КОД,ДҮН байна.');
    }
    rows.set(code, Number(amount));
  }
  return Object.fromEntries(rows);
}

function fileInput(data) {
  const name = input(data, 'name', 180), encoded = input(data, 'base64', 7_000_000);
  if (!/^[^\\/\x00-\x1f\x7f]+\.(pdf|png|jpe?g|docx|xlsx|csv)$/i.test(name) || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
    throw new PilotError(400, 'PDF, зураг, DOCX, XLSX эсвэл CSV файл сонгоно уу.');
  }
  const bytes = Buffer.from(encoded, 'base64');
  if (!bytes.length || bytes.length > 5_000_000 || bytes.toString('base64') !== encoded) throw new PilotError(400, 'Файлын хэмжээ 5 MB хүртэл байна.');
  return { name, bytes };
}
