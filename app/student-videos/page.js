'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ArrowRight, Package, Lock, Unlock, Video as VideoIcon, Wallet, X, CheckCircle2, Play } from 'lucide-react';

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  if (url.includes('vimeo.com')) {
    const id = url.split('/').pop();
    return `https://player.vimeo.com/video/${id}?autoplay=1`;
  }
  return url;
}

export default function StudentVideosPage() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [units, setUnits] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [videosByChapter, setVideosByChapter] = useState({});
  const [purchasedUnits, setPurchasedUnits] = useState(new Set());
  const [purchasedChapters, setPurchasedChapters] = useState(new Set());
  const [progressMap, setProgressMap] = useState({});
  const [openChapter, setOpenChapter] = useState(null);
  const [confirmBuy, setConfirmBuy] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [buying, setBuying] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/login'); return; }
    const { data: studentRow } = await supabase.from('students').select('*').eq('user_id', user.id).maybeSingle();
    if (!studentRow) { router.replace('/complete-profile'); return; }
    setStudent(studentRow);

    const track = studentRow.grade === 'الصف الثالث الثانوي' ? 'ثالثة ثانوي' : 'تانية ثانوي';

    const { data: unitRows } = await supabase.from('units').select('*').eq('grade_track', track).order('position');
    setUnits(unitRows || []);

    const { data: chapterRows } = await supabase.from('chapters').select('*').eq('grade_track', track).order('position');
    setChapters(chapterRows || []);

    const { data: videoRows } = await supabase.from('videos').select('*').order('position');
    const grouped = {};
    (videoRows || []).forEach((v) => {
      if (!v.target_grades || v.target_grades.length === 0 || v.target_grades.includes(studentRow.grade)) {
        grouped[v.chapter_id] = grouped[v.chapter_id] || [];
        grouped[v.chapter_id].push(v);
      }
    });
    setVideosByChapter(grouped);

    const { data: purchases } = await supabase.from('purchases').select('*').eq('student_id', studentRow.id);
    setPurchasedUnits(new Set((purchases || []).filter((p) => p.unit_id).map((p) => p.unit_id)));
    setPurchasedChapters(new Set((purchases || []).filter((p) => p.chapter_id).map((p) => p.chapter_id)));

    const { data: progress } = await supabase.from('video_progress').select('*').eq('student_id', studentRow.id);
    const pMap = {};
    (progress || []).forEach((p) => { pMap[p.video_id] = p; });
    setProgressMap(pMap);

    setLoading(false);
  };

  useEffect(() => { load(); }, [router]);

  const isChapterUnlocked = (ch) => {
    if (ch.unit_id && purchasedUnits.has(ch.unit_id)) return true;
    if (purchasedChapters.has(ch.id)) return true;
    return false;
  };

  const handleBuy = async () => {
    if (!confirmBuy || !student) return;
    const price = Number(confirmBuy.price || 0);
    if (Number(student.wallet_balance || 0) < price) {
      alert('رصيدك مش كفاية. اشحن رصيدك الأول من صفحة الاشتراك.');
      return;
    }
    setBuying(true);
    const { error: balError } = await supabase.from('students').update({
      wallet_balance: Number(student.wallet_balance) - price,
    }).eq('id', student.id);
    if (balError) { alert(`خطأ: ${balError.message}`); setBuying(false); return; }

    const payload = { student_id: student.id, amount_paid: price };
    if (confirmBuy.type === 'unit') payload.unit_id = confirmBuy.id;
    else payload.chapter_id = confirmBuy.id;

    const { error: purError } = await supabase.from('purchases').insert(payload);
    if (purError) { alert(`خطأ: ${purError.message}`); setBuying(false); return; }

    setBuying(false);
    setConfirmBuy(null);
    load();
  };

  const markWatched = async (videoId) => {
    if (!student) return;
    const { error } = await supabase.from('video_progress').upsert({
      student_id: student.id, video_id: videoId, completed: true, last_watched_at: new Date().toISOString(),
    }, { onConflict: 'student_id,video_id' });
    if (error) { alert(`خطأ: ${error.message}`); return; }
    setProgressMap((prev) => ({ ...prev, [videoId]: { completed: true } }));
  };

  if (loading || !student) {
    return (
      <main className="min-h-screen bg-navy-950 grid-overlay flex items-center justify-center">
        <p className="text-slate-400">جارٍ التحميل...</p>
      </main>
    );
  }

  const looseChapters = chapters.filter((c) => !c.unit_id);

  return (
    <main className="min-h-screen bg-navy-950 bg-joy-gradient grid-overlay">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push('/student')} className="flex items-center gap-1 text-slate-400 text-sm">
            <ArrowRight size={16} /> رجوع
          </button>
          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-sm">
            <Wallet size={15} /> {student.wallet_balance || 0} ج.م
          </div>
        </div>

        <h1 className="font-display text-2xl font-extrabold text-slate-100 mb-6">الفيديوهات</h1>

        <div className="space-y-5">
          {units.map((unit) => {
            const unitChapters = chapters.filter((c) => c.unit_id === unit.id);
            const unlocked = purchasedUnits.has(unit.id);
            return (
              <div key={unit.id} className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.03] p-4">
                <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Package className="text-amber-400" size={18} />
                    <span className="font-extrabold text-slate-100">{unit.title}</span>
                  </div>
                  {unlocked ? (
                    <span className="flex items-center gap-1 text-teal-300 text-xs font-bold"><Unlock size={13} /> متاح بالكامل</span>
                  ) : (
                    <button onClick={() => setConfirmBuy({ type: 'unit', id: unit.id, title: unit.title, price: unit.price })}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-navy-950 text-xs font-bold">
                      اشترِ الباب كامل — {unit.price} ج.م
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {unitChapters.map((ch) => (
                    <ChapterRow key={ch.id} ch={ch}
                      unlocked={unlocked || isChapterUnlocked(ch)}
                      videos={videosByChapter[ch.id] || []}
                      progressMap={progressMap}
                      open={openChapter === ch.id}
                      onToggle={() => setOpenChapter(openChapter === ch.id ? null : ch.id)}
                      onBuy={() => setConfirmBuy({ type: 'chapter', id: ch.id, title: ch.title, price: ch.price })}
                      onPlay={(v) => setPlayingVideo(v)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {looseChapters.map((ch) => (
            <ChapterRow key={ch.id} ch={ch}
              unlocked={isChapterUnlocked(ch)}
              videos={videosByChapter[ch.id] || []}
              progressMap={progressMap}
              open={openChapter === ch.id}
              onToggle={() => setOpenChapter(openChapter === ch.id ? null : ch.id)}
              onBuy={() => setConfirmBuy({ type: 'chapter', id: ch.id, title: ch.title, price: ch.price })}
              onPlay={(v) => setPlayingVideo(v)}
            />
          ))}
        </div>
      </div>

      {confirmBuy && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-100">تأكيد الشراء</h2>
              <button onClick={() => setConfirmBuy(null)} className="text-slate-400"><X size={20} /></button>
            </div>
            <p className="text-slate-300 text-sm">هتشتري "{confirmBuy.title}" بسعر {confirmBuy.price} ج.م</p>
            <p className="text-slate-500 text-xs">رصيدك الحالي: {student.wallet_balance || 0} ج.م</p>
            <button onClick={handleBuy} disabled={buying} className="btn-primary w-full">
              {buying ? 'جارٍ الشراء...' : 'تأكيد الشراء'}
            </button>
          </div>
        </div>
      )}

      {playingVideo && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-slate-100 font-bold">{playingVideo.title}</h2>
              <button onClick={() => setPlayingVideo(null)} className="text-slate-400"><X size={24} /></button>
            </div>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
              <iframe
                src={getYouTubeEmbedUrl(playingVideo.video_url)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {playingVideo.description && (
              <p className="text-slate-400 text-sm mt-3">{playingVideo.description}</p>
            )}
            <button
              onClick={() => markWatched(playingVideo.id)}
              className={`w-full mt-3 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                ${progressMap[playingVideo.id]?.completed ? 'bg-teal-500/15 text-teal-300' : 'btn-primary'}`}
            >
              <CheckCircle2 size={18} />
              {progressMap[playingVideo.id]?.completed ? 'تمت المشاهدة ✓' : 'تسجيل كمشاهد'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function ChapterRow({ ch, unlocked, videos, progressMap, open, onToggle, onBuy, onPlay }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4">
        <button onClick={unlocked ? onToggle : undefined} className="flex items-center gap-3 w-full mb-2">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${unlocked ? 'bg-teal-500/15' : 'bg-white/[0.05]'}`}>
            {unlocked ? <Unlock className="text-teal-400" size={15} /> : <Lock className="text-slate-500" size={15} />}
          </div>
          <span className="font-bold text-slate-100 text-sm text-right flex-1">{ch.title}</span>
          <span className="text-slate-500 text-xs">{videos.length} فيديو</span>
        </button>
        {!unlocked && (
          <button onClick={onBuy} className="w-full mt-2 py-2 rounded-xl bg-amber-500/15 text-amber-300 text-xs font-bold">
            اشترِ الفصل — {ch.price} ج.م
          </button>
        )}
      </div>
      {unlocked && open && (
        <div className="border-t border-white/[0.06] p-4 space-y-2">
          {videos.length === 0 && <p className="text-slate-500 text-sm">لا يوجد فيديوهات بعد</p>}
          {videos.map((v) => {
            const completed = progressMap[v.id]?.completed;
            return (
              <button key={v.id} onClick={() => onPlay(v)}
                className="w-full flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl p-3 transition-all">
                <div className="w-8 h-8 rounded-full bg-teal-500/15 flex items-center justify-center shrink-0">
                  <Play size={13} className="text-teal-400" />
                </div>
                <p className="text-slate-200 text-sm flex-1 truncate text-right">{v.title}</p>
                {completed && <CheckCircle2 size={16} className="text-teal-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
