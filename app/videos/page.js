'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Trash2, Pencil, ChevronUp, ChevronDown, Video as VideoIcon, X } from 'lucide-react';

const GRADES = ['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'];

export default function VideosPage() {
  const [chapters, setChapters] = useState([]);
  const [videosByChapter, setVideosByChapter] = useState({});
  const [openChapter, setOpenChapter] = useState(null);
  const [modal, setModal] = useState(null); // { chapterId, video }
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
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

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-slate-100">الفيديوهات</h1>
        <p className="text-slate-400 text-sm mt-1">أضف دروسك وقسّمها على فصول، وحدد الصفوف اللي تقدر تشوفها</p>
      </header>

      {loading ? (
        <p className="text-slate-500">جارٍ التحميل...</p>
      ) : (
        <div className="space-y-3">
          {chapters.map((ch) => {
            const vids = videosByChapter[ch.id] || [];
            const open = openChapter === ch.id;
            return (
              <div key={ch.id} className="glass-card overflow-hidden">
                <button onClick={() => setOpenChapter(open ? null : ch.id)}
                  className="w-full flex items-center justify-between p-4">
                  <span className="font-bold text-slate-100">{ch.title}</span>
                  <span className="text-slate-500 text-sm">{vids.length} فيديو</span>
                </button>
                {open && (
                  <div className="border-t border-white/[0.06] p-4 space-y-2">
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
          })}
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
