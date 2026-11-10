import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLifecycleEvidenceCollector, recordLifecycleEvidence } from '../scripts/pilot-lifecycle-evidence.mjs';

const steps = ['A25-P1-W1', 'A25-P2-W1', 'A25-P3-W1'];
const branches = [
  'review-return-and-resubmit',
  'unresolved-professional-difference',
  'material-change-stales-review',
  'eqr-not-required',
  'eqr-ineligible',
  'eqr-stale-or-open-note',
  'eqr-after-report-date',
];
const source = [...steps, 'B01-P1-W1'].map(work_id => ({
  work_id, lifecycle: work_id.split('-')[0], lifecycle_title: work_id.split('-')[0],
}));
const reports = source.map(row => ({ id: row.work_id, scope: 'core', fixturePassed: false }));
const proof = (id, engagement) => ({
  id, engagement, actor: 'reviewer', action: 'review current work',
  expected: { status: 200 }, actual: { status: 200 }, versions: { paper: 2 },
});
const journey = (ids = steps, outcomes = branches, engagement = 'E-1') => ({
  lifecycle: 'A25', engagement,
  steps: ids.map(id => proof(id, engagement)),
  branches: outcomes.map(id => proof(id, engagement)),
});

function collect(collector, evidence, line, outcome = 'pass', flags = {}) {
  const location = { file: 'tests/scenario.test.mjs', line, column: 1, nesting: 0 };
  collector.record({ type: 'test:' + outcome, data: { ...location, name: 'persisted audit fixture', ...flags } });
  recordLifecycleEvidence({
    diagnostic: message => collector.record({ type: 'test:diagnostic', data: { ...location, message } }),
  }, evidence);
}

test('lifecycle reports never combine passing tests or count diagnostics from failed or skipped tests', () => {
  const collector = createLifecycleEvidenceCollector(String);
  collect(collector, journey(steps.slice(0, 2)), 10);
  collect(collector, journey(steps.slice(2)), 20);
  collect(collector, journey(), 30, 'fail');
  collect(collector, journey(), 40, 'pass', { skip: 'fixture disabled' });
  const { lifecycles: [cycle], errors } = collector.report(source, reports);
  assert.deepEqual(errors, []);
  assert.equal(cycle.observedSteps, 3);
  assert.equal(cycle.journeys.length, 2);
  assert.equal(cycle.complete, false);
});

test('a passing persisted journey needs every planned branch before it can close its source cycle', () => {
  const collector = createLifecycleEvidenceCollector(String);
  collect(collector, journey(steps, branches.slice(1)), 10);
  const missing = collector.report(source, reports).lifecycles[0];
  assert.equal(missing.complete, false);
  assert.deepEqual(missing.journeys[0].missingBranches, [branches[0]]);
  collect(collector, journey(), 20);
  const { lifecycles: [cycle], errors } = collector.report(source, reports);
  assert.deepEqual(errors, []);
  assert.equal(cycle.complete, true);
  assert.equal(cycle.applicableComplete, true);
  assert.equal(cycle.journeys[1].engagement, 'E-1');
  assert.equal(cycle.journeys[1].line, 20);
});

test('approved scope may close a narrower journey while source inventory remains unchanged', () => {
  const collector = createLifecycleEvidenceCollector(String);
  collect(collector, journey(steps.slice(0, 2)), 10);
  collect(collector, { lifecycle: 'B01', engagement: 'E-1', steps: [proof('B01-P1-W1', 'E-1')], branches: [] }, 20);
  const scope = reports.map(row => row.id === steps[2] ? { ...row, scope: 'conditional' } : row);
  const { lifecycles: [cycle, widerWork], errors } = collector.report(source, scope, row => row.scope === 'core');
  assert.deepEqual(errors, []);
  assert.equal(cycle.steps, 3);
  assert.equal(cycle.applicableSteps, 2);
  assert.equal(cycle.applicableComplete, true);
  assert.equal(cycle.complete, false);
  assert.equal(widerWork.observedSteps, 1);
  assert.equal(widerWork.applicableComplete, false);
  assert.equal(widerWork.branchIds, null);
});

test('lifecycle evidence rejects mixed engagements, unordered handoffs, mismatches and ambiguous test origins', () => {
  const collector = createLifecycleEvidenceCollector(String);
  const mixed = journey();
  mixed.steps[0].engagement = 'E-2';
  collect(collector, mixed, 10);
  collect(collector, journey([...steps].reverse()), 20);
  const mismatch = journey();
  mismatch.steps[0].actual = { status: 409 };
  collect(collector, mismatch, 30);
  collect(collector, journey(), 40);
  collect(collector, journey(), 40);
  const { lifecycles: [cycle], errors } = collector.report(source, reports);
  assert.match(errors[0], /different engagement/);
  assert.match(errors[1], /source order/);
  assert.match(errors[2], /matching expected and actual result/);
  assert.match(errors[3], /no unique owning test/);
  assert.equal(cycle.complete, false);
  assert.equal(cycle.observedSteps, 0);
});
