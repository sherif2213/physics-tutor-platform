'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { Check } from 'lucide-react';
import { listStudents, getAttendanceForStudent, toggleAttendance, MONTHS } from '@/lib/dataStore';

export default function AttendancePage() {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [month, setMonth] = useState(MONTHS[0].key);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const list = await listStudents();
      setStudents(list);
      if (list.length) setSelectedId(list[0].id);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    getAttendanceForStudent(selectedId).then(setAttendance);
  }, [selectedId]);

  const handleToggle = async (lessonNumber) => {
    const existing = attendance.find((a) => a.month === month && a.lesson_number === lessonNumber);
    const updated = await toggleAttendance(selectedId, month, lessonNumber, existing?.present || false);
    setAttendance((prev) => {
      const filtered = prev.filter((a) => !(a.month === month && a.lesson_number === lessonNumber));
      return [...filtered, updated];
    });
  };

  const lessonsThisMonth = Array.from({ length: 12 }, (_, i) => i + 1).map((n) => ({
    n, present: attendance.find((a) => a.month === month && a.lesson_number === n)?.present || false,
  }));
  const presentCount = lessonsThisMonth.filter((l) => l.present).length;

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-slate-100">الحضور</h1>
        <p className="text-slate-400 text-sm mt-1">اضغط على أي حصة لتغيير حالتها إلى حاضر — يُحفظ تلقائيًا</p>
      </header>

      <div className="glass-card p-4 mb-4 flex flex-wrap gap-3">
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="input-field w-auto min-w-[220px]">
          {loading && <option>جارٍ التحميل...</option>}
          {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="input-field w-auto">
          {MONTHS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>
        <span className="mr-auto flex items-center text-sm text-slate-400">{presentCount} / 12 حصة حاضرة</span>
      </div>

      {selectedId && (
        <div className="glass-card p-6">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {lessonsThisMonth.map(({ n, present }) => (
              <button key={n} onClick={() => handleToggle(n)}
                className={`lesson-cell ${present ? 'lesson-present' : 'lesson-absent'}`}>
                {present ? <Check size={20} /> : n}
              </button>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
