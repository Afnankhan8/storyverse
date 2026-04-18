/**
 * UploadBook — Premium drag-and-drop upload experience
 */
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, Image, X, CheckCircle2, AlertCircle,
  BookOpen, Tag, User, AlignLeft, Globe, Lock, ChevronDown,
  Plus, Loader2, CloudUpload
} from 'lucide-react';
import AppShell from '../components/AppShell';

interface Props { user?: any; onLogout?: () => void; }

const ACCEPTED = ['.pdf', '.epub', '.docx'];
const CATEGORIES = ['Fiction', 'Non-Fiction', 'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Biography', 'Self-Help', 'Technical'];
const MAX_MB = 50;

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export default function UploadBook({ user, onLogout }: Props) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const [book, setBook] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(user?.name || '');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFileDrop = useCallback((files: FileList | null) => {
    if (!files?.[0]) return;
    const f = files[0];
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      setErrors(p => ({ ...p, book: 'Only PDF, EPUB, or DOCX files are accepted.' }));
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setErrors(p => ({ ...p, book: `File must be smaller than ${MAX_MB}MB.` }));
      return;
    }
    setBook(f);
    setErrors(p => { const n = { ...p }; delete n.book; return n; });
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
  }, [title]);

  const handleCoverChange = (files: FileList | null) => {
    if (!files?.[0]) return;
    const f = files[0];
    if (!f.type.startsWith('image/')) { setErrors(p => ({ ...p, cover: 'Please upload an image file.' })); return; }
    setCover(f);
    setCoverPreview(URL.createObjectURL(f));
    setErrors(p => { const n = { ...p }; delete n.cover; return n; });
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags(p => [...p, t]);
      setTagInput('');
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!book) e.book = 'Please upload a book file.';
    if (!title.trim()) e.title = 'Title is required.';
    if (!author.trim()) e.author = 'Author is required.';
    if (!category) e.category = 'Please select a category.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setUploadState('uploading');
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + Math.random() * 12;
      });
    }, 200);

    try {
      // In a real implementation, use FormData + axios with onUploadProgress
      await new Promise(resolve => setTimeout(resolve, 2500));
      clearInterval(interval);
      setProgress(100);
      setUploadState('success');
      showToast('Book uploaded successfully!', 'success');
      setTimeout(() => navigate('/library'), 2000);
    } catch {
      clearInterval(interval);
      setUploadState('error');
      showToast('Upload failed. Please try again.', 'error');
    }
  };

  const fileSizeMB = book ? (book.size / 1024 / 1024).toFixed(1) : null;
  const fileExt = book?.name.split('.').pop()?.toUpperCase();
  const extColors: Record<string, string> = { PDF: 'bg-red-50 text-red-600 border-red-200', EPUB: 'bg-emerald-50 text-emerald-600 border-emerald-200', DOCX: 'bg-blue-50 text-blue-600 border-blue-200' };

  return (
    <AppShell user={user} onLogout={onLogout}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}
            className={`fixed top-20 right-6 z-[500] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-semibold ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={17} className="text-emerald-500" /> : <AlertCircle size={17} className="text-red-500" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">
        <div className="mb-8">
          <h1 className="display-font text-4xl lg:text-5xl font-bold text-slate-900">Upload Book</h1>
          <p className="text-slate-500 text-base mt-2">Add a PDF, EPUB, or DOCX to your library.</p>
        </div>

        <div className="grid xl:grid-cols-3 gap-6">

          {/* Left — File + Cover */}
          <div className="xl:col-span-1 space-y-5">

            {/* Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFileDrop(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200
                ${dragging ? 'border-blue-500 bg-blue-50' : book ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30'}
                ${errors.book ? 'border-red-400 bg-red-50' : ''}`}>
              <input ref={fileInputRef} type="file" accept={ACCEPTED.join(',')} className="hidden" onChange={e => handleFileDrop(e.target.files)} />

              {book ? (
                <>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 border ${extColors[fileExt || ''] || 'bg-slate-100 border-slate-200'}`}>
                    <FileText size={24} />
                  </div>
                  <p className="font-bold text-slate-900 text-sm mb-1 truncate max-w-full px-2">{book.name}</p>
                  <p className="text-xs text-slate-500">{fileSizeMB} MB · {fileExt}</p>
                  <button onClick={e => { e.stopPropagation(); setBook(null); }}
                    className="mt-3 text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                    <X size={12} /> Remove
                  </button>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                    <CloudUpload size={26} className="text-blue-600" />
                  </div>
                  <p className="font-bold text-slate-900 text-sm mb-1">Drop your book here</p>
                  <p className="text-xs text-slate-500 mb-3">or click to browse</p>
                  <div className="flex gap-1.5">
                    {['PDF', 'EPUB', 'DOCX'].map(f => (
                      <span key={f} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-lg font-mono font-medium">{f}</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Max {MAX_MB}MB</p>
                </>
              )}
            </div>
            {errors.book && <p className="text-xs text-red-600 flex items-center gap-1.5 -mt-3"><AlertCircle size={12} />{errors.book}</p>}

            {/* Cover Image */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2"><Image size={15} className="text-slate-400" />Cover Image</h3>
              <div
                onClick={() => coverInputRef.current?.click()}
                className="relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-center">
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleCoverChange(e.target.files)} />
                {coverPreview
                  ? <>
                      <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                        <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-lg">Change</span>
                      </div>
                    </>
                  : <div className="text-center p-6">
                      <Image size={28} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Click to upload cover</p>
                    </div>
                }
              </div>
            </div>

            {/* Visibility */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Visibility</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'public', label: 'Public', desc: 'Anyone can read', icon: Globe, color: 'border-blue-500 bg-blue-50 text-blue-700' },
                  { val: 'private', label: 'Private', desc: 'Only you', icon: Lock, color: 'border-slate-300 bg-slate-50 text-slate-700' },
                ].map(opt => (
                  <button key={opt.val} onClick={() => setVisibility(opt.val as 'public' | 'private')}
                    className={`flex flex-col items-start p-3 rounded-xl border-2 transition-all ${visibility === opt.val ? opt.color : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <opt.icon size={16} className="mb-1.5" />
                    <div className="text-sm font-bold">{opt.label}</div>
                    <div className="text-xs opacity-70">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Metadata */}
          <div className="xl:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="display-font text-2xl font-bold text-slate-900 mb-5 flex items-center gap-2"><BookOpen size={20} className="text-blue-600" />Book Details</h3>
              <div className="space-y-4">

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Enter book title…"
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.title ? 'border-red-400 bg-red-50' : 'border-slate-200'}`} />
                  {errors.title && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><AlertCircle size={11} />{errors.title}</p>}
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Author <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
                      placeholder="Author name…"
                      className={`w-full pl-9 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.author ? 'border-red-400 bg-red-50' : 'border-slate-200'}`} />
                  </div>
                  {errors.author && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><AlertCircle size={11} />{errors.author}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      className={`w-full appearance-none border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.category ? 'border-red-400 bg-red-50' : 'border-slate-200'} ${!category ? 'text-slate-400' : 'text-slate-900'}`}>
                      <option value="">Select category…</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  {errors.category && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><AlertCircle size={11} />{errors.category}</p>}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tags</label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1.5 rounded-xl font-medium">
                        #{tag}
                        <button onClick={() => setTags(p => p.filter(t => t !== tag))} className="hover:text-red-500 transition-colors"><X size={11} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                        placeholder="Add a tag…"
                        className="w-full pl-9 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <button onClick={addTag} disabled={!tagInput.trim() || tags.length >= 8}
                      className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all disabled:opacity-40 flex items-center gap-1.5">
                      <Plus size={15} /> Add
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">{tags.length}/8 tags · Press Enter to add</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                  <div className="relative">
                    <AlignLeft size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5}
                      placeholder="Write a compelling summary of your book…"
                      className="w-full pl-9 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{description.length} characters</p>
                </div>
              </div>
            </div>

            {/* Upload Button + Progress */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              {uploadState === 'uploading' && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">Uploading…</span>
                    <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" />
                  </div>
                </div>
              )}
              {uploadState === 'success' && (
                <div className="mb-5 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-800 text-sm">Upload successful!</p>
                    <p className="text-xs text-emerald-600">Redirecting to library…</p>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleSubmit} disabled={uploadState === 'uploading' || uploadState === 'success'}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-xl display-font font-bold text-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed">
                  {uploadState === 'uploading' ? <><Loader2 size={18} className="animate-spin" /> Uploading…</> : <><Upload size={18} /> Upload Book</>}
                </button>
                <button onClick={() => navigate('/library')}
                  className="flex items-center justify-center gap-2 border border-slate-200 text-slate-700 px-5 py-3.5 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all">
                  Cancel
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">Your book will be processed and stored securely.</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
