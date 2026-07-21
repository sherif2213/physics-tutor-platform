'use client';
import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import { Search, Plus, Trash2, Edit3 } from 'lucide-react';
import { listStudents, listGroups, upsertStudent, softDeleteStudent } from '@/lib/dataStore';
import StudentFormModal from '@/components/StudentFormModal';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [query, setQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setStudents(await listStudents());
    setGroups(await listGroups());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const grades = useMemo(() => [...new Set(students.map((s) => s.grade).filter(Boolean))], [students]);

  const filtered = useMemo(() => students.filter((s) => {
    const matchesQuery = !query || [s.full_name, s.phone, s.parent_phone, s.grade].some((f) => f?.toLowerCase().includes(query.toLowerCase()));
    const matchesGrade = !gradeFilter || s.grade === gradeFilter;
    const matchesGroup = !groupFilter || s.group_id === groupFilter;
    return matchesQuery && matchesGrade && matchesGroup;
  }), [students, query, gradeFilter, groupFilter]);

  const handleSave = async (data) => {
    await upsertStudent({ ...editing, ...data });
    setModalOpen(false);
    setEditing(null);
    load();
  };

  const handleDelete = async () => {
    await softDeleteStudent(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  return (
    <AppShell>
      <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-100">الطلاب</h1>
          <p className="text-slate-400 text-sm mt-1">{students.length} طالب مسجل</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> إضافة طالب
        </button>
      </header>

      <div className="glass-card p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث بالاسم أو الهاتف أو الصف أو المجموعة"
            className="input-field pr-10" />
        </div>
        <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="input-field w-auto">
          <option value="">كل الصفوف</option>
          {grades.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className="input-field w-auto">
          <option value="">كل المجموعات</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-slate-400 text-right border-b border-white/[0.06]">
              <th className="p-4 font-medium">الاسم</th>
              <th className="p-4 font-medium">الهاتف</th>
              <th className="p-4 font-medium">الصف</th>
              <th className="p-4 font-medium">المجموعة</th>
              <th className="p-4 font-medium">الاشتراك</th>
              <th className="p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-8 text-center text-slate-500">جارٍ التحميل...</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">لا يوجد طلاب مطابقون</td></tr>}
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="p-4">
                  <Link href={`/students/${s.id}`} className="text-slate-100 font-medium hover:text-amber-400">{s.full_name}</Link>
                </td>
                <td className="p-4 text-slate-400">{s.phone || '—'}</td>
                <td className="p-4 text-slate-400">{s.grade}</td>
                <td className="p-4 text-slate-400">{groups.find((g) => g.id === s.group_id)?.name || '—'}</td>
                <td className="p-4 text-slate-400">{s.monthly_price} ج.م</td>
                <td className="p-4">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => { setEditing(s); setModalOpen(true); }} className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-amber-400">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => setDeleteTarget(s)} className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <StudentFormModal
          student={editing}
          groups={groups}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="حذف الطالب"
          message={`هل أنت متأكد من حذف "${deleteTarget.full_name}"؟ سيتم الاحتفاظ بسجلات الحضور والمدفوعات.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </AppShell>
  );
}
