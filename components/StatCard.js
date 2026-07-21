const COLORS = {
  amber: 'text-amber-400 bg-amber-400/10',
  teal: 'text-teal-400 bg-teal-400/10',
  red: 'text-red-400 bg-red-400/10',
};

export default function StatCard({ icon: Icon, label, value, color = 'amber', hint }) {
  return (
    <div className="glass-card p-4 sm:p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${COLORS[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-extrabold text-slate-100">{value}</p>
      <p className="text-slate-400 text-xs mt-1">{label}</p>
      {hint && <p className="text-slate-600 text-[10px] mt-0.5">{hint}</p>}
    </div>
  );
}
