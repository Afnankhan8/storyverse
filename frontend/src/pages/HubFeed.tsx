import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, ChevronRight, Search, BookOpen, Flame, PenTool } from 'lucide-react';
import AppShell from '../components/AppShell';

const API = 'http://localhost:8000';

const CATEGORIES = ['All', 'Action', 'Adventure', 'Comedy', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi'];
const FORMATS = ['Comics', 'Novels', 'Short Reads', 'Audiobooks'];

function BookCard({ book, idx }: { book: any; idx: number }) {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: idx * 0.05 }}
      onClick={() => navigate(`/book/${book.id}`)}
      className="group cursor-pointer flex flex-col h-full"
    >
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-4 shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:border-blue-300">
        {book.coverImage ? (
          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <BookOpen size={48} className="text-slate-300" />
          </div>
        )}
        
        {book.isPaid && (
          <div className="absolute top-3 left-3 bg-blue-600 text-white text-[12px] font-extrabold px-3 py-1 rounded-full shadow-md">
            ${(book.price / 100).toFixed(2)}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <span className="bg-white text-slate-900 text-sm font-bold px-6 py-2.5 rounded-full shadow-xl transform scale-95 group-hover:scale-100 transition-transform duration-300">
            View Details
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-1">
        <h3 className="font-extrabold text-slate-900 text-[17px] sm:text-[19px] leading-tight mb-1.5 line-clamp-2 group-hover:text-blue-600 transition-colors" style={{ fontFamily: 'var(--font-b)' }}>
          {book.title}
        </h3>
        <p className="text-slate-500 text-[14px] font-medium mb-3 truncate">by <span className="hover:underline text-slate-700">{book.author || 'Unknown Author'}</span></p>
        
        <div className="flex items-center gap-1.5 mt-auto">
          <div className="flex text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={16} fill={star <= (book.avgRating || 4.5) ? 'currentColor' : 'none'} className={star > (book.avgRating || 4.5) ? 'text-slate-300' : ''} />
            ))}
          </div>
          <span className="text-slate-500 text-[13px] font-medium ml-1">({book.views || 0})</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function HubFeed({ user, onLogout }: { user?: any, onLogout?: () => void }) {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeFormat, setActiveFormat] = useState('Comics');
  const [sort, setSort] = useState('latest');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/api/social/search`, { 
      params: { 
        q: search, 
        genre: activeCategory === 'All' ? '' : activeCategory.toLowerCase(), 
        sort 
      } 
    })
    .then((r) => {
      setBooks(r.data.results || []);
    })
    .catch(() => {})
    .finally(() => setLoading(false));
  }, [search, activeCategory, sort]);

  return (
    <AppShell user={user} onLogout={onLogout}>
      <div className="min-h-screen bg-slate-50 w-full" style={{ fontFamily: 'var(--font-b)' }}>
        
        {/* Store Secondary Nav */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="w-full px-6 md:px-10 mx-auto h-[60px] flex items-center justify-between overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-8 display-font text-xl font-bold">
              <span className="text-slate-900 whitespace-nowrap cursor-pointer hover:text-blue-600 border-b-2 border-slate-900 py-4">All Content</span>
              <span className="text-slate-500 whitespace-nowrap cursor-pointer hover:text-slate-900 py-4 transition-colors">Books</span>
              <span className="text-slate-500 whitespace-nowrap cursor-pointer hover:text-slate-900 py-4 transition-colors">Comics</span>
              <span className="text-slate-500 whitespace-nowrap cursor-pointer hover:text-slate-900 py-4 transition-colors">Novels</span>
              <span className="text-slate-500 whitespace-nowrap cursor-pointer hover:text-slate-900 py-4 transition-colors">New Releases</span>
              <span className="text-slate-500 whitespace-nowrap cursor-pointer hover:text-slate-900 py-4 transition-colors flex items-center gap-1.5"><Flame size={16} className="text-orange-500" /> Best Sellers</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/creator')}
                className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-full display-font text-lg font-bold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <PenTool size={18} /> Publish Your Story
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area - Full Width */}
        <div className="w-full px-6 md:px-10 mx-auto py-10 flex flex-col md:flex-row gap-10 items-start">
          
          {/* Left Sidebar Filters */}
          <div className="w-full md:w-[260px] flex-shrink-0 sticky top-[80px]">
            <h2 className="display-font text-[16px] font-extrabold text-slate-900 uppercase tracking-widest mb-6">Department</h2>
            
            <div className="mb-8">
              <h3 className="display-font text-slate-900 font-bold text-2xl mb-3">Format</h3>
              <ul className="space-y-1.5">
                {FORMATS.map(f => (
                  <li key={f}>
                    <button 
                      onClick={() => setActiveFormat(f)}
                      className={`text-[15px] w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors ${activeFormat === f ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      {activeFormat === f && <ChevronRight size={16} className="text-blue-600" />}
                      {f}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="display-font text-slate-900 font-bold text-2xl mb-3">Categories</h3>
              <ul className="space-y-1.5">
                {CATEGORIES.map(c => (
                  <li key={c}>
                    <button 
                      onClick={() => setActiveCategory(c)}
                      className={`text-[15px] w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors ${activeCategory === c ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      {activeCategory === c && <ChevronRight size={16} className="text-blue-600" />}
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="display-font text-slate-900 font-bold text-2xl mb-3">Customer Reviews</h3>
              <ul className="space-y-3 px-2">
                {[4, 3, 2, 1].map(stars => (
                  <li key={stars}>
                    <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 group transition-colors">
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={18} fill={s <= stars ? 'currentColor' : 'none'} className={s > stars ? 'text-slate-300' : ''} />
                        ))}
                      </div>
                      <span className="text-[14px] font-medium group-hover:underline">& Up</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Main Grid */}
          <div className="flex-1 min-w-0 w-full">
            {/* Header & Search */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-6 border-b border-slate-200">
              <div>
                <h1 className="display-font text-4xl lg:text-5xl font-bold text-slate-900 mb-2 tracking-tight">
                  {activeCategory === 'All' ? 'Discover Great Reads' : `${activeCategory} ${activeFormat}`}
                </h1>
                <p className="text-slate-500 text-[16px] font-medium">Showing {books.length} stunning results in our catalog.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-80">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search titles, authors, genres..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 rounded-full py-3 pl-11 pr-4 text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                  />
                </div>
                <select 
                  value={sort} 
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full sm:w-auto bg-white border-2 border-slate-200 text-slate-700 text-[15px] font-bold rounded-full py-3 pl-4 pr-10 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer shadow-sm transition-all appearance-none"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                >
                  <option value="latest">Sort by: Latest</option>
                  <option value="popular">Sort by: Popularity</option>
                  <option value="liked">Sort by: Reviews</option>
                </select>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="flex justify-center items-center py-32">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <BookOpen size={64} className="mx-auto text-slate-300 mb-6" />
                <h3 className="display-font text-3xl font-bold text-slate-900 mb-3">No results found</h3>
                <p className="text-slate-500 text-[16px] max-w-md mx-auto">We couldn't find any stories matching your current filters and search terms. Try adjusting them!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-12">
                {books.map((b, i) => (
                  <BookCard key={b.id} book={b} idx={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </AppShell>
  );
}

