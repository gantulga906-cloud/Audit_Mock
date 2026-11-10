import { isDeepStrictEqual } from 'node:util';

const marker = 'audit-lifecycle-v1 ';
const branchPlans = {
  A08: [
    'missing-benchmark-inputs',
    'invalid-scoped-threshold',
    'return-and-independent-review',
    'revision-reopens-dependent-work',
    'reopened-benchmark-evidence',
  ],
  A25: [
    'review-return-and-resubmit',
    'unresolved-professional-difference',
    'material-change-stales-review',
    'eqr-not-required',
    'eqr-ineligible',
    'eqr-stale-or-open-note',
    'eqr-after-report-date',
  ],
};

const text = value => typeof value === 'string' && value.trim().length > 0;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function recordLifecycleEvidence(context, journey) {
  context.diagnostic(marker + JSON.stringify(journey));
}

function proofIds(proofs, requiredIds, engagement, label) {
  if (!Array.isArray(proofs)) throw Error(label + ' evidence must be an array');
  const ids = new Set();
  for (const proof of proofs) {
    if (!object(proof) || !requiredIds.includes(proof.id) || ids.has(proof.id)) {
      throw Error('Unknown or repeated ' + label + ' ID ' + proof?.id);
    }
    if (proof.engagement !== engagement) throw Error(proof.id + ' belongs to a different engagement');
    if (!text(proof.actor) || !text(proof.action)) throw Error(proof.id + ' is missing its actor or action');
    if (!Object.hasOwn(proof, 'expected') || !Object.hasOwn(proof, 'actual') || !isDeepStrictEqual(proof.expected, proof.actual)) {
      throw Error(proof.id + ' is missing a matching expected and actual result');
    }
    if (!object(proof.versions) || !Object.keys(proof.versions).length ||
        Object.values(proof.versions).some(value => !text(value) && !Number.isFinite(value) && typeof value !== 'boolean')) {
      throw Error(proof.id + ' is missing valid source or output versions');
    }
    ids.add(proof.id);
  }
  return ids;
}

export function createLifecycleEvidenceCollector(normalize) {
  const executions = new Map();
  const diagnostics = [];
  const location = data => JSON.stringify([normalize(data.file), data.line, data.column, data.nesting]);

  function record({ type, data }) {
    if ((type === 'test:pass' || type === 'test:fail') && data.details?.type !== 'suite') {
      const key = location(data);
      if (executions.has(key)) {
        executions.set(key, null);
      } else {
        executions.set(key, {
          test: data.name,
          file: normalize(data.file),
          line: data.line,
          passed: type === 'test:pass' && !data.skip && !data.todo,
        });
      }
    }
    if (type === 'test:diagnostic' && data.message?.startsWith(marker)) {
      diagnostics.push({ key: location(data), payload: data.message.slice(marker.length) });
    }
  }

  function report(sourceSteps, stepReports, isApplicable = () => true) {
    const byLifecycle = Map.groupBy(sourceSteps, row => row.lifecycle);
    const stepResults = new Map(stepReports.map(row => [row.id, row]));
    const errors = [];
    const journeys = new Map();
    for (const diagnostic of diagnostics) {
      const execution = executions.get(diagnostic.key);
      if (!execution) {
        errors.push('Lifecycle evidence has no unique owning test at ' + diagnostic.key);
        continue;
      }
      if (!execution.passed) continue;
      try {
        const journey = JSON.parse(diagnostic.payload);
        if (!object(journey) || !byLifecycle.has(journey.lifecycle) || !text(journey.engagement)) {
          throw Error('Lifecycle evidence requires a known lifecycle and persisted engagement ID');
        }
        const stepIds = byLifecycle.get(journey.lifecycle).map(row => row.work_id);
        const branches = branchPlans[journey.lifecycle];
        const observedSteps = proofIds(journey.steps, stepIds, journey.engagement, 'step');
        const observedBranches = proofIds(journey.branches, branches ?? [], journey.engagement, 'branch');
        if (!isDeepStrictEqual([...observedSteps], stepIds.filter(id => observedSteps.has(id)))) {
          throw Error('Lifecycle steps must follow source order');
        }
        const applicableIds = stepIds.filter(id => isApplicable(stepResults.get(id)));
        const missingSteps = stepIds.filter(id => !observedSteps.has(id));
        const missingApplicableSteps = applicableIds.filter(id => !observedSteps.has(id));
        const missingBranches = branches?.filter(id => !observedBranches.has(id)) ?? null;
        if (!journeys.has(journey.lifecycle)) journeys.set(journey.lifecycle, []);
        journeys.get(journey.lifecycle).push({
          ...journey, test: execution.test, file: execution.file, line: execution.line,
          missingSteps, missingApplicableSteps, missingBranches,
          complete: missingSteps.length === 0 && missingBranches?.length === 0,
          applicableComplete: applicableIds.length > 0 && missingApplicableSteps.length === 0 && missingBranches?.length === 0,
        });
      } catch (error) {
        errors.push(execution.file + ':' + execution.line + ' · ' + execution.test + ' · ' + error.message);
      }
    }
    const lifecycles = [...byLifecycle].map(([id, rows]) => {
      const runs = journeys.get(id) ?? [];
      const observed = new Set(runs.flatMap(journey => journey.steps.map(step => step.id)));
      return {
        id, title: rows[0].lifecycle_title, steps: rows.length,
        observedSteps: rows.filter(({ work_id: step }) => observed.has(step) || stepResults.get(step)?.fixturePassed).length,
        applicableSteps: rows.filter(row => isApplicable(stepResults.get(row.work_id))).length,
        complete: runs.some(journey => journey.complete),
        applicableComplete: runs.some(journey => journey.applicableComplete),
        branchIds: branchPlans[id] ?? null,
        journeys: runs,
      };
    });
    return { lifecycles, errors };
  }

  return { record, report };
}
