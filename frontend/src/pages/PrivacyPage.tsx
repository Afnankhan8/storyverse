import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import AppShell from '../components/AppShell';

interface Props { user?: any; onLogout?: () => void; }

const sections = [
  { title: 'Information We Collect', content: 'We collect information you provide (name, email, profile data), content you create and publish, usage data (pages visited, features used), and technical data (IP address, browser type, device info).' },
  { title: 'How We Use Your Information', content: 'We use your data to: operate and improve Storyverse, process payments and send payouts, personalize your reading recommendations, send transactional and product emails, and comply with legal obligations.' },
  { title: 'Data Sharing', content: 'We never sell your personal data. We share data only with: Stripe (payments), Firebase (authentication/storage), and analytics partners — all under strict data processing agreements. Your email is never shared with third parties for marketing.' },
  { title: 'Cookies', content: 'We use essential cookies for authentication and session management, and optional analytics cookies to understand how users interact with our platform. You can disable non-essential cookies in your browser settings.' },
  { title: 'Data Security', content: 'All data is encrypted in transit (TLS 1.3) and at rest. We use Firebase and Google Cloud infrastructure with enterprise-grade security. We perform regular security audits and penetration testing.' },
  { title: 'Your Rights', content: 'You have the right to: access your data, correct inaccuracies, request deletion, export your content, and opt out of marketing emails. Submit requests to privacy@storyverse.io and we respond within 30 days.' },
  { title: 'Data Retention', content: 'We retain your account data while your account is active. If you delete your account, we remove personal data within 30 days. Published content may be retained in anonymized form for platform integrity.' },
  { title: 'Children\'s Privacy', content: 'Storyverse is not directed to children under 13. We do not knowingly collect data from children. If you believe a child has created an account, contact us immediately at privacy@storyverse.io.' },
  { title: 'Changes to This Policy', content: 'We may update this Privacy Policy periodically. We will notify you via email and in-app notification of significant changes at least 30 days before they take effect.' },
  { title: 'Contact Us', content: 'Privacy Officer: Storyverse Inc., 123 Publishing Lane, San Francisco, CA 94105. Email: privacy@storyverse.io. We aim to respond to all privacy inquiries within 48 hours.' },
];

export default function PrivacyPage({ user, onLogout }: Props) {
  return (
    <AppShell user={user} onLogout={onLogout}>
      <div className="min-h-screen bg-slate-50">
        <div className="w-full px-6 lg:px-10 py-12 max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-gray-900 transition-colors mb-8 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Legal</span>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-slate-500 mb-10">Last updated: April 17, 2026 · GDPR & CCPA compliant</p>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-10 text-sm text-emerald-800">
              <strong>Summary:</strong> We collect only what's needed to run the platform. We never sell your data. You can delete everything at any time.
            </div>
            <div className="space-y-6">
              {sections.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">{s.title}</h2>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <p className="text-sm text-slate-400">Privacy questions? <a href="mailto:privacy@storyverse.io" className="text-blue-600 font-medium hover:underline">privacy@storyverse.io</a></p>
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
