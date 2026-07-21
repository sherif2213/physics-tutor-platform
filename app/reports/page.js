'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { listStudents, getPaymentsForStudent, getAttendanceForStudent, MONTHS } from '@/lib/dataStore';

const currentMonthKey = () => {
  const idx = new Date().getMonth();
  const map = { 7: 'august', 8: 'september', 9: 'october', 10: 'november', 11: 'december', 0: 'january', 1: 'february', 2: 'march', 3: 'april', 4: 'may', 5: 'june' };
  return map[idx] || 'august';
};

export default function ReportsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const students = await listStudents();
      const month = currentMonthKey();
      const built = [];
      for (const s of students) {
        const attendance = await getAttendanceForStudent(s.id);
        const payments = await getPaymentsForStudent(s.id);
        const total = attendance.length;
        const present = attendance.filter((a) => a.present).length;
        const rate = total ? Math.round((present / total) * 100) : 0;
        const paidThisMonth = payments.find((p) => p.month === month)?.paid || false;
        built.push({ name: s.full_name, grade: s.grade, rate, paidThisMonth, price: s.monthly_price });
      }
      setRows(built);
      setLoading(false);
    })();
  }, []);

  const unpaid = rows.filter((r) => !r.paidThisMonth);
  const weakAttendance = rows.filter((r) => r.rate < 60);

  const exportPDF = async (title, data) => {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.text(title, 14, 15);
    doc.autoTable({
      startY: 22,
      head: [['الاسم', 'الصف', 'نسبة الحضور', 'حالة الدفع']],
      body: data.map((r) => [r.name, r.grade, `${r.rate}%`, r.paidThisMonth ? 'مدفوع' : 'غير مدفوع']),
    });
    doc.save(`${title}.pdf`);
  };

  const exportExcel = async (title, data) => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(data.map((r) => ({
      الاسم: r.name, الصف: r.grade, 'نسبة الحضور': `${r.rate}%`, 'حالة الدفع': r.paidThisMonth ? 'مدفوع' : 'غير مدفوع',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'تقرير');
    XLSX.writeFile(wb, `${title}.xlsx`);
  };

  const ReportCard = ({ title, data }) => (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-slate-100">{title}</h2>
          <p className="text-slate-500 text-xs mt-0.5">{data.length} طالب</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportPDF(title, data)} className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300" title="تصدير PDF">
            <FileDown size={16} />
          </button>
          <button onClick={() => exportExcel(title, data)} className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300" title="تصدير Excel">
            <FileSpreadsheet size={16} />
          </button>
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto space-y-2">
        {data.length === 0 && <p className="text-slate-500 text-sm">لا يوجد بيانات</p>}
        {data.map((r) => (
          <div key={r.name} className="flex items-center justify-between text-sm border-b border-white/[0.04] pb-2">
            <span className="text-slate-200">{r.name}</span>
            <span className="text-slate-500">{r.grade} · {r.rate}%</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-slate-100">التقارير</h1>
        <p className="text-slate-400 text-sm mt-1">تصدير تقارير الحضور والمدفوعات بصيغة PDF أو Excel</p>
      </header>

      {loading ? (
        <p className="text-slate-500">جارٍ التحميل...</p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          <ReportCard title="جميع الطلاب - الحضور والدفع" data={rows} />
          <ReportCard title="الطلاب الذين لم يدفعوا هذا الشهر" data={unpaid} />
          <ReportCard title="الطلاب ذوو الحضور الضعيف (أقل من 60%)" data={weakAttendance} />
        </div>
      )}
    </AppShell>
  );
}
