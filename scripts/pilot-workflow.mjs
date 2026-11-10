import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createCompany, createEngagement, validDate } from '../src/lib/feature-workflows.ts';
import {
  activateEngagement, authorizeReport, authorizationCurrent, bindStatements, canEdit, canReviewWork,
  changeWork, clearNote, currentPackage, currentRelease, isCurrentReview, issueReport, materiality, recordEvent, reportGaps, respondNote,
  reassign, reportForm, reschedule, resolveFinding, returnWork, reviewWork, saveStatements, setEngagementDecision, snapshot, submitWork, workKey,
} from '../src/lib/workspace.ts';
import {
  acceptanceRegisterGaps, adoptedForms, archiveGrantKinds, completionRegisterGaps, currentOpinion, excludedForms, firmSnapshot, formContract, opinionForm, pendingProgrammes, pilotProgrammes, programmeDecision, programmeTemplates, programmeView,
  registerAction, registerEvidence, registerPackage, registerStamp, registerView,
  technicalEvidence, technicalForms, technicalRef,
} from './pilot-registers.mjs';
import { registers } from '../src/lib/pilot-registers.ts';
import { procedureOutcomes } from '../src/lib/pilot-forms.ts';
import { renderReport, sha256 } from './pilot-report.mjs';
import { bindForm, effectiveForm, nativeGaps, nativePapers, nativeReviewGaps, paperFormView, pinLinkedDecisions, readTypedAnswers } from './pilot-forms.mjs';
import { approvedStaffing, managedStaffing, requireSeat, seatFor, seats, staffingGaps } from './pilot-staffing.mjs';
import { approvedPopulation, populationAction, populationView } from './pilot-population.mjs';
import { samplingAction, samplingGap, samplingView, syncSamplePapers } from './pilot-sampling.mjs';
import { evidenceCurrent, isRequestAction, requestAction } from './pilot-requests.mjs';
import { journalAction, journalGap, journalView, syncJournalPapers } from './pilot-journals.mjs';
import { areaAction, areaEvidence, areaGap, areaView, areaWorkpaperRef, syncAreaPapers } from './pilot-area.mjs';
import { completionAction, completionEvidence, completionGaps, completionRef, completionView, syncCompletion } from './pilot-completion.mjs';
import { oversightTeamAction, oversightTeamView, qualityGaps, qualityRef } from './pilot-oversight.mjs';
import { currentSignature, signReport, strictRelease } from './pilot-release.mjs';

export const accounts = { preparer: 'nomin', reviewer: 'temuulen', partner: 'bat' };
const roleOf = person => seats.find(role => accounts[role] === person);
const workstream = '3.1.2';
const forms = JSON.parse(readFileSync(new URL('../src/data/forms.json', import.meta.url), 'utf8'));
const shownForms = m => [...new Set([...(m.extendedPilot ? ['1.3','2.6','4.4'] : [workstream,'4.4',...(m.pilotPopulation?.length?['1.3','2.6']:[])]),
  reportForm(m.engagements[0]), ...adoptedForms(m), ...(m.extendedPilot ? pendingProgrammes(m) : []),
  ...activeItems(m,technicalForms(m).map(form=>({form}))).map(item=>item.form), ...nativePapers(m).map(w => w.form)])];
export const fieldworkForms = m => m.extendedPilot ? adoptedForms(m) : [workstream, ...adoptedForms(m).filter(f => f !== workstream)];
const decisionRef = decision => decision ? decision.id + ':v' + decision.version : '';
const activeItems = (m, items) => {
  const excluded = m.extendedPilot ? new Set(excludedForms(m)) : new Set();
  return items.filter(item => !excluded.has(item.form));
};

function planningChanged(m, paper) {
  if (!m.extendedPilot || !['submitted','reviewed'].includes(paper.status)) return false;
  if (paper.values['planning.decision']) {
    const current = programmeDecision(m, paper.form);
    return current?.values.decision !== 'adopt' || decisionRef(current) !== paper.values['planning.decision'];
  }
  return pendingProgrammes(m).includes(paper.form) || excludedForms(m).includes(paper.form);
}

function syncPlanningPapers(m) {
  for (const paper of Object.values(m.work).filter(w => planningChanged(m, w))) {
    snapshot(paper, m.person, 'Төлөвлөлтийн өмнөх шийдвэрийн хувилбар');
    paper.version++;
    paper.status = 'changed';
    paper.submittedVersion = undefined;
    paper.completedAt = undefined;
    recordEvent(m, paper.form + ' · Төлөвлөлтийн шийдвэр өөрчлөгдөв', paper.form);
  }
}

function syncFieldwork(m) {
  syncPlanningPapers(m);
  syncSamplePapers(m);
  syncJournalPapers(m);
  syncAreaPapers(m);
  syncCompletion(m);
  for (const form of technicalForms(m)) {
    const paper=m.work[workKey(m.engagement,form)], ref=technicalRef(m,form);
    if (!paper||!['submitted','reviewed'].includes(paper.status)||ref===paper.values['pilot.technical']) continue;
    snapshot(paper,m.person,'Тусгай горимын өмнөх хяналтыг хадгалав');
    paper.version++;
    paper.status='changed';
    paper.submittedVersion=undefined;
    paper.completedAt=undefined;
    recordEvent(m,form+' · Тусгай горимын эх бүртгэл өөрчлөгдөв',form);
  }
}

const fieldworkGap = (m,form) => samplingGap(m,form)||journalGap(m,form)||areaGap(m,form);
const technicalGaps = m => activeItems(m,technicalForms(m).map(form=>({form}))).flatMap(({form})=>{
  const paper=m.work[workKey(m.engagement,form)], ref=technicalRef(m,form);
  return ref&&isCurrentReview(paper)&&paper.values['pilot.technical']===ref?[]:[form+' · Тусгай горимын одоогийн хяналт'];
});

export function validMateriality(m) {
  const amounts = materiality(m,m.engagement);
  return amounts && Number.isFinite(amounts.overall) && amounts.performance < amounts.overall &&
    amounts.trivial <= amounts.performance ? amounts : null;
}

function reportWorkspace(m) {
  if (!m.extendedPilot || !excludedForms(m).length) return m;
  const work = Object.fromEntries(activeItems(m,Object.values(m.work)).map(w => [w.id,w]));
  return {...m,work,requests:activeItems(m,m.requests)};
}

export function emptyWorkspace() {
  return {
    schema: 2, person: '', engagement: '', work: {}, engagements: [], evidence: [], requests: [],
    tasks: [], events: [], findings: [], datasets: {}, runs: [], risks: [], impacts: [],
    samples: {}, library: { version: 1, draft: '', phase: 'published', adopted: {}, releases: [] }, activity: [],
  };
}

export function openPilotEngagement(m, data, company) {
  if (data?.includePreparer !== undefined && !['yes','no'].includes(data.includePreparer)) throw new PilotError(400, 'Бэлтгэгчийн томилгоог шалгана уу.');
  const id = createEngagement(m, company, { start: input(data, 'start', 10), end: input(data, 'end', 10) },
    input(data, 'reportDate', 10), accounts, forms);
  m.extendedPilot = data.extended === 'yes';
  m.syntheticPilot = data.synthetic === 'yes';
  syncReportForm(m);
  return m.engagements.find(e => e.id === id);
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
    evidenceCurrent(m,m.evidence.find(e => e.id === id)));
  return completed && linked ? [] : [form + ' · Хүсэлтийн хүлээн зөвшөөрсөн эх баримт шаардлагатай.'];
}

function pilotGaps(m,includeQuality=true) {
  return [
    ...fieldworkForms(m).flatMap(form => evidenceGaps(m, form)),
    ...fieldworkForms(m).map(form=>fieldworkGap(m,form)).filter(Boolean),
    ...(!m.extendedPilot && !isCurrentReview(m.work[workKey(m.engagement, workstream)]) ? ['3.1.2 · Одоогийн хувилбарын ахлахын хяналт'] : []),
    ...reportGaps(reportWorkspace(m), m.engagement),
    ...completionRegisterGaps(m),
    ...completionGaps(m),
    ...(includeQuality?qualityGaps(m):[]),
    ...technicalGaps(m),
    ...nativeReviewGaps(m),
    ...staffingGaps(m),
  ];
}

export function currentApproval(m, engagement) {
  return authorizationCurrent(reportWorkspace(m), engagement) &&
    (m.pilotAuthorization ? m.pilotAuthorization === registerStamp(m) : !registerPackage(m).length) &&
    (!m.extendedPilot || !!m.pilotReportDigest) &&
    (m.pilotCompletionAuthorization??':')===completionRef(m) &&
    (m.pilotQualityAuthorization??'')===qualityRef(m) && !qualityGaps(m).length &&
    !completionRegisterGaps(m).length && !completionGaps(m).length && !technicalGaps(m).length && !nativeReviewGaps(m).length && !staffingGaps(m).length &&
    !fieldworkForms(m).some(form=>fieldworkGap(m,form));
}

export function qualityBasis(m) {
  const e=m.engagements[0];
  const papers=shownForms(m).map(form=>{
    const paper=m.work[workKey(m.engagement,form)];
    return [form,paper.version,paper.reviewedVersion,paper.status,paper.evidence];
  });
  const {report:_,...pack}=currentPackage(reportWorkspace(m),e.id);
  return sha256(JSON.stringify([e.reportDate,pack,renderReport(m).sha256,registerStamp(m),completionRef(m),papers]));
}

export function qualityMaterial(m) {
  const engagement=m.engagements[0], forms=shownForms(m);
  const papers=forms.map(form=>{
    const {title,version,reviewedVersion,status,values,evidence}=m.work[workKey(m.engagement,form)];
    return {form,title,version,reviewedVersion,status,values,evidence};
  });
  const evidence=[...new Set([...papers.flatMap(p=>p.evidence),...registerEvidence(m),...completionEvidence(m),...areaEvidence(m,fieldworkForms(m))])];
  return {basis:qualityBasis(m),gaps:pilotGaps(m,false),artifact:renderReport(m),papers,evidence,client:engagement.client,reportDate:engagement.reportDate};
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
  const sealed = files.archive.isSealed(m);
  if (sealed && role !== 'partner') {
    const archiveKinds = new Set(registers.filter(r => ['archive','firm'].includes(r.section)).map(r => r.id));
    const hideDigest = ({ verification, ...row }) => {
      if (!verification) return row;
      const { digest: _, ...safe } = verification;
      return { ...row, verification: safe };
    };
    return {
      role, revision, ...resources, rules: [], registers: resources.registers.filter(r =>
        archiveKinds.has(r.kind) && (!archiveGrantKinds.includes(r.kind) || r.owner === role || r.values.accessor === role) &&
        (!(strictRelease(m)||m.pilotCustody)||!r.values.package||resources.archive.packages.some(p=>p.id===r.values.package))
      ).map(r => ({ ...hideDigest(r), history: r.history.map(hideDigest) })),
      engagement: { client: engagement.client, active: engagement.intake.active, period: m.bench.periods[engagement.id],
        reportDate: engagement.reportDate, decisions: [], acceptanceGaps: [], firm: [] },
      papers: [], requests: [], evidence: [],
    };
  }
  const papers = shownForms(m).map(form => {
    const w = m.work[workKey(engagement.id, form)];
    const decision = programmeDecision(m, form);
    const fieldGap = fieldworkGap(m,form);
    const changed = planningChanged(m,w) || !!fieldGap && ['submitted','reviewed'].includes(w.status);
    const planning = decision?.values.decision === 'adopt' ? {id:decision.id,version:decision.version,
      basis:decision.programmeBasis,template:decision.template} : undefined;
    const pendingPlanning = m.extendedPilot && pendingProgrammes(m).includes(form);
    const template = paperFormView(m, w, files);
    const oldDigests = new Set(w.history.flatMap(h => h.values.templateDigest && h.values.templateDigest !== template?.digest ? [h.values.templateDigest] : []));
    const canWork = !engagement.intake.active || !managedStaffing(m) || !!seatFor(m,role,w.start||w.due,w.due||w.start);
    return { ...w, ...(changed && {status:'changed',completedAt:undefined}),
      ...(planning && {planning}), ...(pendingPlanning && {pendingPlanning}),
      ...(fieldGap && {fieldGap}),
      ...(form === '1.3' && {materiality:validMateriality(m)}),
      ...(template && { template, nativeGaps: nativeGaps(m, w, files) }),
      ...(oldDigests.size && { oldTemplates: Object.fromEntries([...oldDigests].map(hash => [hash, files.template(hash)])) }),
      ...(m.pilotWorkAssignments?.[form] && { assignmentHistory: m.pilotWorkAssignments[form] }),
      ...(m.pilotStaffSignoffs?.[form] && { staffingSignoffs: m.pilotStaffSignoffs[form] }),
      editable: !sealed && canWork && canEdit(m, w), reviewable: !sealed && !changed && !pendingPlanning && canWork && canReviewWork(m, w) };
  });
  return {
    role, revision, ...resources, fieldwork: fieldworkForms(m), statementLines: m.pilotStatementLines ?? {},
    ...(m.extendedPilot && engagement.intake.active && !sealed && role !== 'preparer' && {programmeTemplates:programmeTemplates(m,files)}),
    delivery: {
      id: engagement.id, person: m.person,
      tasks: activeItems(m,m.tasks).filter(t => t.engagement === engagement.id && (role !== 'preparer' || t.owner === m.person)),
      events: m.events.filter(e => e.engagement === engagement.id && (role !== 'preparer' || e.owner === m.person)),
    },
    impacts: m.impacts.filter(i => !i.resolved),
    engagement: {
      client: engagement.client, active: engagement.intake.active, period: m.bench.periods[engagement.id],
      reportDate: engagement.reportDate, statements: engagement.statements, decisions: engagement.decisions ?? [],
      acceptanceGaps: acceptanceRegisterGaps(m), firm: m.pilotFirm ?? [],
    },
    papers, requests: activeItems(m,m.requests), requestContacts:m.bench.clients[m.engagement].contacts.map(({id,name,email})=>({id,name,email})),
    evidence: m.evidence.map(e => ({ ...e, current:evidenceCurrent(m,e),sha256: files.get(e.id)?.sha256 })),
    ...(populationView(m) && {population:populationView(m)}),
    ...(m.pilotSamples && {samples:samplingView(m)}),
    ...(m.pilotJournals && {journals:journalView(m)}),
    ...(m.pilotAreaRuns && {areas:areaView(m)}),
    ...(engagement.intake.active&&!sealed&&{completion:completionView(m)}),
    ...(role!=='preparer'&&{oversight:oversightTeamView(m)}),
    ...(role==='partner'&&{release:{strict:strictRelease(m),signature:currentSignature(m,files),deliveries:files.deliveries()}}),
    ...((m.pilotSamples||m.pilotJournals||m.pilotAreaRuns) && {fieldFindings:m.findings.filter(f=>/^(SAMPLE|JOURNAL|AREA)-/.test(f.id))}),
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
  const open = papers.filter(w => !isCurrentReview(w) || planningChanged(m,w) || fieldworkGap(m,w.form));
  return {
    reviewed: papers.length - open.length,
    applicable: papers.length,
    tasks: activeItems(m,m.tasks).filter(t => t.engagement === engagement.id && !t.done && (role !== 'preparer' || t.owner === m.person)).length,
    deadlines: open.filter(w => w.due).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 3)
      .map(({ form, title, due }) => ({ form, title, due })),
  };
}

export function pilotAction(m, role, action, data, files) {
  if (typeof action!=='string') throw new PilotError(400,'Үйлдэл шаардлагатай.');
  const sealed = files.archive.isSealed(m);
  if (!sealed) syncFieldwork(m);
  if (action === 'register') {
    const section = registers.find(r => r.id === data?.kind)?.section;
    if (sealed && section && !['archive', 'firm'].includes(section)) throw new PilotError(409, 'Архив түгжээтэй. Агуулгын өөрчлөлт зөвшөөрнө үү.');
    if (m.engagements[0]?.intake.active && managedStaffing(m) && ['planning','fieldwork','completion'].includes(section)) requireSeat(m,files,role);
    const before = registerStamp(m);
    registerAction(m, role, data, files);
    if (m.extendedPilot && data.kind === 'M07-F01' && data.operation === 'approve') {
      const adopted = adoptedForms(m).map(form => programmeDecision(m,form)).find(row => row.id === data.id);
      if (adopted?.template.number !== undefined) {
        bindForm(m,role,adopted.template.form,{},files,adopted.template);
      }
    }
    if (!sealed) syncFieldwork(m);
    if (m.engagements.length) syncReportForm(m);
    if (before !== registerStamp(m) && !sealed) invalidateReport(m, 'Тайланд ашиглах бүртгэлийн хувилбар өөрчлөгдөв');
    return;
  }
  if (action === 'create') {
    requireActor(role === 'reviewer' || role === 'partner');
    if (m.engagements.length) throw new PilotError(409, 'Туршилтын гэрээт ажил бүртгэгдсэн.');
    const contact = { id: randomUUID(), name: input(data, 'contact', 150), email: input(data, 'email', 254), role: '', body: '', signer: true };
    const company = createCompany(m, {
      name: input(data, 'client', 200), legalForm: input(data, 'legalForm', 50), registration: input(data, 'registration', 50),
      framework: input(data, 'framework', 100), contacts: [contact], bodies: [],
    }, '');
    openPilotEngagement(m, data, company);
    return;
  }
  const engagement = m.engagements[0];
  if (!engagement) throw new PilotError(409, 'Гэрээт ажил үүсгэнэ үү.');
  if (action === 'staffing-enable') {
    requireActor(role === 'partner');
    if (sealed) throw new PilotError(409, 'Архив түгжээтэй.');
    if (managedStaffing(m)) return;
    m.pilotStaffingEnabled = true;
    for (const capacity of seats) requireSeat(m,files,capacity);
    m.pilotStaffingAccepted = approvedStaffing(m).filter(s=>s.current);
    recordEvent(m, 'Одоогийн баталсан багийн томилгоог холбов');
    return;
  }
  if (['quality-policy','quality-response','archive-offer-custody'].includes(action)) {
    if (managedStaffing(m)) requireSeat(m,files,role);
    oversightTeamAction(m,role,action,data,files);
    return;
  }
  if (action === 'activate') {
    requireActor(role === 'partner');
    if (engagement.intake.active) throw new PilotError(409, 'Гэрээт ажил идэвхтэй байна.');
    const gaps = [...acceptanceRegisterGaps(m),...staffingGaps(m)];
    if (gaps.length) throw new PilotError(409, gaps.join(' · '));
    if (managedStaffing(m)) {
      for (const capacity of seats) requireSeat(m,files,capacity);
      m.pilotStaffingAccepted = approvedStaffing(m).filter(s=>s.current);
    }
    setEngagementDecision(m, 'independence', true, input(data, 'independence'));
    setEngagementDecision(m, 'termsAgreed', true, input(data, 'letter'));
    setEngagementDecision(m, 'acceptance', 'accepted', input(data, 'assessment'));
    activateEngagement(m);
    m.pilotFirm = firmSnapshot(m);
    return;
  }
  if (action === 'support-upload' || action === 'support-assess') {
    if (sealed) throw new PilotError(409, 'Архив түгжээтэй.');
    if (engagement.intake.active && managedStaffing(m)) requireSeat(m,files,role);
    if (action === 'support-upload') {
      const { name, bytes } = fileInput(data), id = randomUUID();
      m.evidence.push({ id, name, engagement: engagement.id, version: 1, type: 'FILE',
        obtained: new Date().toISOString().slice(0, 10), source: input(data, 'source', 200),
        status: 'received', specimen: false, anchor: '', text: '', original: true, uploadedBy: role });
      files.add(id, name, bytes);
      recordEvent(m, 'Үнэлэх эх файл бүртгэв · ' + name);
    } else {
      const item = m.evidence.find(e => e.id === data?.id && e.engagement === m.engagement && !e.request && !e.population);
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
    if (m.extendedPilot && programmeDecision(m,form)?.template.number !== undefined) {
      throw new PilotError(409, 'Хөтөлбөрийн маягтын хувилбарыг төлөвлөлтийн шийдвэрээр шинэчилнэ үү.');
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
      if (!currentRelease(reportWorkspace(m), engagement) || !currentApproval(m, engagement) || m.pilotIssue?.authorizationAt !== engagement.authorized.at) throw new PilotError(409, 'Одоогийн зөвшөөрсөн багцыг гаргана уу.');
      const deliveries=files.deliveries().filter(row=>row.issued===m.pilotIssue.at);
      if (strictRelease(m)&&!deliveries.some(row=>row.state==='received')) throw new PilotError(409,'Яг энэ гаргалтын бодит хүлээн авалт шаардлагатай.');
      files.archive.seal(m, files.authorization(), deliveries);
    } else files.archive.dispose(m, input(data, 'id', 40));
    recordEvent(m, action === 'archive-seal' ? 'Эцсийн архивын багцыг түгжив' : 'Туршилтын архивын устгалын шийдвэрийг хэрэгжүүлэв');
    return;
  }
  if (sealed) throw new PilotError(409, 'Архив түгжээтэй. Агуулгын өөрчлөлт зөвшөөрнө үү.');
  if (action==='report-sign') {
    signReport(m,role,files);
    return;
  }
  if (action.startsWith('correction-')||action.startsWith('completion-')) {
    if (managedStaffing(m)) requireSeat(m,files,role);
    if (completionAction(m,role,action,data,files)) {
      syncFieldwork(m);
      invalidateReport(m,'Дуусгалтын хянасан суурь өөрчлөгдөв');
    }
    return;
  }
  if (action.startsWith('population-')) {
    if (managedStaffing(m)) requireSeat(m,files,role);
    const before = approvedPopulation(m)?.version;
    populationAction(m,role,action,data,files);
    if (before !== approvedPopulation(m)?.version) {
      syncFieldwork(m);
      invalidateReport(m,'Тайланд ашиглах эх олонлогийн хувилбар өөрчлөгдөв');
    }
    return;
  }
  if (action.startsWith('sample-') || action.startsWith('journal-') || action.startsWith('area-') || action==='fieldwork-resolve-finding') {
    if (managedStaffing(m)) requireSeat(m,files,role);
    let changed;
    if (action==='sample-resolve-finding'||action==='fieldwork-resolve-finding') {
      const finding=m.findings.find(f=>f.id===data.id&&/^(SAMPLE|JOURNAL|AREA|MANUAL)-/.test(f.id));
      requireActor(role==='partner'&&finding);
      const reason=input(data,'reason');
      if (finding.resolution===reason) return;
      resolveFinding(m,data.id,reason);
      changed=true;
    } else if (action.startsWith('journal-')) changed=journalAction(m,role,action,data,fieldworkForms(m));
    else if (action.startsWith('area-')) changed=areaAction(m,role,action,data,files,fieldworkForms(m));
    else changed=samplingAction(m,role,action,data,fieldworkForms(m));
    syncFieldwork(m);
    if (changed&&['sample-resolve-finding','fieldwork-resolve-finding','sample-design','sample-test','journal-run','journal-investigate','area-run','area-dispose'].includes(action)) {
      invalidateReport(m,'Тайланд ашиглах гүйцэтгэлийн ажил өөрчлөгдөв');
    }
    return;
  }
  if (action === 'report-date') {
    requireActor(role === 'partner');
    if (!m.extendedPilot&&!m.pilotManagement) throw new PilotError(409, 'Дэлгэрэнгүй горим шаардлагатай.');
    const date = input(data, 'date', 10);
    if (!validDate(date) || date < m.bench.periods[engagement.id].end) throw new PilotError(400, 'Зорилтот тайлангийн өдрийг шалгана уу.');
    if (date === engagement.reportDate) return;
    const previous = engagement.reportDate;
    engagement.reportDate = date;
    engagement.reportVersion++;
    syncCompletion(m);
    invalidateReport(m, 'Зорилтот тайлангийн өдөр өөрчлөгдөв');
    recordEvent(m, `Тайлангийн өдөр ${previous} → ${date}`);
    return;
  }
  if (action === 'issue') {
    requireActor(role === 'partner');
    if (!currentApproval(m, engagement) || pilotGaps(m).length) throw new PilotError(409, 'Одоогийн багцын зөвшөөрөл шаардлагатай.');
    if (m.pilotIssue?.authorizationAt === engagement.authorized.at) return;
    const signature=currentSignature(m,files);
    if (strictRelease(m)&&!signature) throw new PilotError(409,'Яг энэ зөвшөөрсөн тайланд локал гарын үсэг шаардлагатай.');
    const reference = input(data, 'reference', 200);
    issueReport(reportWorkspace(m));
    const artifact = files.authorization()?.authorization.artifact;
    if (m.pilotReportDigest && (!artifact || artifact.sha256 !== m.pilotReportDigest || sha256(artifact.html) !== artifact.sha256)) {
      throw new PilotError(409, 'Зөвшөөрсөн тайлангийн хэш таарахгүй.');
    }
    m.pilotIssue = { at: new Date().toISOString(), by: role, reference, authorizationAt: engagement.authorized.at, reportSha256: artifact?.sha256,
      ...(signature&&{signature}) };
    return;
  }
  if (isRequestAction(action)) {
    if (requestAction(m,role,action,data,files,fieldworkForms(m),workstream)) {
      syncFieldwork(m);
      invalidateReport(m,'Тайлантай холбоотой нотлох баримтын хүсэлт өөрчлөгдөв');
    }
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
    syncCompletion(m);
    if (previous !== engagement.fsVersion) invalidateReport(m, 'Тайлангийн холбогдох СТ багц өөрчлөгдөв');
    return;
  }
  if (action === 'authorize') {
    requireActor(role === 'partner');
    const gaps = pilotGaps(m);
    if (gaps.length) throw new PilotError(409, gaps.join(' · '));
    if (currentApproval(m, engagement)) return;
    const reporting = reportWorkspace(m);
    if (authorizationCurrent(reporting, engagement)) engagement.reportVersion++;
    authorizeReport(reporting);
    m.pilotAuthorization = registerStamp(m);
    m.pilotCompletionAuthorization = completionRef(m);
    m.pilotQualityAuthorization = qualityRef(m);
    const programmes = adoptedForms(m).map(form => m.work[workKey(m.engagement, form)]);
    const native = nativePapers(m);
    const supporting = registerPackage(m);
    const artifact = renderReport(m);
    files.storeTemplate(artifact.templateSha256, formContract(artifact.form));
    const templateIds = [artifact.templateSha256, ...supporting.flatMap(r => r.template ? [r.template.digest] : []), ...native.map(w => w.values.templateDigest)];
    const templates = [...new Set(templateIds)].map(hash => ({ hash, contract: files.template(hash) }));
    if (templates.some(t => !t.contract)) throw new PilotError(409, 'Баталсан эх загварын хувилбар олдсонгүй.');
    const population = approvedPopulation(m);
    const populationHistory = (m.pilotPopulation??[]).filter(v=>v.approval&&v!==population);
    const requestAudit = activeItems(m,m.requests).filter(r=>r.issuedAt);
    const confirmations = files.confirmations().filter(c=>c.state==='received'&&requestAudit.some(r=>r.id===c.request));
    const ids = new Set([...engagement.authorized.package.evidence.map(e => e.id), ...registerEvidence(m),
      ...[...programmes,...native].flatMap(w => w.evidence), ...(m.pilotTerms ? [m.pilotTerms.evidence] : []),
      ...(population?[population.evidence,population.controls.evidence.id]:[]),...areaEvidence(m,fieldworkForms(m)),...completionEvidence(m)]);
    const historical = new Set([...populationHistory.flatMap(v=>[v.evidence,v.controls.evidence.id]),
      ...requestAudit.flatMap(r=>(r.parts??[]).flatMap(p=>p.uses?.map(use=>use.evidence)??[])),...confirmations.map(c=>c.evidence)]);
    const linked = [...m.evidence.filter(e=>ids.has(e.id)),...m.evidence.filter(e=>!ids.has(e.id)&&historical.has(e.id))]
      .map(({ id, version, status }) => ({ id, version, status }));
    m.pilotReportDigest = artifact.sha256;
    files.authorize({
      ...engagement.authorized, artifact, registerStamp: m.pilotAuthorization, registers: supporting, templates,
      firm: m.pilotFirm, statementLines: m.pilotStatementLines, programmePapers: programmes.map(w => ({
        id: w.id, version: w.version, reviewedVersion: w.reviewedVersion, values: { ...w.values }, evidence: [...w.evidence],
      })),
      ...(native.length && { nativePapers: native.map(w => ({
        id: w.id, version: w.version, reviewedVersion: w.reviewedVersion, values: { ...w.values }, evidence: [...w.evidence],
      })) }),
      ...(m.pilotTerms && { terms: m.pilotTerms }),
      ...(population && { population }),
      ...(populationHistory.length && {populationHistory}),
      ...(requestAudit.length && {requestAudit}),
      ...(confirmations.length && {confirmations}),
      ...(m.pilotSamples && { samples:Object.fromEntries(Object.entries(samplingView(m)).filter(([form])=>fieldworkForms(m).includes(form))) }),
      ...(m.pilotJournals && { journals:Object.fromEntries(Object.entries(journalView(m)).filter(([form])=>fieldworkForms(m).includes(form))) }),
      ...(m.pilotAreaRuns && { areas:Object.fromEntries(Object.entries(areaView(m)).filter(([form])=>fieldworkForms(m).includes(form))) }),
      ...((m.pilotCorrections||m.pilotEvaluations||m.pilotManagement) && {completion:completionView(m)}),
      ...(m.pilotQuality && {quality:oversightTeamView(m).quality}),
      ...(technicalForms(m).length && {technicalPapers:activeItems(m,technicalForms(m).map(form=>m.work[workKey(m.engagement,form)]))
        .map(({id,version,reviewedVersion,values,evidence})=>({id,version,reviewedVersion,values,evidence}))}),
      ...(m.pilotIntake && { intake: m.pilotIntake }),
      ...(managedStaffing(m) && { staffing: approvedStaffing(m).filter(s=>s.current), acceptedStaffing: m.pilotStaffingAccepted,
        staffSignoffs: m.pilotStaffSignoffs ?? {} }),
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
    if (managedStaffing(m)) requireSeat(m,files,role);
    requireSeat(m, files, assignee, due);
    const form = data.form || undefined;
    if (form && !shownForms(m).includes(form)) throw new PilotError(404, 'Туршилтын ажлын баримт олдсонгүй.');
    m.tasks.push({ id: randomUUID(), engagement: engagement.id, title, owner: accounts[assignee], due, done: false, kind: 'task', form });
    recordEvent(m, 'Даалгавар нэмэв · ' + title, form);
    return;
  }
  if (action === 'task-status') {
    const task = m.tasks.find(t => t.id === data?.id && t.engagement === engagement.id);
    requireActor(task?.owner === m.person);
    if (!activeItems(m,[task]).length) throw new PilotError(409, 'Хамаарахгүй хөтөлбөрийн даалгавар.');
    requireSeat(m, files, role, task.due);
    if (!['yes','no'].includes(data.done)) throw new PilotError(400, 'Даалгаврын төлөвийг шалгана уу.');
    const done = data.done === 'yes';
    if (done === task.done) return;
    task.done = done;
    recordEvent(m, (done ? 'Даалгавар дуусгав · ' : 'Даалгавар дахин нээв · ') + task.title, task.form);
    return;
  }
  const paper = shownForms(m).includes(data?.form) && m.work[workKey(engagement.id, data.form)];
  if (!paper) throw new PilotError(404, 'Туршилтын ажлын баримт олдсонгүй.');
  const actorSeat = engagement.intake.active && managedStaffing(m) && ['save','submit','review','return','respond','clear'].includes(action)
    ? requireSeat(m,files,role,paper.start||paper.due,paper.due||paper.start) : undefined;
  switch (action) {
    case 'work-assign': {
      requireActor(role !== 'preparer');
      if (managedStaffing(m)) requireSeat(m,files,role);
      if (paper.form === '4.4' || /^4\.1\.A[1-4]$/.test(paper.form)) throw new PilotError(409, 'Тайлангийн хяналтын тусдаа үүргийг хадгална.');
      const ownerRole = input(data,'owner',20), reviewerRole = input(data,'reviewer',20), reason = input(data,'reason');
      const start = paper.start || paper.due, end = paper.due || paper.start;
      const ownerBasis = requireSeat(m,files,ownerRole,start,end), reviewBasis = requireSeat(m,files,reviewerRole,start,end);
      if (paper.submittedVersion === paper.version && paper.submittedBy === accounts[reviewerRole]) {
        throw new PilotError(409, 'Одоогийн хувилбарыг илгээсэн хүн өөрөө хянах боломжгүй.');
      }
      if (paper.owner === accounts[ownerRole] && paper.reviewer === accounts[reviewerRole]) return;
      const previous = { owner:paper.owner, reviewer:paper.reviewer };
      reassign(m,paper.id,accounts[ownerRole],accounts[reviewerRole]);
      if (previous.owner !== paper.owner) {
        for (const request of m.requests.filter(r => r.form === paper.form && r.owner === previous.owner &&
            r.status !== 'complete' && r.dispatch !== 'cancelled')) {
          request.owner = paper.owner;
          request.history.push(`${new Date().toISOString()} · ${previous.owner} → ${paper.owner} · ${reason}`);
        }
      }
      ((m.pilotWorkAssignments ??= {})[paper.form] ??= []).unshift({
        at:new Date().toISOString(),by:m.person,reason,previous,owner:paper.owner,reviewer:paper.reviewer,ownerBasis,reviewBasis,
      });
      break;
    }
    case 'schedule': {
      requireActor(role !== 'preparer');
      const start = input(data, 'start', 10), due = input(data, 'due', 10);
      if (!validDate(start) || !validDate(due) || start > due) throw new PilotError(400, 'Ажлын төлөвлөсөн хугацааг шалгана уу.');
      if (managedStaffing(m)) {
        requireSeat(m,files,role);
        requireSeat(m,files,roleOf(paper.owner),start,due);
        requireSeat(m,files,roleOf(paper.reviewer),start,due);
      }
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
      const planning = ['1.3','2.6'].includes(paper.form);
      const before = planning ? registerStamp(m) : '';
      const dependants = planning && m.extendedPilot ? adoptedForms(m)
        .filter(form => programmeDecision(m,form).paperVersions?.[paper.form] === version) : [];
      const typed = data?.answers !== undefined ? readTypedAnswers(m, paper, data, files) : null;
      const values = { ...(typed?.values ?? paper.values) };
      if (!paper.form.startsWith('F-')) {
        values.execution = input(data, 'execution');
        values.conclusion = input(data, 'conclusion');
      }
      if (paper.form === '1.3') {
        for (const key of ['benchmark','percentage','performance','trivial']) values[key] = input(data, key, 32);
        if (data.benchmarkSource !== undefined) values.benchmarkSource = data.benchmarkSource === '' ? '' : input(data,'benchmarkSource');
      }
      if (paper.form === '2.6') {
        if (!['none','partial','full','na'].includes(data.reliance)) throw new PilotError(400, 'Хяналтад найдах шийдвэр шаардлагатай.');
        values.controlsReliance = data.reliance;
        values.relianceBasis = values.conclusion;
        if (data.relianceEvidence !== undefined) {
          if (data.relianceEvidence !== '' && !m.evidence.some(e => e.id === data.relianceEvidence && e.status === 'accepted')) {
            throw new PilotError(400, 'Хяналтын үнэлж зөвшөөрсөн эх баримт сонгоно уу.');
          }
          values.relianceEvidence = data.relianceEvidence;
        }
      }
      changeWork(m, paper.id, values, typed?.evidence);
      if (planning) {
        syncPlanningPapers(m);
        if (paper.form === '1.3' && version !== paper.version) {
          const impact = m.impacts[0];
          impact.targets = [...new Set([...impact.targets,...dependants])];
        }
        if (paper.form === '2.6' && version !== paper.version && dependants.length) {
          m.impacts.unshift({id:randomUUID(),engagement:m.engagement,source:paper.form,targets:dependants,
            reason:'Хяналтад найдах шийдвэрийн шинэ хувилбар. Холбогдох горимын нөлөөг үнэлнэ.',resolved:false});
        }
      }
      if (paper.form !== reportForm(engagement) && version !== paper.version && (!planning ||
          paper.form === '1.3' || before !== registerStamp(m))) invalidateReport(m, 'Тайланд тулгуурласан ажлын хувилбар өөрчлөгдөв');
      break;
    }
    case 'submit':
      requireActor(canEdit(m, paper));
      if (paper.form==='4.4'&&completionGaps(m).length) throw new PilotError(409,completionGaps(m).join(' · '));
      if (fieldworkGap(m,paper.form)) throw new PilotError(409,fieldworkGap(m,paper.form));
      if (technicalRef(m,paper.form)==='') throw new PilotError(409,'Тусгай горимын одоогийн бүртгэл хүлээгдэж байна.');
      if (!paper.form.startsWith('F-') && (!paper.values.execution || !paper.values.conclusion)) throw new PilotError(409, 'Хийсэн ажил ба дүгнэлтийг хадгална уу.');
      checkNative(m, paper, files);
      checkPlanning(m,paper,files);
      if (fieldworkForms(m).includes(paper.form) && evidenceGaps(m, paper.form).length) throw new PilotError(409, evidenceGaps(m, paper.form)[0]);
      if (paper.form === '1.3') {
        if (!validMateriality(m)) throw new PilotError(409, 'Материаллаг байдлын дүн ба хувийг шалгана уу.');
      }
      const decision = programmeDecision(m,paper.form);
      if (m.extendedPilot && decision?.values.decision === 'adopt') paper.values['planning.decision'] = decisionRef(decision);
      const areaReference=areaWorkpaperRef(m,paper.form);
      if (areaReference) paper.values['pilot.area.run']=areaReference;
      if (paper.form==='4.4'&&completionRef(m)!==':') paper.values['pilot.completion']=completionRef(m);
      const technical=technicalRef(m,paper.form);
      if (technical) {
        paper.values['pilot.technical']=technical;
        paper.evidence=[...new Set([...paper.evidence,...technicalEvidence(m,paper.form)])];
      }
      pinLinkedDecisions(m, paper, files);
      submitWork(m, paper.id);
      if (actorSeat) recordStaffSignoff(m,paper,'submit',actorSeat);
      break;
    case 'return':
      requireActor(canReviewWork(m, paper));
      returnWork(m, paper.id, input(data, 'reason'), 'conclusion');
      break;
    case 'review':
      requireActor(canReviewWork(m, paper));
      if (fieldworkGap(m,paper.form)) throw new PilotError(409,fieldworkGap(m,paper.form));
      checkNative(m, paper, files);
      checkPlanning(m,paper,files);
      reviewWork(m, paper.id);
      if (actorSeat) recordStaffSignoff(m,paper,'review',actorSeat);
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
  syncFieldwork(m);
}

function recordStaffSignoff(m, paper, action, seat) {
  ((m.pilotStaffSignoffs ??= {})[paper.form] ??= []).unshift({
    action, seat, version:paper.version, at:new Date().toISOString(),
  });
}

function checkNative(m, paper, files) {
  if (!effectiveForm(m, paper.form, files)) return;
  const gaps = nativeGaps(m, paper, files);
  if (gaps.length) throw new PilotError(409, gaps.join(' · '));
}

function checkPlanning(m, paper, files) {
  if (!m.extendedPilot || formContract(paper.form)?.family !== 'programme') return;
  const decision = programmeDecision(m, paper.form);
  if (decision?.values.decision !== 'adopt') throw new PilotError(409, 'Аудитын хөтөлбөрийн одоогийн шийдвэр шаардлагатай.');
  const key = decision.programmeBasis?.procedure?.key;
  if (!key) return;
  const template = effectiveForm(m,paper.form,files);
  const procedure = template?.body.fields.find(f => f.key === key);
  const outcome = paper.values['field.'+key+'.outcome'];
  if (template?.digest !== decision.template.digest || !procedure || !paper.values['field.'+key]?.trim() ||
      procedureOutcomes(procedure).length && (!outcome || /\((NOT_APPLICABLE|UNABLE_TO_COMPLETE)\)/.test(outcome))) {
    throw new PilotError(409, 'Төлөвлөгөөнд сонгосон горимын гүйцэтгэл ба үр дүнг оруулна уу · '+key);
  }
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

export function fileInput(data) {
  const name = input(data, 'name', 180), encoded = input(data, 'base64', 7_000_000);
  if (!/^[^\\/\x00-\x1f\x7f]+\.(pdf|png|jpe?g|docx|xlsx|csv)$/i.test(name) || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
    throw new PilotError(400, 'PDF, зураг, DOCX, XLSX эсвэл CSV файл сонгоно уу.');
  }
  const bytes = Buffer.from(encoded, 'base64');
  if (!bytes.length || bytes.length > 5_000_000 || bytes.toString('base64') !== encoded) throw new PilotError(400, 'Файлын хэмжээ 5 MB хүртэл байна.');
  return { name, bytes };
}
