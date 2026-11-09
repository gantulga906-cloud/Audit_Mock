import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm, rmdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPilot } from '../scripts/pilot-server.mjs';
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
    await approve('M07-F10', { type: 'subsequent', paper: '4.4', evidence, work: 'Read minutes', result: 'resolved', conclusion: 'No further items' });
    const annotation = await approve('M08-F07', { evidence, anchorKind: 'cell', anchor: 'Assets!C15', mark: 'tick', comment: 'Agreed to ledger' }, 'preparer', 'reviewer');
    await action('partner', 'M08-F07', annotation, 'reply', { reason: 'Reviewed source cell' });
    assert.equal(find(annotation).discussion[0].by, 'partner');
    await checkPaper('3.1.2', 'preparer', 'reviewer');
    await write('partner', 'statements', { statements: 'Synthetic statements', disclosures: 'Synthetic disclosures', lines: 'PPE,120' });
    const finalValues = { line: 'PPE', expected: '110', actual: '120', threshold: '5', risk, paper: '3.1.2', investigation: 'Supported by additions', conclusion: 'Explained variance' };
    const finalAnalytics = await approve('M10-F06', finalValues);
    const sufficiency = await approve('M10-F08', { analytics: finalAnalytics, limitations: 'None', contradictions: 'Resolved', findings: 'Governance item retained', result: 'sufficient', basis: 'Current reviewed sources' });
    const opinion = await approve('M10-F09', { sufficiency, opinion: 'unmodified', basisType: 'none', assessment: 'Recorded human evaluation', basis: 'Synthetic opinion basis' });
    await approve('M10-F11', { opinion, template: '4.1.A1', type: 'other', wording: 'Synthetic additional wording', basis: 'Applicable scenario' });
    await approve('M10-F12', { requested: '2026-03-01', due: '2026-03-31', result: 'received', signed: '2026-03-15', evidence, assessment: 'Synthetic signed record reviewed' });
    await approve('M10-F13', { paper: '3.1.2', journal, recipient: 'Board', message: 'Approval exception', response: 'Acknowledged', delivery: evidence });
    await checkPaper('4.4', 'reviewer', 'partner');
    await checkPaper('4.1.A1', 'reviewer', 'partner');
    assert.deepEqual(current.gaps, []);
    await write('partner', 'authorize', {});
    assert.equal(current.authorized.current, true);
    await write('partner', 'issue', { reference: 'Synthetic issued package record' });
    await write('partner', 'archive-seal', {});
    const archive = current.archive.packages[0].id;
    await write('reviewer', 'save', { form: '4.4', execution: 'Attempt change', conclusion: 'Blocked' }, 409);
    const retrieval = await approve('M12-F07', { package: archive, accessor: 'preparer', reason: 'Verify archived work', until: '2099-01-01' });
    const exported = await (await service.fetch('/archive-export/' + retrieval, cookies.preparer, {})).json();
    assert.equal(exported.scope, 'full');
    assert.ok(exported.content.evidence.some(e => e.id === evidence));
    assert.ok(exported.content.authorization.templates.some(t => t.contract.id === '3.1.2' && t.hash === find(programme).template.digest));
    assert.equal((await service.fetch('/archive-export/' + retrieval, cookies.reviewer, {})).status, 403);
    assert.equal((await service.fetch('/evidence/' + evidence, cookies.reviewer)).status, 403);
    const inspection = await approve('M12-F10', { package: archive, accessor: 'reviewer', scope: 'report', until: '2099-01-01', reason: 'Review report only' });
    const scoped = await (await service.fetch('/archive-export/' + inspection, cookies.reviewer, {})).json();
    assert.deepEqual(Object.keys(scoped.content).sort(), ['issue','report']);
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
    assert.equal(reloaded.registers.find(r => r.id === opinion).values.opinion, 'unmodified');
    assert.equal(reloaded.registers.find(r => r.id === restore).verification.restored, true);
  } finally {
    if (service) await service.close();
    for (const suffix of ['', '-shm', '-wal']) await rm(database + suffix, { force: true });
    await rmdir(dir);
  }
});
