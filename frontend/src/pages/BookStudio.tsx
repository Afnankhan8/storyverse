import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BookOpen, Plus, Trash2, Eye, Upload, ArrowLeft,
  Bold, Italic, List, AlignLeft, AlignCenter, Type,
  CheckCircle2, Loader2, GripVertical, Settings, Globe,
  Lock, DollarSign, Tag, ChevronDown, Sparkles
} from 'lucide-react';
import AppShell from '../components/AppShell';

const API = "https://your-backend.onrender.com";

interface Chapter { id: string; title: string; content: string; }
interface Props { user?: any; onLogout?: () => void; }

let saveTimer: ReturnType<typeof setTimeout>;

export default function BookStudio({ user, onLogout }: Props) {
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);

  // Book meta
  const [title, setTitle] = useState('Untitled Book');
  const [genre, setGenre] = useState('Fantasy');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('4.99');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  // Chapters
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: Date.now().toString(), title: 'Chapter 1', content: '' }
  ]);
  const [activeChapterId, setActiveChapterId] = useState(chapters[0].id);
  const activeChapter = chapters.find(c => c.id === activeChapterId)!;

  // UI state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [publishing, setPublishing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Sync editor content → chapter state
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = activeChapter?.content || '';
    }
  }, [activeChapterId]);

  const handleEditorInput = useCallback(() => {
    const html = editorRef.current?.innerHTML || '';
    setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: html } : c));
    setSaveStatus('saving');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => setSaveStatus('saved'), 1200);
  }, [activeChapterId]);

  const addChapter = () => {
    const ch: Chapter = { id: Date.now().toString(), title: `Chapter ${chapters.length + 1}`, content: '' };
    setChapters(prev => [...prev, ch]);
    setActiveChapterId(ch.id);
  };

  const deleteChapter = (id: string) => {
    if (chapters.length === 1) return;
    const next = chapters.find(c => c.id !== id)!;
    setChapters(prev => prev.filter(c => c.id !== id));
    setActiveChapterId(next.id);
  };

  const updateChapterTitle = (id: string, title: string) => {
    setChapters(prev => prev.map(c => c.id === id ? { ...c, title } : c));
  };

  // Formatting commands
  const fmt = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    handleEditorInput();
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCoverUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    if (!title.trim() || !user?.email) return;
    setPublishing(true);
    try {
      const fullContent = chapters.map(c => `<h2>${c.title}</h2>${c.content}`).join('<hr/>');
      const payload = {
        title, genre, description, tags: tags.split(',').map(t => t.trim()),
        coverImage: coverUrl, authorId: user.email, author: user.name || user.email.split('@')[0],
        isPaid, price: isPaid ? Math.round(parseFloat(price) * 100) : 0,
        visibility, content: fullContent,
        pages: chapters.map((c, i) => ({ chapter: i + 1, title: c.title, content: c.content })),
      };
      const res = await axios.post(`${API}/api/hub/publish`, payload);
      navigate(`/book/${res.data.id}`);
    } catch {
      alert('Failed to publish. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const totalWords = chapters.reduce((sum, c) => {
    const text = c.content.replace(/<[^>]*>/g, '');
    return sum + (text.trim() ? text.trim().split(/\s+/).length : 0);
  }, 0);

  const GENRES = ['Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 'Horror', 'Adventure', 'Thriller', 'Drama', 'Comics', 'Non-Fiction'];

  return (
    <AppShell user={user} onLogout={onLogout}>
      <div className="flex h-screen bg-white overflow-hidden">

        {/* ── SIDEBAR ── */}
        <aside className="w-64 flex-shrink-0 border-r border-gray-100 bg-slate-50 flex flex-col">
          {/* Back + title */}
          <div className="p-4 border-b border-gray-100">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-xs text-slate-400 hover:text-gray-700 mb-3 transition-colors">
              <ArrowLeft size={13} /> Back to Dashboard
            </button>
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              className="w-full text-sm font-bold text-gray-900 bg-transparent border-0 outline-none resize-none leading-snug"
              placeholder="Book title..."
            />
            <p className="text-xs text-slate-400 mt-1">{totalWords.toLocaleString()} words · {chapters.length} chapter{chapters.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Chapters list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chapters</span>
              <button onClick={addChapter} className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Plus size={13} />
              </button>
            </div>
            {chapters.map((ch, idx) => (
              <div key={ch.id}
                onClick={() => setActiveChapterId(ch.id)}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${activeChapterId === ch.id ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-white text-slate-600'}`}
              >
                <GripVertical size={13} className="opacity-30 flex-shrink-0" />
                <span className="text-xs font-medium flex-1 truncate">{ch.title}</span>
                <span className={`text-[10px] flex-shrink-0 ${activeChapterId === ch.id ? 'text-blue-200' : 'text-slate-400'}`}>{idx + 1}</span>
                {chapters.length > 1 && (
                  <button onClick={e => { e.stopPropagation(); deleteChapter(ch.id); }}
                    className={`opacity-0 group-hover:opacity-100 p-0.5 rounded transition-all ${activeChapterId === ch.id ? 'hover:bg-blue-500' : 'hover:bg-red-50 text-red-500'}`}>
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Bottom actions */}
          <div className="p-3 border-t border-gray-100 space-y-2">
            <button onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-white transition-colors border border-transparent hover:border-gray-200">
              <Settings size={14} /> Book Settings
            </button>
            <button onClick={() => setShowPreview(!showPreview)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-white transition-colors border border-transparent hover:border-gray-200">
              <Eye size={14} /> Preview
            </button>
            <button onClick={handlePublish} disabled={publishing || !title.trim()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-60 shadow-lg shadow-blue-600/20">
              {publishing ? <Loader2 size={13} className="animate-spin" /> : <Globe size={13} />}
              {publishing ? 'Publishing...' : 'Publish Book'}
            </button>
          </div>
        </aside>

        {/* ── MAIN EDITOR ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-gray-100 px-6 py-2.5 flex items-center gap-1 flex-shrink-0">
            <div className="flex items-center gap-0.5 pr-3 border-r border-gray-200">
              <button onClick={() => fmt('bold')} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors" title="Bold"><Bold size={14} /></button>
              <button onClick={() => fmt('italic')} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors" title="Italic"><Italic size={14} /></button>
              <button onClick={() => fmt('formatBlock', 'h2')} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors" title="Heading"><Type size={14} /></button>
            </div>
            <div className="flex items-center gap-0.5 px-3 border-r border-gray-200">
              <button onClick={() => fmt('insertUnorderedList')} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors" title="List"><List size={14} /></button>
              <button onClick={() => fmt('justifyLeft')} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors" title="Left"><AlignLeft size={14} /></button>
              <button onClick={() => fmt('justifyCenter')} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors" title="Center"><AlignCenter size={14} /></button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {saveStatus === 'saving' && <span className="text-xs text-slate-400 flex items-center gap-1.5"><Loader2 size={11} className="animate-spin" /> Saving…</span>}
              {saveStatus === 'saved' && <span className="text-xs text-emerald-500 flex items-center gap-1.5"><CheckCircle2 size={11} /> Saved</span>}
            </div>
          </div>

          {/* Chapter title + editor */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-8 py-10">
              {/* Chapter title input */}
              <input
                value={activeChapter?.title || ''}
                onChange={e => updateChapterTitle(activeChapterId, e.target.value)}
                className="w-full text-3xl font-extrabold text-gray-900 border-0 outline-none bg-transparent mb-6 placeholder-slate-300"
                placeholder="Chapter title..."
              />
              {/* Rich text editor */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                className="min-h-[60vh] text-gray-700 text-[17px] leading-8 outline-none prose prose-slate max-w-none"
                style={{ fontFamily: "'Georgia', serif" }}
                data-placeholder="Start writing your story here..."
              />
            </div>
          </div>
        </div>

        {/* ── SETTINGS PANEL ── */}
        <AnimatePresence>
          {showSettings && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-gray-100 bg-white overflow-y-auto flex-shrink-0"
            >
              <div className="p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm">Book Settings</h3>
                  <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-gray-700 text-xs font-medium">Close</button>
                </div>

                {/* Cover */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cover Image</label>
                  <label
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) { const r = new FileReader(); r.onload = () => setCoverUrl(r.result as string); r.readAsDataURL(f); } }}
                    className={`block border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    {coverUrl
                      ? <img src={coverUrl} alt="Cover" className="w-full aspect-[2/3] object-cover" />
                      : <div className="aspect-[2/3] flex flex-col items-center justify-center gap-2 text-slate-400">
                          <Upload size={24} />
                          <span className="text-xs font-medium">Drop image or click</span>
                        </div>
                    }
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                  </label>
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Tag size={10} /> Genre</label>
                  <div className="relative">
                    <select value={genre} onChange={e => setGenre(e.target.value)}
                      className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white pr-8">
                      {GENRES.map(g => <option key={g}>{g}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                    placeholder="Hook your readers with a compelling blurb..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tags <span className="font-normal text-slate-400">(comma separated)</span></label>
                  <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                    placeholder="magic, adventure, epic..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                {/* Pricing */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><DollarSign size={10} /> Pricing</label>
                  <div className="flex gap-2 mb-3">
                    <button onClick={() => setIsPaid(false)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${!isPaid ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-slate-600 hover:bg-slate-50'}`}>
                      Free
                    </button>
                    <button onClick={() => setIsPaid(true)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${isPaid ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-slate-600 hover:bg-slate-50'}`}>
                      Paid
                    </button>
                  </div>
                  {isPaid && (
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                      <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0.99" step="0.01"
                        className="w-full pl-8 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  )}
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Visibility</label>
                  <div className="flex gap-2">
                    <button onClick={() => setVisibility('public')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all ${visibility === 'public' ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-slate-600 hover:bg-slate-50'}`}>
                      <Globe size={12} /> Public
                    </button>
                    <button onClick={() => setVisibility('private')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all ${visibility === 'private' ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-slate-600 hover:bg-slate-50'}`}>
                      <Lock size={12} /> Private
                    </button>
                  </div>
                </div>

                <button onClick={handlePublish} disabled={publishing || !title.trim()}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-blue-600/20">
                  {publishing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  {publishing ? 'Publishing…' : 'Publish Book'}
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── PREVIEW PANEL ── */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="fixed inset-0 z-50 bg-white flex flex-col"
            >
              <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen size={18} className="text-blue-600" />
                  <span className="font-bold text-gray-900">Preview: {title}</span>
                </div>
                <button onClick={() => setShowPreview(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  Close Preview
                </button>
              </div>
              <div className="flex-1 overflow-y-auto bg-slate-50">
                <div className="max-w-2xl mx-auto px-8 py-14">
                  {coverUrl && <img src={coverUrl} alt="Cover" className="w-48 mx-auto rounded-2xl shadow-2xl mb-10 block" />}
                  <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-2">{title}</h1>
                  <p className="text-slate-400 text-center text-sm mb-10">by {user?.name || 'Author'}</p>
                  {description && <p className="text-slate-500 text-center italic mb-10 max-w-lg mx-auto">{description}</p>}
                  <hr className="border-gray-200 mb-10" />
                  {chapters.map(ch => (
                    <div key={ch.id} className="mb-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Georgia', serif" }}>{ch.title}</h2>
                      <div className="text-gray-700 text-lg leading-9 prose max-w-none" style={{ fontFamily: "'Georgia', serif" }}
                        dangerouslySetInnerHTML={{ __html: ch.content || '<p class="text-slate-400 italic">No content yet…</p>' }} />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #CBD5E1;
          pointer-events: none;
        }
        [contenteditable] h2 { font-size: 1.5rem; font-weight: 700; margin: 1.5rem 0 0.5rem; color: #111827; }
        [contenteditable] p { margin: 0.75rem 0; }
        [contenteditable] ul { list-style: disc; padding-left: 1.5rem; margin: 0.75rem 0; }
      `}</style>
    </AppShell>
  );
}
