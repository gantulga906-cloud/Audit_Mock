import { approvedRows, registerRows } from './pilot-registers.mjs';
import { PilotError } from './pilot-workflow.mjs';

export const seats = ['preparer','reviewer','partner'];
export const managedStaffing = m => !!m.pilotStaffingEnabled;
const fail = message => { throw new PilotError(409, message); };
const current = (m, kind, id) => approvedRows(m, kind).find(r => r.id === id);
const inWindow = (start, end, first, last) => (!first || start >= first) && (!last || end <= last);
const overlaps = (a,b,c,d) => a <= d && c <= b;
const dates = row => [row.values.assignmentDate, row.values.assignmentEnd || row.values.assignmentDate];
const strict = (m, v) => managedStaffing(m) || !!v.assignmentEnd || !!v.appointment || v.capacity === 'specialist';
const appointmentCapacity = v => v.capacity || v.role.toLowerCase();

function knownCredential(v, start, end) {
  const expiry = v.validity || (v.validTo ? 'dated' : 'unknown');
  return !!v.validFrom && start >= v.validFrom && (expiry === 'no-expiry' || expiry === 'dated' && !!v.validTo && end <= v.validTo);
}

function committedRows(models, person, start, end, excluding) {
  return models.flatMap(m => approvedRows(m,'M04-F06').filter(r => {
    const [from,to] = dates(r);
    return r.id !== excluding && r.values.result === 'suitable' && r.values.person === person && overlaps(from,to,start,end);
  }).map(r => ({ row: r, engagement: m.engagements[0] })));
}

export function checkStaffing(m, row, files) {
  const v = row.values;
  if (v.result !== 'suitable') return;
  const person = current(m,'M01-F03',v.person), credential = current(m,'M01-F04',v.credential);
  const [start,end] = dates(row);
  const specialist = v.capacity === 'specialist', full = strict(m,v);
  const p = person?.values;
  if (!p || p.status !== (specialist ? 'external' : 'active') || start > end || Number(v.hours) <= 0 ||
      !inWindow(start,end,p.availableFrom,p.availableTo) || credential?.values.person !== person.id ||
      !knownCredential(credential.values,start,end)) {
    fail('Идэвхтэй мэргэжилтэн, хүчинтэй үнэмлэх, боломжит хугацаа ба цаг шаардлагатай.');
  }
  if (approvedRows(m,'M04-F06').some(r => r.id !== row.id && r.values.result === 'suitable' &&
      (r.values.person === v.person || !specialist && r.values.capacity === v.capacity))) {
    fail('Гэрээт ажлын үүрэг бүр тусдаа мэргэжилтэнтэй байна.');
  }
  if (!full) return;

  const appointment = current(m,'M01-F06',v.appointment);
  if (!v.assignmentEnd || !appointment || appointment.values.person !== person.id || appointmentCapacity(appointment.values) !== v.capacity ||
      !inWindow(start,end,appointment.values.from,appointment.values.to) ||
      (specialist ? appointment.values.employment !== 'external' : p.account !== v.capacity || appointment.values.employment === 'external')) {
    fail('Үүрэгт тохирох нэвтрэх дүр, хүчинтэй фирмийн томилгоо болон дуусах өдөр шаардлагатай.');
  }
  if (!p.availableFrom || !p.availableTo || !p.capacityHours || Number(p.capacityHours) <= 0) {
    fail('Фирмийн бүртгэлд боломжит хугацаа ба нийт цагийг батална уу.');
  }
  if (specialist) {
    const declaration = current(m,'M04-F04',v.declaration);
    if (!declaration || declaration.values.assignee !== 'external' || declaration.values.person !== person.id ||
        !v.deliverable || !v.supervisor || !files.member(v.supervisor)) {
      fail('Мэргэжилтний мэдүүлэг, хүлээх үр дүн болон томилсон хариуцагч аудитор шаардлагатай.');
    }
  }
  const reserved = committedRows(files.staffingModels(m), person.id, p.availableFrom, p.availableTo, row.id)
    .reduce((sum, a) => sum + Number(a.row.values.hours), 0);
  if (reserved + Number(v.hours) > Number(p.capacityHours) + 1e-8) {
    fail('Баталсан боломжит нийт цагт энэ томилгоо багтахгүй байна.');
  }
  row.staffingBasis = {
    person: person.id, name: p.name, rosterVersion: person.version, account: p.account || undefined,
    credential: { id: credential.id, version: credential.version, title: credential.values.qualification, source: credential.values.source,
      validTo: credential.values.validTo || '' },
    appointment: { id: appointment.id, version: appointment.version, title: appointment.values.role },
  };
}

export function approvedStaffing(m) {
  const live = new Set(approvedRows(m,'M04-F06').map(r => r.id));
  return registerRows(m).filter(r => r.kind === 'M04-F06' && r.status === 'approved' && r.staffingBasis).map(r => {
    const [start,end] = dates(r);
    return { ...r.staffingBasis, id: r.id, version: r.version, capacity: r.values.capacity,
      start,end,hours:Number(r.values.hours),approvedBy:r.by,approvedAt:r.at,current:live.has(r.id),
      ...(r.values.deliverable && { deliverable:r.values.deliverable, supervisor:r.values.supervisor }) };
  });
}

export function seatFor(m, role, start, end = start) {
  return approvedStaffing(m).find(s => s.current && s.capacity === role && (!start || inWindow(start,end,s.start,s.end)));
}

export function staffingGaps(m) {
  if (!managedStaffing(m)) return [];
  return seats.filter(role => !seatFor(m,role)).map(role => 'M04-F06 · Одоогийн баталсан томилгоо · '+role);
}

export function requireSeat(m, files, role, start, end) {
  if (!seats.includes(role) || !files.member(role)) fail('Энэ гэрээт ажлын нэвтрэх эрх шаардлагатай.');
  if (!managedStaffing(m)) return undefined;
  const seat = seatFor(m,role,start,end);
  if (!seat) fail('M04-F06 · Тухайн хугацаанд хүчинтэй, баталсан томилгоо шаардлагатай · '+role);
  return seat;
}

export function rosterView(m, files, role, visible) {
  if (role === 'preparer') return [];
  const models = files.staffingModels(m);
  const credentialRows = registerRows(m).filter(r => r.kind === 'M01-F04' && r.status === 'approved');
  const live = new Set(approvedRows(m,'M01-F04').map(r => r.id));
  return registerRows(m).filter(r => r.kind === 'M01-F03' && r.status === 'approved').map(r => {
    const p = r.values;
    const bookings = p.availableFrom && p.availableTo ? committedRows(models,r.id,p.availableFrom,p.availableTo) : [];
    const scoped = bookings.filter(b=>visible.has(b.engagement.id));
    return {
      id:r.id,name:p.name,version:r.version,status:p.status,account:p.account || undefined,
      start:p.availableFrom,end:p.availableTo,capacity:p.capacityHours ? Number(p.capacityHours) : null,
      committed:scoped.reduce((sum,b)=>sum+Number(b.row.values.hours),0),
      assignments:scoped.map(({row,engagement})=>{
        const [start,end]=dates(row);
        return {engagement:engagement.id,client:engagement.client,start,end,hours:Number(row.values.hours),capacity:row.values.capacity};
      }),
      credentials:credentialRows.filter(c=>c.values.person===r.id).map(c=>({
        id:c.id,title:c.values.qualification,source:c.values.source,issuer:c.values.issuer || '',
        from:c.values.validFrom,to:c.values.validTo || '',validity:c.values.validity || (c.values.validTo?'dated':'unknown'),current:live.has(c.id),
      })),
    };
  });
}
