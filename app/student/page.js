'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { GraduationCap, Users2, CalendarCheck, Wallet, LogOut, Sparkles, Bell, Video } from 'lucide-react';

const currentMonthKey = () => {
  const idx = new Date().getMonth();
  const map = { 7: 'august', 8: 'september', 9: 'october', 10: 'november', 11: 'december', 0: 'january', 1: 'february', 2: 'march', 3: 'april', 4: 'may', 5: 'june' };
  return map[idx] || 'august';
};

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [subscriptionPaid, setSubscriptionPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data: studentRow } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!studentRow) {
        router.replace('/complete-profile');
        return;
      }
      setStudent(studentRow);

      if (studentRow.group_id) {
        const { data: group } = await supabase.from('groups').select('name').eq('id', studentRow.group_id).maybeSingle();
        if (group) setGroupName(group.name);
      }

      const { data: attendance } = await supabase.from('attendance').select('present').eq('student_id', studentRow.id);
      if (attendance && attendance.length) {
        const present = attendance.filter((a) => a.present).length;
        setAttendanceRate(Math.round((present / attendance.length) * 100));
      }

      const month = currentMonthKey();
      const { data: payment } = await supabase
        .from('payments').select('paid').eq('student_id', studentRow.id).eq('month', month).maybeSingle();
      setSubscriptionPaid(payment?.paid || false);

      setLoading(false);
    })();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-navy-950 grid-overlay flex items-center justify-center">
        <p className="text-slate-400">جارٍ التحميل...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-navy-950 bg-joy-gradient grid-overlay">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        <header className="flex items-center justify-between mb-8">
          <div>
            <p className="text-slate-400 text-sm">مرحبًا،</p>
            <h1 className="font-display text-2xl font-extrabold text-slate-100">{student.full_name}</h1>
          </div>
          <button onClick={handleLogout} className="p-2.5 rounded-xl bg-white/[0.06] text-slate-400 hover:text-red-400 transition-all">
            <LogOut size={20} />
          </button>
        </header>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <GraduationCap className="text-amber-400" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-slate-500 text-xs">الصف الدراسي</p>
              <p className="text-slate-100 font-bold truncate">{student.grade}</p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/15 flex items-center justify-center shrink-0">
              <Users2 className="text-teal-400" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-slate-500 text-xs">المجموعة</p>
              <p className="text-slate-100 font-bold truncate">{groupName || 'غير محدد بعد'}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="text-amber-400" size={18} />
              <span className="text-slate-300 font-medium text-sm">نسبة الحضور</span>
            </div>
            <span className="text-2xl font-extrabold text-amber-400">{attendanceRate}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full bg-gradient-to-l from-amber-500 to-amber-400 rounded-full transition-all" style={{ width: `${attendanceRate}%` }} />
          </div>
        </div>

        <div className={`glass-card p-6 mb-6 flex items-center justify-between ${subscriptionPaid ? '' : 'border-red-400/20'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${subscriptionPaid ? 'bg-teal-500/15' : 'bg-red-500/15'}`}>
              <Wallet className={subscriptionPaid ? 'text-teal-400' : 'text-red-400'} size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-xs">حالة الاشتراك</p>
              <p className={`font-bold ${subscriptionPaid ? 'text-teal-300' : 'text-red-400'}`}>
                {subscriptionPaid ? 'مفعّل لهذا الشهر' : 'غير مفعّل — برجاء التواصل مع السنتر'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Video className="text-teal-400" size={18} />
              <span className="text-slate-300 font-medium text-sm">آخر الدروس المضافة</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Sparkles size={16} />
              <span>قريبًا — مكتبة الفيديوهات جارٍ تجهيزها</span>
            </div>
          </div>
          <button onClick={() => router.push('/subscription')} className={`glass-card p-6 mb-6 w-full flex items-center justify-between ${student.subscription_active ? '' : 'border-red-400/20'}`}>
                      <div className="flex items-center gap-3">
                                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${student.subscription_active ? 'bg-teal-500/15' : 'bg-red-500/15'}`}>
                                                <Wallet className={student.subscription_active ? 'text-teal-400' : 'text-red-400'} size={20} />
                                                            </div>
                                                                        <div className="text-right">
                                                                                      <p className="text-slate-500 text-xs">حالة الاشتراك</p>
                                                                                                    <p className={`font-bold ${student.subscription_active ? 'text-teal-300' : 'text-red-400'}`}>
                                                                                                                    {student.subscription_active ? 'مفعّل' : 'اضغط هنا للاشتراك'}
                                                                                                                                  </p>
                                                                                                                                              </div>
                                                                                                                                                        </div>
                                                                                                                                                                </button>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Sparkles size={16} />
              <span>لا يوجد إعلانات جديدة حاليًا</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
