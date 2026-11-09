import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm, rmdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPilot } from '../scripts/pilot-server.mjs';

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
    await write(reviewer, 'request', { title: 'Asset register', due: '2026-03-20' }, 409, 1);
    const requested = await write(reviewer, 'request', { title: 'Asset register', due: '2026-03-20' });
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
