'use client';
import { useState } from 'react';
import { Sunrise, Moon as MoonIcon, BookMarked, X } from 'lucide-react';

const CATEGORIES = {
  morning: {
    label: 'الصباح',
    icon: Sunrise,
    items: [
      { text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ، لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ (آية الكرسي)', count: 1 },
      { text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ فَتْحَهُ وَنَصْرَهُ وَنُورَهُ وَبَرَكَتَهُ وَهُدَاهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهِ وَشَرِّ مَا بَعْدَهُ', count: 1 },
      { text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ', count: 1 },
      { text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ (سيد الاستغفار)', count: 1 },
      { text: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا', count: 3 },
      { text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', count: 3 },
      { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', count: 100 },
    ],
  },
  evening: {
    label: 'المساء',
    icon: MoonIcon,
    items: [
      { text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ، لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ (آية الكرسي)', count: 1 },
      { text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ فَتْحَهَا وَنَصْرَهَا وَنُورَهَا وَبَرَكَتَهَا وَهُدَاهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهَا وَشَرِّ مَا بَعْدَهَا', count: 1 },
      { text: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ', count: 1 },
      { text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ (سيد الاستغفار)', count: 1 },
      { text: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا', count: 3 },
      { text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', count: 3 },
      { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', count: 100 },
    ],
  },
  study: {
    label: 'المذاكرة',
    icon: BookMarked,
    items: [
      { text: 'رَبِّ زِدْنِي عِلْمًا', count: 1 },
      { text: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي', count: 1 },
      { text: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا', count: 3 },
      { text: 'اللَّهُمَّ افْتَحْ عَلَيَّ فَهْمِي وَثَبِّتْنِي بِمَا عَلَّمْتَنِي وَعَلِّمْنِي مَا يَنْفَعُنِي', count: 3 },
      { text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ فَهْمَ النَّبِيِّينَ وَحِفْظَ الْمُرْسَلِينَ وَالْمُقَرَّبِينَ', count: 1 },
      { text: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', count: 7 },
    ],
  },
};

export default function AzkarPanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('morning');
  const [counts, setCounts] = useState({});

  const bump = (key) => setCounts((c) => ({ ...c, [key]: (c[key] || 0) + 1 }));
  const reset = () => setCounts({});

  const current = CATEGORIES[tab];

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 left-20 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-amber-400 text-navy-950 flex items-center justify-center shadow-glow"
        title="الأذكار"
      >
        {open ? <X size={20} /> : <Sunrise size={20} />}
      </button>

      {open && (
        <div className="fixed bottom-20 left-5 z-50 w-80 max-h-[70vh] glass-card p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            {Object.entries(CATEGORIES).map(([key, cat]) => {
              const Icon = cat.icon;
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all
                    ${tab === key ? 'bg-amber-500/15 text-amber-300' : 'text-slate-400 hover:bg-white/[0.04]'}`}
                >
                  <Icon size={14} /> {cat.label}
                </button>
              );
            })}
          </div>

          <div className="overflow-y-auto space-y-2 pr-1">
            {current.items.map((item, i) => {
              const key = `${tab}-${i}`;
              const done = counts[key] || 0;
              const complete = done >= item.count;
              return (
                <button
                  key={key}
                  onClick={() => bump(key)}
                  className={`w-full text-right p-3 rounded-xl text-sm leading-relaxed transition-all border
                    ${complete ? 'bg-teal-500/10 border-teal-400/30 text-teal-200' : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:border-amber-400/30'}`}
                >
                  <p>{item.text}</p>
                  <p className="text-xs mt-1.5 opacity-70">{done} / {item.count}</p>
                </button>
              );
            })}
          </div>

          <button onClick={reset} className="btn-secondary text-xs mt-3 py-2">
            إعادة تعيين العداد
          </button>
        </div>
      )}
    </>
  );
}
