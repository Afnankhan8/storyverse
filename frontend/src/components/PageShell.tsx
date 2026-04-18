/**
 * PageShell — Premium shared layout wrapper for all inner pages.
 * Inspired by Notion, Linear, Stripe, GitHub navbar patterns.
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen, LayoutDashboard, Compass, Bookmark, PenSquare,
  Bell, Settings, LogOut, Menu, X, ChevronDown,
  User as UserIcon, ShoppingBag, HelpCircle, FileText,
  Shield, Zap, BarChart3, Star, Wand2
} from 'lucide-react';

interface Props {
  children: React.ReactNode;
  user?: { name: string; email: string } | null;
  onLogout?: () => void;
}

const NAV_LINKS = [
  { label: 'Dashboard',  to: '/dashboard', icon: LayoutDashboard },
  { label: 'Explore',    to: '/hub',       icon: Compass },
  { label: 'Store',      to: '/store',     icon: ShoppingBag },
  { label: 'Write Book', to: '/studio',    icon: PenSquare },
  { label: 'AI Comics',  to: '/creator',   icon: Wand2 },
];

const FOOTER_LINKS = {
  Product: [
    { label: 'Explore Hub',      to: '/hub' },
    { label: 'Marketplace',      to: '/store' },
    { label: 'Book Studio',      to: '/studio' },
    { label: 'AI Comic Creator', to: '/creator' },
    { label: 'Bookshelf',        to: '/bookshelf' },
    { label: 'Analytics',        to: '/analytics' },
  ],
  Company: [
    { label: 'About Storyverse', to: '/' },
    { label: 'Help Center',      to: '/help' },
    { label: 'Pricing',          to: '/#pricing' },
  ],
  Legal: [
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Privacy Policy',   to: '/privacy' },
  ],
  Account: [
    { label: 'Dashboard',     to: '/dashboard' },
    { label: 'Settings',      to: '/settings' },
    { label: 'Notifications', to: '/notifications' },
    { label: 'Sign In',       to: '/login' },
    { label: 'Sign Up',       to: '/signup' },
  ],
};

export default function PageShell({ children, user, onLogout }: Props) {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const location   = useLocation();
  const navigate   = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const isActive = (to: string) =>
    to === '/dashboard' ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ══════════════════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════════════════ */}
      <nav className="no-print fixed top-0 inset-x-0 z-[999] bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="w-full px-5 md:px-8 h-16 flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <BookOpen size={16} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-xl text-gray-900 tracking-tight hidden sm:block" style={{ fontFamily: "'Syne', sans-serif" }}>
              Storyverse
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive(l.to)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}>
                <l.icon size={15} className={isActive(l.to) ? 'text-blue-600' : 'text-slate-400'} />
                {l.label}
              </Link>
            ))}
          </div>

          {/* ── Right Side ── */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Write CTA button */}
                <button onClick={() => navigate('/studio')}
                  className="hidden md:flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20">
                  <Zap size={14} /> New Book
                </button>

                {/* Notifications */}
                <Link to="/notifications"
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </Link>

                {/* Profile dropdown */}
                <div ref={profileRef} className="relative">
                  <button onClick={() => setProfileOpen(p => !p)}
                    className="flex items-center gap-2 p-1 pl-1 pr-2.5 rounded-xl border border-transparent hover:border-gray-200 hover:bg-slate-50 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-extrabold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 max-w-[90px] truncate hidden md:block">{user.name}</span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-gray-100 overflow-hidden z-50"
                      >
                        {/* User info */}
                        <div className="px-4 py-3.5 bg-slate-50 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-extrabold flex-shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-gray-900 truncate">{user.name}</div>
                              <div className="text-xs text-slate-400 truncate">{user.email}</div>
                            </div>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="p-1.5">
                          {[
                            { icon: LayoutDashboard, label: 'Dashboard',        to: '/dashboard' },
                            { icon: UserIcon,        label: 'My Profile',       to: `/@${user.name}` },
                            { icon: PenSquare,       label: 'Write a Book',     to: '/studio' },
                            { icon: Wand2,           label: 'AI Comic Creator', to: '/creator' },
                            { icon: BarChart3,       label: 'Analytics',        to: '/analytics' },
                            { icon: Bookmark,        label: 'Bookshelf',        to: '/bookshelf' },
                            { icon: Bell,            label: 'Notifications',    to: '/notifications' },
                            { icon: Settings,        label: 'Settings',         to: '/settings' },
                          ].map(item => (
                            <Link key={item.to} to={item.to} onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                              <item.icon size={16} className="text-slate-400 flex-shrink-0" />
                              {item.label}
                            </Link>
                          ))}
                        </div>

                        <div className="p-1.5 border-t border-gray-100">
                          <button onClick={() => { setProfileOpen(false); onLogout?.(); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                            <LogOut size={16} className="flex-shrink-0" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all">
                  Sign In
                </Link>
                <Link to="/signup" className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20">
                  Get Started Free
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(o => !o)}
              className="md:hidden w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════
          MOBILE DRAWER
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed inset-y-0 right-0 w-72 bg-white z-[2000] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="font-extrabold text-lg text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>Menu</span>
              <button onClick={() => setMenuOpen(false)} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {/* Nav links */}
              {NAV_LINKS.map(l => (
                <Link key={l.to} to={l.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive(l.to) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}>
                  <l.icon size={18} className={isActive(l.to) ? 'text-blue-600' : 'text-slate-400'} />
                  {l.label}
                </Link>
              ))}

              <div className="border-t border-gray-100 my-2" />

              {/* Extra links */}
              {[
                { icon: Bookmark,    label: 'Bookshelf',        to: '/bookshelf' },
                { icon: Wand2,       label: 'AI Comic Creator', to: '/creator' },
                { icon: Bell,        label: 'Notifications',    to: '/notifications' },
                { icon: BarChart3,   label: 'Analytics',        to: '/analytics' },
                { icon: Settings,    label: 'Settings',         to: '/settings' },
                { icon: HelpCircle,  label: 'Help Center',      to: '/help' },
              ].map(item => (
                <Link key={item.to} to={item.to}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  <item.icon size={18} className="text-slate-400" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="p-4 border-t border-gray-100">
              {user ? (
                <div>
                  <div className="flex items-center gap-3 mb-3 px-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-gray-900 truncate">{user.name}</div>
                      <div className="text-xs text-slate-400 truncate">{user.email}</div>
                    </div>
                  </div>
                  <button onClick={() => { setMenuOpen(false); onLogout?.(); }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 font-bold text-sm rounded-xl">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="block w-full text-center py-3 bg-slate-100 text-slate-800 font-bold text-sm rounded-xl">Sign In</Link>
                  <Link to="/signup" className="block w-full text-center py-3 bg-blue-600 text-white font-bold text-sm rounded-xl shadow-lg">Get Started Free</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          PAGE CONTENT
      ══════════════════════════════════════════════════════════ */}
      <main className="flex-1 pt-16 w-full">
        {children}
      </main>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer className="bg-gray-950 text-gray-400 border-t border-white/5 mt-auto no-print">
        <div className="w-full px-6 lg:px-10 py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">

            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                  <BookOpen size={16} color="#fff" strokeWidth={2.5} />
                </div>
                <span className="font-extrabold text-white text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Storyverse</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                The world's best platform for independent book publishers and passionate readers.
              </p>
              <div className="flex items-center gap-1.5">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <span className="text-xs text-gray-500">4.9 · 50,000+ authors</span>
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([section, links]) => (
              <div key={section}>
                <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">{section}</h4>
                <ul className="space-y-2.5">
                  {links.map(link => (
                    <li key={link.to}>
                      <Link to={link.to} className="text-sm text-gray-500 hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} Storyverse Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              <Link to="/terms" className="text-xs text-gray-600 hover:text-white transition-colors flex items-center gap-1">
                <FileText size={11} /> Terms
              </Link>
              <Link to="/privacy" className="text-xs text-gray-600 hover:text-white transition-colors flex items-center gap-1">
                <Shield size={11} /> Privacy
              </Link>
              <Link to="/help" className="text-xs text-gray-600 hover:text-white transition-colors flex items-center gap-1">
                <HelpCircle size={11} /> Help
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
