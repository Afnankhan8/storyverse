import { motion, useScroll, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Zap, BookOpen, Image, ArrowRight, Star, Users, Clock,
  Wand2, Palette, Shield, Play, CheckCircle, Diamond, Heart, Rocket,
  MessageCircle, Layers, Globe, Award, Menu, X, Crown, LogIn,
  Zap as Lightning,
} from 'lucide-react';
import { useRef, useState, useEffect, type MouseEvent } from 'react';

/* ═══════════════════════════════════════════════════════════════
   PREMIUM DESIGN SYSTEM
   ═══════════════════════════════════════════════════════════════ */
const theme = {
  colors: {
    // Backgrounds
    bg: {
      primary: '#0A0E27',
      secondary: '#111632',
      tertiary: '#1A1F3A',
    },
    // Premium Gradients
    gradient: {
      primary: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
      secondary: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)',
      blue: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      sky: 'linear-gradient(135deg, #60a5fa 0%, #38bdf8 100%)',
      orange: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      green: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    },
    // Accent Colors
    primary: '#667eea',
    secondary: '#0ea5e9',
    accent: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    // Text Colors
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.85)',
      muted: 'rgba(255, 255, 255, 0.6)',
      disabled: 'rgba(255, 255, 255, 0.4)',
    },
    // Surface Colors
    surface: {
      base: 'rgba(255, 255, 255, 0.05)',
      hover: 'rgba(255, 255, 255, 0.1)',
      active: 'rgba(255, 255, 255, 0.15)',
    },
    // Border Colors
    border: {
      base: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(255, 255, 255, 0.2)',
      focus: 'rgba(102, 126, 234, 0.5)',
    },
  },
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
  },
  borderRadius: {
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    full: '9999px',
  },
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.1)',
    md: '0 4px 16px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.2)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.25)',
    glow: '0 0 40px rgba(102, 126, 234, 0.3)',
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
};

/* ═══════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════════════ */
const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const offset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

/* ═══════════════════════════════════════════════════════════════
   TYPEWRITER COMPONENT
   ═══════════════════════════════════════════════════════════════ */
type TypewriterProps = {
  words: string[];
  className?: string;
};

const Typewriter = ({ words, className = '' }: TypewriterProps) => {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[index];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (text.length < word.length) {
          setText(word.slice(0, text.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (text.length > 0) {
          setText(text.slice(0, -1));
        } else {
          setIsDeleting(false);
          setIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, index, words]);

  return (
    <span className={className}>
      {text}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.7, repeat: Infinity }}
        style={{
          display: 'inline-block',
          width: '3px',
          height: '1em',
          background: theme.colors.primary,
          marginLeft: '4px',
          verticalAlign: 'middle',
        }}
      />
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER COMPONENT
   ═══════════════════════════════════════════════════════════════ */
type CounterProps = {
  target: number;
  suffix?: string;
  duration?: number;
};

const Counter = ({ target, suffix = '', duration = 2000 }: CounterProps) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const increment = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [hasStarted, target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════
   BACKGROUND EFFECTS
   ═══════════════════════════════════════════════════════════════ */
const BackgroundEffects = () => (
  <>
    {/* Gradient Orbs */}
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      {/* Orb 1 - Blue */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      
      {/* Orb 2 - Sky */}
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '20%',
          right: '-10%',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      
      {/* Orb 3 - Blue */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -100, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          bottom: '-5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(79, 172, 254, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
    </div>

    {/* Grid Pattern */}
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
      pointerEvents: 'none',
      backgroundImage: `
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
      `,
      backgroundSize: '80px 80px',
    }} />

    {/* Noise Texture */}
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
      pointerEvents: 'none',
      opacity: 0.03,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
    }} />
  </>
);

/* ═══════════════════════════════════════════════════════════════
   PREMIUM NAVBAR COMPONENT
   ═══════════════════════════════════════════════════════════════ */
type NavbarProps = {
  onGetStarted: () => void;
  scrolled: boolean;
};

const Navbar = ({ onGetStarted, scrolled }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: 'features' },
    { label: 'How It Works', href: 'how-it-works' },
    { label: 'Testimonials', href: 'testimonials' },
    { label: 'Pricing', href: 'pricing' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: scrolled 
            ? 'rgba(10, 14, 39, 0.95)' 
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom: scrolled 
            ? `1px solid ${theme.colors.border.base}` 
            : '1px solid transparent',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: scrolled ? theme.shadows.lg : 'none',
        }}
      >
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 clamp(1rem, 5vw, 3rem)',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              zIndex: 10,
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: theme.borderRadius.lg,
              background: theme.colors.gradient.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: theme.shadows.glow,
            }}>
              <Sparkles size={24} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{
              fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
              fontWeight: 900,
              background: theme.colors.gradient.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
            }}>
              ComixNova
            </span>
          </motion.div>

          {/* Desktop Navigation - Center */}
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'none',
          }}
          className="desktop-nav">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2.5rem',
              padding: '0.5rem 1.5rem',
              background: theme.colors.surface.base,
              borderRadius: theme.borderRadius.full,
              border: `1px solid ${theme.colors.border.base}`,
            }}>
              {navLinks.map((link) => (
                <motion.a
                  key={link.href}
                  href={`#${link.href}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    position: 'relative',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: theme.colors.text.secondary,
                    textDecoration: 'none',
                    padding: '0.5rem 0',
                    transition: theme.transitions.normal,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = theme.colors.text.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme.colors.text.secondary;
                  }}
                >
                  {link.label}
                  <motion.div
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      height: '2px',
                      background: theme.colors.gradient.primary,
                      borderRadius: '2px',
                    }}
                  />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Right Side Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}>
            {/* Upgrade Button - Desktop */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="upgrade-btn"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                borderRadius: theme.borderRadius.full,
                background: theme.colors.gradient.orange,
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(250, 112, 154, 0.3)',
                transition: theme.transitions.normal,
              }}
            >
              <Crown size={16} strokeWidth={2.5} />
              Go Premium
            </motion.button>

            {/* Sign In Button - Desktop */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="signin-btn"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.5rem',
                borderRadius: theme.borderRadius.full,
                background: theme.colors.surface.base,
                color: theme.colors.text.primary,
                fontSize: '0.9375rem',
                fontWeight: 600,
                border: `1px solid ${theme.colors.border.base}`,
                cursor: 'pointer',
                transition: theme.transitions.normal,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.surface.hover;
                e.currentTarget.style.borderColor = theme.colors.border.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.colors.surface.base;
                e.currentTarget.style.borderColor = theme.colors.border.base;
              }}
            >
              <LogIn size={16} strokeWidth={2.5} />
              Sign In
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(true)}
              className="mobile-menu-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                borderRadius: theme.borderRadius.md,
                background: theme.colors.surface.base,
                border: `1px solid ${theme.colors.border.base}`,
                color: theme.colors.text.primary,
                cursor: 'pointer',
                transition: theme.transitions.fast,
              }}
            >
              <Menu size={24} strokeWidth={2} />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2000,
              background: 'rgba(10, 14, 39, 0.98)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
            }}
          >
            {/* Close Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                width: '44px',
                height: '44px',
                borderRadius: theme.borderRadius.md,
                background: theme.colors.surface.base,
                border: `1px solid ${theme.colors.border.base}`,
                color: theme.colors.text.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={24} strokeWidth={2} />
            </motion.button>

            {/* Mobile Nav Links */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
              marginBottom: '3rem',
            }}>
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={`#${link.href}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    scrollToSection(link.href);
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: theme.colors.text.primary,
                    textDecoration: 'none',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>

            {/* Mobile Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              width: '100%',
              maxWidth: '300px',
            }}>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  padding: '1rem',
                  borderRadius: theme.borderRadius.lg,
                  background: theme.colors.gradient.orange,
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <Crown size={20} strokeWidth={2.5} />
                Go Premium
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onGetStarted();
                }}
                style={{
                  padding: '1rem',
                  borderRadius: theme.borderRadius.lg,
                  background: theme.colors.surface.base,
                  color: theme.colors.text.primary,
                  fontSize: '1rem',
                  fontWeight: 600,
                  border: `1px solid ${theme.colors.border.base}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <LogIn size={20} strokeWidth={2.5} />
                Sign In
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive Styles */}
      <style>{`
        @media (min-width: 1024px) {
          .desktop-nav {
            display: block !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
          .upgrade-btn,
          .signin-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function LandingPage({ onGetStarted = () => {} }) {
  const containerRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll({ target: containerRef });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Wand2,
      title: 'AI-Powered Storytelling',
      description: 'Advanced AI creates compelling narratives with rich dialogue, character development, and plot twists.',
      gradient: theme.colors.gradient.primary,
    },
    {
      icon: Palette,
      title: 'Professional Artwork',
      description: 'Studio-quality illustrations with consistent style, vibrant colors, and cinematic composition.',
      gradient: theme.colors.gradient.blue,
    },
    {
      icon: BookOpen,
      title: 'Interactive Reader',
      description: 'Immersive flipbook experience with smooth transitions and mobile-optimized viewing.',
      gradient: theme.colors.gradient.sky,
    },
    {
      icon: Lightning,
      title: 'Lightning Speed',
      description: 'Generate complete comics in under 30 seconds. From script to finished panels instantly.',
      gradient: theme.colors.gradient.orange,
    },
    {
      icon: Shield,
      title: 'Secure Library',
      description: 'All creations safely stored in the cloud with automatic backups and instant access.',
      gradient: theme.colors.gradient.green,
    },
    {
      icon: Sparkles,
      title: 'Premium Quality',
      description: 'High-resolution exports perfect for printing, sharing, or publishing professionally.',
      gradient: theme.colors.gradient.secondary,
    },
  ];

  const stats = [
    { icon: Sparkles, value: 100000, suffix: '+', label: 'Comics Created' },
    { icon: Users, value: 50000, suffix: '+', label: 'Active Creators' },
    { icon: Clock, value: 30, suffix: 's', label: 'Average Speed' },
    { icon: Image, value: 4, suffix: 'K', label: 'HD Resolution' },
  ];

  const steps = [
    {
      number: '01',
      icon: Wand2,
      title: 'Describe Your Story',
      description: 'Enter characters, setting, plot, and genre. Be as detailed or brief as you like.',
      gradient: theme.colors.gradient.primary,
    },
    {
      number: '02',
      icon: Sparkles,
      title: 'AI Creates Magic',
      description: 'Our AI generates the complete script, dialogue, and illustrated panels instantly.',
      gradient: theme.colors.gradient.blue,
    },
    {
      number: '03',
      icon: BookOpen,
      title: 'Read & Share',
      description: 'Enjoy your comic in our beautiful reader. Download, share, or publish easily.',
      gradient: theme.colors.gradient.sky,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: "Children's Book Author",
      text: "I've created over 50 comics for my readers. The quality is phenomenal. This tool has transformed my creative process completely.",
      avatar: 'SM',
      rating: 5,
    },
    {
      name: 'David Chen',
      role: 'Graphic Designer',
      text: 'As a professional designer, I was skeptical. But the output quality genuinely impressed me. The consistency is remarkable.',
      avatar: 'DC',
      rating: 5,
    },
    {
      name: 'Emma Rodriguez',
      role: 'Elementary Teacher',
      text: 'My students are completely engaged! Every child creates their own stories now. It\'s the highlight of our sessions.',
      avatar: 'ER',
      rating: 5,
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out ComixNova',
      features: [
        '3 comics per month',
        '8 panels per comic',
        'Standard resolution',
        'Community support',
        'Basic templates',
      ],
      popular: false,
      gradient: theme.colors.gradient.blue,
    },
    {
      name: 'Professional',
      price: '$12',
      period: 'per month',
      description: 'Best for serious creators',
      features: [
        'Unlimited comics',
        'Up to 16 panels',
        'HD exports & downloads',
        'Priority support',
        'Advanced templates',
        'Commercial license',
      ],
      popular: true,
      gradient: theme.colors.gradient.primary,
    },
    {
      name: 'Studio',
      price: '$39',
      period: 'per month',
      description: 'For professional teams',
      features: [
        'Everything in Pro',
        'Up to 24 panels',
        'Team collaboration',
        'API access',
        'White-label options',
        'Dedicated support',
      ],
      popular: false,
      gradient: theme.colors.gradient.sky,
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: ${theme.colors.bg.primary};
          color: ${theme.colors.text.primary};
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Scroll Progress Bar */
        .scroll-progress {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          z-index: 9999;
          transform-origin: left;
        }

        /* Section Styles */
        .section {
          position: relative;
          z-index: 10;
          padding: clamp(3rem, 8vw, 6rem) clamp(1rem, 5vw, 3rem);
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        /* Card Hover Effect */
        .feature-card,
        .step-card,
        .testimonial-card,
        .pricing-card {
          transition: transform ${theme.transitions.normal},
                      box-shadow ${theme.transitions.normal};
        }

        .feature-card:hover,
        .step-card:hover,
        .testimonial-card:hover {
          transform: translateY(-8px);
        }

        .pricing-card:hover {
          transform: translateY(-12px) scale(1.02);
        }

        /* Button Styles */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0;
          border: none;
          border-radius: ${theme.borderRadius.lg};
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all ${theme.transitions.normal};
          text-decoration: none;
        }

        .btn-primary {
          background: ${theme.colors.gradient.primary};
          color: #fff;
          padding: 1.125rem 2.5rem;
          box-shadow: ${theme.shadows.md};
        }

        .btn-primary:hover {
          box-shadow: ${theme.shadows.lg};
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: ${theme.colors.surface.base};
          color: ${theme.colors.text.primary};
          padding: 1.125rem 2.5rem;
          border: 1px solid ${theme.colors.border.base};
        }

        .btn-secondary:hover {
          background: ${theme.colors.surface.hover};
          border-color: ${theme.colors.border.hover};
        }

        /* Responsive Grid */
        .grid {
          display: grid;
          gap: clamp(1rem, 3vw, 2rem);
        }

        .grid-2 {
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
        }

        .grid-3 {
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
        }

        .grid-4 {
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
        }

        /* Badge */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          border-radius: ${theme.borderRadius.full};
          background: ${theme.colors.surface.base};
          border: 1px solid ${theme.colors.border.base};
          font-size: 0.875rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          backdrop-filter: blur(10px);
        }

        /* Responsive Typography */
        .heading-xl {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .heading-lg {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }

        .heading-md {
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 700;
          line-height: 1.3;
        }

        .text-gradient {
          background: ${theme.colors.gradient.primary};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .float {
          animation: float 6s ease-in-out infinite;
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .section {
            padding: clamp(2rem, 6vw, 4rem) 1.5rem;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
            padding: 1rem 2rem;
          }
        }

        /* Print Styles */
        @media print {
          .scroll-progress,
          nav,
          .mobile-menu-btn,
          .upgrade-btn,
          .signin-btn {
            display: none !important;
          }
        }
      `}</style>

      <div ref={containerRef} style={{ minHeight: '100vh', position: 'relative' }}>
        
        {/* Scroll Progress */}
        <motion.div
          className="scroll-progress"
          style={{
            scaleX: scrollYProgress,
            background: theme.colors.gradient.primary,
          }}
        />

        {/* Background Effects */}
        <BackgroundEffects />

        {/* Navbar */}
        <Navbar onGetStarted={onGetStarted} scrolled={scrolled} />

        {/* Hero Section */}
        <section className="section" style={{
          paddingTop: 'clamp(8rem, 15vw, 12rem)',
          paddingBottom: 'clamp(4rem, 10vw, 8rem)',
        }}>
          <div className="container" style={{ textAlign: 'center' }}>
            
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{ marginBottom: '2rem' }}
            >
              <span className="badge" style={{ color: theme.colors.text.muted }}>
                <Sparkles size={16} />
                AI-Powered Comic Creation Platform
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              className="heading-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ marginBottom: '1.5rem' }}
            >
              Transform Your Ideas Into<br />
              <span className="text-gradient">
                <Typewriter words={[
                  'Stunning Comics',
                  'Epic Adventures',
                  'Hero Stories',
                  'Space Sagas',
                ]} />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{
                fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
                color: theme.colors.text.muted,
                maxWidth: '700px',
                margin: '0 auto 3rem',
                lineHeight: 1.7,
              }}
            >
              Describe your story and watch as our advanced AI writes the script, generates stunning artwork, and delivers your complete comic in seconds.
            </motion.p>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '1rem',
                marginBottom: '3rem',
              }}
            >
              {[
                { icon: Users, text: '100,000+ Creators' },
                { icon: Star, text: '4.9/5 Rating' },
                { icon: Zap, text: '30-Second Generation' },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.25rem',
                    borderRadius: theme.borderRadius.full,
                    background: theme.colors.surface.base,
                    border: `1px solid ${theme.colors.border.base}`,
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: theme.colors.text.secondary,
                  }}
                >
                  <Icon size={18} color={theme.colors.primary} />
                  {text}
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="btn btn-primary"
              >
                Start Creating Free
                <ArrowRight size={20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-secondary"
              >
                <Play size={18} />
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Disclaimer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{
                fontSize: '0.875rem',
                color: theme.colors.text.disabled,
                marginBottom: '5rem',
              }}
            >
              No credit card required • Free forever plan available
            </motion.p>

            {/* Preview Cards */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <p style={{
                fontSize: '0.8125rem',
                color: theme.colors.text.disabled,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 700,
                marginBottom: '2rem',
              }}>
                Comics Created by Our Community
              </p>

              <div className="grid grid-4">
                {[
                  { emoji: '🦸‍♂️', label: 'Superhero', gradient: theme.colors.gradient.primary },
                  { emoji: '⚔️', label: 'Fantasy', gradient: theme.colors.gradient.orange },
                  { emoji: '🚀', label: 'Sci-Fi', gradient: theme.colors.gradient.blue },
                  { emoji: '🏆', label: 'Sports', gradient: theme.colors.gradient.green },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.05 }}
                    style={{
                      borderRadius: theme.borderRadius.xl,
                      background: theme.colors.surface.base,
                      border: `1px solid ${theme.colors.border.base}`,
                      padding: '2rem 1.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: item.gradient,
                    }} />
                    <div style={{
                      fontSize: '3rem',
                      marginBottom: '0.75rem',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                    }}>
                      {item.emoji}
                    </div>
                    <div style={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: theme.colors.text.primary,
                    }}>
                      {item.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="section">
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
              gap: '2px',
              background: theme.colors.border.base,
              borderRadius: theme.borderRadius.xl,
              overflow: 'hidden',
              border: `1px solid ${theme.colors.border.base}`,
            }}>
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  style={{
                    background: theme.colors.surface.base,
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <stat.icon
                    size={28}
                    color={theme.colors.primary}
                    strokeWidth={2}
                    style={{ margin: '0 auto 1rem' }}
                  />
                  <div style={{
                    fontSize: 'clamp(2.5rem, 5vw, 3rem)',
                    fontWeight: 900,
                    color: theme.colors.text.primary,
                    lineHeight: 1,
                    marginBottom: '0.5rem',
                  }}>
                    <Counter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: theme.colors.text.muted,
                    fontWeight: 600,
                  }}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="badge" style={{ color: theme.colors.text.muted, marginBottom: '1.5rem' }}>
                  <Layers size={16} />
                  Powerful Features
                </span>
                <h2 className="heading-lg" style={{ marginBottom: '1rem' }}>
                  Everything You Need to<br />
                  <span className="text-gradient">Create Amazing Comics</span>
                </h2>
                <p style={{
                  fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                  color: theme.colors.text.muted,
                  maxWidth: '600px',
                  margin: '0 auto',
                  lineHeight: 1.7,
                }}>
                  Professional-grade tools wrapped in an intuitive, easy-to-use interface. No design experience required.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="feature-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true, margin: "-50px" }}
                  style={{
                    background: theme.colors.surface.base,
                    border: `1px solid ${theme.colors.border.base}`,
                    borderRadius: theme.borderRadius.xl,
                    padding: '2.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: feature.gradient,
                  }} />

                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: theme.borderRadius.lg,
                    background: feature.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    boxShadow: theme.shadows.md,
                  }}>
                    <feature.icon size={28} color="#fff" strokeWidth={2} />
                  </div>

                  <h3 style={{
                    fontSize: '1.375rem',
                    fontWeight: 700,
                    color: theme.colors.text.primary,
                    marginBottom: '0.75rem',
                    lineHeight: 1.3,
                  }}>
                    {feature.title}
                  </h3>

                  <p style={{
                    fontSize: '1rem',
                    color: theme.colors.text.muted,
                    lineHeight: 1.7,
                  }}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="badge" style={{ color: theme.colors.text.muted, marginBottom: '1.5rem' }}>
                  <Rocket size={16} />
                  Simple Process
                </span>
                <h2 className="heading-lg" style={{ marginBottom: '1rem' }}>
                  Create Your Comic in{' '}
                  <span className="text-gradient">3 Easy Steps</span>
                </h2>
                <p style={{
                  fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                  color: theme.colors.text.muted,
                  maxWidth: '560px',
                  margin: '0 auto',
                  lineHeight: 1.7,
                }}>
                  No drawing skills needed. No complex software. Just your imagination and our AI.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-3">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  className="step-card"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.7 }}
                  viewport={{ once: true, margin: "-50px" }}
                  style={{
                    background: theme.colors.surface.base,
                    border: `1px solid ${theme.colors.border.base}`,
                    borderRadius: theme.borderRadius.xl,
                    padding: '2.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: step.gradient,
                  }} />

                  <div style={{
                    fontSize: 'clamp(4rem, 8vw, 7rem)',
                    fontWeight: 900,
                    lineHeight: 1,
                    background: step.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    opacity: 0.15,
                    marginBottom: '1.5rem',
                  }}>
                    {step.number}
                  </div>

                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: theme.borderRadius.md,
                    background: step.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                  }}>
                    <step.icon size={26} color="#fff" strokeWidth={2} />
                  </div>

                  <h3 style={{
                    fontSize: '1.375rem',
                    fontWeight: 700,
                    color: theme.colors.text.primary,
                    marginBottom: '0.75rem',
                  }}>
                    {step.title}
                  </h3>

                  <p style={{
                    fontSize: '1rem',
                    color: theme.colors.text.muted,
                    lineHeight: 1.7,
                  }}>
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="badge" style={{ color: theme.colors.text.muted, marginBottom: '1.5rem' }}>
                  <Heart size={16} />
                  Customer Reviews
                </span>
                <h2 className="heading-lg">
                  Trusted by{' '}
                  <span className="text-gradient">Creative Professionals</span>
                </h2>
              </motion.div>
            </div>

            <div className="grid grid-3">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  className="testimonial-card"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  viewport={{ once: true, margin: "-50px" }}
                  style={{
                    background: theme.colors.surface.base,
                    border: `1px solid ${theme.colors.border.base}`,
                    borderRadius: theme.borderRadius.xl,
                    padding: '2.5rem',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    gap: '0.25rem',
                    marginBottom: '1.5rem',
                  }}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        color={theme.colors.warning}
                        fill={theme.colors.warning}
                        strokeWidth={0}
                      />
                    ))}
                  </div>

                  <p style={{
                    fontSize: '1rem',
                    color: theme.colors.text.secondary,
                    lineHeight: 1.8,
                    marginBottom: '2rem',
                    fontStyle: 'italic',
                  }}>
                    "{testimonial.text}"
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: theme.colors.gradient.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      color: '#fff',
                    }}>
                      {testimonial.avatar}
                    </div>

                    <div>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: theme.colors.text.primary,
                        marginBottom: '0.125rem',
                      }}>
                        {testimonial.name}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: theme.colors.text.muted,
                      }}>
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="badge" style={{ color: theme.colors.text.muted, marginBottom: '1.5rem' }}>
                  <Diamond size={16} />
                  Flexible Pricing
                </span>
                <h2 className="heading-lg" style={{ marginBottom: '1rem' }}>
                  Choose Your{' '}
                  <span className="text-gradient">Perfect Plan</span>
                </h2>
                <p style={{
                  fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                  color: theme.colors.text.muted,
                  lineHeight: 1.7,
                }}>
                  Start free and upgrade as you grow. Cancel anytime.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-3">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  className="pricing-card"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15, duration: 0.7 }}
                  viewport={{ once: true }}
                  style={{
                    position: 'relative',
                    background: plan.popular
                      ? `linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05))`
                      : theme.colors.surface.base,
                    border: plan.popular
                      ? `2px solid rgba(102, 126, 234, 0.3)`
                      : `1px solid ${theme.colors.border.base}`,
                    borderRadius: theme.borderRadius.xl,
                    padding: '3rem 2.5rem',
                    overflow: 'hidden',
                  }}
                >
                  {plan.popular && (
                    <>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: plan.gradient,
                      }} />
                      <div style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        background: plan.gradient,
                        color: '#fff',
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        padding: '0.375rem 0.875rem',
                        borderRadius: theme.borderRadius.full,
                        textTransform: 'uppercase',
                        boxShadow: theme.shadows.md,
                      }}>
                        Most Popular
                      </div>
                    </>
                  )}

                  <div style={{
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: theme.colors.text.muted,
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                  }}>
                    {plan.name}
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{
                      fontSize: 'clamp(3rem, 6vw, 4rem)',
                      fontWeight: 800,
                      color: theme.colors.text.primary,
                      lineHeight: 1,
                    }}>
                      {plan.price}
                    </span>
                    {plan.price !== '$0' && (
                      <span style={{
                        fontSize: '1.125rem',
                        color: theme.colors.text.muted,
                        marginLeft: '0.5rem',
                      }}>
                        /{plan.period.split(' ')[1]}
                      </span>
                    )}
                  </div>

                  <p style={{
                    fontSize: '0.9375rem',
                    color: theme.colors.text.muted,
                    marginBottom: '2rem',
                  }}>
                    {plan.description}
                  </p>

                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}>
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          fontSize: '1rem',
                          color: theme.colors.text.secondary,
                        }}
                      >
                        <CheckCircle size={18} color={theme.colors.success} strokeWidth={2.5} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onGetStarted}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: theme.borderRadius.lg,
                      border: plan.popular ? 'none' : `1px solid ${theme.colors.border.base}`,
                      background: plan.popular ? plan.gradient : 'transparent',
                      color: plan.popular ? '#fff' : theme.colors.text.primary,
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: theme.transitions.normal,
                      boxShadow: plan.popular ? theme.shadows.md : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!plan.popular) {
                        e.currentTarget.style.background = theme.colors.surface.hover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!plan.popular) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    Get Started
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="section">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              style={{
                maxWidth: '900px',
                margin: '0 auto',
                textAlign: 'center',
                background: `linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05))`,
                border: `1px solid rgba(102, 126, 234, 0.2)`,
                borderRadius: theme.borderRadius['2xl'],
                padding: 'clamp(3rem, 6vw, 5rem) clamp(2rem, 4vw, 3rem)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: '15%',
                right: '15%',
                height: '3px',
                background: theme.colors.gradient.primary,
              }} />

              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: theme.borderRadius.xl,
                background: theme.colors.gradient.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem',
                boxShadow: theme.shadows.glow,
              }}>
                <Sparkles size={36} color="#fff" strokeWidth={2.5} />
              </div>

              <h2 className="heading-lg" style={{ marginBottom: '1.5rem' }}>
                Ready to Bring Your<br />
                <span className="text-gradient">Stories to Life?</span>
              </h2>

              <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                color: theme.colors.text.muted,
                maxWidth: '600px',
                margin: '0 auto 3rem',
                lineHeight: 1.7,
              }}>
                Join over 100,000 creators worldwide who are already using ComixNova to transform their ideas into professional comics.
              </p>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="btn btn-primary"
                style={{
                  padding: '1.25rem 3rem',
                  fontSize: '1.125rem',
                }}
              >
                Start Creating Free Today
                <ArrowRight size={22} strokeWidth={2.5} />
              </motion.button>

              <p style={{
                fontSize: '0.875rem',
                color: theme.colors.text.disabled,
                marginTop: '1.5rem',
              }}>
                No credit card required • Unlimited free plan available
              </p>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          position: 'relative',
          zIndex: 10,
          borderTop: `1px solid ${theme.colors.border.base}`,
          background: 'rgba(10, 14, 39, 0.6)',
          backdropFilter: 'blur(20px)',
          padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 5vw, 3rem) 2.5rem',
        }}>
          <div className="container">
            <div className="grid grid-4" style={{ marginBottom: '4rem' }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: theme.borderRadius.md,
                    background: theme.colors.gradient.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: theme.shadows.glow,
                  }}>
                    <Sparkles size={20} color="#fff" strokeWidth={2.5} />
                  </div>
                  <span style={{
                    fontSize: '1.375rem',
                    fontWeight: 900,
                    background: theme.colors.gradient.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    ComixNova
                  </span>
                </div>
                <p style={{
                  fontSize: '0.9375rem',
                  color: theme.colors.text.muted,
                  lineHeight: 1.7,
                  maxWidth: '280px',
                }}>
                  Transform your creative ideas into stunning comics with the power of AI. Fast, easy, and professional.
                </p>
              </div>

              {[
                {
                  heading: 'Product',
                  links: ['Features', 'Pricing', 'How It Works', 'Templates', 'API'],
                },
                {
                  heading: 'Company',
                  links: ['About Us', 'Blog', 'Careers', 'Press Kit', 'Contact'],
                },
                {
                  heading: 'Resources',
                  links: ['Help Center', 'Community', 'Tutorials', 'Documentation', 'Status'],
                },
              ].map((column) => (
                <div key={column.heading}>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: theme.colors.text.muted,
                    marginBottom: '1.5rem',
                  }}>
                    {column.heading}
                  </h4>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.875rem',
                  }}>
                    {column.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          style={{
                            fontSize: '0.9375rem',
                            color: theme.colors.text.muted,
                            textDecoration: 'none',
                            transition: theme.transitions.fast,
                          }}
                          onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.color = theme.colors.text.primary}
                          onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.color = theme.colors.text.muted}
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div style={{
              borderTop: `1px solid ${theme.colors.border.base}`,
              paddingTop: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}>
              <p style={{
                fontSize: '0.875rem',
                color: theme.colors.text.muted,
              }}>
                © 2025 ComixNova. All rights reserved. Built with passion for storytellers worldwide.
              </p>

              <div style={{
                display: 'flex',
                gap: '1rem',
              }}>
                {[
                  { icon: Globe, label: 'Website' },
                  { icon: MessageCircle, label: 'Discord' },
                  { icon: Award, label: 'Twitter' },
                ].map(({ icon: Icon, label }) => (
                  <motion.a
                    key={label}
                    href="#"
                    aria-label={label}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: theme.borderRadius.md,
                      background: theme.colors.surface.base,
                      border: `1px solid ${theme.colors.border.base}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.colors.text.muted,
                      transition: theme.transitions.normal,
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = theme.colors.primary;
                      e.currentTarget.style.borderColor = theme.colors.border.hover;
                      e.currentTarget.style.background = theme.colors.surface.hover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = theme.colors.text.muted;
                      e.currentTarget.style.borderColor = theme.colors.border.base;
                      e.currentTarget.style.background = theme.colors.surface.base;
                    }}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}