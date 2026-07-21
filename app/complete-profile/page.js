'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { GraduationCap, User, Phone } from 'lucide-react';

export default function CompleteProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [grade, setGrade] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/login');
      return;
    }

    const { error: upsertError } = await supabase.from('students').upsert(
      {
        user_id: user.id,
        full_name: fullName.trim(),
        grade,
        phone: phone.trim(),
        profile_completed: true,
        is_online: true,
        monthly_price: 0,
      },
      { onConflict: 'user_id' }
    );

    setLoading(false);

    if (upsertError) {
      console.error('Complete profile error:', upsertError);
      setError(`خطأ: ${upsertError.message}`);
      return;
    }

    router.push('/student');
    router.refresh();
  };

  return (
    <main className="min-h-screen grid-overlay bg-navy-950 flex items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="font-display text-2xl font-extrabold text-slate-100">خطوة أخيرة</h1>
          <p className="text-slate-400 text-sm mt-1">اكتب بياناتك عشان نجهزلك حسابك</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">الاسم بالكامل</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field pr-10" placeholder="اسمك بالكامل" />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">الصف الدراسي</label>
            <div className="relative">
              <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <select required value={grade} onChange={(e) => setGrade(e.target.value)} className="input-field pr-10">
                <option value="">اختر الصف</option>
                <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">رقم التليفون</label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field pr-10" placeholder="01xxxxxxxxx" />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'جارٍ الحفظ...' : 'حفظ ومتابعة'}
          </button>
        </form>
      </div>
    </main>
  );
}
