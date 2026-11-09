import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function git(...args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

const next = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url));
const commit = git('rev-parse', 'HEAD');
const status = git('status', '--porcelain');
const result = spawnSync(process.execPath, [next, 'build', '--webpack'], { stdio: 'inherit' });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

const sourceManifest = readFileSync('docs/research/source-manifest.json');
const buildInfo = {
  build: readFileSync('.next/BUILD_ID', 'utf8').trim(),
  commit,
  dirty: status === null ? null : status !== '',
  sourceManifestSha256: createHash('sha256').update(sourceManifest).digest('hex'),
};
writeFileSync('out/build-info.json', JSON.stringify(buildInfo, null, 2) + '\n');
