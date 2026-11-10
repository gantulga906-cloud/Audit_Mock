import { createHash, randomUUID } from 'node:crypto';
import { validDate } from '../src/lib/feature-workflows.ts';
import { invalidateReport, PilotError } from './pilot-workflow.mjs';
import { archiveGrantKinds } from './pilot-registers.mjs';
import { signatureMatches, strictRelease } from './pilot-release.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const today = () => new Date().toISOString().slice(0, 10);
const fail = message => { throw new PilotError(409, message); };
const approvedPolicies = m => (m.pilotRecords ?? []).filter(r =>
  r.kind === 'M12-F08' && r.status === 'approved' && r.values.type === 'policy');

function expiry(anchor, years) {
  const target = new Date(anchor + 'T00:00:00Z');
  const month = target.getUTCMonth();
  target.setUTCFullYear(target.getUTCFullYear() + years);
  if (target.getUTCMonth() !== month) target.setUTCDate(0);
  return target.toISOString().slice(0, 10);
}

function activeHolds(m, id) {
  const rows = (m.pilotRecords ?? []).filter(r => r.kind === 'M12-F08' && (!id || r.values.package === id));
  const released = new Set(rows.filter(r => r.status === 'approved' && r.values.type === 'release').map(r => r.values.reference));
  return rows.filter(r => r.values.type === 'hold' && !released.has(r.id));
}

export function createArchiveStore(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS pilot_archives (
      id TEXT PRIMARY KEY, previous TEXT REFERENCES pilot_archives(id), issued TEXT NOT NULL,
      sealed TEXT NOT NULL, digest TEXT NOT NULL, synthetic INTEGER NOT NULL, summary TEXT NOT NULL, payload TEXT
    );
    CREATE TABLE IF NOT EXISTS pilot_archive_access (
      id INTEGER PRIMARY KEY, package TEXT NOT NULL REFERENCES pilot_archives(id),
      grant_id TEXT NOT NULL, actor TEXT NOT NULL, at TEXT NOT NULL, reason TEXT NOT NULL, scope TEXT NOT NULL
    );
    CREATE TEMP TABLE IF NOT EXISTS pilot_archive_restore (id TEXT PRIMARY KEY, name TEXT NOT NULL, bytes BLOB NOT NULL);
  `);
  const read = (m, id) => db.prepare('SELECT * FROM pilot_archives WHERE engagement_id = ? AND id = ?').get(m.engagement, id);
  const list = m => db.prepare(`SELECT id, previous, issued, sealed, digest, synthetic, summary, payload IS NULL AS disposed
    FROM pilot_archives WHERE engagement_id = ? ORDER BY sealed DESC, rowid DESC`).all(m.engagement)
    .map(r => ({ ...r, summary: JSON.parse(r.summary) }));
  const latest = m => list(m)[0];
  let ancestors;
  function effectiveRetention(m, id, policies) {
    ancestors ??= db.prepare(`
      WITH RECURSIVE lineage(id, previous) AS (
        SELECT id, previous FROM pilot_archives WHERE engagement_id = ? AND id = ?
        UNION
        SELECT a.id, a.previous FROM pilot_archives a JOIN lineage ON a.id = lineage.previous
        WHERE a.engagement_id = ?
      ) SELECT id FROM lineage`);
    const lineage = new Set(ancestors.all(m.engagement, id, m.engagement).map(row => row.id));
    let retention;
    for (const { id: policy, values } of policies) {
      if (!lineage.has(values.package)) continue;
      const expires = expiry(values.anchor, Number(values.years));
      if (!retention || retention.expires < expires) retention = { policy, package: values.package, expires };
    }
    return retention;
  }
  function checkPayload(row) {
    if (!row?.payload) fail('Сэргээх архивын агуулга байхгүй.');
    if (sha(row.payload) !== row.digest) fail('Архивын хэш таарахгүй.');
    const bundle = JSON.parse(row.payload);
    const artifact = bundle.authorization.artifact;
    if (artifact && (sha(artifact.html) !== artifact.sha256 || artifact.sha256 !== bundle.issue.reportSha256)) {
      fail('Зөвшөөрсөн тайлангийн хэш таарахгүй.');
    }
    if (bundle.issue.signature&&!signatureMatches(bundle.issue.signature,artifact)) fail('Тайлангийн локал гарын үсэг таарахгүй.');
    if (bundle.evidence.some(e => {
      const bytes = Buffer.from(e.base64, 'base64');
      return !bytes.length || bytes.length !== e.size || sha(bytes) !== e.sha256;
    })) fail('Эх файлын хэмжээ эсвэл хэш таарахгүй.');
    return bundle;
  }
  function insert(m, bundle, previous, issued, synthetic) {
    const payload = JSON.stringify(bundle), id = randomUUID(), sealed = new Date().toISOString();
    if (Buffer.byteLength(payload) > 30_000_000) fail('Туршилтын архивын багц 30 MB-аас их байна.');
    const summary = { client: bundle.client, files: bundle.evidence.map(({ id, name, version, sha256 }) => ({ id, name, version, sha256 })),
      changes: bundle.changes ?? null };
    db.prepare(`INSERT INTO pilot_archives (id, previous, issued, sealed, digest, synthetic, summary, payload, engagement_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, previous, issued, sealed, sha(payload), synthetic, JSON.stringify(summary), payload, m.engagement);
    return id;
  }
  function seal(m, signed, deliveries=[]) {
    const issue = m.pilotIssue;
    if (!issue || !signed) fail('Яг зөвшөөрсөн багцыг эхлээд гаргана уу.');
    const artifact = signed.authorization.artifact;
    if (artifact && (sha(artifact.html) !== artifact.sha256 || artifact.sha256 !== issue.reportSha256)) fail('Зөвшөөрсөн тайлангийн хэш таарахгүй.');
    const prior = latest(m);
    if (prior?.issued === issue.at) return prior.id;
    if (prior && (!m.archiveReopen || m.archiveReopen.package !== prior.id)) fail('Агуулгын өөрчлөлтийг зөвшөөрнө үү.');
    const evidence = signed.evidence.map(metadata => {
      const file = db.prepare('SELECT bytes FROM evidence WHERE engagement_id = ? AND id = ?').get(m.engagement, metadata.id);
      if (!file || sha(file.bytes) !== metadata.sha256) fail('Архивлах эх файл эсвэл хэш таарахгүй.');
      return { ...metadata, size: file.bytes.length, base64: Buffer.from(file.bytes).toString('base64') };
    });
    const id = insert(m, { ...signed, client: m.engagements[0].client, issue, evidence,...(deliveries.length&&{deliveries}),
      ...(m.archiveReopen && { changes: m.archiveReopen }) }, prior?.id ?? null, issue.at, m.syntheticPilot ? 1 : 0);
    delete m.archiveReopen;
    return id;
  }
  function checkRecord(m, row) {
    const v = row.values, archive = read(m, v.package);
    if (!archive) fail('Архивын багц олдсонгүй.');
    if (!archive.payload && !(row.kind === 'M12-F08' && v.type === 'hold')) fail('Архивын агуулга байхгүй.');
    if (row.kind === 'M12-F04' && latest(m)?.id !== archive.id) fail('Одоогийн архивын багцыг сонгоно уу.');
    if (row.kind === 'M12-F08') {
      if (v.type === 'policy' && (!validDate(v.anchor) || v.anchor > today() || !/^\d{1,2}$/.test(v.years) || Number(v.years) < 1)) fail('Бодлогын огноо ба бүтэн жилийн тоо шаардлагатай.');
      if (v.type === 'release' && !activeHolds(m, archive.id).some(r => r.id === v.reference)) fail('Идэвхтэй хоригийн ID шаардлагатай.');
    }
    if (row.kind === 'M12-F10' && v.scope === 'evidence' && !JSON.parse(archive.summary).files.some(f => f.id === v.evidenceId)) fail('Багцын нотлох баримт сонгоно уу.');
    if (row.kind === 'M12-F11') {
      const policies = approvedPolicies(m);
      const policy = policies.filter(r => r.values.package === archive.id).sort((a, b) => a.at.localeCompare(b.at)).at(-1);
      if (!policy || policy.id !== v.policy) fail('Сонгосон багцын одоогийн баталсан бодлого шаардлагатай.');
      const retention = effectiveRetention(m, archive.id, policies);
      if (retention.expires > today()) fail('Холбогдох хамгийн урт хадгалалтын хугацаа дуусаагүй · ' + retention.expires);
      if (activeHolds(m).length) fail('Идэвхтэй хориг байгаа тул устгах боломжгүй.');
      if (m.archiveReopen?.package === archive.id) fail('Нээлттэй агуулгын өөрчлөлтийг дуусгана уу.');
      row.eligibility = { policy: policy.id, effectivePolicy: retention.policy, expires: retention.expires, synthetic: !!archive.synthetic };
    }
  }
  function approveRecord(m, row, role) {
    const v = row.values;
    if (row.kind === 'M12-F09') {
      const archive = read(m, v.package);
      if (v.type === 'restore' && !archive.synthetic) fail('Сэргээх туршилтад зөвхөн зохиомол багц ашиглана.');
      const meta = { at: new Date().toISOString(), by: role, restored: v.type === 'restore' };
      try {
        const bundle = checkPayload(archive);
        if (meta.restored) {
          for (const f of bundle.evidence) db.prepare('INSERT INTO pilot_archive_restore VALUES (?, ?, ?)').run(f.id, f.name, Buffer.from(f.base64, 'base64'));
          for (const f of bundle.evidence) {
            const copy = db.prepare('SELECT name, bytes FROM pilot_archive_restore WHERE id = ?').get(f.id);
            if (!copy || copy.name !== f.name || sha(copy.bytes) !== f.sha256) fail('Сэргээсэн файл таарахгүй.');
          }
        }
        row.verification = { ...meta, ok: true, files: bundle.evidence.length, digest: archive.digest };
      } catch (e) {
        if (!(e instanceof PilotError) && !(e instanceof SyntaxError)) throw e;
        row.verification = { ...meta, ok: false, files: 0, error: e.message };
      } finally {
        if (meta.restored) db.exec('DELETE FROM pilot_archive_restore');
      }
    }
    if (row.kind !== 'M12-F04') return;
    if (m.archiveReopen) fail('Өмнөх архивын өөрчлөлтийг дуусгана уу.');
    const archive = read(m, v.package);
    const changes = { package: v.package, id: row.id, type: v.type, changes: v.changes, basis: v.basis, approvedBy: role, at: new Date().toISOString() };
    if (v.type === 'substantive') {
      m.archiveReopen = changes;
      invalidateReport(m, 'Архивын агуулгын өөрчлөлт зөвшөөрөв');
    } else {
      row.successor = insert(m, { ...checkPayload(archive), changes }, archive.id, archive.issued, archive.synthetic);
    }
  }
  function dispose(m, id) {
    const row = (m.pilotRecords ?? []).find(r => r.id === id && r.kind === 'M12-F11' && r.status === 'approved');
    if (!row) fail('Батлагдсан устгалын шийдвэр шаардлагатай.');
    if (row.executedAt) return;
    checkRecord(m, row);
    const archive = read(m, row.values.package);
    if (!archive.synthetic) fail('Туршилтаар бодит баримтын агуулгыг устгахгүй.');
    db.prepare('UPDATE pilot_archives SET payload = NULL WHERE engagement_id = ? AND id = ?').run(m.engagement, archive.id);
    row.executedAt = new Date().toISOString();
  }
  function exportPackage(m, grantId, role) {
    const grant = (m.pilotRecords ?? []).find(r => r.id === grantId && r.status === 'approved' && archiveGrantKinds.includes(r.kind));
    if (!grant || grant.revoked || grant.values.accessor !== role || grant.values.until < today()) throw new PilotError(403, 'Хандалтын зөвшөөрөл шаардлагатай.');
    const v = grant.values, archive = read(m, v.package), bundle = checkPayload(archive);
    const scope = grant.kind === 'M12-F07' ? 'full' : v.scope;
    const content = scope === 'full' ? bundle : scope === 'report' ? {
      report: bundle.authorization.artifact ?? bundle.authorization.package.paper, issue: bundle.issue,
    } :
      { evidence: bundle.evidence.filter(e => e.id === v.evidenceId) };
    const at = new Date().toISOString();
    db.prepare('INSERT INTO pilot_archive_access (package, grant_id, actor, at, reason, scope) VALUES (?, ?, ?, ?, ?, ?)')
      .run(archive.id, grant.id, role, at, v.reason, scope);
    return { id: archive.id, scope, at, digest: sha(JSON.stringify(content)), content };
  }
  function inspectCustody(m,id,mustBeLatest=false) {
    const row=read(m,id);
    if (!row||mustBeLatest&&latest(m)?.id!==id) fail('Яг түгжсэн архивын багц олдсонгүй.');
    return {digest:row.digest,payload:row.payload,bundle:checkPayload(row)};
  }
  const view = (m, role) => ({ sealed:isSealed(m),packages: list(m).filter(p=>{
    if (role==='partner'||!(strictRelease(m)||m.pilotCustody)) return true;
    return (m.pilotRecords??[]).some(row=>archiveGrantKinds.includes(row.kind)&&row.values.package===p.id&&
      row.status==='approved'&&!row.revoked&&row.values.accessor===role&&row.values.until>=today());
  }).map(p => {
    const { digest, summary, ...index } = p;
    const metadata = { client: summary.client, fileCount: summary.files.length };
    return {
      ...index, summary: metadata, holds: activeHolds(m).length,
      ...(role === 'partner' && { digest, summary: { ...metadata, files: summary.files },
        retention: effectiveRetention(m, p.id, approvedPolicies(m)),
        access: db.prepare('SELECT actor, at, reason, scope FROM pilot_archive_access WHERE package = ? ORDER BY id DESC LIMIT 25').all(p.id) }),
    };
  }), reopened: m.archiveReopen ?? null, issue: role === 'partner' ? m.pilotIssue ?? null : null });
  const isSealed = m => !m.archiveReopen && !!db.prepare('SELECT 1 FROM pilot_archives WHERE engagement_id = ? LIMIT 1').get(m.engagement);
  return { seal, checkRecord, approveRecord, dispose, exportPackage, inspectCustody, view, isSealed };
}
