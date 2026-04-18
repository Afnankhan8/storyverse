import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, ChevronDown, BookOpen, PenTool, CreditCard, Shield,
  Users, Zap, MessageCircle, ArrowRight, Mail, HelpCircle
} from 'lucide-react';
import AppShell from '../components/AppShell';

interface Props { user?: any; onLogout?: () => void; }

const CATEGORIES = [
  {
    icon: PenTool, label: 'Getting Started', color: 'bg-blue-50 text-blue-600',
    articles: ['How to create your first book', 'Setting up your author profile', 'Understanding the dashboard', 'Choosing the right content format']
  },
  {
    icon: BookOpen, label: 'Publishing', color: 'bg-violet-50 text-violet-600',
    articles: ['How to publish a book', 'Setting book prices', 'Adding cover art and metadata', 'Publishing to the marketplace']
  },
  {
    icon: CreditCard, label: 'Billing & Payments', color: 'bg-emerald-50 text-emerald-600',
    articles: ['How royalties are calculated', 'Payout schedule and methods', 'Upgrading to Pro', 'Understanding subscriptions']
  },
  {
    icon: Shield, label: 'Account & Security', color: 'bg-amber-50 text-amber-600',
    articles: ['Changing your password', 'Two-factor authentication', 'Deleting your account', 'Privacy settings']
  },
  {
    icon: Users, label: 'Community', color: 'bg-rose-50 text-rose-600',
    articles: ['Following authors', 'Leaving reviews', 'Reporting content', 'Community guidelines']
  },
  {
    icon: Zap, label: 'Creator Studio', color: 'bg-indigo-50 text-indigo-600',
    articles: ['Using the rich text editor', 'Chapter management', 'AI writing tools', 'Analytics & insights']
  },
];

const FAQS = [
  { q: 'How do I start publishing on Storyverse?', a: 'Sign up for a free account, go to Creator Studio, click "New Book", fill in your book details, and start writing. Publishing is completely free and you can go live in minutes.' },
  { q: 'What percentage of revenue do I keep?', a: 'You keep 90% of every sale. Storyverse takes a 10% platform fee to cover payment processing and infrastructure costs. There are no hidden fees.' },
  { q: 'Can I publish for free?', a: 'Yes! Publishing is always free. You can publish unlimited books at no cost. Pro plans unlock advanced features like AI tools and detailed analytics.' },
  { q: 'How do readers pay for my book?', a: 'Payments are processed securely via Stripe. Readers can pay with any major credit card, debit card, or Google Pay. Payouts are sent to your bank account weekly.' },
  { q: 'Can I set my book to free?', a: 'Absolutely. You can publish any book as free, set a price, or offer a "preview then pay" model where the first few chapters are free.' },
  { q: 'How do I get my book discovered?', a: 'Complete your book metadata (genre, tags, description), keep publishing consistently, engage with your readers through comments, and your books will be surfaced in trending and recommendations.' },
  { q: 'Can I collaborate with other authors?', a: 'Yes! Pro plan users can invite co-authors to their book projects. All contributors can edit in real-time, similar to Google Docs.' },
  { q: 'Is my content protected from piracy?', a: 'All books on Storyverse are protected with DRM by default. We actively monitor for unauthorized redistribution and take immediate action on reports.' },
];

export default function HelpCenterPage({ user, onLogout }: Props) {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredFaqs = FAQS.filter(f =>
    !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell user={user} onLogout={onLogout}>
      <div className="min-h-screen bg-slate-50">

        {/* Hero */}
        <div className="bg-white border-b border-gray-100">
          <div className="w-full px-6 lg:px-10 py-14 lg:py-20 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
                <HelpCircle size={12} /> Help Center
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
                How can we help you?
              </h1>
              <p className="text-slate-500 text-lg mb-8 max-w-xl mx-auto">
                Find answers to common questions, guides, and everything you need to succeed on Storyverse.
              </p>
              {/* Search */}
              <div className="max-w-lg mx-auto relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search for answers..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>
            </motion.div>
          </div>
        </div>

        <div className="w-full px-6 lg:px-10 py-12">

          {/* Categories Grid */}
          {!search && (
            <div className="mb-14">
              <h2 className="text-xl font-extrabold text-gray-900 mb-6">Browse by topic</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {CATEGORIES.map((cat, i) => (
                  <motion.div
                    key={cat.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
                  >
                    <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <cat.icon size={22} />
                    </div>
                    <div className="text-sm font-bold text-gray-900 leading-tight">{cat.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{cat.articles.length} articles</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* All Category Articles */}
          {!search && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
              {CATEGORIES.map((cat, i) => (
                <motion.div key={cat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className={`flex items-center gap-3 px-5 py-4 border-b border-gray-50`}>
                    <div className={`w-8 h-8 ${cat.color} rounded-lg flex items-center justify-center`}>
                      <cat.icon size={16} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm">{cat.label}</h3>
                  </div>
                  <div className="p-2">
                    {cat.articles.map(article => (
                      <button key={article}
                        className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                        <span className="text-sm text-slate-600 group-hover:text-blue-600 transition-colors">{article}</span>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6">
              {search ? `Results for "${search}"` : 'Frequently Asked Questions'}
            </h2>

            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle size={40} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No results found. Try a different search term.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                      <ChevronDown
                        size={18}
                        className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-5 text-sm text-slate-500 leading-relaxed border-t border-gray-50 pt-3">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Contact CTA */}
          <div className="max-w-3xl mx-auto mt-12">
            <div className="bg-gray-900 rounded-3xl p-8 relative overflow-hidden text-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.2),_transparent_70%)]" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={22} className="text-blue-300" />
                </div>
                <h3 className="text-white font-extrabold text-xl mb-2">Still need help?</h3>
                <p className="text-gray-400 text-sm mb-6">Our support team is here for you. Average response time: 2 hours.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="mailto:support@storyverse.io"
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                    <Mail size={16} /> Email Support
                  </a>
                  <Link to="/hub"
                    className="flex items-center justify-center gap-2 bg-white/10 text-white border border-white/10 px-6 py-3 rounded-full text-sm font-semibold hover:bg-white/20 transition-all">
                    <Users size={16} /> Community Forum
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
