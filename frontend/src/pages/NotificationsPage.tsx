import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Heart, Star, Users, BookOpen, Zap, Check, Trash2,
  TrendingUp, MessageSquare, ShieldCheck, ArrowRight, CheckCheck
} from 'lucide-react';
import AppShell from '../components/AppShell';

interface Props { user?: any; onLogout?: () => void; }

type NotifType = 'like' | 'follow' | 'review' | 'publish' | 'system' | 'trending' | 'comment';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  cta?: string;
}

const MOCK_NOTIFS: Notification[] = [
  { id: '1', type: 'like',     title: 'New Like',            message: 'Aisha Khan liked your book "The Last Chronicle"',                    time: '2 min ago',  read: false, cta: 'View Book' },
  { id: '2', type: 'follow',   title: 'New Follower',        message: 'Marcus Chen started following you',                                  time: '15 min ago', read: false, cta: 'See Profile' },
  { id: '3', type: 'review',   title: '5-Star Review! ⭐',   message: 'You received a 5-star review on "Neon Shadows" — "Absolutely stunning!"', time: '1 hour ago',  read: false, cta: 'Read Review' },
  { id: '4', type: 'trending', title: 'Trending Now 🔥',     message: 'Your book "The Last Chronicle" is ranked #3 in Fantasy this week',  time: '3 hours ago', read: true,  cta: 'View Stats' },
  { id: '5', type: 'publish',  title: 'Book Published',      message: '"Beyond the Stars" is now live on the Hub — readers are discovering it!', time: '5 hours ago', read: true,  cta: 'View Book' },
  { id: '6', type: 'comment',  title: 'New Comment',         message: 'Elena Rodriguez commented on Chapter 4 of "Neon Shadows"',           time: '1 day ago',  read: true,  cta: 'Reply' },
  { id: '7', type: 'follow',   title: 'New Follower',        message: 'James Park started following you — he\'s read 3 of your books',      time: '1 day ago',  read: true },
  { id: '8', type: 'system',   title: 'New Feature: AI Summary', message: 'Generate smart chapter summaries instantly with AI — try it now!', time: '2 days ago',  read: true, cta: 'Try it' },
  { id: '9', type: 'review',   title: 'New Review',          message: 'Sarah Jenkins: "This series is absolutely incredible. Can\'t stop reading!"', time: '3 days ago',  read: true },
  { id: '10', type: 'system',  title: 'Milestone 🎉',        message: 'Congratulations! Your books have been read over 1,000 times total.', time: '5 days ago',  read: true },
];

const iconMap: Record<NotifType, { icon: typeof Bell; color: string; bg: string; ring: string }> = {
  like:     { icon: Heart,         color: 'text-rose-500',    bg: 'bg-rose-50',    ring: 'ring-rose-100' },
  follow:   { icon: Users,         color: 'text-blue-500',    bg: 'bg-blue-50',    ring: 'ring-blue-100' },
  review:   { icon: Star,          color: 'text-amber-500',   bg: 'bg-amber-50',   ring: 'ring-amber-100' },
  publish:  { icon: BookOpen,      color: 'text-emerald-500', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
  system:   { icon: Zap,           color: 'text-violet-500',  bg: 'bg-violet-50',  ring: 'ring-violet-100' },
  trending: { icon: TrendingUp,    color: 'text-orange-500',  bg: 'bg-orange-50',  ring: 'ring-orange-100' },
  comment:  { icon: MessageSquare, color: 'text-sky-500',     bg: 'bg-sky-50',     ring: 'ring-sky-100' },
};

const FILTERS = [
  { label: 'All',      value: 'all' },
  { label: 'Unread',   value: 'unread' },
  { label: 'Likes',    value: 'like' },
  { label: 'Follows',  value: 'follow' },
  { label: 'Reviews',  value: 'review' },
  { label: 'Trending', value: 'trending' },
  { label: 'System',   value: 'system' },
];

export default function NotificationsPage({ user, onLogout }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFS);
  const [filter, setFilter] = useState('all');
  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id: string) => setNotifications(ns => ns.filter(n => n.id !== id));

  return (
    <AppShell user={user} onLogout={onLogout}>
      <div className="min-h-screen bg-slate-50">
        <div className="w-full px-6 lg:px-10 py-10 max-w-3xl mx-auto page-enter">

          {/* ── Header ── */}
          <div className="flex items-start justify-between mb-7">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm shadow-blue-600/30">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-sm">Stay up to date with your readers and books.</p>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-50 border border-blue-100 transition-all">
                <CheckCheck size={15} /> Mark all read
              </button>
            )}
          </div>

          {/* ── Filter tabs ── */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
            {FILTERS.map(f => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter === f.value
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}>
                {f.label}
                {f.value === 'unread' && unreadCount > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full inline-flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Notification List ── */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-24">
              <div className="w-20 h-20 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center mb-5">
                <Bell size={32} className="text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1.5">No notifications</h3>
              <p className="text-slate-500 text-sm text-center max-w-xs">When readers interact with your books, you'll see it here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Group by unread */}
              {unreadCount > 0 && filter === 'all' && (
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-3">New</p>
              )}
              <AnimatePresence initial={false}>
                {filtered.map(notif => {
                  const { icon: Icon, color, bg, ring } = iconMap[notif.type];
                  return (
                    <motion.div
                      key={notif.id} layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.22 }}
                      onClick={() => markRead(notif.id)}
                      className={`group relative flex gap-4 p-4 lg:p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${!notif.read
                        ? 'bg-white border-blue-100 shadow-md hover:shadow-lg'
                        : 'bg-white border-slate-100 hover:bg-slate-50/80 hover:shadow-sm'}`}>

                      {/* Unread bar */}
                      {!notif.read && (
                        <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-blue-500 rounded-r-full" />
                      )}

                      {/* Icon */}
                      <div className={`w-11 h-11 ${bg} rounded-2xl flex items-center justify-center flex-shrink-0 ring-4 ring-opacity-40 ${ring}`}>
                        <Icon size={18} className={color} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <p className={`text-sm font-bold ${!notif.read ? 'text-slate-900' : 'text-slate-800'}`}>
                            {notif.title}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />}
                            <button
                              onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <p className={`text-sm leading-snug mb-2 ${!notif.read ? 'text-slate-700' : 'text-slate-500'}`}>
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 font-medium">{notif.time}</span>
                          {notif.cta && (
                            <button className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                              {notif.cta} <ArrowRight size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Bottom privacy note */}
              <div className="pt-6 pb-2 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={13} />
                Notifications are private and visible only to you
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
