import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { accounts, emptyWorkspace, PilotError, pilotAction, pilotReport, pilotView, syncReportForm } from './pilot-workflow.mjs';
import { createArchiveStore } from './pilot-archive.mjs';

const prefix = '/api/pilot';
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
  const configured = () => db.prepare('SELECT COUNT(*) AS total FROM accounts').get().total !== 0;
  const transaction = fn => {
    db.exec('BEGIN IMMEDIATE');
    try {
      const result = fn();
      db.exec('COMMIT');
      return result;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  };
  const files = {
    get: id => db.prepare('SELECT name, sha256 FROM evidence WHERE id = ?').get(id),
    add: (id, name, bytes) => db.prepare('INSERT INTO evidence VALUES (?, ?, ?, ?)').run(id, name, digest(bytes), bytes),
    authorize: (authorization, evidence) => db.prepare('INSERT INTO authorizations (snapshot) VALUES (?)').run(JSON.stringify({ authorization, evidence })),
    authorization: () => {
      const saved = db.prepare('SELECT snapshot FROM authorizations ORDER BY id DESC LIMIT 1').get();
      return saved && JSON.parse(saved.snapshot);
    },
    storeTemplate: (hash, contract) => db.prepare('INSERT OR IGNORE INTO pilot_templates VALUES (?, ?)').run(hash, JSON.stringify(contract)),
    template: hash => JSON.parse(db.prepare('SELECT body FROM pilot_templates WHERE digest = ?').get(hash)?.body ?? 'null'),
    checkArchiveRecord: archive.checkRecord,
    approveArchiveRecord: archive.approveRecord,
    archive,
  };
  const load = role => {
    const { body, revision } = db.prepare('SELECT body, revision FROM workspace WHERE id = 1').get();
    const model = JSON.parse(body);
    model.person = accounts[role];
    syncReportForm(model);
    return { model, revision };
  };
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
          const passwords = roles.map(role => data[role]);
          if (!passwords.every(p => typeof p === 'string' && p.length >= 12 && p.length <= 128) || new Set(passwords).size !== roles.length) {
            throw new PilotError(400, 'Дүр бүрт 12–128 тэмдэгттэй, өөр нууц үг оруулна уу.');
          }
          transaction(() => {
            if (configured()) throw new PilotError(409, 'Нэвтрэх эрхүүд бүртгэгдсэн.');
            for (const [i, role] of roles.entries()) {
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
          const { model, revision } = load(role);
          json(res, 200, pilotView(model, role, revision, files), { 'Set-Cookie': cookie(name, value, sessionMs / 1000) });
          return true;
        }
      }
      if (!session) throw new PilotError(401, 'Нэвтэрч орно уу.');
      const { role } = session;
      if (req.method === 'GET' && route === '') {
        const { model, revision } = load(role);
        json(res, 200, pilotView(model, role, revision, files));
      } else if (req.method === 'POST' && route === '/logout') {
        db.prepare('DELETE FROM sessions WHERE token = ?').run(digest(token));
        json(res, 200, { setup: false }, { 'Set-Cookie': cookie(name, '', 0) });
      } else if (req.method === 'POST' && route === '/action') {
        const data = await readJson(req);
        const result = transaction(() => {
          if (!db.prepare('SELECT 1 FROM sessions WHERE token = ? AND expires > ?').get(digest(token), Date.now())) {
            throw new PilotError(401, 'Нэвтрэх хугацаа дууссан.');
          }
          const { model, revision } = load(role);
          const key = data.idempotencyKey;
          let fingerprint;
          if (key !== undefined) {
            if (typeof key !== 'string' || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(key)) {
              throw new PilotError(400, 'Үйлдлийн түлхүүр буруу байна.');
            }
            const fields = Object.entries(data.fields ?? {}).sort(([a], [b]) => a.localeCompare(b));
            fingerprint = digest(JSON.stringify([data.action, fields]));
            const previous = db.prepare('SELECT fingerprint FROM pilot_commands WHERE actor = ? AND key = ?').get(role, key);
            if (previous) {
              if (previous.fingerprint !== fingerprint) throw new PilotError(409, 'Үйлдлийн түлхүүр өөр өгөгдөлд ашиглагдсан.');
              return pilotView(model, role, revision, files);
            }
          }
          if (data.revision !== revision) throw new PilotError(409, 'Бүртгэл өөрчлөгдсөн. Шинэчлээд дахин шалгана уу.');
          try { pilotAction(model, role, data.action, data.fields, files); }
          catch (error) {
            if (error instanceof PilotError) throw error;
            if (error.constructor === Error) throw new PilotError(409, error.message);
            throw error;
          }
          db.prepare('UPDATE workspace SET revision = ?, body = ? WHERE id = 1').run(revision + 1, JSON.stringify({ ...model, person: '' }));
          if (fingerprint) db.prepare('INSERT INTO pilot_commands VALUES (?, ?, ?)').run(role, key, fingerprint);
          return pilotView(model, role, revision + 1, files);
        });
        json(res, 200, result);
      } else if (req.method === 'POST' && /^\/archive-export\/[a-f0-9-]{36}$/.test(route)) {
        const bundle = transaction(() => archive.exportPackage(load(role).model, route.split('/').at(-1), role));
        json(res, 200, bundle);
      } else if (req.method === 'GET' && /^\/evidence\/[a-f0-9-]{36}$/.test(route)) {
        const { model } = load(role);
        if (archive.isSealed(model)) throw new PilotError(403, 'Түгжсэн файлыг зөвшөөрсөн архивын багцаас авна уу.');
        const file = db.prepare('SELECT name, bytes FROM evidence WHERE id = ?').get(route.split('/').at(-1));
        if (!file) throw new PilotError(404, 'Эх файл олдсонгүй.');
        res.writeHead(200, { 'Content-Type': 'application/octet-stream',
          'Content-Disposition': "attachment; filename*=UTF-8''" + encodeURIComponent(file.name).replace(/['()*]/g, c => '%' + c.charCodeAt(0).toString(16)),
          'Content-Length': file.bytes.length });
        res.end(file.bytes);
      } else if (req.method === 'GET' && route === '/report' && role === 'partner') {
        const { model } = load(role);
        const artifact = pilotReport(model, files);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'X-Audit-Report-SHA256': artifact.sha256,
          'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
          'Content-Disposition': `attachment; filename="audit-report-${artifact.form}.html"` });
        res.end(artifact.html);
      } else if (req.method === 'GET' && route === '/authorizations' && role === 'partner') {
        const snapshots = db.prepare('SELECT snapshot FROM authorizations ORDER BY id DESC').all().map(row => JSON.parse(row.snapshot));
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
