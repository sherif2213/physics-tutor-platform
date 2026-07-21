'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { getSettings, updateSettings } from '@/lib/dataStore';
import { Check } from 'lucide-react';

export default function SettingsPage() {
  const [form, setForm] = useState({ center_name: '', phone: '', address: '' });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => { setForm(s); setLoading(false); });
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    await updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-slate-100">الإعدادات</h1>
        <p className="text-slate-400 text-sm mt-1">بيانات السنتر الأساسية</p>
      </header>

      {!loading && (
        <form onSubmit={handleSave} className="glass-card p-6 max-w-lg space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">اسم السنتر</label>
            <input value={form.center_name || ''} onChange={set('center_name')} className="input-field" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">رقم الهاتف</label>
            <input value={form.phone || ''} onChange={set('phone')} className="input-field" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">العنوان</label>
            <input value={form.address || ''} onChange={set('address')} className="input-field" />
          </div>
          <button type="submit" className="btn-primary flex items-center gap-2">
            {saved ? <><Check size={18} /> تم الحفظ</> : 'حفظ التغييرات'}
          </button>
        </form>
      )}
    </AppShell>
  );
}
