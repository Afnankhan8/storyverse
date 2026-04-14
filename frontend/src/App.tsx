import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ComicCreator from './pages/ComicCreator';
import SuperAdminDashboard from './superadmin/SuperAdminDashboard';  // <-- add this import
import CustomCursor from './components/CustomCursor';
import ParticleBackground from './components/ParticleBackground';
import './index.css';

type Screen = 'landing' | 'login' | 'signup' | 'creator' | 'superadmin';  // added 'superadmin'

interface User {
  name: string;
  email: string;
}

function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email!;
        setUser({
          name: firebaseUser.displayName || email.split('@')[0],
          email: email,
        });
        // If the logged-in user is the super admin, go to superadmin screen
        if (email === 'superadmin@bookify.ai') {
          setScreen('superadmin');
        } else {
          setScreen('creator');
        }
      } else {
        setUser(null);
        setScreen('landing');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setScreen('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F]">
        <div className="text-[#8B5CF6] text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      <CustomCursor />

      <AnimatePresence mode="wait">
        {screen === 'landing' && (
          <LandingPage onGetStarted={() => setScreen('login')} />
        )}

        {screen === 'login' && (
          <LoginPage
            onLogin={() => setScreen('creator')}
            onSuperAdminLogin={() => setScreen('superadmin')}   // <-- new prop
            onSwitchToSignup={() => setScreen('signup')}
          />
        )}

        {screen === 'signup' && (
          <SignupPage
            onSignup={() => setScreen('creator')}
            onSwitchToLogin={() => setScreen('login')}
          />
        )}

        {screen === 'creator' && user && (
          <ComicCreator user={user} onLogout={handleLogout} />
        )}

        {screen === 'superadmin' && (
          <SuperAdminDashboard onLogout={handleLogout} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;