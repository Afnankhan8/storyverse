import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

// Public pages — UNTOUCHED
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

// Authenticated pages — NEW PREMIUM VERSIONS
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import UploadBook from './pages/UploadBook';
import Notes from './pages/Notes';
import Collaboration from './pages/Collaboration';
import Community from './pages/Community';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SettingsPage from './pages/SettingsPage';
import Bookshelf from './pages/Bookshelf';

// Existing create/hub pages
import BookStudio from './pages/BookStudio';
import ComicCreator from './pages/ComicCreator';
import ComicReader from './pages/ComicReader';
import CreatorProfile from './pages/CreatorProfile';
import HubFeed from './pages/HubFeed';
import EditStory from './pages/EditStory';
import PublishStory from './pages/PublishStory';
import MarketplacePage from './pages/MarketplacePage';
import NotificationsPage from './pages/NotificationsPage';
import HelpCenterPage from './pages/HelpCenterPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import SuperAdminDashboard from './superadmin/SuperAdminDashboard';

import CustomCursor from './components/CustomCursor';
import ParticleBackground from './components/ParticleBackground';
import './index.css';

interface User { name: string; email: string; }

function AppRoutes() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email!;
        setUser({ name: firebaseUser.displayName || email.split('@')[0], email });
        const path = window.location.pathname;
        const protectedPaths = [
          '/dashboard', '/library', '/upload', '/notes', '/collaboration', '/community',
          '/analytics', '/settings', '/bookshelf', '/studio', '/creator', '/notifications',
          '/hub', '/store', '/help', '/terms', '/privacy', '/book/', '/@', '/edit/', '/publish/',
        ];
        const isOnProtected = protectedPaths.some(p => path.startsWith(p));
        if (!isOnProtected) {
          if (email === 'superadmin@comixnova.ai') navigate('/superadmin');
          else navigate('/dashboard');
        }
      } else {
        setUser(null);
        const path = window.location.pathname;
        if (['/creator', '/superadmin'].includes(path)) navigate('/');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-xl">
            <span className="text-white font-black text-lg">S</span>
          </div>
          <div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const guard = (el: React.ReactNode) => user ? el : <Navigate to="/login" />;
  const superGuard = (el: React.ReactNode) => (user?.email === 'superadmin@comixnova.ai') ? el : <Navigate to="/" />;

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* ── Public / Auth ── */}
        <Route path="/" element={<LandingPage onGetStarted={() => navigate('/login')} />} />
        <Route path="/login" element={<LoginPage onLogin={() => navigate('/dashboard')} onSuperAdminLogin={() => navigate('/superadmin')} onSwitchToSignup={() => navigate('/signup')} />} />
        <Route path="/signup" element={<SignupPage onSignup={() => navigate('/dashboard')} onSwitchToLogin={() => navigate('/login')} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* ── Premium Authenticated App ── */}
        <Route path="/dashboard" element={guard(<Dashboard user={user} onLogout={handleLogout} />)} />
        <Route path="/library" element={guard(<Library user={user} onLogout={handleLogout} />)} />
        <Route path="/upload" element={guard(<UploadBook user={user} onLogout={handleLogout} />)} />
        <Route path="/notes" element={guard(<Notes user={user} onLogout={handleLogout} />)} />
        <Route path="/collaboration" element={guard(<Collaboration user={user} onLogout={handleLogout} />)} />
        <Route path="/community" element={guard(<Community user={user} onLogout={handleLogout} />)} />
        <Route path="/analytics" element={guard(<AnalyticsDashboard user={user} onLogout={handleLogout} />)} />
        <Route path="/settings" element={guard(<SettingsPage user={user} onLogout={handleLogout} />)} />
        <Route path="/bookshelf" element={guard(<Bookshelf user={user} onLogout={handleLogout} />)} />
        <Route path="/studio" element={guard(<BookStudio user={user} onLogout={handleLogout} />)} />
        <Route path="/creator" element={guard(<ComicCreator user={user} onLogout={handleLogout} />)} />
        <Route path="/notifications" element={guard(<NotificationsPage user={user} onLogout={handleLogout} />)} />

        {/* ── Hub / Discovery ── */}
        <Route path="/hub" element={<HubFeed user={user} onLogout={handleLogout} />} />
        <Route path="/store" element={<MarketplacePage user={user} onLogout={handleLogout} />} />
        <Route path="/help" element={<HelpCenterPage user={user} onLogout={handleLogout} />} />
        <Route path="/terms" element={<TermsPage user={user} onLogout={handleLogout} />} />
        <Route path="/privacy" element={<PrivacyPage user={user} onLogout={handleLogout} />} />

        {/* ── Book routes ── */}
        <Route path="/book/:id" element={<ComicReader />} />
        <Route path="/@:username" element={<CreatorProfile />} />
        <Route path="/edit/:id" element={guard(<EditStory user={user} />)} />
        <Route path="/publish/:id" element={guard(<PublishStory user={user} />)} />

        {/* ── Super Admin ── */}
        <Route path="/superadmin" element={superGuard(<SuperAdminDashboard onLogout={handleLogout} />)} />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen">
        <ParticleBackground />
        <CustomCursor />
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;