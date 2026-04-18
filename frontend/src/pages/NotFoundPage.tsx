import { motion } from 'framer-motion';
import { BookOpen, ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        <div className="mb-8 relative inline-block">
          <div className="w-32 h-44 bg-gray-200 rounded-xl shadow-2xl mx-auto flex items-center justify-center relative">
            <BookOpen size={48} className="text-gray-400" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">!</div>
          </div>
        </div>

        <h1 className="text-8xl font-black text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h2>
        <p className="text-slate-500 mb-8">
          The page you're looking for doesn't exist or has been moved. It might be a chapter that was never written.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-all">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <Link to="/hub" className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
            <Search size={16} /> Explore Books
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
