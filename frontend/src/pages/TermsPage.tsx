import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';
import AppShell from '../components/AppShell';

interface Props { user?: any; onLogout?: () => void; }

const sections = [
  { title: '1. Acceptance of Terms', content: 'By accessing or using Storyverse, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform. We reserve the right to update these terms at any time with notice.' },
  { title: '2. User Accounts', content: 'You must be at least 13 years old to use Storyverse. You are responsible for maintaining the security of your account and all activity under it. Provide accurate information and keep it updated.' },
  { title: '3. Content & Publishing', content: 'You retain full ownership of all content you publish on Storyverse. By publishing, you grant us a non-exclusive license to display and distribute your content on our platform. You must not publish illegal, harmful, or infringing content.' },
  { title: '4. Intellectual Property', content: 'All platform features, design, and technology are owned by Storyverse Inc. You may not copy, reverse-engineer, or misuse our systems. User content remains the intellectual property of each respective author.' },
  { title: '5. Payments & Royalties', content: 'You keep 90% of all book sales. Payouts are processed weekly via Stripe. Storyverse is not liable for payment delays caused by third-party processors. Refunds are handled on a case-by-case basis.' },
  { title: '6. Prohibited Conduct', content: 'You may not: upload malware, spam users, impersonate others, scrape data, sell account access, or violate any applicable laws. Violations may result in immediate account termination.' },
  { title: '7. Termination', content: 'We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from Settings. Deleted accounts cannot be recovered.' },
  { title: '8. Limitation of Liability', content: 'Storyverse is provided "as is." We are not liable for indirect, incidental, or consequential damages arising from your use of the platform. Our liability is limited to the amount you paid us in the past 12 months.' },
  { title: '9. Contact', content: 'For questions about these Terms, email us at legal@storyverse.io or write to: Storyverse Inc., 123 Publishing Lane, San Francisco, CA 94105.' },
];

export default function TermsPage({ user, onLogout }: Props) {
  return (
    <AppShell user={user} onLogout={onLogout}>
      <div className="min-h-screen bg-slate-50">
        <div className="w-full px-6 lg:px-10 py-12 max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-gray-900 transition-colors mb-8 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-blue-600" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Legal</span>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-slate-500 mb-10">Last updated: April 17, 2026 · Effective immediately</p>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-10 text-sm text-blue-800">
              <strong>Summary:</strong> You own your content. We take 10% of sales. Don't be abusive. We can terminate bad actors. Full details below.
            </div>
            <div className="space-y-8">
              {sections.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">{s.title}</h2>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <p className="text-sm text-slate-400">Questions? <a href="mailto:legal@storyverse.io" className="text-blue-600 font-medium hover:underline">legal@storyverse.io</a></p>
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
