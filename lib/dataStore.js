'use client';
import { supabase } from './supabaseClient';
import {
  cacheAll, cacheOne, getAllCached, getCachedByStudent, queueMutation,
} from './offlineDb';
import { runSync } from './syncEngine';

const isOnline = () => typeof navigator !== 'undefined' && navigator.onLine;

// ---------- Students ----------
export async function listStudents() {
  const cached = await getAllCached('students');
  if (isOnline()) {
    const { data, error } = await supabase.from('students').select('*, groups(name)').is('deleted_at', null).order('full_name');
    if (!error && data) {
      await cacheAll('students', data);
      return data;
    }
  }
  return cached.filter((s) => !s.deleted_at);
}

export async function upsertStudent(student) {
    const { groups, ...cleanStudent } = student;
      const row = { ...cleanStudent, id: student.id || crypto.randomUUID(), updated_at: new Date().toISOString() };
        await cacheOne('students', row);
          await queueMutation({ table: 'students', op: 'upsert', payload: { ...row, __conflictKey: 'id' } });
            await logActivity(student.id ? 'تعديل بيانات طالب' : 'إضافة طالب جديد', { name: row.full_name });
              if (isOnline()) runSync();
                return row;
                }


export async function softDeleteStudent(id) {
  const row = { id, deleted_at: new Date().toISOString() };
  await cacheOne('students', row);
  await queueMutation({ table: 'students', op: 'upsert', payload: { ...row, __conflictKey: 'id' } });
  await logActivity('حذف طالب', { id });
  if (isOnline()) runSync();
}

// ---------- Groups ----------
export async function listGroups() {
  const cached = await getAllCached('groups');
  if (isOnline()) {
    const { data, error } = await supabase.from('groups').select('*').order('name');
    if (!error && data) {
      await cacheAll('groups', data);
      return data;
    }
  }
  return cached;
}

export async function upsertGroup(group) {
  const row = { ...group, id: group.id || crypto.randomUUID() };
  await cacheOne('groups', row);
  await queueMutation({ table: 'groups', op: 'upsert', payload: { ...row, __conflictKey: 'id' } });
  if (isOnline()) runSync();
  return row;
}

// ---------- Attendance ----------
export const MONTHS = [
  { key: 'august', label: 'أغسطس' }, { key: 'september', label: 'سبتمبر' },
  { key: 'october', label: 'أكتوبر' }, { key: 'november', label: 'نوفمبر' },
  { key: 'december', label: 'ديسمبر' }, { key: 'january', label: 'يناير' },
  { key: 'february', label: 'فبراير' }, { key: 'march', label: 'مارس' },
  { key: 'april', label: 'أبريل' }, { key: 'may', label: 'مايو' },
  { key: 'june', label: 'يونيو' },
];

export async function getAttendanceForStudent(studentId) {
  const cached = await getCachedByStudent('attendance', studentId);
  if (isOnline()) {
    const { data, error } = await supabase.from('attendance').select('*').eq('student_id', studentId);
    if (!error && data) {
      await cacheAll('attendance', data);
      return data;
    }
  }
  return cached;
}

export async function toggleAttendance(studentId, month, lessonNumber, currentlyPresent) {
  // deterministic id so repeated toggles on the same slot always target one row
  const id = `${studentId}_${month}_${lessonNumber}`;
  const row = {
    id, student_id: studentId, month, lesson_number: lessonNumber,
    present: !currentlyPresent, marked_at: new Date().toISOString(),
  };
  await cacheOne('attendance', row);
  await queueMutation({ table: 'attendance', op: 'upsert', payload: { ...row, __conflictKey: 'student_id,month,lesson_number' } });
  if (isOnline()) runSync();
  return row;
}

// ---------- Payments ----------
export async function getPaymentsForStudent(studentId) {
  const cached = await getCachedByStudent('payments', studentId);
  if (isOnline()) {
    const { data, error } = await supabase.from('payments').select('*').eq('student_id', studentId);
    if (!error && data) {
      await cacheAll('payments', data);
      return data;
    }
  }
  return cached;
}

export async function togglePayment(studentId, month, currentlyPaid, amount) {
  const id = `${studentId}_${month}`;
  const row = {
    id, student_id: studentId, month, paid: !currentlyPaid,
    amount: amount || null, paid_at: !currentlyPaid ? new Date().toISOString() : null,
  };
  await cacheOne('payments', row);
  await queueMutation({ table: 'payments', op: 'upsert', payload: { ...row, __conflictKey: 'student_id,month' } });
  if (isOnline()) runSync();
  return row;
}

// ---------- Activity log ----------
export async function logActivity(action, details) {
  const row = { id: crypto.randomUUID(), action, details, created_at: new Date().toISOString() };
  if (isOnline()) {
    await supabase.from('activity_log').insert(row);
  } else {
    await queueMutation({ table: 'activity_log', op: 'upsert', payload: { ...row, __conflictKey: 'id' } });
  }
}

export async function listRecentActivity(limit = 8) {
  if (isOnine()) {
    const { data } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(limit);
    return data || [];
  }
  return [];
}

// ---------- Settings ----------
export async function getSettings() {
  if (isOnline()) {
    const { data } = await supabase.from('center_settings').select('*').eq('id', 1).maybeSingle();
    if (data) return data;
  }
  return { center_name: 'مركز الفيزياء', phone: '', address: '', logo_url: null };
}

export async function updateSettings(settings) {
  await queueMutation({ table: 'center_settings', op: 'upsert', payload: { ...settings, id: 1, __conflictKey: 'id' } });
  if (isOnline()) runSync();
}
