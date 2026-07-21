'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, CalendarCheck, Wallet, FolderKanban,
  FileBarChart, Settings, LogOut, Menu, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getSettings } from '@/lib/dataStore';
import ThemeToggle from './ThemeToggle';
import QuranPlayer from './QuranPlayer';
import AzkarPanel from './AzkarPanel';

const NAV = [
  { href: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/students', label: 'الطلاب', icon: Users },
  { href: '/attendance', label: 'الحضور', icon: CalendarCheck },
  { href: '/payments', label: 'المصروفات الشهرية', icon: Wallet },
  { href: '/groups', label: 'المجموعات', icon: FolderKanban },
  { href: '/reports', label: 'التقارير', icon: FileBarChart },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
];

function LogoMark({ width = 64, height = 32 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 96 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="96" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F5B942" />
          <stop offset="1" stopColor="#2DD4BF" />
        </linearGradient>
      </defs>
      <rect width="96" height="48" rx="12" fill="url(#logoGrad)" />
      <text x="48" y="30" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="22" letterSpacing="3" fill="#0B1220">ZSH</text>
      <line x1="20" y1="37" x2="76" y2="37" stroke="#0B1220" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      <circle cx="20" cy="37" r="2.2" fill="#0B1220" opacity="0.55" />
      <circle cx="76" cy="37" r="2.2" fill="#0B1220" opacity="0.55" />
    </svg>
  );
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [centerName, setCenterName] = useState('الشاهين للفيزياء');

  useEffect(() => {
    getSettings().then((s) => {
      if (s?.center_name) setCenterName(s.center_name);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-navy-950 grid-overlay flex transition-colors duration-300">
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 bg-navy-900/90 backdrop-blur-xl border-b border-white/[0.06] z-40 flex items-center justify-between px-4">
        <button onClick={() => setOpen(true)} className="text-slate-300"><Menu size={22} /></button>
        <div className="flex items-center gap-2">
          <LogoMark width={48} height={24} />
          <span className="font-display font-bold text-slate-100">{centerName}</span>
        </div>
        <ThemeToggle compact />
      </div>

      <aside className={`fixed lg:sticky top-0 h-screen w-64 bg-navy-900/95 backdrop-blur-xl border-l border-white/[0.06] z-50 transition-transform duration-300 flex flex-col
        ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <LogoMark />
            <span className="font-display font-bold text-slate-100">{centerName}</span>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-slate-400"><X size={20} /></button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active ? 'bg-amber-500/15 text-amber-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'}`}>
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.06] space-y-1">
          <ThemeToggle />
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/[0.08] w-full transition-all">
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {open && <div onClick={() => setOpen(false)} className="lg:hidden fixed inset-0 bg-black/60 z-40" />}

      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
 <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>

      <QuranPlayer />
      <AzkarPanel />
    </div>
  );
}
