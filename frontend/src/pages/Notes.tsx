/**
 * Notes — Rich text notes + drawing canvas workspace
 */
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StickyNote, Plus, Search, Save, Download, Trash2, X,
  Bold, Italic, Underline, List, CheckCircle2,
  Pen, Eraser, RotateCcw, BookOpen, Clock,
  FileText, Paintbrush
} from 'lucide-react';
import AppShell from '../components/AppShell';

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'drawing';
  linkedBook?: string;
  tags: string[];
  updatedAt: Date;
  color: string;
}

interface Props { user?: any; onLogout?: () => void; }

const COLORS = ['#1e293b', '#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#16a34a', '#0891b2'];
const NOTE_COLORS = [
  { bg: 'bg-white', border: 'border-slate-200', label: 'White' },
  { bg: 'bg-amber-50', border: 'border-amber-200', label: 'Amber' },
  { bg: 'bg-blue-50', border: 'border-blue-200', label: 'Blue' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Green' },
  { bg: 'bg-pink-50', border: 'border-pink-200', label: 'Pink' },
  { bg: 'bg-violet-50', border: 'border-violet-200', label: 'Violet' },
];

const MOCK_NOTES: Note[] = [
  { id: '1', title: 'Chapter 3 highlights', content: 'The protagonist discovers the hidden map...', type: 'text', linkedBook: 'The Lost Chronicles', tags: ['chapter3', 'plot'], updatedAt: new Date(Date.now() - 600000), color: 'bg-amber-50' },
  { id: '2', title: 'Character sketch – Elena', content: 'Elena is 28, rebellious, former hacker...', type: 'text', linkedBook: 'Neon Shadows', tags: ['character', 'backstory'], updatedAt: new Date(Date.now() - 7200000), color: 'bg-blue-50' },
  { id: '3', title: 'World map sketch', content: '', type: 'drawing', linkedBook: 'Beyond the Stars', tags: ['worldbuilding', 'sketch'], updatedAt: new Date(Date.now() - 86400000), color: 'bg-white' },
  { id: '4', title: 'Plot outline Q2', content: 'Act 1: Setup...\nAct 2: Confrontation...\nAct 3: Resolution...', type: 'text', tags: ['outline', 'structure'], updatedAt: new Date(Date.now() - 172800000), color: 'bg-emerald-50' },
];

function timeAgo(date: Date) {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

export default function Notes({ user, onLogout }: Props) {
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<'text' | 'drawing'>('text');

  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#1e293b');
  const [lineWidth, setLineWidth] = useState(3);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const filtered = notes.filter(n => {
    const q = search.toLowerCase();
    return !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some(t => t.includes(q));
  });

  const createNote = (type: 'text' | 'drawing' = 'text') => {
    const note: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      type,
      tags: [],
      updatedAt: new Date(),
      color: 'bg-white',
    };
    setNotes(p => [note, ...p]);
    setActiveNote(note);
    setMode(type);
  };

  const updateNote = useCallback((id: string, patch: Partial<Note>) => {
    setNotes(p => p.map(n => n.id === id ? { ...n, ...patch, updatedAt: new Date() } : n));
    setActiveNote(p => p && p.id === id ? { ...p, ...patch, updatedAt: new Date() } : p);
    setAutoSaveStatus('unsaved');
    setTimeout(() => setAutoSaveStatus('saved'), 1200);
  }, []);

  const deleteNote = (id: string) => {
    setNotes(p => p.filter(n => n.id !== id));
    if (activeNote?.id === id) setActiveNote(null);
  };

  // Canvas drawing
  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const pt = 'touches' in e ? e.touches[0] : e;
    return { x: pt.clientX - rect.left, y: pt.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    setDrawing(true);
    lastPos.current = getPos(e, canvasRef.current);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing || !canvasRef.current || !lastPos.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    const pos = getPos(e, canvasRef.current);
    ctx.beginPath();
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 5 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => {
    setDrawing(false);
    lastPos.current = null;
    if (activeNote) setAutoSaveStatus('unsaved');
    setTimeout(() => setAutoSaveStatus('saved'), 1200);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const exportNote = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `${activeNote?.title || 'note'}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <AppShell user={user} onLogout={onLogout}>
      <div className="flex h-full overflow-hidden">

        {/* ── Notes Sidebar ── */}
        <div className="w-72 flex-shrink-0 border-r border-slate-100 bg-white flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="display-font text-3xl font-bold text-slate-900">Notes</h2>
              <div className="flex gap-1">
                <button onClick={() => createNote('text')} className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors" title="New text note">
                  <Plus size={14} />
                </button>
                <button onClick={() => createNote('drawing')} className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors" title="New drawing">
                  <Paintbrush size={14} />
                </button>
              </div>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes…"
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center">
                <StickyNote size={28} className="text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No notes yet</p>
              </div>
            ) : (
              filtered.map(note => (
                <div key={note.id} onClick={() => { setActiveNote(note); setMode(note.type); }}
                  className={`px-4 py-3.5 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50/80 group relative ${activeNote?.id === note.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${note.type === 'drawing' ? 'bg-violet-400' : 'bg-blue-400'}`} />
                      <p className="text-sm font-semibold text-slate-900 truncate">{note.title}</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteNote(note.id); }}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all flex-shrink-0">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {note.content && <p className="text-xs text-slate-400 mt-1 truncate pl-4">{note.content}</p>}
                  <div className="flex items-center gap-2 mt-1.5 pl-4">
                    {note.linkedBook && (
                      <span className="flex items-center gap-1 text-xs text-slate-400"><BookOpen size={9} />{note.linkedBook}</span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-300 ml-auto"><Clock size={9} />{timeAgo(note.updatedAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Editor Area ── */}
        {activeNote ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F8FA]">
            {/* Editor Toolbar */}
            <div className="bg-white border-b border-slate-100 px-5 py-3 flex items-center gap-3 flex-wrap">
              <input
                type="text"
                value={activeNote.title}
                onChange={e => updateNote(activeNote.id, { title: e.target.value })}
                className="display-font text-3xl font-bold text-slate-900 bg-transparent focus:outline-none min-w-0 flex-1 placeholder-slate-300"
                placeholder="Note title…"
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-1 rounded-lg font-medium flex items-center gap-1 ${autoSaveStatus === 'saved' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                  {autoSaveStatus === 'saving' ? <><Save size={10} className="animate-pulse" />Saving…</> : autoSaveStatus === 'saved' ? <><CheckCircle2 size={10} />Saved</> : <><Save size={10} />Unsaved</>}
                </span>
                <button onClick={exportNote} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all" title="Export">
                  <Download size={14} />
                </button>
                <button onClick={() => deleteNote(activeNote.id)} className="w-8 h-8 rounded-lg border border-red-200 flex items-center justify-center text-red-400 hover:bg-red-50 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="bg-white border-b border-slate-100 px-5 py-2 flex items-center gap-2">
              <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                <button onClick={() => setMode('text')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <FileText size={13} /> Text
                </button>
                <button onClick={() => setMode('drawing')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === 'drawing' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <Paintbrush size={13} /> Drawing
                </button>
              </div>

              {mode === 'text' && (
                <div className="flex items-center gap-1 ml-2">
                  {[
                    { icon: Bold, cmd: 'bold' }, { icon: Italic, cmd: 'italic' },
                    { icon: Underline, cmd: 'underline' }, { icon: List, cmd: 'insertUnorderedList' },
                  ].map(({ icon: Icon, cmd }) => (
                    <button key={cmd} onClick={() => document.execCommand(cmd)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all">
                      <Icon size={13} />
                    </button>
                  ))}
                </div>
              )}

              {mode === 'drawing' && (
                <div className="flex items-center gap-2 ml-2">
                  <button onClick={() => setTool('pen')} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${tool === 'pen' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    <Pen size={12} /> Pen
                  </button>
                  <button onClick={() => setTool('eraser')} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${tool === 'eraser' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    <Eraser size={12} /> Erase
                  </button>
                  <div className="flex gap-1 ml-1">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setColor(c)} style={{ background: c }}
                        className={`w-5 h-5 rounded-full transition-all hover:scale-110 ${color === c ? 'ring-2 ring-offset-1 ring-blue-500 scale-110' : ''}`} />
                    ))}
                  </div>
                  <input type="range" min={1} max={15} value={lineWidth} onChange={e => setLineWidth(Number(e.target.value))} className="w-20 accent-blue-600" />
                  <button onClick={clearCanvas} className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all">
                    <RotateCcw size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-hidden p-5">
              {mode === 'text' ? (
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onInput={e => updateNote(activeNote.id, { content: (e.target as HTMLElement).innerText })}
                  className="w-full h-full bg-white rounded-2xl border border-slate-100 shadow-sm p-6 focus:outline-none text-slate-900 text-sm leading-relaxed overflow-y-auto"
                  style={{ fontFamily: "'Inter', sans-serif", minHeight: '400px' }}
                  dangerouslySetInnerHTML={{ __html: activeNote.content || '' }}
                />
              ) : (
                <div className="w-full h-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={1200}
                    height={800}
                    className="w-full h-full cursor-crosshair touch-none"
                    style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#F7F8FA]">
            <div className="w-20 h-20 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center mb-5">
              <StickyNote size={32} className="text-slate-300" />
            </div>
            <h3 className="display-font text-3xl font-bold text-slate-900 mb-2">Select a note</h3>
            <p className="text-slate-500 text-base mb-6 text-center max-w-sm">Choose a note from the sidebar or create a new one to start editing.</p>
            <div className="flex gap-3">
              <button onClick={() => createNote('text')} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl display-font text-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                <Plus size={18} /> New Note
              </button>
              <button onClick={() => createNote('drawing')} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl display-font text-lg font-bold hover:bg-slate-50 transition-all shadow-sm">
                <Paintbrush size={18} /> New Drawing
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
