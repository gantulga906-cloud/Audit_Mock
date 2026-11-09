import { accounts, emptyWorkspace, PilotError, syncReportForm } from './pilot-workflow.mjs';
import { registers } from '../src/lib/pilot-registers.ts';
import { emptyFormLibrary, isLibraryAction } from './pilot-forms.mjs';

const roles = Object.keys(accounts);
const firmKinds = new Set(registers.filter(r => r.section === 'firm').map(r => r.id));
const firmRecords = m => (m.pilotRecords ?? []).filter(row => firmKinds.has(row.kind));
const clientKey = registration => (registration ?? '').replace(/\s/g, '').toLowerCase();
const serialize = ({ pilotFormLibrary: _, ...m }) => JSON.stringify({
  ...m, person: '', pilotRecords: (m.pilotRecords ?? []).filter(row => !firmKinds.has(row.kind)),
});
const notFound = () => new PilotError(404, 'Гэрээт ажил олдсонгүй.');

export const firmCommand = (action, fields) => isLibraryAction(action) || action === 'register' && firmKinds.has(fields?.kind);

export function createPilotStore(db) {
  function transaction(fn, write = true) {
    db.exec(write ? 'BEGIN IMMEDIATE' : 'BEGIN');
    try {
      const result = fn();
      db.exec('COMMIT');
      return result;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  const legacy = db.prepare('SELECT body, revision FROM workspace WHERE id = 1').get();
  const legacyModel = JSON.parse(legacy.body);
  const legacyId = legacyModel.engagements[0]?.id;

  function insert(m, revision, members) {
    const e = m.engagements[0], period = m.bench.periods[e.id];
    const key = clientKey(m.bench.clients[e.id]?.registration);
    if (key && db.prepare(`SELECT 1 FROM pilot_engagements
      WHERE client_key = ? AND period_start <= ? AND period_end >= ?`).get(key, period.end, period.start)) {
      throw new PilotError(409, 'Гэрээт ажлыг бүртгэх боломжгүй. Оруулсан мэдээллийг партнертай шалгана уу.');
    }
    db.prepare(`INSERT INTO pilot_engagements
      (id, client, client_key, period_start, period_end, report_date, active, revision, body)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(e.id, e.client, key, period.start, period.end, e.reportDate, +e.intake.active, revision, serialize(m));
    const assign = db.prepare('INSERT INTO pilot_engagement_members (engagement_id, role) VALUES (?, ?)');
    for (const role of members) assign.run(e.id, role);
  }

  transaction(() => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS pilot_firm (
        id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL, records TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS pilot_engagements (
        id TEXT PRIMARY KEY, client TEXT NOT NULL, client_key TEXT NOT NULL,
        period_start TEXT NOT NULL, period_end TEXT NOT NULL, report_date TEXT NOT NULL,
        active INTEGER NOT NULL, revision INTEGER NOT NULL, body TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS pilot_engagement_members (
        engagement_id TEXT NOT NULL REFERENCES pilot_engagements(id),
        role TEXT NOT NULL REFERENCES accounts(role), PRIMARY KEY (engagement_id, role)
      );
      CREATE TABLE IF NOT EXISTS pilot_form_library (
        id INTEGER PRIMARY KEY CHECK(id=1), body TEXT NOT NULL
      );
    `);
    db.prepare('INSERT OR IGNORE INTO pilot_form_library VALUES (1, ?)').run(JSON.stringify(emptyFormLibrary()));
    if (db.prepare('SELECT 1 FROM pilot_firm WHERE id = 1').get()) return;
    db.prepare('INSERT INTO pilot_firm VALUES (1, ?, ?)').run(legacy.revision, JSON.stringify(firmRecords(legacyModel)));
    if (legacyId) insert(legacyModel, legacy.revision, roles.filter(role => db.prepare('SELECT 1 FROM accounts WHERE role = ?').get(role)));
    for (const table of ['evidence', 'authorizations', 'pilot_archives']) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN engagement_id TEXT REFERENCES pilot_engagements(id);
        CREATE INDEX ${table}_engagement ON ${table}(engagement_id);`);
      if (legacyId) db.prepare(`UPDATE ${table} SET engagement_id = ?`).run(legacyId);
    }
    db.exec('ALTER TABLE pilot_commands ADD COLUMN scope TEXT; ALTER TABLE pilot_commands ADD COLUMN result_engagement TEXT;');
  });

  function portfolio(role) {
    return db.prepare(`SELECT e.id, e.client, e.period_start AS start, e.period_end AS end,
      e.report_date AS reportDate, e.active
      FROM pilot_engagements e JOIN pilot_engagement_members m ON m.engagement_id = e.id
      WHERE m.role = ? ORDER BY e.report_date, e.client, e.id`).all(role).map(row => ({ ...row, active: !!row.active }));
  }

  function load(role, id) {
    const firm = db.prepare('SELECT revision, records FROM pilot_firm WHERE id = 1').get();
    const pilotFormLibrary = JSON.parse(db.prepare('SELECT body FROM pilot_form_library WHERE id = 1').get().body);
    if (!id) return { id: null, revision: firm.revision, model: {
      ...emptyWorkspace(), person: accounts[role], pilotRecords: JSON.parse(firm.records), pilotFormLibrary,
    } };
    const engagement = db.prepare(`SELECT e.body, e.revision FROM pilot_engagements e
      JOIN pilot_engagement_members m ON m.engagement_id = e.id WHERE e.id = ? AND m.role = ?`).get(id, role);
    if (!engagement) throw notFound();
    const model = JSON.parse(engagement.body);
    model.person = accounts[role];
    model.pilotFormLibrary = pilotFormLibrary;
    model.pilotRecords = [...JSON.parse(firm.records), ...(model.pilotRecords ?? [])];
    syncReportForm(model);
    return { id, model, revision: engagement.revision };
  }

  function save(context, action, fields) {
    const { id, model, revision } = context;
    if (firmCommand(action, fields)) {
      db.prepare('UPDATE pilot_firm SET revision = revision + 1, records = ? WHERE id = 1').run(JSON.stringify(firmRecords(model)));
    }
    if (isLibraryAction(action)) db.prepare('UPDATE pilot_form_library SET body = ? WHERE id = 1').run(JSON.stringify(model.pilotFormLibrary));
    if (id) {
      const e = model.engagements[0];
      db.prepare(`UPDATE pilot_engagements SET revision = revision + 1, body = ?, active = ?, report_date = ?
        WHERE id = ?`).run(serialize(model), +e.intake.active, e.reportDate, id);
    } else if (action === 'create') {
      insert(model, 1, fields?.includePreparer === 'no' ? ['reviewer', 'partner'] : roles);
      db.prepare('UPDATE pilot_firm SET revision = revision + 1 WHERE id = 1').run();
      return model.engagement;
    }
    return id;
  }

  function members(id) {
    return db.prepare('SELECT role FROM pilot_engagement_members WHERE engagement_id = ? ORDER BY role').all(id).map(r => r.role);
  }

  function setMember(id, role, grant) {
    if (grant) return db.prepare('INSERT OR IGNORE INTO pilot_engagement_members VALUES (?, ?)').run(id, role).changes > 0;
    return db.prepare('DELETE FROM pilot_engagement_members WHERE engagement_id = ? AND role = ?').run(id, role).changes > 0;
  }

  return { transaction, portfolio, load, save, members, setMember, legacyId };
}
