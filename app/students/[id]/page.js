'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import { ArrowRight, Phone, Users as UsersIcon, Calendar } from 'lucide-react';
import { listStudents, listGroups, getAttendanceForStudent, getPaymentsForStudent, MONTHS } from '@/lib/dataStore';

export default function StudentProfilePage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [group, setGroup] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const students = await listStudents();
      const s = students.find((x) => x.id === id);
      setStudent(s);
      if (s?.group_id) {
        const groups = await listGroups();
        setGroup(groups.find((g) => g.id === s.group_id));
      }
      setAttendance(await getAttendanceForStudent(id));
      setPayments(await getPaymentsForStudent(id));
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <AppShell><p className="text-slate-500">جارٍ التحميل...</p></AppShell>;
  if (!student) return <AppShell><p className="text-slate-500">لم يتم العثور على الطالب</p></AppShell>;

  const totalLessons = attendance.length;
  const presentLessons = attendance.filter((a) => a.present).length;
  const attendanceRate = totalLessons ? Math.round((presentLessons / totalLessons) * 100) : 0;

  return (
    <AppShell>
      <Link href="/students" className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 text-sm mb-4">
        <ArrowRight size={16} /> رجوع للطلاب
      </Link>

      <div className="glass-card p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-100">{student.full_name}</h1>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><Phone size={14} /> {student.phone || '—'}</span>
              <span className="flex items-center gap-1.5"><UsersIcon size={14} /> {group?.name || 'بدون مجموعة'}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(student.created_at).toLocaleDateString('ar-EG')}</span>
            </div>
          </div>
          <div className="text-center bg-white/[0.04] rounded-2xl px-6 py-3">
            <p className="text-3xl font-extrabold text-teal-400">{attendanceRate}%</p>
            <p className="text-xs text-slate-500 mt-1">نسبة الحضور</p>
          </div>
        </div>
        {student.notes && (
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <p className="text-xs text-slate-500 mb-1">ملاحظات</p>
            <p className="text-slate-300 text-sm">{student.notes}</p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h2 className="font-bold text-slate-100 mb-4">سجل الحضور لكل شهر</h2>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {MONTHS.map((m) => {
              const monthLessons = attendance.filter((a) => a.month === m.key);
              const present = monthLessons.filter((a) => a.present).length;
              return (
                <div key={m.key} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{m.label}</span>
                  <span className="text-slate-500">{present} / 12 حصة</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="font-bold text-slate-100 mb-4">سجل المدفوعات</h2>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {MONTHS.map((m) => {
              const p = payments.find((pay) => pay.month === m.key);
              return (
                <div key={m.key} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{m.label}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p?.paid ? 'bg-teal-500/15 text-teal-400' : 'bg-red-500/15 text-red-400'}`}>
                    {p?.paid ? 'مدفوع' : 'غير مدفوع'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
