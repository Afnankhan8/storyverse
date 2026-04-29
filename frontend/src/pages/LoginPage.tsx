import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, Star, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup,
} from 'firebase/auth';
import { auth } from '../firebase.ts';
import { sendEmail } from '../emailService';

interface Props {
  onLogin: () => void;
  onSuperAdminLogin?: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginPage({ onLogin, onSuperAdminLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      if (email === 'superadmin@comixnova.ai' && password === 'comixnova@2025') {
        try { await signInWithEmailAndPassword(auth, email, password); }
        catch (err: any) {
          if (err.code === 'auth/user-not-found') {
            await createUserWithEmailAndPassword(auth, email, password);
            await signInWithEmailAndPassword(auth, email, password);
          } else throw err;
        }
        await sendEmail(email, 'Super Admin', 'login');
        setSuccess(true);
        setTimeout(() => { if (onSuperAdminLogin) onSuperAdminLogin(); else onLogin(); }, 800);
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
      await sendEmail(email, email.split('@')[0], 'login');
      setSuccess(true);
      setTimeout(onLogin, 800);
    } catch (err: any) {
      const msgs: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
      };
      setError(msgs[err.code] || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true); setError('');
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      setSuccess(true);
      setTimeout(onLogin, 800);
    } catch (err: any) {
      setError('Google sign-in failed. Please try again.');
    } finally { setGoogleLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gray-950 p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(37,99,235,0.2),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(245,158,11,0.1),_transparent_60%)]" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <BookOpen size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">ComixNova</span>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Millions of stories.<br />
              <span className="text-blue-400">One great platform.</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              Write, publish, and discover the world's best ebooks, novels, and comics. Join 50,000+ creators today.
            </p>

            {/* Book stack visual */}
            <div className="flex items-end gap-3 mb-10">
              {[
                { seed: 'book1', h: 'h-32', rotate: '-rotate-6' },
                { seed: 'book2', h: 'h-40', rotate: '' },
                { seed: 'book3', h: 'h-28', rotate: 'rotate-6' },
                { seed: 'book4', h: 'h-36', rotate: 'rotate-3' },
              ].map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`w-20 ${b.h} rounded-lg overflow-hidden shadow-2xl flex-shrink-0 ${b.rotate}`}
                >
                  <img src={`https://picsum.photos/seed/${b.seed + i}/120/180`} alt="Book" className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} size={12} className="fill-amber-400 text-amber-400" />)}
                </div>
                <span className="text-gray-400 text-sm">4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-gray-400 text-sm">Free to start</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-gray-600 text-xs">
          © 2026 ComixNova Inc. · Privacy · Terms
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen size={16} color="#fff" />
            </div>
            <span className="text-gray-900 font-bold text-lg">ComixNova</span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-slate-500 mb-8">Sign in to your account to continue reading and writing.</p>

          {/* Success state */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3"
              >
                <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                <span className="text-emerald-700 font-medium">Login successful! Redirecting...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error state */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Sign In */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3.5 px-4 text-sm font-semibold text-gray-700 hover:bg-slate-50 hover:border-gray-300 transition-all mb-6 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2a10.34 10.34 0 0 0-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92A8.78 8.78 0 0 0 17.64 9.2z" fill="#4285F4"/>
              <path d="M9 18a8.6 8.6 0 0 0 5.96-2.18l-2.92-2.26a5.43 5.43 0 0 1-8.09-2.85H.98v2.33A9 9 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.95 10.71A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.71V4.96H.98A9 9 0 0 0 0 9a9 9 0 0 0 .98 4.04l2.97-2.33z" fill="#FBBC05"/>
              <path d="M9 3.58a4.86 4.86 0 0 1 3.44 1.35l2.58-2.58A8.64 8.64 0 0 0 9 0 9 9 0 0 0 .98 4.96L3.95 7.29A5.36 5.36 0 0 1 9 3.58z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${rememberMe ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}
              >
                {rememberMe && <CheckCircle2 size={12} color="#fff" />}
              </button>
              <label className="text-sm text-slate-600 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                Remember me for 30 days
              </label>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || success}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}