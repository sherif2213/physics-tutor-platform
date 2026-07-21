'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Lock, Mail, Phone } from 'lucide-react';

export default function StudentSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setLoading(false);
      if (signUpError.message?.includes('already registered')) {
        setError('فيه حساب مسجل بالإيميل ده بالفعل، جرب تسجيل الدخول');
      } else {
        setError('حصل خطأ أثناء إنشاء الحساب، حاول تاني');
      }
      return;
    }

    if (!signUpData.session) {
      setLoading(false);
      setError('تم إنشاء الحساب. تحقق من إيميلك لتفعيله، وبعدين سجّل دخول.');
      return;
    }

    const { data: linkData, error: linkError } = await supabase.rpc('link_student_account', {
      p_phone: phone.trim(),
    });

    setLoading(false);

    if (linkError || !linkData?.success) {
      setStep('notfound');
      return;
    }

    router.push('/student');
    router.refresh();
  };

  if (step === 'notfound') {
    return (
      <main className="min-h-screen grid-overlay bg-navy-950 flex items-center justify-center px-4">
        <div className="relative z-10 w-full max-w-sm text-center glass-card p-6">
          <h1 className="font-display text-xl font-extrabold text-slate-100 mb-2">
            محدش لقيناه بالرقم ده
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            رقم التليفون اللي كتبته مش مطابق لأي طالب مسجل عند المُدرّس. تأكد إن الرقم هو نفسه اللي المُدرّس مسجله بيه.
          </p>
          <button onClick={() => setStep('form')} className="btn-primary w-full">
            رجوع
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid-overlay bg-navy-950 flex items-center justify-center px-4 relative overflow-hidden">
      <svg className="absolute -top-24 -left-24 w-[520px] h-[520px] opacity-30 pointer-events-none" viewBox="0 0 400 400">
        <polygon points="200,60 320,300 80,300" fill="none" stroke="#F0A500" strokeWidth="1.5" />
      </svg>

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.svg" alt="ZSH" className="w-24 h-24 mb-4 drop-shadow-[0_0_20px_rgba(14,165,233,0.4)]" />
          <h1 className="font-display text-2xl font-extrabold text-slate-100">منصة ZSH</h1>
          <p className="text-slate-400 text-sm mt-1">إنشاء حساب طالب</p>
        </div>

        <form onSubmit={handleSignup} className="glass-card p-6 space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">رقم تليفونك (نفس المسجل عند المُدرّس)</label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                className="input-field pr-10" placeholder="01xxxxxxxxx"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field pr-10" placeholder="student@example.com"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10" placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب'}
          </button>
        </form>
        <p className="text-center text-slate-500 text-xs mt-6">
          عندك حساب بالفعل؟ <a href="/login" className="text-brand-400 underline">سجّل دخول</a>
        </p>
      </div>
    </main>
  );
}
