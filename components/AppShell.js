'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Users, CalendarCheck, Wallet, FolderKanban,
  FileBarChart, Settings, LogOut, Menu, X, Atom,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const NAV = [
  { href: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/students', label: 'الطلاب', icon: Users },
  { href: '/attendance', label: 'الحضور', icon: CalendarCheck },
  { href: '/payments', label: 'المصروفات الشهرية', icon: Wallet },
  { href: '/groups', label: 'المجموعات', icon: FolderKanban },
  { href: '/reports', label: 'التقارير', icon: FileBarChart },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex">
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 bg-navy-900/90 backdrop-blur-xl border-b border-amber-400/10 z-40 flex items-center justify-between px-4">
        <button onClick={() => setOpen(true)} className="text-slate-300"><Menu size={22} /></button>
        <span className="font-display font-bold text-slate-100">منصة ZSH</span>
        <div className="w-6" />
      </div>

      <aside className={`fixed lg:sticky top-0 h-screen w-64 bg-navy-900/95 backdrop-blur-xl border-l border-amber-400/10 z-50 transition-transform duration-300 flex flex-col
        ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between p-5 border-b border-amber-400/10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-teal-500 flex items-center justify-center">
              <Atom className="text-navy-950" size={18} />
            </div>
            <span className="font-display font-bold text-slate-100">مركز الفيزياء</span>
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

        <div className="p-3 border-t border-amber-400/10">
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
    </div>
  );
}
