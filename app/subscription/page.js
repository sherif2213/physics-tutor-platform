'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Wallet, Upload, Phone, MessageSquare, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';

export default function SubscriptionPage() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [requests, setRequests] = useState([]);
  const [amount, setAmount] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/login'); return; }
    const { data: studentRow } = await supabase.from('students').select('*').eq('user_id', user.id).maybeSingle();
    if (!studentRow) { router.replace('/complete-profile'); return; }
    setStudent(studentRow);
    const { data: reqs } = await supabase.from('payment_requests').select('*').eq('student_id', studentRow.id).order('created_at', { ascending: false });
    setRequests(reqs || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) { setError('لازم ترفع صورة إيصال الدفع'); return; }
    setSubmitting(true);

    const ext = file.name.split('.').pop();
    const path = `${student.id}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('payments').upload(path, file);
    if (uploadError) {
      setError(`فشل رفع الصورة: ${uploadError.message}`);
      setSubmitting(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('payments').getPublicUrl(path);

    const { error: insertError } = await supabase.from('payment_requests').insert({
      student_id: student.id,
      amount: amount ? Number(amount) : null,
      sender_phone: senderPhone.trim(),
      screenshot_url: urlData.publicUrl,
      notes: notes.trim(),
    });

    setSubmitting(false);
    if (insertError) {
      setError(`خطأ: ${insertError.message}`);
      return;
    }
    setSuccess(true);
    setAmount(''); setSenderPhone(''); setNotes(''); setFile(null);
    load();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-navy-950 grid-overlay flex items-center justify-center">
        <p className="text-slate-400">جارٍ التحميل...</p>
      </main>
    );
  }

  const statusBadge = (status) => {
    if (status === 'approved') return <span className="flex items-center gap-1 text-teal-300 text-xs font-bold"><CheckCircle2 size={14} /> تم القبول</span>;
    if (status === 'rejected') return <span className="flex items-center gap-1 text-red-400 text-xs font-bold"><XCircle size={14} /> تم الرفض</span>;
    return <span className="flex items-center gap-1 text-amber-300 text-xs font-bold"><Clock size={14} /> قيد المراجعة</span>;
  };

  return (
    <main className="min-h-screen bg-navy-950 bg-joy-gradient grid-overlay">
      <div className="max-w-lg mx-auto px-4 py-6 sm:py-10">
        <button onClick={() => router.push('/student')} className="flex items-center gap-1 text-slate-400 text-sm mb-6">
          <ArrowRight size={16} /> رجوع للرئيسية
        </button>

        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${student.subscription_active ? 'bg-teal-500/15' : 'bg-red-500/15'}`}>
              <Wallet className={student.subscription_active ? 'text-teal-400' : 'text-red-400'} size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-xs">حالة الاشتراك</p>
              <p className={`font-bold ${student.subscription_active ? 'text-teal-300' : 'text-red-400'}`}>
                {student.subscription_active ? 'مفعّل' : 'غير مفعّل'}
              </p>
            </div>
          </div>
          {student.subscription_active && student.subscription_expires_at && (
            <p className="text-slate-500 text-xs mt-2">
              ينتهي في: {new Date(student.subscription_expires_at).toLocaleDateString('ar-EG')}
            </p>
          )}
        </div>

        <div className="glass-card p-6 mb-6">
          <h2 className="font-bold text-slate-100 mb-3">طريقة الدفع</h2>
          <p className="text-slate-400 text-sm mb-3">حوّل قيمة الاشتراك على الرقم التالي عن طريق:</p>
          <div className="flex gap-2 mb-3">
            <span className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-300 text-xs font-bold">Vodafone Cash</span>
            <span className="px-3 py-1.5 rounded-lg bg-purple-500/15 text-purple-300 text-xs font-bold">WE Cash</span>
          </div>
          <div className="bg-white/[0.04] rounded-xl p-4 text-center">
            <p className="text-slate-500 text-xs mb-1">رقم التحويل</p>
            <p className="text-2xl font-extrabold text-amber-400 tracking-wider" dir="ltr">01505071278</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <h2 className="font-bold text-slate-100">إرسال إثبات الدفع</h2>
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">المبلغ المدفوع (اختياري)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field" placeholder="مثال: 150" />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">رقم الهاتف اللي حوّلت منه</label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} className="input-field pr-10" placeholder="01xxxxxxxxx" />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">صورة إيصال التحويل</label>
            <div className="relative">
              <Upload className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="input-field pr-10 file:hidden text-slate-400" />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">ملاحظات (اختياري)</label>
            <div className="relative">
              <MessageSquare className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field pr-10" rows={2} />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-teal-300 text-sm">تم إرسال طلبك، هيتم مراجعته وتفعيل اشتراكك قريبًا</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'جارٍ الإرسال...' : 'إرسال إثبات الدفع'}
          </button>
        </form>

        {requests.length > 0 && (
          <div className="glass-card p-6 mt-6">
            <h2 className="font-bold text-slate-100 mb-3">طلباتي السابقة</h2>
            <div className="space-y-2">
              {requests.map((r) => (
                <div key={r.id} className="flex items-center justify-between bg-white/[0.03] rounded-xl p-3 text-sm">
                  <span className="text-slate-400">{new Date(r.created_at).toLocaleDateString('ar-EG')}</span>
                  {statusBadge(r.status)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
