import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evidenceKey, reviewContractEvidence, sourceRowSha } from '../scripts/pilot-contract-evidence.mjs';

const row = { id: 'M01-F01', requirement: 'Keep the exact approved revision' };
const conditional = { work_id: 'B01-P1-W1', source_applicability: 'Firm-level candidate' };
const mandatory = { work_id: 'A01-P1-W1', source_applicability: 'Core / as applicable' };
const transition = { id: 'BPMN-S1-Example', stage: 1, kind: 'flow' };
const extension = { id: 'AUTO-001-FUTURE' };
const available = { features: [row], e2e: [conditional, mandatory], transitions: [transition], extensions: [extension] };
const testFile = { file: 'tests/pilot.test.mjs', sha256: 'f'.repeat(64) };
const scenario = { file: testFile.file, test: 'preserves the approved revision', outcome: 'passed', actors: ['reviewer'], features: [row.id] };
const decision = {
  kind: 'features', id: row.id, decision: 'accepted', sourceSha256: sourceRowSha(row),
  owner: 'Fixture implementation owner', reviewer: 'Fixture review authority', reference: 'Fixture review ID', reason: 'Both branches were reviewed',
  checks: [
    { ...testFile, test: scenario.test, branch: 'positive', actor: 'reviewer', action: 'Read the approved revision', expected: 'Version 2', observed: 'Version 2' },
    { ...testFile, test: scenario.test, branch: 'negative', actor: 'reviewer', action: 'Approve stale version', expected: '409', observed: '409' },
  ],
};
const resultFor = (record, sources = available, scenarios = [scenario], files = [testFile]) =>
  reviewContractEvidence(sources, [record], scenarios, files).get(evidenceKey(record.kind, record.id));

test('source acceptance needs a separate decision over passing positive and negative checks', () => {
  assert.equal(resultFor(decision).current, true);
  assert.equal(reviewContractEvidence(available, [], [scenario], [testFile]).size, 0);
  assert.throws(() => resultFor({ ...decision, reviewer: decision.owner.toUpperCase() }), /separate reviewer/);
  assert.throws(() => resultFor({ ...decision, checks: decision.checks.slice(0, 1) }), /positive and negative/);
  assert.throws(() => reviewContractEvidence(available, [decision, decision], [scenario], [testFile]), /duplicate/);
});

test('changed sources, failed runs and mismatched test revisions reopen a reviewed source contract', () => {
  assert.match(resultFor(decision, { ...available, features: [{ ...row, requirement: 'Revised' }] }).reasons[0], /Source row has changed/);
  assert.equal(resultFor(decision, available, [{ ...scenario, outcome: 'failed' }]).current, false);
  assert.equal(resultFor(decision, available, [{ ...scenario, features: [] }]).current, false);
  assert.equal(resultFor(decision, available, [{ ...scenario, actors: ['preparer'] }]).current, false);
  assert.equal(resultFor(decision, available, [scenario], [{ ...testFile, sha256: '0'.repeat(64) }]).current, false);
  assert.equal(resultFor({ ...decision, checks: [decision.checks[0], { ...decision.checks[1], observed: '200' }] }).current, false);
});

test('an explicit scope decision can defer an eligible source step while core steps remain in scope', () => {
  const scope = { ...decision, kind: 'e2e', id: conditional.work_id, sourceSha256: sourceRowSha(conditional), decision: 'conditional', checks: undefined };
  assert.equal(resultFor(scope).current, true);
  assert.throws(() => resultFor({ ...scope, id: mandatory.work_id, sourceSha256: sourceRowSha(mandatory) }), /outside the source eligibility/);
  assert.equal(resultFor({ ...scope, sourceSha256: sourceRowSha(mandatory) }).current, false);
  assert.equal(resultFor({ ...scope, kind: 'transitions', id: transition.id, sourceSha256: sourceRowSha(transition), decision: 'excluded' }).current, true);
  assert.equal(resultFor({ ...scope, kind: 'extensions', id: extension.id, sourceSha256: sourceRowSha(extension) }).current, true);
});
