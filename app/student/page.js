'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { GraduationCap, Users2, CalendarCheck, Wallet, LogOut, Sparkles, Bell, Video } from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [latestVideos, setLatestVideos] = useState([]);
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

      const { data: videos } = await supabase
        .from('videos')
        .select('id, title, created_at, target_grades')
        .order('created_at', { ascending: false })
        .limit(20);

      const relevant = (videos || []).filter(
        (v) => !v.target_grades || v.target_grades.length === 0 || v.target_grades.includes(studentRow.grade)
      ).slice(0, 3);
      setLatestVideos(relevant);

      setLoading(false);
    })();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading || !student) {
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
          <button onClick={handleLogout} className="p-2.5 rounded-xl bg-white/[0.06] text-slate-400 hover:text-red-400 transition-all shrink-0">
            <LogOut size={20} />
          </button>
        </header>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-5 flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <GraduationCap className="text-amber-400" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-slate-500 text-xs mb-0.5">الصف الدراسي</p>
              <p className="text-slate-100 font-bold text-sm leading-snug">{student.grade}</p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/15 flex items-center justify-center shrink-0">
              <Users2 className="text-teal-400" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-slate-500 text-xs mb-0.5">المجموعة</p>
              <p className="text-slate-100 font-bold text-sm leading-snug">{groupName || 'غير محدد بعد'}</p>
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

        <button onClick={() => router.push('/subscription')} className="glass-card p-6 mb-6 w-full flex items-center justify-between border-amber-400/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/15">
              <Wallet className="text-amber-400" size={20} />
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-xs">رصيدك الحالي</p>
              <p className="font-bold text-amber-300">{student.wallet_balance || 0} ج.م — اضغط للشحن</p>
            </div>
          </div>
        </button>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Video className="text-teal-400" size={18} />
              <span className="text-slate-300 font-medium text-sm">آخر الدروس المضافة</span>
            </div>
            {latestVideos.length === 0 ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Sparkles size={16} />
                <span>لا يوجد فيديوهات مضافة لصفك حاليًا</span>
              </div>
            ) : (
              <div className="space-y-2">
                {latestVideos.map((v) => (
                  <div key={v.id} className="flex items-center gap-2 bg-white/[0.03] rounded-lg p-2.5">
                    <Video size={15} className="text-teal-400 shrink-0" />
                    <p className="text-slate-300 text-sm truncate">{v.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="text-amber-400" size={18} />
              <span className="text-slate-300 font-medium text-sm">آخر الإعلانات</span>
            </div>
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
