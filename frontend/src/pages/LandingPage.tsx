import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Star, CheckCircle2,
  Zap, BarChart3, Globe, Users, Edit3, Smartphone,
  Menu, X, Sparkles, Share2, Layers, PenTool,
  ArrowRight, BookMarked, PlayCircle
} from 'lucide-react';

// ==========================================
// ANIMATION VARIANTS
// ==========================================
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// ==========================================
// COMPONENTS
// ==========================================

export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">

      {/* 1. HEADER / NAVBAR */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled
          ? 'bg-white/80 backdrop-blur-lg border-gray-200 shadow-sm py-3'
          : 'bg-white border-transparent py-5'
          }`}
      >
        <div className="w-full px-6 lg:px-10 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <BookOpen size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              ComixNova
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {['Explore', 'Authors', 'Pricing', 'Enterprise'].map(link => (
              <a key={link} href={`#${link.toLowerCase()}`} className="text-sm font-medium text-slate-600 hover:text-gray-900 transition-colors">
                {link}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={onGetStarted} className="text-sm font-medium text-slate-600 hover:text-gray-900 transition-colors">
              Sign In
            </button>
            <button onClick={onGetStarted} className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Start Publishing
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-white p-6 md:hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <BookOpen size={16} />
                </div>
                <span className="text-lg font-bold">ComixNova</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-600 p-2"><X size={24} /></button>
            </div>
            <div className="flex flex-col gap-6">
              {['Explore', 'Authors', 'Pricing', 'Blog'].map(link => (
                <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="text-2xl font-semibold text-gray-900">
                  {link}
                </a>
              ))}
              <div className="h-px bg-gray-100 my-4" />
              <button onClick={() => { setMobileMenuOpen(false); onGetStarted(); }} className="text-xl font-semibold text-left">Sign In</button>
              <button onClick={() => { setMobileMenuOpen(false); onGetStarted(); }} className="bg-blue-600 text-white px-6 py-4 rounded-xl text-lg font-medium text-center shadow-lg shadow-blue-600/20">
                Start Publishing Free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-52 lg:pb-40 overflow-hidden">
        <div className="w-full px-8 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">

            {/* Hero Content */}
            <motion.div
              initial="hidden" animate="visible" variants={staggerContainer}
              className="w-full"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-gray-200 text-sm font-medium text-slate-600 mb-6">
                <Sparkles size={14} className="text-amber-500" />
                <span>ComixNova 2.0 is now live</span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-6xl lg:text-8xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6">
                Where Great Books Are <br className="hidden lg:block" />
                <span className="text-blue-600">Built & Discovered.</span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-lg lg:text-xl text-slate-500 mb-8 leading-relaxed">
                The all-in-one publishing ecosystem. Write seamlessly, publish globally, and build your audience—all from one beautiful workspace.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                <button onClick={onGetStarted} className="bg-blue-600 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group">
                  Start Publishing
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full text-base font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  <PlayCircle size={18} className="text-slate-400" />
                  See how it works
                </button>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-10 flex items-center gap-4 text-sm text-slate-500">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="User" />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  <span className="font-medium text-gray-900 ml-1">4.9/5</span> from 10k+ authors
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visuals — Stacked Book Covers (Kindle/Goodreads style) */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="relative flex items-center justify-center lg:h-[620px]"
            >
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-amber-50 rounded-[3rem]" />

              {/* Book Stack — 3D perspective grid like Apple Books */}
              <div className="relative z-10 flex items-end justify-center gap-4 px-8 pb-8 pt-12">
                {/* Back book */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, delay: 0.5 }}
                  className="w-[120px] h-[170px] rounded-xl overflow-hidden shadow-2xl shadow-slate-400/30 flex-shrink-0 transform -rotate-6 -mb-4"
                >
                  <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&q=80" alt="Novel" className="w-full h-full object-cover" />
                </motion.div>
                {/* Front center book — largest */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 5, repeat: Infinity, }}
                  className="w-[160px] h-[230px] rounded-xl overflow-hidden shadow-2xl shadow-blue-400/20 flex-shrink-0 relative z-10"
                >
                  <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80" alt="Book" className="w-full h-full object-cover" />
                  {/* Reading badge */}
                  <div className="absolute bottom-3 left-0 right-0 mx-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <BookOpen size={12} className="text-blue-600" />
                      <span className="text-xs font-semibold text-gray-900">Now Reading</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1.5">
                      <div className="bg-blue-600 h-1 rounded-full w-3/5" />
                    </div>
                  </div>
                </motion.div>
                {/* Right book */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 7, repeat: Infinity, delay: 1 }}
                  className="w-[120px] h-[170px] rounded-xl overflow-hidden shadow-2xl shadow-slate-400/30 flex-shrink-0 transform rotate-6 -mb-4"
                >
                  <img src="https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&q=80" alt="Comic" className="w-full h-full object-cover" />
                </motion.div>
              </div>

              {/* Genre tags floating */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.3 }}
                className="absolute top-8 left-8 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3"
              >
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Trending Genres</div>
                <div className="flex gap-2 flex-wrap">
                  {['Fantasy', 'Sci-Fi', 'Romance'].map(g => (
                    <span key={g} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">{g}</span>
                  ))}
                </div>
              </motion.div>

              {/* Reader count badge */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 0.8 }}
                className="absolute bottom-10 right-6 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-3"
              >
                <div className="flex -space-x-1.5">
                  {[20, 21, 22].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/40?img=${i}`} className="w-7 h-7 rounded-full border-2 border-white" alt="Reader" />
                  ))}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">842 readers</div>
                  <div className="text-xs text-slate-400">reading right now</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. TRUST SECTION */}
      <section className="py-10 border-y border-gray-100 bg-slate-50">
        <div className="px-0 w-full text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">
            Trusted by modern creators at top companies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['Acme Corp', 'GlobalText', 'Pioneer Books', 'NovaMedia', 'Apex Publishing'].map(logo => (
              <span key={logo} className="text-xl md:text-2xl font-bold text-slate-800 font-serif italic">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURE SHOWCASE */}
      <section id="features" className="py-28 lg:py-36 bg-white relative">
        <div className="w-full px-8 lg:px-12">
          <div className="text-center  mx-auto mb-16">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
              Everything you need to build <br /> a publishing empire.
            </h2>
            <p className="text-lg text-slate-500">
              We’ve stripped away the complexity of traditional publishing and replaced it with elegant, powerful tools designed for the modern internet.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { icon: Edit3, title: 'Distraction-free Editor', desc: 'A beautiful writing environment that gets out of your way. Markdown support, auto-save, and focus mode.' },
              { icon: Layers, title: 'Version Control', desc: 'Never lose a draft. Track changes, restore previous versions, and collaborate seamlessly like software engineers.' },
              { icon: Globe, title: 'Global Distribution', desc: 'Publish with one click. Your work is instantly formatted and distributed to readers worldwide in seconds.' },
              { icon: BarChart3, title: 'Real-time Analytics', desc: 'Know exactly how your books are performing. Track reads, completion rates, and revenue in real-time.' },
              { icon: Zap, title: 'AI Copilot', desc: 'Overcome writer\'s block. Generate ideas, summarize chapters, and refine your prose with our built-in AI.' },
              { icon: CheckCircle2, title: 'Bank-grade Security', desc: 'Your intellectual property is protected with enterprise-grade encryption and automated cloud backups.' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-slate-50 rounded-2xl p-8 border border-gray-100 hover:border-blue-100 hover:bg-blue-50/50 transition-all group"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon size={24} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="py-28 lg:py-36 bg-gray-900 text-white relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full px-8 lg:px-12 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">The smoothest path to publishing</h2>
            <p className="text-slate-400 text-lg">Go from blank page to published author in three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 lg:gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

            {[
              { step: '01', title: 'Write & Format', desc: 'Draft your story in our intuitive editor. We automatically format it to industry standards.', icon: PenTool },
              { step: '02', title: 'Publish to Hub', desc: 'Set your price, add metadata, and click publish. Your book goes live instantly on our marketplace.', icon: Globe },
              { step: '03', title: 'Earn Royalties', desc: 'Readers discover your book. You keep 90% of revenue, paid out daily via Stripe.', icon: BarChart3 }
            ].map((item, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gray-800 rounded-full border-8 border-gray-900 flex items-center justify-center mb-6 shadow-xl relative group">
                  <div className="absolute inset-0 bg-blue-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-lg" />
                  <item.icon size={32} className="text-blue-400" />
                  <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center border-2 border-gray-900">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. AUTHOR EXPERIENCE — Writing & Publishing focus */}
      <section className="py-28 lg:py-36 bg-white overflow-hidden">
        <div className="w-full px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-sm font-semibold text-blue-700 mb-6">
                <Edit3 size={14} /> For Authors
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                Write, publish, and grow your readership.
              </h2>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                Everything a modern author needs — a beautiful editor, one-click publishing, and a built-in audience of passionate readers who are waiting for your next story.
              </p>

              <ul className="space-y-6">
                {[
                  { title: 'Distraction-free writing', desc: 'A clean, focused editor that feels like your favorite notebook. Write in flow state.' },
                  { title: 'One-click to global readers', desc: 'Publish your book and it instantly appears in our global reader marketplace.' },
                  { title: 'Build your author profile', desc: 'Your public profile page showcases your works, bio, and lets readers follow you.' }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="mt-1 bg-blue-50 text-blue-600 rounded-full p-1.5 h-fit">
                      <CheckCircle2 size={16} strokeWidth={3} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.title}</h4>
                      <p className="text-slate-500 text-sm mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <button onClick={onGetStarted} className="mt-10 bg-blue-600 text-white px-7 py-3.5 rounded-full font-semibold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 w-fit">
                Start Writing Free <ArrowRight size={18} />
              </button>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-50 to-slate-50 rounded-3xl transform rotate-2" />
              {/* Open book / reading scene */}
              <img
                src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000"
                alt="Author Writing"
                className="relative rounded-2xl shadow-2xl border border-gray-100 object-cover h-[500px] w-full"
              />
              {/* Floating reading card */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, }}
                className="absolute -left-6 bottom-12 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 w-52"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=80&q=80" alt="cover" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 leading-tight">The Last Chapter</div>
                    <div className="text-xs text-slate-400">by A. Rahman</div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className="fill-amber-500 text-amber-500" />)}
                </div>
                <div className="text-xs text-slate-500">"A masterpiece of modern fiction."</div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. READER EXPERIENCE — Visual reading showcase */}
      <section className="py-28 lg:py-36 bg-gray-950 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.15),_transparent_60%)]" />
        <div className="w-full px-8 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Reading UI mockup */}
            <div className="relative order-2 lg:order-1">
              <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
                {/* Reader top bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                  <span className="text-sm text-gray-400">Chapter 7 · The Hidden Valley</span>
                  <div className="flex items-center gap-3">
                    <BookMarked size={16} className="text-blue-400" />
                    <Smartphone size={16} className="text-gray-500" />
                  </div>
                </div>
                {/* Reader content */}
                <div className="p-8">
                  <div className="text-2xl font-bold text-white mb-4">The Hidden Valley</div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-700 rounded-full" />
                    <div className="h-3 bg-gray-700 rounded-full w-11/12" />
                    <div className="h-3 bg-gray-700 rounded-full w-4/5" />
                    {/* Highlighted sentence */}
                    <div className="bg-amber-500/20 border-l-2 border-amber-400 pl-3 py-2 rounded-r-lg">
                      <div className="h-3 bg-amber-400/40 rounded-full" />
                    </div>
                    <div className="h-3 bg-gray-700 rounded-full" />
                    <div className="h-3 bg-gray-700 rounded-full w-10/12" />
                    <div className="h-3 bg-gray-700 rounded-full w-3/4" />
                    <div className="h-3 bg-gray-700 rounded-full" />
                    <div className="h-3 bg-gray-700 rounded-full w-5/6" />
                  </div>
                </div>
                {/* Progress bar */}
                <div className="px-8 pb-6">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Page 142 of 380</span><span>37% complete</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full w-[37%]" />
                  </div>
                </div>
              </div>

              {/* Floating highlight note */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, }}
                className="absolute -right-4 top-16 bg-amber-50 border border-amber-200 rounded-2xl shadow-lg px-4 py-3 w-48"
              >
                <div className="text-xs font-bold text-amber-800 mb-1">📌 Your Highlight</div>
                <div className="text-xs text-amber-700 italic">"The mountains kept their secrets..."</div>
              </motion.div>
            </div>

            {/* Text side */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/40 border border-blue-700/40 text-sm font-semibold text-blue-300 mb-6">
                <BookOpen size={14} /> For Readers
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                Read anywhere. <br /><span className="text-blue-400">Lose yourself</span> in every page.
              </h2>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Our reader is built for people who truly love books. Highlight passages, leave notes, bookmark chapters, and sync your progress across every device — all for free.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '🌙', label: 'Night Mode', desc: 'Easy on the eyes' },
                  { icon: '📝', label: 'Highlights', desc: 'Mark your favorites' },
                  { icon: '🔖', label: 'Bookmarks', desc: 'Never lose your place' },
                  { icon: '📱', label: 'Cross-device', desc: 'Any screen, anytime' },
                ].map(f => (
                  <div key={f.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="text-2xl mb-2">{f.icon}</div>
                    <div className="font-semibold text-white text-sm">{f.label}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. MARKETPLACE PREVIEW */}
      <section id="explore" className="py-28 lg:py-36 bg-white relative overflow-hidden">
        <div className="w-full px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Discover your next obsession.</h2>
              <p className="text-lg text-slate-500 ">Explore thousands of premium stories, comics, and graphic novels published daily by independent creators.</p>
            </div>
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-3 rounded-full font-semibold transition-colors flex items-center gap-2 w-fit">
              Browse the Hub <ArrowRight size={16} />
            </button>
          </div>

          {/* Categories */}
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
            {['All', 'Fantasy', 'Sci-Fi', 'Romance', 'Thriller', 'Manga', 'Non-Fiction'].map((cat, i) => (
              <button key={cat} className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${i === 0 ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-slate-600 border-gray-200 hover:border-gray-900 hover:text-gray-900'}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Trending Books Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mt-8">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-300">
                  <img src={`https://picsum.photos/seed/${i + 100}/400/600`} alt="Book Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="font-bold text-gray-900 truncate">The Echoes of Time</h4>
                <p className="text-sm text-slate-500 truncate mb-2">By Sarah Jenkins</p>
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                  <Star size={12} className="fill-current" /> 4.9 <span className="text-slate-400 font-normal">(1.2k)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. SOCIAL PROOF */}
      <section className="py-28 lg:py-36 bg-white">
        <div className="w-full px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Loved by authors globally.</h2>
            <p className="text-lg text-slate-500">Don't just take our word for it.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { name: 'Sarah Jenkins', role: 'Bestselling Sci-Fi Author', text: 'ComixNova completely changed my workflow. The dashboard is intuitive, and the payouts are instant. I moved my entire catalog here.' },
              { name: 'Marcus Chen', role: 'Comic Creator', text: 'The visual quality of the reader is unmatched. My illustrations look crisp, and my readers love the dark mode experience.' },
              { name: 'Elena Rodriguez', role: 'Independent Publisher', text: 'Finally, a platform that respects creators. The analytics give me the exact data I need to plan my next marketing push.' }
            ].map((t, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl p-8 border border-gray-100">
                <div className="flex gap-1 mb-4 text-amber-500">
                  <Star size={18} className="fill-current" /><Star size={18} className="fill-current" /><Star size={18} className="fill-current" /><Star size={18} className="fill-current" /><Star size={18} className="fill-current" />
                </div>
                <p className="text-gray-900 mb-6 font-medium leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <img src={`https://i.pravatar.cc/150?img=${idx + 30}`} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{t.name}</h4>
                    <span className="text-slate-500 text-xs">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. PRICING */}
      <section id="pricing" className="py-28 lg:py-36 bg-slate-50 border-t border-gray-100">
        <div className="w-full px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Simple, transparent pricing.</h2>
            <p className="text-lg text-slate-500">Start for free, upgrade when you need more power.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 ">
            {/* Free */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hobby</h3>
              <p className="text-slate-500 text-sm mb-6">Perfect for testing the waters.</p>
              <div className="mb-6"><span className="text-4xl font-extrabold text-gray-900">$0</span><span className="text-slate-500">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-gray-600"><CheckCircle2 size={18} className="text-emerald-500" /> Up to 3 published books</li>
                <li className="flex items-center gap-3 text-sm text-gray-600"><CheckCircle2 size={18} className="text-emerald-500" /> Standard reader UI</li>
                <li className="flex items-center gap-3 text-sm text-gray-600"><CheckCircle2 size={18} className="text-emerald-500" /> Basic analytics</li>
                <li className="flex items-center gap-3 text-sm text-gray-600"><CheckCircle2 size={18} className="text-emerald-500" /> 80% Royalty Share</li>
              </ul>
              <button className="w-full py-3 rounded-xl border border-gray-200 text-gray-900 font-semibold hover:bg-slate-50 transition-colors">Start Free</button>
            </div>

            {/* Pro */}
            <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-2xl flex flex-col relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase">Most Popular</div>
              <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
              <p className="text-gray-400 text-sm mb-6">For serious authors and creators.</p>
              <div className="mb-6"><span className="text-4xl font-extrabold text-white">$19</span><span className="text-gray-400">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 size={18} className="text-blue-500" /> Unlimited books</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 size={18} className="text-blue-500" /> Advanced real-time analytics</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 size={18} className="text-blue-500" /> AI writing tools included</li>
                <li className="flex items-center gap-3 text-sm text-white font-medium"><CheckCircle2 size={18} className="text-blue-500" /> 90% Royalty Share</li>
              </ul>
              <button className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Get Pro</button>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Publisher</h3>
              <p className="text-slate-500 text-sm mb-6">For studios and publishing houses.</p>
              <div className="mb-6"><span className="text-4xl font-extrabold text-gray-900">$99</span><span className="text-slate-500">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-gray-600"><CheckCircle2 size={18} className="text-emerald-500" /> Everything in Pro</li>
                <li className="flex items-center gap-3 text-sm text-gray-600"><CheckCircle2 size={18} className="text-emerald-500" /> Multi-user team access</li>
                <li className="flex items-center gap-3 text-sm text-gray-600"><CheckCircle2 size={18} className="text-emerald-500" /> API access</li>
                <li className="flex items-center gap-3 text-sm text-gray-600"><CheckCircle2 size={18} className="text-emerald-500" /> Custom domain storefront</li>
              </ul>
              <button className="w-full py-3 rounded-xl border border-gray-200 text-gray-900 font-semibold hover:bg-slate-50 transition-colors">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FINAL CTA */}
      <section className="py-32 relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-blue-600/5" />
        <div className=" px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-8 tracking-tight">
            Your Story Deserves <br className="hidden md:block" /> the World.
          </h2>
          <p className="text-xl text-slate-500 mb-10 ">
            Join thousands of authors who are building their legacy on the most advanced publishing platform ever created.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onGetStarted} className="bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-all shadow-xl hover:-translate-y-1">
              Start Publishing Free
            </button>
            <button className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full text-lg font-medium hover:bg-slate-50 transition-all">
              Explore the Hub
            </button>
          </div>
        </div>
      </section>

      {/* 13. FOOTER */}
      <footer className="bg-gray-900 text-slate-400 py-16 border-t border-gray-800">
        <div className="w-full px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <BookOpen size={16} />
                </div>
                <span className="text-xl font-bold text-white">ComixNova</span>
              </div>
              <p className="text-sm mb-6 ">
                The world's most elegant platform for writing, publishing, and discovering great stories.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Share2 size={20} /></a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Globe size={20} /></a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Users size={20} /></a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Author Hub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Reader App</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>© 2026 ComixNova Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <span>Made with ❤️ for creators</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}








