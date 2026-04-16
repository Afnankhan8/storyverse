import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Sparkles, LogOut, Download, Heart,
  Zap, User, ChevronLeft, ChevronRight,
  Book, Tablet, Wand2, Star, Play,
  MessageCircle, X, Send, History,
  FileText, Loader2, Clock, ChevronDown,
  Trash2, Eye, Printer, Volume2, StopCircle, VolumeX
} from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

const API_URL = 'https://comixnova-api.onrender.com/api/story';

interface ComicCreatorProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

interface ComicHistoryItem {
  id: string;
  title: string;
  createdAt: string;
  heroName: string;
  mood: string;
  panelCount: number;
  comic: any;
}

const ACCENT_SETS = [
  { accent: '#8B5CF6', light: '#f3f0ff', sfx: '#EC4899', bg: '#1a1030' },
  { accent: '#EC4899', light: '#fdf0f7', sfx: '#8B5CF6', bg: '#2d0f20' },
  { accent: '#06B6D4', light: '#e8faff', sfx: '#8B5CF6', bg: '#052830' },
  { accent: '#A78BFA', light: '#f5f0ff', sfx: '#06B6D4', bg: '#160e30' },
];

/* ── FIRESTORE HELPERS ── */
async function loadHistoryFromFirestore(userId: string): Promise<ComicHistoryItem[]> {
  try {
    const comicsRef = collection(db, 'users', userId, 'comics');
    const q = query(comicsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ComicHistoryItem));
  } catch (error) {
    console.error('Failed to load history from Firestore:', error);
    return [];
  }
}

async function saveComicToFirestore(userId: string, comic: any): Promise<string> {
  const item: Omit<ComicHistoryItem, 'id'> = {
    title: `${comic.ingredients?.hero_name || 'Unknown'}'s Adventure`,
    createdAt: new Date().toISOString(),
    heroName: comic.ingredients?.hero_name || 'Unknown',
    mood: comic.ingredients?.mood || 'adventure',
    panelCount: comic.pages?.length || 0,
    comic,
  };
  const comicsRef = collection(db, 'users', userId, 'comics');
  const docRef = await addDoc(comicsRef, item);
  return docRef.id;
}

async function deleteComicFromFirestore(userId: string, comicId: string) {
  const comicRef = doc(db, 'users', userId, 'comics', comicId);
  await deleteDoc(comicRef);
}

/* ── COMIC PANEL (unchanged) ── */
function ComicCard({ panel, idx }: { panel: any; idx: number }) {
  const c = ACCENT_SETS[idx % 4];
  return (
    <div className="comic-panel-print" style={{
      position: 'relative', border: '2px solid #111',
      borderRadius: '8px', overflow: 'hidden', background: '#0a0a0a',
      boxShadow: '0 8px 32px rgba(139,92,246,0.15)', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        position: 'relative', width: '100%', flexShrink: 0,
        background: panel?.image_url ? '#0a0a0a' : `linear-gradient(145deg, ${c.bg}, #0a0a0a)`,
        display: 'flex', flexDirection: 'column'
      }}>
        {panel?.image_url ? (
          <img src={panel.image_url} alt={`Panel ${idx + 1}`}
            style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} />
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '120px 40px',
            background: `linear-gradient(145deg, ${c.bg}, #0a0a0a)`,
            minHeight: '300px'
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎨</div>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '13px', letterSpacing: '6px', color: c.accent }}>ART RENDERING…</span>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
            <div style={{
              background: `linear-gradient(135deg, ${c.accent}, ${c.sfx})`,
              color: '#fff', fontFamily: "'Bebas Neue', sans-serif", fontSize: '15px',
              letterSpacing: '2px', padding: '4px 12px', borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)'
            }}>
              #{String(idx + 1).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── FLIPBOOK ── */
function FlipSpread({ panel, pageNum, totalPages }: { panel: any; pageNum: number; totalPages: number }) {
  return (
    <div style={{ background: '#0f0f1a', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(139,92,246,0.2)', boxShadow: '0 40px 100px rgba(0,0,0,0.9), 0 0 60px rgba(139,92,246,0.08)' }}>
      <div style={{ background: 'linear-gradient(135deg, #0a0a14, #111120)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(139,92,246,0.12)' }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '14px', letterSpacing: '8px', background: 'linear-gradient(90deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>comixnova</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['#8B5CF6', '#EC4899', '#06B6D4'].map((c, i) => (
            <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}` }} />
          ))}
        </div>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '13px', letterSpacing: '5px', color: 'rgba(255,255,255,0.3)' }}>PANEL {pageNum} / {totalPages}</span>
      </div>
      <div style={{ padding: '10px', background: '#111120' }}>
        {panel && <ComicCard panel={panel} idx={pageNum - 1} />}
      </div>
      <div style={{ background: 'linear-gradient(135deg, #0a0a14, #111120)', padding: '10px', textAlign: 'center', borderTop: '1px solid rgba(139,92,246,0.12)' }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '11px', letterSpacing: '10px', color: 'rgba(139,92,246,0.3)' }}>— TO BE CONTINUED —</span>
      </div>
    </div>
  );
}

/* ── AI SUMMARIZER ── */
function AISummarizer({ comic }: { comic: any }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const readTime = Math.max(1, Math.round(summary.split(' ').length / 130));
  const intensity = comic.pages?.filter((p:any) => p.sound_effect || (p.action && p.action.includes('!'))).length > 2 ? 'High ⚡' : 'Moderate 🌟';

  const generateSummary = async () => {
    if (generated && summary) { setExpanded(e => !e); return; }
    setLoading(true); setExpanded(true);
    try {
      const storyText = comic.pages?.map((p: any, i: number) =>
        `Panel ${i + 1}: ${p.action || ''} ${p.line_1 ? `"${p.line_1}"` : ''} ${p.line_2 ? `"${p.line_2}"` : ''}`
      ).join(' | ');
      const res = await axios.post(`${API_URL}/chat`, {
        message: `Please write a fun 3-sentence story summary of this comic for a child. Make it exciting and capture the adventure! Story: ${storyText}`,
        story_context: comic,
      });
      setSummary(res.data.reply);
      setGenerated(true);
    } catch {
      setSummary('✨ An epic adventure unfolds across these panels! Our hero faces incredible challenges with courage and heart. A story that will be remembered forever!');
      setGenerated(true);
    }
    setLoading(false);
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return alert('Text-to-speech is not supported in your browser.');
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(summary);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="no-print"
      style={{
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.05))',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: '16px', overflow: 'hidden',
      }}
    >
      <button
        onClick={generateSummary}
        style={{
          width: '100%', padding: '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'transparent', border: 'none', cursor: 'pointer', color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(139,92,246,0.4)',
          }}>
            <FileText size={16} color="#fff" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '16px', letterSpacing: '3px', background: 'linear-gradient(90deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI STORY SUMMARIZER
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
              {generated ? 'Click to toggle summary' : 'Generate a story recap & insights'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!generated && (
            <span style={{
              padding: '4px 12px', borderRadius: '100px',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 700,
              color: '#fff', letterSpacing: '1px',
            }}>GENERATE</span>
          )}
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown size={18} color="rgba(255,255,255,0.4)" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 24px 20px', borderTop: '1px solid rgba(139,92,246,0.1)' }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px' }}>
                  <Loader2 size={18} color="#8B5CF6" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Analyzing panels & extracting story...</span>
                </div>
              ) : (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ background: 'rgba(139,92,246,0.1)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                       <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '2px' }}>Est. Read Time</span>
                       <span style={{ fontSize: '13px', fontWeight: 'bold' }}>~{readTime} Min</span>
                    </div>
                    <div style={{ background: 'rgba(236,72,153,0.1)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(236,72,153,0.2)' }}>
                       <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '2px' }}>Action Intensity</span>
                       <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{intensity}</span>
                    </div>
                    <button onClick={toggleSpeech} style={{ background: 'rgba(6,182,212,0.1)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.2)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                       {isPlaying ? <StopCircle size={16} color="#06B6D4"/> : <Volume2 size={16} color="#06B6D4"/>}
                       <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{isPlaying ? 'Stop' : 'Listen'}</span>
                    </button>
                  </div>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '15px', lineHeight: 1.8, color: '#f0f0f0',
                    padding: '16px', background: 'rgba(139,92,246,0.06)',
                    borderRadius: '10px', border: '1px solid rgba(139,92,246,0.1)',
                  }}>
                    {summary}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── CHATBOT (unchanged) ── */
function Chatbot({ comic }: { comic: any }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: `Hi! 👋 I'm your story guide! Ask me anything about ${comic?.ingredients?.hero_name || 'the hero'}'s adventure!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const speakText = (text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.1;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const toggleTTS = () => {
    if (ttsEnabled) window.speechSynthesis.cancel();
    setTtsEnabled(!ttsEnabled);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text }]);
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/chat`, { message: text, story_context: comic });
      const reply = res.data.reply;
      setMessages(m => [...m, { role: 'bot', text: reply }]);
      speakText(reply);
    } catch {
      const errorReply = "Oops! I couldn't reach the story world. Try again! 🌟";
      setMessages(m => [...m, { role: 'bot', text: errorReply }]);
      speakText(errorReply);
    }
    setLoading(false);
  };

  return (
    <div className="no-print">
      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 1000,
          width: 60, height: 60, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
          boxShadow: '0 8px 32px rgba(139,92,246,0.5), 0 0 0 4px rgba(139,92,246,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X size={24} color="#fff" /></motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><MessageCircle size={24} color="#fff" /></motion.div>
          }
        </AnimatePresence>
        {!open && (
          <span style={{
            position: 'absolute', top: -4, right: -4, width: 18, height: 18,
            borderRadius: '50%', background: '#06B6D4',
            border: '2px solid #07070D',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 700, color: '#fff',
          }}>AI</span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{
              position: 'fixed', bottom: '100px', right: '28px', zIndex: 999,
              width: '340px', height: '480px',
              background: '#0f0f1a',
              border: '1px solid rgba(139,92,246,0.25)',
              borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 40px rgba(139,92,246,0.12)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{
              padding: '16px 20px', background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.08))',
              borderBottom: '1px solid rgba(139,92,246,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(139,92,246,0.4)',
                }}>
                  <Sparkles size={16} color="#fff" />
                </div>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '16px', letterSpacing: '3px', color: 'white' }}>STORY GUIDE</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#06B6D4', boxShadow: '0 0 6px #06B6D4' }} />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Online · Ask me anything!</span>
                  </div>
                </div>
              </div>
              <button onClick={toggleTTS} style={{
                background: ttsEnabled ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${ttsEnabled ? 'rgba(6, 182, 212, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: ttsEnabled ? '#06B6D4' : 'rgba(255,255,255,0.5)',
                borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex'
              }} title={ttsEnabled ? "Mute Bot Voice" : "Enable Bot Voice"}>
                {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
                >
                  <div style={{
                    maxWidth: '80%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #8B5CF6, #EC4899)'
                      : 'rgba(139,92,246,0.1)',
                    border: msg.role === 'bot' ? '1px solid rgba(139,92,246,0.2)' : 'none',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '13px', lineHeight: 1.6,
                    color: msg.role === 'user' ? '#fff' : 'rgba(255,255,255,0.85)',
                  }}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '10px 14px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '16px 16px 16px 4px', width: 'fit-content' }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                      style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6' }} />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(139,92,246,0.1)', display: 'flex', gap: '8px' }}>
              <input
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') send(); }}
                placeholder="Ask about the story…"
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '100px',
                  background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)',
                  color: 'rgba(255,255,255,0.9)', fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
                  outline: 'none',
                }}
              />
              <motion.button whileTap={{ scale: 0.9 }} onClick={send}
                style={{
                  width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                <Send size={15} color="#fff" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── HISTORY SIDEBAR ── */
function HistorySidebar({
  history, open, onClose, onLoad, onDelete
}: {
  history: ComicHistoryItem[];
  open: boolean;
  onClose: () => void;
  onLoad: (comic: any) => void;
  onDelete: (id: string) => void;
}) {
  const moodColors: Record<string, string> = {
    adventure: '#8B5CF6', mystery: '#06B6D4', funny: '#F59E0B',
    magical: '#EC4899', spooky: '#6366F1',
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="no-print">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, backdropFilter: 'blur(4px)' }}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 280 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: '380px', zIndex: 201,
              background: '#0a0a14', borderLeft: '1px solid rgba(139,92,246,0.2)',
              display: 'flex', flexDirection: 'column',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.8)',
            }}
          >
            <div style={{
              padding: '24px 24px 20px', borderBottom: '1px solid rgba(139,92,246,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08), transparent)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <History size={16} color="#fff" />
                </div>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '4px', color: 'white' }}>MY COMICS</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{history.length} saved adventures</div>
                </div>
              </div>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', letterSpacing: '3px', color: 'rgba(255,255,255,0.3)' }}>NO COMICS YET</div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.2)', marginTop: '8px' }}>Create your first comic to see it here!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {history.map((item, i) => (
                    <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      style={{
                        background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.12)',
                        borderRadius: '12px', padding: '14px 16px',
                        display: 'flex', flexDirection: 'column', gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '16px', letterSpacing: '2px', color: 'white', lineHeight: 1.1 }}>{item.title}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                            <span style={{
                              padding: '2px 8px', borderRadius: '100px',
                              background: `${moodColors[item.mood] || '#8B5CF6'}22`,
                              border: `1px solid ${moodColors[item.mood] || '#8B5CF6'}44`,
                              fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600,
                              color: moodColors[item.mood] || '#8B5CF6', textTransform: 'capitalize',
                            }}>{item.mood}</span>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Zap size={10} /> {item.panelCount} panels
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <Clock size={10} color="rgba(255,255,255,0.2)" />
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>
                              {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <button onClick={() => onDelete(item.id)}
                          style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.15)', borderRadius: '8px', width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(236,72,153,0.5)', flexShrink: 0 }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <button onClick={() => { onLoad(item.comic); onClose(); }}
                        style={{
                          width: '100%', padding: '8px', borderRadius: '8px', cursor: 'pointer',
                          background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.08))',
                          border: '1px solid rgba(139,92,246,0.2)',
                          fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 700,
                          color: 'rgba(139,92,246,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          letterSpacing: '0.5px',
                        }}>
                        <Eye size={12} /> Read Again
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── LOADING SCREEN ── */
function GeneratingScreen() {
  const steps = [
    { label: 'Analysing Your Story', sub: 'Understanding characters & world', icon: '📖', color: '#8B5CF6' },
    { label: 'Writing Dialogue', sub: 'Crafting speech for each panel', icon: '✍️', color: '#EC4899' },
    { label: 'Generating Artwork', sub: 'Rendering cinematic illustrations', icon: '🎨', color: '#06B6D4' },
    { label: 'Final Assembly', sub: 'Compositing your comic book', icon: '⚡', color: '#A78BFA' },
  ];
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 5500);
    const progressTimer = setInterval(() => setProgress(p => Math.min(p + 0.3, 95)), 180);
    const tickTimer = setInterval(() => setTick(t => t + 1), 600);
    return () => { clearInterval(stepTimer); clearInterval(progressTimer); clearInterval(tickTimer); };
  }, []);

  const orbitAngle = (tick * 36) % 360;

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: '540px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'relative', width: '170px', height: '170px', margin: '0 auto 60px' }}>
          {[0, 1, 2].map(i => (
            <motion.div key={i} style={{ position: 'absolute', inset: `${i * 18}px`, borderRadius: '50%', border: '2px solid transparent', borderTopColor: ['#8B5CF6', '#EC4899', '#06B6D4'][i], borderRightColor: ['rgba(139,92,246,0.3)', 'rgba(236,72,153,0.3)', 'rgba(6,182,212,0.3)'][i] }}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{ duration: 1.8 + i * 0.7, repeat: Infinity, ease: 'linear' }} />
          ))}
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '170px', height: '170px', transform: `translate(-50%, -50%) rotate(${orbitAngle}deg)`, transition: 'transform 0.6s linear' }}>
            <div style={{ position: 'absolute', top: '0', left: '50%', width: 12, height: 12, borderRadius: '50%', marginLeft: -6, marginTop: -6, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 0 14px rgba(139,92,246,1), 0 0 28px rgba(236,72,153,0.6)' }} />
          </div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '130px', height: '130px', transform: `translate(-50%, -50%) rotate(${-orbitAngle * 1.5}deg)`, transition: 'transform 0.6s linear' }}>
            <div style={{ position: 'absolute', top: '0', left: '50%', width: 8, height: 8, borderRadius: '50%', marginLeft: -4, marginTop: -4, background: '#06B6D4', boxShadow: '0 0 10px rgba(6,182,212,1)' }} />
          </div>
          <div style={{ position: 'absolute', inset: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #EC4899, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(139,92,246,0.7), 0 0 60px rgba(236,72,153,0.3), inset 0 0 20px rgba(255,255,255,0.1)' }}>
            <AnimatePresence mode="wait">
              <motion.span key={step} initial={{ opacity: 0, scale: 0.4, rotate: -30 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.4, rotate: 30 }} transition={{ duration: 0.45, type: 'spring' }} style={{ fontSize: '28px', lineHeight: 1 }}>
                {steps[step].icon}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -24, filter: 'blur(8px)' }} transition={{ duration: 0.5 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '38px', letterSpacing: '5px', background: `linear-gradient(135deg, ${steps[step].color}, #EC4899)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px' }}>{steps[step].label}</div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px', color: 'rgba(255,255,255,0.4)', marginBottom: '50px' }}>{steps[step].sub}</p>
          </motion.div>
        </AnimatePresence>
        <div style={{ width: '100%', height: '5px', background: 'rgba(139,92,246,0.1)', borderRadius: '3px', overflow: 'hidden', marginBottom: '28px', border: '1px solid rgba(139,92,246,0.15)' }}>
          <motion.div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #8B5CF6, #EC4899, #06B6D4)', borderRadius: '3px', boxShadow: '0 0 20px rgba(139,92,246,0.8), 0 0 40px rgba(236,72,153,0.4)' }} transition={{ duration: 0.3 }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
          {steps.map((s, i) => (
            <motion.div key={i} animate={{ scale: i === step ? 1.08 : 1, opacity: i <= step ? 1 : 0.4 }} transition={{ duration: 0.3 }}
              style={{ padding: '6px 14px', borderRadius: '100px', fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600, color: i <= step ? '#fff' : 'rgba(255,255,255,0.3)', background: i <= step ? `linear-gradient(135deg, ${s.color}, #EC4899)` : 'rgba(255,255,255,0.06)', border: `1px solid ${i <= step ? s.color + '55' : 'rgba(255,255,255,0.08)'}`, letterSpacing: '0.5px', boxShadow: i === step ? `0 4px 16px ${s.color}55` : 'none' }}>
              {i < step ? `${s.icon} ✓` : `${s.icon} 0${i + 1}`}
            </motion.div>
          ))}
        </div>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', letterSpacing: '4px', background: 'linear-gradient(90deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {Math.round(progress)}% COMPLETE
        </p>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ── */
export default function ComicCreator({ user, onLogout }: ComicCreatorProps) {
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [comic, setComic] = useState<any>(null);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'flipbook' | 'scroll'>('scroll');
  const [isFlipping, setIsFlipping] = useState(false);
  const [history, setHistory] = useState<ComicHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history directly using auth.currentUser (more reliable)
  const loadHistory = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const loaded = await loadHistoryFromFirestore(currentUser.uid);
      setHistory(loaded);
    } else {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Reload history when user changes (login/logout)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      loadHistory();
    });
    return () => unsubscribe();
  }, []);

  const panels: any[] = comic?.pages || [];
  const totalPages = panels.length;

  const generateComic = async () => {
    if (!input.trim()) { setError('Please write your story idea first!'); return; }
    setGenerating(true); setError('');
    try {
      const res = await axios.post(`${API_URL}/generate`, { user_input: input });
      setComic(res.data); setCurrentPage(0);
      setViewMode('scroll');
      
      // Save to Firestore using the current user directly
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await saveComicToFirestore(currentUser.uid, res.data);
          // Refresh history
          await loadHistory();
        } catch (saveErr) {
          console.error('Failed to save comic to Firestore:', saveErr);
          setError('Comic created but could not save to history. Check Firestore rules.');
        }
      } else {
        console.warn('No user logged in – cannot save to Firestore');
        setError('Please log in again to save comics to your history.');
      }
    } catch (err: any) {
      setError(err.code === 'ERR_NETWORK' ? '❌ Backend offline — start port 8000' : '⚡ Something went wrong. Try again!');
    }
    setGenerating(false);
  };

  const deleteFromHistory = async (id: string) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await deleteComicFromFirestore(currentUser.uid, id);
      await loadHistory();
    }
  };

  const nextPage = useCallback(() => {
    if (!isFlipping && currentPage < totalPages - 1) {
      setIsFlipping(true); setCurrentPage(p => p + 1);
      setTimeout(() => setIsFlipping(false), 350);
    }
  }, [isFlipping, currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (!isFlipping && currentPage > 0) {
      setIsFlipping(true); setCurrentPage(p => p - 1);
      setTimeout(() => setIsFlipping(false), 350);
    }
  }, [isFlipping, currentPage]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (viewMode === 'flipbook') {
        if (e.key === 'ArrowRight') nextPage();
        if (e.key === 'ArrowLeft') prevPage();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [viewMode, nextPage, prevPage]);

  const handleDownloadText = () => {
    const txt = comic?.pages?.map((p: any, i: number) =>
      `[Panel ${i + 1}]\n${p.action || ''}\n` +
      `${p.speaker_1 ? `${p.speaker_1}: "${p.line_1}"` : p.line_1 ? `"${p.line_1}"` : ''}\n` +
      `${p.speaker_2 ? `${p.speaker_2}: "${p.line_2}"` : p.line_2 ? `"${p.line_2}"` : ''}\n` +
      `${p.sound_effect ? `SFX: ${p.sound_effect}!` : ''}`
    ).join('\n\n') ?? '';
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([txt], { type: 'text/plain' })),
      download: `${comic?.ingredients?.hero_name || 'comic'}_story.txt`,
    });
    a.click();
  };

  const handlePrintPDF = () => {
    setViewMode('scroll'); 
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const examples = [
    { emoji: '⚡', label: 'Thunder Boy', text: 'I am Ryo, a boy who controls thunder! I must stop the Shadow Dragon from destroying Tokyo before midnight!' },
    { emoji: '🌸', label: 'Magical Girl', text: 'I am Sakura, a magical girl who discovers her powers in an ancient cherry blossom forest full of fox spirits!' },
    { emoji: '⚔️', label: 'Time Samurai', text: 'I am Kaito, a young samurai who finds an ancient sword that lets me travel through time to fix the past!' },
    { emoji: '🚀', label: 'Space Pilot', text: 'I am Nova, an ace space pilot racing through an asteroid field to rescue my robot companion from space pirates!' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #07070D; overflow-x: hidden; }
        .cr-root { min-height: 100vh; background: linear-gradient(135deg, #07070D 0%, #0F0F1A 50%, #07070D 100%); font-family: 'DM Sans', sans-serif; position: relative; color: white; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a14; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #8B5CF6, #EC4899); border-radius: 99px; }
        .cr-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(7,7,13,0.92); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(139,92,246,0.12); padding: 0 40px; height: 68px; display: flex; align-items: center; justify-content: space-between; }
        .btn-generate { width: 100%; padding: 18px 32px; border: none; cursor: pointer; border-radius: 100px; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 1.5px; color: #fff; background: linear-gradient(135deg, #8B5CF6, #EC4899); box-shadow: 0 4px 28px rgba(139,92,246,0.45); transition: all 0.25s; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .btn-generate:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(139,92,246,0.6); }
        .btn-generate:active:not(:disabled) { transform: translateY(0); }
        .btn-generate:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-outline { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 100px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.65); background: rgba(139,92,246,0.06); border: 1px solid rgba(139,92,246,0.2); transition: all 0.18s; }
        .btn-outline:hover { background: rgba(139,92,246,0.12); color: white; border-color: rgba(139,92,246,0.4); }
        .btn-danger { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 100px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: rgba(236,72,153,0.8); background: rgba(236,72,153,0.06); border: 1px solid rgba(236,72,153,0.2); transition: all 0.18s; }
        .btn-danger:hover { background: rgba(236,72,153,0.12); color: #EC4899; border-color: rgba(236,72,153,0.4); }
        /* IMPROVED INPUT TEXTAREA: larger font, better contrast */
        .story-input { 
          width: 100%; 
          padding: 20px 24px; 
          border-radius: 16px; 
          resize: vertical; 
          font-size: 18px; 
          line-height: 1.6; 
          outline: none; 
          font-family: 'DM Sans', sans-serif; 
          font-weight: 400; 
          background: rgba(139,92,246,0.06); 
          border: 1px solid rgba(139,92,246,0.2); 
          color: rgba(255,255,255,0.92); 
          caret-color: #8B5CF6; 
          transition: border-color 0.2s, box-shadow 0.2s; 
        }
        .story-input::placeholder { color: rgba(255,255,255,0.3); font-size: 16px; }
        .story-input:focus { border-color: rgba(139,92,246,0.6); box-shadow: 0 0 0 4px rgba(139,92,246,0.12); }
        .ex-card { padding: 16px; border-radius: 12px; cursor: pointer; text-align: left; background: rgba(139,92,246,0.04); border: 1px solid rgba(139,92,246,0.1); transition: all 0.2s; display: flex; align-items: flex-start; gap: 14px; }
        .ex-card:hover { background: rgba(139,92,246,0.09); border-color: rgba(139,92,246,0.3); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(139,92,246,0.15); }
        .ex-card div div:first-child { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.85); margin-bottom: 4px; }
        .ex-card div div:last-child { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.5; }
        .tab-btn { padding: 10px 22px; border: none; cursor: pointer; border-radius: 100px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .tab-active { background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; box-shadow: 0 4px 16px rgba(139,92,246,0.4); }
        .tab-inactive { background: transparent; color: rgba(255,255,255,0.35); }
        .tab-inactive:hover { color: rgba(255,255,255,0.7); background: rgba(139,92,246,0.08); }
        .page-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid rgba(139,92,246,0.2); background: rgba(7,7,13,0.92); color: white; transition: all 0.2s; backdrop-filter: blur(12px); z-index: 20; }
        .page-nav:not(:disabled):hover { background: rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.5); color: #8B5CF6; box-shadow: 0 0 20px rgba(139,92,246,0.3); }
        .page-nav:disabled { opacity: 0.2; cursor: not-allowed; }
        @keyframes shimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .logo-text { font-family: 'Bebas Neue', sans-serif; font-size: 30px; letter-spacing: 7px; background: linear-gradient(90deg, #8B5CF6, #EC4899, #06B6D4, #8B5CF6); background-size: 200%; animation: shimmer 4s linear infinite; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(60px, 12vw, 140px); line-height: 0.88; letter-spacing: 4px; }
        
        @media print {
          body { background: white !important; color: black !important; }
          .no-print, .cr-nav, .btn-generate, .tab-btn { display: none !important; }
          .cr-root { background: none !important; min-height: auto; }
          .comic-panel-print { break-inside: avoid; border: 2px solid #ddd !important; margin-bottom: 20px !important; box-shadow: none !important; background: white !important; }
        }
      `}</style>

      <div className="cr-root">
        {/* BG */}
        <div className="no-print" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.07), transparent 70%)' }} />
          <div style={{ position: 'absolute', top: '40%', left: '40%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.04), transparent 70%)' }} />
        </div>
        <div className="no-print" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

        {/* NAVBAR */}
        <nav className="cr-nav no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(139,92,246,0.4)' }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <span className="logo-text">comixnova</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowHistory(true)} className="btn-outline" style={{ position: 'relative' }}>
              <History size={14} />
              My Comics
              {history.length > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 700, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #07070D',
                }}>{history.length}</span>
              )}
            </motion.button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '100px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={13} color="#fff" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{user.name}</span>
            </div>
            <button onClick={onLogout} className="btn-danger"><LogOut size={13} /> Sign Out</button>
          </div>
        </nav>

        {/* HISTORY SIDEBAR */}
        <HistorySidebar
          history={history}
          open={showHistory}
          onClose={() => setShowHistory(false)}
          onLoad={(c) => { setComic(c); setCurrentPage(0); setLiked(false); }}
          onDelete={deleteFromHistory}
        />

        {/* MAIN */}
        <div style={{ paddingTop: '68px', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
          <AnimatePresence mode="wait">
            {!comic && !generating && (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>
                <div style={{ padding: '80px 40px 60px', maxWidth: '1000px', margin: '0 auto' }}>
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', marginBottom: '32px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '100px' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6', boxShadow: '0 0 8px #8B5CF6' }} />
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#A78BFA', letterSpacing: '2px' }}>AI MANGA STUDIO</span>
                    </div>
                    <div className="hero-title" style={{ color: 'white', marginBottom: '4px' }}>CREATE YOUR</div>
                    <div className="hero-title" style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '32px' }}>COMIC STORY</div>
                    <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)', maxWidth: '480px', lineHeight: 1.7, fontWeight: 400 }}>Describe your hero's adventure. Our AI will draw every panel — complete artwork with speech bubbles, sound effects, and narration.</p>
                  </motion.div>
                </div>
                <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 40px 100px' }}>
                  <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '20px', padding: '40px', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(139,92,246,0.08)' }}>
                    <label style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '11px', letterSpacing: '4px', color: 'rgba(139,92,246,0.7)', marginBottom: '14px' }}>YOUR STORY IDEA</label>
                    <textarea className="story-input" rows={5} placeholder="I am Ryo, a boy who controls lightning. Today I must face the Shadow Dragon before it destroys my city..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generateComic(); }} />
                    <div style={{ marginTop: '24px', marginBottom: '32px' }}>
                      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '3px', color: 'rgba(255,255,255,0.2)', marginBottom: '14px' }}>QUICK START EXAMPLES</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {examples.map((ex, i) => (
                          <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => setInput(ex.text)} className="ex-card">
                            <span style={{ fontSize: '22px', flexShrink: 0 }}>{ex.emoji}</span>
                            <div>
                              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '4px' }}>{ex.label}</div>
                              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{ex.text.slice(0, 55)}…</div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.25)', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#EC4899' }}>
                        {error}
                      </motion.div>
                    )}
                    <button onClick={generateComic} disabled={generating} className="btn-generate"><Wand2 size={20} /> GENERATE MY COMIC</button>
                    <p style={{ textAlign: 'center', marginTop: '12px', fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'rgba(255,255,255,0.15)', letterSpacing: '2px' }}>⌘ + ENTER TO GENERATE</p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {generating && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GeneratingScreen />
              </motion.div>
            )}

            {comic && !generating && (
              <motion.div key="comic" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ padding: '40px 40px 100px', maxWidth: '860px', margin: '0 auto' }}>

                <AISummarizer comic={comic} />

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px', marginBottom: '32px' }}>
                  <div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', letterSpacing: '4px', color: 'rgba(139,92,246,0.6)', marginBottom: '10px' }}>NOW READING</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(30px, 5vw, 58px)', lineHeight: 0.9, color: 'white' }}>
                      {comic.ingredients?.hero_name?.toUpperCase() || 'YOUR'}{' '}
                      <span style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ADVENTURE</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                      {[{ icon: <Zap size={12} />, label: `${comic.pages?.length} Panels` }, { icon: <Star size={12} />, label: comic.ingredients?.mood || 'Epic' }].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(139,92,246,0.6)' }}>{item.icon} {item.label}</div>
                      ))}
                    </div>
                  </div>
                  <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '100px' }}>
                      {([['flipbook', Book, 'Flipbook'], ['scroll', Tablet, 'Scroll']] as const).map(([m, Icon, label]) => (
                        <button key={m} onClick={() => setViewMode(m)} className={`tab-btn ${viewMode === m ? 'tab-active' : 'tab-inactive'}`}>
                          <Icon size={14} /> {label}
                        </button>
                      ))}
                    </div>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setLiked(l => !l)} className="btn-outline" style={liked ? { color: '#EC4899', borderColor: 'rgba(236,72,153,0.4)', background: 'rgba(236,72,153,0.08)' } : {}}>
                      <Heart size={14} style={liked ? { fill: '#EC4899' } : {}} />{liked ? 'Liked' : 'Like'}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handlePrintPDF} className="btn-outline">
                      <Printer size={14} /> Print / Save PDF
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleDownloadText} className="btn-outline">
                      <Download size={14} /> Script
                    </motion.button>
                  </div>
                </div>

                {viewMode === 'flipbook' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'relative' }}>
                    <AnimatePresence mode="wait">
                      <motion.div key={currentPage} initial={{ opacity: 0, x: 50, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -50, scale: 0.97 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                        <FlipSpread panel={panels[currentPage]} pageNum={currentPage + 1} totalPages={totalPages} />
                      </motion.div>
                    </AnimatePresence>
                    <button onClick={prevPage} disabled={currentPage === 0} className="page-nav" style={{ left: '-28px' }}><ChevronLeft size={22} /></button>
                    <button onClick={nextPage} disabled={currentPage >= totalPages - 1} className="page-nav" style={{ right: '-28px' }}><ChevronRight size={22} /></button>
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', padding: '12px 20px', borderRadius: '100px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '600px' }}>
                        {panels.map((_, i) => (
                          <motion.button key={i} whileHover={{ scale: 1.4 }} onClick={() => setCurrentPage(i)}
                            style={{ width: i === currentPage ? 24 : 8, height: 8, borderRadius: '4px', border: 'none', cursor: 'pointer', background: i === currentPage ? 'linear-gradient(90deg, #8B5CF6, #EC4899)' : 'rgba(255,255,255,0.12)', transition: 'all 0.3s', boxShadow: i === currentPage ? '0 0 12px rgba(139,92,246,0.6)' : 'none' }} />
                        ))}
                      </div>
                      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '3px', color: 'rgba(139,92,246,0.4)' }}>PANEL {currentPage + 1} / {totalPages} · USE ARROW KEYS</p>
                    </div>
                  </motion.div>
                )}

                {viewMode === 'scroll' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ background: 'linear-gradient(135deg, #0a0a14, #111120)', padding: '16px 28px', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(139,92,246,0.15)', borderBottom: 'none' }}>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', letterSpacing: '8px', background: 'linear-gradient(90deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>✦ {comic.ingredients?.hero_name?.toUpperCase()}'S ADVENTURE ✦</span>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: 'rgba(139,92,246,0.4)', letterSpacing: '2px' }}>{comic.pages?.length} PANELS</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', background: '#0f0f1a', borderRadius: '0 0 12px 12px', border: '1px solid rgba(139,92,246,0.15)', borderTop: 'none' }}>
                      {comic.pages?.map((panel: any, idx: number) => (
                        <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                          <ComicCard panel={panel} idx={idx} />
                        </motion.div>
                      ))}
                      <div style={{ padding: '16px', textAlign: 'center', borderRadius: '8px', background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.1)' }}>
                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '14px', letterSpacing: '12px', color: 'rgba(139,92,246,0.3)' }}>— THE END —</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="no-print" style={{ textAlign: 'center', marginTop: '60px' }}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { setComic(null); setCurrentPage(0); setInput(''); }}
                    className="btn-generate" style={{ width: 'auto', padding: '16px 60px', margin: '0 auto' }}>
                    <Play size={20} /> CREATE ANOTHER COMIC
                  </motion.button>
                </div>

                <Chatbot comic={comic} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}