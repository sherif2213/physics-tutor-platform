'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import StatCard from '@/components/StatCard';
import { Users, UserCheck, UserX, Wallet, AlertTriangle, Activity } from 'lucide-react';
import { listStudents, listRecentActivity, getPaymentsForStudent, getAttendanceForStudent, MONTHS } from '@/lib/dataStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const currentMonthKey = () => {
  const idx = new Date().getMonth(); // 0=Jan
  const map = { 7: 'august', 8: 'september', 9: 'october', 10: 'november', 11: 'december', 0: 'january', 1: 'february', 2: 'march', 3: 'april', 4: 'may', 5: 'june' };
  return map[idx] || 'august';
};

export default function DashboardPage() {
  const [students, setStudents] = useState([]);
  const [activity, setActivity] = useState([]);
  const [lateCount, setLateCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const list = await listStudents();
      setStudents(list);
      setActivity(await listRecentActivity(6));

      const month = currentMonthKey();
      let late = 0, rev = 0;
      const data = [];
      for (const s of list) {
        const payments = await getPaymentsForStudent(s.id);
        const thisMonth = payments.find((p) => p.month === month);
        if (thisMonth?.paid) rev += Number(s.monthly_price || 0);
        else late += 1;
      }
      for (const m of MONTHS) {
        let count = 0;
        for (const s of list) {
          const payments = await getPaymentsForStudent(s.id);
          if (payments.find((p) => p.month === m.key)?.paid) count += Number(s.monthly_price || 0);
        }
        data.push({ name: m.label, revenue: count });
      }
      setLateCount(late);
      setRevenue(rev);
      setChartData(data);
      setLoading(false);
    })();
  }, []);

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-slate-100">الرئيسية</h1>
        <p className="text-slate-400 text-sm mt-1">نظرة عامة على مركز الفيزياء</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Users} label="إجمالي الطلاب" value={students.length} color="amber" />
        <StatCard icon={UserCheck} label="الحاضرون اليوم" value="—" color="teal" hint="متاح في صفحة الحضور" />
        <StatCard icon={UserX} label="الغائبون اليوم" value="—" color="red" hint="متاح في صفحة الحضور" />
        <StatCard icon={Wallet} label="إيرادات هذا الشهر" value={`${revenue.toLocaleString('ar-EG')} ج.م`} color="teal" />
        <StatCard icon={AlertTriangle} label="متأخرون في الدفع" value={lateCount} color="amber" />
        <StatCard icon={Activity} label="مجموعات نشطة" value={new Set(students.map((s) => s.group_id).filter(Boolean)).size} color="teal" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5">
          <h2 className="font-bold text-slate-100 mb-4">الإيرادات الشهرية</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ background: '#111A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, direction: 'rtl' }} />
                <Bar dataKey="revenue" fill="#F0A500" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="font-bold text-slate-100 mb-4">آخر النشاطات</h2>
          <ul className="space-y-3">
            {activity.length === 0 && <li className="text-slate-500 text-sm">لا يوجد نشاط بعد</li>}
            {activity.map((a) => (
              <li key={a.id} className="text-sm border-r-2 border-amber-400/50 pr-3">
                <p className="text-slate-200">{a.action}</p>
                <p className="text-slate-500 text-xs">{new Date(a.created_at).toLocaleString('ar-EG')}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
