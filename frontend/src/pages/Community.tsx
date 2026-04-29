/**
 * Community — Premium social hub: trending books, discussions, and top authors
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MessageSquare, Star, TrendingUp, Users, Heart, Eye,
  BookOpen, Search, ChevronRight, Plus, ThumbsUp, Clock,
  Flame, Award, Globe, Sparkles, ArrowUpRight, Pin, Check
} from 'lucide-react';
import AppShell from '../components/AppShell';

interface Props { user?: any; onLogout?: () => void; }

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
};

const TRENDING = [
  { id: 't1', title: 'The Midnight Algorithm', author: 'R. Nakamura', genre: 'Sci-Fi', views: 12400, likes: 892, rating: 4.8, reviews: 127, gradient: 'from-sky-500 via-blue-600 to-indigo-700' },
  { id: 't2', title: 'Echoes of Ember', author: 'D. Petrov', genre: 'Fantasy', views: 9800, likes: 743, rating: 4.6, reviews: 89, gradient: 'from-orange-400 via-rose-500 to-pink-600' },
  { id: 't3', title: 'Silent Code', author: 'A. Hassan', genre: 'Thriller', views: 8200, likes: 601, rating: 4.7, reviews: 74, gradient: 'from-violet-500 via-purple-600 to-indigo-600' },
  { id: 't4', title: 'Urban Legends Vol.2', author: 'M. Torres', genre: 'Horror', views: 6700, likes: 490, rating: 4.5, reviews: 56, gradient: 'from-slate-700 via-slate-800 to-gray-900' },
];

const ACTIVE_USERS = [
  { name: 'Sofia Lin', handle: 'sofiawrites', avatar: 'S', books: 19, followers: 3400, gradient: 'from-violet-500 to-purple-600', specialty: 'Fantasy & Sci-Fi', verified: true },
  { name: 'Aria Chen', handle: 'aria_chen', avatar: 'A', books: 12, followers: 1240, gradient: 'from-pink-500 to-rose-500', specialty: 'Romance & Drama', verified: true },
  { name: 'Marcus Webb', handle: 'marcuswebb', avatar: 'M', books: 8, followers: 890, gradient: 'from-emerald-500 to-cyan-500', specialty: 'Thriller', verified: false },
  { name: 'James O.', handle: 'james_o', avatar: 'J', books: 6, followers: 540, gradient: 'from-amber-500 to-orange-500', specialty: 'Non-Fiction', verified: false },
];

const DISCUSSIONS = [
  { id: 'd1', title: 'Best world-building techniques for fantasy novels?', author: 'Aria Chen', authorGrad: 'from-pink-500 to-rose-500', replies: 24, likes: 67, time: '1h ago', pinned: true, tag: 'Craft' },
  { id: 'd2', title: 'How do you push through writer\'s block?', author: 'Marcus Webb', authorGrad: 'from-emerald-500 to-cyan-500', replies: 18, likes: 43, time: '3h ago', pinned: false, tag: 'Tips' },
  { id: 'd3', title: 'Your favorite plotting tools and methods?', author: 'Sofia Lin', authorGrad: 'from-violet-500 to-purple-600', replies: 31, likes: 89, time: '6h ago', pinned: false, tag: 'Tools' },
  { id: 'd4', title: 'Tips for writing dialogue that feels real', author: 'James O.', authorGrad: 'from-amber-500 to-orange-500', replies: 12, likes: 28, time: '1d ago', pinned: false, tag: 'Craft' },
  { id: 'd5', title: 'How do you structure your daily writing routine?', author: 'Aria Chen', authorGrad: 'from-pink-500 to-rose-500', replies: 9, likes: 41, time: '2d ago', pinned: false, tag: 'Productivity' },
];

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={11} className={i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
      ))}
    </div>
  );
}

const TAG_COLORS: Record<string, string> = {
  Craft: 'bg-blue-50 text-blue-700 border-blue-100',
  Tips: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Tools: 'bg-violet-50 text-violet-700 border-violet-100',
  Productivity: 'bg-amber-50 text-amber-700 border-amber-100',
};

export default function Community({ user, onLogout }: Props) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'trending' | 'discussions' | 'authors'>('trending');
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => setLiked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleFollow = (name: string) => setFollowed(p => { const n = new Set(p); n.has(name) ? n.delete(name) : n.add(name); return n; });

  return (
    <AppShell user={user} onLogout={onLogout}>
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">

            {/* ── Header ── */}
            <motion.div variants={fadeIn}>
              <div className="relative overflow-hidden rounded-3xl p-8 lg:p-12"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
                <div className="absolute inset-0 opacity-30"
                  style={{ background: 'radial-gradient(circle at 20% 50%, #8B5CF6 0%, transparent 50%)' }} />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Globe size={18} className="text-violet-400" />
                      <span className="text-slate-300 text-[13px] font-medium tracking-wide">
                        Community Hub
                      </span>
                    </div>
                    <h1 className="text-white text-[2.5rem] lg:text-[3.5rem] font-black tracking-tight mb-3">
                      Discover & Connect<span className="text-violet-400">.</span>
                    </h1>
                    <p className="text-slate-300 text-[16px] max-w-2xl leading-relaxed">
                      Explore trending books, join engaging discussions, and connect with creators worldwide.
                    </p>
                  </div>
                  <div className="relative w-full sm:w-auto">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search community…"
                      className="pl-11 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 w-full sm:w-80 shadow-sm transition-all" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Stats Banner ── */}
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: BookOpen, label: 'Books Published', value: '12,400+', color: '#0EA5E9', change: '+142 this week' },
                { icon: Users, label: 'Active Authors', value: '3,200+', color: '#8B5CF6', change: '+38 this week' },
                { icon: MessageSquare, label: 'Discussions', value: '8,900+', color: '#F59E0B', change: '+210 this week' },
                { icon: Star, label: 'Reviews', value: '45,000+', color: '#10B981', change: '+1,200 this week' },
              ].map((stat, i) => (
                <motion.div key={stat.label} variants={fadeIn} whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center`}
                      style={{ backgroundColor: `${stat.color}15` }}>
                      <stat.icon size={24} style={{ color: stat.color }} />
                    </div>
                  </div>
                  <div className="text-[2rem] font-black text-slate-900 mb-1">{stat.value}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-slate-600">{stat.label}</span>
                    <span className="text-[11px] font-bold px-2 py-1 rounded-lg"
                      style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                      <ArrowUpRight size={10} className="inline mr-1" />{stat.change}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* ── Tabs ── */}
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex gap-2 bg-white rounded-xl p-1.5 border border-slate-200 shadow-sm">
                {([
                  { id: 'trending', icon: Flame, label: 'Trending', color: 'text-orange-500' },
                  { id: 'discussions', icon: MessageSquare, label: 'Discussions', color: 'text-blue-500' },
                  { id: 'authors', icon: Users, label: 'Authors', color: 'text-violet-500' },
                ] as const).map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-all ${activeTab === tab.id ? 'bg-slate-50 text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'}`}>
                    <tab.icon size={16} className={activeTab === tab.id ? tab.color : 'text-slate-400'} />{tab.label}
                  </button>
                ))}
              </div>
              {activeTab === 'discussions' && (
                <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl text-[14px] font-bold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md shadow-blue-500/20 active:scale-95">
                  <Plus size={16} /> New Thread
                </button>
              )}
            </motion.div>

        {/* ── TRENDING ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'trending' && (
            <motion.div key="trending" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {TRENDING.map((book, i) => (
                  <motion.div key={book.id} variants={fadeIn}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                    {/* Cover gradient */}
                    <div className={`h-32 bg-gradient-to-br ${book.gradient} relative flex flex-col justify-between p-4`}>
                      <div className="flex items-center justify-between">
                        <span className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-xs font-black text-white">
                          {i + 1}
                        </span>
                        {i === 0 && (
                          <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-white font-bold">
                            <Flame size={10} className="fill-white" /> Hot
                          </span>
                        )}
                      </div>
                      <span className="self-start text-xs font-bold text-white/90 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-md">{book.genre}</span>
                    </div>
                    <div className="p-4">
                      <Link to={`/book/${book.id}`} className="font-bold text-slate-900 text-sm leading-snug hover:text-blue-600 transition-colors line-clamp-2 block">{book.title}</Link>
                      <p className="text-xs text-slate-400 mt-0.5 mb-3">by {book.author}</p>
                      <div className="flex items-center gap-1.5 mb-3">
                        <Stars value={book.rating} />
                        <span className="text-xs font-bold text-slate-700">{book.rating}</span>
                        <span className="text-xs text-slate-400">({book.reviews})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Eye size={10} />{(book.views / 1000).toFixed(1)}K</span>
                          <span className="flex items-center gap-1"><Heart size={10} />{book.likes}</span>
                        </div>
                        <Link to={`/book/${book.id}`}
                          className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 border border-blue-200 px-2.5 py-1.5 rounded-xl hover:bg-blue-50 transition-all">
                          <BookOpen size={11} /> Read
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Banner */}
              <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 rounded-2xl p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-amber-300" />
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Featured</span>
                  </div>
                  <h3 className="font-black text-white text-xl mb-1">Share your reading experience</h3>
                  <p className="text-indigo-200 text-sm">Leave reviews and help other readers discover great books.</p>
                </div>
                <button className="relative flex items-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all whitespace-nowrap shadow-xl shadow-black/20">
                  <Star size={15} /> Write a Review
                </button>
              </div>
            </motion.div>
          )}

          {/* ── DISCUSSIONS ── */}
          {activeTab === 'discussions' && (
            <motion.div key="discussions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
              className="space-y-4">
              {DISCUSSIONS.map((d, i) => (
                <motion.div key={d.id} variants={fadeIn}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${d.authorGrad} flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-sm`}>
                      {d.author[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {d.pinned && (
                            <span className="flex items-center gap-1 text-[10px] text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md">
                              <Pin size={8} /> Pinned
                            </span>
                          )}
                          <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded-md ${TAG_COLORS[d.tag] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                            {d.tag}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                          <Clock size={10} />{d.time}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-1">{d.title}</h3>
                      <p className="text-xs text-slate-400 mb-3">by <span className="font-semibold text-slate-600">{d.author}</span></p>
                      <div className="flex items-center gap-4">
                        <button onClick={() => toggleLike(d.id)}
                          className={`flex items-center gap-1.5 text-xs font-semibold transition-all px-2.5 py-1.5 rounded-lg ${liked.has(d.id) ? 'text-blue-700 bg-blue-50 border border-blue-100' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                          <ThumbsUp size={12} className={liked.has(d.id) ? 'fill-current' : ''} />
                          {d.likes + (liked.has(d.id) ? 1 : 0)}
                        </button>
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                          <MessageSquare size={12} />{d.replies} replies
                        </span>
                        <span className="ml-auto text-xs font-bold text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          Join discussion <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── AUTHORS ── */}
          {activeTab === 'authors' && (
            <motion.div key="authors" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {ACTIVE_USERS.map((u, i) => (
                  <motion.div key={u.name} variants={fadeIn}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                    {/* Gradient header */}
                    <div className={`h-20 bg-gradient-to-br ${u.gradient} relative`}>
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white, transparent 60%)' }} />
                      {i === 0 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                          <Award size={10} className="text-amber-300 fill-amber-300" />
                          <span className="text-[10px] text-white font-bold">Top Author</span>
                        </div>
                      )}
                    </div>
                    <div className="px-5 pb-5 -mt-8">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${u.gradient} flex items-center justify-center text-white text-xl font-black mb-3 shadow-lg border-4 border-white`}>
                        {u.avatar}
                      </div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="font-bold text-slate-900 text-base">{u.name}</h3>
                        {u.verified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check size={9} className="text-white" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mb-1">@{u.handle}</p>
                      <p className="text-xs text-slate-500 font-medium mb-3">{u.specialty}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                        <span className="flex items-center gap-1 font-semibold"><BookOpen size={11} className="text-blue-500" />{u.books} books</span>
                        <span className="flex items-center gap-1 font-semibold"><Users size={11} className="text-violet-500" />{u.followers.toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => toggleFollow(u.name)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${followed.has(u.name)
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/25'}`}>
                          {followed.has(u.name) ? <><Check size={11} /> Following</> : <>Follow</>}
                        </button>
                        <Link to={`/@${u.handle}`}
                          className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                          Profile
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
