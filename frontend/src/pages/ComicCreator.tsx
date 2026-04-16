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

// Light theme accent sets (soft pastel backgrounds)
const ACCENT_SETS = [
  { accent: '#3B82F6', light: '#EFF6FF', sfx: '#F59E0B', bg: '#F8FAFC' },
  { accent: '#F59E0B', light: '#FFFBEB', sfx: '#3B82F6', bg: '#F8FAFC' },
  { accent: '#10B981', light: '#ECFDF5', sfx: '#3B82F6', bg: '#F8FAFC' },
  { accent: '#8B5CF6', light: '#F5F3FF', sfx: '#F59E0B', bg: '#F8FAFC' },
];

/* ── FIRESTORE HELPERS ── */
async function loadHistoryFromFirestore(userId: string): Promise<ComicHistoryItem[]> {
  try {
    const comicsRef = collection(db, 'users', userId, 'comics');
    const q = query(comicsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ComicHistoryItem));
    // Also sync to localStorage as backup
    if (items.length > 0) {
      localStorage.setItem(`comics_backup_${userId}`, JSON.stringify(items));
    }
    return items;
  } catch (error) {
    console.error('Failed to load history from Firestore:', error);
    // Fallback to localStorage
    const backup = localStorage.getItem(`comics_backup_${userId}`);
    if (backup) {
      try {
        const items = JSON.parse(backup);
        console.warn('Loaded history from localStorage backup');
        return items;
      } catch (e) {
        console.error('Failed to parse localStorage backup:', e);
      }
    }
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
  
  // Save to localStorage immediately as backup
  try {
    const backupKey = `comic_backup_${userId}_${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify({ id: backupKey, ...item }));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
  
  // Save to Firestore (primary storage)
  const comicsRef = collection(db, 'users', userId, 'comics');
  const docRef = await addDoc(comicsRef, item);
  return docRef.id;
}

async function deleteComicFromFirestore(userId: string, comicId: string) {
  const comicRef = doc(db, 'users', userId, 'comics', comicId);
  await deleteDoc(comicRef);
}

/* ── COMIC PANEL ── */
function ComicCard({ panel, idx }: { panel: any; idx: number }) {
  const c = ACCENT_SETS[idx % 4];
  return (
    <div className="comic-panel-print" style={{
      position: 'relative', border: '1px solid #E5E7EB',
      borderRadius: '8px', overflow: 'hidden', background: '#FFFFFF',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        position: 'relative', width: '100%', flexShrink: 0,
        background: panel?.image_url ? '#FFFFFF' : `${c.light}`,
        display: 'flex', flexDirection: 'column'
      }}>
        {panel?.image_url ? (
          <img src={panel.image_url} alt={`Panel ${idx + 1}`}
            style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} />
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '120px 40px',
            background: c.light,
            minHeight: '300px'
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎨</div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', letterSpacing: '1px', color: c.accent }}>ART RENDERING…</span>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
            <div style={{
              background: c.accent,
              color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '13px',
              letterSpacing: '0.5px', padding: '4px 12px', borderRadius: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}>
              #{String(idx + 1).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── FULLSCREEN FLIPBOOK (white background, clean) ── */
function FullscreenFlipbook({
  panels,
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onPageSelect,
}: {
  panels: any[];
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onPageSelect: (i: number) => void;
}) {
  const panel = panels[currentPage];
  const c = ACCENT_SETS[currentPage % 4];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      background: '#1e293b',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        flexShrink: 0,
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#0f172a',
        borderBottom: '1px solid #334155',
        zIndex: 10,
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#f1f5f9',
        }}>
          comixnova
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['#3B82F6', '#F59E0B', '#10B981'].map((col, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: col }} />
          ))}
        </div>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
          color: '#94a3b8',
        }}>
          PANEL {currentPage + 1} / {totalPages}
        </span>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 60, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -60, scale: 0.97 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#F9FAFB',
            }}
          >
            {panel?.image_url ? (
              <img
                src={panel.image_url}
                alt={`Panel ${currentPage + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: c.light,
              }}>
                <div style={{ fontSize: '72px', marginBottom: '20px' }}>🎨</div>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '16px',
                  color: c.accent,
                }}>ART RENDERING…</span>
              </div>
            )}

            <div style={{
              position: 'absolute',
              top: '16px',
              left: '20px',
              background: c.accent,
              color: '#fff',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              padding: '5px 14px',
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}>
              #{String(currentPage + 1).padStart(2, '0')}
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={onPrev}
          disabled={currentPage === 0}
          style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '1px solid #D1D5DB',
            background: '#FFFFFF',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 0 ? 0.4 : 1,
            zIndex: 20,
            transition: 'all 0.2s',
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={onNext}
          disabled={currentPage >= totalPages - 1}
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '1px solid #D1D5DB',
            background: '#FFFFFF',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage >= totalPages - 1 ? 0.4 : 1,
            zIndex: 20,
            transition: 'all 0.2s',
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div style={{
        flexShrink: 0,
        background: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        padding: '10px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '600px',
        }}>
          {panels.map((_, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.2 }}
              onClick={() => onPageSelect(i)}
              style={{
                width: i === currentPage ? 28 : 8,
                height: 8,
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                background: i === currentPage ? '#3B82F6' : '#D1D5DB',
                transition: 'all 0.2s',
                padding: 0,
              }}
            />
          ))}
        </div>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '10px',
          color: '#9CA3AF',
        }}>
          — TO BE CONTINUED — · USE ARROW KEYS
        </span>
      </div>
    </div>
  );
}

/* ── AI SUMMARIZER (light theme) ── */
function AISummarizer({ comic }: { comic: any }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const readTime = Math.max(1, Math.round(summary.split(' ').length / 130));
  const intensity = comic.pages?.filter((p: any) => p.sound_effect || (p.action && p.action.includes('!'))).length > 2 ? 'High ⚡' : 'Moderate 🌟';

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
        background: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: '16px', overflow: 'hidden',
      }}
    >
      <button
        onClick={generateSummary}
        style={{
          width: '100%', padding: '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'transparent', border: 'none', cursor: 'pointer', color: '#1F2937',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: '#3B82F6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={16} color="#fff" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', fontWeight: 'bold', color: '#1F2937' }}>
              AI STORY SUMMARIZER
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#6B7280' }}>
              {generated ? 'Click to toggle summary' : 'Generate a story recap & insights'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!generated && (
            <span style={{
              padding: '4px 12px', borderRadius: '100px',
              background: '#3B82F6',
              fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600,
              color: '#fff', letterSpacing: '0.5px',
            }}>GENERATE</span>
          )}
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown size={18} color="#9CA3AF" />
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
            <div style={{ padding: '0 24px 20px', borderTop: '1px solid #E5E7EB' }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px' }}>
                  <Loader2 size={18} color="#3B82F6" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#6B7280' }}>Analyzing panels & extracting story...</span>
                </div>
              ) : (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ background: '#F3F4F6', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                      <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Est. Read Time</span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1F2937' }}>~{readTime} Min</span>
                    </div>
                    <div style={{ background: '#F3F4F6', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                      <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Action Intensity</span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1F2937' }}>{intensity}</span>
                    </div>
                    <button onClick={toggleSpeech} style={{ background: '#F3F4F6', padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', color: '#1F2937', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                      {isPlaying ? <StopCircle size={16} color="#3B82F6" /> : <Volume2 size={16} color="#3B82F6" />}
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{isPlaying ? 'Stop' : 'Listen'}</span>
                    </button>
                  </div>
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '15px', lineHeight: 1.6, color: '#374151',
                    padding: '16px', background: '#F9FAFB',
                    borderRadius: '10px', border: '1px solid #E5E7EB',
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

/* ── CHATBOT (light theme) ── */
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
          background: '#3B82F6',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
            borderRadius: '50%', background: '#F59E0B',
            border: '2px solid #FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter', sans-serif", fontSize: '9px', fontWeight: 700, color: '#fff',
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
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 20px 35px -10px rgba(0,0,0,0.1)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{
              padding: '16px 20px', background: '#F9FAFB',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '12px',
                  background: '#3B82F6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={16} color="#fff" />
                </div>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', fontWeight: 'bold', color: '#1F2937' }}>STORY GUIDE</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#6B7280' }}>Online · Ask me anything!</span>
                  </div>
                </div>
              </div>
              <button onClick={toggleTTS} style={{
                background: ttsEnabled ? '#EFF6FF' : '#F3F4F6',
                border: `1px solid ${ttsEnabled ? '#BFDBFE' : '#E5E7EB'}`,
                color: ttsEnabled ? '#2563EB' : '#6B7280',
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
                    background: msg.role === 'user' ? '#3B82F6' : '#F3F4F6',
                    border: msg.role === 'bot' ? '1px solid #E5E7EB' : 'none',
                    fontFamily: "'Inter', sans-serif", fontSize: '13px', lineHeight: 1.5,
                    color: msg.role === 'user' ? '#fff' : '#1F2937',
                  }}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '10px 14px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '16px 16px 16px 4px', width: 'fit-content' }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                      style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6' }} />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '8px' }}>
              <input
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') send(); }}
                placeholder="Ask about the story…"
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '100px',
                  background: '#F9FAFB', border: '1px solid #E5E7EB',
                  color: '#1F2937', fontFamily: "'Inter', sans-serif", fontSize: '13px',
                  outline: 'none',
                }}
              />
              <motion.button whileTap={{ scale: 0.9 }} onClick={send}
                style={{
                  width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: '#3B82F6',
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

/* ── HISTORY SIDEBAR (light theme) ── */
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
    adventure: '#3B82F6', mystery: '#10B981', funny: '#F59E0B',
    magical: '#8B5CF6', spooky: '#6B7280',
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="no-print">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200, backdropFilter: 'blur(2px)' }}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 280 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: '380px', zIndex: 201,
              background: '#1e293b', borderLeft: '1px solid #334155',
              display: 'flex', flexDirection: 'column',
              boxShadow: '-5px 0 20px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{
              padding: '24px 24px 20px', borderBottom: '1px solid #334155',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#0f172a',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <History size={16} color="#fff" />
                </div>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '20px', fontWeight: 'bold', color: '#f1f5f9' }}>MY COMICS</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#94a3b8' }}>{history.length} saved adventures</div>
                </div>
              </div>
              <button onClick={onClose} style={{ background: '#334155', border: '1px solid #475569', borderRadius: '8px', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', fontWeight: 'bold', color: '#64748b' }}>NO COMICS YET</div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#64748b', marginTop: '8px' }}>Create your first comic to see it here!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {history.map((item, i) => (
                    <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      style={{
                        background: '#334155', border: '1px solid #475569',
                        borderRadius: '12px', padding: '14px 16px',
                        display: 'flex', flexDirection: 'column', gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', fontWeight: 'bold', color: '#f1f5f9', lineHeight: 1.2 }}>{item.title}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                            <span style={{
                              padding: '2px 8px', borderRadius: '100px',
                              background: `${moodColors[item.mood] || '#2563eb'}20`,
                              border: `1px solid ${moodColors[item.mood] || '#2563eb'}40`,
                              fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: 600,
                              color: moodColors[item.mood] || '#60a5fa', textTransform: 'capitalize',
                            }}>{item.mood}</span>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Zap size={10} /> {item.panelCount} panels
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <Clock size={10} color="#9CA3AF" />
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: '#9CA3AF' }}>
                              {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <button onClick={() => onDelete(item.id)}
                          style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', flexShrink: 0 }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <button onClick={() => { onLoad(item.comic); onClose(); }}
                        style={{
                          width: '100%', padding: '8px', borderRadius: '8px', cursor: 'pointer',
                          background: '#F3F4F6',
                          border: '1px solid #E5E7EB',
                          fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600,
                          color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
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

/* ── LOADING SCREEN (light theme) ── */
function GeneratingScreen() {
  const steps = [
    { label: 'Analysing Your Story', sub: 'Understanding characters & world', icon: '📖', color: '#3B82F6' },
    { label: 'Writing Dialogue', sub: 'Crafting speech for each panel', icon: '✍️', color: '#F59E0B' },
    { label: 'Generating Artwork', sub: 'Rendering cinematic illustrations', icon: '🎨', color: '#10B981' },
    { label: 'Final Assembly', sub: 'Compositing your comic book', icon: '⚡', color: '#8B5CF6' },
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
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
      <div style={{ width: '100%', maxWidth: '540px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'relative', width: '170px', height: '170px', margin: '0 auto 60px' }}>
          {[0, 1, 2].map(i => (
            <motion.div key={i} style={{ position: 'absolute', inset: `${i * 18}px`, borderRadius: '50%', border: '2px solid transparent', borderTopColor: ['#2563eb', '#f59e0b', '#10b981'][i], borderRightColor: ['rgba(37,99,235,0.3)', 'rgba(245,158,11,0.3)', 'rgba(16,185,129,0.3)'][i] }}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{ duration: 1.8 + i * 0.7, repeat: Infinity, ease: 'linear' }} />
          ))}
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '170px', height: '170px', transform: `translate(-50%, -50%) rotate(${orbitAngle}deg)`, transition: 'transform 0.6s linear' }}>
            <div style={{ position: 'absolute', top: '0', left: '50%', width: 12, height: 12, borderRadius: '50%', marginLeft: -6, marginTop: -6, background: '#2563eb', boxShadow: '0 0 8px #2563eb' }} />
          </div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '130px', height: '130px', transform: `translate(-50%, -50%) rotate(${-orbitAngle * 1.5}deg)`, transition: 'transform 0.6s linear' }}>
            <div style={{ position: 'absolute', top: '0', left: '50%', width: 8, height: 8, borderRadius: '50%', marginLeft: -4, marginTop: -4, background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
          </div>
          <div style={{ position: 'absolute', inset: '48px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 4px #1e293b, 0 2px 10px rgba(0,0,0,0.3)' }}>
            <AnimatePresence mode="wait">
              <motion.span key={step} initial={{ opacity: 0, scale: 0.4, rotate: -30 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.4, rotate: 30 }} transition={{ duration: 0.45, type: 'spring' }} style={{ fontSize: '28px', lineHeight: 1 }}>
                {steps[step].icon}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -24, filter: 'blur(8px)' }} transition={{ duration: 0.5 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '28px', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '10px' }}>{steps[step].label}</div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', color: '#cbd5e1', marginBottom: '50px' }}>{steps[step].sub}</p>
          </motion.div>
        </AnimatePresence>
        <div style={{ width: '100%', height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden', marginBottom: '28px' }}>
          <motion.div style={{ height: '100%', width: `${progress}%`, background: '#2563eb', borderRadius: '3px' }} transition={{ duration: 0.3 }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
          {steps.map((s, i) => (
            <motion.div key={i} animate={{ scale: i === step ? 1.05 : 1, opacity: i <= step ? 1 : 0.5 }} transition={{ duration: 0.3 }}
              style={{ padding: '6px 14px', borderRadius: '100px', fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, color: i <= step ? '#1F2937' : '#9CA3AF', background: i <= step ? '#F3F4F6' : '#FFFFFF', border: `1px solid ${i <= step ? '#D1D5DB' : '#E5E7EB'}`, letterSpacing: '0.5px' }}>
              {i < step ? `${s.icon} ✓` : `${s.icon} 0${i + 1}`}
            </motion.div>
          ))}
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: '500', color: '#3B82F6' }}>
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

  const loadHistory = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const loaded = await loadHistoryFromFirestore(currentUser.uid);
      setHistory(loaded);
    } else {
      setHistory([]);
    }
  };

  useEffect(() => { loadHistory(); }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => { loadHistory(); });
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
      setGenerating(false);
      
      // Save to Firestore in background (don't wait for it)
      const currentUser = auth.currentUser;
      if (currentUser) {
        saveComicToFirestore(currentUser.uid, res.data)
          .then(() => loadHistory())
          .catch((err) => {
            console.error('Background save failed:', err);
            // Silently fail - comic is already displayed
          });
      }
    } catch (err: any) {
      setError(err.code === 'ERR_NETWORK' ? '❌ Backend offline — start port 8000' : '⚡ Something went wrong. Try again!');
      setGenerating(false);
    }
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

  useEffect(() => {
    if (viewMode === 'flipbook' && comic) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [viewMode, comic]);

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
    setTimeout(() => { window.print(); }, 300);
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #0f172a; overflow-x: hidden; font-family: 'Inter', sans-serif; color: #e2e8f0; }
        .cr-root { min-height: 100vh; background: #0f172a; font-family: 'Inter', sans-serif; position: relative; color: #e2e8f0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1e293b; }
        ::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
        .cr-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(8px); border-bottom: 1px solid #334155; padding: 0 40px; height: 68px; display: flex; align-items: center; justify-content: space-between; }
        .btn-generate { width: 100%; padding: 18px 32px; border: none; cursor: pointer; border-radius: 100px; font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; color: #fff; background: #2563eb; box-shadow: 0 2px 5px rgba(0,0,0,0.3); transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .btn-generate:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
        .btn-generate:active:not(:disabled) { transform: translateY(0); }
        .btn-generate:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-outline { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 100px; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; color: #cbd5e1; background: #1e293b; border: 1px solid #334155; transition: all 0.2s; }
        .btn-outline:hover { background: #334155; color: #f1f5f9; border-color: #475569; }
        .btn-danger { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 100px; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; color: #ef4444; background: #7f1d1d; border: 1px solid #a16061; transition: all 0.2s; }
        .btn-danger:hover { background: #991b1b; color: #fca5a5; border-color: #dc2626; }
        .story-input { width: 100%; padding: 20px 24px; border-radius: 16px; resize: vertical; font-size: 16px; line-height: 1.6; outline: none; font-family: 'Inter', sans-serif; font-weight: 400; background: #1e293b; border: 1px solid #334155; color: #f1f5f9; caret-color: #60a5fa; transition: all 0.2s; }
        .story-input::placeholder { color: #64748b; font-size: 15px; }
        .story-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.2); }
        .ex-card { padding: 16px; border-radius: 12px; cursor: pointer; text-align: left; background: #1e293b; border: 1px solid #334155; transition: all 0.2s; display: flex; align-items: flex-start; gap: 14px; }
        .ex-card:hover { background: #334155; border-color: #475569; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .ex-card, .ex-card * { color: #e2e8f0; }
        .tab-btn { padding: 8px 20px; border: none; cursor: pointer; border-radius: 100px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .tab-active { background: #2563eb; color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.3); }
        .tab-inactive { background: transparent; color: #94a3b8; }
        .tab-inactive:hover { color: #f1f5f9; background: #334155; }
        .logo-text { font-family: 'Inter', sans-serif; font-size: 24px; font-weight: bold; color: #f1f5f9; }
        .hero-title { font-family: 'Inter', sans-serif; font-size: clamp(40px, 8vw, 100px); font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; color: #f1f5f9; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @media print {
          * { margin: 0 !important; padding: 0 !important; }
          html, body { 
            width: 100% !important;
            height: 100% !important;
            background: white !important; 
            color: black !important;
          }
          .no-print, .cr-nav, .btn-generate, .tab-btn, .motion-div { display: none !important; }
          .cr-root { 
            background: none !important; 
            min-height: auto !important;
            width: 100% !important;
          }
          div[style*="flex-direction: column"][style*="gap"] {
            gap: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .comic-panel-print { 
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            page-break-after: always !important;
            border: none !important; 
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important; 
            background: white !important;
            display: block !important;
            width: 100% !important;
            height: 100vh !important;
            min-height: 100vh !important;
            overflow: hidden !important;
            border-radius: 0 !important;
          }
          .comic-panel-print > div {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .comic-panel-print img {
            width: 100% !important;
            height: 100vh !important;
            object-fit: cover !important;
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
          }
          .comic-panel-print [style*="position: absolute"] {
            display: none !important;
          }
        }
      `}</style>

      <div className="cr-root">
        {/* NAVBAR */}
        {!(viewMode === 'flipbook' && comic) && (
          <nav className="cr-nav no-print">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                    background: '#2563eb',
                    fontFamily: "'Inter', sans-serif", fontSize: '9px', fontWeight: 600, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #0f172a',
                  }}>{history.length}</span>
                )}
              </motion.button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '100px', background: '#1e293b', border: '1px solid #334155' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={13} color="#fff" />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#f1f5f9' }}>{user.name}</span>
              </div>
              <button onClick={onLogout} className="btn-danger"><LogOut size={13} /> Sign Out</button>
            </div>
          </nav>
        )}

        {/* HISTORY SIDEBAR */}
        <HistorySidebar
          history={history}
          open={showHistory}
          onClose={() => setShowHistory(false)}
          onLoad={(c) => { setComic(c); setCurrentPage(0); setLiked(false); }}
          onDelete={deleteFromHistory}
        />

        {/* FULLSCREEN FLIPBOOK */}
        {viewMode === 'flipbook' && comic && (
          <FullscreenFlipbook
            panels={panels}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={prevPage}
            onNext={nextPage}
            onPageSelect={setCurrentPage}
          />
        )}

        {/* MAIN */}
        <div style={{ paddingTop: '68px', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
          <AnimatePresence mode="wait">
            {!comic && !generating && (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>
                <div style={{ padding: '80px 40px 60px', maxWidth: '1000px', margin: '0 auto' }}>
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', marginBottom: '32px', background: '#1e3a5f', border: '1px solid #2563eb', borderRadius: '100px' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa' }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#93c5fd', letterSpacing: '1px' }}>AI MANGA STUDIO</span>
                    </div>
                    <div className="hero-title" style={{ color: '#e2e8f0', marginBottom: '4px' }}>CREATE YOUR</div>
                    <div className="hero-title" style={{ color: '#60a5fa', marginBottom: '32px' }}>COMIC STORY</div>
                    <p style={{ fontSize: '18px', color: '#cbd5e1', maxWidth: '480px', lineHeight: 1.6, fontWeight: 400 }}>Describe your hero's adventure. Our AI will draw every panel — complete artwork with speech bubbles, sound effects, and narration.</p>
                  </motion.div>
                </div>
                <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 40px 100px' }}>
                  <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                    <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '1px', color: '#94a3b8', marginBottom: '14px' }}>YOUR STORY IDEA</label>
                    <textarea className="story-input" rows={5} placeholder="I am Ryo, a boy who controls lightning. Today I must face the Shadow Dragon before it destroys my city..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generateComic(); }} />
                    <div style={{ marginTop: '24px', marginBottom: '32px' }}>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '1px', color: '#9CA3AF', marginBottom: '14px' }}>QUICK START EXAMPLES</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {examples.map((ex, i) => (
                          <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => setInput(ex.text)} className="ex-card">
                            <span style={{ fontSize: '22px', flexShrink: 0 }}>{ex.emoji}</span>
                            <div>
                              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: '#1F2937', marginBottom: '4px' }}>{ex.label}</div>
                              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#6B7280', lineHeight: 1.5 }}>{ex.text.slice(0, 55)}…</div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', background: '#FEF2F2', border: '1px solid #FECACA', fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#EF4444' }}>
                        {error}
                      </motion.div>
                    )}
                    <button onClick={generateComic} disabled={generating} className="btn-generate"><Wand2 size={20} /> GENERATE MY COMIC</button>
                    <p style={{ textAlign: 'center', marginTop: '12px', fontFamily: "'Inter', sans-serif", fontSize: '10px', color: '#9CA3AF', letterSpacing: '0.5px' }}>⌘ + ENTER TO GENERATE</p>
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
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '1px', color: '#6B7280', marginBottom: '8px' }}>NOW READING</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 'bold', lineHeight: 1.1, color: '#1F2937' }}>
                      {comic.ingredients?.hero_name?.toUpperCase() || 'YOUR'}{' '}
                      <span style={{ color: '#3B82F6' }}>ADVENTURE</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                      {[{ icon: <Zap size={12} />, label: `${comic.pages?.length} Panels` }, { icon: <Star size={12} />, label: comic.ingredients?.mood || 'Epic' }].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#6B7280' }}>{item.icon} {item.label}</div>
                      ))}
                    </div>
                  </div>
                  <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', padding: '4px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '100px' }}>
                      {([['flipbook', Book, 'Flipbook'], ['scroll', Tablet, 'Scroll']] as const).map(([m, Icon, label]) => (
                        <button key={m} onClick={() => setViewMode(m)} className={`tab-btn ${viewMode === m ? 'tab-active' : 'tab-inactive'}`}>
                          <Icon size={14} /> {label}
                        </button>
                      ))}
                    </div>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setLiked(l => !l)} className="btn-outline" style={liked ? { color: '#EF4444', borderColor: '#FECACA', background: '#FEF2F2' } : {}}>
                      <Heart size={14} style={liked ? { fill: '#EF4444' } : {}} />{liked ? 'Liked' : 'Like'}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handlePrintPDF} className="btn-outline">
                      <Printer size={14} /> Print / Save PDF
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleDownloadText} className="btn-outline">
                      <Download size={14} /> Script
                    </motion.button>
                  </div>
                </div>

                {viewMode === 'scroll' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ background: '#F9FAFB', padding: '16px 24px', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #E5E7EB', borderBottom: 'none' }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', fontWeight: 'bold', color: '#1F2937' }}>✦ {comic.ingredients?.hero_name?.toUpperCase()}'S ADVENTURE ✦</span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#6B7280' }}>{comic.pages?.length} PANELS</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', background: '#FFFFFF', borderRadius: '0 0 12px 12px', border: '1px solid #E5E7EB', borderTop: 'none' }}>
                      {comic.pages?.map((panel: any, idx: number) => (
                        <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                          <ComicCard panel={panel} idx={idx} />
                        </motion.div>
                      ))}
                      <div style={{ padding: '16px', textAlign: 'center', borderRadius: '8px', background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', letterSpacing: '2px', color: '#9CA3AF' }}>— THE END —</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="no-print" style={{ textAlign: 'center', marginTop: '60px' }}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { setComic(null); setCurrentPage(0); setInput(''); setViewMode('scroll'); }}
                    className="btn-generate" style={{ width: 'auto', padding: '14px 48px', margin: '0 auto' }}>
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