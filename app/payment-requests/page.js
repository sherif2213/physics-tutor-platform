'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { supabase } from '@/lib/supabaseClient';
import { CheckCircle2, XCircle, Clock, ExternalLink, Wallet } from 'lucide-react';

export default function PaymentRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from('payment_requests')
      .select('*, students(id, full_name, phone, wallet_balance)')
      .order('created_at', { ascending: false });
    setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approve = async (req) => {
    const defaultAmount = req.amount || '';
    const amountStr = prompt('اكتب قيمة المبلغ اللي هيتضاف لرصيد الطالب (بالجنيه):', defaultAmount);
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (!amount || amount <= 0) { alert('قيمة غير صحيحة'); return; }

    const currentBalance = Number(req.students?.wallet_balance || 0);

    await supabase.from('students').update({
      wallet_balance: currentBalance + amount,
    }).eq('id', req.student_id);

    await supabase.from('payment_requests').update({
      status: 'approved', amount, reviewed_at: new Date().toISOString(),
    }).eq('id', req.id);

    load();
  };

  const reject = async (req) => {
    if (!confirm('متأكد إنك عايز ترفض الطلب ده؟')) return;
    await supabase.from('payment_requests').update({
      status: 'rejected', reviewed_at: new Date().toISOString(),
    }).eq('id', req.id);
    load();
  };

  const pending = requests.filter((r) => r.status === 'pending');
  const reviewed = requests.filter((r) => r.status !== 'pending');

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-slate-100">طلبات الدفع</h1>
        <p className="text-slate-400 text-sm mt-1">راجع إثباتات الدفع وأضف المبلغ لرصيد الطالب</p>
      </header>

      {loading ? (
        <p className="text-slate-500">جارٍ التحميل...</p>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-slate-300 font-bold mb-3 flex items-center gap-2"><Clock size={16} className="text-amber-400" /> قيد المراجعة ({pending.length})</h2>
            <div className="space-y-3">
              {pending.length === 0 && <p className="text-slate-500 text-sm">لا يوجد طلبات جديدة</p>}
              {pending.map((r) => (
                <div key={r.id} className="glass-card p-4 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[140px]">
                    <p className="font-bold text-slate-100">{r.students?.full_name}</p>
                    <p className="text-slate-500 text-xs">
                      حوّل من: {r.sender_phone} {r.amount ? `· ${r.amount} ج.م` : ''}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                      <Wallet size={12} /> رصيده الحالي: {Number(r.students?.wallet_balance || 0)} ج.م
                    </p>
                    {r.notes && <p className="text-slate-500 text-xs mt-1">{r.notes}</p>}
                  </div>
                  {r.screenshot_url && (
                    <a href={r.screenshot_url} target="_blank" rel="noreferrer" className="btn-secondary text-xs flex items-center gap-1">
                      <ExternalLink size={14} /> عرض الإيصال
                    </a>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => approve(r)} className="p-2.5 rounded-xl bg-teal-500/15 text-teal-300 hover:bg-teal-500/25"><CheckCircle2 size={18} /></button>
                    <button onClick={() => reject(r)} className="p-2.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25"><XCircle size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {reviewed.length > 0 && (
            <div>
              <h2 className="text-slate-300 font-bold mb-3">تمت مراجعتها</h2>
              <div className="space-y-2">
                {reviewed.map((r) => (
                  <div key={r.id} className="glass-card p-3 flex items-center justify-between text-sm">
                    <span className="text-slate-300">{r.students?.full_name}</span>
                    {r.status === 'approved'
                      ? <span className="text-teal-300 text-xs font-bold">تم إضافة {r.amount} ج.م</span>
                      : <span className="text-red-400 text-xs font-bold">مرفوض</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
