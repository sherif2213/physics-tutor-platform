'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { TEACHER_EMAIL } from '@/lib/auth';
import { Lock, Mail, Phone } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      return;
    }

    if (data.user?.email?.toLowerCase() === TEACHER_EMAIL.toLowerCase()) {
      router.push('/dashboard');
      router.refresh();
      return;
    }

    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', data.user.id)
      .maybeSingle();

    setLoading(false);

    if (student) {
      router.push('/student');
      router.refresh();
    } else {
      setError('حسابك غير مرتبط ببيانات طالب بعد. تواصل مع المُدرّس.');
      await supabase.auth.signOut();
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

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
      setNotFound(true);
      return;
    }

    router.push('/student');
    router.refresh();
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setNotFound(false);
  };

  if (notFound) {
    return (
      <main className="min-h-screen grid-overlay bg-navy-950 flex items-center justify-center px-4">
        <div className="relative z-10 w-full max-w-sm text-center glass-card p-6">
          <h1 className="font-display text-xl font-extrabold text-slate-100 mb-2">محدش لقيناه بالرقم ده</h1>
          <p className="text-slate-400 text-sm mb-6">رقم التليفون اللي كتبته مش مطابق لأي طالب مسجل عند المُدرّس.</p>
          <button onClick={() => switchMode('signup')} className="btn-primary w-full">رجوع</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid-overlay bg-navy-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.svg" alt="ZSH" className="w-24 h-24 mb-4 drop-shadow-[0_0_20px_rgba(240,165,0,0.35)]" />
          <h1 className="font-display text-2xl font-extrabold text-slate-100">منصة الشاهين للفيزياء</h1>
          <p className="text-slate-400 text-sm mt-1">
            {mode === 'login' ? 'تسجيل دخول المُدرّس / الطالب' : 'إنشاء حساب طالب'}
          </p>
        </div>

        <div className="flex glass-card p-1 mb-4 rounded-xl">
          <button type="button" onClick={() => switchMode('login')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition ${mode === 'login' ? 'bg-amber-500 text-navy-950' : 'text-slate-400'}`}>
            تسجيل الدخول
          </button>
          <button type="button" onClick={() => switchMode('signup')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition ${mode === 'signup' ? 'bg-amber-500 text-navy-950' : 'text-slate-400'}`}>
            إنشاء حساب طالب
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="glass-card p-6 space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pr-10" placeholder="teacher@example.com" />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-10" placeholder="••••••••" />
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'جارٍ الدخول...' : 'تسجيل الدخول'}</button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="glass-card p-6 space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">رقم تليفونك (نفس المسجل عند المُدرّس)</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field pr-10" placeholder="01xxxxxxxxx" />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pr-10" placeholder="student@example.com" />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-10" placeholder="••••••••" />
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب'}</button>
          </form>
        )}

        <p className="text-center text-slate-500 text-xs mt-6">تعمل هذه المنصة بدون إنترنت بعد أول تسجيل دخول</p>
      </div>
    </main>
  );
}
