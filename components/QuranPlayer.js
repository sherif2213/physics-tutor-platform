'use client';
import { useState } from 'react';
import { BookOpen, X } from 'lucide-react';

const NAMES = ["الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الإنفطار","المطففين","الإنشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"];
const SURAHS = NAMES.map((name, i) => ({ n: i + 1, name }));

export default function QuranPlayer() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(1);

  const src = `https://server10.mp3quran.net/download/minsh/${String(current).padStart(3, '0')}.mp3`;

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 left-5 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-teal-500 text-navy-950 flex items-center justify-center shadow-glow"
        title="القرآن الكريم - صدقة جارية"
      >
        {open ? <X size={20} /> : <BookOpen size={20} />}
      </button>

      {open && (
        <div className="fixed bottom-20 left-5 z-50 w-72 glass-card p-4">
          <p className="text-slate-100 font-bold text-sm mb-1">القرآن الكريم</p>
          <p className="text-slate-500 text-xs mb-3">بصوت الشيخ محمد صديق المنشاوي — صدقة جارية</p>
          <select
            value={current}
            onChange={(e) => setCurrent(Number(e.target.value))}
            className="input-field mb-3 text-sm"
          >
            {SURAHS.map((s) => (
              <option key={s.n} value={s.n}>{s.n}. {s.name}</option>
            ))}
          </select>
          <audio key={src} controls autoPlay className="w-full" src={src} />
        </div>
      )}
    </>
  );
}
