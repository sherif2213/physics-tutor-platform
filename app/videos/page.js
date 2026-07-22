'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Trash2, Pencil, ChevronUp, ChevronDown, Video as VideoIcon, X, FolderPlus, Layers, Package } from 'lucide-react';

const GRADES = ['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'];
const TRACKS = ['ثالثة ثانوي', 'تانية ثانوي'];

export default function VideosPage() {
  const [track, setTrack] = useState('ثالثة ثانوي');
  const [units, setUnits] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [videosByChapter, setVideosByChapter] = useState({});
  const [openChapter, setOpenChapter] = useState(null);
  const [modal, setModal] = useState(null);
  const [sectionModal, setSectionModal] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    const { data: unitRows } = await supabase.from('units').select('*').order('position');
    setUnits(unitRows || []);
    const { data: chapterRows } = await supabase.from('chapters').select('*').order('position');
    setChapters(chapterRows || []);
    const { data: videoRows } = await supabase.from('videos').select('*').order('position');
    const grouped = {};
    (videoRows || []).forEach((v) => {
      grouped[v.chapter_id] = grouped[v.chapter_id] || [];
      grouped[v.chapter_id].push(v);
    });
    setVideosByChapter(grouped);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const trackChapters = chapters.filter((c) => c.grade_track === track);
  const trackUnits = units.filter((u) => u.grade_track === track);
  const looseChapters = trackChapters.filter((c) => !c.unit_id);

  const updateUnitPrice = async (id, price) => {
    await supabase.from('units').update({ price: Number(price) || 0 }).eq('id', id);
    loadAll();
  };

  const updateChapterPrice = async (id, price) => {
    await supabase.from('chapters').update({ price: Number(price) || 0 }).eq('id', id);
    loadAll();
  };

  const addSection = async () => {
    if (!newSectionTitle.trim()) return;
    await supabase.from('chapters').insert({
      title: newSectionTitle.trim(),
      grade_track: track,
      position: trackChapters.length,
    });
    setNewSectionTitle('');
    setSectionModal(false);
    loadAll();
  };

  const deleteSection = async (id) => {
    if (!confirm('هيتم حذف القسم وكل الفيديوهات اللي جواه. متأكد؟')) return;
    await supabase.from('chapters').delete().eq('id', id);
    loadAll();
  };

  const saveVideo = async (form) => {
    if (form.id) {
      await supabase.from('videos').update({
        title: form.title, description: form.description, video_url: form.video_url,
        thumbnail_url: form.thumbnail_url, target_grades: form.target_grades,
        is_downloadable: form.is_downloadable,
      }).eq('id', form.id);
    } else {
      const list = videosByChapter[form.chapter_id] || [];
      await supabase.from('videos').insert({
        chapter_id: form.chapter_id, title: form.title, description: form.description,
        video_url: form.video_url, thumbnail_url: form.thumbnail_url,
        target_grades: form.target_grades, is_downloadable: form.is_downloadable,
        position: list.length,
      });
    }
    setModal(null);
    loadAll();
  };

  const deleteVideo = async (id) => {
    if (!confirm('متأكد إنك عايز تحذف الفيديو ده؟')) return;
    await supabase.from('videos').delete().eq('id', id);
    loadAll();
  };

  const moveVideo = async (chapterId, index, direction) => {
    const list = [...(videosByChapter[chapterId] || [])];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= list.length) return;
    [list[index], list[newIndex]] = [list[newIndex], list[index]];
    await Promise.all(list.map((v, i) => supabase.from('videos').update({ position: i }).eq('id', v.id)));
    loadAll();
  };

  const ChapterBlock = ({ ch }) => {
    const vids = videosByChapter[ch.id] || [];
    const open = openChapter === ch.id;
    return (
      <div className="glass-card overflow-hidden">
        <div className="w-full flex items-center justify-between p-4 gap-2 flex-wrap">
          <button onClick={() => setOpenChapter(open ? null : ch.id)} className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-teal-500/20 flex items-center justify-center shrink-0">
              <Layers className="text-amber-400" size={15} />
            </div>
            <span className="font-bold text-slate-100 truncate text-sm">{ch.title}</span>
          </button>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1">
              <input
                type="number" defaultValue={ch.price}
                onBlur={(e) => updateChapterPrice(ch.id, e.target.value)}
                className="w-16 bg-white/[0.05] border border-white/[0.1] rounded-lg px-2 py-1 text-xs text-slate-200"
              />
              <span className="text-slate-500 text-xs">ج.م</span>
            </div>
            <span className="text-slate-500 text-xs">{vids.length} فيديو</span>
            <button onClick={() => deleteSection(ch.id)} className="p-1.5 text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
          </div>
        </div>
        {open && (
          <div className="border-t border-amber-400/10 p-4 space-y-2">
            {vids.map((v, i) => (
              <div key={v.id} className="flex items-center gap-2 bg-white/[0.03] rounded-xl p-3">
                <div className="flex flex-col">
                  <button onClick={() => moveVideo(ch.id, i, -1)} className="text-slate-500 hover:text-slate-300"><ChevronUp size={14} /></button>
                  <button onClick={() => moveVideo(ch.id, i, 1)} className="text-slate-500 hover:text-slate-300"><ChevronDown size={14} /></button>
                </div>
                <VideoIcon size={18} className="text-teal-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm font-medium truncate">{v.title}</p>
                  <p className="text-slate-500 text-xs truncate">{(v.target_grades || []).join('، ') || 'كل الصفوف'}</p>
                </div>
                <button onClick={() => setModal({ chapterId: ch.id, video: v })} className="p-2 text-slate-400 hover:text-amber-400"><Pencil size={16} /></button>
                <button onClick={() => deleteVideo(v.id)} className="p-2 text-slate-400 hover:text-red-400"><Trash2 size={16} /></button>
              </div>
            ))}
            <button onClick={() => setModal({ chapterId: ch.id, video: null })}
              className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
              <Plus size={16} /> إضافة فيديو
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-slate-100">الفيديوهات</h1>
        <p className="text-slate-400 text-sm mt-1">نظّم دروسك في أبواب وفصول، وحدد سعر كل باب وكل فصل</p>
      </header>

      <div className="flex gap-2 mb-6 glass-card p-1.5 w-fit">
        {TRACKS.map((t) => (
          <button key={t} onClick={() => setTrack(t)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2
              ${track === t ? 'bg-gradient-to-l from-amber-500 to-amber-400 text-navy-950 shadow-glow' : 'text-slate-400 hover:text-slate-200'}`}>
            <Layers size={15} />
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-500">جارٍ التحميل...</p>
      ) : (
        <div className="space-y-5">
          {trackUnits.map((unit) => {
            const unitChapters = trackChapters.filter((c) => c.unit_id === unit.id);
            return (
              <div key={unit.id} className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.03] p-4">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Package className="text-amber-400" size={18} />
                    <span className="font-extrabold text-slate-100">{unit.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">سعر الباب كامل:</span>
                    <input
                      type="number" defaultValue={unit.price}
                      onBlur={(e) => updateUnitPrice(unit.id, e.target.value)}
                      className="w-20 bg-white/[0.06] border border-amber-400/20 rounded-lg px-2 py-1 text-sm text-amber-300 font-bold"
                    />
                    <span className="text-slate-400 text-xs">ج.م</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {unitChapters.map((ch) => <ChapterBlock key={ch.id} ch={ch} />)}
                </div>
              </div>
            );
          })}

          {looseChapters.map((ch) => <ChapterBlock key={ch.id} ch={ch} />)}

          <button onClick={() => setSectionModal(true)}
            className="w-full glass-card p-5 flex items-center justify-center gap-2 text-amber-400 font-bold border-dashed border-2 border-amber-400/20 hover:border-amber-400/50">
            <FolderPlus size={20} />
            إضافة قسم جديد
          </button>
        </div>
      )}

      {sectionModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-100">قسم جديد في {track}</h2>
              <button onClick={() => setSectionModal(false)} className="text-slate-400"><X size={20} /></button>
            </div>
            <input autoFocus value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)}
              className="input-field" placeholder="مثال: مراجعة نهائية، امتحانات، ..." />
            <button onClick={addSection} className="btn-primary w-full">إضافة القسم</button>
          </div>
        </div>
      )}

      {modal && (
        <VideoModal
          chapterId={modal.chapterId}
          video={modal.video}
          onClose={() => setModal(null)}
          onSave={saveVideo}
        />
      )}
    </AppShell>
  );
}

function VideoModal({ chapterId, video, onClose, onSave }) {
  const [title, setTitle] = useState(video?.title || '');
  const [description, setDescription] = useState(video?.description || '');
  const [videoUrl, setVideoUrl] = useState(video?.video_url || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(video?.thumbnail_url || '');
  const [grades, setGrades] = useState(video?.target_grades || []);
  const [downloadable, setDownloadable] = useState(video?.is_downloadable || false);

  const toggleGrade = (g) => {
    setGrades((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: video?.id, chapter_id: chapterId, title, description,
      video_url: videoUrl, thumbnail_url: thumbnailUrl,
      target_grades: grades, is_downloadable: downloadable,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="glass-card p-6 w-full max-w-md space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-100">{video ? 'تعديل الفيديو' : 'فيديو جديد'}</h2>
          <button type="button" onClick={onClose} className="text-slate-400"><X size={20} /></button>
        </div>
        <div>
          <label className="text-sm text-slate-300 mb-1.5 block">عنوان الفيديو</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-sm text-slate-300 mb-1.5 block">الوصف</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" rows={2} />
        </div>
        <div>
          <label className="text-sm text-slate-300 mb-1.5 block">رابط الفيديو (YouTube أو Vimeo)</label>
          <input required value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="input-field" placeholder="https://youtube.com/watch?v=..." />
        </div>
        <div>
          <label className="text-sm text-slate-300 mb-1.5 block">رابط صورة مصغّرة (اختياري)</label>
          <input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} className="input-field" placeholder="https://..." />
        </div>
        <div>
          <label className="text-sm text-slate-300 mb-1.5 block">الصفوف المسموح لها بالمشاهدة</label>
          <div className="flex flex-wrap gap-2">
            {GRADES.map((g) => (
              <button key={g} type="button" onClick={() => toggleGrade(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${grades.includes(g) ? 'bg-amber-500 text-navy-950' : 'bg-white/[0.06] text-slate-400'}`}>
                {g}
              </button>
            ))}
          </div>
          <p className="text-slate-500 text-xs mt-1">لو ماخترتش صف، الفيديو هيظهر لكل الطلاب</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={downloadable} onChange={(e) => setDownloadable(e.target.checked)} />
          يسمح بتحميله للمشاهدة أوفلاين
        </label>
        <button type="submit" className="btn-primary w-full">حفظ الفيديو</button>
      </form>
    </div>
  );
}
