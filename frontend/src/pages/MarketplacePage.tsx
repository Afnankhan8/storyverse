import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search, SlidersHorizontal, BookOpen, Star, Heart, Eye,
  ChevronDown, X, Flame, TrendingUp, Sparkles as SparklesIcon, Tag
} from 'lucide-react';
import AppShell from '../components/AppShell';

const API = "https://your-backend.onrender.com";

const GENRES = ['All', 'Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 'Horror', 'Adventure', 'Comics', 'Thriller', 'Drama'];
const SORTS = [
  { label: 'Most Popular', value: 'views' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Newest', value: 'newest' },
  { label: 'Free First', value: 'free' },
];

const PRICES = [
  { label: 'All', value: 'all' },
  { label: 'Free', value: 'free' },
  { label: 'Paid', value: 'paid' },
  { label: 'Under $5', value: 'under5' },
];

interface Props { user?: any; onLogout?: () => void; }

function BookCard({ book, idx }: { book: any; idx: number }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      onClick={() => navigate(`/book/${book.id}`)}
      className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* Cover */}
      <div className="relative aspect-[2/3] overflow-hidden bg-slate-100">
        {book.coverImage
          ? <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <BookOpen size={40} className="text-slate-300" />
            </div>
        }
        {/* Price badge */}
        <div className={`absolute top-3 left-3 text-xs font-extrabold px-3 py-1 rounded-full shadow-md ${book.isPaid ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'}`}>
          {book.isPaid ? `$${(book.price / 100).toFixed(2)}` : 'FREE'}
        </div>
        {/* Genre badge */}
        {book.genre && (
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full">
            {book.genre}
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <span className="bg-white text-gray-900 text-sm font-bold px-6 py-2 rounded-full shadow-xl">
            Read Now
          </span>
        </div>
      </div>
      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {book.title}
        </h3>
        <p className="text-slate-500 text-xs mb-3 truncate">by <span className="font-medium text-slate-700">{book.author || 'Unknown'}</span></p>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            {(book.avgRating || 4.5).toFixed(1)}
          </span>
          <span className="flex items-center gap-1"><Eye size={11} /> {(book.views || 0).toLocaleString()}</span>
          <span className="flex items-center gap-1"><Heart size={11} /> {book.likes || 0}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function MarketplacePage({ user, onLogout }: Props) {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [sortBy, setSortBy] = useState('views');
  const [priceFilter, setPriceFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/hub/books`)
      .then(r => setBooks(Array.isArray(r.data) ? r.data : []))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = books
    .filter(b => {
      const matchSearch = !search || b.title?.toLowerCase().includes(search.toLowerCase()) || b.author?.toLowerCase().includes(search.toLowerCase());
      const matchGenre = genre === 'All' || b.genre === genre;
      const matchPrice = priceFilter === 'all' ||
        (priceFilter === 'free' && !b.isPaid) ||
        (priceFilter === 'paid' && b.isPaid) ||
        (priceFilter === 'under5' && b.isPaid && b.price < 500);
      return matchSearch && matchGenre && matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
      if (sortBy === 'rating') return (b.avgRating || 0) - (a.avgRating || 0);
      if (sortBy === 'free') return (a.isPaid ? 1 : 0) - (b.isPaid ? 1 : 0);
      return 0;
    });

  const featured = books.slice(0, 3);
  const trending = books.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  return (
    <AppShell user={user} onLogout={onLogout}>
      <div className="min-h-screen bg-slate-50">

        {/* Hero Banner */}
        <div className="bg-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(37,99,235,0.25),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.15),_transparent_60%)]" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

          <div className="relative z-10 w-full px-6 lg:px-10 py-14 lg:py-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
                <Flame size={12} className="text-orange-400" /> {books.length}+ books available
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
                Discover your next <span className="text-blue-400">great read.</span>
              </h1>
              <p className="text-gray-400 text-lg mb-8">
                Browse thousands of ebooks, novels, and comics from independent creators worldwide.
              </p>

              {/* Search bar */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search books, authors, genres..."
                    className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gray-700">
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-5 py-4 rounded-xl text-sm font-semibold transition-all shadow-lg ${showFilters ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-slate-50'}`}
                >
                  <SlidersHorizontal size={16} /> Filters
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white border-b border-gray-100 overflow-hidden shadow-sm"
            >
              <div className="w-full px-6 lg:px-10 py-5 flex flex-wrap gap-6">
                {/* Genre */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
                    <Tag size={10} /> Genre
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map(g => (
                      <button key={g} onClick={() => setGenre(g)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${genre === g ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Price */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Price</label>
                  <div className="flex gap-2">
                    {PRICES.map(p => (
                      <button key={p.value} onClick={() => setPriceFilter(p.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${priceFilter === p.value ? 'bg-gray-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Sort */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Sort by</label>
                  <div className="flex gap-2">
                    {SORTS.map(s => (
                      <button key={s.value} onClick={() => setSortBy(s.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${sortBy === s.value ? 'bg-gray-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full px-6 lg:px-10 py-10">

          {/* Featured Section */}
          {!search && genre === 'All' && featured.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <SparklesIcon size={18} className="text-blue-600" />
                <h2 className="text-xl font-extrabold text-gray-900">Featured Picks</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {featured.map((book, i) => (
                  <motion.div key={book.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    onClick={() => window.location.href = `/book/${book.id}`}
                    className="relative cursor-pointer rounded-2xl overflow-hidden h-52 group shadow-lg"
                  >
                    {book.coverImage
                      ? <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full bg-gradient-to-br from-blue-600 to-violet-700" />
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">{book.genre || 'Featured'}</p>
                      <h3 className="text-white font-bold text-lg leading-tight">{book.title}</h3>
                      <p className="text-gray-300 text-xs mt-1">by {book.author}</p>
                    </div>
                    {book.isPaid && (
                      <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        ${(book.price / 100).toFixed(2)}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Strip */}
          {!search && genre === 'All' && trending.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-orange-500" />
                  <h2 className="text-xl font-extrabold text-gray-900">Trending Now</h2>
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {trending.map((book, i) => (
                  <motion.div key={book.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    onClick={() => window.location.href = `/book/${book.id}`}
                    className="flex-shrink-0 w-32 cursor-pointer group"
                  >
                    <div className="relative w-32 h-44 rounded-xl overflow-hidden shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                      {book.coverImage
                        ? <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center"><BookOpen size={28} className="text-slate-400" /></div>
                      }
                      <div className="absolute top-2 left-2 w-6 h-6 bg-gray-900 text-white text-xs font-black rounded-full flex items-center justify-center">
                        {i + 1}
                      </div>
                    </div>
                    <p className="text-xs font-bold text-gray-900 mt-2 truncate">{book.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{book.author}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Main Grid */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-gray-900">
                {search ? `Results for "${search}"` : genre !== 'All' ? `${genre} Books` : 'All Books'}
              </h2>
              {!loading && (
                <span className="text-sm text-slate-400 font-medium">{filtered.length} books</span>
              )}
            </div>
            {/* Sort dropdown — desktop inline */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-slate-500">Sort:</span>
              <div className="relative">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2/3] bg-slate-200 rounded-2xl mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-4/5 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-slate-400" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">No books found</h3>
              <p className="text-slate-500 text-sm mb-5">Try adjusting your search or filters.</p>
              <button onClick={() => { setSearch(''); setGenre('All'); setPriceFilter('all'); }}
                className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filtered.map((book, idx) => (
                <BookCard key={book.id} book={book} idx={idx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
