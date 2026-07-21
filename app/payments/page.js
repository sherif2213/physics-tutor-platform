'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { listStudents, getPaymentsForStudent, togglePayment, MONTHS } from '@/lib/dataStore';

export default function PaymentsPage() {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [payments, setPayments] = useState([]);
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
    getPaymentsForStudent(selectedId).then(setPayments);
  }, [selectedId]);

  const student = students.find((s) => s.id === selectedId);

  const handleToggle = async (month) => {
    const existing = payments.find((p) => p.month === month);
    const updated = await togglePayment(selectedId, month, existing?.paid || false, student?.monthly_price);
    setPayments((prev) => {
      const filtered = prev.filter((p) => p.month !== month);
      return [...filtered, updated];
    });
  };

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-slate-100">المصروفات الشهرية</h1>
        <p className="text-slate-400 text-sm mt-1">اضغط على أي شهر لتغيير حالة الدفع — يُحفظ تلقائيًا</p>
      </header>

      <div className="glass-card p-4 mb-4">
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="input-field w-auto min-w-[220px]">
          {loading && <option>جارٍ التحميل...</option>}
          {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
        </select>
      </div>

      {selectedId && (
        <div className="glass-card p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {MONTHS.map((m) => {
            const paid = payments.find((p) => p.month === m.key)?.paid || false;
            return (
              <button key={m.key} onClick={() => handleToggle(m.key)}
                className={`rounded-2xl p-5 text-center border transition-all
                  ${paid ? 'bg-teal-500/15 border-teal-400/40' : 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.2]'}`}>
                <p className="font-bold text-slate-100 mb-2">{m.label}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${paid ? 'bg-teal-500/20 text-teal-300' : 'bg-red-500/15 text-red-400'}`}>
                  {paid ? 'مدفوع' : 'غير مدفوع'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
