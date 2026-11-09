import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { registers } from '../src/lib/pilot-registers.ts';
import { validDate } from '../src/lib/feature-workflows.ts';
import { isCurrentReview, recordEvent, workKey } from '../src/lib/workspace.ts';
import { PilotError, input } from './pilot-workflow.mjs';
import { nativePapers } from './pilot-forms.mjs';

const contracts = JSON.parse(readFileSync(new URL('../src/data/source-registers.json', import.meta.url), 'utf8')).forms;
const definition = id => registers.find(r => r.id === id);
const date = () => new Date().toISOString().slice(0, 10);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const bad = message => { throw new PilotError(409, message); };
const requireRole = condition => { if (!condition) throw new PilotError(403, 'Энэ бүртгэлийн үйлдэлд томилгоо шаардлагатай.'); };
export const archiveGrantKinds = ['M12-F07', 'M12-F10'];
export const registerRows = m => m.pilotRecords ??= [];
const find = (m, id) => registerRows(m).find(r => r.id === id);
const rows = (m, kind) => registerRows(m).filter(r => r.kind === kind);

function stale(m, row, seen = new Set()) {
  if (seen.has(row.id)) return true;
  const path = new Set([...seen, row.id]);
  if (row.statementVersion && row.statementVersion !== m.engagements[0]?.fsVersion) return true;
  if (Object.entries(row.paperVersions ?? {}).some(([form, version]) => {
    const w = m.work[workKey(m.engagement, form)];
    return !isCurrentReview(w) || w.version !== version;
  })) return true;
  return Object.entries(row.references).some(([id, version]) => {
    const target = find(m, id);
    return !target || target.version !== version || target.status !== 'approved' || stale(m, target, path);
  });
}

const approved = (m, r) => r?.status === 'approved' && !stale(m, r);
export const approvedRows = (m, kind) => rows(m, kind).filter(r => approved(m, r));
const opinionForms = { unmodified: '4.1.A1', qualified: '4.1.A2', adverse: '4.1.A3', disclaimer: '4.1.A4' };
export const opinionForm = opinion => opinionForms[opinion];
export const formContract = id => contracts.find(f => f.id === id);
export const currentOpinion = m => approvedRows(m, 'M10-F09')[0];
export const registerView = m => registerRows(m).map(r => ({ ...r, stale: stale(m, r) }));
export const pilotProgrammes = contracts.filter(f => f.family === 'programme').map(({ id, title }) => ({ id, title }));

function ruleMatches(m, rule) {
  const { profile, match } = rule.values;
  const client = m.bench?.clients[m.engagement];
  return profile === 'all' || !!client && client[profile]?.trim().toLowerCase() === match.toLowerCase();
}

export function programmeView(m) {
  const rules = approvedRows(m, 'M02-F05');
  return rules.map(r => ({ id: r.id, form: r.values.programme, matches: ruleMatches(m, r), outcome: r.values.outcome, basis: r.values.basis }));
}

export function adoptedForms(m) {
  return approvedRows(m, 'M07-F01').filter(r => r.values.decision === 'adopt').map(r => r.template.form);
}

const unresolved = (m, kind, key, acceptable) => rows(m, kind).some(r => !approved(m, r) || !acceptable.includes(r.values[key]));
export function acceptanceRegisterGaps(m) {
  const gaps = [];
  if (unresolved(m, 'M04-F02', 'result', ['addressed', 'none'])) gaps.push('M04-F02 · Шийдэгдээгүй шударга байдлын үнэлгээ');
  if (unresolved(m, 'M04-F05', 'residual', ['acceptable'])) gaps.push('M04-F05 · Шийдэгдээгүй хараат бус байдлын эрсдэл');
  if (rows(m, 'M04-F04').some(r => !approved(m, r))) gaps.push('M04-F04 · Үнэлэгдээгүй мэдүүлэг');
  if (unresolved(m, 'M04-F06', 'result', ['suitable'])) gaps.push('M04-F06 · Шийдэгдээгүй нөөцийн үнэлгээ');
  if (m.extendedPilot) {
    if (!approvedRows(m, 'M01-F01').length) gaps.push('M01-F01 · Баталсан фирмийн бүртгэл');
    if (!approvedRows(m, 'M04-F02').length) gaps.push('M04-F02 · Үйлчлүүлэгчийн баталсан үнэлгээ');
    for (const role of ['preparer', 'reviewer', 'partner']) {
      if (!approvedRows(m, 'M04-F04').some(r => r.values.assignee === role)) gaps.push('M04-F04 · ' + role + ' мэдүүлэг');
      if (!approvedRows(m, 'M04-F06').some(r => r.values.capacity === role && r.values.result === 'suitable')) gaps.push('M04-F06 · ' + role + ' нөөцийн үнэлгээ');
    }
  }
  return gaps;
}

const completionKinds = registers.filter(r => r.section === 'completion').map(r => r.id);
const supportKinds = registers.filter(r => ['acceptance', 'planning', 'fieldwork', 'completion'].includes(r.section) && r.id !== 'M08-F07').map(r => r.id);
export function completionRegisterGaps(m) {
  const gaps = acceptanceRegisterGaps(m);
  for (const kind of completionKinds) if (rows(m, kind).some(r => !approved(m, r))) gaps.push(kind + ' · Одоогийн хувилбарын хяналт');
  if (unresolved(m, 'M07-F10', 'result', ['resolved', 'na'])) gaps.push('M07-F10 · Дуусгаагүй тусгай горим');
  const subsequent = rows(m, 'M07-F10').filter(r => r.values.type === 'subsequent');
  if ((m.extendedPilot || subsequent.length) && !subsequent.some(r =>
    approved(m, r) && r.values.result === 'resolved' && validDate(r.values.coverageThrough ?? '') &&
    r.values.coverageThrough >= m.engagements[0].reportDate)) {
    gaps.push('3.2.1 · Дараа үеийн шалгалт зорилтот тайлангийн өдөр хүртэл хянагдаагүй');
  }
  const opinion = currentOpinion(m);
  if (approvedRows(m, 'M10-F09').length > 1) gaps.push('M10-F09 · Нэг одоогийн санал дүгнэлт шаардлагатай');
  if (opinion && approvedRows(m, 'M10-F11').some(r => r.values.opinion !== opinion.id || r.values.template !== opinionForm(opinion.values.opinion))) {
    gaps.push('M10-F11 · Нэмэлт хэсгийг одоогийн санал дүгнэлт ба эх загварт холбоно уу');
  }
  if (unresolved(m, 'M07-F08', 'result', ['received', 'difference', 'none'])) gaps.push('M07-F08 · Шийдэгдээгүй баталгаажуулалт');
  if (unresolved(m, 'M10-F08', 'result', ['sufficient', 'limited'])) gaps.push('M10-F08 · Нотолгооны дүгнэлт дутуу');
  if (unresolved(m, 'M10-F12', 'result', ['received', 'qualified', 'missing'])) gaps.push('M10-F12 · Бичгээрх мэдэгдлийг үнэлнэ үү');
  for (const kind of ['M07-F06','M07-F09']) if (rows(m, kind).some(r => !approved(m, r))) gaps.push(kind + ' · Гүйцэтгэлийн одоогийн хяналт');
  if (m.extendedPilot) {
    for (const kind of ['M06-F02','M06-F09','M07-F01','M07-F10','M10-F06','M10-F08','M10-F09','M10-F12']) {
      if (!approvedRows(m, kind).length) gaps.push(kind + ' · Баталсан бүртгэл шаардлагатай');
    }
    for (const rule of programmeView(m).filter(r => r.matches && r.outcome === 'required')) {
      if (!approvedRows(m, 'M07-F01').some(r => r.values.rule === rule.id)) gaps.push(rule.form + ' · Хөтөлбөрийн шийдвэр');
    }
    for (const form of adoptedForms(m)) {
      const w = m.work[workKey(m.engagement, form)];
      if (w?.status !== 'reviewed' || w.reviewedVersion !== w.version) gaps.push(form + ' · Хэрэгжүүлсэн хөтөлбөрийн хяналт');
    }
  }
  return gaps;
}

export function registerPackage(m) {
  return registerRows(m).filter(r => supportKinds.includes(r.kind) && approved(m, r)).map(r => ({
    id: r.id, kind: r.kind, version: r.version, values: r.values, references: r.references, by: r.by, at: r.at,
    ...(r.template && { template: r.template }), ...(r.declaration && { declaration: r.declaration }),
  }));
}
export const registerStamp = m => hash({
  registers: registerPackage(m),
  papers: adoptedForms(m).map(form => {
    const w = m.work[workKey(m.engagement, form)];
    return [form, w?.version, w?.reviewedVersion, w?.status];
  }),
  statementLines: m.pilotStatementLines ?? {},
  evidence: m.evidence.filter(e => registerEvidence(m).includes(e.id)).map(e => [e.id, e.version, e.status]),
  ...(m.pilotForms && { native: nativePapers(m).map(w => [w.form,w.version,w.reviewedVersion,w.status,w.values.templateDigest]) }),
});
export function firmSnapshot(m) {
  return registerRows(m).filter(r => ['M01-F01','M01-F02','M01-F03','M01-F04','M01-F06'].includes(r.kind) && approved(m, r))
    .map(({ id, version, kind, values, by, at }) => ({ id, version, kind, values: { ...values }, by, at }));
}

function validateInput(m, spec, data) {
  return Object.fromEntries(spec.fields.map(f => {
    const raw = data?.['field.' + f.key] ?? '';
    if (typeof raw !== 'string' || raw.length > 4000) bad('Утгыг шалгана уу · ' + f.label);
    const value = raw.trim();
    if (value && (
      f.type === 'date' && !validDate(value) ||
      f.type === 'number' && (!/^-?\d+(\.\d+)?$/.test(value) || !Number.isFinite(Number(value))) ||
      f.type === 'choice' && !f.choices.some(([v]) => v === value) ||
      f.type === 'record' && find(m, value)?.kind !== f.target ||
      f.type === 'evidence' && !m.evidence.some(e => e.id === value && e.engagement === m.engagement) ||
      f.type === 'form' && !m.work[workKey(m.engagement, value)] ||
      f.type === 'programme' && !pilotProgrammes.some(p => p.id === value)
    )) bad('Утгыг шалгана уу · ' + f.label);
    return [f.key, value];
  }));
}

function checkBusiness(m, row, spec, files) {
  const v = row.values;
  const need = spec.fields.filter(f => !f.optional && !v[f.key]);
  if (need.length) bad('Дутуу утга · ' + need.map(f => f.label).join(', '));
  const refs = {};
  for (const f of spec.fields.filter(f => f.type === 'record' && v[f.key])) {
    const target = find(m, v[f.key]);
    if (!approved(m, target) || target.id === row.id || stale(m, target, new Set([row.id]))) bad(f.label + ' · Одоогийн баталсан хувилбар шаардлагатай');
    refs[target.id] = target.version;
  }
  if (row.kind !== 'M08-F07' && spec.fields.some(f => f.type === 'evidence' && v[f.key] &&
      !m.evidence.some(e => e.id === v[f.key] && e.status === 'accepted'))) bad('Үнэлж зөвшөөрсөн эх файл шаардлагатай.');
  if (spec.section === 'archive') files.checkArchiveRecord(m, row);
  switch (row.kind) {
    case 'M01-F03':
      if (rows(m, row.kind).some(r => r.id !== row.id && r.values.reference.toLowerCase() === v.reference.toLowerCase())) bad('Ажилтны дугаар давхардсан.');
      if (v.availableFrom && v.availableTo && v.availableFrom > v.availableTo) bad('Боломжит хугацааг шалгана уу.');
      break;
    case 'M01-F04':
      if (v.validTo < v.validFrom) bad('Үнэмлэхийн хүчинтэй хугацааг шалгана уу.');
      break;
    case 'M01-F06':
      if (v.to && v.to < v.from) bad('Томилгооны хүчинтэй хугацааг шалгана уу.');
      break;
    case 'M02-F05':
      if (v.profile !== 'all' && !v.match) bad('Тайлагналын стандарт эсвэл хуулийн хэлбэрийг оруулна уу.');
      if (approvedRows(m, row.kind).some(r => r.id !== row.id && r.values.programme === v.programme &&
          (v.profile === 'all' || r.values.profile === 'all' || r.values.profile !== v.profile || r.values.match.toLowerCase() === v.match.toLowerCase()))) {
        bad('Энэ хөтөлбөрийн баталсан дүрэмтэй давхцаж байна.');
      }
      break;
    case 'M03-F04':
      if (v.share && (Number(v.share) < 0 || Number(v.share) > 100)) bad('Өмчлөлийн хувь 0–100 хооронд байна.');
      break;
    case 'M04-F04':
      if (!row.declaration || (v.assignee === 'external' && find(m, v.person)?.values.status !== 'external')) bad('Мэдүүлэгчийн эх мэдүүлэг шаардлагатай.');
      break;
    case 'M04-F06': {
      const person = find(m, v.person).values, credential = find(m, v.credential)?.values;
      if (v.result === 'suitable' && (person.status === 'inactive' || Number(v.hours) <= 0 ||
          person.availableFrom && v.assignmentDate < person.availableFrom || person.availableTo && v.assignmentDate > person.availableTo ||
          !credential || credential.person !== v.person || v.assignmentDate < credential.validFrom || v.assignmentDate > credential.validTo)) {
        bad('Идэвхтэй мэргэжилтэн, хүчинтэй үнэмлэх, боломжит өдөр ба цаг шаардлагатай.');
      }
      if (v.result === 'suitable' && approvedRows(m, row.kind).some(r => r.id !== row.id && r.values.result === 'suitable' &&
          (r.values.capacity === v.capacity || r.values.person === v.person))) bad('Гэрээт ажлын үүрэг бүр тусдаа мэргэжилтэнтэй байна.');
      break;
    }
    case 'M07-F01': {
      const rule = find(m, v.rule), risk = find(m, v.risk);
      if (!ruleMatches(m, rule) || risk.values.programme !== rule.values.programme) bad('Дүрэм, тайлагналын хүрээ болон төлөвлөсөн хөтөлбөр тохирохгүй.');
      const outcome = rule.values.outcome;
      if ((outcome === 'excluded' && v.decision === 'adopt' || outcome === 'required' && v.decision === 'exclude') && rule.values.override !== 'yes') bad('Энэ дүрмийн сонголтыг өөрчлөх эрхгүй.');
      const contract = contracts.find(f => f.id === rule.values.programme);
      if (approvedRows(m, row.kind).some(r => r.id !== row.id && r.template.form === contract.id)) bad('Энэ хөтөлбөрт нэг шийдвэр бүртгэнэ үү.');
      row.template = { form: contract.id, sheet: contract.sheet, digest: hash(contract) };
      files.storeTemplate(row.template.digest, contract);
      if (m.extendedPilot) {
        const basis = ['1.3','2.6'].map(form => m.work[workKey(m.engagement, form)]);
        if (!basis.every(isCurrentReview)) bad('1.3 · Материаллаг байдал болон 2.6 · Хяналтын арга хандлагыг хянана уу.');
        row.paperVersions = Object.fromEntries(basis.map(w => [w.form, w.version]));
      }
      break;
    }
    case 'M06-F06':
    case 'M07-F06':
    case 'M10-F06':
      if (Number(v.threshold) < 0 || v.precision && Number(v.precision) < 0) bad('Босго ба нарийвчлал сөрөг байж болохгүй.');
      if (Math.abs(Number(v.actual) - Number(v.expected)) > Number(v.threshold) && !v.investigation) bad('Босго давсан зөрүүний шинжилгээ шаардлагатай.');
      if (row.kind === 'M10-F06') {
        if (!m.engagements[0].statements || (!v.risk && !v.paper)) bad('Эцсийн тайлан болон эрсдэл эсвэл ажлын холбоос шаардлагатай.');
        if (m.extendedPilot && m.pilotStatementLines?.[v.line] !== Number(v.actual)) bad('Дүн болон мөрийн код нь холбосон СТ багцтай тохирох ёстой.');
        row.statementVersion = m.engagements[0].fsVersion;
      }
      break;
    case 'M07-F08':
      if (v.sent && v.sent > v.due) bad('Гаргасан болон хүлээн авах өдрийг шалгана уу.');
      if (['received', 'difference'].includes(v.result) && !v.response) bad('Ирсэн хариуны эх файл шаардлагатай.');
      if (['none', 'difference'].includes(v.result) && !v.resolution) bad('Өөр горим эсвэл зөрүүний шийдэл шаардлагатай.');
      break;
    case 'M08-F07':
      if (v.anchorKind === 'page' && !/^[1-9]\d*$/.test(v.anchor) || v.anchorKind === 'cell' && !/^.+![A-Z]{1,3}[1-9]\d*$/i.test(v.anchor)) bad('Хуудасны дугаар эсвэл Sheet!A1 байршил оруулна уу.');
      break;
    case 'M07-F10':
      if (v.type === 'subsequent' && (!validDate(v.coverageThrough) || v.coverageThrough < m.bench.periods[m.engagement].end || v.coverageThrough > date() ||
          (m.extendedPilot && v.paper !== '3.2.1') || v.result === 'na')) {
        bad('3.2.1 · Тайлант үеэс хойших шалгасан эцсийн өдөр шаардлагатай.');
      }
      break;
    case 'M10-F09':
      if (approvedRows(m, row.kind).some(r => r.id !== row.id)) bad('Одоогийн санал дүгнэлтийн бүртгэлийг шинэчилнэ үү.');
      break;
    case 'M10-F11': {
      const contract = formContract(opinionForm(find(m, v.opinion).values.opinion));
      if (contract?.id !== v.template) bad('Санал дүгнэлтэд таарсан эх загвар сонгоно уу.');
      if (!contract) bad('Тайлангийн эх загвар сонгоно уу.');
      row.template = { form: contract.id, sheet: contract.sheet, digest: hash(contract) };
      files.storeTemplate(row.template.digest, contract);
      break;
    }
    case 'M10-F12':
      if (v.due < v.requested || v.signed && v.signed < v.requested) bad('Хүсэлт болон гарын үсгийн огноог шалгана уу.');
      if (['received','qualified'].includes(v.result) && (!v.evidence || !v.signed)) bad('Гарын үсэгтэй эх файл, өдөр шаардлагатай.');
      break;
    case 'M10-F13':
      if (!v.journal && !v.analytics && !v.finding) bad('Илрүүлэлтийн эх холбоос эсвэл ишлэл шаардлагатай.');
      break;
  }
  if (spec.fields.some(f => f.target === 'M07-F01') && find(m, v.programme)?.values.decision !== 'adopt') bad('Хэрэгжүүлсэн хөтөлбөр сонгоно уу.');
  return refs;
}

function remember(row, role, status, reason) {
  row.status = status;
  row.by = role;
  row.at = new Date().toISOString();
  row.reason = reason;
  const { history, ...revision } = row;
  history.push(structuredClone(revision));
}

export function registerAction(m, role, data, files) {
  const spec = definition(data?.kind);
  if (!spec) throw new PilotError(404, 'Эх шаардлага олдсонгүй.');
  if (spec.section !== 'firm' && !m.engagements.length) bad('Эхлээд гэрээт ажил үүсгэнэ үү.');
  if (['planning','fieldwork','completion','archive'].includes(spec.section) && !m.engagements[0]?.intake.active) bad('Партнер гэрээт ажлыг идэвхжүүлнэ.');
  let row = data.id && find(m, data.id);
  if (data.id && (!row || row.kind !== spec.id)) throw new PilotError(404, 'Бүртгэл олдсонгүй.');
  const operation = data.operation;
  if (operation === 'save') {
    requireRole(spec.writers.includes(role) && (!row || row.owner === role));
    if (row?.status === 'submitted') bad('Хяналтад илгээсэн хувилбарыг засварт буцаана уу.');
    if (row?.status === 'approved' && spec.section === 'archive') bad('Архивын баталсан үйлдлийг түүхээр хадгална. Шинэ бүртгэл үүсгэнэ үү.');
    if (!row && spec.id === 'M01-F01' && rows(m, spec.id).length) bad('Фирмийн одоогийн бүртгэлийг засна уу.');
    const values = validateInput(m, spec, data);
    if (row && JSON.stringify(values) === JSON.stringify(row.values) && !stale(m, row)) return;
    if (!row) {
      row = { id: randomUUID(), kind: spec.id, owner: role, history: [], version: 0 };
      registerRows(m).push(row);
    }
    if (spec.id === 'M04-F04') delete row.declaration;
    row.values = values;
    row.references = {};
    delete row.statementVersion;
    delete row.template;
    delete row.paperVersions;
    row.version++;
    remember(row, role, 'draft', 'Ноорог хадгалав');
  } else {
    if (!row) bad('Бүртгэлээ эхлээд хадгална уу.');
    if (operation === 'revoke') {
      requireRole(role === 'partner' && archiveGrantKinds.includes(row.kind));
      if (row.status !== 'approved') bad('Баталсан архивын хандалт шаардлагатай.');
      if (row.revoked) return;
      row.revoked = { by: role, at: new Date().toISOString(), reason: input(data, 'reason') };
      recordEvent(m, 'Архивын хандалтыг цуцлав · ' + row.id);
      return;
    } else if (operation === 'declare') {
      const assignee = row.values.assignee;
      requireRole(spec.id === 'M04-F04' && (assignee === role || assignee === 'external' && role === row.owner));
      if (!['draft','returned'].includes(row.status)) bad('Мэдүүлгийн нооргийг нээнэ үү.');
      const text = input(data, 'reason');
      row.version++;
      row.declaration = { text, by: role, at: new Date().toISOString(), evidence: assignee === 'external' ? input(data, 'source') : undefined };
      remember(row, role, 'draft', 'Мэдүүлгийг бүртгэв');
    } else if (operation === 'reply') {
      requireRole(spec.id === 'M08-F07');
      row.discussion ??= [];
      row.discussion.push({ text: input(data, 'reason'), by: role, at: new Date().toISOString() });
    } else if (operation === 'submit') {
      requireRole(row.owner === role);
      if (!['draft','returned'].includes(row.status)) bad('Зөвхөн ноорог эсвэл засварт буцаасан хувилбар илгээнэ.');
      row.references = checkBusiness(m, row, spec, files);
      remember(row, role, 'submitted', 'Хяналтад илгээв');
    } else if (operation === 'approve' || operation === 'return') {
      const independent = spec.id === 'M04-F04'
        ? row.declaration?.by !== role
        : role !== row.owner;
      requireRole(spec.approvers.includes(role) && independent);
      if (row.status !== 'submitted') bad('Хяналтад илгээсэн хувилбар шаардлагатай.');
      const reason = input(data, 'reason');
      if (operation === 'approve') {
        if (stale(m, row)) bad('Эх хувилбар өөрчлөгдсөн. Засварт буцаана уу.');
        checkBusiness(m, row, spec, files);
        if (spec.section === 'archive') files.approveArchiveRecord(m, row, role);
      }
      remember(row, role, operation === 'approve' ? 'approved' : 'returned', reason);
    } else {
      throw new PilotError(404, 'Үйлдэл олдсонгүй.');
    }
  }
  if (m.engagement) recordEvent(m, spec.id + ' · ' + spec.label + ' · ' + row.status);
}

export function registerEvidence(m) {
  return [...new Set(registerPackage(m).flatMap(r => definition(r.kind).fields.filter(f => f.type === 'evidence').map(f => r.values[f.key]).filter(Boolean)))];
}
