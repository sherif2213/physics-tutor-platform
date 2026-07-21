'use client';
import { useState } from 'react';
import { X } from 'lucide-react';

export default function StudentFormModal({ student, groups, onClose, onSave }) {
  const [form, setForm] = useState({
    full_name: student?.full_name || '',
    phone: student?.phone || '',
    parent_phone: student?.parent_phone || '',
    grade: student?.grade || '',
    group_id: student?.group_id || '',
    monthly_price: student?.monthly_price || '',
    notes: student?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, monthly_price: Number(form.monthly_price) || 0, group_id: form.group_id || null });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} className="glass-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-100 text-lg">{student ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200"><X size={20} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">اسم الطالب *</label>
            <input required value={form.full_name} onChange={set('full_name')} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">رقم الهاتف</label>
              <input value={form.phone} onChange={set('phone')} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">رقم ولي الأمر</label>
              <input value={form.parent_phone} onChange={set('parent_phone')} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">الصف الدراسي *</label>
              <input required value={form.grade} onChange={set('grade')} className="input-field" placeholder="مثال: أولى ثانوي" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">المجموعة</label>
              <select value={form.group_id} onChange={set('group_id')} className="input-field">
                <option value="">بدون مجموعة</option>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">سعر الاشتراك الشهري (ج.م) *</label>
            <input required type="number" min="0" value={form.monthly_price} onChange={set('monthly_price')} className="input-field" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">ملاحظات</label>
            <textarea value={form.notes} onChange={set('notes')} rows={3} className="input-field resize-none" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">إلغاء</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'جارٍ الحفظ...' : 'حفظ'}</button>
        </div>
      </form>
    </div>
  );
}
