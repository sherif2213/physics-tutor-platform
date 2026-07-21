'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { Plus, FolderKanban } from 'lucide-react';
import { listGroups, upsertGroup, listStudents } from '@/lib/dataStore';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setGroups(await listGroups());
    setStudents(await listStudents());
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await upsertGroup({ name: name.trim() });
    setName('');
    setSaving(false);
    load();
  };

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-slate-100">المجموعات</h1>
        <p className="text-slate-400 text-sm mt-1">أنشئ عددًا غير محدود من المجموعات</p>
      </header>

      <form onSubmit={handleAdd} className="glass-card p-4 mb-6 flex gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم المجموعة، مثال: أولى ثانوي - المجموعة أ" className="input-field flex-1" />
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 shrink-0">
          <Plus size={18} /> إضافة
        </button>
      </form>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((g) => {
          const count = students.filter((s) => s.group_id === g.id).length;
          return (
            <div key={g.id} className="glass-card p-5">
              <div className="w-10 h-10 rounded-xl bg-teal-400/10 text-teal-400 flex items-center justify-center mb-3">
                <FolderKanban size={20} />
              </div>
              <p className="font-bold text-slate-100">{g.name}</p>
              <p className="text-slate-500 text-sm mt-1">{count} طالب</p>
            </div>
          );
        })}
        {groups.length === 0 && <p className="text-slate-500 col-span-full text-center py-8">لا توجد مجموعات بعد</p>}
      </div>
    </AppShell>
  );
}
