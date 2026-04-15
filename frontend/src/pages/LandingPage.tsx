import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Sparkles, Zap, BookOpen, Image, ArrowRight, Star, Users, Clock, 
  Wand2, Palette, Shield, Play, CheckCircle, Diamond, Heart, Rocket
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

// Typewriter Effect Component
const TypewriterText = ({ texts }: { texts: string[] }) => {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const target = texts[idx];
    let t: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < target.length) {
      t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === target.length) {
      t = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
    } else {
      setDeleting(false);
      setIdx((p) => (p + 1) % texts.length);
    }
    return () => clearTimeout(t);
  }, [displayed, deleting, idx, texts]);

  return (
    <span className="inline-block">
      {displayed}
      <span className="type-cursor" />
    </span>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ target, suffix = '+' }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 2000;
          const increment = target / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );
    const element = document.getElementById(`counter-${target}`);
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <span id={`counter-${target}`}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  const features = [
    { icon: Wand2, title: 'AI Storytelling', desc: 'Gemini AI crafts rich narratives tailored to your prompt', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    { icon: Palette, title: 'DALL·E Artwork', desc: 'Stunning illustrated panels with consistent art style', color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
    { icon: BookOpen, title: 'Flipbook Viewer', desc: 'Immersive page-turn experience like a real comic book', color: '#06B6D4', bg: 'rgba(6,182,212,0.1)' },
    { icon: Zap, title: 'Lightning Fast', desc: 'Full comic generation in under 30 seconds', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { icon: Shield, title: 'Your Library', desc: 'Every comic saved securely in your personal collection', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    { icon: Sparkles, title: 'Premium Quality', desc: 'High-res artwork with professional comic aesthetics', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)' },
  ];

  const steps = [
    { num: '01', icon: Wand2, title: 'Write Your Prompt', desc: 'Describe characters, setting, and plot in your own words', color: '#8B5CF6' },
    { num: '02', icon: Sparkles, title: 'AI Works Magic', desc: 'Our AI writes script, creates dialogue, and generates art', color: '#EC4899' },
    { num: '03', icon: BookOpen, title: 'Enjoy Your Comic', desc: 'Read your comic in our beautiful flipbook viewer', color: '#06B6D4' },
  ];

  const testimonials = [
    { name: 'Sarah Johnson', role: "Children's Author", text: 'comixnova helped me create illustrations for my book in minutes!', avatar: 'S', rating: 5 },
    { name: 'Mike Chen', role: 'Graphic Designer', text: 'The quality of AI-generated art is absolutely stunning.', avatar: 'M', rating: 5 },
    { name: 'Watson', role: 'Teacher', text: 'My students love creating their own comics with this tool!', avatar: 'E', rating: 5 },
  ];

  const pricing = [
    { name: 'Free', price: '$0', features: ['3 comics per month', '8 panels per comic', 'Basic support'], popular: false, color: '#8B5CF6' },
    { name: 'Pro', price: '$9', features: ['Unlimited comics', '16 panels per comic', 'Priority support', 'HD export'], popular: true, color: '#EC4899' },
    { name: 'Studio', price: '$29', features: ['Everything in Pro', 'Commercial license', 'API access', 'Team collaboration'], popular: false, color: '#06B6D4' },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-[#07070D] via-[#0F0F1A] to-[#07070D] overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#06B6D4] z-50" style={{ scaleX: progressScaleX }} />

      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#8B5CF6] rounded-full filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#EC4899] rounded-full filter blur-3xl opacity-10 animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#06B6D4] rounded-full filter blur-3xl opacity-5 animate-pulse delay-2000" />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="fixed top-0 left-0 right-0 z-40 px-6 py-4 backdrop-blur-xl bg-black/50 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#06B6D4] bg-300% bg-clip-text text-transparent animate-gradient">
              comixnova
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Testimonials', 'Pricing'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
                whileHover={{ scale: 1.05 }}
                className="text-gray-400 hover:text-white transition text-sm font-medium"
              >
                {item}
              </motion.a>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-semibold text-sm flex items-center gap-2"
          >
            Get Started <ArrowRight size={16} />
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6"
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-[#8B5CF6]/20 to-[#EC4899]/20 border border-[#8B5CF6]/30 mb-8"
          >
            <Sparkles size={16} className="text-[#8B5CF6]" />
            <span className="text-sm font-medium text-gray-300">Powered by Gemini AI + DALL·E 3</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            Turn Your Story Into
            <span className="block bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#06B6D4] bg-300% bg-clip-text text-transparent animate-gradient">
              A Stunning Comic
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Type any story prompt and watch AI generate a full illustrated comic — 
            panels, dialogue, and stunning artwork — in under 30 seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(139,92,246,0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-semibold text-lg flex items-center justify-center gap-2"
            >
              Start Creating Free <ArrowRight size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-lg flex items-center justify-center gap-2 hover:bg-white/5 transition"
            >
              <Play size={20} /> Watch Demo
            </motion.button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-500 text-sm"
          >
            ✦ Free to start · No credit card required · Cancel anytime ✦
          </motion.p>

          {/* Comic Preview Panels with Typewriter effect in action */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16"
          >
            <div className="text-center mb-8">
              <p className="text-gray-400 text-sm">Example comics created by our AI:</p>
              <div className="text-2xl font-bold gradient-text mt-2">
                <TypewriterText texts={['Hero Rising', 'Epic Battle', 'Magic Quest', 'Space Adventure']} />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { emoji: '🦸', title: 'Hero Rising', color: 'from-purple-900 to-purple-700', delay: 0 },
                { emoji: '⚔️', title: 'Epic Battle', color: 'from-red-900 to-red-700', delay: 0.1 },
                { emoji: '🌟', title: 'Magic Reveal', color: 'from-blue-900 to-blue-700', delay: 0.2 },
                { emoji: '🏆', title: 'Victory', color: 'from-green-900 to-green-700', delay: 0.3 },
              ].map((panel, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  whileHover={{ y: -8, scale: 1.05 }}
                  className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${panel.color} p-6 cursor-pointer group`}
                >
                  <div className="text-5xl mb-3">{panel.emoji}</div>
                  <p className="text-white font-semibold text-sm">{panel.title}</p>
                  <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <ArrowRight size={14} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Star, value: 10000, label: 'Comics Created', suffix: '+' },
              { icon: Users, value: 5000, label: 'Happy Creators', suffix: '+' },
              { icon: Clock, value: 30, label: 'Avg Generation', suffix: 's' },
              { icon: Image, value: 4, label: 'Panel Quality', suffix: 'K' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="text-center p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <stat.icon className="w-8 h-8 text-[#8B5CF6] mx-auto mb-3" />
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-gray-500 text-sm mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 mb-4">
              <Sparkles size={14} className="text-[#8B5CF6]" />
              <span className="text-sm font-medium">Premium Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#06B6D4] bg-300% bg-clip-text text-transparent animate-gradient">
                Create Magic
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Professional tools wrapped in a delightfully simple experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#8B5CF6]/50 transition-all duration-300 group"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition"
                  style={{ background: feature.bg }}
                >
                  <feature.icon size={28} style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-transparent to-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EC4899]/10 border border-[#EC4899]/20 mb-4">
              <Rocket size={14} className="text-[#EC4899]" />
              <span className="text-sm font-medium">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Create Comics in{' '}
              <span className="bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#06B6D4] bg-300% bg-clip-text text-transparent animate-gradient">
                3 Easy Steps
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              No drawing skills needed. Just your imagination and a few clicks.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="relative text-center"
              >
                <div className="text-6xl font-bold text-white/5 mb-4">{step.num}</div>
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${step.color}20`, border: `1px solid ${step.color}40` }}
                >
                  <step.icon size={32} style={{ color: step.color }} />
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/3 -right-6 text-white/20">
                    <ArrowRight size={24} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/20 mb-4">
              <Heart size={14} className="text-[#06B6D4]" />
              <span className="text-sm font-medium">Loved by Creators</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What{' '}
              <span className="bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#06B6D4] bg-300% bg-clip-text text-transparent animate-gradient">
                Creators Say
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-transparent to-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 mb-4">
              <Diamond size={14} className="text-[#10B981]" />
              <span className="text-sm font-medium">Simple Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your{' '}
              <span className="bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#06B6D4] bg-300% bg-clip-text text-transparent animate-gradient">
                Plan
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Start free, upgrade when you need more power
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className={`relative p-8 rounded-2xl bg-white/5 border transition-all duration-300 ${
                  plan.popular
                    ? 'border-[#EC4899] shadow-lg shadow-[#EC4899]/10'
                    : 'border-white/10 hover:border-[#8B5CF6]/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== '$0' && <span className="text-gray-500">/month</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle size={16} className="text-[#10B981]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onGetStarted}
                  className={`w-full py-3 rounded-full font-semibold transition ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white'
                      : 'border border-white/20 text-white hover:bg-white/5'
                  }`}
                >
                  Get Started
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-[#8B5CF6]/10 to-[#EC4899]/10 border border-white/10"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex items-center justify-center mx-auto mb-6">
            <Sparkles size={32} className="text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to Create Your{' '}
            <span className="bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#06B6D4] bg-300% bg-clip-text text-transparent animate-gradient">
              Masterpiece
            </span>?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of creators already using comixnova to bring their stories to life
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(139,92,246,0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-semibold text-lg inline-flex items-center gap-2"
          >
            Start Creating Now <ArrowRight size={20} />
          </motion.button>
          <p className="text-gray-500 text-sm mt-4">Free credits included · No card required</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
                  comixnova
                </span>
              </div>
              <p className="text-gray-500 text-sm">Create stunning AI-powered comics in seconds</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-white transition">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-gray-500 text-sm">© 2025 comixnova. All rights reserved. Built with ❤️ for storytellers</p>
          </div>
        </div>
      </footer>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }
        .bg-300\\% {
          background-size: 300% 300%;
        }
        .type-cursor {
          display: inline-block;
          width: 2px;
          height: 1.2em;
          background: linear-gradient(to bottom, #8B5CF6, #EC4899);
          margin-left: 4px;
          animation: blink 1s step-end infinite;
          vertical-align: middle;
          border-radius: 2px;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}