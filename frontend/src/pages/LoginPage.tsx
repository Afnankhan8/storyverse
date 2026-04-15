import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { sendEmail } from '../emailService';

interface LoginPageProps {
  onLogin: () => void;
  onSuperAdminLogin?: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginPage({
  onLogin,
  onSuperAdminLogin,
  onSwitchToSignup
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    if (email === 'superadmin@bookify.ai' && password === 'bookify@2025') {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
          await createUserWithEmailAndPassword(auth, email, password);
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          setError('Super admin login failed');
          setLoading(false);
          return;
        }
      }

      alert('Super Admin Login Successful');
      await sendEmail(email, 'Super Admin', 'login');

      if (onSuperAdminLogin) onSuperAdminLogin();
      else onLogin();

      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);

      alert('Login Successful');
      await sendEmail(email, email, 'login');

      onLogin();
    } catch (err: any) {
      if (err.code === 'auth/user-not-found')
        setError('No account found with this email');
      else if (err.code === 'auth/wrong-password')
        setError('Incorrect password');
      else if (err.code === 'auth/invalid-email')
        setError('Invalid email address');
      else
        setError('Login failed. Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0A0F] to-[#1a0a2e] px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold gradient-text mb-2">Welcome Back</h2>
          <p className="text-gray-400">Login to continue your comic journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 glass rounded-xl text-white"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 glass rounded-xl text-white"
                placeholder="Enter your password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-pink-500 text-sm">{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? 'Logging in...' : 'Login'}
            <ArrowRight size={18} />
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-purple-500"
            >
              Sign up
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}