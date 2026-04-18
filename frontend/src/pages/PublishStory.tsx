import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  CheckCircle2, ChevronRight, Upload, BookOpen, Tag, Users,
  AlertTriangle, Sparkles, Globe, FileText, Languages, Shield,
  ArrowLeft, Eye, Image as ImageIcon, Info, Star, Clock,
} from 'lucide-react';
import AppShell from '../components/AppShell';

/* ─── Options ─── */
const GENRES = [
  { value: 'adventure', label: 'Adventure', emoji: '⚔️', color: '#F59E0B' },
  { value: 'fantasy', label: 'Fantasy', emoji: '🧙', color: '#A855F7' },
  { value: 'sci-fi', label: 'Sci-Fi', emoji: '🚀', color: '#3B82F6' },
  { value: 'comedy', label: 'Comedy', emoji: '😂', color: '#FBBF24' },
  { value: 'mystery', label: 'Mystery', emoji: '🔍', color: '#6366F1' },
  { value: 'romance', label: 'Romance', emoji: '💖', color: '#EC4899' },
  { value: 'horror', label: 'Horror', emoji: '👻', color: '#71717A' },
  { value: 'action', label: 'Action', emoji: '💥', color: '#EF4444' },
  { value: 'drama', label: 'Drama', emoji: '🎭', color: '#14B8A6' },
];

const AUDIENCES = [
  { value: 'everyone', label: 'Everyone', sub: 'All Ages', color: '#14B8A6' },
  { value: 'kids', label: 'Kids', sub: '7–12', color: '#22C55E' },
  { value: 'teens', label: 'Teens / YA', sub: '13–17', color: '#3B82F6' },
  { value: 'adults', label: 'Mature', sub: '18+', color: '#EF4444' },
];

const LANGUAGES = [
  { value: 'english', label: 'English', flag: '🇺🇸' },
  { value: 'spanish', label: 'Español', flag: '🇪🇸' },
  { value: 'french', label: 'Français', flag: '🇫🇷' },
  { value: 'japanese', label: '日本語', flag: '🇯🇵' },
  { value: 'korean', label: '한국어', flag: '🇰🇷' },
];

const WARNINGS = [
  { label: 'Violence', color: '#EF4444' },
  { label: 'Strong Language', color: '#F59E0B' },
  { label: 'Gore', color: '#DC2626' },
  { label: 'Suggestive Themes', color: '#EC4899' },
];

export default function PublishStory({ user, onLogout }: { user?: any; onLogout?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('adventure');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState('everyone');
  const [language, setLanguage] = useState('english');
  const [tags, setTags] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [_bookId, setBookId] = useState('');

  const storyData = location.state?.story || null;

  const handlePublish = async () => {
    if (!title.trim() || !storyData) return;
    setPublishing(true);
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      const response = await axios.post('http://localhost:8000/api/hub/publish', {
        title,
        author: user.name,
        authorId: user.email,
        pages: storyData.pages,
        coverImage: storyData.pages[0]?.image_url || '',
        genre, description, audience, language,
        tags: tagList, warnings, status: 'pending',
      });
      setBookId(response.data.id);
      setPublished(true);
    } catch {
      alert('Failed to publish. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const toggleWarning = (w: string) => {
    setWarnings(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]);
  };

  const selectedGenre = GENRES.find(g => g.value === genre);
  const selectedAudience = AUDIENCES.find(a => a.value === audience);
  const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
  const formProgress = [title.trim(), description.trim(), genre, audience].filter(Boolean).length;
  const progressPercent = (formProgress / 4) * 100;

  /* ─── No story state ─── */
  if (!storyData) {
    return (
      <AppShell user={user} onLogout={onLogout}>
        <div className="min-h-[80vh] flex items-center justify-center px-6 bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="text-center max-w-md w-full bg-white rounded-3xl p-10 border border-slate-200/80"
            style={{ boxShadow: '0 8px 40px -8px rgba(15,23,42,0.1)' }}
          >
            <div
              className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(20,184,166,0.12), rgba(59,130,246,0.12))',
                border: '1px solid rgba(20,184,166,0.2)',
              }}
            >
              <BookOpen size={36} className="text-teal-600" strokeWidth={1.8} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No Story Found</h2>
            <p className="text-slate-500 text-[14px] mb-8 leading-relaxed">
              You need to create a story in Book Studio before publishing.
            </p>
            <button
              onClick={() => navigate('/creator')}
              className="w-full px-6 py-3.5 rounded-xl font-bold text-[14px] text-white flex items-center justify-center gap-2 active:scale-95 transition-all"
              style={{
                background: 'linear-gradient(135deg, #2DD4BF, #14B8A6)',
                boxShadow: '0 8px 24px -4px rgba(20,184,166,0.4)',
              }}
            >
              <Sparkles size={16} /> Go to Creator Studio
            </button>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  /* ─── Success state ─── */
  if (published) {
    return (
      <AppShell user={user} onLogout={onLogout}>
        <div className="min-h-[80vh] flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 relative overflow-hidden">
          {/* Confetti dots */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -20, x: 0 }}
              animate={{
                opacity: [0, 1, 0],
                y: [0, 400],
                x: [0, (i % 2 ? 1 : -1) * (50 + i * 10)],
                rotate: [0, 360],
              }}
              transition={{ duration: 3, delay: i * 0.1, repeat: Infinity, repeatDelay: 2 }}
              className="absolute w-2 h-2 rounded-sm"
              style={{
                background: ['#14B8A6', '#3B82F6', '#F59E0B', '#EF4444', '#A855F7'][i % 5],
                top: '10%',
                left: `${5 + (i * 5) % 90}%`,
              }}
            />
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-3xl p-10 max-w-md w-full text-center relative border border-slate-200/80"
            style={{ boxShadow: '0 20px 60px -12px rgba(15,23,42,0.15)' }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 relative"
              style={{
                background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
                boxShadow: '0 12px 40px -8px rgba(16,185,129,0.4)',
              }}
            >
              <CheckCircle2 size={52} className="text-emerald-600" strokeWidth={2} />
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-4 border-emerald-400"
              />
            </motion.div>

            <h2 className="text-[26px] font-black text-slate-900 mb-3 tracking-tight">
              Submitted Successfully! 🎉
            </h2>
            <p className="text-slate-600 text-[14px] mb-2 leading-relaxed">
              Your story
            </p>
            <p className="text-[16px] font-bold text-slate-900 mb-2">"{title}"</p>
            <p className="text-slate-500 text-[13px] mb-6 leading-relaxed">
              is now under review. You'll get notified once approved.
            </p>

            <div
              className="flex items-center gap-2.5 p-3 rounded-xl mb-6 text-left"
              style={{
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.2)',
              }}
            >
              <Clock size={15} className="text-amber-600 flex-shrink-0" />
              <p className="text-[12px] text-amber-800 font-medium">
                Typical review time: <strong>24–48 hours</strong>
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => navigate('/creator')}
                className="flex items-center justify-center gap-2 w-full py-3.5 text-white font-bold rounded-xl transition-all active:scale-95 text-[14px]"
                style={{
                  background: 'linear-gradient(135deg, #2DD4BF, #14B8A6)',
                  boxShadow: '0 8px 24px -4px rgba(20,184,166,0.4)',
                }}
              >
                <Sparkles size={16} /> Create Another Story
              </button>
              <button
                onClick={() => navigate('/hub')}
                className="flex items-center justify-center gap-2 w-full py-3.5 text-slate-700 font-bold rounded-xl transition-all active:scale-95 text-[14px]"
                style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}
              >
                <Globe size={16} /> Return to Hub
              </button>
            </div>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  /* ─── Main Publish Form ─── */
  return (
    <AppShell user={user} onLogout={onLogout}>
      <div className="min-h-full" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)' }}>
        {/* ── Hero Header ── */}
        <div
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #070A17 0%, #0B0F26 50%, #070A17 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.6), rgba(139,92,246,0.4), transparent)' }}
          />
          <div
            className="absolute top-0 left-1/4 w-[500px] h-full opacity-60 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(20,184,166,0.15) 0%, transparent 60%)' }}
          />
          <div
            className="absolute top-0 right-1/4 w-[400px] h-full opacity-50 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, transparent 60%)' }}
          />

          <div className="max-w-5xl mx-auto px-6 py-8 relative">
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-[13px] font-semibold mb-5 transition-all active:scale-95 group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to Studio
            </button>

            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex-1 min-w-0">
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.15em] mb-4"
                  style={{
                    background: 'rgba(20,184,166,0.12)',
                    border: '1px solid rgba(20,184,166,0.3)',
                    color: '#5EEAD4',
                  }}
                >
                  <BookOpen size={12} /> Publishing Desk
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="text-[42px] font-black tracking-tight leading-[1.05] mb-2"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  <span className="text-white">Publish Your </span>
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #2DD4BF 0%, #3B82F6 50%, #A855F7 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Masterpiece
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-slate-400 text-[15px] leading-relaxed max-w-xl"
                >
                  Share your story with the world. Fill in the details below to submit for review.
                </motion.p>
              </div>

              {/* Progress ring */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="relative w-12 h-12">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="24" cy="24" r="20" strokeWidth="3.5" stroke="rgba(255,255,255,0.08)" fill="none" />
                    <motion.circle
                      cx="24" cy="24" r="20" strokeWidth="3.5" stroke="#14B8A6" fill="none"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 20}
                      animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - progressPercent / 100) }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      style={{ filter: 'drop-shadow(0 0 6px rgba(20,184,166,0.5))' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white">
                    {Math.round(progressPercent)}%
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Form Progress</p>
                  <p className="text-[13px] font-bold text-white">{formProgress} / 4 complete</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="max-w-5xl mx-auto px-6 py-8 grid lg:grid-cols-[1fr_340px] gap-6">
          {/* ─── Form ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-5"
          >
            {/* ─── Section: Story Details ─── */}
            <FormSection icon={FileText} iconColor="#14B8A6" title="Story Details" subtitle="Tell readers what your book is about">
              {/* Title */}
              <FormField label="Book Title" required>
                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. The Shadow of Dragons..."
                    maxLength={80}
                    className="w-full px-4 py-3.5 rounded-xl text-[15px] font-semibold text-slate-900 bg-white outline-none transition-all"
                    style={{
                      border: '1.5px solid #E2E8F0',
                      boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#14B8A6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.1)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)';
                    }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                    {title.length}/80
                  </span>
                </div>
              </FormField>

              {/* Description */}
              <FormField label="Synopsis / Description" required hint="A great synopsis hooks readers in the first sentence.">
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={5}
                    maxLength={500}
                    placeholder="A brief, captivating summary that hooks readers and gives them a taste of your story..."
                    className="w-full px-4 py-3.5 rounded-xl text-[14px] text-slate-900 bg-white outline-none transition-all resize-none leading-relaxed"
                    style={{
                      border: '1.5px solid #E2E8F0',
                      boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#14B8A6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.1)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)';
                    }}
                  />
                  <span className="absolute right-4 bottom-3 text-[11px] font-bold text-slate-400">
                    {description.length}/500
                  </span>
                </div>
              </FormField>
            </FormSection>

            {/* ─── Section: Genre ─── */}
            <FormSection icon={Sparkles} iconColor="#A855F7" title="Genre" subtitle="Pick the category that best fits your story">
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {GENRES.map(g => {
                  const active = genre === g.value;
                  return (
                    <motion.button
                      key={g.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGenre(g.value)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                      style={{
                        background: active ? `${g.color}14` : '#F8FAFC',
                        border: `1.5px solid ${active ? g.color : '#E2E8F0'}`,
                        boxShadow: active ? `0 4px 12px -2px ${g.color}30` : 'none',
                      }}
                    >
                      <span className="text-[22px]">{g.emoji}</span>
                      <span
                        className="text-[12px] font-bold"
                        style={{ color: active ? g.color : '#475569' }}
                      >
                        {g.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </FormSection>

            {/* ─── Section: Audience & Language ─── */}
            <FormSection icon={Users} iconColor="#3B82F6" title="Audience & Language" subtitle="Who is this story for?">
              <FormField label="Target Audience" required>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AUDIENCES.map(a => {
                    const active = audience === a.value;
                    return (
                      <motion.button
                        key={a.value}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setAudience(a.value)}
                        className="flex flex-col items-start gap-0.5 p-3 rounded-xl text-left transition-all"
                        style={{
                          background: active ? `${a.color}14` : '#F8FAFC',
                          border: `1.5px solid ${active ? a.color : '#E2E8F0'}`,
                          boxShadow: active ? `0 4px 12px -2px ${a.color}30` : 'none',
                        }}
                      >
                        <span
                          className="text-[13px] font-black"
                          style={{ color: active ? a.color : '#0F172A' }}
                        >
                          {a.label}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">{a.sub}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </FormField>

              <FormField label="Language">
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(l => {
                    const active = language === l.value;
                    return (
                      <motion.button
                        key={l.value}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setLanguage(l.value)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-bold transition-all"
                        style={{
                          background: active ? 'rgba(20,184,166,0.1)' : '#F8FAFC',
                          border: `1.5px solid ${active ? '#14B8A6' : '#E2E8F0'}`,
                          color: active ? '#0F766E' : '#475569',
                          boxShadow: active ? '0 2px 8px -2px rgba(20,184,166,0.3)' : 'none',
                        }}
                      >
                        <span className="text-[14px]">{l.flag}</span> {l.label}
                      </motion.button>
                    );
                  })}
                </div>
              </FormField>
            </FormSection>

            {/* ─── Section: Tags ─── */}
            <FormSection icon={Tag} iconColor="#F59E0B" title="Discovery Tags" subtitle="Help readers find your story">
              <FormField label="Search Tags" hint="Separate tags with commas. Use specific keywords that describe your story.">
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="magic, dragons, heroes, epic quest, medieval"
                  className="w-full px-4 py-3.5 rounded-xl text-[14px] text-slate-900 bg-white outline-none transition-all"
                  style={{
                    border: '1.5px solid #E2E8F0',
                    boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#14B8A6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.1)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#E2E8F0';
                    e.target.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)';
                  }}
                />
                {tagList.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-1.5 mt-3"
                  >
                    {tagList.map((t, i) => (
                      <motion.span
                        key={t + i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-semibold"
                        style={{
                          background: 'rgba(20,184,166,0.1)',
                          color: '#0F766E',
                          border: '1px solid rgba(20,184,166,0.2)',
                        }}
                      >
                        #{t}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </FormField>
            </FormSection>

            {/* ─── Section: Content Warnings ─── */}
            <FormSection icon={Shield} iconColor="#EF4444" title="Content Warnings" subtitle="Help parents and readers make informed choices">
              <div className="flex flex-wrap gap-2">
                {WARNINGS.map(w => {
                  const active = warnings.includes(w.label);
                  return (
                    <motion.button
                      key={w.label}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleWarning(w.label)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-bold transition-all"
                      style={{
                        background: active ? `${w.color}14` : '#F8FAFC',
                        border: `1.5px solid ${active ? w.color : '#E2E8F0'}`,
                        color: active ? w.color : '#475569',
                        boxShadow: active ? `0 2px 8px -2px ${w.color}30` : 'none',
                      }}
                    >
                      {active && <AlertTriangle size={12} />}
                      {w.label}
                    </motion.button>
                  );
                })}
              </div>
            </FormSection>
          </motion.div>

          {/* ─── Sidebar: Preview & Submit ─── */}
          <motion.aside
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:sticky lg:top-6 self-start space-y-4"
          >
            {/* Cover preview card */}
            <div
              className="rounded-2xl overflow-hidden border border-slate-200 bg-white"
              style={{ boxShadow: '0 4px 20px -4px rgba(15,23,42,0.08)' }}
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <Eye size={14} className="text-slate-500" />
                <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider">Live Preview</h3>
              </div>

              <div className="p-4">
                {/* Book cover */}
                <div className="relative mx-auto mb-4" style={{ width: 180 }}>
                  <div
                    className="relative rounded-xl overflow-hidden"
                    style={{
                      aspectRatio: '2/3',
                      boxShadow: '0 20px 40px -12px rgba(15,23,42,0.25), 0 4px 8px rgba(15,23,42,0.08)',
                    }}
                  >
                    {storyData.pages[0]?.image_url ? (
                      <img
                        src={storyData.pages[0].image_url}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <ImageIcon size={32} className="text-slate-300" />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.8) 100%)',
                      }}
                    />

                    {/* Cover content */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      {selectedGenre && (
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-white mb-1.5"
                          style={{ background: selectedGenre.color }}
                        >
                          {selectedGenre.emoji} {selectedGenre.label}
                        </span>
                      )}
                      <p className="text-white font-black text-[13px] leading-tight tracking-tight line-clamp-2 drop-shadow-lg">
                        {title || 'Untitled Story'}
                      </p>
                      <p className="text-white/80 text-[10px] font-semibold mt-0.5">
                        by {user?.name || 'Author'}
                      </p>
                    </div>

                    {/* Shine overlay */}
                    <div
                      className="absolute top-0 left-0 w-full h-1/3 pointer-events-none"
                      style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.15), transparent)' }}
                    />
                  </div>

                  {/* Book spine shadow */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                    style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.25), transparent)' }}
                  />
                </div>

                {/* Upload cover button */}
                <button
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-bold text-slate-700 transition-all active:scale-95"
                  style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}
                >
                  <Upload size={12} /> Change Cover
                </button>

                {/* Info rows */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 text-[12px]">
                  <InfoRow label="Pages" value={`${storyData.pages?.length || 0} panels`} />
                  <InfoRow label="Audience" value={selectedAudience?.label} valueColor={selectedAudience?.color} />
                  <InfoRow
                    label="Language"
                    value={LANGUAGES.find(l => l.value === language)?.label}
                  />
                  {warnings.length > 0 && (
                    <InfoRow label="Warnings" value={`${warnings.length} flagged`} valueColor="#EF4444" />
                  )}
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div
              className="rounded-2xl p-4 border border-slate-200 bg-white"
              style={{ boxShadow: '0 4px 20px -4px rgba(15,23,42,0.08)' }}
            >
              <button
                onClick={handlePublish}
                disabled={!title.trim() || !description.trim() || publishing}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[15px] font-black text-white transition-all"
                style={{
                  background: (!title.trim() || !description.trim() || publishing)
                    ? '#94A3B8'
                    : 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)',
                  boxShadow: (!title.trim() || !description.trim() || publishing)
                    ? 'none'
                    : '0 8px 24px -4px rgba(20,184,166,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
                  cursor: (!title.trim() || !description.trim() || publishing) ? 'not-allowed' : 'pointer',
                  opacity: (!title.trim() || !description.trim() || publishing) ? 0.7 : 1,
                }}
                onMouseEnter={e => {
                  if (!(!title.trim() || !description.trim() || publishing)) {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px -4px rgba(20,184,166,0.6), inset 0 1px 0 rgba(255,255,255,0.25)';
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  if (!(!title.trim() || !description.trim() || publishing)) {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px -4px rgba(20,184,166,0.5), inset 0 1px 0 rgba(255,255,255,0.2)';
                  }
                }}
              >
                {publishing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit for Review <ChevronRight size={16} strokeWidth={2.8} />
                  </>
                )}
              </button>

              <div
                className="flex items-start gap-2 mt-3 p-2.5 rounded-lg"
                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
              >
                <Info size={13} className="text-slate-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  By submitting, you agree to our{' '}
                  <a href="#" className="text-teal-600 font-bold hover:underline">Content Guidelines</a>.
                  Review typically takes 24–48 hours.
                </p>
              </div>
            </div>

            {/* Review perks */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(20,184,166,0.08), rgba(59,130,246,0.06))',
                border: '1px solid rgba(20,184,166,0.2)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-wider">
                  What happens next?
                </h4>
              </div>
              <ul className="space-y-2 text-[12px] text-slate-600">
                {[
                  'Our team reviews your story',
                  'You get notified once approved',
                  'Your book goes live on the Hub',
                  'Readers can discover & enjoy it!',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 mt-0.5"
                      style={{ background: 'linear-gradient(135deg, #2DD4BF, #14B8A6)' }}
                    >
                      {i + 1}
                    </div>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.aside>
        </div>
      </div>
    </AppShell>
  );
}

/* ─── Helper Components ─── */
function FormSection({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  children,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200"
      style={{ boxShadow: '0 2px 12px -4px rgba(15,23,42,0.06)' }}
    >
      <div className="flex items-start gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `${iconColor}14`,
            border: `1px solid ${iconColor}25`,
          }}
        >
          <Icon size={18} style={{ color: iconColor }} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[17px] font-black text-slate-900 tracking-tight leading-tight">{title}</h2>
          <p className="text-[13px] text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1 text-[12px] font-black text-slate-700 uppercase tracking-wider mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-[11px] text-slate-500 mt-2 flex items-start gap-1 leading-relaxed">
          <Info size={11} className="flex-shrink-0 mt-0.5" /> {hint}
        </p>
      )}
    </div>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value?: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="font-bold" style={{ color: valueColor || '#0F172A' }}>
        {value || '—'}
      </span>
    </div>
  );
}