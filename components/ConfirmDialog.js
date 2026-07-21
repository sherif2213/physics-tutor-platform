'use client';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'حذف', danger = true }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="glass-card p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className="w-11 h-11 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center mb-4">
          <AlertTriangle size={22} />
        </div>
        <h3 className="font-bold text-slate-100 text-lg mb-2">{title}</h3>
        <p className="text-slate-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">إلغاء</button>
          <button onClick={onConfirm} className={`flex-1 rounded-xl px-5 py-2.5 font-bold transition-all ${danger ? 'bg-red-500 hover:bg-red-600 text-white' : 'btn-primary'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
