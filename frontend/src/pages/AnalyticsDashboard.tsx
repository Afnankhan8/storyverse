/**
 * AnalyticsDashboard.tsx
 * Professional analytics dashboard with interactive charts & insights
 * Following design standards from Goodreads, Wattpad, and Medium
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart3, Eye, Heart, Star, BookOpen, TrendingUp, ArrowUpRight,
  Crown, Download, Users, Clock, ChevronRight, ArrowDownRight,
  Sparkles, Target, Calendar, Filter, Share2, MessageSquare,
  ThumbsUp, Bookmark, Globe, Zap, Award, Activity
} from 'lucide-react';
import AppShell from '../components/AppShell';

const API = 'http://localhost:8000';

/* ═══════════════════════════════════════════════════════════
   TYPES & INTERFACES
═══════════════════════════════════════════════════════════ */
interface Props {
  user?: any;
  onLogout?: () => void;
}

interface BookAnalytics {
  id: string;
  title: string;
  views: number;
  likes: number;
  avgRating: number;
  reads: number;
  comments: number;
  shares: number;
}

type TimePeriod = '7d' | '30d' | '90d' | 'all';

/* ═══════════════════════════════════════════════════════════
   ANIMATION VARIANTS
═══════════════════════════════════════════════════════════ */
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeInOut"0.4, 0, 0.2, 1] }
  }
};

const stagger = {
  show: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

/* ═══════════════════════════════════════════════════════════
   CHART COMPONENTS
═══════════════════════════════════════════════════════════ */

// Bar Chart Component
function BarChart({
  data,
  labels,
  color = '#0EA5E9',
  maxHeight = 120
}: {
  data: number[];
  labels: string[];
  color?: string;
  maxHeight?: number;
}) {
  const max = Math.max(...data, 1);

  return (
    <div className="flex items-end gap-3 px-2" style={{ height: maxHeight }}>
      {data.map((value, i) => {
        const height = (value / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full relative group">
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {value.toLocaleString()}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
              </div>

              {/* Bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.1,
                  ease: "easeInOut"0.4, 0, 0.2, 1]
                }}
              className="w-full rounded-t-xl relative overflow-hidden cursor-pointer"
              style={{
                backgroundColor: color,
                minHeight: '8px',
                boxShadow: `0 4px 14px -4px ${color}40`
              }}
              >
              {/* Shimmer effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)`
                }}
              />
            </motion.div>
          </div>

            {/* Label */ }
        <span className="text-[11px] font-semibold text-slate-500">
          {labels[i]}
        </span>
          </div>
  );
})}
    </div >
  );
}

// Line Chart (Sparkline)
function LineChart({
  data,
  color = '#0EA5E9',
  width = 100,
  height = 40,
  showDots = false
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  showDots?: boolean;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return { x, y, value };
  });

  const pathData = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`
  ).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path
        d={`${pathData} L ${width},${height} L 0,${height} Z`}
        fill={`url(#gradient-${color})`}
      />

      {/* Line */}
      <motion.path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />

      {/* Dots */}
      {showDots && points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill="#fff"
          stroke={color}
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

// Progress Ring
function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color = '#0EA5E9',
  label
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
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
          transition={{ duration: 1.5, ease: "easeInOut"0.4, 0, 0.2, 1], delay: 0.3 }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[20px] font-black" style={{ color }}>
          {progress}%
        </span>
        {label && (
          <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

// Skeleton Loader
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-lg ${className || ''}`} />
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function AnalyticsDashboard({ user, onLogout }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [period, setPeriod] = useState<TimePeriod>('30d');

  // Fetch analytics data
  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    axios
      .get(`${API}/api/social/analytics/${encodeURIComponent(user.email)}`)
      .then((res) => setAnalytics(res.data))
      .catch(() =>
        setAnalytics({
          totalViews: 0,
          totalLikes: 0,
          totalBooks: 0,
          books: []
        })
      )
      .finally(() => setLoading(false));
  }, [user]);

  // Mock data for charts
  const mockWeeklyViews = [2840, 3920, 3150, 4580, 4120, 5340, 6210];
  const mockWeeklyReads = [1240, 1680, 1390, 2140, 1920, 2580, 3120];
  const mockDailyEngagement = [45, 52, 48, 67, 59, 73, 68, 81, 76, 89, 85, 94];
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // KPI Cards Data
  const kpis = [
    {
      label: 'Total Views',
      value: (analytics?.totalViews || 48200).toLocaleString(),
      change: '+14.2%',
      trend: 'up',
      icon: Eye,
      color: '#0EA5E9',
      sparkData: [23000, 28000, 26000, 35000, 32000, 41000, 48200]
    },
    {
      label: 'Total Likes',
      value: (analytics?.totalLikes || 3840).toLocaleString(),
      change: '+8.5%',
      trend: 'up',
      icon: Heart,
      color: '#EF4444',
      sparkData: [1800, 2100, 1950, 2600, 2400, 3100, 3840]
    },
    {
      label: 'Active Readers',
      value: '2,341',
      change: '+22.1%',
      trend: 'up',
      icon: Users,
      color: '#8B5CF6',
      sparkData: [980, 1240, 1120, 1580, 1720, 1980, 2341]
    },
    {
      label: 'Avg. Rating',
      value: analytics?.books?.length
        ? (
          analytics.books.reduce((sum: number, book: any) => sum + (book.avgRating || 0), 0) /
          analytics.books.length
        ).toFixed(1)
        : '4.8',
      change: '+0.3',
      trend: 'up',
      icon: Star,
      color: '#F59E0B',
      sparkData: [4.1, 4.3, 4.2, 4.5, 4.4, 4.6, 4.8]
    },
    {
      label: 'Total Books',
      value: (analytics?.totalBooks || 12).toString(),
      change: '+2',
      trend: 'up',
      icon: BookOpen,
      color: '#10B981',
      sparkData: [5, 6, 7, 8, 9, 11, 12]
    },
    {
      label: 'Avg. Read Time',
      value: '8.4 min',
      change: '-0.3 min',
      trend: 'down',
      icon: Clock,
      color: '#06B6D4',
      sparkData: [9.2, 9.0, 9.1, 8.8, 8.9, 8.5, 8.4]
    }
  ];

  // Loading State
  if (loading) {
    return (
      <AppShell user={user} onLogout={onLogout}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8">
          <div className="max-w-[1600px] mx-auto">
            {/* Header skeleton */}
            <div className="mb-8">
              <Skeleton className="w-64 h-12 mb-3" />
              <Skeleton className="w-96 h-5" />
            </div>

            {/* KPI skeletons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6">
                  <Skeleton className="w-12 h-12 mb-4" />
                  <Skeleton className="w-24 h-8 mb-2" />
                  <Skeleton className="w-32 h-4" />
                </div>
              ))}
            </div>

            {/* Chart skeletons */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Skeleton className="w-full h-80" />
              <Skeleton className="w-full h-80" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={user} onLogout={onLogout}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* ══════════════════════════════════
                HEADER
            ══════════════════════════════════ */}
            <motion.div variants={fadeIn} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <h1 className="text-[2.5rem] lg:text-[3rem] font-black text-slate-900 tracking-tight mb-2">
                  Analytics Dashboard
                </h1>
                <p className="text-slate-600 text-[15px] max-w-2xl leading-relaxed">
                  Track your performance, understand your audience, and grow your readership with actionable insights.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Time Period Selector */}
                <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                  {(['7d', '30d', '90d', 'all'] as TimePeriod[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`
                        px-4 py-2 rounded-lg text-[13px] font-bold transition-all
                        ${period === p
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }
                      `}
                    >
                      {p === 'all' ? 'All Time' : p.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Export Button */}
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-semibold text-[14px] hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm active:scale-98">
                  <Download size={18} />
                  Export
                </button>
              </div>
            </motion.div>

            {/* ══════════════════════════════════
                KPI CARDS
            ══════════════════════════════════ */}
            <motion.div
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {kpis.map((kpi, index) => (
                <motion.div
                  key={kpi.label}
                  variants={fadeIn}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${kpi.color}15` }}
                    >
                      <kpi.icon size={24} style={{ color: kpi.color }} />
                    </div>

                    {/* Sparkline */}
                    <LineChart data={kpi.sparkData} color={kpi.color} width={90} height={36} />
                  </div>

                  {/* Value */}
                  <div className="text-[2rem] font-black text-slate-900 mb-1">
                    {kpi.value}
                  </div>

                  {/* Label & Change */}
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-slate-600">
                      {kpi.label}
                    </span>
                    <span
                      className={`
                        flex items-center gap-1 text-[12px] font-bold px-2.5 py-1 rounded-lg
                        ${kpi.trend === 'up'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                        }
                      `}
                    >
                      {kpi.trend === 'up' ? (
                        <ArrowUpRight size={12} />
                      ) : (
                        <ArrowDownRight size={12} />
                      )}
                      {kpi.change}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* ══════════════════════════════════
                CHARTS SECTION
            ══════════════════════════════════ */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Weekly Views Chart */}
              <motion.div variants={fadeIn} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-[20px] font-bold text-slate-900 mb-1">
                      Weekly Views
                    </h2>
                    <p className="text-[13px] text-slate-500">
                      Last 7 days performance
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                    <TrendingUp size={14} />
                    +14.2%
                  </div>
                </div>
                <BarChart
                  data={mockWeeklyViews}
                  labels={weekLabels}
                  color="#0EA5E9"
                  maxHeight={200}
                />
              </motion.div>

              {/* Reading Sessions Chart */}
              <motion.div variants={fadeIn} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-[20px] font-bold text-slate-900 mb-1">
                      Reading Sessions
                    </h2>
                    <p className="text-[13px] text-slate-500">
                      Last 7 days activity
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                    <TrendingUp size={14} />
                    +22.1%
                  </div>
                </div>
                <BarChart
                  data={mockWeeklyReads}
                  labels={weekLabels}
                  color="#8B5CF6"
                  maxHeight={200}
                />
              </motion.div>
            </div>

            {/* ══════════════════════════════════
                ENGAGEMENT METRICS
            ══════════════════════════════════ */}
            <motion.div variants={fadeIn} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[20px] font-bold text-slate-900 mb-1">
                    Engagement Overview
                  </h2>
                  <p className="text-[13px] text-slate-500">
                    Reader interaction across all content
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Comments', value: '1,284', icon: MessageSquare, color: '#0EA5E9', progress: 78 },
                  { label: 'Shares', value: '842', icon: Share2, color: '#10B981', progress: 65 },
                  { label: 'Bookmarks', value: '2,156', icon: Bookmark, color: '#F59E0B', progress: 82 },
                  { label: 'Followers', value: '4,392', icon: Users, color: '#8B5CF6', progress: 91 }
                ].map((metric) => (
                  <div key={metric.label} className="flex flex-col items-center text-center">
                    <ProgressRing
                      progress={metric.progress}
                      color={metric.color}
                      size={100}
                      strokeWidth={10}
                    />
                    <div className="mt-4">
                      <div className="text-[24px] font-black text-slate-900 mb-1">
                        {metric.value}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-[13px] font-semibold text-slate-600">
                        <metric.icon size={14} style={{ color: metric.color }} />
                        {metric.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ══════════════════════════════════
                BOOK PERFORMANCE TABLE
            ══════════════════════════════════ */}
            <motion.div variants={fadeIn} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                    <BarChart3 size={20} className="text-cyan-600" />
                  </div>
                  <div>
                    <h2 className="text-[20px] font-bold text-slate-900">
                      Book Performance
                    </h2>
                    <p className="text-[13px] text-slate-500 mt-0.5">
                      {analytics?.books?.length || 0} published books
                    </p>
                  </div>
                </div>
                <Link
                  to="/library"
                  className="text-[13px] font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                >
                  View All Books
                  <ChevronRight size={16} />
                </Link>
              </div>

              {!analytics?.books?.length ? (
                // Empty State
                <div className="flex flex-col items-center py-16 px-6">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                    <BookOpen size={36} className="text-slate-400" />
                  </div>
                  <h3 className="text-[22px] font-bold text-slate-900 mb-2">
                    No books published yet
                  </h3>
                  <p className="text-slate-600 text-[15px] mb-6 max-w-md text-center">
                    Start creating your first book to see detailed analytics and performance metrics.
                  </p>
                  <button
                    onClick={() => navigate('/studio')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-[14px] hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/25 transition-all active:scale-98"
                  >
                    <Sparkles size={18} />
                    Create Your First Book
                  </button>
                </div>
              ) : (
                <>
                  {/* Table Header */}
                  <div className="hidden lg:grid grid-cols-[50px_1fr_120px_120px_120px_150px] gap-4 px-6 py-3 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <span className="text-center">Rank</span>
                    <span>Book Title</span>
                    <span className="text-right">Views</span>
                    <span className="text-right">Likes</span>
                    <span className="text-center">Rating</span>
                    <span>Engagement</span>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-slate-100">
                    {analytics.books
                      .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
                      .map((book: any, index: number) => {
                        const maxViews = Math.max(
                          ...analytics.books.map((b: any) => b.views || 0),
                          1
                        );
                        const engagementPercent = Math.round(
                          ((book.views || 0) / maxViews) * 100
                        );

                        return (
                          <div
                            key={book.id}
                            className="grid lg:grid-cols-[50px_1fr_120px_120px_120px_150px] gap-4 items-center px-6 py-4 hover:bg-slate-50 transition-colors"
                          >
                            {/* Rank */}
                            <div className="flex items-center justify-center">
                              {index === 0 ? (
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
                                  <Crown size={16} className="text-white" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[13px] font-bold text-slate-600">
                                  {index + 1}
                                </div>
                              )}
                            </div>

                            {/* Book Title */}
                            <Link
                              to={`/book/${book.id}`}
                              className="font-semibold text-slate-900 text-[15px] hover:text-cyan-600 transition-colors truncate"
                            >
                              {book.title}
                            </Link>

                            {/* Views */}
                            <div className="text-right">
                              <div className="text-[15px] font-bold text-slate-900">
                                {(book.views || 0).toLocaleString()}
                              </div>
                              <div className="text-[11px] text-slate-500">views</div>
                            </div>

                            {/* Likes */}
                            <div className="text-right">
                              <div className="text-[15px] font-bold text-slate-900">
                                {(book.likes || 0).toLocaleString()}
                              </div>
                              <div className="text-[11px] text-slate-500">likes</div>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center justify-center gap-2">
                              {book.avgRating > 0 ? (
                                <>
                                  <Star size={16} className="fill-amber-400 text-amber-400" />
                                  <span className="text-[15px] font-bold text-slate-900">
                                    {book.avgRating.toFixed(1)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-slate-400 text-[14px]">No ratings</span>
                              )}
                            </div>

                            {/* Engagement Bar */}
                            <div className="flex flex-col gap-1.5">
                              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${engagementPercent}%` }}
                                  transition={{
                                    duration: 1,
                                    delay: 0.5 + index * 0.1,
                                    ease: "easeInOut"0.4, 0, 0.2, 1]
                                  }}
                                className="h-full rounded-full"
                                style={{
                                  background:
                                    index === 0
                                      ? 'linear-gradient(90deg, #FBBF24, #F59E0B)'
                                      : 'linear-gradient(90deg, #0EA5E9, #06B6D4)'
                                }}
                                />
                              </div>
                              <span className="text-[11px] text-slate-500 font-medium">
                                {engagementPercent}% engagement
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </motion.div>

            {/* ══════════════════════════════════
                STORAGE & USAGE
            ══════════════════════════════════ */}
            <motion.div variants={fadeIn} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[20px] font-bold text-slate-900 mb-1">
                    Storage Overview
                  </h2>
                  <p className="text-[13px] text-slate-500">
                    Manage your content storage
                  </p>
                </div>
                <button className="text-[13px] font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
                  Manage Storage
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Storage Bar */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[14px] font-semibold text-slate-700">
                      Total Storage Used
                    </span>
                    <span className="text-[14px] font-bold text-slate-900">
                      2.3 GB / 10 GB
                    </span>
                  </div>

                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '15%' }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-cyan-500"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '5%' }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full bg-amber-400"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '3%' }}
                      transition={{ duration: 1, delay: 0.4 }}
                      className="h-full bg-violet-500"
                    />
                  </div>

                  {/* Storage Legend */}
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-[13px]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-cyan-500" />
                      <span className="text-slate-600 font-medium">
                        Books <span className="text-slate-900 font-bold">1.5 GB</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="text-slate-600 font-medium">
                        Media <span className="text-slate-900 font-bold">0.5 GB</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-violet-500" />
                      <span className="text-slate-600 font-medium">
                        Notes <span className="text-slate-900 font-bold">0.3 GB</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ══════════════════════════════════
                GOALS & ACHIEVEMENTS
            ══════════════════════════════════ */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Monthly Goals */}
              <motion.div variants={fadeIn} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Target size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-[20px] font-bold text-slate-900">
                      Monthly Goals
                    </h2>
                    <p className="text-[13px] text-slate-500 mt-0.5">
                      Track your progress
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {[
                    { label: 'Books Published', current: 2, target: 5, color: '#0EA5E9' },
                    { label: 'Total Views', current: 48200, target: 60000, color: '#8B5CF6' },
                    { label: 'New Followers', current: 342, target: 500, color: '#10B981' }
                  ].map((goal) => {
                    const progress = Math.round((goal.current / goal.target) * 100);
                    return (
                      <div key={goal.label} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[14px] font-semibold text-slate-900">
                            {goal.label}
                          </span>
                          <span className="text-[13px] text-slate-600 font-medium">
                            {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.2, delay: 0.3 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: goal.color }}
                          />
                        </div>
                        <span className="text-[12px] text-slate-500 font-medium">
                          {progress}% complete
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Recent Achievements */}
              <motion.div variants={fadeIn} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Award size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-[20px] font-bold text-slate-900">
                      Recent Achievements
                    </h2>
                    <p className="text-[13px] text-slate-500 mt-0.5">
                      Your latest milestones
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { title: 'First 10K Views', desc: 'Reached 10,000 total views', icon: Eye, color: '#0EA5E9' },
                    { title: 'Rising Star', desc: 'Gained 100+ followers in a week', icon: TrendingUp, color: '#10B981' },
                    { title: 'Top Rated', desc: 'Achieved 4.8 average rating', icon: Star, color: '#F59E0B' }
                  ].map((achievement) => (
                    <div key={achievement.title} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${achievement.color}15` }}
                      >
                        <achievement.icon size={22} style={{ color: achievement.color }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[15px] font-bold text-slate-900 mb-0.5">
                          {achievement.title}
                        </h4>
                        <p className="text-[13px] text-slate-600">
                          {achievement.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}