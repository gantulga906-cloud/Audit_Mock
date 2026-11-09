import { randomUUID } from 'node:crypto';
import { validDate } from '../src/lib/feature-workflows.ts';
import { saveClient } from '../src/lib/workbench.ts';
import { currentClientContact } from '../src/lib/pilot-intake.ts';
import { recordEvent } from '../src/lib/workspace.ts';
import { input, openPilotEngagement, PilotError } from './pilot-workflow.mjs';

const firmActions = new Set(['client-save','client-contact','client-status','intake-save','intake-forward','intake-return','intake-decline','intake-convert']);
export const isIntakeAction = action => firmActions.has(action);
const managers = ['reviewer','partner'];
const relationships = ['prospect','pending','active','suspended','former','rejected'];
const registrationKey = value => value.replace(/\s/g, '').toLowerCase();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const now = () => new Date().toISOString();
const fail = (status, message) => { throw new PilotError(status, message); };
const allowed = condition => { if (!condition) fail(403, 'Энэ үйлдэлд томилгоо шаардлагатай.'); };
const text = (data, name, max = 4000) => data?.[name] === undefined || data[name] === '' ? '' : input(data, name, max);
const dated = (data, key) => {
  const value = text(data, key, 10);
  if (value && !validDate(value)) fail(400, 'Огноог шалгана уу · ' + key);
  return value;
};
const parse = row => row && JSON.parse(row.body);

function currentTerms(model, files) {
  const terms = model.pilotTerms;
  const period = model.bench.periods[model.engagement];
  return !!terms && terms.clientVersion === model.pilotIntake.version && terms.confirmation === model.pilotIntake.confirmation &&
    terms.start === period.start && terms.end === period.end &&
    model.evidence.some(e => e.id === terms.evidence && e.engagement === model.engagement && e.status === 'accepted') &&
    files.get(terms.evidence)?.sha256 === terms.sha256;
}

export function termsGaps(model, files) {
  if (!model.pilotIntake) return [];
  return model.pilotTerms?.status === 'approved' && currentTerms(model, files) ? [] :
    ['1.4.3 · Одоогийн үед хамаарах гарын үсэгтэй захидлыг партнер батална.'];
}

export function termsAction(model, role, action, data, files) {
  const e = model.engagements[0];
  if (!model.pilotIntake || e.intake.active) fail(409, 'Хүлээн авах шатны ажил сонгоно уу.');
  const terms = model.pilotTerms;
  if (action === 'intake-terms-approve') {
    allowed(role === 'partner' && terms?.by !== role);
    if (terms?.status !== 'draft' || String(terms.version) !== data?.version || !currentTerms(model, files)) {
      fail(409, 'Одоогийн захидлын хувилбарыг нягтална уу.');
    }
    model.pilotTerms = { ...terms, status: 'approved', approvedBy: role, approvedAt: now(), approvalBasis: input(data, 'reason') };
  } else {
    allowed(role === 'reviewer');
    const evidence = input(data, 'evidence', 64), signedOn = input(data, 'signedOn', 10);
    const file = files.get(evidence);
    if (!file || !model.evidence.some(item => item.id === evidence && item.status === 'accepted') ||
        !validDate(signedOn) || signedOn > now().slice(0,10)) fail(409, 'Үнэлж зөвшөөрсөн эх файл болон гарын үсгийн огноог шалгана уу.');
    const { start, end } = model.bench.periods[e.id];
    const draft = { status: 'draft', evidence, sha256: file.sha256, signedOn,
      reference: input(data, 'reference', 200), signatory: input(data, 'signatory', 150),
      scope: input(data, 'scope'), clientVersion: model.pilotIntake.version, confirmation: model.pilotIntake.confirmation, start, end };
    if (terms && Object.entries(draft).every(([k,v]) => k === 'status' || terms[k] === v)) return;
    if (terms) (model.pilotTermsHistory ??= []).unshift(terms);
    model.pilotTerms = { ...draft, version: (terms?.version ?? 0) + 1, by: role, at: now() };
  }
  recordEvent(model, '1.4.3 · Захидал v'+model.pilotTerms.version+' · '+model.pilotTerms.status, '1.4.3');
}

export function createIntakeStore(db, store) {
  const putClient = client => db.prepare(`INSERT INTO pilot_clients (id, registration_key, body) VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET registration_key = excluded.registration_key, body = excluded.body`)
    .run(client.id, registrationKey(client.profile.registration), JSON.stringify(client));
  const putEnquiry = row => db.prepare(`INSERT INTO pilot_enquiries (id, body) VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET body = excluded.body`).run(row.id, JSON.stringify(row));
  const findClient = id => parse(db.prepare('SELECT body FROM pilot_clients WHERE id = ?').get(id));
  const findEnquiry = id => parse(db.prepare('SELECT body FROM pilot_enquiries WHERE id = ?').get(id));
  const link = (client, engagement) => db.prepare('INSERT INTO pilot_client_engagements (client_id, engagement_id) VALUES (?, ?)').run(client, engagement);

  function connectExisting(m, role) {
    const e = m.engagements[0], profile = m.bench?.clients[e.id];
    if (!profile || !e.companyId) return;
    if (!findClient(e.companyId)) {
      const client = { id: e.companyId, version: 1, owner: role, status: e.intake.active ? 'active' : 'pending',
        profile: { ...profile, industry: e.industry, contacts: profile.contacts.map(c => ({
          ...c, source: 'Өмнөх гэрээт ажлын бүртгэл', effective: '',
        })) },
        history: [{ by: role, at: now(), version: 1, note: 'Өмнөх гэрээт ажлын мэдээллийг бүртгэв' }],
      };
      putClient(client);
    }
    link(e.companyId, e.id);
  }

  store.transaction(() => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS pilot_clients (
        id TEXT PRIMARY KEY, registration_key TEXT NOT NULL, body TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS pilot_clients_registration ON pilot_clients(registration_key);
      CREATE TABLE IF NOT EXISTS pilot_client_engagements (
        client_id TEXT NOT NULL REFERENCES pilot_clients(id),
        engagement_id TEXT PRIMARY KEY REFERENCES pilot_engagements(id)
      );
      CREATE INDEX IF NOT EXISTS pilot_client_engagements_client ON pilot_client_engagements(client_id);
      CREATE TABLE IF NOT EXISTS pilot_enquiries (id TEXT PRIMARY KEY, body TEXT NOT NULL);
    `);
    const existing = db.prepare(`SELECT e.body FROM pilot_engagements e
      WHERE NOT EXISTS (SELECT 1 FROM pilot_client_engagements l WHERE l.engagement_id = e.id)`).all();
    for (const row of existing) connectExisting(parse(row), 'reviewer');
  });

  function visibleClient(client, role) {
    if (!client) return false;
    if (role === 'partner') return true;
    if (db.prepare(`SELECT 1 FROM pilot_client_engagements l
      JOIN pilot_engagement_members m ON m.engagement_id = l.engagement_id
      WHERE l.client_id = ? AND m.role = ? LIMIT 1`).get(client.id, role)) return true;
    return role === client.owner && !db.prepare('SELECT 1 FROM pilot_client_engagements WHERE client_id = ? LIMIT 1').get(client.id);
  }

  function periods(client, role) {
    return db.prepare(`SELECT e.id, e.period_start AS start, e.period_end AS end, e.active
      FROM pilot_client_engagements l JOIN pilot_engagements e ON e.id = l.engagement_id
      JOIN pilot_engagement_members m ON m.engagement_id = e.id
      WHERE l.client_id = ? AND m.role = ? ORDER BY e.period_end DESC`).all(client.id, role)
      .map(row => ({ ...row, active: !!row.active, partner: 'partner' }));
  }

  function clientFor(id, role) {
    const client = findClient(id);
    if (!visibleClient(client, role)) fail(404, 'Үйлчлүүлэгчийн бүртгэл олдсонгүй.');
    return client;
  }

  function visibleEnquiry(row, role) {
    if (!row) return false;
    if (row.engagement) return store.members(row.engagement).includes(role);
    return role === row.owner || role === 'partner' || role === 'reviewer' && row.status !== 'draft';
  }

  function view(role) {
    const clients = db.prepare('SELECT body FROM pilot_clients ORDER BY rowid DESC').all().map(parse)
      .filter(client => visibleClient(client, role)).map(client => ({ ...client, periods: periods(client, role) }));
    const enquiries = db.prepare('SELECT body FROM pilot_enquiries ORDER BY rowid DESC').all().map(parse)
      .filter(row => visibleEnquiry(row, role));
    return { clients, enquiries };
  }

  function updateClient(role, action, data) {
    allowed(managers.includes(role));
    const id = text(data, 'id', 64), current = id && clientFor(id, role);
    if (action !== 'client-save' && !current) fail(404, 'Үйлчлүүлэгчийн бүртгэл олдсонгүй.');
    const note = input(data, 'note');
    if (action === 'client-status') {
      allowed(role === 'partner');
      const status = input(data, 'status', 12);
      if (!relationships.includes(status)) fail(400, 'Харилцааны төлөвийг шалгана уу.');
      if (status === current.status) return;
      current.history.unshift({ by: role, at: now(), version: current.version, note, previousStatus: current.status });
      current.status = status;
      putClient(current);
      return;
    }
    const previous = current?.profile;
    let profile;
    if (action === 'client-save') {
      const name = input(data, 'name', 200), registration = input(data, 'registration', 64);
      const key = registrationKey(registration);
      if (db.prepare('SELECT 1 FROM pilot_clients WHERE registration_key = ? AND id <> ? LIMIT 1').get(key, id)) {
        fail(409, 'Үйлчлүүлэгчийн бүртгэлийг шалгана уу. Давхардлыг эх бүртгэл хариуцагчид шилжүүлнэ.');
      }
      if (current && registrationKey(current.profile.registration) !== key && periods(current, 'partner').length) {
        fail(409, 'Холбоотой ажилтай бүртгэлийн дугаарыг эх бүртгэл хариуцагч шалгана.');
      }
      profile = { name, registration, legalForm: input(data, 'legalForm', 64), framework: text(data, 'framework', 150),
        industry: text(data, 'industry', 150), bodies: [...new Set(text(data, 'bodies', 2000).split('\n').map(v => v.trim()).filter(Boolean))],
        contacts: previous?.contacts ?? [],
      };
      if (profile.contacts.some(c => !c.ended && c.body && !profile.bodies.includes(c.body))) {
        fail(409, 'Харьяалах холбоо барих хүнийг шинэчилсний дараа засаглалын байгууллагыг хасна уу.');
      }
    } else {
      const contactId = text(data, 'contactId', 64), existing = previous.contacts.find(c => c.id === contactId);
      if (contactId && !existing) fail(404, 'Холбоо барих хүн олдсонгүй.');
      if (existing?.ended) fail(409, 'Хаасан холбоог өөрчлөх боломжгүй.');
      const effective = input(data, 'effective', 10);
      if (!validDate(effective) || existing?.effective && effective < existing.effective) fail(400, 'Хүчинтэй огноог шалгана уу.');
      let contact;
      if (data.mode === 'retire') {
        if (!existing) fail(404, 'Холбоо барих хүн олдсонгүй.');
        contact = { ...existing, ended: effective };
      } else {
        const email = text(data, 'email', 254), body = text(data, 'body', 150);
        if (email && !emailPattern.test(email) || body && !previous.bodies.includes(body)) fail(400, 'Имэйл эсвэл харьяалах байгууллагыг шалгана уу.');
        contact = { id: contactId || randomUUID(), name: input(data, 'name', 150), email, role: input(data, 'capacity', 150),
          body, signer: data.signer === 'yes', effective, source: input(data, 'source', 250) };
      }
      profile = { ...previous, contacts: existing ? previous.contacts.map(c => c.id === contactId ? contact : c) : [...previous.contacts, contact] };
    }
    const client = current || { id: randomUUID(), version: 0, status: 'prospect', owner: role, history: [] };
    client.version++;
    client.history.unshift({ by: role, at: now(), version: client.version, note, ...(previous && { before: previous }) });
    client.profile = profile;
    putClient(client);
  }

  function enquiryAction(model, role, action, data) {
    const id = text(data, 'id', 64), previous = id && findEnquiry(id);
    if (id && !visibleEnquiry(previous, role)) fail(404, 'Аудитын хүсэлт олдсонгүй.');
    if (action === 'intake-save') {
      allowed(!previous || previous.owner === role);
      if (previous && !['draft','returned'].includes(previous.status)) fail(409, 'Энэ хүсэлтийг засварт буцаасны дараа өөрчилнө.');
      const origin = input(data, 'origin', 8), email = text(data, 'email', 254);
      if (!['client','firm'].includes(origin) || email && !emailPattern.test(email)) fail(400, 'Хүсэлтийн эх үүсвэр, имэйлийг шалгана уу.');
      const start = dated(data, 'start'), end = dated(data, 'end'), clientId = text(data, 'clientId', 64);
      if (start && end && start > end) fail(400, 'Тайлант үеийн огноог шалгана уу.');
      if (clientId) clientFor(clientId, role);
      const row = { id: id || randomUUID(), owner: role, status: 'draft', clientId,
        company: input(data, 'company', 200), contact: text(data, 'contact', 150), email,
        origin, service: input(data, 'service', 150), start, end, framework: text(data, 'framework', 150),
        facts: text(data, 'facts'), history: previous?.history ?? [],
      };
      const prior = previous && Object.fromEntries(Object.entries(previous).filter(([key]) => key !== 'history'));
      row.history.unshift({ by: role, at: now(), status: 'draft', note: 'Мэдээлэл хадгалав', ...(prior && { before: prior }) });
      putEnquiry(row);
      return null;
    }
    if (!previous) fail(404, 'Аудитын хүсэлт олдсонгүй.');
    const note = input(data, 'note');
    if (action === 'intake-forward') {
      allowed(previous.owner === role);
      if (!['draft','returned'].includes(previous.status)) fail(409, 'Ноорог хүсэлтийг шилжүүлнэ үү.');
      previous.status = 'forwarded';
    } else {
      allowed(managers.includes(role));
      if (previous.status !== 'forwarded') fail(409, 'Хүлээн авахаар шилжүүлсэн хүсэлт шаардлагатай.');
      if (action === 'intake-return') previous.status = 'returned';
      else if (action === 'intake-decline') previous.status = 'declined';
      else {
        const client = clientFor(input(data, 'clientId', 64), role);
        const contact = input(data, 'contactId', 64), priorId = text(data, 'prior', 64);
        if (previous.clientId && previous.clientId !== client.id) fail(409, 'Хүсэлтийн үйлчлүүлэгчийн холбоосыг эхлээд шалгана уу.');
        const earlier = periods(client, role).filter(p => p.active && p.end < data.start);
        const prior = priorId && earlier.find(p => p.id === priorId);
        if (priorId && !prior) fail(409, 'Энэ үйлчлүүлэгчийн хандах эрхтэй өмнөх тайлант үеийг сонгоно уу.');
        const profile = confirmProfile(client, contact);
        model.companies = { [client.id]: { id: client.id, profile, industry: profile.industry, status: 'active', by: model.person } };
        const extended = data.synthetic === 'yes' && data.extended === 'no' ? 'no' : 'yes';
        const engagement = openPilotEngagement(model, { ...data, extended }, client.id);
        if (extended === 'yes') model.pilotStaffingEnabled = true;
        engagement.intake.origin = previous.origin;
        engagement.intake.facts = previous.facts;
        if (earlier.length) engagement.kind = 'Үргэлжилсэн аудит';
        if (prior) engagement.carriedFrom = prior.id;
        model.pilotIntake = { enquiry: id, client: client.id, version: client.version, confirmation: 1, contact, by: role, at: now(), note,
          ...(prior && { prior: prior.id }) };
        previous.engagement = engagement.id;
        previous.clientId = client.id;
        previous.status = 'converted';
      }
    }
    const item = action === 'intake-return' ? input(data, 'item', 200) : undefined;
    previous.history.unshift({ by: role, at: now(), status: previous.status, note, ...(item && { item }) });
    return previous;
  }

  function confirmProfile(client, contact) {
    if (['suspended','former','rejected'].includes(client.status)) fail(409, 'Үйлчлүүлэгчийн харилцааны төлөв шинэ ажил эхлүүлэх боломжгүй.');
    if (!client.profile.framework) fail(409, 'Тайлагналын хүрээг үйлчлүүлэгчийн бүртгэлд тодруулна уу.');
    const day = now().slice(0,10);
    const active = client.profile.contacts.filter(c => currentClientContact(c, day));
    const selected = active.find(c => c.id === contact && emailPattern.test(c.email));
    if (!selected) fail(409, 'Имэйлтэй, хүчинтэй холбоо барих хүн сонгоно уу.');
    return { ...client.profile, contacts: [selected, ...active.filter(c => c.id !== contact)] };
  }

  function refresh(model, role, data) {
    allowed(managers.includes(role));
    const e = model.engagements[0], current = model.pilotIntake;
    if (!current || e.intake.active) fail(409, 'Хүлээн авах шатны ажлыг сонгоно уу.');
    const client = clientFor(current.client, role), contact = input(data, 'contactId', 64), note = input(data, 'note');
    const profile = confirmProfile(client, contact);
    saveClient(model, e.id, profile, model.bench.periods[e.id]);
    e.intake.contact = profile.contacts[0].name;
    const recipient = profile.contacts.find(c => c.signer) ?? profile.contacts[0];
    e.recipients = [{ name: recipient.name, status: 'pending' }];
    const changed = contact !== current.contact || client.version !== current.version;
    if (changed) (model.pilotIntakeHistory ??= []).unshift(current);
    model.pilotIntake = { ...current, contact, version: client.version, confirmation: current.confirmation + Number(changed), by: role, at: now(), note };
    recordEvent(model, 'Үйлчлүүлэгчийн баталсан мэдээлэл шинэчлэв · v' + client.version, '1.1.1');
  }

  function activationGaps(model) {
    const current = model.pilotIntake;
    if (!current) return [];
    const client = findClient(current.client);
    if (!client || current.version !== client.version) return ['Үйлчлүүлэгчийн одоогийн мэдээллийг дахин нягтална уу.'];
    try { confirmProfile(client, current.contact); } catch (error) {
      if (error instanceof PilotError) return [error.message];
      throw error;
    }
    return [];
  }

  function contextView(model) {
    const current = model.pilotIntake;
    if (!current) return undefined;
    const history = model.pilotIntakeHistory ?? [];
    if (model.engagements[0].intake.active) return { ...current, contacts: [], history };
    const client = findClient(current.client);
    const day = now().slice(0,10);
    return { ...current, history, currentVersion: client?.version, contacts: client?.profile.contacts.filter(c => c.email &&
      currentClientContact(c, day)) ?? [] };
  }

  function setStatus(id, role, status, from, note) {
    const client = findClient(id);
    if (!client || !from.includes(client.status)) return;
    client.history.unshift({ by: role, at: now(), note, version: client.version, previousStatus: client.status });
    client.status = status;
    putClient(client);
  }

  function finish(model, role, action, record) {
    if (record) putEnquiry(record);
    if (action === 'intake-convert') {
      link(model.pilotIntake.client, model.engagement);
      setStatus(model.pilotIntake.client, role, 'pending', ['prospect'], 'Хүлээн авах шатны ажил үүсгэв');
    } else if (action === 'create') connectExisting(model, role);
    else if (action === 'activate') {
      setStatus(model.engagements[0].companyId, role, 'active', ['pending','prospect'], 'Гэрээт ажлыг идэвхжүүлэв');
      store.touchFirm();
    }
  }

  return { view, updateClient, enquiryAction, refresh, activationGaps, contextView, finish };
}
