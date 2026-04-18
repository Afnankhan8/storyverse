import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Sparkles, Download, Heart,
  Zap, ChevronLeft, ChevronRight,
  Book, Tablet, Wand2, Star, Play,
  MessageCircle, X, Send, History, Globe,
  FileText, Loader2, ChevronDown,
  Trash2, Eye, Printer, Volume2, StopCircle
} from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import AppShell from '../components/AppShell';
import { theme, ComicCard, FlipSpread } from '../components/Theme';

const API_URL = 'http://127.0.0.1:8000/api/story';



/* ── AI SUMMARIZER (themed) ── */
function AISummarizer({ comic }: { comic: any }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateSummary = async () => {
    if (generated && summary) { setExpanded(e => !e); return; }
    setLoading(true); setExpanded(true);
    try {
      const storyText = comic.pages?.map((p: any, i: number) => `Panel ${i + 1}: ${p.action || ''} ${p.line_1 ? `"${p.line_1}"` : ''}`).join(' | ');
      const res = await axios.post(`${API_URL}/chat`, { message: `Summarize this comic in 3 fun sentences: ${storyText}`, story_context: comic });
      setSummary(res.data.reply);
      setGenerated(true);
    } catch { setSummary('✨ An epic adventure unfolds across these panels! A story to remember!'); setGenerated(true); }
    setLoading(false);
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlaying) { window.speechSynthesis.cancel(); setIsPlaying(false); }
    else { const utterance = new SpeechSynthesisUtterance(summary); utterance.onend = () => setIsPlaying(false); window.speechSynthesis.speak(utterance); setIsPlaying(true); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ marginBottom: '2rem', overflow: 'hidden' }}>
      <button onClick={generateSummary} style={{ width: '100%', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', cursor: 'pointer', color: theme.colors.text.primary }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: theme.radius.md, background: theme.colors.gradient.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={16} color="#fff" /></div>
          <div style={{ textAlign: 'left' }}><div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.875rem', letterSpacing: '2px' }}>AI STORY SUMMARIZER</div><div style={{ fontSize: '0.75rem', color: theme.colors.text.muted }}>{generated ? 'Click to toggle' : 'Generate recap'}</div></div>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }}><ChevronDown size={18} color={theme.colors.text.muted} /></motion.div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', borderTop: `1px solid ${theme.colors.border.base}` }}>
            <div style={{ padding: '1rem 1.5rem 1.5rem' }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Loader2 size={18} color={theme.colors.primary} style={{ animation: 'spin 1s linear infinite' }} /><span style={{ color: theme.colors.text.muted }}>Analyzing panels...</span></div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: theme.colors.surface.base, padding: '0.5rem 0.75rem', borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border.base}` }}><span style={{ fontSize: '0.7rem', color: theme.colors.text.muted }}>Read time</span><br /><span style={{ fontWeight: 'bold' }}>~{Math.max(1, Math.round(summary.split(' ').length / 130))} min</span></div>
                    <button onClick={toggleSpeech} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>{isPlaying ? <StopCircle size={14} /> : <Volume2 size={14} />} {isPlaying ? 'Stop' : 'Listen'}</button>
                  </div>
                  <p style={{ lineHeight: 1.6, color: theme.colors.text.secondary }}>{summary}</p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── CHATBOT (themed) ── */
function Chatbot({ comic }: { comic: any }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([{ role: 'bot', text: `👋 I'm your story guide! Ask me about ${comic?.ingredients?.hero_name || 'the hero'}!` }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text }]);
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/chat`, { message: text, story_context: comic });
      setMessages(m => [...m, { role: 'bot', text: res.data.reply }]);
    } catch { setMessages(m => [...m, { role: 'bot', text: "Oops! Couldn't reach the story world. 🌟" }]); }
    setLoading(false);
  };

  return (
    <div className="no-print">
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setOpen(o => !o)} style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1000, width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer', background: theme.colors.gradient.primary, boxShadow: theme.shadows.glow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {open ? <X size={24} color="#fff" /> : <MessageCircle size={24} color="#fff" />}
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ type: 'spring', damping: 25 }} style={{ position: 'fixed', bottom: '5rem', right: '1.5rem', width: '340px', height: '480px', background: theme.colors.bg.secondary, border: `1px solid ${theme.colors.border.base}`, borderRadius: theme.radius.xl, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: theme.shadows.xl, zIndex: 999 }}>
            <div style={{ padding: '1rem', background: theme.colors.surface.base, borderBottom: `1px solid ${theme.colors.border.base}`, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: theme.radius.md, background: theme.colors.gradient.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={14} color="#fff" /></div>
              <div><div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: '2px' }}>STORY GUIDE</div><div style={{ fontSize: '0.7rem', color: theme.colors.text.muted }}>Online · Ask me anything!</div></div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '80%', padding: '0.5rem 1rem', borderRadius: msg.role === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem', background: msg.role === 'user' ? theme.colors.gradient.primary : theme.colors.surface.base, border: msg.role === 'bot' ? `1px solid ${theme.colors.border.base}` : 'none', fontSize: '0.875rem', color: theme.colors.text.primary }}>{msg.text}</div>
                </div>
              ))}
              {loading && <div style={{ display: 'flex', gap: '0.25rem', padding: '0.5rem' }}><span className="dot-flashing" /></div>}
              <div ref={bottomRef} />
            </div>
            <div style={{ padding: '0.75rem', borderTop: `1px solid ${theme.colors.border.base}`, display: 'flex', gap: '0.5rem' }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask about the story…" style={{ flex: 1, padding: '0.5rem 1rem', borderRadius: theme.radius.full, background: theme.colors.surface.base, border: `1px solid ${theme.colors.border.base}`, color: theme.colors.text.primary, outline: 'none' }} />
              <motion.button whileTap={{ scale: 0.95 }} onClick={send} style={{ width: 36, height: 36, borderRadius: '50%', background: theme.colors.gradient.primary, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send size={14} color="#fff" /></motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── HISTORY SIDEBAR (themed) ── */
function HistorySidebar({ history, open, onClose, onLoad, onDelete }: { history: any[]; open: boolean; onClose: () => void; onLoad: (comic: any) => void; onDelete: (id: string) => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200 }} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30 }} style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '380px', background: theme.colors.bg.secondary, borderLeft: `1px solid ${theme.colors.border.base}`, zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: theme.shadows.xl }}>
            <div style={{ padding: '1.5rem', borderBottom: `1px solid ${theme.colors.border.base}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><History size={20} color={theme.colors.primary} /><span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '2px' }}>MY COMICS</span></div>
              <button onClick={onClose} style={{ background: theme.colors.surface.base, border: `1px solid ${theme.colors.border.base}`, borderRadius: theme.radius.md, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}><Sparkles size={40} color={theme.colors.text.muted} /><p style={{ marginTop: '1rem', color: theme.colors.text.muted }}>No comics yet. Create your first adventure!</p></div>
              ) : (
                history.map(item => (
                  <div key={item.id} className="glass-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div><h4 style={{ fontWeight: 700 }}>{item.title}</h4><p style={{ fontSize: '0.75rem', color: theme.colors.text.muted }}>{new Date(item.createdAt).toLocaleDateString()} · {item.panelCount} panels</p></div>
                      <button onClick={() => onDelete(item.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.colors.danger }}><Trash2 size={16} /></button>
                    </div>
                    <button onClick={() => { onLoad(item.comic); onClose(); }} className="btn-secondary" style={{ width: '100%', marginTop: '0.75rem', padding: '0.5rem', fontSize: '0.75rem' }}><Eye size={14} /> Read Again</button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── GENERATING SCREEN (themed with landing page style) ── */
function GeneratingScreen() {
  const steps = [
    { label: 'ANALYSING YOUR STORY', sub: 'Understanding characters & world', icon: '📖', color: theme.colors.gradient.primary },
    { label: 'WRITING DIALOGUE', sub: 'Crafting speech for each panel', icon: '✍️', color: theme.colors.gradient.secondary },
    { label: 'GENERATING ARTWORK', sub: 'Rendering cinematic illustrations', icon: '🎨', color: theme.colors.gradient.panel3 },
    { label: 'FINAL ASSEMBLY', sub: 'Compositing your comic book', icon: '⚡', color: theme.colors.gradient.panel4 },
  ];
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const stepTimer = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 5500);
    const progressTimer = setInterval(() => setProgress(p => Math.min(p + 0.3, 95)), 180);
    return () => { clearInterval(stepTimer); clearInterval(progressTimer); };
  }, []);
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '540px', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 2rem' }}>
          <motion.div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${theme.colors.primary}`, borderTopColor: 'transparent' }} animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, }} />
          <div style={{ position: 'absolute', inset: '30px', borderRadius: '50%', background: theme.colors.gradient.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: theme.shadows.glow }}><span style={{ fontSize: '2rem' }}>{steps[step].icon}</span></div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <h3 className="heading-md" style={{ background: steps[step].color, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{steps[step].label}</h3>
            <p style={{ color: theme.colors.text.muted }}>{steps[step].sub}</p>
          </motion.div>
        </AnimatePresence>
        <div style={{ width: '100%', height: '4px', background: theme.colors.surface.base, borderRadius: theme.radius.full, marginTop: '2rem' }}>
          <motion.div style={{ width: `${progress}%`, height: '100%', background: theme.colors.gradient.primary, borderRadius: theme.radius.full }} transition={{ duration: 0.3 }} />
        </div>
        <p style={{ marginTop: '1rem', fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', letterSpacing: '2px', color: theme.colors.text.muted }}>{Math.round(progress)}% COMPLETE</p>
      </div>
    </div>
  );
}

/* ── MAIN COMIC CREATOR COMPONENT (fully themed) ── */
interface ComicCreatorProps { user: { name: string; email: string }; onLogout: () => void; }
interface ComicHistoryItem { id: string; title: string; createdAt: string; heroName: string; mood: string; panelCount: number; comic: any; }

export default function ComicCreator({ user, onLogout }: ComicCreatorProps) {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [comic, setComic] = useState<any>(null);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'flipbook' | 'scroll'>('scroll');
  const [history, setHistory] = useState<ComicHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const loadHistory = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const comicsRef = collection(db, 'users', currentUser.uid, 'comics');
      const q = query(comicsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ComicHistoryItem)));
    } else setHistory([]);
  };
  useEffect(() => { loadHistory(); const unsub = auth.onAuthStateChanged(() => loadHistory()); return () => unsub(); }, []);


  const generateComic = async () => {
    if (!input.trim()) { setError('Please describe your story idea first!'); return; }
    setGenerating(true); setError('');
    try {
      const res = await axios.post(`${API_URL}/generate`, { user_input: input });
      setComic(res.data); setCurrentPage(0); setViewMode('scroll');
      const currentUser = auth.currentUser;
      if (currentUser) {
        await addDoc(collection(db, 'users', currentUser.uid, 'comics'), {
          title: `${res.data.ingredients?.hero_name || 'Your'}'s Adventure`,
          createdAt: new Date().toISOString(),
          heroName: res.data.ingredients?.hero_name || 'Unknown',
          mood: res.data.ingredients?.mood || 'epic',
          panelCount: res.data.pages?.length || 0,
          comic: res.data,
        });
        await loadHistory();
      }
    } catch (err: any) { setError(err.code === 'ERR_NETWORK' ? 'Backend offline — start port 8000' : 'Generation failed. Try again!'); }
    setGenerating(false);
  };

  const deleteComic = async (id: string) => {
    const currentUser = auth.currentUser;
    if (currentUser) { await deleteDoc(doc(db, 'users', currentUser.uid, 'comics', id)); await loadHistory(); }
  };

  const nextPage = () => { if (currentPage < (comic?.pages?.length || 0) - 1) setCurrentPage(p => p + 1); };
  const prevPage = () => { if (currentPage > 0) setCurrentPage(p => p - 1); };
  useEffect(() => { const handler = (e: KeyboardEvent) => { if (viewMode === 'flipbook') { if (e.key === 'ArrowRight') nextPage(); if (e.key === 'ArrowLeft') prevPage(); } }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); }, [viewMode, currentPage, comic]);

  const handleDownloadText = () => {
    const txt = comic?.pages?.map((p: any, i: number) => `[Panel ${i + 1}]\n${p.action || ''}\n${p.line_1 ? `"${p.line_1}"` : ''}`).join('\n\n') || '';
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' })); a.download = `${comic?.ingredients?.hero_name || 'comic'}_story.txt`; a.click();
  };
  const handlePrintPDF = () => { setViewMode('scroll'); setTimeout(() => window.print(), 300); };

  const examples = [
    { emoji: '⚡', label: 'Thunder Boy', text: 'I am Ryo, a boy who controls thunder! I must stop the Shadow Dragon from destroying Tokyo before midnight!' },
    { emoji: '🌸', label: 'Magical Girl', text: 'I am Sakura, a magical girl who discovers her powers in an ancient cherry blossom forest full of fox spirits!' },
    { emoji: '⚔️', label: 'Time Samurai', text: 'I am Kaito, a young samurai who finds an ancient sword that lets me travel through time to fix the past!' },
    { emoji: '🚀', label: 'Space Pilot', text: 'I am Nova, an ace space pilot racing through an asteroid field to rescue my robot companion from space pirates!' },
  ];

  return (
    <AppShell user={user} onLogout={onLogout}>
      <HistorySidebar history={history} open={showHistory} onClose={() => setShowHistory(false)} onLoad={(c) => { setComic(c); setCurrentPage(0); setLiked(false); }} onDelete={deleteComic} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <AnimatePresence mode="wait">
          {!comic && !generating && (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>
              <div className="container" style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <span className="badge"><Sparkles size={14} /> AI COMIC STUDIO</span>
                  <h1 className="heading-xl" style={{ marginTop: '1rem' }}>Create Your <span className="text-gradient">Epic Comic</span></h1>
                  <p style={{ color: theme.colors.text.muted, maxWidth: '600px', margin: '1rem auto' }}>Describe your hero's adventure — our AI writes the script and draws every panel in seconds.</p>
                  <button onClick={() => setShowHistory(true)} className="btn-secondary" style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    <History size={14} /> View My Saved Comics {history.length > 0 && `(${history.length})`}
                  </button>
                </div>
                <div className="glass-card" style={{ padding: '2rem' }}>
                  <textarea rows={5} className="story-input" style={{ width: '100%', padding: '1rem', borderRadius: theme.radius.md, background: theme.colors.surface.base, border: `1px solid ${theme.colors.border.base}`, color: theme.colors.text.primary, fontSize: '1rem', resize: 'vertical' }} placeholder="I am Ryo, a boy who controls lightning. I must stop the Shadow Dragon before midnight..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => (e.metaKey || e.ctrlKey) && e.key === 'Enter' && generateComic()} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.75rem', margin: '1.5rem 0' }}>
                    {examples.map(ex => (
                      <button key={ex.label} onClick={() => setInput(ex.text)} className="btn-secondary" style={{ justifyContent: 'flex-start', gap: '0.75rem', textAlign: 'left' }}><span style={{ fontSize: '1.5rem' }}>{ex.emoji}</span> {ex.label}</button>
                    ))}
                  </div>
                  {error && <div style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: theme.radius.md, background: 'rgba(239,68,68,0.1)', border: `1px solid ${theme.colors.danger}`, color: theme.colors.danger }}>{error}</div>}
                  <button onClick={generateComic} className="btn-primary" style={{ width: '100%' }}><Wand2 size={18} /> Generate My Comic</button>
                  <p style={{ marginTop: '1rem', fontSize: '0.75rem', textAlign: 'center', color: theme.colors.text.muted }}>⌘ + Enter to generate</p>
                </div>
              </div>
            </motion.div>
          )}

          {generating && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GeneratingScreen />
            </motion.div>
          )}

          {comic && !generating && (
            <motion.div key="comic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
              <AISummarizer comic={comic} />

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                  <div className="badge" style={{ marginBottom: '0.75rem' }}><Star size={14} /> Now Reading</div>
                  <h2 className="heading-lg">{comic.ingredients?.hero_name || 'Your'}<span className="text-gradient"> Adventure</span></h2>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}><Zap size={14} color={theme.colors.text.muted} /> {comic.pages?.length} panels · {comic.ingredients?.mood || 'Epic'}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '0.25rem', background: theme.colors.surface.base, borderRadius: theme.radius.full, padding: '0.25rem' }}>
                    <button onClick={() => setViewMode('scroll')} className={`tab-btn ${viewMode === 'scroll' ? 'tab-active' : 'tab-inactive'}`} style={{ padding: '0.5rem 1rem', borderRadius: theme.radius.full }}><Tablet size={14} /> Scroll</button>
                    <button onClick={() => setViewMode('flipbook')} className={`tab-btn ${viewMode === 'flipbook' ? 'tab-active' : 'tab-inactive'}`} style={{ padding: '0.5rem 1rem', borderRadius: theme.radius.full }}><Book size={14} /> Flipbook</button>
                  </div>
                  <button onClick={() => setLiked(l => !l)} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}><Heart size={14} color={liked ? theme.colors.danger : undefined} fill={liked ? theme.colors.danger : 'none'} /> {liked ? 'Liked' : 'Like'}</button>
                  <button onClick={handlePrintPDF} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}><Printer size={14} /> Print</button>
                  <button onClick={() => setShowHistory(true)} className="btn-secondary no-print" style={{ marginBottom: '1rem' }}><History size={18} /> My Comics</button>
                  <button onClick={handleDownloadText} className="btn-secondary no-print"><Download size={18} /> Script</button>
                  <button onClick={() => navigate('/publish/new', { state: { story: comic } })} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    <Globe size={14} /> Publish to Hub
                  </button>
                </div>
              </div>


              {viewMode === 'flipbook' && (
                <div style={{ position: 'relative' }}>
                  <AnimatePresence mode="wait">
                    <motion.div key={currentPage} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                      <FlipSpread panel={comic.pages[currentPage]} pageNum={currentPage + 1} totalPages={comic.pages.length} />
                    </motion.div>
                  </AnimatePresence>
                  <button onClick={prevPage} disabled={currentPage === 0} className="page-nav" style={{ position: 'absolute', left: '-1rem', top: '50%', transform: 'translateY(-50%)', background: theme.colors.surface.base, border: `1px solid ${theme.colors.border.base}`, borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
                  <button onClick={nextPage} disabled={currentPage >= comic.pages.length - 1} className="page-nav" style={{ position: 'absolute', right: '-1rem', top: '50%', transform: 'translateY(-50%)', background: theme.colors.surface.base, border: `1px solid ${theme.colors.border.base}`, borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRight size={20} /></button>
                  <div style={{ textAlign: 'center', marginTop: '2rem' }}><span style={{ fontSize: '0.75rem', color: theme.colors.text.muted }}>PANEL {currentPage + 1} / {comic.pages.length} · Use arrow keys</span></div>
                </div>
              )}

              {viewMode === 'scroll' && (
                <div className="glass-card" style={{ overflow: 'hidden', padding: '1rem' }}>
                  {comic.pages?.map((panel: any, idx: number) => <ComicCard key={idx} panel={panel} idx={idx} />)}
                  <div style={{ textAlign: 'center', padding: '1rem', borderTop: `1px solid ${theme.colors.border.base}`, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '4px', color: theme.colors.text.light }}>— THE END —</div>
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <button onClick={() => { setComic(null); setInput(''); }} className="btn-primary"><Play size={18} /> Create Another Comic</button>
              </div>

              <Chatbot comic={comic} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}