import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Upload, StickyNote,
  Users, Globe, Sparkles, BarChart3, Settings,
  Bell, Search, ChevronRight, LogOut, HelpCircle,
  Menu, X, Compass, ShoppingBag, ArrowRight,
  BookMarked, Zap, Star, TrendingUp, Check, Feather,
  Headphones, Crown, PanelLeftClose, PanelLeft, Command,
} from 'lucide-react';

/* ─── Types ─── */
interface AppShellProps {
  children: React.ReactNode;
  user?: { name: string; email: string };
  onLogout?: () => void;
}
interface NavItemDef {
  label: string;
  icon: React.ElementType;
  to: string;
  color: string;
  badge?: string;
}

/* ─── Nav Config ─── */
const NAV: { group: string; items: NavItemDef[] }[] = [
  {
    group: 'Workspace',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard', color: '#14B8A6' },
      { label: 'My Library', icon: BookOpen, to: '/library', color: '#3B82F6' },
      { label: 'Bookshelf', icon: BookMarked, to: '/bookshelf', color: '#10B981' },
      { label: 'Upload Book', icon: Upload, to: '/upload', color: '#F59E0B' },
      { label: 'Notes', icon: StickyNote, to: '/notes', color: '#EF4444' },
    ],
  },
  {
    group: 'Collaborate',
    items: [
      { label: 'Collaboration', icon: Users, to: '/collaboration', color: '#8B5CF6' },
      { label: 'Community', icon: Globe, to: '/community', color: '#06B6D4' },
    ],
  },
  {
    group: 'Create',
    items: [
      { label: 'Book Studio', icon: Feather, to: '/studio', color: '#F97316' },
      { label: 'AI Comics', icon: Sparkles, to: '/creator', color: '#A855F7', badge: 'AI' },
      { label: 'Explore Hub', icon: Compass, to: '/hub', color: '#0EA5E9' },
      { label: 'Audiobooks', icon: Headphones, to: '/audio', color: '#14B8A6' },
      { label: 'Store', icon: ShoppingBag, to: '/store', color: '#F43F5E' },
    ],
  },
  {
    group: 'Insights',
    items: [
      { label: 'Analytics', icon: BarChart3, to: '/analytics', color: '#3B82F6' },
    ],
  },
];

const QUICK_SEARCH = [
  { icon: Upload, label: 'Upload a Book', to: '/upload', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  { icon: Feather, label: 'Open Book Studio', to: '/studio', color: '#F97316', bg: 'rgba(249,115,22,0.12)' },
  { icon: Sparkles, label: 'Create AI Comic', to: '/creator', color: '#A855F7', bg: 'rgba(168,85,247,0.12)' },
  { icon: StickyNote, label: 'New Note', to: '/notes', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  { icon: BarChart3, label: 'View Analytics', to: '/analytics', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  { icon: Compass, label: 'Browse Explore Hub', to: '/hub', color: '#0EA5E9', bg: 'rgba(14,165,233,0.12)' },
];

const NOTIFS = [
  { id: 1, title: 'Aria liked your book', body: '"The Lost Chronicles" received a new like', time: '2 min ago', icon: Star, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', unread: true },
  { id: 2, title: 'Collaboration request', body: 'Marcus Webb wants to co-author "Neon Shadows"', time: '18 min ago', icon: Users, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', unread: true },
  { id: 3, title: 'Your book is trending 🔥', body: '"Beyond the Stars" is ranked #3 this week', time: '1h ago', icon: TrendingUp, color: '#14B8A6', bg: 'rgba(20,184,166,0.12)', unread: true },
  { id: 4, title: 'New feature: AI Summary', body: 'Generate smart chapter summaries instantly', time: '3h ago', icon: Zap, color: '#A855F7', bg: 'rgba(168,85,247,0.12)', unread: false },
  { id: 5, title: 'New 5-star review ⭐', body: 'Sofia Lin rated "Neon Shadows" 5 stars', time: '5h ago', icon: Star, color: '#EF4444', bg: 'rgba(239,68,68,0.12)', unread: false },
];

/* ─── NavItem ─── */
function NavItem({ item, collapsed }: { item: NavItemDef; collapsed: boolean }) {
  const location = useLocation();
  const active =
    location.pathname === item.to ||
    (item.to !== '/' && location.pathname.startsWith(item.to));

  return (
    <NavLink to={item.to} title={collapsed ? item.label : undefined}>
      <motion.div
        whileHover={{ x: collapsed ? 0 : 4 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`relative flex items-center gap-3 rounded-xl cursor-pointer select-none group overflow-hidden
          ${collapsed ? 'px-2.5 py-3 justify-center' : 'px-3.5 py-3'}`}
        style={{
          background: active ? `${item.color}1A` : 'transparent',
          border: `1px solid ${active ? `${item.color}38` : 'transparent'}`,
          boxShadow: active ? `0 0 24px ${item.color}1A, inset 0 1px 0 ${item.color}12` : 'none',
          transition: 'background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
        }}
        onMouseEnter={e => {
          if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
        }}
        onMouseLeave={e => {
          if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
        }}
      >
        {/* Hover shimmer */}
        {!active && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
            style={{
              background: `linear-gradient(90deg, transparent, ${item.color}10, transparent)`,
            }}
          />
        )}

        {/* Active left pip */}
        {active && (
          <motion.div
            layoutId="nav-pip"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full"
            style={{
              background: item.color,
              boxShadow: `0 0 10px ${item.color}, 0 0 20px ${item.color}80`,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}

        {/* Icon */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 relative z-10"
          style={{
            background: active ? `${item.color}25` : 'transparent',
            transition: 'background 0.25s ease',
          }}
        >
          <item.icon
            size={19}
            strokeWidth={active ? 2.3 : 2}
            style={{
              color: active ? item.color : undefined,
              transition: 'color 0.25s ease',
            }}
            className={active ? '' : 'text-slate-400 group-hover:text-slate-100'}
          />
        </div>

        {!collapsed && (
          <span
            className={`flex-1 text-[15px] font-semibold leading-tight truncate relative z-10
              ${active ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}
            style={{ transition: 'color 0.25s ease', letterSpacing: '-0.01em' }}
          >
            {item.label}
          </span>
        )}

        {/* Badge */}
        {!collapsed && item.badge && (
          <span
            className="px-2 py-0.5 text-[10px] font-black rounded-md relative z-10 tracking-wider"
            style={{
              background: `linear-gradient(135deg, ${item.color}, ${item.color}CC)`,
              color: '#fff',
              boxShadow: `0 2px 10px ${item.color}50`,
            }}
          >
            {item.badge}
          </span>
        )}

        {active && !collapsed && !item.badge && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 rounded-full flex-shrink-0 relative z-10"
            style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}
          />
        )}
      </motion.div>
    </NavLink>
  );
}

/* ─── ProBadge ─── */
function ProBadge() {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="mx-3 mb-3 p-4 rounded-2xl relative overflow-hidden cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, rgba(20,184,166,0.14) 0%, rgba(139,92,246,0.1) 100%)',
        border: '1px solid rgba(20,184,166,0.3)',
        boxShadow: '0 8px 28px -8px rgba(20,184,166,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 80% 20%, rgba(20,184,166,0.25), transparent 60%)',
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-2 mb-2.5">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FCD34D, #F59E0B)',
              boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
            }}
          >
            <Crown size={13} className="text-amber-900" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-black text-amber-300 uppercase tracking-[0.16em]">Pro Plan</span>
        </div>
        <p className="text-white text-[14px] font-bold leading-tight mb-1">Unlock Unlimited Access</p>
        <p className="text-slate-400 text-[12px] leading-relaxed mb-3">AI tools · 100 GB · Priority support</p>
        <button
          className="w-full text-slate-900 text-[13px] font-black py-2.5 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
          style={{
            background: 'linear-gradient(135deg, #2DD4BF, #14B8A6)',
            boxShadow: '0 4px 16px rgba(20,184,166,0.45)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 22px rgba(20,184,166,0.65)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(20,184,166,0.45)';
          }}
        >
          Upgrade Now <ArrowRight size={13} strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── AppShell ─── */
export default function AppShell({ children, user, onLogout }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const SIDEBAR_WIDTH = 296;
  const SIDEBAR_COLLAPSED = 80;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
      if (e.key === 'Escape') { setSearchOpen(false); setNotifOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 80);
  }, [searchOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const initials =
    user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'AU';

  /* ── Sidebar inner ── */
  const SidebarInner = (
    <div
      className="flex flex-col h-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #070A17 0%, #0B0F26 50%, #070A17 100%)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH,
        minWidth: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH,
        transition: 'width 0.3s cubic-bezier(0.22,1,0.36,1), min-width 0.3s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* Ambient glows */}
      <div
        className="absolute top-0 left-0 w-full h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(20,184,166,0.13) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-full h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.09) 0%, transparent 70%)' }}
      />

      {/* ── Logo ── */}
      <div className={`flex items-center pt-6 pb-5 flex-shrink-0 relative z-10 ${collapsed ? 'px-3 justify-center' : 'px-5 gap-3'}`}>
        <motion.div
          whileHover={{ rotate: [0, -6, 6, 0], scale: 1.08 }}
          transition={{ duration: 0.5 }}
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 50%, #0F766E 100%)',
            boxShadow: '0 0 28px rgba(20,184,166,0.55), inset 0 1px 0 rgba(255,255,255,0.25)',
          }}
        >
          <BookOpen size={18} color="#fff" strokeWidth={2.5} />
        </motion.div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-black text-[22px] tracking-tight"
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              background: 'linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            ComixNova
          </motion.span>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white active:scale-90"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
            title="Collapse sidebar"
          >
            <PanelLeftClose size={15} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mb-3 w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white active:scale-90"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
          title="Expand sidebar"
        >
          <PanelLeft size={15} />
        </button>
      )}

      {/* ── Search shortcut ── */}
      {!collapsed && (
        <div className="px-4 mb-5 relative z-10">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border group active:scale-[0.98]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.09)',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(20,184,166,0.4)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(20,184,166,0.1)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            <Search size={15} className="text-slate-400 group-hover:text-teal-400 flex-shrink-0" style={{ transition: 'color 0.25s' }} />
            <span className="flex-1 text-left text-[14px] font-medium text-slate-400 group-hover:text-slate-200" style={{ transition: 'color 0.25s' }}>
              Quick search…
            </span>
            <kbd
              className="text-[10px] px-1.5 py-0.5 rounded font-mono text-slate-400 flex items-center gap-0.5"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <Command size={9} />K
            </kbd>
          </button>
        </div>
      )}

      {/* ── Nav ── */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden pb-4 relative z-10"
        style={{ scrollbarWidth: 'none', padding: collapsed ? '0 10px' : '0 12px' }}
      >
        {NAV.map(group => (
          <div key={group.group} className="mb-5">
            {!collapsed ? (
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.18em] px-3 mb-2">
                {group.group}
              </p>
            ) : (
              <div className="h-px bg-gradient-to-r from-transparent via-white/12 to-transparent my-2.5 mx-1" />
            )}
            <div className="space-y-1">
              {group.items.map(item => (
                <NavItem key={item.to} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Pro badge */}
      {!collapsed && <ProBadge />}

      {/* ── Bottom ── */}
      <div
        className="flex-shrink-0 border-t px-3 pt-3 pb-4 space-y-1 relative z-10"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        {!collapsed && (
          <>
            <NavLink to="/settings">
              <div
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white cursor-pointer text-[14px] font-semibold group"
                style={{ transition: 'all 0.25s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <Settings size={17} className="flex-shrink-0 group-hover:rotate-90" style={{ transition: 'transform 0.4s ease' }} />
                <span>Settings</span>
              </div>
            </NavLink>
            <NavLink to="/help">
              <div
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white cursor-pointer text-[14px] font-semibold"
                style={{ transition: 'all 0.25s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <HelpCircle size={17} className="flex-shrink-0" />
                <span>Help & Support</span>
              </div>
            </NavLink>
          </>
        )}

        {/* User card */}
        <div
          className={`mt-2 flex items-center gap-3 rounded-xl border cursor-pointer
            ${collapsed ? 'justify-center p-2' : 'px-3 py-2.5'}`}
          style={{
            background: 'rgba(255,255,255,0.04)',
            borderColor: 'rgba(255,255,255,0.09)',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(20,184,166,0.3)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)';
          }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[12px] font-black flex-shrink-0 relative"
            style={{
              background: 'linear-gradient(135deg, #2DD4BF, #0F766E)',
              boxShadow: '0 0 14px rgba(20,184,166,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
            }}
          >
            {initials}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2" style={{ borderColor: '#0B0F26' }} />
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-white truncate leading-tight">{user?.name || 'Author'}</p>
                <p className="text-[12px] text-slate-400 truncate mt-0.5">{user?.email || 'author@comixnova.app'}</p>
              </div>
              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-red-400 flex-shrink-0 p-2 rounded-lg active:scale-90"
                style={{ transition: 'all 0.2s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.14)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <LogOut size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .appshell-root, .appshell-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .appshell-root ::-webkit-scrollbar { width: 5px; height: 5px; }
        .appshell-root ::-webkit-scrollbar-track { background: transparent; }
        .appshell-root ::-webkit-scrollbar-thumb { background: rgba(20,184,166,0.3); border-radius: 99px; }
        .appshell-root ::-webkit-scrollbar-thumb:hover { background: rgba(20,184,166,0.5); }

        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
      `}</style>

      <div className="appshell-root flex h-screen overflow-hidden bg-[#F8FAFC]">

        {/* Desktop sidebar */}
        <motion.div
          className="hidden lg:flex flex-shrink-0 overflow-hidden"
          animate={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {SidebarInner}
        </motion.div>

        {/* Mobile overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/65 z-40 lg:hidden backdrop-blur-md"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: -SIDEBAR_WIDTH }} animate={{ x: 0 }} exit={{ x: -SIDEBAR_WIDTH }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
                style={{ width: SIDEBAR_WIDTH }}
                onClick={e => e.stopPropagation()}
              >
                {SidebarInner}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* ══════════ TOPBAR ══════════ */}
          <header
            className="flex-shrink-0 relative z-30"
            style={{
              background: 'linear-gradient(135deg, #070A17 0%, #0B0F26 50%, #070A17 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 1px 0 rgba(255,255,255,0.04), 0 8px 28px -8px rgba(0,0,0,0.45)',
            }}
            onClick={() => setNotifOpen(false)}
          >
            {/* Top shimmer line */}
            <div
              className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none overflow-hidden"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.7), rgba(139,92,246,0.5), rgba(59,130,246,0.5), transparent)' }}
            />

            {/* Ambient glow */}
            <div
              className="absolute top-0 left-1/3 w-[500px] h-full pointer-events-none opacity-60"
              style={{ background: 'radial-gradient(ellipse at center, rgba(20,184,166,0.1) 0%, transparent 60%)' }}
            />

            <div className="relative flex items-center gap-3 px-6 py-3.5">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-white active:scale-90"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Menu size={18} />
              </button>

              {/* Search bar */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium flex-1 max-w-md group active:scale-[0.99]"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(20,184,166,0.4)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(20,184,166,0.1)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <Search size={16} className="text-slate-400 group-hover:text-teal-400 flex-shrink-0" style={{ transition: 'color 0.25s' }} />
                <span className="flex-1 text-left text-[14px] text-slate-400 group-hover:text-slate-200" style={{ transition: 'color 0.25s' }}>
                  Search books, notes, authors…
                </span>
                <kbd
                  className="hidden sm:flex items-center gap-0.5 text-[10px] px-2 py-1 rounded font-mono text-slate-300"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <Command size={9} />K
                </kbd>
              </button>

              {/* Right actions */}
              <div className="flex items-center gap-2.5 ml-auto">
                {/* Upload CTA */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/upload')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-bold text-white relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)',
                    boxShadow: '0 4px 18px rgba(20,184,166,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
                    transition: 'box-shadow 0.25s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(20,184,166,0.55), inset 0 1px 0 rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 18px rgba(20,184,166,0.4), inset 0 1px 0 rgba(255,255,255,0.25)';
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
                  />
                  <Upload size={15} className="relative z-10" strokeWidth={2.5} />
                  <span className="relative z-10">Upload</span>
                </motion.button>

                {/* Notifications */}
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setNotifOpen(p => !p)}
                    className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-white"
                    style={{
                      background: notifOpen ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${notifOpen ? 'rgba(20,184,166,0.5)' : 'rgba(255,255,255,0.09)'}`,
                      boxShadow: notifOpen ? '0 0 0 3px rgba(20,184,166,0.12)' : 'none',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={e => {
                      if (!notifOpen) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                    }}
                    onMouseLeave={e => {
                      if (!notifOpen) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                    }}
                  >
                    <Bell size={17} />
                    {notifCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2"
                        style={{
                          background: 'linear-gradient(135deg, #F87171, #DC2626)',
                          borderColor: '#070A17',
                          boxShadow: '0 0 10px rgba(239,68,68,0.6)',
                        }}
                      >
                        {notifCount}
                      </motion.span>
                    )}
                  </motion.button>

                  {/* Notification dropdown */}
                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 top-full mt-2.5 w-[400px] rounded-2xl overflow-hidden z-50"
                        style={{
                          background: '#0B0F26',
                          boxShadow: '0 32px 80px -16px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.09), 0 0 60px rgba(20,184,166,0.12)',
                        }}
                      >
                        <div
                          className="px-5 py-4 flex items-center justify-between relative overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, #0F1430 0%, #0B0F26 100%)',
                            borderBottom: '1px solid rgba(255,255,255,0.07)',
                          }}
                        >
                          <div
                            className="absolute top-0 left-0 right-0 h-[1px]"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.6), transparent)' }}
                          />
                          <div>
                            <h3 className="font-bold text-white text-[15px] flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(20,184,166,0.18)' }}>
                                <Bell size={12} className="text-teal-400" strokeWidth={2.5} />
                              </div>
                              Notifications
                            </h3>
                            <p className="text-slate-400 text-[12px] mt-0.5 ml-8 font-medium">{notifCount} unread</p>
                          </div>
                          <button
                            onClick={() => setNotifCount(0)}
                            className="flex items-center gap-1.5 text-[12px] font-bold text-teal-300 hover:text-white px-3 py-1.5 rounded-lg active:scale-95"
                            style={{
                              background: 'rgba(20,184,166,0.18)',
                              border: '1px solid rgba(20,184,166,0.35)',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.background = 'rgba(20,184,166,0.3)';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.background = 'rgba(20,184,166,0.18)';
                            }}
                          >
                            <Check size={11} strokeWidth={2.5} /> Mark all read
                          </button>
                        </div>

                        <div className="max-h-[380px] overflow-y-auto">
                          {NOTIFS.map((n, i) => (
                            <motion.div
                              key={n.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04, duration: 0.2 }}
                              className="flex gap-3 px-5 py-3.5 cursor-pointer relative"
                              style={{
                                background: n.unread ? 'rgba(20,184,166,0.05)' : 'transparent',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                transition: 'background 0.2s ease',
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.unread ? 'rgba(20,184,166,0.05)' : 'transparent'; }}
                            >
                              {n.unread && (
                                <div
                                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-10 rounded-r-full"
                                  style={{ background: n.color, boxShadow: `0 0 8px ${n.color}` }}
                                />
                              )}
                              <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: n.bg,
                                  border: `1px solid ${n.color}30`,
                                }}
                              >
                                <n.icon size={18} style={{ color: n.color }} strokeWidth={2.2} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className={`text-[14px] leading-snug ${n.unread ? 'font-bold text-white' : 'font-semibold text-slate-300'}`}>
                                    {n.title}
                                  </p>
                                  {n.unread && (
                                    <div
                                      className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0"
                                      style={{ boxShadow: '0 0 8px #2DD4BF', animation: 'pulse-dot 2s ease-in-out infinite' }}
                                    />
                                  )}
                                </div>
                                <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">{n.body}</p>
                                <p className="text-[11px] text-slate-500 mt-1.5 font-semibold">{n.time}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        <div
                          className="px-5 py-3 flex items-center justify-between"
                          style={{
                            background: 'rgba(5,7,18,0.7)',
                            borderTop: '1px solid rgba(255,255,255,0.07)',
                          }}
                        >
                          <button
                            onClick={() => { navigate('/notifications'); setNotifOpen(false); }}
                            className="text-[13px] text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 group"
                            style={{ transition: 'color 0.2s' }}
                          >
                            View all
                            <ChevronRight size={13} className="group-hover:translate-x-0.5" style={{ transition: 'transform 0.2s' }} />
                          </button>
                          <button
                            onClick={() => { navigate('/settings'); setNotifOpen(false); }}
                            className="text-[12px] text-slate-400 hover:text-slate-200 font-medium"
                            style={{ transition: 'color 0.2s' }}
                          >
                            Notification settings
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[12px] font-black border-2 cursor-pointer relative"
                  style={{
                    background: 'linear-gradient(135deg, #2DD4BF, #0F766E)',
                    borderColor: 'rgba(255,255,255,0.18)',
                    boxShadow: '0 0 18px rgba(20,184,166,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
                  }}
                >
                  {initials}
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2"
                    style={{ borderColor: '#070A17' }}
                  />
                </motion.div>
              </div>
            </div>
          </header>
          {/* ══════════ END TOPBAR ══════════ */}

          {/* Page content */}
          <main className="flex-1 overflow-y-auto relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="min-h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ════════════ SEARCH MODAL ════════════ */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-50 backdrop-blur-md"
              style={{ background: 'rgba(5,7,18,0.82)' }}
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-[10vh] left-1/2 -translate-x-1/2 w-full max-w-[560px] z-50 px-4"
              onClick={e => e.stopPropagation()}
            >
              <div
                className="rounded-2xl overflow-hidden relative"
                style={{
                  background: 'linear-gradient(180deg, #0B0F26 0%, #070A17 100%)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  boxShadow: '0 40px 80px -16px rgba(0,0,0,0.85), 0 0 0 1px rgba(20,184,166,0.18), 0 0 60px rgba(20,184,166,0.12)',
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.7), rgba(139,92,246,0.5), transparent)' }}
                />

                {/* Input */}
                <div className="flex items-center gap-3 px-5 py-4 relative" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <Search size={18} className="text-teal-400 flex-shrink-0" strokeWidth={2.3} />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search books, notes, authors…"
                    className="flex-1 bg-transparent text-white placeholder-slate-500 text-[15px] font-medium focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200 active:scale-90"
                      style={{ transition: 'all 0.15s' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-100 active:scale-90"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>

                {/* Quick actions */}
                <div className="p-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2.5 mb-2">Quick Actions</p>
                  <div className="space-y-0.5">
                    {QUICK_SEARCH.map((item, i) => (
                      <motion.button
                        key={item.to}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.2 }}
                        onClick={() => { navigate(item.to); setSearchOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left group active:scale-[0.99]"
                        style={{ transition: 'background 0.2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: item.bg,
                            border: `1px solid ${item.color}30`,
                          }}
                        >
                          <item.icon size={17} style={{ color: item.color }} strokeWidth={2.2} />
                        </div>
                        <span className="text-[14px] font-semibold text-slate-300 group-hover:text-white" style={{ transition: 'color 0.2s' }}>
                          {item.label}
                        </span>
                        <ArrowRight
                          size={14}
                          className="ml-auto text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5"
                          style={{ transition: 'all 0.2s' }}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Keyboard hints */}
                <div
                  className="px-5 py-3 flex items-center gap-4 text-[11px] text-slate-400 font-semibold"
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(0,0,0,0.3)',
                  }}
                >
                  {[['↵', 'Open'], ['↑↓', 'Navigate'], ['ESC', 'Close']].map(([key, label]) => (
                    <span key={key} className="flex items-center gap-1.5">
                      <kbd
                        className="px-2 py-0.5 rounded font-mono text-slate-200"
                        style={{
                          background: 'rgba(255,255,255,0.07)',
                          border: '1px solid rgba(255,255,255,0.12)',
                        }}
                      >
                        {key}
                      </kbd>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}