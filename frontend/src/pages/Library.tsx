import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BookOpen, Search, Grid3X3, List, Star, Eye, Heart,
  MoreVertical, Trash2, Archive, BookMarked, Upload,
  ChevronDown, X, SlidersHorizontal, Clock, Plus,
  Share2, Download, Edit3, CheckCircle2, BookmarkPlus,
  TrendingUp, Award, Sparkles, Layers, Bookmark,
  PlayCircle, PauseCircle, Filter
} from 'lucide-react';
import AppShell from '../components/AppShell';

const API = 'http://localhost:8000';

/* ═══════════════════════════════════════════════════════════
   TYPES & INTERFACES
═══════════════════════════════════════════════════════════ */
interface Book {
  id: string;
  title: string;
  author?: string;
  genre?: string;
  coverImage?: string;
  views?: number;
  likes?: number;
  avgRating?: number;
  progress?: number;
  tags?: string[];
  status?: 'reading' | 'completed' | 'paused' | 'unread';
  updatedAt?: string;
  description?: string;
  pages?: number;
  publishedDate?: string;
}

interface Props {
  user?: any;
  onLogout?: () => void;
}

type ViewMode = 'grid' | 'list' | 'shelf';
type SortOption = 'recent' | 'title' | 'views' | 'rating' | 'progress' | 'alphabetical';
type StatusFilter = 'all' | 'reading' | 'completed' | 'paused' | 'unread';

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
const GENRES = [
  'All', 'Fiction', 'Non-Fiction', 'Fantasy', 'Sci-Fi',
  'Mystery', 'Romance', 'Horror', 'Biography', 'Self-Help',
  'Business', 'History', 'Poetry'
];

const SORT_OPTIONS: { label: string; value: SortOption; icon: any }[] = [
  { label: 'Recently Added', value: 'recent', icon: Clock },
  { label: 'Title (A-Z)', value: 'alphabetical', icon: Layers },
  { label: 'Most Viewed', value: 'views', icon: Eye },
  { label: 'Highest Rated', value: 'rating', icon: Star },
  { label: 'Reading Progress', value: 'progress', icon: TrendingUp },
];

const STATUS_FILTERS: { label: string; value: StatusFilter; color: string; icon: any }[] = [
  { label: 'All Books', value: 'all', color: '#64748B', icon: Layers },
  { label: 'Currently Reading', value: 'reading', color: '#0EA5E9', icon: PlayCircle },
  { label: 'Completed', value: 'completed', color: '#10B981', icon: CheckCircle2 },
  { label: 'Paused', value: 'paused', color: '#F59E0B', icon: PauseCircle },
  { label: 'Unread', value: 'unread', color: '#94A3B8', icon: BookMarked },
];

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Library({ user, onLogout }: Props) {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortOption>('recent');
  const [view, setView] = useState<ViewMode>('grid');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Fetch books
  useEffect(() => {
    if (!user?.email) {
      // Mock data fallback
      setBooks(generateMockBooks());
      setLoading(false);
      return;
    }

    axios
      .get(`${API}/api/hub/books?authorId=${encodeURIComponent(user.email)}`, {
        timeout: 5000,
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setBooks(data.length > 0 ? data : generateMockBooks());
      })
      .catch(() => setBooks(generateMockBooks()))
      .finally(() => setLoading(false));
  }, [user]);

  // Mock book generator
  function generateMockBooks(): Book[] {
    return [
      {
        id: '1',
        title: 'The Lost Chronicles',
        author: 'You',
        genre: 'Fantasy',
        coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
        views: 12400,
        likes: 843,
        avgRating: 4.8,
        progress: 78,
        status: 'reading',
        pages: 324,
      },
      {
        id: '2',
        title: 'Neon Shadows',
        author: 'You',
        genre: 'Sci-Fi',
        coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
        views: 9100,
        likes: 621,
        avgRating: 4.6,
        progress: 100,
        status: 'completed',
        pages: 286,
      },
      {
        id: '3',
        title: 'Beyond the Stars',
        author: 'You',
        genre: 'Romance',
        coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
        views: 7250,
        likes: 512,
        avgRating: 4.7,
        progress: 45,
        status: 'reading',
        pages: 412,
      },
      {
        id: '4',
        title: 'Midnight Whispers',
        author: 'You',
        genre: 'Mystery',
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
        views: 5800,
        likes: 430,
        avgRating: 4.5,
        progress: 0,
        status: 'unread',
        pages: 298,
      },
      {
        id: '5',
        title: 'The Hollow Earth',
        author: 'You',
        genre: 'Adventure',
        coverImage: 'https://images.unsplash.com/photo-1531901599143-df5010ab9438?w=400&h=600&fit=crop',
        views: 4200,
        likes: 310,
        avgRating: 4.4,
        progress: 23,
        status: 'paused',
        pages: 356,
      },
      {
        id: '6',
        title: 'Ocean Symphony',
        author: 'You',
        genre: 'Fiction',
        coverImage: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&h=600&fit=crop',
        views: 3800,
        likes: 280,
        avgRating: 4.3,
        progress: 0,
        status: 'unread',
        pages: 234,
      },
    ];
  }

  // Filtered & sorted books
  const filtered = useMemo(() => {
    return books
      .filter((book) => {
        // Search filter
        const query = search.toLowerCase();
        const matchSearch =
          !query ||
          book.title.toLowerCase().includes(query) ||
          (book.author || '').toLowerCase().includes(query) ||
          (book.genre || '').toLowerCase().includes(query);

        // Genre filter
        const matchGenre = genre === 'All' || book.genre === genre;

        // Status filter
        const matchStatus =
          statusFilter === 'all' || book.status === statusFilter;

        return matchSearch && matchGenre && matchStatus;
      })
      .sort((a, b) => {
        switch (sort) {
          case 'alphabetical':
            return a.title.localeCompare(b.title);
          case 'title':
            return a.title.localeCompare(b.title);
          case 'views':
            return (b.views || 0) - (a.views || 0);
          case 'rating':
            return (b.avgRating || 0) - (a.avgRating || 0);
          case 'progress':
            return (b.progress || 0) - (a.progress || 0);
          default:
            return 0;
        }
      });
  }, [books, search, genre, statusFilter, sort]);

  // Stats
  const stats = useMemo(() => ({
    total: books.length,
    reading: books.filter(b => b.status === 'reading').length,
    completed: books.filter(b => b.status === 'completed').length,
    favorites: favorites.size,
  }), [books, favorites]);

  // Actions
  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const removeBook = (id: string) => {
    setBooks((prev) => prev.filter((book) => book.id !== id));
    setActiveMenu(null);
  };

  const clearFilters = () => {
    setSearch('');
    setGenre('All');
    setStatusFilter('all');
    setSort('recent');
  };

  /* ─────────────────────────────────────────────────────────
     BOOK CARD COMPONENT (Grid View)
  ───────────────────────────────────────────────────────── */
  const BookCard = ({ book }: { book: Book }) => {
    const isFav = favorites.has(book.id);
    const menuOpen = activeMenu === book.id;
    const statusConfig = STATUS_FILTERS.find(s => s.value === book.status);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3, }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden group relative"
      >
        {/* Cover Image */}
        <div
          className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 cursor-pointer"
          onClick={() => navigate(`/book/${book.id}`)}
        >
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-100 via-blue-100 to-purple-100 flex items-center justify-center">
              <BookOpen size={48} className="text-cyan-400" />
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/book/${book.id}`);
              }}
              className="w-full bg-white text-slate-900 text-[13px] font-bold py-2.5 rounded-xl hover:bg-cyan-500 hover:text-white transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <BookOpen size={14} />
              Open Reader
            </button>
          </div>

          {/* Top Actions */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(book.id);
              }}
              className={`
                w-9 h-9 rounded-xl flex items-center justify-center transition-all backdrop-blur-md
                ${isFav
                  ? 'bg-amber-400 text-white shadow-lg scale-100'
                  : 'bg-white/90 text-slate-600 opacity-0 group-hover:opacity-100 hover:bg-amber-400 hover:text-white scale-90 group-hover:scale-100'
                }
              `}
            >
              <Star size={16} className={isFav ? 'fill-white' : ''} />
            </button>

            {/* Status Badge */}
            {book.status && book.status !== 'unread' && (
              <div
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1"
                style={{
                  backgroundColor: `${statusConfig?.color}E6`,
                  color: '#fff',
                }}
              >
                {statusConfig?.icon && <statusConfig.icon size={10} />}
                {book.status}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {book.progress !== undefined && book.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${book.progress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
              />
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className="font-bold text-slate-900 text-[14px] leading-tight line-clamp-2 flex-1 cursor-pointer hover:text-cyan-600 transition-colors"
              onClick={() => navigate(`/book/${book.id}`)}
            >
              {book.title}
            </h3>

            {/* Menu Button */}
            <div className="relative flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(menuOpen ? null : book.id);
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
              >
                <MoreVertical size={14} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {[
                      { icon: BookOpen, label: 'Open Reader', action: () => navigate(`/book/${book.id}`) },
                      { icon: Edit3, label: 'Edit Details', action: () => setActiveMenu(null) },
                      { icon: Star, label: isFav ? 'Remove Favorite' : 'Add to Favorites', action: () => { toggleFavorite(book.id); setActiveMenu(null); } },
                      { icon: Share2, label: 'Share Book', action: () => setActiveMenu(null) },
                      { icon: Download, label: 'Download PDF', action: () => setActiveMenu(null) },
                      { icon: Archive, label: 'Archive', action: () => setActiveMenu(null) },
                      { icon: Trash2, label: 'Delete', action: () => removeBook(book.id), danger: true },
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={item.action}
                        className={`
                          w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors text-left
                          ${item.danger
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-slate-700 hover:bg-slate-50'
                          }
                        `}
                      >
                        <item.icon size={14} className={item.danger ? 'text-red-500' : 'text-slate-400'} />
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Genre & Pages */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-3">
            <span className="font-medium">{book.genre || 'General'}</span>
            {book.pages && (
              <>
                <span className="text-slate-300">·</span>
                <span>{book.pages} pages</span>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Eye size={11} />
              {(book.views || 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={11} />
              {book.likes || 0}
            </span>
            {book.avgRating && book.avgRating > 0 && (
              <span className="flex items-center gap-1">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                {book.avgRating}
              </span>
            )}
          </div>

          {/* Progress Indicator */}
          {book.progress !== undefined && book.progress > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-cyan-600">
                  {book.progress}% complete
                </span>
                {book.progress === 100 && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    Finished
                  </span>
                )}
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${book.progress}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  /* ─────────────────────────────────────────────────────────
     BOOK ROW COMPONENT (List View)
  ───────────────────────────────────────────────────────── */
  const BookRow = ({ book }: { book: Book }) => {
    const isFav = favorites.has(book.id);
    const menuOpen = activeMenu === book.id;
    const statusConfig = STATUS_FILTERS.find(s => s.value === book.status);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group p-4"
      >
        <div className="flex items-center gap-4">
          {/* Cover */}
          <div
            className="w-14 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 cursor-pointer shadow-md"
            onClick={() => navigate(`/book/${book.id}`)}
          >
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                <BookOpen size={20} className="text-cyan-400" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3
                className="font-bold text-slate-900 text-[15px] truncate cursor-pointer hover:text-cyan-600 transition-colors"
                onClick={() => navigate(`/book/${book.id}`)}
              >
                {book.title}
              </h3>
              {book.status && book.status !== 'unread' && (
                <div
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 flex-shrink-0"
                  style={{
                    backgroundColor: `${statusConfig?.color}15`,
                    color: statusConfig?.color,
                  }}
                >
                  {statusConfig?.icon && <statusConfig.icon size={10} />}
                  {book.status}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[12px] text-slate-500 mb-2">
              <span>{book.genre || 'General'}</span>
              {book.pages && (
                <>
                  <span className="text-slate-300">·</span>
                  <span>{book.pages} pages</span>
                </>
              )}
            </div>

            {/* Progress bar */}
            {book.progress !== undefined && book.progress > 0 && (
              <div className="flex items-center gap-3 max-w-md">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${book.progress}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  />
                </div>
                <span className="text-[11px] font-bold text-cyan-600">
                  {book.progress}%
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-5 text-[12px] text-slate-600 font-medium flex-shrink-0">
            <span className="flex items-center gap-1.5">
              <Eye size={13} className="text-slate-400" />
              {(book.views || 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Heart size={13} className="text-slate-400" />
              {book.likes || 0}
            </span>
            {book.avgRating && book.avgRating > 0 && (
              <span className="flex items-center gap-1.5">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                {book.avgRating}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => toggleFavorite(book.id)}
              className={`
                w-9 h-9 rounded-xl flex items-center justify-center transition-all
                ${isFav
                  ? 'text-amber-500 bg-amber-50'
                  : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                }
              `}
            >
              <Star size={16} className={isFav ? 'fill-amber-400' : ''} />
            </button>

            <button
              onClick={() => navigate(`/book/${book.id}`)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[12px] font-bold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              Read
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(menuOpen ? null : book.id);
                }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
              >
                <MoreVertical size={14} />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {[
                      { icon: Edit3, label: 'Edit Details', action: () => setActiveMenu(null) },
                      { icon: Share2, label: 'Share Book', action: () => setActiveMenu(null) },
                      { icon: Download, label: 'Download PDF', action: () => setActiveMenu(null) },
                      { icon: Archive, label: 'Archive', action: () => setActiveMenu(null) },
                      { icon: Trash2, label: 'Delete', action: () => removeBook(book.id), danger: true },
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={item.action}
                        className={`
                          w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors text-left
                          ${item.danger
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-slate-700 hover:bg-slate-50'
                          }
                        `}
                      >
                        <item.icon size={14} className={item.danger ? 'text-red-500' : 'text-slate-400'} />
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <AppShell user={user} onLogout={onLogout}>
      <div
        onClick={() => setActiveMenu(null)}
        className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50"
      >
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          {/* ══════════════════════════════════
              HEADER
          ══════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <BookMarked size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-[2.25rem] lg:text-[2.75rem] font-black text-slate-900 tracking-tight">
                    My Library
                  </h1>
                  <p className="text-slate-600 text-[14px] mt-0.5">
                    {filtered.length} of {books.length} books shown
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/upload')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-[14px] hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
              >
                <Upload size={18} />
                Upload Book
              </button>
            </div>
          </motion.div>

          {/* ══════════════════════════════════
              QUICK STATS
          ══════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {[
              { label: 'Total Books', value: stats.total, icon: BookOpen, color: '#0EA5E9' },
              { label: 'Currently Reading', value: stats.reading, icon: PlayCircle, color: '#8B5CF6' },
              { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: '#10B981' },
              { label: 'Favorites', value: stats.favorites, icon: Star, color: '#F59E0B' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon size={20} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div className="text-[24px] font-black text-slate-900 leading-none">
                      {stat.value}
                    </div>
                    <div className="text-[12px] text-slate-500 font-medium mt-1">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* ══════════════════════════════════
              TOOLBAR
          ══════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6"
          >
            {/* Search & Controls */}
            <div className="flex flex-col lg:flex-row gap-3 mb-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, author, or genre..."
                  className="w-full pl-11 pr-10 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-slate-400 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-all"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="appearance-none pl-4 pr-10 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-[14px] text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer min-w-[180px]"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setView('grid')}
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center transition-all
                    ${view === 'grid'
                      ? 'bg-white shadow-md text-cyan-600'
                      : 'text-slate-400 hover:text-slate-600'
                    }
                  `}
                  title="Grid view"
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center transition-all
                    ${view === 'list'
                      ? 'bg-white shadow-md text-cyan-600'
                      : 'text-slate-400 hover:text-slate-600'
                    }
                  `}
                  title="List view"
                >
                  <List size={18} />
                </button>
              </div>

              {/* Clear Filters */}
              {(search || genre !== 'All' || statusFilter !== 'all' || sort !== 'recent') && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all"
                >
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2 mb-3">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all
                    ${statusFilter === filter.value
                      ? 'text-white shadow-md'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }
                  `}
                  style={statusFilter === filter.value ? { backgroundColor: filter.color } : {}}
                >
                  <filter.icon size={14} />
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Genre Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => setGenre(g)}
                  className={`
                    flex-shrink-0 px-4 py-2 rounded-xl text-[13px] font-bold transition-all
                    ${genre === g
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                      : 'bg-slate-50 border-2 border-slate-200 text-slate-600 hover:border-cyan-300 hover:text-cyan-600'
                    }
                  `}
                >
                  {g}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ══════════════════════════════════
              CONTENT
          ══════════════════════════════════ */}
          {loading ? (
            // Loading State
            <div
              className={
                view === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5'
                  : 'space-y-3'
              }
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`
                    animate-pulse bg-white rounded-2xl border border-slate-200
                    ${view === 'grid' ? 'aspect-[3/4]' : 'h-24'}
                  `}
                >
                  <div className="w-full h-full bg-slate-100 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            // Empty State
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 px-6"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                <BookMarked size={40} className="text-cyan-500" />
              </div>

              <h3 className="text-[24px] font-bold text-slate-900 mb-2 text-center">
                {search || genre !== 'All' || statusFilter !== 'all'
                  ? 'No books match your filters'
                  : 'Your library is empty'
                }
              </h3>

              <p className="text-slate-600 text-[15px] mb-8 text-center max-w-md">
                {search
                  ? `No results for "${search}". Try adjusting your search or filters.`
                  : genre !== 'All' || statusFilter !== 'all'
                    ? 'Try selecting different filters to find your books.'
                    : 'Start building your collection by uploading your first book.'}
              </p>

              <div className="flex flex-wrap gap-3 justify-center">
                {(search || genre !== 'All' || statusFilter !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-semibold text-[14px] hover:border-slate-300 hover:bg-slate-50 transition-all"
                  >
                    <X size={16} />
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={() => navigate('/upload')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-[14px] hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
                >
                  <Upload size={16} />
                  Upload Your First Book
                </button>
              </div>
            </motion.div>
          ) : view === 'grid' ? (
            // Grid View
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5"
            >
              <AnimatePresence>
                {filtered.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            // List View
            <motion.div layout className="space-y-3">
              <AnimatePresence>
                {filtered.map((book) => (
                  <BookRow key={book.id} book={book} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </AppShell>
  );
}