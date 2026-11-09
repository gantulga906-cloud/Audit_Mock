import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID, scryptSync } from 'node:crypto';
import { mkdtemp, rm, rmdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createPilot } from '../scripts/pilot-server.mjs';
import { accounts, emptyWorkspace, pilotAction } from '../scripts/pilot-workflow.mjs';
import { registers } from '../src/lib/pilot-registers.ts';

const passwords = { preparer: 'test-preparer-pass', reviewer: 'test-reviewer-pass', partner: 'test-partner-pass' };
const create = { client: 'Fictional Pilot Company', legalForm: 'ХХК', registration: 'QA-PILOT-1', framework: 'Test',
  contact: 'Demo Finance', email: 'pilot@example.test', start: '2025-01-01', end: '2025-12-31', reportDate: '2026-04-01' };

async function start(database) {
  const pilot = createPilot({ database, setupCode: 'test-bootstrap-only' });
  const server = createServer((req, res) => void pilot.handle(req, res, new URL(req.url, 'http://127.0.0.1')));
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const origin = 'http://127.0.0.1:' + server.address().port;
  return {
    async fetch(path, cookie, data, requestOrigin = origin) {
      return fetch(origin + '/api/pilot' + path, {
        method: data === undefined ? 'GET' : 'POST',
        headers: { ...(cookie ? { Cookie: cookie } : {}),
          ...(data === undefined ? {} : { 'Content-Type': 'application/json', Origin: requestOrigin }) },
        body: data === undefined ? undefined : JSON.stringify(data),
      });
    },
    async close() {
      await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
      pilot.close();
    },
  };
}

async function fixture(service, setup = true) {
  if (setup) assert.equal((await service.fetch('/setup', '', { code: 'test-bootstrap-only', ...passwords })).status, 201);
  const cookies = {};
  for (const role of Object.keys(passwords)) {
    const response = await service.fetch('/login', '', { role, password: passwords[role] });
    assert.equal(response.status, 200);
    cookies[role] = response.headers.get('set-cookie').split(';')[0];
  }
  const scoped = (path, id) => path + '?engagement=' + id;
  const view = async (role, id, status = 200) => {
    const response = await service.fetch(scoped('', id), cookies[role]);
    assert.equal(response.status, status);
    return response.json();
  };
  async function write(role, id, action, fields, status = 200, options = {}) {
    const revision = options.revision ?? (await view(role, id)).revision;
    const response = await service.fetch(scoped('/action', id), cookies[role], { action, fields, revision, idempotencyKey: options.key });
    const result = await response.json();
    assert.equal(response.status, status, action + ' · ' + (result.error ?? ''));
    return result;
  }
  return { cookies, scoped, view, write };
}

test('two engagements isolate revisions, work, reports, grants and archive access', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'audit-multi-'));
  const database = join(dir, 'multi.sqlite');
  let service = await start(database);
  try {
    const { cookies, scoped, view, write } = await fixture(service);
    const a = (await write('reviewer', 'firm', 'create', { ...create, synthetic: 'yes' })).selected;
    const createB = { ...create, client: 'Private second engagement', registration: 'QA-PILOT-2', synthetic: 'yes', includePreparer: 'no' };
    const key = randomUUID();
    const revision = (await view('reviewer', 'firm')).revision;
    const b = (await write('reviewer', 'firm', 'create', createB, 200, { key, revision })).selected;
    assert.notEqual(a, b);
    assert.equal((await write('reviewer', 'firm', 'create', createB, 200, { key, revision })).selected, b);
    assert.deepEqual((await view('reviewer', 'firm')).portfolio.map(e => e.id).sort(), [a, b].sort());
    assert.deepEqual((await view('preparer', 'firm')).portfolio.map(e => e.id), [a]);
    assert.doesNotMatch(JSON.stringify(await view('preparer', b, 404)), /Private second/);
    await write('reviewer', 'firm', 'create', { ...createB, registration: ' qa-pilot-1 ' }, 409);
    const activate = { independence: 'I1', letter: 'L1', assessment: 'Synthetic acceptance' };
    await write('partner', a, 'activate', activate);
    await write('partner', b, 'activate', activate);
    const schedule = { form: '3.1.2', start: '2026-03-01', due: '2026-03-15' };
    const revA = (await view('reviewer', a)).revision, revB = (await view('reviewer', b)).revision;
    await write('reviewer', a, 'schedule', schedule, 200, { revision: revA });
    assert.equal((await view('reviewer', b)).revision, revB);
    await write('reviewer', b, 'schedule', { ...schedule, due: '2026-03-16' }, 200, { revision: revB });
    await write('reviewer', a, 'schedule', { ...schedule, due: '2026-03-17' }, 409, { revision: revA });
    assert.equal((await view('reviewer', a)).papers[0].due, '2026-03-15');
    assert.equal((await view('reviewer', b)).papers[0].due, '2026-03-16');
    const portfolio = (await view('reviewer', 'firm')).portfolio;
    assert.equal(portfolio.find(e => e.id === a).progress.deadlines[0].due, '2026-03-15');
    assert.equal(portfolio.find(e => e.id === b).progress.deadlines[0].due, '2026-03-16');
    assert.deepEqual((await view('preparer', 'firm')).portfolio.map(e => e.progress.deadlines[0].due), ['2026-03-15']);
    const access = { role: 'preparer', access: 'grant', reason: 'Assigned fieldwork' };
    await write('reviewer', b, 'access', access, 403);
    await write('partner', b, 'access', access);

    const requestFields = { title: 'Audit evidence', due: '2026-03-20' };
    const requestKey = randomUUID();
    const request = (await write('reviewer', a, 'request', requestFields, 200, { key: requestKey })).requests[0].id;
    await write('reviewer', b, 'request', requestFields, 409, { key: requestKey });
    await write('preparer', b, 'accept', { request }, 404);
    async function finish(id, requestId, label) {
      const bytes = Buffer.from(label);
      const upload = await write('preparer', id, 'upload', { request: requestId, name: label + '.csv', source: label, base64: bytes.toString('base64') });
      const evidence = upload.evidence[0].id;
      await write('preparer', id, 'accept', { request: requestId });
      await write('partner', id, 'statements', { statements: label + ' statements', disclosures: label + ' disclosures' });
      for (const [form, owner, reviewer] of [['3.1.2','preparer','reviewer'], ['4.4','reviewer','partner'], ['4.1.A1','reviewer','partner']]) {
        await write(owner, id, 'save', { form, execution: 'Work reviewed', conclusion: label + ' conclusion' });
        await write(owner, id, 'submit', { form });
        await write(reviewer, id, 'review', { form });
      }
      await write('partner', id, 'authorize', {});
      await write('partner', id, 'issue', { reference: label + ' issue' });
      return evidence;
    }
    const evidenceA = await finish(a, request, 'Engagement A');
    assert.equal((await service.fetch(scoped('/evidence/' + evidenceA, b), cookies.reviewer)).status, 404);
    const sealedA = await write('partner', a, 'archive-seal', {});
    const archiveA = sealedA.archive.packages[0].id;
    assert.deepEqual((await view('partner', b)).archive.packages, []);
    const requestB = (await write('reviewer', b, 'request', requestFields)).requests[0].id;
    const evidenceB = await finish(b, requestB, 'Engagement B');
    assert.equal(await (await service.fetch(scoped('/evidence/' + evidenceB, b), cookies.preparer)).text(), 'Engagement B');
    await write('partner', b, 'access', { ...access, access: 'revoke' });
    assert.equal((await service.fetch(scoped('/evidence/' + evidenceB, b), cookies.preparer)).status, 404);
    await write('preparer', b, 'save', { form: '3.1.2', execution: 'X', conclusion: 'Y' }, 404, { revision: 1 });
    assert.equal((await view('preparer', a)).selected, a);
    for (const [id,label] of [[a,'Engagement A'],[b,'Engagement B']]) {
      const report = await (await service.fetch(scoped('/report', id), cookies.partner)).text();
      assert.match(report, new RegExp(label + ' statements'));
      const approvals = await (await service.fetch(scoped('/authorizations', id), cookies.partner)).json();
      assert.equal(approvals.length, 1);
      assert.match(approvals[0].authorization.artifact.html, new RegExp(label + ' statements'));
    }
    const sealedB = await write('partner', b, 'archive-seal', {});
    assert.notEqual(sealedB.archive.packages[0].id, archiveA);
    assert.equal(sealedB.archive.packages[0].previous, null);
    const grantFields = { 'field.package': archiveA, 'field.accessor': 'reviewer', 'field.reason': 'Audit inspection', 'field.until': '2099-01-01' };
    const wrong = await write('reviewer', b, 'register', { kind: 'M12-F07', operation: 'save', ...grantFields });
    await write('reviewer', b, 'register', { kind: 'M12-F07', id: wrong.registers.at(-1).id, operation: 'submit' }, 409);
    const grant = (await write('reviewer', a, 'register', { kind: 'M12-F07', operation: 'save', ...grantFields })).registers.at(-1).id;
    await write('reviewer', a, 'register', { kind: 'M12-F07', id: grant, operation: 'submit' });
    await write('partner', a, 'register', { kind: 'M12-F07', id: grant, operation: 'approve', reason: 'Approved' });
    const archivePath = '/archive-export/' + grant;
    assert.equal((await service.fetch(scoped(archivePath, a), cookies.reviewer, {})).status, 200);
    assert.equal((await service.fetch(scoped(archivePath, b), cookies.reviewer, {})).status, 403);
    await write('partner', a, 'access', { ...access, role: 'reviewer', access: 'revoke' });
    assert.equal((await service.fetch(scoped(archivePath, a), cookies.reviewer, {})).status, 404);
    await write('partner', a, 'access', { ...access, role: 'reviewer' });
    assert.equal((await service.fetch(scoped(archivePath, a), cookies.reviewer, {})).status, 403);
    await service.close();
    service = null;
    service = await start(database);
    const reloaded = await fixture(service, false);
    assert.deepEqual((await reloaded.view('preparer', 'firm')).portfolio.map(e => e.id), [a]);
    assert.deepEqual((await reloaded.view('partner', a)).archive.packages.map(p => p.id), [archiveA]);
    assert.deepEqual((await reloaded.view('partner', b)).archive.packages.map(p => p.id), [sealedB.archive.packages[0].id]);
  } finally {
    if (service) await service.close();
    for (const suffix of ['', '-shm', '-wal']) await rm(database + suffix, { force: true });
    await rmdir(dir);
  }
});

test('a single-workspace database migrates with its original IDs, versions and archive bytes', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'audit-legacy-'));
  const database = join(dir, 'legacy.sqlite');
  let service;
  try {
    const legacy = { ...emptyWorkspace(), person: accounts.reviewer };
    pilotAction(legacy, 'reviewer', 'create', { ...create, synthetic: 'yes' }, { archive: { isSealed: () => false } });
    const id = legacy.engagement;
    const fileId = randomUUID(), archiveId = randomUUID(), grantId = randomUUID();
    const file = Buffer.from('Legacy evidence fixture');
    const sha256 = createHash('sha256').update(file).digest('hex');
    legacy.pilotRecords = [{ id: grantId, kind: 'M12-F07', owner: 'reviewer', status: 'approved', version: 1,
      references: {}, history: [], values: { package: archiveId, accessor: 'preparer', until: '2099-01-01', reason: 'Historical grant' } }];
    const packageEvidence = { id: fileId, name: 'legacy.csv', sha256, version: 2, size: file.length, base64: file.toString('base64') };
    const authorization = { package: { paper: { id: id + '/4.1.A1', version: 3, values: { conclusion: 'Historical report' } } } };
    const archived = { authorization, client: create.client, issue: { reference: 'Historical issue' }, evidence: [packageEvidence] };
    const payload = JSON.stringify(archived), digest = createHash('sha256').update(payload).digest('hex');
    const db = new DatabaseSync(database);
    db.exec(`
      CREATE TABLE accounts (role TEXT PRIMARY KEY, salt TEXT NOT NULL, hash BLOB NOT NULL);
      CREATE TABLE workspace (id INTEGER PRIMARY KEY, revision INTEGER NOT NULL, body TEXT NOT NULL);
      CREATE TABLE evidence (id TEXT PRIMARY KEY, name TEXT NOT NULL, sha256 TEXT NOT NULL, bytes BLOB NOT NULL);
      CREATE TABLE authorizations (id INTEGER PRIMARY KEY, snapshot TEXT NOT NULL);
      CREATE TABLE pilot_archives (id TEXT PRIMARY KEY, previous TEXT, issued TEXT NOT NULL, sealed TEXT NOT NULL, digest TEXT NOT NULL, synthetic INTEGER NOT NULL, summary TEXT NOT NULL, payload TEXT);
    `);
    for (const [role, password] of Object.entries(passwords)) {
      db.prepare('INSERT INTO accounts VALUES (?, ?, ?)').run(role, 'migration-fixture', scryptSync(password, 'migration-fixture', 64));
    }
    db.prepare('INSERT INTO workspace VALUES (1, 19, ?)').run(JSON.stringify(legacy));
    db.prepare('INSERT INTO evidence VALUES (?, ?, ?, ?)').run(fileId, 'legacy.csv', sha256, file);
    db.prepare('INSERT INTO authorizations VALUES (1, ?)').run(JSON.stringify({ authorization }));
    db.prepare('INSERT INTO pilot_archives VALUES (?, NULL, ?, ?, ?, 1, ?, ?)').run(archiveId, '2026-04-01', '2026-04-05', digest,
      JSON.stringify({ client: create.client, files: [{ id: fileId, name: 'legacy.csv', version: 2, sha256 }] }), payload);
    db.close();
    service = await start(database);
    const { cookies, scoped, view } = await fixture(service, false);
    const migrated = await view('partner', id);
    assert.equal(migrated.revision, 19);
    assert.equal(migrated.archive.packages[0].digest, digest);
    assert.equal(migrated.archive.packages[0].id, archiveId);
    const exportPath = scoped('/archive-export/' + grantId, id);
    assert.deepEqual((await (await service.fetch(exportPath, cookies.preparer, {})).json()).content, archived);
    await service.close();
    service = await start(database);
    const res = await service.fetch('/login', '', { role: 'partner', password: passwords.partner });
    const reloaded = await res.json();
    assert.equal(reloaded.selected, id);
    assert.equal(reloaded.revision, 19);
    assert.equal(reloaded.archive.packages[0].id, archiveId);
  } finally {
    if (service) await service.close();
    for (const suffix of ['', '-shm', '-wal']) await rm(database + suffix, { force: true });
    await rmdir(dir);
  }
});

test('separate accounts hand off one persisted audit engagement and authorize exact evidence and report versions', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'audit-pilot-'));
  const database = join(dir, 'test.sqlite');
  let service;
  try {
    service = await start(database);
    assert.deepEqual(await (await service.fetch('')).json(), { setup: true });
    const setup = { code: 'test-bootstrap-only', ...passwords };
    assert.equal((await service.fetch('/setup', '', setup, 'http://example.test')).status, 403);
    assert.equal((await service.fetch('/setup', '', setup)).status, 201);
    assert.equal((await service.fetch('/setup', '', setup)).status, 409);
    assert.equal((await service.fetch('/login', '', { role: 'partner', password: passwords.preparer })).status, 401);
    const login = async role => {
      const response = await service.fetch('/login', '', { role, password: passwords[role] });
      assert.equal(response.status, 200);
      const cookie = response.headers.get('set-cookie');
      assert.match(cookie, /HttpOnly; SameSite=Strict/);
      return cookie.split(';')[0];
    };
    const reviewer = await login('reviewer'), preparer = await login('preparer'), partner = await login('partner');
    const view = async cookie => (await service.fetch('', cookie)).json();
    const write = async (cookie, action, fields, expected = 200, revision) => {
      const r = await service.fetch('/action', cookie, { action, fields, revision: revision ?? (await view(cookie)).revision, role: 'partner' });
      const json = await r.json();
      assert.equal(r.status, expected, action + ': ' + JSON.stringify(json).slice(0, 220));
      return json;
    };

    await write(preparer, 'create', create, 403);
    await write(reviewer, 'create', create);
    await write(partner, 'activate', { independence: 'Independence v1', letter: 'Agreed letter v1', assessment: 'Synthetic case accepted' });
    assert.equal((await view(preparer)).engagement.client, create.client);
    assert.equal((await view(reviewer)).engagement.active, true);
    const schedule = { form: '3.1.2', start: '2026-03-10', due: '2026-03-20' };
    await write(preparer, 'schedule', schedule, 403);
    await write(reviewer, 'schedule', { ...schedule, start: '2026-02-31' }, 400);
    const scheduled = await write(reviewer, 'schedule', schedule);
    const scheduledPaper = scheduled.papers.find(p => p.form === schedule.form);
    await write(reviewer, 'schedule', { ...schedule, due: '2026-03-22' });
    const sharedPaper = (await view(preparer)).papers.find(p => p.form === schedule.form);
    assert.equal(sharedPaper.due, '2026-03-22');
    assert.equal(sharedPaper.baselineDue, '2026-03-20');
    assert.equal(sharedPaper.version, scheduledPaper.version);
    const assigned = await write(reviewer, 'task-add', { owner: 'preparer', title: 'Check source ledger', due: '2026-03-22', form: schedule.form });
    const task = assigned.delivery.tasks[0].id;
    await write(partner, 'task-add', { title: 'Partner checkpoint', due: '2026-03-22' });
    assert.deepEqual((await view(preparer)).delivery.tasks.map(t => t.id), [task]);
    await write(reviewer, 'task-status', { id: task, done: 'yes' }, 403);
    await write(preparer, 'task-status', { id: task, done: 'yes' });
    assert.equal((await view(reviewer)).delivery.tasks.find(t => t.id === task).done, true);
    assert.equal((await view(reviewer)).papers.find(p => p.form === schedule.form).status, scheduledPaper.status);
    await write(reviewer, 'request', { title: 'Asset register', due: '2026-03-20' }, 409, 1);
    const requestCommand = { action: 'request', fields: { title: 'Asset register', due: '2026-03-20' },
      revision: (await view(reviewer)).revision, idempotencyKey: randomUUID() };
    const firstRequest = await service.fetch('/action', reviewer, requestCommand);
    assert.equal(firstRequest.status, 200);
    const requested = await firstRequest.json();
    const duplicate = await service.fetch('/action', reviewer, { ...requestCommand, fields: { due: '2026-03-20', title: 'Asset register' } });
    assert.equal(duplicate.status, 200);
    assert.equal((await duplicate.json()).revision, requested.revision);
    assert.equal((await service.fetch('/action', reviewer, { ...requestCommand, fields: { ...requestCommand.fields, title: 'Different request' } })).status, 409);
    const req = requested.requests[0].id;
    const work = { form: '3.1.2', execution: 'Compared additions to register', conclusion: 'First conclusion' };
    await write(preparer, 'save', work);
    await write(preparer, 'submit', work, 409);
    const upload = (name, contents) => write(preparer, 'upload', { request: req, name, source: 'Demo Finance', base64: Buffer.from(contents).toString('base64') });
    const old = (await upload('old.csv', 'incorrect,period')).evidence[0].id;
    await write(preparer, 'reject', { request: req, reason: 'Wrong period' });
    const contents = 'asset,amount\nsynthetic,100\n';
    const current = (await upload('register.csv', contents)).evidence.find(e => e.name === 'register.csv');
    assert.equal(current.replaces, old);
    assert.equal(current.version, 2);
    await write(reviewer, 'accept', { request: req }, 403);
    await write(preparer, 'accept', { request: req });
    assert.equal((await service.fetch('/evidence/' + old)).status, 401);
    assert.equal(await (await service.fetch('/evidence/' + old, reviewer)).text(), 'incorrect,period');
    assert.equal(await (await service.fetch('/evidence/' + current.id, reviewer)).text(), contents);
    const submission = await write(preparer, 'submit', work);
    await write(preparer, 'review', work, 403);
    const returned = await write(reviewer, 'return', { form: work.form, reason: 'Explain the amount' });
    const note = returned.papers[0].notes[0].id;
    await write(preparer, 'save', { ...work, conclusion: 'Matched 100 to the replacement register.' });
    await write(preparer, 'respond', { form: work.form, note, response: 'Recorded exact evidence and amount.' });
    await write(preparer, 'submit', work);
    await write(reviewer, 'review', work, 409);
    await write(reviewer, 'clear', { form: work.form, note });
    const reviewed = await write(reviewer, 'review', work);
    assert.equal(reviewed.papers[0].reviewedVersion, submission.papers[0].version + 1);
    await write(partner, 'authorize', {}, 409);
    await write(partner, 'statements', { statements: 'Synthetic statement set v1', disclosures: 'Synthetic notes v1' });
    for (const form of ['4.4', '4.1.A1']) {
      await write(reviewer, 'save', { ...work, form });
      await write(reviewer, 'submit', { form });
      await write(partner, 'review', { form });
    }
    await write(preparer, 'authorize', {}, 403);
    const signed = await write(partner, 'authorize', {});
    assert.equal(signed.authorized.current, true);
    assert.equal((await service.fetch('/authorizations', reviewer)).status, 404);
    const snapshots = await (await service.fetch('/authorizations', partner)).json();
    assert.equal(snapshots[0].authorization.package.reliedOn.find(p => p.id.endsWith('/3.1.2')).reviewedVersion, reviewed.papers[0].reviewedVersion);
    assert.equal(snapshots[0].evidence[0].sha256, createHash('sha256').update(contents).digest('hex'));
    await write(partner, 'authorize', {});
    assert.equal((await view(partner)).authorized.count, 1);
    const changed = await write(partner, 'statements', { statements: 'Synthetic statement set v2', disclosures: 'Synthetic notes v1' });
    assert.equal(changed.authorized.current, false);
    assert.equal(changed.papers.find(p => p.form === '4.1.A1').status, 'changed');
    await write(partner, 'authorize', {}, 409);

    await service.close();
    service = null;
    service = await start(database);
    assert.deepEqual(await (await service.fetch('')).json(), { setup: false });
    const afterRestart = await login('partner');
    const reviewerAfterRestart = await login('reviewer');
    const replay = await service.fetch('/action', reviewerAfterRestart, requestCommand);
    assert.equal(replay.status, 200);
    assert.deepEqual((await replay.json()).requests.map(r => r.id), [req]);
    const deliveryAfterRestart = await view(reviewerAfterRestart);
    assert.equal(deliveryAfterRestart.delivery.tasks.find(t => t.id === task).done, true);
    assert.equal(deliveryAfterRestart.papers.find(p => p.form === schedule.form).due, '2026-03-22');
    assert.equal((await view(afterRestart)).authorized.current, false);
    assert.deepEqual(await (await service.fetch('/authorizations', afterRestart)).json(), snapshots);
    assert.equal(await (await service.fetch('/evidence/' + current.id, afterRestart)).text(), contents);
    assert.equal((await service.fetch('/logout', afterRestart, {})).status, 200);
    assert.equal((await service.fetch('/evidence/' + current.id, afterRestart)).status, 401);
  } finally {
    if (service) await service.close();
    for (const suffix of ['', '-shm', '-wal']) await rm(database + suffix, { force: true });
    await rmdir(dir);
  }
});

test('the extended engagement exercises all 34 registers and seals a scoped recoverable archive', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'audit-registers-'));
  const database = join(dir, 'test.sqlite');
  let service;
  try {
    service = await start(database);
    assert.equal((await service.fetch('/setup', '', { code: 'test-bootstrap-only', ...passwords })).status, 201);
    const cookies = {};
    const signIn = async role => {
      const response = await service.fetch('/login', '', { role, password: passwords[role] });
      assert.equal(response.status, 200);
      cookies[role] = response.headers.get('set-cookie').split(';')[0];
      return response.json();
    };
    let current;
    for (const role of Object.keys(passwords)) current = await signIn(role);
    const write = async (role, action, fields, expected = 200) => {
      const result = await service.fetch('/action', cookies[role], { revision: current.revision, action, fields });
      const value = await result.json();
      assert.equal(result.status, expected, action + ' ' + (fields.kind ?? '') + ' · ' + (value.error ?? ''));
      if (result.ok) current = value;
      return value;
    };
    const action = (role, kind, id, operation, extra = {}, status = 200) =>
      write(role, 'register', { kind, id, operation, ...extra }, status);
    const save = async (role, kind, values, id = '', status = 200) => {
      const value = await action(role, kind, id, 'save', Object.fromEntries(Object.entries(values).map(([k,v]) => ['field.'+k,v])), status);
      return status === 200 ? (id || value.registers.at(-1).id) : value;
    };
    const approve = async (kind, values, owner='reviewer', reviewer='partner', id='') => {
      const record = await save(owner, kind, values, id);
      await action(owner, kind, record, 'submit');
      await action(reviewer, kind, record, 'approve', { reason: 'Tested and documented' });
      return record;
    };
    const find = id => current.registers.find(row => row.id === id);
    const filing = { name: 'Synthetic Audit Firm', licence: 'F-1', reporting: 'Historical firm name', contact: 'test@example.test' };
    await save('preparer', 'M01-F01', filing, '', 403);
    const firm = await approve('M01-F01', filing);
    const unit = await approve('M01-F02', { name: 'Audit team', type: 'team', status: 'active' });
    const practitioners = {};
    for (const role of Object.keys(passwords)) {
      const person = await approve('M01-F03', { name: 'Synthetic ' + role, reference: role, unit, status: 'active', availableFrom: '2025-01-01', availableTo: '2027-01-01' });
      const credential = await approve('M01-F04', { person, qualification: 'Test credential', sector: 'Manufacturing', skill: 'Audit', validFrom: '2025-01-01', validTo: '2027-01-01', source: 'Synthetic credential ref' });
      await approve('M01-F06', { person, role, employment: 'employee', from: '2025-01-01', basis: 'Pilot roster role' });
      practitioners[role] = { person, credential };
    }
    const rule = await approve('M02-F05', { programme: '3.1.2', profile: 'framework', match: 'Test', outcome: 'required', override: 'no', basis: 'Fixture programme applicability' });
    const excluded = await approve('M02-F05', { programme: '3.1.3', profile: 'all', outcome: 'excluded', override: 'no', basis: 'Fixture programme exclusion' });
    await write('reviewer', 'create', { ...create, extended: 'yes', synthetic: 'yes' });
    const activation = { independence: 'I-1', letter: 'L-1', assessment: 'Synthetic case accepted' };
    await write('reviewer', 'support-upload', { name: 'registry.csv', source: 'Synthetic registry', base64: Buffer.from('id,owner\n1,Parent').toString('base64') });
    const registryFile = current.evidence[0].id;
    await write('reviewer', 'support-assess', { id: registryFile, result: 'accepted', reason: 'Own file' }, 403);
    await write('partner', 'support-assess', { id: registryFile, result: 'accepted', reason: 'Verified registry provenance' });
    const party = await approve('M03-F04', { name: 'Parent', relation: 'controller', share: '80', effective: '2025-01-01', source: 'Group record', basis: 'Evidence examined' });
    await approve('M04-F02', { concern: 'Management integrity', party, source: 'Registry and inquiries', evidence: registryFile, owner: 'reviewer', result: 'addressed', basis: 'No unresolved issues' });
    for (const role of Object.keys(passwords)) {
      const issuer = role === 'reviewer' ? 'partner' : 'reviewer';
      const id = await save(issuer, 'M04-F04', { assignee: role, scope: 'Current engagement', due: '2026-03-01' });
      await action(role, 'M04-F04', id, 'declare', { reason: 'Own synthetic declaration' });
      await action(issuer, 'M04-F04', id, 'submit');
      await action(role, 'M04-F04', id, 'approve', { reason: 'Own signature' }, 403);
      await action(issuer, 'M04-F04', id, 'approve', { reason: 'Evaluated the declaration' });
      await approve('M04-F06', { capacity: role, ...practitioners[role], assignmentDate: '2026-03-15', hours: '10', needs: 'Audit capacity', result: 'suitable', basis: 'Roster and credential checked' });
    }
    const threat = { threat: 'Prior service', party, significance: 'medium', owner: 'reviewer', safeguard: 'Separate personnel', followup: '2026-03-12', residual: 'open', basis: 'Await evaluation' };
    const threatId = await approve('M04-F05', threat);
    assert.match((await write('partner', 'activate', activation, 409)).error, /M04-F05/);
    await approve('M04-F05', { ...threat, residual: 'acceptable', basis: 'Reviewed the safeguard' }, 'reviewer', 'partner', threatId);
    await write('partner', 'activate', activation);
    assert.equal(current.engagement.firm.find(r => r.id === firm).values.reporting, filing.reporting);
    await approve('M01-F01', { ...filing, reporting: 'New firm display name' }, 'reviewer', 'partner', firm);
    assert.equal(current.engagement.firm.find(r => r.id === firm).values.reporting, filing.reporting);

    const checkPaper = async (form, owner, reviewer, fields={}) => {
      await write(owner, 'save', { form, execution: 'Performed the procedure', conclusion: 'Recorded result', ...fields });
      await write(owner, 'submit', { form });
      await write(reviewer, 'review', { form });
    };
    await checkPaper('1.3', 'preparer', 'reviewer', { benchmark: '1000', percentage: '2', performance: '60', trivial: '5' });
    await checkPaper('2.6', 'preparer', 'reviewer', { reliance: 'partial' });
    await write('reviewer', 'resolve-impact', { id: current.impacts[0].id, reason: 'Affected work considered before adoption' });
    const entity = await approve('M06-F02', { business: 'Manufacturing', objectives: 'Operations', governance: 'Board', environment: 'Competitive market', framework: 'Test', party, source: 'Board minutes' });
    const fraud = await approve('M06-F04', { risk: 'Override risk', entity, factors: 'Manual postings', inquiry: 'Interview', presumption: 'Documented decision', assertion: 'Existence', response: 'Test entries' });
    await approve('M06-F05', { area: 'PPE', reliance: 'Prior period review', test: 'Opening ledger tie', limitations: 'Prior firm scope limited', effect: 'Perform independent corroboration' });
    const analytics = await approve('M06-F06', { area: 'PPE', expected: '100', actual: '120', threshold: '10', source: 'Comparative schedule', investigation: 'New additions', scope: 'Test additions cycle' });
    const riskValues = { risk: 'PPE additions', entity, fraud, analytics, type: 'account', target: 'PPE', assertion: 'Existence', response: 'Test fixed asset additions', programme: '3.1.2' };
    const risk = await approve('M06-F09', riskValues);
    const otherRisk = await approve('M06-F09', { ...riskValues, programme: '3.1.3', target: 'Other accounts' });
    const blocked = await save('reviewer', 'M07-F01', { rule: excluded, risk: otherRisk, decision: 'adopt', basis: 'Try prohibited option' });
    await action('reviewer', 'M07-F01', blocked, 'submit', {}, 409);
    await approve('M07-F01', { rule: excluded, risk: otherRisk, decision: 'exclude', basis: 'Explicitly inapplicable' }, 'reviewer', 'partner', blocked);
    const programme = await approve('M07-F01', { rule, risk, decision: 'adopt', basis: 'Applicable plan and approved rule' });
    assert.deepEqual(current.fieldwork, ['3.1.2']);
    assert.equal(current.papers.some(p => p.form === '3.1.3'), false);
    assert.match(find(programme).template.digest, /^[a-f0-9]{64}$/);
    await write('preparer', 'request', { form: '3.1.2', title: 'Evidence set', due: '2026-03-30' });
    const request = current.requests[0].id;
    await write('preparer', 'upload', { request, name: 'support.xlsx', source: 'Synthetic Finance', base64: Buffer.from('test-only evidence bytes').toString('base64') });
    await write('preparer', 'accept', { request });
    const evidence = current.evidence.find(e => e.request === request).id;
    await approve('M07-F06', { programme, expected: '100', actual: '120', precision: '5', threshold: '10', reliability: 'Checked against GL', evidence, investigation: 'Investigated additions', conclusion: 'Explained' });
    await approve('M07-F08', { programme, recipient: 'Synthetic third party', address: 'example.test', due: '2026-03-31', result: 'none', provenance: 'Auditor-controlled address', resolution: 'Alternative invoices and receipts' });
    const journal = await approve('M07-F09', { programme, population: evidence, entry: 'JE-15', line: '2', selection: 'Manual entry', evidence, test: 'Matched to source', exception: 'Approval missing', conclusion: 'Escalated to governance' });
    const coverage = { type: 'subsequent', paper: '3.2.1', evidence, work: 'Read minutes', result: 'resolved', conclusion: 'No further items' };
    const subsequent = await save('reviewer', 'M07-F10', coverage);
    await action('reviewer', 'M07-F10', subsequent, 'submit', {}, 409);
    await approve('M07-F10', { ...coverage, coverageThrough: create.reportDate }, 'reviewer', 'partner', subsequent);
    const annotation = await approve('M08-F07', { evidence, anchorKind: 'cell', anchor: 'Assets!C15', mark: 'tick', comment: 'Agreed to ledger' }, 'preparer', 'reviewer');
    await action('partner', 'M08-F07', annotation, 'reply', { reason: 'Reviewed source cell' });
    assert.equal(find(annotation).discussion[0].by, 'partner');
    await checkPaper('3.1.2', 'preparer', 'reviewer');
    await write('partner', 'statements', { statements: 'Synthetic statements', disclosures: 'Synthetic disclosures', lines: 'PPE,120' });
    const finalValues = { line: 'PPE', expected: '110', actual: '120', threshold: '5', risk, paper: '3.1.2', investigation: 'Supported by additions', conclusion: 'Explained variance' };
    const finalAnalytics = await approve('M10-F06', finalValues);
    const sufficiency = await approve('M10-F08', { analytics: finalAnalytics, limitations: 'None', contradictions: 'Resolved', findings: 'Governance item retained', result: 'sufficient', basis: 'Current reviewed sources' });
    const opinion = await approve('M10-F09', { sufficiency, opinion: 'qualified', basisType: 'misstatement', assessment: 'Recorded human evaluation', basis: 'Synthetic qualified basis' });
    const section = { opinion, type: 'other', wording: 'Synthetic <additional> wording', basis: 'Applicable scenario' };
    const additional = await save('reviewer', 'M10-F11', { ...section, template: '4.1.A1' });
    await action('reviewer', 'M10-F11', additional, 'submit', {}, 409);
    await approve('M10-F11', { ...section, template: '4.1.A2' }, 'reviewer', 'partner', additional);
    await approve('M10-F12', { requested: '2026-03-01', due: '2026-03-31', result: 'received', signed: '2026-03-15', evidence, assessment: 'Synthetic signed record reviewed' });
    await approve('M10-F13', { paper: '3.1.2', journal, recipient: 'Board', message: 'Approval exception', response: 'Acknowledged', delivery: evidence });
    await checkPaper('4.4', 'reviewer', 'partner');
    assert.ok(current.papers.some(p => p.form === '4.1.A2'));
    assert.ok(!current.papers.some(p => p.form === '4.1.A1'));
    await checkPaper('4.1.A2', 'reviewer', 'partner');
    assert.deepEqual(current.gaps, []);
    const original = await service.fetch('/report', cookies.partner);
    assert.equal(original.status, 200);
    assert.match(original.headers.get('content-disposition'), /4\.1\.A2/);
    const originalHtml = await original.text();
    assert.match(originalHtml, /Synthetic qualified basis/);
    assert.match(originalHtml, /Synthetic &lt;additional&gt; wording/);
    assert.match(originalHtml, /Synthetic statements/);
    await write('partner', 'authorize', {});
    assert.equal(current.authorized.current, true);
    assert.equal(current.authorized.artifactSha256, createHash('sha256').update(originalHtml).digest('hex'));
    await write('reviewer', 'report-date', { date: '2026-04-02' }, 403);
    await write('partner', 'report-date', { date: '2026-04-02' });
    assert.equal(current.authorized.current, false);
    assert.ok(current.gaps.some(gap => gap.startsWith('3.2.1')));
    await write('partner', 'issue', { reference: 'Stale authorization' }, 409);
    await approve('M07-F10', { ...coverage, coverageThrough: '2026-04-02' }, 'reviewer', 'partner', subsequent);
    await checkPaper('4.1.A2', 'reviewer', 'partner');
    assert.deepEqual(current.gaps, []);
    await write('partner', 'authorize', {});
    const authorizedHash = current.authorized.artifactSha256;
    const approvedReport = await service.fetch('/report', cookies.partner);
    const approvedHtml = await approvedReport.text();
    assert.equal(createHash('sha256').update(approvedHtml).digest('hex'), authorizedHash);
    assert.notEqual(approvedHtml, originalHtml);
    await write('partner', 'issue', { reference: 'Synthetic issued package record' });
    await write('partner', 'archive-seal', {});
    const archive = current.archive.packages[0].id;
    for (const role of ['preparer','reviewer']) {
      const ungranted = await (await service.fetch('', cookies[role])).json();
      assert.equal(ungranted.archive.packages[0].summary.files, undefined);
      assert.equal(ungranted.archive.packages[0].digest, undefined);
      assert.deepEqual(ungranted.evidence, []);
      assert.deepEqual(ungranted.papers, []);
      assert.doesNotMatch(JSON.stringify(ungranted), /support\.xlsx|registry\.csv/);
      assert.equal((await service.fetch('/report', cookies[role])).status, 404);
    }
    await write('reviewer', 'save', { form: '4.4', execution: 'Attempt change', conclusion: 'Blocked' }, 409);
    const retrieval = await approve('M12-F07', { package: archive, accessor: 'preparer', reason: 'Verify archived work', until: '2099-01-01' });
    const exported = await (await service.fetch('/archive-export/' + retrieval, cookies.preparer, {})).json();
    assert.equal(exported.scope, 'full');
    assert.ok(exported.content.evidence.some(e => e.id === evidence));
    assert.equal(exported.content.authorization.artifact.html, approvedHtml);
    assert.equal(exported.content.issue.reportSha256, authorizedHash);
    assert.ok(exported.content.authorization.templates.some(t => t.contract.id === '3.1.2' && t.hash === find(programme).template.digest));
    assert.equal((await service.fetch('/archive-export/' + retrieval, cookies.reviewer, {})).status, 403);
    assert.equal((await service.fetch('/evidence/' + evidence, cookies.reviewer)).status, 403);
    const inspection = await approve('M12-F10', { package: archive, accessor: 'reviewer', scope: 'report', until: '2099-01-01', reason: 'Review report only' });
    const scoped = await (await service.fetch('/archive-export/' + inspection, cookies.reviewer, {})).json();
    assert.deepEqual(Object.keys(scoped.content).sort(), ['issue','report']);
    assert.equal(scoped.content.report.html, approvedHtml);
    assert.doesNotMatch(JSON.stringify(scoped), /support\.xlsx|registry\.csv/);
    const reportOnly = await (await service.fetch('', cookies.reviewer)).json();
    assert.equal(reportOnly.archive.packages[0].summary.files, undefined);
    assert.equal((await service.fetch('/evidence/' + evidence, cookies.reviewer)).status, 403);
    await action('reviewer', 'M12-F10', inspection, 'revoke', { reason: 'Only partner revokes' }, 403);
    await action('partner', 'M12-F10', inspection, 'revoke', { reason: 'Inspection finished' });
    assert.equal(find(inspection).revoked.by, 'partner');
    assert.equal((await service.fetch('/archive-export/' + inspection, cookies.reviewer, {})).status, 403);
    const expired = await approve('M12-F07', { package: archive, accessor: 'reviewer', reason: 'Historical grant', until: '2020-01-01' });
    assert.equal((await service.fetch('/archive-export/' + expired, cookies.reviewer, {})).status, 403);
    const restore = await approve('M12-F09', { package: archive, type: 'restore', basis: 'Restore into scratch SQLite table' });
    assert.equal(find(restore).verification.ok, true);
    assert.equal(find(restore).verification.files, 2);
    const amendment = await approve('M12-F04', { package: archive, type: 'administrative', changes: 'Correct archive index label', basis: 'Content unchanged' });
    assert.equal(current.archive.packages.find(p => p.id === find(amendment).successor).previous, archive);
    const policy = await approve('M12-F08', { package: archive, type: 'policy', reference: 'Synthetic historical policy', anchor: '2000-01-01', years: '1', basis: 'Disposable test copy' });
    const hold = await approve('M12-F08', { package: archive, type: 'hold', reference: 'Synthetic hold', basis: 'Pending inspection' });
    const disposal = await save('reviewer', 'M12-F11', { package: archive, policy, basis: 'Eligible synthetic copy' });
    assert.match((await action('reviewer', 'M12-F11', disposal, 'submit', {}, 409)).error, /хориг/);
    await approve('M12-F08', { package: archive, type: 'release', reference: hold, basis: 'Inspection complete' });
    await action('reviewer', 'M12-F11', disposal, 'submit');
    await action('partner', 'M12-F11', disposal, 'approve', { reason: 'Synthetic copy and policy checked' });
    const successor = find(amendment).successor;
    const lateHold = await approve('M12-F08', { package: successor, type: 'hold', reference: 'Late hold', basis: 'New inspection' });
    await write('partner', 'archive-dispose', { id: disposal }, 409);
    await approve('M12-F08', { package: successor, type: 'release', reference: lateHold, basis: 'Inspection ended' });
    await write('partner', 'archive-dispose', { id: disposal });
    assert.equal(current.archive.packages.find(p => p.id === archive).disposed, 1);
    assert.equal((await service.fetch('/archive-export/' + retrieval, cookies.preparer, {})).status, 409);
    assert.equal((await service.fetch('/evidence/' + evidence, cookies.reviewer)).status, 403);
    await approve('M12-F04', { package: successor, type: 'substantive', changes: 'Correct final line', basis: 'New financial statement figures' });
    assert.equal(current.archive.reopened.package, successor);
    assert.equal((await service.fetch('/evidence/' + evidence, cookies.reviewer)).status, 200);
    await write('partner', 'statements', { statements: 'Synthetic statements', disclosures: 'Synthetic disclosures', lines: 'PPE,130' });
    assert.equal(current.authorized.current, false);
    assert.ok([finalAnalytics, sufficiency, opinion].every(id => find(id).stale));
    await write('partner', 'authorize', {}, 409);
    assert.deepEqual([...new Set(current.registers.map(r => r.kind))].sort(), registers.map(r => r.id).sort());
    assert.ok(registers.every(r => current.registers.some(row => row.kind === r.id && row.status === 'approved')));
    await service.close();
    service = null;
    service = await start(database);
    const reloaded = await signIn('partner');
    assert.equal(reloaded.archive.packages.find(p => p.id === archive).disposed, 1);
    assert.equal(reloaded.registers.find(r => r.id === opinion).values.opinion, 'qualified');
    assert.equal(reloaded.registers.find(r => r.id === restore).verification.restored, true);
  } finally {
    if (service) await service.close();
    for (const suffix of ['', '-shm', '-wal']) await rm(database + suffix, { force: true });
    await rmdir(dir);
  }
});
