import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, rm, rmdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPilot } from '../scripts/pilot-server.mjs';

const passwords = { preparer: 'foundation-preparer', reviewer: 'foundation-reviewer', partner: 'foundation-partner' };
const subject = { client: 'Foundation fixture A', legalForm: 'ХХК', registration: 'FOUNDATION-A', framework: 'Test',
  contact: 'Synthetic finance contact', email: 'foundation@example.test', start: '2025-01-01', end: '2025-12-31',
  reportDate: '2026-04-01', synthetic: 'yes' };
const hash = value => createHash('sha256').update(value).digest('hex');
const paper = (state, form) => state.papers.find(row => row.form === form);

async function start(database, setup = false) {
  const pilot = createPilot({ database, setupCode: 'foundation-bootstrap' });
  const server = createServer((req, res) => void pilot.handle(req, res, new URL(req.url, 'http://127.0.0.1')));
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const origin = 'http://127.0.0.1:' + server.address().port;
  async function request(path, cookie, data) {
    return fetch(origin + '/api/pilot' + path, { method: data === undefined ? 'GET' : 'POST',
      headers: { ...(cookie && { Cookie: cookie }), ...(data !== undefined && { Origin: origin, 'Content-Type': 'application/json' }) },
      body: data === undefined ? undefined : JSON.stringify(data) });
  }
  try {
    if (setup) assert.equal((await request('/setup', '', { code: 'foundation-bootstrap', ...passwords })).status, 201);
    const cookies = {};
    for (const role of Object.keys(passwords)) {
      const response = await request('/login', '', { role, password: passwords[role] });
      assert.equal(response.status, 200); cookies[role] = response.headers.get('set-cookie').split(';')[0];
    }
    const scope = (path, id) => path + '?engagement=' + id;
    async function view(role, id, expected = 200) {
      const response = await request(scope('', id), cookies[role]); assert.equal(response.status, expected); return response.json();
    }
    async function command(role, id, data, expected = 200) {
      const response = await request(scope('/action', id), cookies[role], data), body = await response.json();
      assert.equal(response.status, expected, String(data?.action) + ': ' + JSON.stringify(body)); return body;
    }
    async function write(role, id, action, fields = {}, expected = 200, extra = {}) {
      return command(role, id, { action, fields, revision: (await view(role, id)).revision, ...extra }, expected);
    }
    return { cookies, request, view, command, write, scope,
      async close() { await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); pilot.close(); } };
  } catch (error) {
    await new Promise(resolve => server.close(resolve)); pilot.close(); throw error;
  }
}

test('malformed shared commands leave revisions and retry keys untouched', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'audit-foundation-input-')), database = join(dir, 'case.sqlite');
  let app;
  try {
    app = await start(database, true);
    const initial = await app.view('reviewer', 'firm'), key = randomUUID();
    const malformed = [
      { revision: initial.revision },
      { action: null, fields: {}, revision: initial.revision },
      { action: 42, fields: {}, revision: initial.revision },
      { action: '', fields: {}, revision: initial.revision },
      { action: '  ', fields: {}, revision: initial.revision },
      { action: 'x'.repeat(81), fields: {}, revision: initial.revision },
      { action: 'create', fields: null, revision: initial.revision },
      { action: 'create', fields: [], revision: initial.revision },
      { action: 'create', fields: 'bad', revision: initial.revision },
      { action: 'create', fields: 1, revision: initial.revision },
      { action: 'create', fields: {}, revision: '0' },
      { action: 'create', fields: {}, revision: -1 },
      { action: 'create', fields: {}, revision: 0.5 },
      { action: 'create', fields: {}, revision: Number.MAX_SAFE_INTEGER + 1 },
      { action: 'create', fields: {} },
    ];
    for (const data of malformed) {
      await app.command('reviewer', 'firm', { ...data, idempotencyKey: key }, 400);
      assert.deepEqual(await app.view('reviewer', 'firm'), initial);
    }
    const created = await app.write('reviewer', 'firm', 'create', subject, 200, { idempotencyKey: key });
    assert.equal(created.portfolio.length, 1);
    const id = created.selected;
    await app.command('reviewer', id, { action: 42, revision: created.revision }, 400);
    await app.write('partner', id, 'activate', { independence: 'Synthetic clearance', letter: 'Agreed fixture terms', assessment: 'Fixture only' });
    assert.equal((await app.write('reviewer', id, 'unknown-command', {}, 404)).error.length > 0, true);
    assert.equal((await app.view('reviewer', 'firm')).portfolio.length, 1);
    // Legacy clients may omit empty fields; per-action validators still own actual field types.
    await app.command('reviewer', id, { action: 'unknown-command', revision: (await app.view('reviewer', id)).revision }, 404);
  } finally {
    if (app) await app.close();
    for (const suffix of ['', '-wal', '-shm']) await rm(database + suffix, { force: true });
    await rmdir(dir);
  }
});

test('G00 shared foundations preserve scoped work, exact evidence and approval history through change and restart', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'audit-foundation-journey-')), database = join(dir, 'case.sqlite');
  let app;
  try {
    app = await start(database, true);
    const a = (await app.write('reviewer', 'firm', 'create', subject)).selected;
    const b = (await app.write('reviewer', 'firm', 'create', { ...subject, client: 'Restricted fixture B', registration: 'FOUNDATION-B', includePreparer: 'no' })).selected;
    assert.notEqual(a, b);
    assert.doesNotMatch(JSON.stringify(await app.view('preparer', b, 404)), /Restricted fixture/);
    for (const id of [a, b]) await app.write('partner', id, 'activate', { independence: 'Synthetic clearance', letter: 'Synthetic agreed terms', assessment: 'Fixture only' });
    await app.write('partner', b, 'access', { role: 'preparer', access: 'grant', reason: 'Assigned fixture work' });

    const requestFields = { title: 'Foundation original', due: '2026-03-20' };
    const requestPacket = { action: 'request', fields: requestFields, revision: (await app.view('reviewer', a)).revision, idempotencyKey: randomUUID() };
    const requested = await app.command('reviewer', a, requestPacket), request = requested.requests[0].id;
    const replay = await app.command('reviewer', a, { ...requestPacket, fields: { due: requestFields.due, title: requestFields.title } });
    assert.equal(replay.revision, requested.revision); assert.equal(replay.requests.length, 1);
    await app.command('reviewer', a, { ...requestPacket, fields: { ...requestFields, title: 'Changed intent' } }, 409);
    await app.command('reviewer', b, requestPacket, 409);
    const stale = (await app.view('reviewer', a)).revision;
    await app.write('reviewer', a, 'schedule', { form: '3.1.2', start: '2026-03-01', due: '2026-03-20' });
    await app.command('reviewer', a, { action: 'schedule', fields: { form: '3.1.2', start: '2026-03-01', due: '2026-03-21' }, revision: stale }, 409);

    const bytesA = Buffer.from('asset,amount\nINV-0007,100\n');
    const uploaded = await app.write('preparer', a, 'upload', { request, name: 'foundation-a.csv', source: 'Synthetic finance export', base64: bytesA.toString('base64') });
    const evidenceA = uploaded.evidence.find(row => row.name === 'foundation-a.csv');
    assert.equal(evidenceA.sha256, hash(bytesA));
    assert.notEqual(uploaded.requests[0].status, 'complete');
    await app.write('preparer', a, 'accept', { request });
    assert.equal((await app.request(app.scope('/evidence/' + evidenceA.id, b), app.cookies.reviewer)).status, 404);

    const work = { form: '3.1.2', execution: 'Compared INV-0007 to exact accepted original', conclusion: 'Supported fixture amount 100' };
    const savePacket = { action: 'save', fields: work, revision: (await app.view('preparer', a)).revision, idempotencyKey: randomUUID() };
    await app.command('preparer', a, savePacket);
    const submitted = await app.write('preparer', a, 'submit', { form: work.form });
    await app.write('preparer', a, 'review', { form: work.form }, 403);
    const reviewed = await app.write('reviewer', a, 'review', { form: work.form });
    assert.equal(paper(reviewed, work.form).reviewedVersion, paper(submitted, work.form).version);
    const exactWorkVersion = paper(reviewed, work.form).version;
    const bBefore = await app.view('reviewer', b);

    const tasks = await app.write('reviewer', a, 'task-add', { owner: 'preparer', title: 'Follow up source', due: '2026-03-20', form: work.form });
    await app.write('preparer', a, 'task-status', { id: tasks.delivery.tasks[0].id, done: 'yes' });
    assert.equal(paper(await app.view('reviewer', a), work.form).version, exactWorkVersion);

    await app.write('partner', a, 'statements', { statements: 'Synthetic statements v1', disclosures: 'Synthetic notes v1' });
    for (const form of ['4.4', '4.1.A1']) {
      await app.write('reviewer', a, 'save', { form, execution: 'Reviewed fixture basis', conclusion: 'Exact supported version' });
      await app.write('reviewer', a, 'submit', { form }); await app.write('partner', a, 'review', { form });
    }
    await app.write('partner', a, 'authorize');
    const authBefore = await (await app.request(app.scope('/authorizations', a), app.cookies.partner)).json();
    const artifactHash = authBefore[0].authorization.artifact.sha256;
    assert.equal(artifactHash, hash(authBefore[0].authorization.artifact.html));

    const changed = await app.write('partner', a, 'statements', { statements: 'Synthetic statements v2', disclosures: 'Synthetic notes v1' });
    assert.equal(changed.authorized.current, false);
    assert.equal(paper(changed, '4.1.A1').status, 'changed');
    assert.equal(paper(changed, work.form).reviewedVersion, exactWorkVersion);
    assert.deepEqual(await app.view('reviewer', b), bBefore);
    assert.deepEqual(await (await app.request(app.scope('/authorizations', a), app.cookies.partner)).json(), authBefore);

    await app.write('partner', a, 'access', { role: 'preparer', access: 'revoke', reason: 'Assignment ended' });
    await app.view('preparer', a, 404);
    assert.equal((await app.request(app.scope('/evidence/' + evidenceA.id, a), app.cookies.preparer)).status, 404);
    await app.command('preparer', a, savePacket, 404);
    assert.equal((await app.view('preparer', b)).selected, b);
    await app.close(); app = null;
    app = await start(database);
    const afterRestart = await app.command('reviewer', a, requestPacket);
    assert.deepEqual(afterRestart.requests.map(row => row.id), [request]);
    assert.equal(afterRestart.authorized.current, false);
    assert.equal(paper(afterRestart, work.form).reviewedVersion, exactWorkVersion);
    assert.deepEqual(await (await app.request(app.scope('/authorizations', a), app.cookies.partner)).json(), authBefore);
    assert.deepEqual(Buffer.from(await (await app.request(app.scope('/evidence/' + evidenceA.id, a), app.cookies.reviewer)).arrayBuffer()), bytesA);
    await app.view('preparer', a, 404);

    const evidence = { guide: 'G00', profile: 'shared-core synthetic reference; preset identities and retained legacy report path',
      actors: ['preparer', 'reviewer', 'partner'], engagements: [a, b], workVersion: exactWorkVersion,
      original: { id: evidenceA.id, version: evidenceA.version, sha256: hash(bytesA) }, retainedAuthorization: artifactHash,
      checks: { normal: 'passed', negative: 'passed', change: 'passed', restartAndRetry: 'passed' },
      sourceAcceptance: 'open; no independent acceptance or additional A-series lifecycle claimed' };
    t.diagnostic('audit-foundation-v1 ' + JSON.stringify(evidence));
    if (process.env.AUDIT_FOUNDATION_EVIDENCE_DIR) {
      await mkdir(process.env.AUDIT_FOUNDATION_EVIDENCE_DIR, { recursive: true });
      await writeFile(join(process.env.AUDIT_FOUNDATION_EVIDENCE_DIR, 'g00-connected-evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
    }
  } finally {
    if (app) await app.close();
    for (const suffix of ['', '-wal', '-shm']) await rm(database + suffix, { force: true });
    await rmdir(dir);
  }
});
