import { Sparkles, BookOpen, Zap, Crown } from 'lucide-react';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
export const theme = {
  colors: {
    bg: {
      primary: '#FFFDF7',
      secondary: '#FFFFFF',
      tertiary: '#FFF8EE',
      ink: '#0D0A0E',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #FF6B35 0%, #F7C59F 100%)',
      secondary: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
      gold: 'linear-gradient(135deg, #F7C59F 0%, #FFD700 100%)',
      hero: 'linear-gradient(160deg, #0D0A0E 0%, #1A1035 50%, #2D1B69 100%)',
      panel1: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
      panel2: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)',
      panel3: 'linear-gradient(135deg, #F7C59F 0%, #FBBF24 100%)',
      panel4: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      halftone: `radial-gradient(circle, #FF6B3520 1px, transparent 1px)`,
    },
    primary: '#FF6B35',
    secondary: '#6C63FF',
    accent: '#FFD700',
    accentAlt: '#10B981',
    ink: '#0D0A0E',
    success: '#10B981',
    warning: '#FBBF24',
    danger: '#EF4444',
    text: {
      primary: '#0D0A0E',
      secondary: '#3D3550',
      muted: '#7C7490',
      light: '#B5AECA',
      onDark: '#FFFDF7',
      onPrimary: '#FFFFFF',
    },
    surface: {
      base: '#FFFFFF',
      warm: '#FFFDF7',
      panel: '#FFF4E6',
      dark: '#1A1035',
      ink: '#0D0A0E',
    },
    border: {
      base: '#EDE8FF',
      warm: '#FFD5B8',
      ink: '#0D0A0E',
      focus: '#FF6B35',
    },
  },
  fonts: {
    display: "'Bangers', 'Bebas Neue', cursive",
    heading: "'Playfair Display', Georgia, serif",
    body: "'DM Sans', 'Nunito', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
    comic: "'Bangers', cursive",
  },
  spacing: {
    xs: '0.25rem', sm: '0.5rem', md: '1rem',
    lg: '1.5rem', xl: '2rem', '2xl': '3rem',
    '3xl': '4.5rem', '4xl': '6rem', '5xl': '8rem',
  },
  radius: {
    sm: '4px', md: '8px', lg: '16px',
    xl: '24px', '2xl': '32px', full: '9999px',
    comic: '2px 16px 4px 12px', // asymmetric comic-panel feel
  },
  shadows: {
    sm: '2px 2px 0px #0D0A0E',
    md: '4px 4px 0px #0D0A0E',
    lg: '6px 6px 0px #0D0A0E',
    xl: '8px 8px 0px #0D0A0E',
    color: '4px 4px 0px #FF6B35',
    purple: '4px 4px 0px #6C63FF',
    gold: '4px 4px 0px #FFD700',
    soft: '0 8px 32px rgba(108, 99, 255, 0.12)',
    glow: '0 0 32px rgba(255, 107, 53, 0.35)',
  },
  transitions: { fast: '120ms ease', normal: '220ms ease', slow: '380ms ease' },
  stroke: '2px',
};

// ─── PANEL ACCENT COLORS ─────────────────────────────────────────────────────
export const panelAccents = [
  { bg: '#FF6B35', shadow: '#C44A1A', text: '#FFFFFF', label: 'PANEL' },
  { bg: '#6C63FF', shadow: '#4A43D4', text: '#FFFFFF', label: 'PANEL' },
  { bg: '#FFD700', shadow: '#B89000', text: '#0D0A0E', label: 'PANEL' },
  { bg: '#10B981', shadow: '#0A7A5C', text: '#FFFFFF', label: 'PANEL' },
  { bg: '#EC4899', shadow: '#B5186E', text: '#FFFFFF', label: 'PANEL' },
  { bg: '#F59E0B', shadow: '#C4760A', text: '#0D0A0E', label: 'PANEL' },
];

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
export const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { scroll-behavior: smooth; }

    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: ${theme.colors.bg.primary};
      color: ${theme.colors.text.primary};
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: ${theme.colors.bg.tertiary}; }
    ::-webkit-scrollbar-thumb {
      background: ${theme.colors.primary};
      border-radius: 0;
      border: 2px solid ${theme.colors.bg.tertiary};
    }

    /* ── Layout ── */
    .container { max-width: 1360px; margin: 0 auto; width: 100%; padding: 0 2rem; }
    .container-sm { max-width: 960px; margin: 0 auto; width: 100%; padding: 0 2rem; }

    /* ── Halftone Texture ── */
    .halftone {
      position: relative;
    }
    .halftone::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: radial-gradient(circle, rgba(255,107,53,0.08) 1.5px, transparent 1.5px);
      background-size: 18px 18px;
      pointer-events: none;
      z-index: 0;
    }
    .halftone > * { position: relative; z-index: 1; }

    /* ── Speed Lines Background ── */
    .speed-lines {
      background-image:
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 2px,
          rgba(255,107,53,0.04) 2px,
          rgba(255,107,53,0.04) 4px
        );
    }

    /* ── Typography ── */
    .font-comic { font-family: ${theme.fonts.display}; }
    .font-heading { font-family: ${theme.fonts.heading}; }
    .font-body { font-family: ${theme.fonts.body}; }
    .font-mono { font-family: ${theme.fonts.mono}; }

    .display-hero {
      font-family: ${theme.fonts.display};
      font-size: clamp(3.5rem, 10vw, 8rem);
      line-height: 0.95;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: ${theme.colors.text.primary};
    }

    .display-xl {
      font-family: ${theme.fonts.display};
      font-size: clamp(2.5rem, 7vw, 5.5rem);
      line-height: 1.0;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }

    .heading-2xl {
      font-family: ${theme.fonts.heading};
      font-size: clamp(1.75rem, 4vw, 3rem);
      font-weight: 700;
      line-height: 1.15;
      letter-spacing: -0.02em;
    }

    .heading-xl {
      font-family: ${theme.fonts.heading};
      font-size: clamp(1.5rem, 3vw, 2.25rem);
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.015em;
    }

    .heading-lg {
      font-family: ${theme.fonts.body};
      font-size: clamp(1.1rem, 2vw, 1.375rem);
      font-weight: 600;
      line-height: 1.35;
    }

    .body-lg { font-size: 1.125rem; line-height: 1.75; font-weight: 400; }
    .body-md { font-size: 1rem; line-height: 1.7; font-weight: 400; }
    .body-sm { font-size: 0.875rem; line-height: 1.6; font-weight: 400; }
    .caption { font-size: 0.75rem; line-height: 1.5; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; }

    /* ── Gradient Text ── */
    .text-gradient-primary {
      background: ${theme.colors.gradient.primary};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .text-gradient-purple {
      background: linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .text-gradient-gold {
      background: ${theme.colors.gradient.gold};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* ── Speech Bubble ── */
    .speech-bubble {
      position: relative;
      background: ${theme.colors.surface.base};
      border: ${theme.stroke} solid ${theme.colors.ink};
      border-radius: 16px 16px 16px 0px;
      padding: 0.75rem 1.25rem;
      box-shadow: ${theme.shadows.md};
      font-family: ${theme.fonts.body};
      font-weight: 600;
    }
    .speech-bubble::before {
      content: '';
      position: absolute;
      bottom: -18px;
      left: 18px;
      border: 9px solid transparent;
      border-top-color: ${theme.colors.ink};
    }
    .speech-bubble::after {
      content: '';
      position: absolute;
      bottom: -14px;
      left: 20px;
      border: 7px solid transparent;
      border-top-color: ${theme.colors.surface.base};
    }

    .thought-bubble {
      position: relative;
      background: ${theme.colors.surface.base};
      border: ${theme.stroke} solid ${theme.colors.ink};
      border-radius: 50% 50% 50% 0;
      padding: 0.875rem 1.5rem;
      font-family: ${theme.fonts.body};
      font-style: italic;
      font-weight: 500;
    }

    /* ── Action Words (POW, ZAP) ── */
    .action-word {
      font-family: ${theme.fonts.display};
      font-size: 2rem;
      letter-spacing: 0.05em;
      color: ${theme.colors.primary};
      text-shadow:
        2px 2px 0 ${theme.colors.ink},
        -2px -2px 0 ${theme.colors.ink},
        2px -2px 0 ${theme.colors.ink},
        -2px 2px 0 ${theme.colors.ink};
      display: inline-block;
      transform: rotate(-5deg);
    }

    /* ── Buttons ── */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-family: ${theme.fonts.body};
      font-weight: 700;
      border: ${theme.stroke} solid ${theme.colors.ink};
      cursor: pointer;
      transition: transform ${theme.transitions.fast}, box-shadow ${theme.transitions.fast};
      text-decoration: none;
      white-space: nowrap;
      user-select: none;
    }
    .btn:hover { transform: translate(-2px, -2px); }
    .btn:active { transform: translate(0px, 0px); box-shadow: none !important; }

    .btn-primary {
      padding: 0.875rem 2.25rem;
      border-radius: ${theme.radius.md};
      font-size: 1rem;
      background: ${theme.colors.primary};
      color: #FFFFFF;
      box-shadow: ${theme.shadows.md};
    }
    .btn-primary:hover { box-shadow: ${theme.shadows.lg}; }

    .btn-secondary {
      padding: 0.875rem 2.25rem;
      border-radius: ${theme.radius.md};
      font-size: 1rem;
      background: ${theme.colors.surface.base};
      color: ${theme.colors.text.primary};
      box-shadow: ${theme.shadows.md};
    }
    .btn-secondary:hover { box-shadow: ${theme.shadows.lg}; }

    .btn-purple {
      padding: 0.875rem 2.25rem;
      border-radius: ${theme.radius.md};
      font-size: 1rem;
      background: ${theme.colors.secondary};
      color: #FFFFFF;
      box-shadow: ${theme.shadows.purple};
    }
    .btn-purple:hover { box-shadow: 6px 6px 0px #4A43D4; }

    .btn-gold {
      padding: 0.875rem 2.25rem;
      border-radius: ${theme.radius.md};
      font-size: 1rem;
      background: ${theme.colors.accent};
      color: ${theme.colors.ink};
      box-shadow: ${theme.shadows.gold};
    }
    .btn-gold:hover { box-shadow: 6px 6px 0px #B89000; }

    .btn-sm {
      padding: 0.5rem 1.25rem;
      border-radius: ${theme.radius.sm};
      font-size: 0.8125rem;
      box-shadow: ${theme.shadows.sm};
    }
    .btn-sm:hover { box-shadow: 3px 3px 0px #0D0A0E; }

    .btn-lg {
      padding: 1.125rem 2.75rem;
      border-radius: ${theme.radius.md};
      font-size: 1.125rem;
      box-shadow: ${theme.shadows.xl};
    }
    .btn-lg:hover { box-shadow: 10px 10px 0px #0D0A0E; }

    .btn-icon {
      padding: 0.625rem;
      border-radius: ${theme.radius.sm};
      width: 40px;
      height: 40px;
      background: ${theme.colors.surface.base};
      box-shadow: ${theme.shadows.sm};
    }

    /* ── Badges ── */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.3125rem 0.875rem;
      border-radius: ${theme.radius.full};
      font-family: ${theme.fonts.body};
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      border: 1.5px solid currentColor;
    }
    .badge-primary { color: ${theme.colors.primary}; background: #FFF0EB; }
    .badge-purple { color: ${theme.colors.secondary}; background: #EEECFF; }
    .badge-gold { color: #9A7200; background: #FFFAE0; }
    .badge-success { color: ${theme.colors.success}; background: #E6FAF4; }
    .badge-ink { color: ${theme.colors.surface.base}; background: ${theme.colors.ink}; border-color: ${theme.colors.ink}; }

    /* ── Comic Panel Cards ── */
    .panel-card {
      background: ${theme.colors.surface.base};
      border: ${theme.stroke} solid ${theme.colors.ink};
      border-radius: ${theme.radius.md};
      overflow: hidden;
      transition: transform ${theme.transitions.normal}, box-shadow ${theme.transitions.normal};
      box-shadow: ${theme.shadows.md};
    }
    .panel-card:hover {
      transform: translate(-3px, -3px);
      box-shadow: ${theme.shadows.xl};
    }

    /* ── Ink Cards (standard content cards) ── */
    .ink-card {
      background: ${theme.colors.surface.base};
      border: 1.5px solid ${theme.colors.border.base};
      border-radius: ${theme.radius.lg};
      padding: 1.5rem;
      transition: transform ${theme.transitions.normal}, box-shadow ${theme.transitions.normal}, border-color ${theme.transitions.normal};
      box-shadow: ${theme.shadows.soft};
    }
    .ink-card:hover {
      transform: translateY(-4px);
      border-color: ${theme.colors.border.warm};
      box-shadow: 0 16px 40px rgba(255, 107, 53, 0.12);
    }

    /* ── Dark Card ── */
    .dark-card {
      background: ${theme.colors.surface.dark};
      border: 1.5px solid rgba(255,255,255,0.08);
      border-radius: ${theme.radius.lg};
      padding: 1.5rem;
      color: ${theme.colors.text.onDark};
    }

    /* ── Dividers ── */
    .divider {
      height: 2px;
      background: ${theme.colors.ink};
      border: none;
    }
    .divider-dashed {
      border: none;
      border-top: 2px dashed ${theme.colors.border.base};
    }

    /* ── Tag/Label Strips ── */
    .label-strip {
      display: inline-block;
      background: ${theme.colors.ink};
      color: ${theme.colors.surface.base};
      font-family: ${theme.fonts.display};
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.25rem 0.75rem;
    }

    /* ── Number Badge (panel number) ── */
    .panel-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      font-family: ${theme.fonts.display};
      font-size: 1.1rem;
      letter-spacing: 0.03em;
      color: #FFFFFF;
      border: 2px solid ${theme.colors.ink};
      border-radius: ${theme.radius.full};
      flex-shrink: 0;
    }

    /* ── Tag Label ── */
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.625rem;
      border-radius: ${theme.radius.sm};
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border: 1px solid ${theme.colors.border.base};
      background: ${theme.colors.bg.tertiary};
      color: ${theme.colors.text.muted};
    }

    /* ── Stat/Credit Pill ── */
    .stat-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: ${theme.radius.full};
      background: ${theme.colors.surface.base};
      border: 2px solid ${theme.colors.ink};
      box-shadow: ${theme.shadows.sm};
      font-weight: 700;
      font-size: 0.875rem;
    }

    /* ── Input ── */
    .input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: ${theme.stroke} solid ${theme.colors.ink};
      border-radius: ${theme.radius.md};
      font-family: ${theme.fonts.body};
      font-size: 1rem;
      font-weight: 400;
      background: ${theme.colors.surface.base};
      color: ${theme.colors.text.primary};
      transition: box-shadow ${theme.transitions.fast};
      outline: none;
      box-shadow: ${theme.shadows.sm};
    }
    .input:focus { box-shadow: ${theme.shadows.color}; }
    .input::placeholder { color: ${theme.colors.text.light}; }

    .textarea {
      width: 100%;
      padding: 0.875rem 1rem;
      border: ${theme.stroke} solid ${theme.colors.ink};
      border-radius: ${theme.radius.md};
      font-family: ${theme.fonts.body};
      font-size: 1rem;
      background: ${theme.colors.surface.base};
      color: ${theme.colors.text.primary};
      resize: vertical;
      min-height: 120px;
      outline: none;
      transition: box-shadow ${theme.transitions.fast};
      box-shadow: ${theme.shadows.sm};
      line-height: 1.6;
    }
    .textarea:focus { box-shadow: ${theme.shadows.color}; }

    /* ── Progress Bar ── */
    .progress-track {
      height: 10px;
      background: ${theme.colors.bg.tertiary};
      border-radius: ${theme.radius.full};
      border: 1.5px solid ${theme.colors.ink};
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: ${theme.colors.primary};
      border-radius: ${theme.radius.full};
      transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ── Loading Spinner (ink dot) ── */
    @keyframes ink-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .ink-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid ${theme.colors.border.base};
      border-top-color: ${theme.colors.primary};
      border-radius: 50%;
      animation: ink-spin 0.8s linear infinite;
    }

    /* ── Shimmer Skeleton ── */
    @keyframes shimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .skeleton {
      background: linear-gradient(90deg, #f0ebff 25%, #e8e0ff 50%, #f0ebff 75%);
      background-size: 800px 100%;
      animation: shimmer 1.4s infinite;
      border-radius: ${theme.radius.md};
    }

    /* ── Empty State ── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      gap: 1rem;
    }

    /* ── Grid Helpers ── */
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
    .grid-auto { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }

    @media (max-width: 768px) {
      .grid-2, .grid-3, .grid-4, .grid-auto { grid-template-columns: 1fr; }
      .container, .container-sm { padding: 0 1rem; }
      .display-hero { font-size: clamp(2.5rem, 12vw, 4rem); }
    }
    @media (max-width: 1024px) {
      .grid-3, .grid-4 { grid-template-columns: repeat(2, 1fr); }
    }

    /* ── Utility ── */
    .flex { display: flex; }
    .flex-col { display: flex; flex-direction: column; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .gap-1 { gap: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-8 { gap: 2rem; }
    .w-full { width: 100%; }
    .text-center { text-align: center; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-3 { margin-top: 0.75rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-6 { margin-top: 1.5rem; }
    .mt-8 { margin-top: 2rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-8 { margin-bottom: 2rem; }
    .p-0 { padding: 0; }
    .overflow-hidden { overflow: hidden; }
    .relative { position: relative; }
    .absolute { position: absolute; }
    .z-0 { z-index: 0; }
    .z-1 { z-index: 1; }
    .z-10 { z-index: 10; }
    .cursor-pointer { cursor: pointer; }
    .select-none { user-select: none; }
    .no-print { }
    @media print { .no-print { display: none !important; } body { background: white; color: black; } }

    /* ── Animations ── */
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pop-in {
      0% { opacity: 0; transform: scale(0.85); }
      70% { transform: scale(1.04); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes slide-in-right {
      from { opacity: 0; transform: translateX(32px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes wiggle {
      0%, 100% { transform: rotate(-3deg); }
      50% { transform: rotate(3deg); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    .anim-fade-up { animation: fade-up 0.5s ease both; }
    .anim-pop-in { animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
    .anim-slide-right { animation: slide-in-right 0.4s ease both; }
    .anim-wiggle { animation: wiggle 1.2s ease-in-out infinite; }
    .anim-float { animation: float 3s ease-in-out infinite; }
    .anim-delay-1 { animation-delay: 0.1s; }
    .anim-delay-2 { animation-delay: 0.2s; }
    .anim-delay-3 { animation-delay: 0.3s; }
    .anim-delay-4 { animation-delay: 0.4s; }
    .anim-delay-5 { animation-delay: 0.5s; }
  `}</style>
);

// ─── COMIC PANEL CARD ─────────────────────────────────────────────────────────
interface ComicCardProps {
  panel: {
    image_url?: string;
    caption?: string;
    scene_description?: string;
  };
  idx: number;
  showCaption?: boolean;
  onClick?: () => void;
}

export function ComicCard({ panel, idx, showCaption = true, onClick }: ComicCardProps) {
  const accent = panelAccents[idx % panelAccents.length];

  return (
    <div
      className="panel-card"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      {/* Panel Image Area */}
      <div style={{ position: 'relative', background: '#F4F0FF', minHeight: 280 }}>
        {panel?.image_url ? (
          <img
            src={panel.image_url}
            alt={`Panel ${idx + 1}`}
            style={{ width: '100%', height: 'auto', display: 'block', verticalAlign: 'middle' }}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 280,
              background: `linear-gradient(160deg, #EDE8FF 0%, #F4EAFF 100%)`,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: accent.bg,
                  border: '2px solid #0D0A0E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.875rem',
                  boxShadow: `3px 3px 0 ${accent.shadow}`,
                }}
              >
                <Sparkles size={28} color={accent.text} />
              </div>
              <p
                className="font-comic caption"
                style={{ color: '#7C7490', letterSpacing: '0.12em', fontSize: '0.7rem' }}
              >
                GENERATING ART...
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 12 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="ink-spinner"
                    style={{
                      width: 8,
                      height: 8,
                      border: `2px solid ${accent.bg}`,
                      borderTopColor: 'transparent',
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Panel Number Badge */}
        <div
          className="panel-number"
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: accent.bg,
            boxShadow: `2px 2px 0 ${accent.shadow}`,
          }}
        >
          {String(idx + 1).padStart(2, '0')}
        </div>
      </div>

      {/* Caption Area */}
      {showCaption && (panel?.caption || panel?.scene_description || (panel as any).action) && (
        <div
          style={{
            padding: '0.875rem 1rem',
            borderTop: '2px solid #0D0A0E',
            background: '#FFFDF7',
          }}
        >
          <p
            className="body-sm font-body"
            style={{ color: theme.colors.text.secondary, lineHeight: 1.55, margin: 0 }}
          >
            {panel.caption || panel.scene_description || (panel as any).action}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── FLIP SPREAD (Single Page Reader View) ────────────────────────────────────
interface FlipSpreadProps {
  panel: {
    image_url?: string;
    caption?: string;
    scene_description?: string;
  };
  pageNum: number;
  totalPages: number;
  storyTitle?: string;
}

export function FlipSpread({ panel, pageNum, totalPages, storyTitle = 'COMIXNOVA AI' }: FlipSpreadProps) {
  const accent = panelAccents[(pageNum - 1) % panelAccents.length];
  const progress = (pageNum / totalPages) * 100;

  return (
    <div className="panel-card" style={{ maxWidth: 560, margin: '0 auto' }}>

      {/* Header Bar */}
      <div
        style={{
          padding: '0.75rem 1rem',
          background: theme.colors.ink,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div className="flex items-center gap-3">
          <BookOpen size={16} color={theme.colors.accent} />
          <span
            className="font-comic"
            style={{ color: theme.colors.accent, fontSize: '0.9rem', letterSpacing: '0.1em' }}
          >
            {storyTitle}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="progress-track" style={{ width: 80 }}>
            <div className="progress-fill" style={{ width: `${progress}%`, background: accent.bg }} />
          </div>
          <span
            className="font-mono caption"
            style={{ color: '#888', fontSize: '0.7rem', whiteSpace: 'nowrap' }}
          >
            {pageNum} / {totalPages}
          </span>
        </div>
      </div>

      {/* Comic Panel */}
      <div style={{ padding: '1rem', background: '#F4F0FF' }}>
        <ComicCard panel={panel} idx={pageNum - 1} showCaption={false} />
      </div>

      {/* Caption Below */}
      {(panel?.caption || panel?.scene_description) && (
        <div
          style={{
            padding: '0.875rem 1.25rem',
            background: theme.colors.bg.primary,
            borderTop: '2px solid #0D0A0E',
          }}
        >
          <div className="speech-bubble" style={{ maxWidth: '90%', margin: '0 auto', textAlign: 'center' }}>
            <p className="body-sm" style={{ margin: 0, color: theme.colors.text.primary, fontWeight: 500 }}>
              {panel.caption || panel.scene_description || (panel as any).action}
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          padding: '0.625rem 1rem',
          textAlign: 'center',
          borderTop: '2px dashed #E0D9FF',
          background: theme.colors.bg.tertiary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Zap size={12} color={accent.bg} />
        <span
          className="font-comic caption"
          style={{ color: theme.colors.text.muted, fontSize: '0.65rem', letterSpacing: '0.12em' }}
        >
          TO BE CONTINUED
        </span>
        <Zap size={12} color={accent.bg} />
      </div>
    </div>
  );
}

// ─── EMPTY STATE COMPONENT ────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && (
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#EDE8FF',
            border: '2px solid #0D0A0E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.5rem',
            boxShadow: theme.shadows.md,
          }}
        >
          {icon}
        </div>
      )}
      <h3 className="heading-lg" style={{ color: theme.colors.text.primary }}>
        {title}
      </h3>
      <p className="body-sm" style={{ color: theme.colors.text.muted, maxWidth: 360, textAlign: 'center' }}>
        {description}
      </p>
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  );
}

// ─── PAGE HEADER COMPONENT ────────────────────────────────────────────────────
interface PageHeaderProps {
  badge?: string;
  title: string;
  titleHighlight?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ badge, title, titleHighlight, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      {badge && (
        <div>
          <span className="badge badge-primary">
            <Crown size={12} />
            {badge}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="display-xl" style={{ color: theme.colors.text.primary }}>
            {title}{' '}
            {titleHighlight && (
              <span className="text-gradient-primary">{titleHighlight}</span>
            )}
          </h1>
          {subtitle && (
            <p className="body-lg mt-2" style={{ color: theme.colors.text.muted, maxWidth: 560 }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}

// ─── CREDIT DISPLAY COMPONENT ─────────────────────────────────────────────────
interface CreditDisplayProps {
  credits: number;
  plan?: string;
  onUpgrade?: () => void;
}

export function CreditDisplay({ credits, plan = 'Free', onUpgrade }: CreditDisplayProps) {
  const isLow = credits <= 5;
  return (
    <div className="stat-pill" style={{ gap: '0.75rem' }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: isLow ? theme.colors.danger : theme.colors.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1.5px solid #0D0A0E',
          flexShrink: 0,
        }}
      >
        <Zap size={13} color={isLow ? '#fff' : '#0D0A0E'} />
      </div>
      <span
        className="font-body"
        style={{ fontWeight: 700, color: isLow ? theme.colors.danger : theme.colors.text.primary }}
      >
        {credits} Credits
      </span>
      <span
        className="badge"
        style={{
          background: plan === 'Free' ? '#F4F0FF' : '#FFFAE0',
          color: plan === 'Free' ? theme.colors.secondary : '#9A7200',
          borderColor: plan === 'Free' ? theme.colors.secondary : '#D4A000',
          fontSize: '0.65rem',
        }}
      >
        {plan}
      </span>
      {onUpgrade && (
        <button className="btn btn-primary btn-sm" onClick={onUpgrade}>
          Upgrade
        </button>
      )}
    </div>
  );
}

// ─── LOADING OVERLAY ──────────────────────────────────────────────────────────
interface LoadingOverlayProps {
  message?: string;
  subMessage?: string;
  progress?: number;
}

export function LoadingOverlay({ message = 'Creating your comic...', subMessage, progress }: LoadingOverlayProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(13, 10, 14, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="panel-card anim-pop-in"
        style={{
          padding: '2.5rem 3rem',
          textAlign: 'center',
          background: theme.colors.surface.base,
          maxWidth: 400,
          width: '90%',
        }}
      >
        <div className="anim-float" style={{ marginBottom: '1.25rem', display: 'inline-block' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: theme.colors.gradient.panel1,
              border: '2px solid #0D0A0E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: theme.shadows.color,
              margin: '0 auto',
            }}
          >
            <Sparkles size={32} color="#fff" />
          </div>
        </div>
        <h3 className="heading-lg" style={{ color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
          {message}
        </h3>
        {subMessage && (
          <p className="body-sm" style={{ color: theme.colors.text.muted, marginBottom: '1.25rem' }}>
            {subMessage}
          </p>
        )}
        {progress !== undefined && (
          <div style={{ marginTop: '1rem' }}>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="caption" style={{ color: theme.colors.text.muted, marginTop: '0.5rem' }}>
              {progress}% complete
            </p>
          </div>
        )}
        {progress === undefined && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: '1rem' }}>
            <div className="ink-spinner" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NOTIFICATION / TOAST ─────────────────────────────────────────────────────
type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  variant?: ToastVariant;
  title: string;
  message?: string;
  onClose?: () => void;
}

const toastConfig: Record<ToastVariant, { bg: string; border: string; icon: string }> = {
  success: { bg: '#E6FAF4', border: theme.colors.success, icon: '✓' },
  error: { bg: '#FEE8E8', border: theme.colors.danger, icon: '✕' },
  warning: { bg: '#FFFAE0', border: theme.colors.warning, icon: '!' },
  info: { bg: '#EDE8FF', border: theme.colors.secondary, icon: 'i' },
};

export function Toast({ variant = 'info', title, message, onClose }: ToastProps) {
  const cfg = toastConfig[variant];
  return (
    <div
      className="anim-slide-right"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '1rem 1.25rem',
        background: cfg.bg,
        border: `2px solid ${cfg.border}`,
        borderRadius: theme.radius.md,
        boxShadow: theme.shadows.md,
        maxWidth: 360,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: cfg.border,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '0.75rem',
          fontWeight: 700,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {cfg.icon}
      </div>
      <div style={{ flex: 1 }}>
        <p className="body-sm" style={{ fontWeight: 700, color: theme.colors.text.primary, marginBottom: message ? 2 : 0 }}>
          {title}
        </p>
        {message && (
          <p className="body-sm" style={{ color: theme.colors.text.muted, margin: 0 }}>
            {message}
          </p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: theme.colors.text.muted,
            fontSize: '1.1rem',
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

// ─── STORY CARD (for History/Gallery) ────────────────────────────────────────
interface StoryCardProps {
  title: string;
  coverUrl?: string;
  pageCount: number;
  genre?: string;
  createdAt?: string;
  onClick?: () => void;
}

export function StoryCard({ title, coverUrl, pageCount, genre, createdAt, onClick }: StoryCardProps) {
  return (
    <div className="panel-card cursor-pointer" style={{ overflow: 'hidden' }} onClick={onClick}>
      {/* Cover Thumbnail */}
      <div style={{ position: 'relative', background: '#EDE8FF', aspectRatio: '4/5', overflow: 'hidden' }}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={40} color={theme.colors.secondary} />
          </div>
        )}
        {genre && (
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            <span className="badge badge-purple" style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem' }}>
              {genre}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '0.875rem 1rem', borderTop: '2px solid #0D0A0E', background: '#FFFDF7' }}>
        <h4 className="heading-lg" style={{ marginBottom: 4, fontSize: '0.9375rem' }}>
          {title}
        </h4>
        <div className="flex items-center justify-between mt-2">
          <span className="tag">
            <BookOpen size={10} />
            {pageCount} pages
          </span>
          {createdAt && (
            <span className="caption" style={{ color: theme.colors.text.light }}>
              {createdAt}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}