import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { accounts, deliverySummary, emptyWorkspace, input, PilotError, pilotAction, pilotReport, pilotView } from './pilot-workflow.mjs';
import { createArchiveStore } from './pilot-archive.mjs';
import { archiveGrantKinds } from './pilot-registers.mjs';
import { registers } from '../src/lib/pilot-registers.ts';
import { createPilotStore, firmCommand } from './pilot-store.mjs';
import { isLibraryAction, libraryAction, libraryTemplate, libraryView } from './pilot-forms.mjs';
import { activeTermsGap, canDraftTerms, createIntakeStore, isIntakeAction, termsAction, termsGaps } from './pilot-intake.mjs';
import { approvedStaffing, managedStaffing, rosterView, seatFor, staffingGaps } from './pilot-staffing.mjs';
import { recordEvent } from '../src/lib/workspace.ts';
import { createConfirmationStore } from './pilot-confirmations.mjs';
import { createOversightStore, oversightRoles } from './pilot-oversight.mjs';
import { createReleaseStore } from './pilot-release.mjs';

const prefix = '/api/pilot';
const termsRemediation = new Set(['intake-terms-save','intake-terms-approve','support-upload','support-assess','schedule','access']);
const digest = value => createHash('sha256').update(value).digest('hex');
const sessionMs = 8 * 60 * 60 * 1000;
const roles = Object.keys(accounts);

function json(res, status, payload, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  if (req.headers['content-type']?.split(';')[0] !== 'application/json') throw new PilotError(415, 'JSON хүсэлт шаардлагатай.');
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 7_100_000) throw new PilotError(413, 'Хүсэлт хэт том байна.');
    chunks.push(chunk);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error();
    return value;
  } catch {
    throw new PilotError(400, 'Хүсэлтийн бүтэц буруу байна.');
  }
}

export function createPilot({ database, setupCode = randomBytes(16).toString('hex') }) {
  if (database !== ':memory:') mkdirSync(dirname(database), { recursive: true });
  const db = new DatabaseSync(database);
  db.exec(`
    PRAGMA busy_timeout = 5000;
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS accounts (role TEXT PRIMARY KEY, salt TEXT NOT NULL, hash BLOB NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, role TEXT NOT NULL REFERENCES accounts(role), expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS workspace (id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL, body TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS evidence (id TEXT PRIMARY KEY, name TEXT NOT NULL, sha256 TEXT NOT NULL, bytes BLOB NOT NULL);
    CREATE TABLE IF NOT EXISTS authorizations (id INTEGER PRIMARY KEY, snapshot TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS pilot_templates (digest TEXT PRIMARY KEY, body TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS pilot_commands (
      actor TEXT NOT NULL, key TEXT NOT NULL, fingerprint TEXT NOT NULL,
      PRIMARY KEY (actor, key)
    );
  `);
  db.prepare('INSERT OR IGNORE INTO workspace VALUES (1, 0, ?)').run(JSON.stringify(emptyWorkspace()));
  const archive = createArchiveStore(db);
  const store = createPilotStore(db);
  const intake = createIntakeStore(db, store);
  const { transaction } = store;
  const configured = () => db.prepare('SELECT COUNT(*) AS total FROM accounts').get().total !== 0;
  const filesFor = engagementId => ({
    get: id => db.prepare('SELECT name, sha256 FROM evidence WHERE engagement_id = ? AND id = ?').get(engagementId, id),
    read: id => db.prepare('SELECT bytes, sha256 FROM evidence WHERE engagement_id = ? AND id = ?').get(engagementId,id),
    add: (id, name, bytes) => db.prepare(`INSERT INTO evidence (id, name, sha256, bytes, engagement_id)
      VALUES (?, ?, ?, ?, ?)`).run(id, name, digest(bytes), bytes, engagementId),
    authorize: (authorization, evidence) => db.prepare('INSERT INTO authorizations (snapshot, engagement_id) VALUES (?, ?)').run(JSON.stringify({ authorization, evidence }), engagementId),
    authorization: () => {
      const saved = db.prepare('SELECT snapshot FROM authorizations WHERE engagement_id = ? ORDER BY id DESC LIMIT 1').get(engagementId);
      return saved && JSON.parse(saved.snapshot);
    },
    storeTemplate: (hash, contract) => db.prepare('INSERT OR IGNORE INTO pilot_templates VALUES (?, ?)').run(hash, JSON.stringify(contract)),
    template: hash => JSON.parse(db.prepare('SELECT body FROM pilot_templates WHERE digest = ?').get(hash)?.body ?? 'null'),
    confirmations: () => confirmations.view(engagementId),
    deliveries: () => releases.view(engagementId),
    oversightConfigured: role => !!db.prepare('SELECT 1 FROM accounts WHERE role=?').get(role),
    checkArchiveRecord: (model, row) => {
      if (archiveGrantKinds.includes(row.kind) && !store.members(engagementId).includes(row.values.accessor)) {
        throw new PilotError(409, 'Энэ дүр гэрээт ажилд хандах эрхгүй.');
      }
      archive.checkRecord(model, row);
    },
    approveArchiveRecord: archive.approveRecord,
    member: role => !!engagementId && store.members(engagementId).includes(role),
    staffingModels: store.staffingModels,
    archive,
  });
  const confirmations = createConfirmationStore(db,store,filesFor);
  const oversight = createOversightStore(store,filesFor);
  const releases = createReleaseStore(db,store,filesFor);
  function resolveScope(role, url) {
    const ids = url.searchParams.getAll('engagement');
    if (ids.length > 1 || ids.some(id => id !== 'firm' && !/^E-[a-f0-9-]{36}$/.test(id))) {
      throw new PilotError(404, 'Гэрээт ажил олдсонгүй.');
    }
    if (ids.length) return ids[0] === 'firm' ? null : ids[0];
    const accessible = store.portfolio(role);
    return accessible.length === 1 ? accessible[0].id : null;
  }
  function view(role, id) {
    const { model, revision } = store.load(role, id);
    const portfolio = store.portfolio(role).map(item => id ? item : {
      ...item, progress: deliverySummary(store.load(role, item.id).model, role, archive),
    });
    const files = filesFor(id);
    const payload = pilotView(model, role, revision, files);
    if (payload.engagement && !payload.engagement.active) {
      payload.engagement.acceptanceGaps.push(...intake.activationGaps(model), ...termsGaps(model, files), ...staffingGaps(model));
    }
    return { ...payload, selected: id, portfolio,
      formLibrary: libraryView(model.pilotFormLibrary, role, files, !id),
      ...(!id && { intake: intake.view(role), roster: rosterView(model, files, role, new Set(portfolio.map(item=>item.id))) }),
      ...(id && (role === 'partner' || !archive.isSealed(model)) && {
        staffing: { managed: managedStaffing(model), members: store.members(id), seats: approvedStaffing(model),
          gaps: staffingGaps(model), accepted: model.pilotStaffingAccepted },
      }),
      ...(id && model.pilotIntake && (role === 'partner' || !archive.isSealed(model)) && { intakeContext: intake.contextView(model) }),
      ...(id && !archive.isSealed(model) && model.pilotTerms && {
        intakeTerms: model.pilotTerms, intakeTermsHistory: model.pilotTermsHistory ?? [],
        intakeTermsAmendable: !model.pilotIssue&&!model.engagements[0]?.issued,
        intakeTermsCanDraft: canDraftTerms(model,role),
      }),
      ...(id && !archive.isSealed(model) && {confirmations:confirmations.view(id)}),
      ...(id && role === 'partner' && { members: store.members(id) }) };
  }
  function changeMembership(context, actor, fields) {
    if (!context.id || actor !== 'partner') throw new PilotError(403, 'Партнерын томилгоо шаардлагатай.');
    const role = input(fields, 'role', 20), access = input(fields, 'access', 12);
    if (!['preparer','reviewer'].includes(role) || !['grant','revoke'].includes(access)) throw new PilotError(400, 'Томилгоог шалгана уу.');
    const reason = input(fields, 'reason'), grant = access === 'grant';
    if (grant && context.model.engagements[0].intake.active && managedStaffing(context.model) && !seatFor(context.model, role)) {
      throw new PilotError(409, 'Одоогийн баталсан ажилтны томилгоо шаардлагатай.');
    }
    if (!store.setMember(context.id, role, grant)) return;
    const model = context.model;
    if (!grant) {
      const revoked = { by: actor, at: new Date().toISOString(), reason };
      for (const row of model.pilotRecords) {
        if (archiveGrantKinds.includes(row.kind) && row.status === 'approved' && row.values.accessor === role && !row.revoked) row.revoked = revoked;
      }
    }
    recordEvent(model, (grant ? 'Гэрээт ажилд хандах эрх олгов' : 'Гэрээт ажилд хандах эрх цуцлав') + ' · ' + role + ' · ' + reason);
  }
  let attempts = 0;
  let resetAt = 0;
  function limitAttempts() {
    if (Date.now() >= resetAt) { attempts = 0; resetAt = Date.now() + 60_000; }
    if (++attempts > 15) throw new PilotError(429, 'Нэг минутын дараа дахин оролдоно уу.');
  }
  const cookie = (name, token, maxAge) => `${name}=${token}; Path=/api/pilot; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`;

  async function handle(req, res, url) {
    if (url.pathname !== prefix && !url.pathname.startsWith(prefix + '/')) return false;
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    try {
      const port = req.socket.localPort;
      const host = req.headers.host;
      if (host !== '127.0.0.1:' + port && host !== 'localhost:' + port) throw new PilotError(403, 'Зөвхөн локал хаягаар нээнэ үү.');
      const route = url.pathname.slice(prefix.length);
      const delivery=/^\/delivery\/([a-f0-9]{64})(\/artifact)?$/.exec(route);
      if (delivery&&['GET','POST'].includes(req.method)) {
        const token=delivery[1];
        if (req.method==='GET'&&delivery[2]) {
          const artifact=transaction(()=>releases.download(token));
          res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; sandbox",
            'X-Audit-Report-SHA256':artifact.sha256,'Content-Disposition':`attachment; filename="audit-report-${artifact.form}.html"`});
          res.end(artifact.html);
        } else if (req.method==='GET') json(res,200,transaction(()=>releases.read(token),false));
        else {
          if (delivery[2]||req.headers.origin!=='http://'+host) throw new PilotError(403,'Хүсэлтийн эх хаяг тохирохгүй.');
          const fields=await readJson(req);
          json(res,200,transaction(()=>releases.receive(token,fields)));
        }
        return true;
      }
      if (route.startsWith('/oversight')) {
        const name='audit_oversight_'+port;
        const sessionToken=(req.headers.cookie??'').split(';').map(value=>value.trim())
          .find(value=>value.startsWith(name+'='))?.slice(name.length+1);
        if (req.method==='POST'&&req.headers.origin!=='http://'+host) throw new PilotError(403,'Хүсэлтийн эх хаяг тохирохгүй.');
        if (req.method==='POST'&&route==='/oversight/login') {
          limitAttempts();
          const {role,password}=await readJson(req);
          const account=oversightRoles.includes(role)&&db.prepare('SELECT salt,hash FROM accounts WHERE role=?').get(role);
          if (!account||typeof password!=='string'||password.length>128||!timingSafeEqual(account.hash,scryptSync(password,account.salt,64))) {
            throw new PilotError(401,'Хараат бус нэвтрэх эрх тохирохгүй.');
          }
          const value=randomBytes(32).toString('hex');
          transaction(()=>{
            db.prepare('DELETE FROM sessions WHERE expires<=? OR token=?').run(Date.now(),digest(sessionToken??''));
            db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(digest(value),role,Date.now()+sessionMs);
          });
          json(res,200,transaction(()=>oversight.view(role),false),{'Set-Cookie':cookie(name,value,sessionMs/1000)});
          return true;
        }
        const session=sessionToken&&/^[a-f0-9]{64}$/.test(sessionToken)&&
          db.prepare('SELECT role FROM sessions WHERE token=? AND expires>?').get(digest(sessionToken),Date.now());
        if (!session||!oversightRoles.includes(session.role)) throw new PilotError(401,'Хараат бус нэвтрэх эрх шаардлагатай.');
        const id=url.searchParams.get('engagement'), {role}=session;
        if (req.method==='GET'&&route==='/oversight') json(res,200,transaction(()=>oversight.view(role,id),false));
        else if (req.method==='POST'&&route==='/oversight/action') {
          const fields=await readJson(req);
          json(res,200,transaction(()=>oversight.action(role,id,fields)));
        } else if (req.method==='GET'&&/^\/oversight\/download\/(report|[a-f0-9-]{36})$/.test(route)) {
          const file=transaction(()=>oversight.download(role,id,route.split('/').at(-1)),role==='custodian');
          res.writeHead(200,{'Content-Type':'application/octet-stream','Content-Disposition':
            "attachment; filename*=UTF-8''"+encodeURIComponent(file.name).replace(/['()*]/g,c=>'%'+c.charCodeAt(0).toString(16))});
          res.end(file.bytes);
        } else if (req.method==='POST'&&route==='/oversight/logout') {
          db.prepare('DELETE FROM sessions WHERE token=?').run(digest(sessionToken));
          json(res,200,{}, {'Set-Cookie':cookie(name,'',0)});
        } else throw new PilotError(404,'Хяналтын хуудас олдсонгүй.');
        return true;
      }
      const confirmation = /^\/confirmation\/([a-f0-9]{64})$/.exec(route);
      if (confirmation && ['GET','POST'].includes(req.method)) {
        res.setHeader('Cache-Control','no-store');
        if (req.method==='GET') json(res,200,transaction(()=>confirmations.read(confirmation[1]),false));
        else {
          if (req.headers.origin!=='http://'+host) throw new PilotError(403,'Хүсэлтийн эх хаяг тохирохгүй.');
          const data=await readJson(req);
          json(res,201,transaction(()=>confirmations.receive(confirmation[1],data)));
        }
        return true;
      }
      const name = 'audit_pilot_' + port;
      const token = (req.headers.cookie ?? '').split(';').map(x => x.trim()).find(x => x.startsWith(name + '='))?.slice(name.length + 1);
      const session = token && /^[0-9a-f]{64}$/.test(token) &&
        db.prepare('SELECT role FROM sessions WHERE token = ? AND expires > ?').get(digest(token), Date.now());
      if (req.method === 'GET' && route === '' && !session) {
        json(res, 200, { setup: !configured() });
        return true;
      }
      if (req.method === 'POST') {
        if (req.headers.origin !== 'http://' + host) throw new PilotError(403, 'Хүсэлтийн эх хаяг тохирохгүй.');
        if (route === '/setup') {
          if (configured()) throw new PilotError(409, 'Нэвтрэх эрхүүд бүртгэгдсэн.');
          limitAttempts();
          const data = await readJson(req);
          if (typeof data.code !== 'string' || !timingSafeEqual(Buffer.from(digest(data.code)), Buffer.from(digest(setupCode)))) {
            throw new PilotError(403, 'Эхлүүлэх код тохирохгүй.');
          }
          const configuredRoles=[...roles,...oversightRoles.filter(role=>data[role]!==undefined&&data[role]!=='')];
          const passwords = configuredRoles.map(role => data[role]);
          if (!passwords.every(p => typeof p === 'string' && p.length >= 12 && p.length <= 128) || new Set(passwords).size !== configuredRoles.length) {
            throw new PilotError(400, 'Дүр бүрт 12–128 тэмдэгттэй, өөр нууц үг оруулна уу.');
          }
          transaction(() => {
            if (configured()) throw new PilotError(409, 'Нэвтрэх эрхүүд бүртгэгдсэн.');
            for (const [i, role] of configuredRoles.entries()) {
              const salt = randomBytes(16).toString('hex');
              db.prepare('INSERT INTO accounts VALUES (?, ?, ?)').run(role, salt, scryptSync(passwords[i], salt, 64));
            }
          });
          json(res, 201, { setup: false });
          return true;
        }
        if (route === '/login') {
          limitAttempts();
          const { role, password } = await readJson(req);
          const account = roles.includes(role) && db.prepare('SELECT salt, hash FROM accounts WHERE role = ?').get(role);
          if (!account || typeof password !== 'string' || password.length > 128 ||
              !timingSafeEqual(account.hash, scryptSync(password, account.salt, 64))) throw new PilotError(401, 'Дүр эсвэл нууц үг тохирохгүй.');
          const value = randomBytes(32).toString('hex');
          transaction(() => {
            db.prepare('DELETE FROM sessions WHERE expires <= ? OR token = ?').run(Date.now(), session ? digest(token) : '');
            db.prepare('INSERT INTO sessions VALUES (?, ?, ?)').run(digest(value), role, Date.now() + sessionMs);
          });
          json(res, 200, transaction(() => view(role, resolveScope(role, url)), false), { 'Set-Cookie': cookie(name, value, sessionMs / 1000) });
          return true;
        }
      }
      if (!session||!roles.includes(session.role)) throw new PilotError(401, 'Нэвтэрч орно уу.');
      const { role } = session;
      if (req.method === 'GET' && route === '') {
        json(res, 200, transaction(() => view(role, resolveScope(role, url)), false));
      } else if (req.method === 'POST' && route === '/logout') {
        db.prepare('DELETE FROM sessions WHERE token = ?').run(digest(token));
        json(res, 200, { setup: false }, { 'Set-Cookie': cookie(name, '', 0) });
      } else if (req.method === 'POST' && route === '/action') {
        const data = await readJson(req);
        const result = transaction(() => {
          if (!db.prepare('SELECT 1 FROM sessions WHERE token = ? AND expires > ?').get(digest(token), Date.now())) {
            throw new PilotError(401, 'Нэвтрэх хугацаа дууссан.');
          }
          const id = resolveScope(role, url), context = store.load(role, id);
          const { model, revision } = context;
          const scope = id ?? 'firm';
          const key = data.idempotencyKey;
          let fingerprint;
          if (key !== undefined) {
            if (typeof key !== 'string' || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(key)) {
              throw new PilotError(400, 'Үйлдлийн түлхүүр буруу байна.');
            }
            const fields = Object.entries(data.fields ?? {}).sort(([a], [b]) => a.localeCompare(b));
            fingerprint = digest(JSON.stringify([data.action, fields]));
            const previous = db.prepare('SELECT fingerprint, scope, result_engagement FROM pilot_commands WHERE actor = ? AND key = ?').get(role, key);
            if (previous) {
              const originalScope = previous.scope ?? store.legacyId;
              if (previous.fingerprint !== fingerprint || (originalScope !== scope &&
                  !(data.action === 'create' && !url.searchParams.has('engagement') && previous.result_engagement === id))) {
                throw new PilotError(409, 'Үйлдлийн түлхүүр өөр өгөгдөлд ашиглагдсан.');
              }
              return view(role, previous.result_engagement ?? id);
            }
          }
          if (data.revision !== revision) throw new PilotError(409, 'Бүртгэл өөрчлөгдсөн. Шинэчлээд дахин шалгана уу.');
          if (firmCommand(data.action, data.fields) && id &&
              (isLibraryAction(data.action) || url.searchParams.has('engagement') || db.prepare('SELECT count(*) AS n FROM pilot_engagements').get().n > 1)) {
            throw new PilotError(409, 'Фирмийн бүртгэлийн хэсгээс өөрчилнө үү.');
          }
          if (isIntakeAction(data.action) && id) throw new PilotError(409, 'Үйлчлүүлэгч ба хүсэлтийн хэсгээс өөрчилнө үү.');
          const termsHold=activeTermsGap(model);
          const acceptanceRegister=data.action==='register'&&registers.some(row=>row.id===data.fields?.kind&&row.section==='acceptance');
          if (termsHold&&!termsRemediation.has(data.action)&&!acceptanceRegister) throw new PilotError(409,termsHold);
          let enquiry, confirmationLink, deliveryLink;
          try {
            if (data.action === 'access') changeMembership(context, role, data.fields);
            else if (isLibraryAction(data.action)) libraryAction(model.pilotFormLibrary, role, data.action, data.fields, filesFor(null));
            else if (isIntakeAction(data.action)) {
              if (data.action.startsWith('client-')) intake.updateClient(role, data.action, data.fields);
              else enquiry = intake.enquiryAction(model, role, data.action, data.fields);
            } else if (data.action === 'intake-refresh') {
              if (!id) throw new PilotError(409, 'Хүлээн авах шатны ажлыг сонгоно уу.');
              intake.refresh(model, role, data.fields);
            } else if (['intake-terms-save','intake-terms-approve'].includes(data.action)) {
              if (!id) throw new PilotError(409, 'Хүлээн авах шатны ажлыг сонгоно уу.');
              const gaps = model.engagements[0]?.intake.active ? [] : intake.activationGaps(model);
              if (gaps.length) throw new PilotError(409, gaps.join(' · '));
              termsAction(model, role, data.action, data.fields, filesFor(id));
            } else if (data.action === 'confirmation-start') {
              if (!id) throw new PilotError(409,'Гэрээт ажил сонгоно уу.');
              confirmationLink = confirmations.start(model,role,data.fields);
            } else if (data.action === 'delivery-start') {
              if (!id) throw new PilotError(409,'Гэрээт ажил сонгоно уу.');
              deliveryLink=releases.start(model,role,data.fields);
            } else if (data.action === 'activate') {
              if (role !== 'partner') throw new PilotError(403, 'Партнерын томилгоо шаардлагатай.');
              const files = filesFor(id), gaps = [...intake.activationGaps(model), ...termsGaps(model, files)];
              if (gaps.length) throw new PilotError(409, gaps.join(' · '));
              const terms = model.pilotTerms;
              const fields = terms ? { ...data.fields, letter: `1.4.3 v${terms.version} · ${terms.reference}` } : data.fields;
              pilotAction(model, role, data.action, fields, files);
            }
            else pilotAction(model, role, data.action, data.fields, filesFor(id));
          }
          catch (error) {
            if (error instanceof PilotError) throw error;
            if (error.constructor === Error) throw new PilotError(409, error.message);
            throw error;
          }
          const resultId = store.save(context, data.action, data.fields);
          intake.finish(model, role, data.action, enquiry);
          if (isIntakeAction(data.action) && !resultId) store.touchFirm();
          if (fingerprint) db.prepare(`INSERT INTO pilot_commands (actor, key, fingerprint, scope, result_engagement)
            VALUES (?, ?, ?, ?, ?)`).run(role, key, fingerprint, scope, resultId);
          return {...view(role,resultId),...(confirmationLink&&{confirmationLink}),...(deliveryLink&&{deliveryLink})};
        });
        json(res, 200, result);
      } else if (req.method === 'POST' && /^\/archive-export\/[a-f0-9-]{36}$/.test(route)) {
        const bundle = transaction(() => {
          const { model } = store.load(role, resolveScope(role, url));
          return archive.exportPackage(model, route.split('/').at(-1), role);
        });
        json(res, 200, bundle);
      } else if (req.method === 'GET' && /^\/template\/[A-Za-z0-9.-]{1,32}$/.test(route)) {
        const body = transaction(() => {
          const { model } = store.load(role, resolveScope(role, url));
          return libraryTemplate(model.pilotFormLibrary, route.split('/').at(-1), filesFor(null), url.searchParams.get('version') === 'source');
        }, false);
        json(res, 200, body);
      } else if (req.method === 'GET' && /^\/evidence\/[a-f0-9-]{36}$/.test(route)) {
        const file = transaction(() => {
          const { model, id } = store.load(role, resolveScope(role, url));
          if (archive.isSealed(model)) throw new PilotError(403, 'Түгжсэн файлыг зөвшөөрсөн архивын багцаас авна уу.');
          return db.prepare('SELECT name, bytes FROM evidence WHERE engagement_id = ? AND id = ?').get(id, route.split('/').at(-1));
        }, false);
        if (!file) throw new PilotError(404, 'Эх файл олдсонгүй.');
        res.writeHead(200, { 'Content-Type': 'application/octet-stream',
          'Content-Disposition': "attachment; filename*=UTF-8''" + encodeURIComponent(file.name).replace(/['()*]/g, c => '%' + c.charCodeAt(0).toString(16)),
          'Content-Length': file.bytes.length });
        res.end(file.bytes);
      } else if (req.method === 'GET' && route === '/report' && role === 'partner') {
        const artifact = transaction(() => {
          const { model, id } = store.load(role, resolveScope(role, url));
          return pilotReport(model, filesFor(id));
        }, false);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'X-Audit-Report-SHA256': artifact.sha256,
          'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
          'Content-Disposition': `attachment; filename="audit-report-${artifact.form}.html"` });
        res.end(artifact.html);
      } else if (req.method === 'GET' && route === '/authorizations' && role === 'partner') {
        const snapshots = transaction(() => {
          const { id } = store.load(role, resolveScope(role, url));
          return db.prepare('SELECT snapshot FROM authorizations WHERE engagement_id = ? ORDER BY id DESC').all(id)
            .map(row => JSON.parse(row.snapshot));
        }, false);
        json(res, 200, snapshots, { 'Content-Disposition': 'attachment; filename="pilot-authorizations.json"' });
      } else {
        throw new PilotError(404, 'Хуудас олдсонгүй.');
      }
    } catch (error) {
      if (!(error instanceof PilotError)) console.error('Pilot API:', error);
      if (!res.headersSent) json(res, error.status || 500, { error: error instanceof PilotError ? error.message : 'Хадгалалтын алдаа гарлаа.' });
    }
    return true;
  }
  return { handle, close: () => db.close(), setupCode: configured() ? null : setupCode };
}
