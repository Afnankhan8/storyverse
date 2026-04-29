/**
 * Bookshelf — Premium reading list
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Trash2, Clock, Sparkles, BookMarked, Search, Grid3X3, List } from 'lucide-react';
import { auth } from '../firebase.ts';
import AppShell from '../components/AppShell';

const API = 'http://localhost:8000';

export default function Bookshelf({ user, onLogout }: { user?: any; onLogout?: () => void }) {
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();
  const userId = auth.currentUser?.uid || '';

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    axios.get(`${API}/api/social/bookshelf/${userId}`)
      .then(r => setSaved(r.data.saved || []))
      .catch(() => setSaved([]))
      .finally(() => setLoading(false));
  }, [userId]);

  const remove = async (bookId: string) => {
    setSaved(s => s.filter(b => b.bookId !== bookId));
    await axios.delete(`${API}/api/social/bookshelf/remove`, { params: { userId, bookId } }).catch(() => { });
  };

  const filtered = saved.filter(item => {
    const q = search.toLowerCase();
    return !q || (item.bookTitle || '').toLowerCase().includes(q) || (item.author || '').toLowerCase().includes(q);
  });

  return (
    <AppShell user={user} onLogout={onLogout}>
      <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="display-font text-4xl lg:text-5xl font-bold text-slate-900">
              My Bookshelf
            </h1>
            <p className="text-slate-500 text-base mt-2">{saved.length} saved books</p>
          </div>
          <Link to="/hub" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-lg display-font font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
            <Sparkles size={18} /> Discover More
          </Link>
        </div>

        {/* Toolbar */}
        {saved.length > 0 && (
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search saved books…"
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
            </div>
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
              <button onClick={() => setView('grid')} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${view === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <Grid3X3 size={15} />
              </button>
              <button onClick={() => setView('list')} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${view === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <List size={15} />
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2/3] bg-slate-100 rounded-2xl mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-3/4 mb-1" />
                  <div className="h-2.5 bg-slate-50 rounded w-1/2" />
                </div>
              ))}
            </motion.div>
          ) : saved.length === 0 ? (
            <motion.div key="empty-all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-24">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center mb-5">
                <BookMarked size={32} className="text-slate-300" />
              </div>
              <h3 className="display-font font-bold text-slate-900 text-2xl mb-2">Your bookshelf is empty</h3>
              <p className="text-slate-500 text-base mb-6 text-center max-w-xs">Save books from the Hub and Library to read them anytime.</p>
              <button onClick={() => navigate('/hub')} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-lg display-font font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                <Sparkles size={18} /> Browse the Hub
              </button>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div key="empty-search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
              <p className="text-slate-500">No books match "{search}"</p>
            </motion.div>
          ) : view === 'grid' ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              <AnimatePresence>
                {filtered.map((item, idx) => (
                  <motion.div layout key={item.bookId} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, layout: { type: "spring", stiffness: 300, damping: 30 } }} className="group relative">
                    <Link to={`/book/${item.bookId}`} className="block">
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-slate-100 mb-2.5 shadow-sm hover:shadow-xl transition-all group-hover:-translate-y-1">
                        {item.coverImage
                          ? <img src={item.coverImage} alt={item.bookTitle} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center">
                            <BookOpen size={28} className="text-blue-300" />
                          </div>
                        }
                        <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <span className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <BookOpen size={11} /> Read
                          </span>
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{item.bookTitle}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">@{item.author}</p>
                      {item.savedAt && (
                        <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                          <Clock size={9} />{new Date(item.savedAt).toLocaleDateString()}
                        </p>
                      )}
                    </Link>
                    <button onClick={() => remove(item.bookId)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10">
                      <Trash2 size={12} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
              <AnimatePresence>
                {filtered.map((item, idx) => (
                  <motion.div layout key={item.bookId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, layout: { type: "spring", stiffness: 300, damping: 30 } }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 p-3.5 group">
                    <div className="w-10 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      {item.coverImage
                        ? <img src={item.coverImage} alt={item.bookTitle} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center"><BookOpen size={14} className="text-blue-300" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/book/${item.bookId}`} className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors truncate block">{item.bookTitle}</Link>
                      <p className="text-xs text-slate-400">@{item.author}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/book/${item.bookId}`} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-700 transition-colors">Read</Link>
                      <button onClick={() => remove(item.bookId)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
