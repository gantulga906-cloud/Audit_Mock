import { createHash } from 'node:crypto';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const isSha = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const hasText = value => typeof value === 'string' && value.trim().length > 0;
const scopeEligible = (kind, row) => ['transitions', 'extensions'].includes(kind) || kind === 'e2e' &&
  ['Conditional / separate', 'When annual report exists', 'Firm-level candidate', 'Only if offered and permitted'].includes(row.source_applicability);
export const sourceRowId = (kind, row) => kind === 'e2e' ? row.work_id : row.id;
export const sourceRowSha = row => hash(JSON.stringify(row));
export const evidenceKey = (kind, id) => JSON.stringify([kind, id]);

export function reviewContractEvidence(available, decisions, scenarios, testFiles) {
  if (!Array.isArray(decisions)) throw Error('Release decisions must be an array');
  const known = new Map(Object.entries(available).flatMap(([kind, rows]) =>
    rows.map(row => [evidenceKey(kind, sourceRowId(kind, row)), row])));
  const files = new Map(testFiles.map(file => [file.file, file.sha256]));
  const evidence = new Map();

  for (const record of decisions) {
    const { kind, id, decision, sourceSha256, owner, reviewer, reference, reason, checks } = record;
    const key = evidenceKey(kind, id), row = known.get(key);
    if (!row || evidence.has(key)) throw Error('Unknown or duplicate release decision ' + key);
    if (![owner, reviewer, reference, reason].every(hasText) || !isSha(sourceSha256) ||
        owner.trim().toLowerCase() === reviewer.trim().toLowerCase()) {
      throw Error('Release decision needs the source hash, owner, separate reviewer, reference and rationale ' + key);
    }
    const reasons = [];
    if (sourceRowSha(row) !== sourceSha256) reasons.push('Source row has changed');
    if (decision === 'accepted') {
      if (!Array.isArray(checks) || !['positive', 'negative'].every(branch => checks.some(check => check.branch === branch))) {
        throw Error('Acceptance requires positive and negative assertions ' + key);
      }
      for (const check of checks) {
        const { file, test, sha256, branch, actor, action, expected, observed } = check;
        if (![file, test, actor, action, expected, observed].every(hasText) || !isSha(sha256) ||
            !['positive', 'negative'].includes(branch)) throw Error('Incomplete acceptance check ' + key);
        if (expected.trim() !== observed.trim()) reasons.push('Expected and observed outcomes differ for ' + branch + ' check ' + action);
        const scenario = scenarios.find(item => item.file === file && item.test === test && item[kind]?.includes(id));
        if (scenario?.outcome !== 'passed' || !scenario.actors.includes(actor) || files.get(file) !== sha256) {
          reasons.push('No current passing test for ' + branch + ' check ' + file + ' · ' + test);
        }
      }
    } else if (!['conditional', 'excluded'].includes(decision) || !scopeEligible(kind, row)) {
      throw Error('Release scope decision is outside the source eligibility ' + key);
    }
    evidence.set(key, { ...record, current: reasons.length === 0, reasons });
  }
  return evidence;
}
