import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  BookOpen, Eye, Heart, Users, UserPlus, UserCheck,
  Star, Globe, Sparkles, ArrowRight, Loader2
} from 'lucide-react';
import { auth } from '../firebase.ts';
import AppShell from '../components/AppShell';

const API = "https://your-backend.onrender.com";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } })
};

export default function CreatorProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const cleanUsername = username?.replace('@', '') || 'Creator';
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      if (!cleanUsername) return;
      try {
        const [comicsRes, followRes] = await Promise.all([
          axios.get(`${API}/api/hub/user/${cleanUsername}`),
          axios.get(`${API}/api/social/follow/${cleanUsername}/count`),
        ]);
        setBooks(comicsRes.data.books || []);
        setFollowerCount(followRes.data.count || 0);
        if (currentUser?.uid) {
          const checkRes = await axios.get(`${API}/api/social/follow/${currentUser.uid}/check/${cleanUsername}`);
          setFollowing(checkRes.data.following);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, [cleanUsername, currentUser]);

  const toggleFollow = async () => {
    if (!currentUser) { navigate('/login'); return; }
    setFollowLoading(true);
    try {
      if (following) {
        await axios.delete(`${API}/api/social/follow`, { params: { followerId: currentUser.uid, targetUsername: cleanUsername } });
        setFollowerCount(c => Math.max(0, c - 1));
        setFollowing(false);
      } else {
        await axios.post(`${API}/api/social/follow`, {
          followerId: currentUser.uid,
          followerName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          targetUsername: cleanUsername,
        });
        setFollowerCount(c => c + 1);
        setFollowing(true);
      }
    } catch { /* silent */ }
    setFollowLoading(false);
  };

  const totalViews = books.reduce((s, b) => s + (b.views || 0), 0);
  const totalLikes = books.reduce((s, b) => s + (b.likes || 0), 0);
  const avgRating = books.length
    ? (books.reduce((s, b) => s + (b.avgRating || 0), 0) / books.length).toFixed(1)
    : '—';
  const isOwnProfile = currentUser?.email === books[0]?.authorId;

  return (
    <AppShell user={currentUser ? { name: currentUser.displayName || cleanUsername, email: currentUser.email || '' } : undefined}>
      <div className="min-h-screen bg-slate-50">

        {/* Profile Hero */}
        <div className="bg-white border-b border-gray-100">
          <div className="w-full px-6 lg:px-10 py-10 lg:py-14">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row items-start lg:items-center gap-8">

              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-4xl font-extrabold shadow-xl shadow-blue-500/20">
                  {cleanUsername.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                  <Sparkles size={14} color="#fff" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start gap-4 mb-3">
                  <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">@{cleanUsername}</h1>
                    <p className="text-slate-500 mt-1 text-sm">Independent creator on Storyverse</p>
                  </div>
                  {!isOwnProfile && (
                    <button
                      onClick={toggleFollow}
                      disabled={followLoading}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm disabled:opacity-60 ${
                        following
                          ? 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 border border-slate-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                      }`}
                    >
                      {followLoading
                        ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        : following ? <><UserCheck size={15} /> Following</> : <><UserPlus size={15} /> Follow</>
                      }
                    </button>
                  )}
                  {isOwnProfile && (
                    <Link to="/settings" className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border border-gray-200 text-slate-700 hover:bg-slate-50 transition-all">
                      Edit Profile
                    </Link>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap gap-6 mt-2">
                  {[
                    { icon: BookOpen, label: 'Books', value: books.length, color: 'text-blue-600' },
                    { icon: Eye, label: 'Views', value: totalViews.toLocaleString(), color: 'text-violet-600' },
                    { icon: Heart, label: 'Likes', value: totalLikes.toLocaleString(), color: 'text-rose-500' },
                    { icon: Users, label: 'Followers', value: followerCount, color: 'text-emerald-600' },
                    { icon: Star, label: 'Avg Rating', value: avgRating, color: 'text-amber-500' },
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center gap-2">
                      <stat.icon size={15} className={stat.color} />
                      <span className="font-extrabold text-gray-900">{stat.value}</span>
                      <span className="text-slate-500 text-sm">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full px-6 lg:px-10 py-10">

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} className="text-slate-400" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">No books published yet</h3>
              <p className="text-slate-500 text-sm mb-5">This creator hasn't published any books yet.</p>
              <Link to="/hub" className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 mx-auto w-fit hover:bg-blue-700 transition-all">
                <Globe size={14} /> Browse the Hub
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-extrabold text-gray-900">
                  Published Works <span className="text-slate-400 font-medium text-base ml-1">({books.length})</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {books.map((book, idx) => (
                  <motion.div
                    key={book.id}
                    custom={idx}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    onClick={() => navigate(`/book/${book.id}`)}
                    className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    {/* Cover */}
                    <div className="relative aspect-[2/3] overflow-hidden bg-slate-100">
                      {book.coverImage
                        ? <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                            <BookOpen size={40} className="text-slate-300" />
                          </div>
                      }
                      {/* Price badge */}
                      <div className={`absolute top-3 left-3 text-xs font-extrabold px-3 py-1 rounded-full shadow-md ${book.isPaid ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'}`}>
                        {book.isPaid ? `$${(book.price / 100).toFixed(2)}` : 'FREE'}
                      </div>
                      {/* Hover CTA */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <span className="bg-white text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                          Read <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                    {/* Meta */}
                    <div className="p-3.5">
                      <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {book.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                        <span className="flex items-center gap-1"><Eye size={10} /> {(book.views || 0).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Heart size={10} /> {book.likes || 0}</span>
                        <span className="flex items-center gap-1"><Star size={10} className="fill-amber-400 text-amber-400" /> {(book.avgRating || 4.5).toFixed(1)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
