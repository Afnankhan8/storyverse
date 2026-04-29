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
import { db } from '../firebase.ts';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface Props { user?: any; onLogout?: () => void; }

const ACCEPTED = ['.pdf', '.epub', '.docx'];
const CATEGORIES = ['Fiction', 'Non-Fiction', 'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Biography', 'Self-Help', 'Technical'];
const MAX_MB = 50;
const CLOUD_NAME = 'deccu061f';
const UPLOAD_PRESET_IMAGE = 'comixnova';       // for cover images
const UPLOAD_PRESET_RAW = 'comixnova_raw';     // for PDF/EPUB/DOCX — create this new preset in Cloudinary

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
    if (!f.type.startsWith('image/')) {
      setErrors(p => ({ ...p, cover: 'Please upload an image file.' }));
      return;
    }
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

  // ─── FIXED: separate presets for image vs raw ───────────────
 const uploadToCloudinary = async (
  file: File,
  resourceType: 'image' | 'raw'
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  formData.append(
    'upload_preset',
    resourceType === 'raw'
      ? UPLOAD_PRESET_RAW
      : UPLOAD_PRESET_IMAGE
  );

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await res.json();

  if (!res.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'Upload failed');
  }

  return data.secure_url;
};
  // ────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setUploadState('uploading');
      setProgress(10);

      let coverUrl = '';
      let fileUrl = '';

      // Upload cover image
      if (cover) {
        setProgress(20);
        coverUrl = await uploadToCloudinary(cover, 'image');
        setProgress(50);
      }

      // Upload book file using raw preset
      if (book) {
        fileUrl = await uploadToCloudinary(book, 'raw');
        setProgress(90);
      }

      if (!fileUrl) throw new Error('Book file upload failed.');

      // Save to Firestore
      await addDoc(collection(db, 'books'), {
        title: title.trim(),
        author: author.trim(),
        category,
        tags,
        description: description.trim(),
        visibility,
        coverUrl,
        fileUrl,
        fileName: book?.name || '',
        fileType: book?.name.split('.').pop()?.toLowerCase() || '',
        createdAt: serverTimestamp(),
        status: 'published',
        views: 0,
        likes: 0,
        userId: user?.uid || 'guest',
      });

      setProgress(100);
      setUploadState('success');
      showToast('Book uploaded successfully!', 'success');
      setTimeout(() => navigate('/library'), 1500);

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadState('error');
      showToast(error.message || 'Upload failed.', 'error');
    }
  };

  return (
    <AppShell user={user} onLogout={onLogout}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Publish New Book</h1>
          <p className="text-gray-400">Share your story with the world in professional PDF, EPUB or DOCX format.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Upload Zone */}
          <div className="lg:col-span-2 space-y-6">
            <div
              className={`relative group h-[400px] border-2 border-dashed rounded-3xl transition-all duration-300 flex flex-col items-center justify-center p-8 text-center cursor-pointer ${dragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800 hover:border-gray-700 bg-gray-900/50'
                } ${book ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFileDrop(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={ACCEPTED.join(',')}
                onChange={(e) => handleFileDrop(e.target.files)}
              />

              <AnimatePresence mode="wait">
                {!book ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <CloudUpload className="text-blue-500" size={40} />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-white">Drop your book here</p>
                      <p className="text-gray-400 mt-1">PDF, EPUB, or DOCX up to 50MB</p>
                    </div>
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-medium">
                      Select File
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto">
                      <FileText className="text-emerald-500" size={40} />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-white truncate max-w-[300px]">{book.name}</p>
                      <p className="text-emerald-500 font-medium mt-1">Ready to upload</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setBook(null); }}
                      className="text-gray-500 hover:text-white transition-colors text-sm"
                    >
                      Change file
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error message */}
              {errors.book && (
                <p className="absolute bottom-4 text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.book}
                </p>
              )}
            </div>

            {/* Book Details */}
            <div className="glass-card p-8 rounded-3xl space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Tag size={14} /> Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter book title"
                    className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${errors.title ? 'border-red-500/50' : 'border-gray-800 focus:border-blue-500/50'
                      }`}
                  />
                  {errors.title && <p className="text-red-400 text-xs">{errors.title}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <User size={14} /> Author Name
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Pen name or real name"
                    className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${errors.author ? 'border-red-500/50' : 'border-gray-800 focus:border-blue-500/50'
                      }`}
                  />
                  {errors.author && <p className="text-red-400 text-xs">{errors.author}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <AlignLeft size={14} /> Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="What is your book about?"
                  className="w-full bg-black/40 border border-gray-800 focus:border-blue-500/50 rounded-xl px-4 py-3 text-white focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <BookOpen size={14} /> Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none appearance-none cursor-pointer ${errors.category ? 'border-red-500/50' : 'border-gray-800 focus:border-blue-500/50'
                      }`}
                  >
                    <option value="" disabled>Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="text-red-400 text-xs">{errors.category}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Globe size={14} /> Visibility
                  </label>
                  <div className="flex bg-black/40 p-1 rounded-xl border border-gray-800">
                    <button
                      onClick={() => setVisibility('public')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${visibility === 'public' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      <Globe size={14} /> Public
                    </button>
                    <button
                      onClick={() => setVisibility('private')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${visibility === 'private' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      <Lock size={14} /> Private
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Cover Upload */}
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <label className="text-sm font-medium text-gray-400 block">Book Cover</label>
              <div
                className="relative group aspect-[3/4] bg-black/40 border-2 border-dashed border-gray-800 rounded-2xl overflow-hidden cursor-pointer hover:border-gray-700 transition-all"
                onClick={() => coverInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={coverInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleCoverChange(e.target.files)}
                />

                {coverPreview ? (
                  <>
                    <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-sm font-medium">Change Cover</p>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3">
                      <Image className="text-blue-500" size={24} />
                    </div>
                    <p className="text-sm text-gray-400">Upload cover image</p>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-gray-500 text-center">Recommended: 1200 x 1600 px</p>
            </div>

            {/* Tags */}
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <label className="text-sm font-medium text-gray-400 block">Tags (Max 8)</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map(t => (
                  <span key={t} className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-lg flex items-center gap-1 border border-blue-500/20">
                    {t}
                    <button onClick={() => setTags(p => p.filter(x => x !== t))} className="hover:text-white">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add tag..."
                  className="w-full bg-black/40 border border-gray-800 focus:border-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                />
                <button
                  onClick={addTag}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Upload Progress / Action */}
            <div className="glass-card p-6 rounded-3xl space-y-4">
              {uploadState === 'uploading' && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Uploading...</span>
                    <span className="text-white font-medium">{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={uploadState === 'uploading'}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {uploadState === 'uploading' ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
                    Publish Book
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toasts */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-8 left-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[320px] border ${toast.type === 'success'
              ? 'bg-emerald-950 border-emerald-500/30 text-emerald-400'
              : 'bg-red-950 border-red-500/30 text-red-400'
              }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="font-medium">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}