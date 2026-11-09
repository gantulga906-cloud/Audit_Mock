import { validDate } from '../src/lib/feature-workflows.ts';
import { fieldAnswers, fieldPrefix, formKinds, procedureOutcomes, sharedBindings, yesNo } from '../src/lib/pilot-forms.ts';
import { sharedFields, sharedForWork, tableColumns, validateTemplate, visibleField } from '../src/lib/workbench.ts';
import { isCurrentReview, recordEvent, reportForm, snapshot, workKey } from '../src/lib/workspace.ts';
import { formContract } from './pilot-registers.mjs';
import { sha256 } from './pilot-report.mjs';
import { accounts, input, PilotError } from './pilot-workflow.mjs';

const formId = /^(?:\d+(?:\.\d+)+(?:\.A[1-4])?|F-[A-Z0-9]{8})$/;
const token = /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/;
const isToken = value => typeof value === 'string' && token.test(value) && !['constructor','prototype'].includes(value);
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const fail = (message, status = 400) => { throw new PilotError(status, message); };
const allowed = condition => { if (!condition) fail('Энэ маягтын үйлдэлд эрх шаардлагатай.', 403); };
const parse = (raw, message) => {
  try { return JSON.parse(raw); } catch { fail(message); }
};
const store = (files, contract) => {
  const digest = sha256(JSON.stringify(contract));
  files.storeTemplate(digest, contract);
  return digest;
};
const byId = (library, id) => library.releases[id]?.at(-1);
export const emptyFormLibrary = () => ({ drafts: {}, releases: {}, grants: {} });
export const isLibraryAction = action => ['template-save','template-submit','template-publish','template-return','template-grant'].includes(action);
const canEdit = (library, role, id) => (library.grants[id] ?? []).includes(role);

function sourceTemplate(id) {
  const template = formContract(id);
  if (id !== '1.1.1' || !template) return template;
  const bound = { r11:'industry', r12:'period', r13:'contacts', r21:'framework' }, decisions = { r16:'assessment', r17:'letter', r18:'independence' };
  const fields = template.fields.flatMap(f => {
    if (f.key === 'r10') return ['name','legalForm','registration'].map(binding =>
      ({ ...f, key: f.key+'_'+binding, label: sharedBindings[binding], type: 'text', binding }));
    if (bound[f.key]) return [{ ...f, type: 'text', binding: bound[f.key] }];
    if (decisions[f.key]) return [{ ...f, decision: decisions[f.key] }];
    return [f];
  });
  return { ...template, fields };
}

export function libraryView(library, role, files, firm) {
  return {
    editable: firm ? Object.keys(library.grants).filter(id => canEdit(library, role, id)) : [],
    grants: firm && role === 'partner' ? library.grants : {},
    drafts: firm ? Object.values(library.drafts).filter(d => d.by === role || role === 'partner' && d.submitted) : [],
    releases: Object.entries(library.releases).flatMap(([id, versions]) => versions.slice(-1)
      .map(release => ({ ...release, id, title: files.template(release.digest)?.title ?? id }))),
  };
}

export function libraryTemplate(library, id, files, source = false) {
  if (!formId.test(id)) fail('Маягт олдсонгүй.', 404);
  const release = byId(library, id);
  const body = !source && release ? files.template(release.digest) : sourceTemplate(id);
  if (!body) fail('Маягт олдсонгүй.', 404);
  return body;
}

function smallText(v, max) { return typeof v === 'string' && v.length <= max; }
function options(v) { return Array.isArray(v) && v.length <= 100 && v.every(o => smallText(o, 1000) && o.trim()) && new Set(v).size === v.length; }

function validateDraft(id, value, original) {
  if (!object(value) || value.id !== id || !smallText(value.title, 200) || !Number.isInteger(value.stage) ||
      value.stage < 1 || value.stage > 5 || !Array.isArray(value.fields) || value.fields.length > 160) fail('Маягтын бүтцийг шалгана уу.');
  const fields = value.fields.map(field => {
    if (!object(field) || !isToken(field.key) || !smallText(field.label, 4000) || !Object.hasOwn(formKinds, field.type) ||
        field.required !== undefined && typeof field.required !== 'boolean' || field.options !== undefined && !options(field.options) ||
        field.binding && !Object.hasOwn(sharedBindings, field.binding) || field.binding && !['text','textarea'].includes(field.type) ||
        field.when && (!isToken(field.when.key) || !smallText(field.when.value, 1000))) fail('Асуултын бүтэц буруу байна.');
    const baseline = original?.fields.find(f => f.key === field.key);
    if (field.type === 'procedure' && baseline?.type !== 'procedure') fail('Эх горимын мөрийг ашиглана уу.');
    const section = smallText(field.section, 200) ? field.section : undefined;
    const instruction = smallText(field.instruction, 8000) ? field.instruction : undefined;
    return {
      key: field.key, label: field.label.trim(), type: baseline?.binding || baseline?.decision ? baseline.type : field.type,
      section, instruction, required: !!field.required,
      source: baseline?.source ?? (smallText(field.source, 200) ? field.source : 'Захиалгат'),
      ...((baseline?.binding || field.binding) && { binding: baseline?.binding ?? field.binding }),
      ...(baseline?.decision && { decision: baseline.decision }),
      ...(field.when && { when: { key: field.when.key, value: field.when.value } }),
      ...(field.options && { options: field.options }), ...(['table','procedure'].includes(field.type) && baseline?.columns && { columns: baseline.columns }),
    };
  });
  const result = { id, title: value.title.trim(), stage: original?.stage ?? value.stage, fields,
    family: original?.family ?? 'questionnaire', sheet: original?.sheet ?? 'Арга зүйн сан',
    ...(original && { purpose: original.purpose, clauses: original.clauses }) };
  validateTemplate(result);
  for (const f of fields.filter(f => f.when)) {
    const parent = fields.find(x => x.key === f.when.key);
    if (parent.binding || parent.decision || !['text','textarea','select','yesno','date','number'].includes(parent.type) ||
        !f.when.value || !validateValue(parent,f.when.value)) fail('Нөхцөлийн хариултыг шалгана уу.');
  }
  return result;
}

export function libraryAction(library, role, action, fields, files) {
  const id = input(fields, 'form', 32);
  if (!formId.test(id)) fail('Маягтын дугаар буруу байна.');
  const original = sourceTemplate(id), release = byId(library, id), draft = library.drafts[id];
  const known = !!(original || release || draft);
  if (action === 'template-grant') {
    allowed(role === 'partner');
    if (!known || !['reviewer','preparer'].includes(fields.actor) || !['grant','revoke'].includes(fields.access)) fail('Маягтын эрхийг шалгана уу.');
    const note = input(fields, 'note');
    const active = new Set(library.grants[id] ?? []);
    if (fields.access === 'grant') active.add(fields.actor);
    else active.delete(fields.actor);
    library.grants[id] = [...active];
    (library.grantHistory ??= []).push({ id, actor: fields.actor, access: fields.access, by: role, note, at: new Date().toISOString() });
    return;
  }
  if (action === 'template-save') {
    allowed(known ? canEdit(library, role, id) : role === 'reviewer' && id.startsWith('F-'));
    if (draft?.submitted || draft && draft.by !== role) fail('Илгээсэн эсвэл өөр зохиогчийн нооргийг засах боломжгүй.', 409);
    const body = validateDraft(id, parse(input(fields, 'body', 650_000), 'Маягтын бүтэц буруу байна.'), original);
    if (!known) library.grants[id] = [role];
    library.drafts[id] = { body, by: role, submitted: false, note: '' };
    return;
  }
  if (!draft) fail('Маягтын ноорог олдсонгүй.', 404);
  const note = input(fields, 'note');
  if (action === 'template-submit') {
    allowed(draft.by === role && canEdit(library, role, id));
    if (draft.submitted) fail('Ноорог хяналтад илгээгдсэн.', 409);
    draft.submitted = true;
    draft.note = note;
    return;
  }
  allowed(role === 'partner' && draft.by !== role);
  if (!draft.submitted) fail('Хяналтад илгээсэн хувилбар шаардлагатай.', 409);
  if (action === 'template-return') {
    draft.submitted = false;
    draft.note = note;
    return;
  }
  if (!canEdit(library, draft.by, id)) fail('Зохиогчийн маягтын эрхийг шалгана уу.', 409);
  const versions = library.releases[id] ??= [];
  versions.push({ number: versions.length + 1, digest: store(files, draft.body), author: draft.by,
    publisher: role, at: new Date().toISOString(), note });
  delete library.drafts[id];
}

export function effectiveForm(m, form, files) {
  const pin = m.pilotForms?.[form];
  if (!pin) return null;
  const body = files.template(pin.digest);
  if (!body) fail('Холбосон маягтын хувилбар олдсонгүй.', 409);
  return { ...pin, body };
}

export function paperFormView(m, paper, files) {
  const template = effectiveForm(m, paper.form, files);
  if (!template) return null;
  const current = m.engagements[0].decisions?.at(-1);
  const linked = Object.fromEntries(template.body.fields.filter(f => f.decision).map(f => [
    f.key, ['reviewed','submitted'].includes(paper.status) ? paper.values['linked.'+f.key] ?? '' : current?.[f.decision] ?? '',
  ]));
  return { ...template, shared: sharedForWork(m, paper), linked };
}

function definitions(body) {
  const entries = [];
  for (const f of body.fields) {
    if (f.binding || f.decision) continue;
    entries.push([f.key, f.type === 'procedure' ? { ...f, type: 'textarea' } : f]);
    if (f.type !== 'procedure') {
      if (['select','yesno'].includes(f.type)) entries.push([f.key+'.reason', { ...f, type: 'textarea' }]);
      continue;
    }
    const outcomes = procedureOutcomes(f);
    if (outcomes.length) entries.push([f.key+'.outcome', { ...f, type: 'select', options: outcomes }]);
    entries.push([f.key+'.file', { ...f, type: 'evidence' }]);
    for (const column of f.columns ?? []) entries.push([f.key+'.'+column.key, column]);
  }
  return new Map(entries);
}

function validateValue(field, value) {
  if (!smallText(value, field.type === 'table' ? 180_000 : 4000)) return false;
  if (!value) return true;
  if (field.type === 'number') return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) && Number.isFinite(Number(value));
  if (field.type === 'date') return validDate(value);
  if (field.type === 'select') return field.options?.includes(value);
  if (field.type === 'yesno') return yesNo.includes(value);
  if (field.type === 'multiselect') {
    const chosen = parse(value, 'Олон сонголтын бүтэц буруу байна.');
    return options(chosen) && chosen.every(o => field.options?.includes(o));
  }
  if (field.type === 'table') {
    const rows = parse(value, 'Хүснэгтийн мөрийн бүтэц буруу байна.');
    const columns = new Map((field.columns?.length ? field.columns : tableColumns).map(c => [c.key, c]));
    return Array.isArray(rows) && rows.length <= 100 && new Set(rows.map(r => r?.id)).size === rows.length &&
      rows.every(r => object(r) && isToken(r.id) && object(r.values) && Object.entries(r.values)
        .every(([k,v]) => columns.has(k) && validateValue(columns.get(k), v)));
  }
  return true;
}

const answerKeys = (body, answers) => new Set(body.fields.filter(f => visibleField(f, answers)).flatMap(f =>
  [f.key, f.key+'.reason', f.key+'.outcome', f.key+'.file', ...(f.columns ?? []).map(c => f.key+'.'+c.key)]));

function typedEvidence(defs, answers) {
  return [...defs].flatMap(([k,f]) => f.type === 'evidence' && answers[k] ? [answers[k]] : []);
}

export function readTypedAnswers(m, paper, data, files) {
  const template = effectiveForm(m, paper.form, files);
  if (!template || template.digest !== data.templateDigest) fail('Маягтын хувилбар өөрчлөгдсөн. Дахин нээнэ үү.', 409);
  const raw = parse(input(data, 'answers', 650_000), 'Хариултын бүтэц буруу байна.');
  if (!object(raw)) fail('Хариултын бүтэц буруу байна.');
  const defs = definitions(template.body), visible = answerKeys(template.body, raw);
  const answers = {};
  for (const [key,value] of Object.entries(raw)) {
    const def = defs.get(key);
    if (!def || !validateValue(def, value)) fail('Хариултыг шалгана уу · ' + key);
    if (visible.has(key) && value !== '') answers[key] = value;
  }
  const ids = typedEvidence(defs, answers);
  if (ids.some(id => !m.evidence.some(e => e.id === id && e.engagement === m.engagement && e.status === 'accepted'))) {
    fail('Энэ ажлын үнэлж зөвшөөрсөн эх баримтыг сонгоно уу.');
  }
  const old = new Set(typedEvidence(defs, fieldAnswers(paper.values)));
  const requestIds = new Set(m.requests.filter(r => r.form === paper.form).flatMap(r => r.parts?.map(p => p.evidence) ?? []));
  const evidence = [...new Set([...paper.evidence.filter(id => !old.has(id) || requestIds.has(id)), ...ids])];
  return { evidence, values: { ...Object.fromEntries(Object.entries(paper.values).filter(([k]) => !k.startsWith(fieldPrefix))),
    ...Object.fromEntries(Object.entries(answers).map(([k,v]) => [fieldPrefix+k,v])) } };
}

export function nativeGaps(m, paper, files) {
  const template = effectiveForm(m, paper.form, files);
  if (!template) return [];
  const answers = fieldAnswers(paper.values), shared = sharedFields(m, paper.engagement);
  const linked = m.engagements[0].decisions?.at(-1);
  const present = (f,v) => {
    if (!v?.trim() || v === '[]') return false;
    return f.type !== 'table' || JSON.parse(v).some(row => Object.values(row.values).some(x => x.trim()));
  };
  const gaps = template.body.fields.filter(f => visibleField(f, answers)).flatMap(f => {
    const value = f.binding ? shared[f.binding] : f.decision ? linked?.[f.decision] : answers[f.key];
    if (f.required && !present(f,value)) return [f.label+' · Заавал бөглөнө'];
    if (value?.includes('Хамаарахгүй') && ['select','yesno'].includes(f.type) && !answers[f.key+'.reason']?.trim()) return [f.label+' · Хамаарахгүй үндэслэл'];
    if (f.type === 'procedure' && f.required && procedureOutcomes(f).length && !answers[f.key+'.outcome']) return [f.label+' · Үр дүнг сонгоно уу'];
    if (f.type === 'procedure' && f.required && !answers[f.key+'.result']?.trim()) return [f.label+' · Үр дүнгийн тайлбар'];
    if (f.type === 'procedure' && answers[f.key+'.outcome'] && !answers[f.key+'.result']?.trim()) return [f.label+' · Үр дүнгийн тайлбар'];
    return [];
  });
  if (!template.body.fields.some(f => !f.binding && !f.decision && present(f,answers[f.key])) &&
      !Object.entries(answers).some(([k,v]) => k.endsWith('.result') && v.trim())) gaps.push('Маягтын хариулт оруулна уу.');
  if (typedEvidence(definitions(template.body), answers).some(id => !m.evidence.some(e => e.id === id && e.status === 'accepted'))) gaps.push('Нотлох баримтын үнэлгээ шаардлагатай.');
  return gaps;
}

export function bindForm(m, role, form, fields, files) {
  allowed(role !== 'preparer');
  if (!formId.test(form)) fail('Маягтын дугаар буруу байна.');
  const release = byId(m.pilotFormLibrary, form), source = sourceTemplate(form);
  if (fields.version !== 'source' && (!release || fields.version !== String(release.number))) fail('Одоогийн батлагдсан хувилбарыг сонгоно уу.', 409);
  if (fields.version === 'source' && !source) fail('Эх маягт олдсонгүй.', 404);
  const contract = fields.version === 'source' ? source : files.template(release.digest);
  if (!contract) fail('Маягтын хувилбар олдсонгүй.', 409);
  if (!m.engagements[0].intake.active && contract.stage !== 1) fail('Эхлээд гэрээт ажлыг идэвхжүүлнэ үү.', 409);
  const version = fields.version === 'source' ? { number: 0, digest: store(files, contract) } : { number: release.number, digest: release.digest };
  const current = effectiveForm(m, form, files);
  if (current?.digest === version.digest) return false;
  const key = workKey(m.engagement, form);
  let w = m.work[key];
  if (w) {
    snapshot(w, m.person, 'Маягтын өмнөх хувилбар');
    w.version++;
    w.status = w.submittedVersion || w.reviewedVersion ? 'changed' : w.status;
    w.submittedVersion = undefined;
    w.completedAt = undefined;
    const previous = current ? definitions(current.body) : new Map();
    const next = definitions(contract);
    const priorAnswers = fieldAnswers(w.values);
    const oldEvidence = new Set(typedEvidence(previous, priorAnswers));
    for (const [k,v] of Object.entries(priorAnswers)) {
      if (!next.has(k) || previous.get(k)?.type !== next.get(k).type || !validateValue(next.get(k),v)) delete w.values[fieldPrefix+k];
    }
    const visible = answerKeys(contract, fieldAnswers(w.values));
    for (const k of Object.keys(fieldAnswers(w.values))) if (!visible.has(k)) delete w.values[fieldPrefix+k];
    const currentEvidence = new Set(typedEvidence(next, fieldAnswers(w.values)));
    const requestIds = new Set(m.requests.filter(r => r.form === w.form).flatMap(r => r.parts?.map(p => p.evidence) ?? []));
    w.evidence = w.evidence.filter(id => !oldEvidence.has(id) || currentEvidence.has(id) || requestIds.has(id));
  } else {
    w = m.work[key] = { id: key, engagement: m.engagement, form, owner: accounts.reviewer, reviewer: accounts.partner,
      start: '', due: '', baselineStart: '', baselineDue: '', estimate: 0, actual: 0, status: 'not_started', version: 1,
      values: {}, evidence: [], notes: [], history: [], required: true };
  }
  w.title = contract.title;
  w.stage = contract.stage;
  w.values.templateDigest = version.digest;
  (m.pilotForms ??= {})[form] = version;
  recordEvent(m, form+' · Маягтын хувилбар v'+version.number+' холбов', form);
  return true;
}

export const nativePapers = m => Object.keys(m.pilotForms ?? {})
  .filter(form => !/^4\.1\.A[1-4]$/.test(form) || form === reportForm(m.engagements[0]))
  .map(form => m.work[workKey(m.engagement, form)]);
export const nativeReviewGaps = m => nativePapers(m).filter(w => !isCurrentReview(w)).map(w => w.form+' · Маягтын одоогийн хяналт шаардлагатай');

export function pinLinkedDecisions(m, w, files) {
  const current = m.engagements[0].decisions?.at(-1);
  for (const f of effectiveForm(m, w.form, files)?.body.fields ?? []) {
    if (f.decision) w.values['linked.'+f.key] = current?.[f.decision] ?? '';
  }
}
