import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase.ts';
import { sendEmail } from '../emailService';

interface Props {
  onSignup: () => void;
  onSwitchToLogin: () => void;
}

const getPasswordStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
const strengthTextColor = ['', 'text-red-500', 'text-amber-500', 'text-blue-500', 'text-emerald-500'];

export default function SignupPage({ onSignup }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (!email) { setError('Please enter your email.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!agreed) { setError('Please accept the Terms of Service.'); return; }

    setLoading(true); setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await sendEmail(email, name, 'signup');
      setSuccess(true);
      setTimeout(onSignup, 900);
    } catch (err: any) {
      const msgs: Record<string, string> = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
      };
      setError(msgs[err.code] || 'Signup failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true); setError('');
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      setSuccess(true);
      setTimeout(onSignup, 800);
    } catch {
      setError('Google sign-up failed. Please try again.');
    } finally { setGoogleLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gray-950 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.2),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(245,158,11,0.1),_transparent_60%)]" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <BookOpen size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">Storyverse</span>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Start your story<br />
              <span className="text-blue-400">today. Free forever.</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              Join a community of passionate writers and readers. Publish your first book in minutes.
            </p>

            {/* Feature list */}
            <div className="space-y-4">
              {[
                'Free to publish unlimited books',
                'Beautiful reading experience for your readers',
                'Built-in audience of passionate readers',
                'Earn royalties from day one',
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={14} className="text-blue-400" />
                  </div>
                  <span className="text-gray-300 text-sm">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 text-gray-600 text-xs">
          © 2026 Storyverse Inc. · Privacy · Terms
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
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
            <span className="text-gray-900 font-bold text-lg">Storyverse</span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Create your account</h1>
          <p className="text-slate-500 mb-8">Join 50,000+ authors. Start publishing for free.</p>

          {/* Success */}
          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                <span className="text-emerald-700 font-medium">Account created! Welcome to Storyverse 🎉</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-red-700 text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3.5 px-4 text-sm font-semibold text-gray-700 hover:bg-slate-50 hover:border-gray-300 transition-all mb-5 disabled:opacity-60">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2a10.34 10.34 0 0 0-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92A8.78 8.78 0 0 0 17.64 9.2z" fill="#4285F4"/>
              <path d="M9 18a8.6 8.6 0 0 0 5.96-2.18l-2.92-2.26a5.43 5.43 0 0 1-8.09-2.85H.98v2.33A9 9 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.95 10.71A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.71V4.96H.98A9 9 0 0 0 0 9a9 9 0 0 0 .98 4.04l2.97-2.33z" fill="#FBBC05"/>
              <path d="M9 3.58a4.86 4.86 0 0 1 3.44 1.35l2.58-2.58A8.64 8.64 0 0 0 9 0 9 9 0 0 0 .98 4.96L3.95 7.29A5.36 5.36 0 0 1 9 3.58z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Creating account...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={name} onChange={e => { setName(e.target.value); setError(''); }}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength meter */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${strengthTextColor[strength]}`}>{strengthLabel[strength]} password</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showConfirm ? 'text' : 'password'} value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError(''); }}
                  placeholder="Repeat your password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${confirm && confirm !== password ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-transparent'}`}
                  required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gray-600 transition-colors">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirm && confirm !== password && (
                <p className="text-xs text-red-500 mt-1.5">Passwords do not match</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-1">
              <button type="button" onClick={() => setAgreed(!agreed)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${agreed ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                {agreed && <CheckCircle2 size={12} color="#fff" />}
              </button>
              <label className="text-sm text-slate-600 leading-relaxed cursor-pointer" onClick={() => setAgreed(!agreed)}>
                I agree to Storyverse's{' '}
                <a href="/terms" target="_blank" className="text-blue-600 hover:underline font-medium">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" target="_blank" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>
              </label>
            </div>

            {/* Submit */}
            <motion.button type="submit" disabled={loading || success}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Create account <ArrowRight size={16} /></>
              }
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}