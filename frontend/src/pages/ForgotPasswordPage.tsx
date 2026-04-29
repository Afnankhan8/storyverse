import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase.ts';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true); setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: any) {
      const msgs: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email address.',
        'auth/invalid-email': 'Please enter a valid email address.',
      };
      setError(msgs[err.code] || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-slate-200/50 p-8 md:p-10">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen size={16} color="#fff" />
            </div>
            <span className="text-gray-900 font-bold text-lg">Storyverse</span>
          </div>

          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Reset your password</h1>
                <p className="text-slate-500 text-sm mb-6">
                  Enter your email and we'll send you a link to reset your password.
                </p>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                  <div className="relative mb-6">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email" value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required autoFocus
                    />
                  </div>
                  <motion.button
                    type="submit" disabled={loading}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-60"
                  >
                    {loading
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : 'Send reset link'
                    }
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Check your inbox</h2>
                <p className="text-slate-500 text-sm mb-6">
                  We sent a password reset link to <strong className="text-gray-900">{email}</strong>.
                  It may take a minute to arrive.
                </p>
                <p className="text-xs text-slate-400 mb-6">
                  Didn't receive it?{' '}
                  <button onClick={() => setSent(false)} className="text-blue-600 font-medium hover:underline">
                    Resend email
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back to login */}
          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-gray-900 transition-colors mt-6 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
