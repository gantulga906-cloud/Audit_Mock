import {actorKey} from './pilot-identity-context.mjs';
import { createHash, randomUUID } from 'node:crypto';
import { validDate } from '../src/lib/feature-workflows.ts';
import { isCurrentReview, snapshot, workKey } from '../src/lib/workspace.ts';
import { invalidateReport, PilotError } from './pilot-workflow.mjs';
import { archiveGrantKinds } from './pilot-registers.mjs';
import { signatureMatches, strictRelease } from './pilot-release.mjs';
import { checkLaterFactArchive, laterFactForRelease } from './pilot-later-facts.mjs';
import {assemblySnapshot,assemblyRecord} from './pilot-assembly.mjs';
import {controlledArchive,archiveControlStale} from './pilot-archive-controls.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const today = () => new Date().toISOString().slice(0, 10);
const fail = message => { throw new PilotError(409, message); };
const approvedPolicies = m => (m.pilotRecords ?? []).filter(r =>
  r.kind === 'M12-F08' && r.status === 'approved' && r.values.type === 'policy');

export const archiveWorkBasis = paper => sha(JSON.stringify([
  Object.entries(paper.values).filter(([key])=>!/^(shared|planning|pilot)\./.test(key)).sort(([a],[b])=>a.localeCompare(b)),
  [...paper.evidence].sort(),
]));

const workBasis=archiveWorkBasis;
export function validateUnsealedRework(m,authorization,form,reportDate){
 const paper=m.work[workKey(m.engagement,form)],pack=authorization?.package;
 if(!validDate(reportDate)||reportDate<(pack?.reportDate??m.engagements[0].reportDate))fail('Анхны тайлангаас эртгүй шинэ огноо шаардлагатай.');
 const old=[pack?.paper,...(pack?.reliedOn??[]),...(authorization?.programmePapers??[]),...(authorization?.nativePapers??[]),...(authorization?.technicalPapers??[])].filter(Boolean).find(p=>p.id===paper?.id&&p.version===p.reviewedVersion);
 if(!isCurrentReview(paper)||!old||old.version!==paper.version||workBasis(old)!==workBasis(paper))fail('Яг анхны зөвшөөрсөн багцын одоогийн хянасан ажлыг сонгоно.');
 return paper;
}

export function archiveAmendmentRevision(m) {
  const amendment=m.archiveReopen, target=amendment?.target;
  if (!target) return undefined;
  if (amendment.reportDate!==m.engagements[0].reportDate) return undefined;
  const fact=laterFactForRelease(m);
  if (fact?.plan.revisedStatements==='yes'&&m.engagements[0].fsVersion<=fact.original.statements) return undefined;
  const paper=m.work[target.id];
  if (!isCurrentReview(paper)||paper.version<=target.version||workBasis(paper)===target.basis) return undefined;
  const review=paper.history.find(entry=>entry.version===paper.version&&entry.action==='Хянаж батлав');
  if (!review||review.at<amendment.at||workBasis(review)!==workBasis(paper)) return undefined;
  return {id:amendment.id,package:amendment.package,previousDigest:amendment.previousDigest,target,reportDate:amendment.reportDate,
    ...(fact&&{laterFact:fact.id}),
    review:{id:paper.id,form:paper.form,version:paper.version,reviewedVersion:paper.reviewedVersion,by:review.by,at:review.at,values:review.values,evidence:review.evidence}};
}

export function archiveAmendmentGap(m) {
  const amendment=m.archiveReopen;
  if (!amendment?.target) return '';
  if (amendment.reportDate!==m.engagements[0].reportDate) return 'Архивын өөрчлөлт · Баталсан шинэ тайлангийн огноо '+amendment.reportDate;
  return archiveAmendmentRevision(m)?'':amendment.target.form+' · Архивын өөрчлөлтөд шинэ ажил ба хяналт шаардлагатай.';
}
export const archiveAmendmentBasis = m => m.archiveReopen?.target
  ? [m.archiveReopen.target,archiveAmendmentRevision(m)]
  : m.pilotLastAmendment ? [m.pilotLastAmendment.target,m.pilotLastAmendment] : [];

function expiry(anchor, years) {
  const target = new Date(anchor + 'T00:00:00Z');
  const month = target.getUTCMonth();
  target.setUTCFullYear(target.getUTCFullYear() + years);
  if (target.getUTCMonth() !== month) target.setUTCDate(0);
  return target.toISOString().slice(0, 10);
}

function activeHolds(m, id,read) {
  const rows = (m.pilotRecords ?? []).filter(r => r.kind === 'M12-F08' && (!id || r.values.package === id));
  const released = new Set(rows.filter(r => r.status === 'approved' && r.values.type === 'release'&&(!controlledArchive(m)||r.values.determination==='confirmed'&&!archiveControlStale(m,r)&&[r.archiveControlBasis?.authority.evidence,r.archiveControlBasis?.policy].every(ref=>{const f=ref&&read?.(ref.id);return !!f&&f.sha256===ref.sha256&&sha(f.bytes)===ref.sha256}))).map(r => r.values.reference));
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
  const holds=(m,id)=>activeHolds(m,id,ref=>db.prepare('SELECT bytes,sha256 FROM evidence WHERE engagement_id=? AND id=?').get(m.engagement,ref));
  const policyCurrent=(m,row)=>!archiveControlStale(m,row)&&[row.archiveControlBasis?.authority.evidence,row.archiveControlBasis?.policy].every(ref=>{const f=ref&&db.prepare('SELECT bytes,sha256 FROM evidence WHERE engagement_id=? AND id=?').get(m.engagement,ref.id);return !!f&&f.sha256===ref.sha256&&sha(f.bytes)===ref.sha256});
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
      if(!validDate(values.anchor)||!/^\d{1,2}$/.test(values.years??'')||Number(values.years)<1)continue;
      const expires = expiry(values.anchor, Number(values.years));
      if (!retention || retention.expires < expires) retention = { policy, package: values.package, expires };
    }
    if(controlledArchive(m)){const scoped=policies.filter(r=>lineage.has(r.values.package)),resolved=new Set(scoped.filter(r=>r.values.determination==='confirmed'&&policyCurrent(m,r)).map(r=>r.values.supersedes).filter(Boolean)),unresolved=scoped.filter(r=>(r.values.determination!=='confirmed'||!policyCurrent(m,r))&&!resolved.has(r.id)).map(r=>r.id);return {...retention,status:scoped.length&&!unresolved.length?'confirmed':'unresolved',unresolved,policies:scoped.map(r=>({id:r.id,version:r.version,package:r.values.package}))};}
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
    if(bundle.assembly?.authorizationHistory?.some(entry=>entry.authorization.artifact&&sha(entry.authorization.artifact.html)!==entry.authorization.artifact.sha256))fail('Тайлангийн хадгалсан өмнөх хувилбарын хэш зөрсөн.');
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
    const prior = latest(m), amendment=m.archiveReopen;
    if (prior?.issued === issue.at) {
      if (amendment) fail('Архивын өөрчлөлтийн шинэ тайланг гаргана уу.');
      return prior.id;
    }
    if (prior && amendment?.package !== prior.id) fail('Агуулгын өөрчлөлтийг зөвшөөрнө үү.');
    const reviewed=archiveAmendmentRevision(m);
    if (amendment?.target&&(!reviewed||JSON.stringify(reviewed)!==JSON.stringify(signed.authorization.archiveAmendment))) {
      fail('Яг энэ өөрчлөлтийн баталсан ажлын хувилбар шаардлагатай.');
    }
    const fact=laterFactForRelease(m);
    if (fact&&(signed.authorization.laterFact?.id!==fact.id||
        !fact.original.recipients.every(recipient=>deliveries.some(row=>row.recipient===recipient&&row.state==='received')))) {
      fail('Өмнөх тайлангийн баталгаажсан бүх хүлээн авагч шинэ тайланг хүлээн авна.');
    }
    let assembly;
    try{assembly=assemblySnapshot(m,signed,id=>db.prepare('SELECT bytes,sha256 FROM evidence WHERE engagement_id=? AND id=?').get(m.engagement,id));}
    catch(error){fail(error.message);}
    if(assembly)assembly.authorizationHistory=db.prepare('SELECT snapshot FROM authorizations WHERE engagement_id=? ORDER BY id').all(m.engagement).map(row=>JSON.parse(row.snapshot)).filter(row=>row.authorization.at!==signed.authorization.at);
    const policyId=assembly?.basis.policyEvidence.id;
    const policy=policyId&&!signed.evidence.some(e=>e.id===policyId)?m.evidence.find(e=>e.id===policyId):undefined;
    const authorityRefs=[assembly?.basis.authority?.evidence,amendment?.authority?.evidence].filter(Boolean);
    const authoritySources=authorityRefs.map(ref=>{const source=m.evidence.find(e=>e.id===ref.id&&e.version===ref.version&&e.status==='accepted');if(!source)fail('Файлын эрхийн яг эхийн хувилбар шаардлагатай.');return {...source,sha256:ref.sha256};});
    const sources=[...signed.evidence,...(policy?[{...policy,sha256:assembly.basis.policyEvidence.sha256}]:[]),...authoritySources,...(assembly?.authorizationHistory??[]).flatMap(row=>row.evidence)];
    if(assembly){
      const historicalIds=new Set(assembly.history.papers.flatMap(p=>p.history.flatMap(row=>row.evidence??[])));
      for(const file of m.evidence.filter(e=>historicalIds.has(e.id)))if(!sources.some(e=>e.id===file.id)){
        const stored=db.prepare('SELECT sha256 FROM evidence WHERE engagement_id=? AND id=?').get(m.engagement,file.id);
        if(!stored)fail('Өмнөх ажлын эх файл олдсонгүй.');sources.push({...file,sha256:stored.sha256});
      }
    }
    const unique=new Map();for(const source of sources){if(unique.has(source.id)&&unique.get(source.id).sha256!==source.sha256)fail('Нэг эх файлын хувилбарын хэш зөрсөн.');unique.set(source.id,source);}
    const evidence = [...unique.values()].map(metadata => {
      const file = db.prepare('SELECT bytes FROM evidence WHERE engagement_id = ? AND id = ?').get(m.engagement, metadata.id);
      if (!file || sha(file.bytes) !== metadata.sha256) fail('Архивлах эх файл эсвэл хэш таарахгүй.');
      return { ...metadata, size: file.bytes.length, base64: Buffer.from(file.bytes).toString('base64') };
    });
    const id = insert(m, { ...signed, client: m.engagements[0].client, issue, evidence,...(assembly&&{assembly}),...(deliveries.length&&{deliveries}),
      ...(amendment && { changes: amendment }) }, prior?.id ?? null, issue.at, m.syntheticPilot ? 1 : 0);
    if(assembly)assemblyRecord(m).assemblyPackage=id;
    if(fact)fact.successor=id;
    if (amendment) {
      const row=(m.pilotRecords??[]).find(record=>record.id===amendment.id&&record.kind==='M12-F04'&&record.status==='approved');
      if (row) row.successor=id;
      if (reviewed) m.pilotLastAmendment=reviewed;
    }
    delete m.archiveReopen;
    return id;
  }
  function validateAmendmentWork(m, archive, form, reportDate) {
    const bundle=checkPayload(archive), paper=m.work[workKey(m.engagement,form)];
    const { package: original, programmePapers=[], nativePapers=[], technicalPapers=[], archiveAmendment }=bundle.authorization;
    const previousReportDate=original?.reportDate??m.engagements[0].reportDate;
    if (!validDate(reportDate)||reportDate<previousReportDate) fail('Өмнөх тайлангаас эртгүй, батлах шинэ тайлангийн огноо шаардлагатай.');
    const archived=[original?.paper,...(original?.reliedOn??[]),...programmePapers,...nativePapers,...technicalPapers,
      archiveAmendment?.review].filter(Boolean).find(item=>item.id===paper?.id&&item.version===item.reviewedVersion);
    if (!isCurrentReview(paper)||!archived||archived.version!==paper.version||workBasis(archived)!==workBasis(paper)) {
      fail('Анхны багцын одоогийн хянасан, нөлөөлөх ажлын баримтыг сонгоно уу.');
    }
  }
  function checkRecord(m, row) {
    const v = row.values, archive = read(m, v.package);
    if (!archive) fail('Архивын багц олдсонгүй.');
    if (!archive.payload && !(row.kind === 'M12-F08' && v.type === 'hold')) fail('Архивын агуулга байхгүй.');
    if (row.kind === 'M12-F04') {
      if (latest(m)?.id !== archive.id) fail('Одоогийн архивын багцыг сонгоно уу.');
      checkLaterFactArchive(m,row);
      if (v.type==='substantive') validateAmendmentWork(m,archive,v.paper,v.reportDate);
    }
    if (row.kind === 'M12-F08') {
      if (v.type === 'policy' && !(controlledArchive(m)&&v.determination==='unresolved') && (!validDate(v.anchor) || v.anchor > today() || !/^\d{1,2}$/.test(v.years) || Number(v.years) < 1)) fail('Бодлогын огноо ба бүтэн жилийн тоо шаардлагатай.');
      if (v.type === 'release' && !holds(m, archive.id).some(r => r.id === v.reference)) fail('Идэвхтэй хоригийн ID шаардлагатай.');
    }
    if (row.kind === 'M12-F10' && v.scope === 'evidence' && !JSON.parse(archive.summary).files.some(f => f.id === v.evidenceId)) fail('Багцын нотлох баримт сонгоно уу.');
    if (row.kind === 'M12-F11') {
      const policies = approvedPolicies(m);
      const policy = policies.filter(r => r.values.package === archive.id).sort((a, b) => a.at.localeCompare(b.at)).at(-1);
      if (!policy || policy.id !== v.policy) fail('Сонгосон багцын одоогийн баталсан бодлого шаардлагатай.');
      const retention = effectiveRetention(m, archive.id, policies);
      if(controlledArchive(m)&&retention?.status!=='confirmed')fail('Хадгалалтын хэрэглэгдэх шаардлага / эхлэх үйл явдал шийдээгүй тул хэвээр хадгална.');
      if (retention.expires > today()) fail('Холбогдох хамгийн урт хадгалалтын хугацаа дуусаагүй · ' + retention.expires);
      if (holds(m).length) fail('Идэвхтэй хориг байгаа тул устгах боломжгүй.');
      if (m.archiveReopen?.package === archive.id) fail('Нээлттэй агуулгын өөрчлөлтийг дуусгана уу.');
      if (m.pilotLaterFacts?.some(fact=>!fact.closed&&fact.original.package===archive.id)) fail('Гаргалтын дараах нээлттэй нөхцөлийг шийднэ үү.');
      row.eligibility = { policy: policy.id, effectivePolicy: retention.policy, expires: retention.expires, synthetic: !!archive.synthetic };
    }
  }
  function approveRecord(m, row, role) {
    const v = row.values;
    if (row.kind === 'M12-F09') {
      if(controlledArchive(m)&&v.type==='restore'){const source=db.prepare('SELECT bytes,sha256 FROM evidence WHERE engagement_id=? AND id=?').get(m.engagement,v.recoveryEvidence);let receipt;try{receipt=JSON.parse(Buffer.from(source?.bytes??[]).toString('utf8'));}catch{fail('Бодит сэргээх үр дүн JSON эх шаардлагатай.');}const archive=read(m,v.package);if(!source||sha(source.bytes)!==source.sha256||receipt.kind!=='audit-pilot-sqlite-recovery-v1'||receipt.verified!==true||!receipt.sourceManifest?.archives?.some(p=>p.id===archive.id&&p.digest===archive.digest)||JSON.stringify(receipt.sourceManifest)!==JSON.stringify(receipt.restoredManifest))fail('Яг архив, эрх ба эх байтын бодит сэргээх үр дүн таарахгүй.');row.verification={at:new Date().toISOString(),by:actorKey(role),restored:true,ok:true,files:receipt.sourceManifest.evidence.length,digest:archive.digest,method:'supported-sqlite-rehearsal-receipt',elapsedMs:receipt.elapsedMs,evidence:v.recoveryEvidence};return;}

      const archive = read(m, v.package);
      if (v.type === 'restore' && !archive.synthetic) fail('Сэргээх туршилтад зөвхөн зохиомол багц ашиглана.');
      const meta = { at: new Date().toISOString(), by:actorKey(role), restored: v.type === 'restore' };
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
    const changes = { package: v.package, id: row.id, type: v.type, changes: v.changes, basis: v.basis, approvedBy: role, at: new Date().toISOString(),...(controlledArchive(m)&&{authority:row.archiveControlBasis.authority,administrativeScope:v.administrativeScope??null,conclusionEffect:v.conclusionEffect??null,previousDigest:archive.digest}) };
    if (v.type === 'substantive') {
      const paper=m.work[workKey(m.engagement,v.paper)];
      const fact=checkLaterFactArchive(m,row);
      if (fact) { changes.laterFact=fact.id;fact.amendment=row.id; }
      changes.previousDigest=archive.digest;
      changes.target={id:paper.id,form:paper.form,version:paper.version,basis:workBasis(paper)};
      changes.reportDate=v.reportDate;
      snapshot(paper,m.person,'Архивын өөрчлөлтийн өмнөх ажил');
      paper.version++;
      paper.status='changed';
      paper.submittedVersion=undefined;
      paper.completedAt=undefined;
      m.archiveReopen = changes;
      invalidateReport(m, 'Архивын агуулгын өөрчлөлт зөвшөөрөв');
    } else {
      row.successor = insert(m, { ...checkPayload(archive), changes }, archive.id, archive.issued, archive.synthetic);
    }
  }
  function dispose(m, id, data={}) {
    const row = (m.pilotRecords ?? []).find(r => r.id === id && r.kind === 'M12-F11' && r.status === 'approved');
    if (!row) fail('Батлагдсан устгалын шийдвэр шаардлагатай.');
    if (row.executedAt) return;
    checkRecord(m, row);
    const archive = read(m, row.values.package);
    if (!archive.synthetic) fail('Туршилтаар бодит баримтын агуулгыг устгахгүй.');
    if(controlledArchive(m)&&(!data.method||!data.reason||data.method!=='synthetic-local-payload'))fail('Зөвхөн зохиомол локал payload-ыг салгах хязгаарлагдсан арга ба үлдэх хуулбарын бодит тайлбар шаардлагатай.');
    db.prepare('UPDATE pilot_archives SET payload = NULL WHERE engagement_id = ? AND id = ?').run(m.engagement, archive.id);
    row.executedAt = new Date().toISOString();
    if(controlledArchive(m))row.disposition={at:row.executedAt,method:data.method,by:'partner',result:'synthetic-local-payload-removed',reason:data.reason,remaining:row.values.residualPlan,secureErasureProven:false};
  }
  function exportPackage(m, grantId, role) {
    const grant = (m.pilotRecords ?? []).find(r => r.id === grantId && r.status === 'approved' && archiveGrantKinds.includes(r.kind));
    if (!grant || grant.revoked || grant.values.accessor !== role || grant.values.until < today()||controlledArchive(m)&&archiveControlStale(m,grant)) throw new PilotError(403, 'Хандалтын зөвшөөрөл шаардлагатай.');
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
  function currentForRequest(m) {
    const archive=latest(m);
    if (!isSealed(m)||!archive||archive.disposed) fail('Хүсэлт гаргах түгжээтэй архивын багц олдсонгүй.');
    return archive.id;
  }
  const grantsFor=(m,id,role)=>(m.pilotRecords??[]).filter(r=>archiveGrantKinds.includes(r.kind)&&r.status==='approved'&&!r.revoked&&r.values.package===id&&r.values.accessor===role&&r.values.until>=today()&&(!controlledArchive(m)||!archiveControlStale(m,r)));
  function allowedRecord(m,row,role){
   if(role==='partner'||!controlledArchive(m)||!row.kind.startsWith('M12-'))return true;
   if(archiveGrantKinds.includes(row.kind))return row.owner===role||row.values.accessor===role;
   return grantsFor(m,row.values.package??row.assemblyPackage,role).some(g=>g.kind==='M12-F07');
  }
  const view=(m,role)=>({sealed:isSealed(m),packages:list(m).filter(p=>role==='partner'||!(strictRelease(m)||m.pilotCustody)||grantsFor(m,p.id,role).length).map(p=>{
   const {digest,summary,...index}=p,grants=grantsFor(m,p.id,role),full=grants.some(g=>g.kind==='M12-F07'),scope=full?'full':grants.some(g=>g.values.scope==='report')?'report':'evidence';
   const count=role==='partner'||!controlledArchive(m)||full?summary.files.length:scope==='report'?1:new Set(grants.map(g=>g.values.evidenceId)).size;
   const metadata={client:summary.client,fileCount:count,...(controlledArchive(m)&&role!=='partner'&&{scope})};
   if(controlledArchive(m)&&role!=='partner'&&index.previous&&!grantsFor(m,index.previous,role).length)delete index.previous;
   return {...index,summary:metadata,...(role==='partner'?{digest,holds:holds(m).length,summary:{...metadata,files:summary.files},retention:effectiveRetention(m,p.id,approvedPolicies(m)),access:db.prepare('SELECT actor,at,reason,scope FROM pilot_archive_access WHERE package=? ORDER BY id DESC LIMIT 25').all(p.id)}:!controlledArchive(m)?{holds:holds(m).length}:{} )};
  }),reopened:role==='partner'?m.archiveReopen??null:m.archiveReopen?{basis:m.archiveReopen.basis,reportDate:m.archiveReopen.reportDate,...(m.archiveReopen.target&&{target:{form:m.archiveReopen.target.form,version:m.archiveReopen.target.version}})}:null,issue:role==='partner'?m.pilotIssue??null:null});
  const isSealed = m => !m.archiveReopen && !!db.prepare('SELECT 1 FROM pilot_archives WHERE engagement_id = ? LIMIT 1').get(m.engagement);
  return { seal, checkRecord, approveRecord, dispose, exportPackage, inspectCustody, currentForRequest, view, isSealed,
    allowedRecord,custodyRestrictions:(m,id)=>({holds:holds(m).length,retention:effectiveRetention(m,id,approvedPolicies(m)),protection:'sealed'}),validateAmendmentWork:(m,id,form,reportDate)=>validateAmendmentWork(m,read(m,id),form,reportDate) };
}
