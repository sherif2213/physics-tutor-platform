'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <main className="min-h-screen grid-overlay bg-navy-950 flex items-center justify-center px-4 relative overflow-hidden">
      <svg className="absolute -top-24 -left-24 w-[520px] h-[520px] opacity-30 pointer-events-none" viewBox="0 0 400 400">
        <polygon points="200,60 320,300 80,300" fill="none" stroke="#F0A500" strokeWidth="1.5" />
        <line x1="0" y1="180" x2="150" y2="200" stroke="#F5B942" strokeWidth="2" opacity="0.7" />
        <line x1="250" y1="230" x2="420" y2="120" stroke="#2DD4BF" strokeWidth="2" opacity="0.6" />
        <line x1="250" y1="230" x2="440" y2="200" stroke="#F0A500" strokeWidth="2" opacity="0.5" />
        <line x1="250" y1="230" x2="410" y2="290" stroke="#EF4444" strokeWidth="2" opacity="0.4" />
      </svg>

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.svg" alt="ZSH" className="w-24 h-24 mb-4 drop-shadow-[0_0_20px_rgba(14,165,233,0.4)]" />
          <h1 className="font-display text-2xl font-extrabold text-slate-100">منصة ZSH</h1>
          <p className="text-slate-400 text-sm mt-1">تسجيل دخول المُدرّس</p>
        </div>

        <form onSubmit={handleLogin} className="glass-card p-6 space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field pr-10" placeholder="teacher@example.com"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10" placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'جارٍ الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
        <p className="text-center text-slate-500 text-xs mt-6">تعمل هذه المنصة بدون إنترنت بعد أول تسجيل دخول</p>
      </div>
    </main>
  );
}
