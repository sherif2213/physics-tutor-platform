'use client';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ compact = false }) {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains('light'));
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle('light', next);
    try { localStorage.setItem('theme', next ? 'light' : 'dark'); } catch (e) {}
  };

  if (compact) {
    return (
      <button onClick={toggle} className="text-slate-300 hover:text-amber-400 transition-colors" title="تبديل الوضع">
        {light ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-amber-400 hover:bg-white/[0.04] w-full transition-all"
    >
      {light ? <Moon size={18} /> : <Sun size={18} />}
      {light ? 'الوضع الداكن' : 'الوضع الفاتح'}
    </button>
  );
}
