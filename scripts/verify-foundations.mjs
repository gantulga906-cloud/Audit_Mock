import { spawnSync, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);
const args = process.argv.slice(2);
if (args.some(arg => arg !== '--build')) throw Error('Usage: npm run verify:foundations -- [--build]');
const run = spawnSync(process.execPath, [join(root, 'scripts/verify-release.mjs'), ...args], { stdio: 'inherit' });
if (run.error) throw run.error;
if (run.status !== 0) process.exit(run.status ?? 1);

const read = path => readFileSync(join(root, path));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const matrixPath = 'docs/research/foundation-contracts.json';
const matrix = JSON.parse(read(matrixPath));
const source = JSON.parse(read('.audit-pilot/source-verification.json'));
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const sourceChecks = Object.entries(matrix.sourceDigests).map(([path, expected]) => {
  const bytes = read(path), actual = sha(bytes.toString('utf8').replaceAll('\r\n', '\n'));
  return { path, expected, actual, rawSha256: sha(bytes), encoding: matrix.sourceDigestEncoding, passed: actual === expected };
});
const inventoryChecks = Object.entries(matrix.inventories).map(([kind, expected]) => {
  const actual = source.reports[kind]?.length; return { kind, expected, actual, passed: actual === expected };
});
const testsCurrent = source.testFiles.every(row => sha(readFileSync(join(root, row.file), 'utf8').replaceAll('\r\n', '\n')) === row.sha256);
const contracts = matrix.contracts.map(contract => ({
  ...contract,
  evidence: contract.checks.map(check => {
    const matches = source.tests.filter(row => row.file === check.file && row.name === check.test && !row.suite);
    const file = source.testFiles.find(row => row.file === check.file);
    return { ...check, sha256: file?.sha256, outcome: matches.length === 1 ? matches[0].outcome : matches.length ? 'ambiguous' : 'missing',
      referenceCheckPassed: testsCurrent && !!file && matches.length === 1 && matches[0].outcome === 'passed' };
  }),
}));
const scopeChecks = [
  { kind: 'registeredRows', actual: Object.values(source.reports).reduce((sum, rows) => sum + rows.length, 0), expected: matrix.scope.registeredRows },
  { kind: 'coreFeatures', actual: source.reports.features.filter(row => row.scope === 'core').length, expected: matrix.scope.coreFeatures },
  { kind: 'conditionalFeatures', actual: source.reports.features.filter(row => row.scope === 'conditional').length, expected: matrix.scope.conditionalFeatures },
  { kind: 'excludedFeatures', actual: source.reports.features.filter(row => row.scope === 'excluded').length, expected: matrix.scope.excludedFeatures },
  { kind: 'pendingExtensions', actual: source.reports.extensions.filter(row => row.scope === 'pending').length, expected: matrix.scope.pendingExtensions },
].map(row => ({ ...row, passed: row.actual === row.expected }));
const expectedIds = Array.from({ length: 8 }, (_, i) => 'SC0' + (i + 1));
const matrixValid = matrix.guide === 'G00' && matrix.contracts.length === 8 && expectedIds.every(id => contracts.some(row => row.id === id && row.evidence.length > 0));
const referenceChecksPassed = matrixValid && testsCurrent && source.summary.commit === commit && sourceChecks.every(row => row.passed) &&
  inventoryChecks.every(row => row.passed) && scopeChecks.every(row => row.passed) && contracts.every(row => row.evidence.every(item => item.referenceCheckPassed));
const referenceCheckpointReady = referenceChecksPassed && source.summary.buildCurrent && source.summary.clean;
const result = {
  guide: 'G00', matrixSha256: sha(read(matrixPath)), commit, profile: 'Shared-pilot engineering foundation checkpoint',
  referenceChecksPassed, referenceCheckpointReady, buildCurrent: source.summary.buildCurrent,
  tests: source.summary.tests, sourceChecks, inventoryChecks, scopeChecks, contracts,
  connectedSourceCycles: source.summary.cycles, releaseReady: source.summary.releaseReady,
  independentAcceptance: 'Separate source/operational decisions; never inferred from this checkpoint',
  knownLimits: ['Preset identities; intended production deployment remains open', 'Method/policy/standards applicability and wider source variants remain in their owning packages',
    'The new G00 connected fixture uses the retained synthetic shared-core report profile; full A26/A27 and independent-role profiles remain separately tested'],
};
writeFileSync(join(root, '.audit-pilot/foundation-verification.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ guide: result.guide, commit, referenceCheckpointReady, contracts: contracts.length,
  registeredRows: scopeChecks[0].actual, tests: result.tests, releaseReady: result.releaseReady,
  report: '.audit-pilot/foundation-verification.json' }, null, 2));
if (!referenceCheckpointReady) process.exitCode = 1;
