import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { MessageCircle, Star, Send, Trash2, Loader2 } from 'lucide-react';

const API = 'http://localhost:8000';

interface Comment {
  id: string;
  username: string;
  text: string;
  rating?: number;
  createdAt?: string;
  userId: string;
}

interface Props {
  bookId: string;
  currentUserId?: string;
  currentUsername?: string;
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star size={18} className={`transition-colors ${(hover || value) >= star ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
        </button>
      ))}
    </div>
  );
}

export default function CommentsSection({ bookId, currentUserId, currentUsername }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    axios.get(`${API}/api/social/comments/${bookId}`)
      .then(r => setComments(r.data.comments || []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [bookId, open]);

  const submit = async () => {
    if (!text.trim() || !currentUsername || submitting) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/api/social/comment`, {
        bookId, userId: currentUserId || 'anonymous',
        username: currentUsername, text: text.trim(),
        rating: rating || null
      });
      const newComment: Comment = {
        id: Date.now().toString(),
        username: currentUsername,
        userId: currentUserId || '',
        text: text.trim(), rating, createdAt: new Date().toISOString(),
      };
      setComments(c => [newComment, ...c]);
      setText(''); setRating(0);
    } catch { alert('Failed to post comment.'); }
    setSubmitting(false);
  };

  const deleteComment = async (id: string) => {
    if (!currentUserId) return;
    await axios.delete(`${API}/api/social/comment/${id}`, { params: { userId: currentUserId } }).catch(() => {});
    setComments(c => c.filter(x => x.id !== id));
  };

  return (
    <div className="mt-8">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 hover:border-purple-500/40 rounded-xl transition-all text-sm font-semibold w-full"
      >
        <MessageCircle size={16} className="text-purple-400" />
        <span>{open ? 'Hide' : 'Show'} Comments {comments.length > 0 && `(${comments.length})`}</span>
        <span className="ml-auto text-gray-600 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">
              {/* Input */}
              {currentUsername ? (
                <div className="p-4 bg-white/[0.03] border border-white/[0.07] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-300">Leave a review</p>
                    <StarRating value={rating} onChange={setRating} />
                  </div>
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none"
                  />
                  <button
                    onClick={submit}
                    disabled={!text.trim() || submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Post Review
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-3">
                  <a href="/login" className="text-purple-400 hover:underline">Log in</a> to leave a review
                </p>
              )}

              {/* Comments list */}
              {loading ? (
                <div className="flex justify-center py-6">
                  <Loader2 size={20} className="animate-spin text-purple-500" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-center text-gray-600 text-sm py-6">No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-3">
                  {comments.map(c => (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-white/[0.03] border border-white/[0.05] rounded-xl group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xs font-black">
                            {c.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-white">@{c.username}</span>
                            {c.createdAt && (
                              <span className="ml-2 text-[10px] text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {c.rating && (
                            <div className="flex">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} size={11} className={s <= c.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-700'} />
                              ))}
                            </div>
                          )}
                          {currentUserId === c.userId && (
                            <button onClick={() => deleteComment(c.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{c.text}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
