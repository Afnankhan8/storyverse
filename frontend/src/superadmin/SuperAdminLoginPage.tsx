import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, Shield } from 'lucide-react';

const SUPER_USERNAME = 'superadmin';
const SUPER_PASSWORD = 'comixnova@2025';

interface SuperAdminLoginProps {
  onLogin: () => void;
}

export default function SuperAdminLoginPage({ onLogin }: SuperAdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === SUPER_USERNAME && password === SUPER_PASSWORD) {
      localStorage.setItem('superAdminAuth', 'true');
      onLogin();
    } else {
      setError('Invalid super admin credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-purple-500/20 rounded-full mb-4">
            <Shield className="w-8 h-8 text-purple-300" />
          </div>
          <h1 className="text-3xl font-bold text-white">Super Admin Portal</h1>
          <p className="text-purple-200 mt-2">ComixNova AI – Full System Control</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-purple-300/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="superadmin"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-white/10 border border-purple-300/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-300 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <Lock size={18} />
            Access Super Dashboard
          </button>
        </form>
      </motion.div>
    </div>
  );
}