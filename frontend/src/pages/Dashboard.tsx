import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BookOpen, Upload, TrendingUp, Eye, Heart, Star,
  Users, Zap, BarChart3, Target, Clock, Award,
  ChevronRight, Plus, Sparkles, Crown, ArrowUpRight,
  Book, Flame, Check, Settings, Activity, MessageSquare
} from 'lucide-react';
import AppShell from '../components/AppShell';

const API = 'http://localhost:8000';

/* ═══════════════════════════════════════════════════════════
   TYPES & INTERFACES
═══════════════════════════════════════════════════════════ */
interface DashboardProps {
  user?: any;
  onLogout?: () => void;
}

interface Book {
  id: string;
  title: string;
  genre: string;
  coverImage?: string;
  views: number;
  likes: number;
  avgRating: number;
  status: 'published' | 'draft' | 'trending';
  chapters?: number;
}

/* ═══════════════════════════════════════════════════════════
   ANIMATION VARIANTS
═══════════════════════════════════════════════════════════ */
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
};

const stagger = {
  show: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

/* ═══════════════════════════════════════════════════════════
   MINI COMPONENTS
═══════════════════════════════════════════════════════════ */

// Sparkline Chart
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const normalized = data.map(v => 1 - (v - min) / (max - min || 1));

  const width = 100;
  const height = 40;
  const points = normalized
    .map((v, i) => `${(i / (data.length - 1)) * width},${v * height}`)
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={(data.length - 1) * (width / (data.length - 1))}
        cy={normalized[normalized.length - 1] * height}
        r="3"
        fill={color}
      />
    </svg>
  );
}

// Progress Ring
function ProgressRing({
  progress,
  size = 60,
  strokeWidth = 6,
  color = '#0EA5E9'
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[13px] font-bold" style={{ color }}>
          {progress}%
        </span>
      </div>
    </div>
  );
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    published: { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
    draft: { bg: '#F8FAFC', text: '#475569', border: '#CBD5E1' },
    trending: { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  };

  const style = styles[status] || styles.draft;

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
      }}
    >
      {status}
    </span>
  );
}

// Skeleton Loader
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-lg ${className || ''}`} />
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Dashboard({ user, onLogout }: DashboardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview');

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? 'Good night' :
      hour < 12 ? 'Good morning' :
        hour < 17 ? 'Good afternoon' : 'Good evening';

  const firstName = user?.name?.split(' ')[0] || 'Author';

  // Fetch data
  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    Promise.all([
      axios.get(`${API}/api/social/analytics/${encodeURIComponent(user.email)}`).catch(() => ({ data: null })),
      axios.get(`${API}/api/hub/books?authorId=${encodeURIComponent(user.email)}`).catch(() => ({ data: [] })),
    ]).then(([analyticsRes, booksRes]) => {
      setAnalytics(analyticsRes.data);
      setBooks(Array.isArray(booksRes.data) ? booksRes.data : []);
    }).finally(() => {
      setLoading(false);
    });
  }, [user]);

  // Mock data fallback
  const stats = {
    totalBooks: analytics?.totalBooks || 12,
    totalViews: analytics?.totalViews || 48200,
    totalRevenue: 2840,
    avgRating: 4.8,
  };

  const mockBooks: Book[] = [
    {
      id: '1',
      title: 'The Lost Chronicles',
      genre: 'Fantasy',
      coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
      views: 12400,
      likes: 843,
      avgRating: 4.8,
      status: 'published',
      chapters: 24,
    },
    {
      id: '2',
      title: 'Neon Shadows',
      genre: 'Sci-Fi',
      coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
      views: 9100,
      likes: 621,
      avgRating: 4.6,
      status: 'trending',
      chapters: 18,
    },
    {
      id: '3',
      title: 'Beyond the Stars',
      genre: 'Romance',
      coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400',
      views: 7250,
      likes: 512,
      avgRating: 4.7,
      status: 'published',
      chapters: 32,
    },
    {
      id: '4',
      title: 'Midnight Whispers',
      genre: 'Mystery',
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
      views: 5800,
      likes: 430,
      avgRating: 4.5,
      status: 'draft',
      chapters: 14,
    },
  ];

  const displayBooks = books.length > 0 ? books : mockBooks;

  // KPI Cards
  const kpis = [
    {
      label: 'Total Books',
      value: stats.totalBooks,
      change: '+2 this month',
      icon: BookOpen,
      color: '#0EA5E9',
      trend: [8, 9, 8, 10, 11, 12],
    },
    {
      label: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      change: '↑ 14%',
      icon: Eye,
      color: '#8B5CF6',
      trend: [28000, 32000, 30000, 38000, 41000, 48200],
    },
    {
      label: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: '↑ 22%',
      icon: TrendingUp,
      color: '#10B981',
      trend: [900, 1200, 1050, 1600, 1900, 2840],
    },
    {
      label: 'Avg Rating',
      value: stats.avgRating,
      change: '94 reviews',
      icon: Star,
      color: '#F59E0B',
      trend: [4.1, 4.2, 4.1, 4.4, 4.5, 4.8],
    },
  ];

  // Quick Actions
  const quickActions = [
    { label: 'Upload Book', icon: Upload, to: '/upload', color: '#0EA5E9' },
    { label: 'Write', icon: Sparkles, to: '/studio', color: '#F59E0B' },
    { label: 'Analytics', icon: BarChart3, to: '/analytics', color: '#8B5CF6' },
    { label: 'Community', icon: Users, to: '/community', color: '#10B981' },
  ];

  // Goals
  const goals = [
    { label: 'Books Published', current: 2, target: 5, color: '#0EA5E9' },
    { label: 'Pages Written', current: 148, target: 200, color: '#8B5CF6' },
    { label: 'Writing Streak', current: 7, target: 30, color: '#F59E0B' },
  ];

  // Activity Feed
  const activities = [
    { icon: Heart, text: 'Aria Chen liked "The Lost Chronicles"', time: '3 min ago', color: '#EF4444' },
    { icon: Star, text: 'New 5-star review on "Neon Shadows"', time: '1 hour ago', color: '#F59E0B' },
    { icon: Eye, text: 'Milestone: 10,000 total views!', time: '3 hours ago', color: '#0EA5E9' },
    { icon: BookOpen, text: 'Chapter 7 published successfully', time: '1 day ago', color: '#10B981' },
    { icon: Users, text: 'Marcus Webb joined as co-author', time: '2 days ago', color: '#8B5CF6' },
  ];

  return (
    <AppShell user={user} onLogout={onLogout}>
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* ══════════════════════════════════
                HERO SECTION
            ══════════════════════════════════ */}
            <motion.div variants={fadeIn}>
              <div
                className="relative overflow-hidden rounded-3xl p-8 lg:p-12"
                style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                }}
              >
                {/* Decorative gradient */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'radial-gradient(circle at 20% 50%, #0EA5E9 0%, transparent 50%)',
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-slate-300 text-[13px] font-medium">
                      {greeting} · Dashboard Live
                    </span>
                  </div>

                  <h1 className="text-white text-[2.5rem] lg:text-[3.5rem] font-black tracking-tight mb-3">
                    Welcome back, {firstName}
                    <span className="text-cyan-400">.</span>
                  </h1>

                  <p className="text-slate-300 text-[16px] mb-8 max-w-2xl leading-relaxed">
                    You have <span className="text-white font-semibold">{stats.totalBooks} books</span> published with{' '}
                    <span className="text-white font-semibold">{stats.totalViews.toLocaleString()} total views</span>.
                    Keep creating amazing content!
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate('/upload')}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-[14px] hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/25 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Upload size={18} />
                      Upload New Book
                    </button>
                    <button
                      onClick={() => navigate('/studio')}
                      className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white font-semibold text-[14px] border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2"
                    >
                      <Sparkles size={18} />
                      Open Studio
                    </button>
                  </div>
                </div>

                {/* Mini Stats Grid */}
                <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
                  {[
                    { label: 'Followers', value: '1.2K', icon: Users, color: '#10B981' },
                    { label: 'Books Sold', value: '348', icon: Book, color: '#0EA5E9' },
                    { label: 'Revenue', value: '$2,840', icon: TrendingUp, color: '#F59E0B' },
                    { label: 'Global Rank', value: '#42', icon: Award, color: '#EF4444' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${stat.color}20` }}
                        >
                          <stat.icon size={16} style={{ color: stat.color }} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {stat.label}
                        </span>
                      </div>
                      <div className="text-white text-[24px] font-black">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ══════════════════════════════════
                KPI CARDS
            ══════════════════════════════════ */}
            <motion.div
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {kpis.map((kpi) => (
                <motion.div
                  key={kpi.label}
                  variants={fadeIn}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${kpi.color}15` }}
                    >
                      <kpi.icon size={24} style={{ color: kpi.color }} />
                    </div>
                    <Sparkline data={kpi.trend} color={kpi.color} />
                  </div>

                  <div className="text-[2rem] font-black text-slate-900 mb-1">
                    {loading ? <Skeleton className="w-20 h-8" /> : kpi.value}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-slate-600">
                      {kpi.label}
                    </span>
                    <span
                      className="text-[11px] font-bold px-2 py-1 rounded-lg"
                      style={{
                        backgroundColor: `${kpi.color}15`,
                        color: kpi.color
                      }}
                    >
                      {kpi.change}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* ══════════════════════════════════
                MAIN CONTENT GRID
            ══════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2/3) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Actions */}
                <motion.div
                  variants={fadeIn}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2">
                      <Zap size={20} className="text-amber-500" />
                      Quick Actions
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {quickActions.map((action) => (
                      <Link
                        key={action.to}
                        to={action.to}
                        className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-slate-100 hover:border-slate-300 bg-slate-50 hover:bg-white transition-all group"
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: `${action.color}15` }}
                        >
                          <action.icon size={22} style={{ color: action.color }} />
                        </div>
                        <span className="text-[13px] font-semibold text-slate-700 text-center">
                          {action.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </motion.div>

                {/* Recent Books */}
                <motion.div
                  variants={fadeIn}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <h2 className="text-[18px] font-bold text-slate-900">
                      Recent Books
                    </h2>
                    <Link
                      to="/library"
                      className="text-[13px] font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                    >
                      View all
                      <ChevronRight size={16} />
                    </Link>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {loading ? (
                      [1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4">
                          <Skeleton className="w-12 h-16 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="w-40 h-5" />
                            <Skeleton className="w-24 h-4" />
                          </div>
                        </div>
                      ))
                    ) : (
                      displayBooks.slice(0, 4).map((book) => (
                        <Link
                          key={book.id}
                          to={`/book/${book.id}`}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                        >
                          <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm">
                            {book.coverImage ? (
                              <img
                                src={book.coverImage}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen size={20} className="text-slate-300" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-[15px] font-semibold text-slate-900 truncate group-hover:text-cyan-600 transition-colors">
                              {book.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[12px] text-slate-500">
                                {book.genre}
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="text-[12px] text-slate-500">
                                {book.chapters} chapters
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-[13px] text-slate-600">
                            <div className="flex items-center gap-1">
                              <Eye size={14} className="text-slate-400" />
                              {book.views.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart size={14} className="text-slate-400" />
                              {book.likes.toLocaleString()}
                            </div>
                          </div>

                          <StatusBadge status={book.status} />

                          <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-400" />
                        </Link>
                      ))
                    )}
                  </div>
                </motion.div>

                {/* Activity Feed */}
                <motion.div
                  variants={fadeIn}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2">
                      <Activity size={20} className="text-purple-500" />
                      Recent Activity
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {activities.map((activity, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${activity.color}15` }}
                        >
                          <activity.icon size={18} style={{ color: activity.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-slate-900">
                            {activity.text}
                          </p>
                          <p className="text-[12px] text-slate-500 mt-0.5">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Right Column (1/3) */}
              <div className="space-y-6">
                {/* Pro Upgrade */}
                <motion.div variants={fadeIn}>
                  <div
                    className="rounded-2xl p-6 relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #451a03 0%, #78350f 100%)',
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: 'radial-gradient(circle at 70% 20%, #fbbf24 0%, transparent 70%)',
                      }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <Crown size={18} className="text-amber-400" />
                        <span className="text-[12px] font-black text-amber-400 uppercase tracking-widest">
                          Pro Plan
                        </span>
                      </div>

                      <h3 className="text-white text-[20px] font-bold mb-2">
                        Upgrade to Pro
                      </h3>
                      <p className="text-amber-200/80 text-[14px] mb-5 leading-relaxed">
                        Unlock unlimited AI tools, 100GB storage, and priority support
                      </p>

                      <ul className="space-y-3 mb-6">
                        {[
                          'Unlimited AI generation',
                          'Advanced analytics',
                          'Custom domains',
                          'Priority support',
                        ].map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-[13px] text-white">
                            <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0">
                              <Check size={12} className="text-amber-400" />
                            </div>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <button className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-bold text-[14px] py-3 rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all active:scale-98">
                        Start Free Trial
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Monthly Goals */}
                <motion.div
                  variants={fadeIn}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2">
                      <Target size={20} className="text-green-500" />
                      Monthly Goals
                    </h2>
                  </div>

                  <div className="space-y-5">
                    {goals.map((goal) => {
                      const progress = Math.round((goal.current / goal.target) * 100);
                      return (
                        <div key={goal.label} className="flex items-center gap-4">
                          <ProgressRing
                            progress={progress}
                            size={56}
                            strokeWidth={5}
                            color={goal.color}
                          />
                          <div className="flex-1">
                            <p className="text-[14px] font-semibold text-slate-900 mb-1">
                              {goal.label}
                            </p>
                            <p className="text-[13px] text-slate-600">
                              {goal.current} / {goal.target}
                            </p>
                            <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: goal.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <button className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-[13px] font-semibold text-slate-500 hover:border-cyan-300 hover:text-cyan-600 hover:bg-cyan-50 transition-all flex items-center justify-center gap-2">
                      <Plus size={16} />
                      Add New Goal
                    </button>
                  </div>
                </motion.div>

                {/* Trending Books */}
                <motion.div
                  variants={fadeIn}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2">
                      <Flame size={20} className="text-orange-500" />
                      Trending
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {[
                      { title: 'The Midnight Library', reads: '2.1M', rating: 4.8 },
                      { title: 'Atomic Habits', reads: '3.4M', rating: 4.9 },
                      { title: 'Project Hail Mary', reads: '1.2M', rating: 4.9 },
                    ].map((book, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[14px] font-semibold text-slate-900 truncate">
                            {book.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-[12px] text-slate-600">{book.rating}</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-[12px] text-slate-500">{book.reads}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}