import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Book, Tablet, ChevronLeft, ChevronRight, Share2, Heart, Download, Lock, Edit2, Bookmark, BookmarkCheck, BookOpen
} from 'lucide-react';
import { auth } from '../firebase';
import { theme, GlobalStyles, ComicCard, FlipSpread } from '../components/Theme';
import ParticleBackground from '../components/ParticleBackground';
import CommentsSection from '../components/CommentsSection';
import jsPDF from 'jspdf';
import axios from 'axios';

const API = 'http://localhost:8000';

export default function ComicReader() {
  const { id } = useParams();
  const [comicData, setComicData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [viewMode, setViewMode] = useState<'flipbook' | 'scroll'>('scroll');
  const [currentPage, setCurrentPage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [savedToShelf, setSavedToShelf] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchComic = async () => {
      if (!id) return;
      try {
        const response = await axios.get(`${API}/api/hub/book/${id}`);
        setComicData(response.data);
        axios.post(`${API}/api/hub/view/${id}`).catch(console.error);
        // Check bookshelf status
        const uid = auth.currentUser?.uid;
        if (uid) {
          axios.get(`${API}/api/social/bookshelf/${uid}/check/${id}`)
            .then(r => setSavedToShelf(r.data.saved))
            .catch(() => {});
        }
      } catch (err) {
        console.error('Error fetching comic:', err);
        setError('Failed to load comic. It may have been deleted or the link is incorrect.');
      }
      setLoading(false);
    };
    fetchComic();
  }, [id]);

  const handleLike = async () => {
    if (!liked) {
      setLiked(true);
      setComicData((prev: any) => ({...prev, likes: (prev.likes || 0) + 1}));
      try { await axios.post(`${API}/api/hub/like/${id}`); } catch {}
    }
  };

  const toggleBookshelf = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !comicData) return;
    if (savedToShelf) {
      setSavedToShelf(false);
      await axios.delete(`${API}/api/social/bookshelf/remove`, { params: { userId: uid, bookId: id } }).catch(() => {});
    } else {
      setSavedToShelf(true);
      await axios.post(`${API}/api/social/bookshelf/save`, {
        userId: uid, bookId: id,
        bookTitle: comicData.title, coverImage: comicData.coverImage, author: comicData.author
      }).catch(() => {});
    }
  };

  const comic = { pages: comicData?.pages || [] };
  const searchParams = new URLSearchParams(window.location.search);
  const hasPaid = searchParams.get('success') === 'true';
  const isLocked = comicData?.isPaid && !hasPaid;
  const visiblePages = isLocked ? comic?.pages?.slice(0, 3) || [] : comic?.pages || [];

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/payment/checkout', {
        comic_id: id,
        title: comicData.title,
        price: comicData.price || 299
      });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error(err);
      alert('Failed to initiate checkout.');
      setCheckoutLoading(false);
    }
  };

  const nextPage = () => { if (currentPage < visiblePages.length - 1) setCurrentPage(p => p + 1); };
  const prevPage = () => { if (currentPage > 0) setCurrentPage(p => p - 1); };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (viewMode === 'flipbook') {
        if (e.key === 'ArrowRight') nextPage();
        if (e.key === 'ArrowLeft') prevPage();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [viewMode, currentPage, visiblePages]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const downloadPDF = async () => {
    if (!comic || !comic.pages) return;
    setDownloadingPdf(true);
    try {
      // Create a PDF with the same aspect ratio as the panels (1024x1280)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [1024, 1280]
      });

      // Cover Page
      pdf.setFillColor(10, 14, 39); // Dark blue background
      pdf.rect(0, 0, 1024, 1280, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(80);
      pdf.text(comicData.title || 'Comic Book', 512, 600, { align: 'center' });

      pdf.setFontSize(40);
      pdf.text(`By ${comicData.author || 'Unknown Author'}`, 512, 700, { align: 'center' });

      // Add each panel as a new page (only visible ones)
      for (let i = 0; i < visiblePages.length; i++) {
        const page = visiblePages[i];
        pdf.addPage();
        if (page.image_url) {
          // Add image taking up the full page
          pdf.addImage(page.image_url, 'JPEG', 0, 0, 1024, 1280);
        } else {
          // Placeholder if missing
          pdf.setFillColor(10, 14, 39);
          pdf.rect(0, 0, 1024, 1280, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(60);
          pdf.text(`Panel ${i + 1} (Image missing)`, 512, 640, { align: 'center' });
        }
      }

      pdf.save(`${comicData.title || 'comic'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF.');
    }
    setDownloadingPdf(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-extrabold text-lg">S</span>
          </div>
          <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !comic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-gray-900 p-4 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen size={28} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Book not found</h1>
        <p className="text-slate-500 max-w-md mb-6">{error}</p>
        <Link to="/hub" className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-blue-700 transition-all">
          Browse the Hub
        </Link>
      </div>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: '100vh', position: 'relative', background: theme.colors.bg.primary }}>
        <ParticleBackground />

        {/* Premium White Storyverse Header */}
        <div className="no-print" style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #E2E8F0', padding: '0 1.5rem',
          height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <Link to="/hub" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
              <BookOpen size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: '#111827', letterSpacing: '-0.02em' }}>Storyverse</span>
          </Link>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20, border: '1px solid #E2E8F0', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Share2 size={14} /> Share
            </button>
            {!currentUser && (
              <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20, background: '#2563EB', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>Start Writing</Link>
            )}
          </div>
        </div>

        <div style={{ paddingTop: '80px', paddingBottom: '40px', position: 'relative', zIndex: 2 }}>
          <div className="container" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>

            {/* Header Info */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <h1 className="heading-lg">{comicData.title}</h1>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: theme.colors.text.muted }}>
                  <span>By <Link to={`/@${comicData.author}`} style={{ color: theme.colors.primary, textDecoration: 'none', fontWeight: 'bold' }}>{comicData.author}</Link></span>
                  <span>·</span>
                  <span>{comicData.pages?.length || 0} panels</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {auth.currentUser?.email === comicData.authorId && (
                  <Link to={`/edit/${id}`} className="btn-secondary" style={{ padding: '0.5rem 1rem', textDecoration: 'none' }}>
                    <Edit2 size={14} /> Edit Story
                  </Link>
                )}
                <div style={{ display: 'flex', gap: '0.25rem', background: theme.colors.surface.base, borderRadius: theme.radius.full, padding: '0.25rem' }}>
                  <button onClick={() => setViewMode('scroll')} style={{ background: viewMode === 'scroll' ? theme.colors.surface.panel : 'transparent', color: viewMode === 'scroll' ? '#fff' : theme.colors.text.muted, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: theme.radius.full, transition: 'all 0.2s' }}><Tablet size={14} /> Scroll</button>
                  <button onClick={() => setViewMode('flipbook')} style={{ background: viewMode === 'flipbook' ? theme.colors.surface.panel : 'transparent', color: viewMode === 'flipbook' ? '#fff' : theme.colors.text.muted, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: theme.radius.full, transition: 'all 0.2s' }}><Book size={14} /> Flipbook</button>
                </div>
                <button onClick={handleLike} disabled={liked} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}><Heart size={14} color={liked ? theme.colors.danger : undefined} fill={liked ? theme.colors.danger : 'none'} /> {comicData.likes || 0} {liked ? 'Liked' : 'Like'}</button>
                <button onClick={toggleBookshelf} className="btn-secondary" style={{ padding: '0.5rem 1rem' }} title={savedToShelf ? 'Remove from Bookshelf' : 'Save to Bookshelf'}>
                  {savedToShelf ? <BookmarkCheck size={14} color="#8B5CF6" /> : <Bookmark size={14} />}
                  {savedToShelf ? 'Saved' : 'Save'}
                </button>
                <button onClick={downloadPDF} disabled={downloadingPdf} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  {downloadingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  {downloadingPdf ? 'Generating...' : 'Download PDF'}
                </button>
              </div>
            </div>

            {/* Reader view */}
            {viewMode === 'flipbook' && (
              <div style={{ position: 'relative' }}>
                <AnimatePresence mode="wait">
                  <motion.div key={currentPage} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                    <FlipSpread panel={visiblePages[currentPage]} pageNum={currentPage + 1} totalPages={visiblePages.length} />
                  </motion.div>
                </AnimatePresence>
                <button onClick={prevPage} disabled={currentPage === 0} style={{ position: 'absolute', left: '-1rem', top: '50%', transform: 'translateY(-50%)', background: theme.colors.surface.base, border: `1px solid ${theme.colors.border.base}`, color: '#fff', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: currentPage === 0 ? 0.3 : 1 }}><ChevronLeft size={20} /></button>
                <button onClick={nextPage} disabled={currentPage >= visiblePages.length - 1} style={{ position: 'absolute', right: '-1rem', top: '50%', transform: 'translateY(-50%)', background: theme.colors.surface.base, border: `1px solid ${theme.colors.border.base}`, color: '#fff', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: currentPage >= visiblePages.length - 1 ? 0.3 : 1 }}><ChevronRight size={20} /></button>

                {isLocked && currentPage === visiblePages.length - 1 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center', background: theme.colors.surface.base, borderRadius: theme.radius.xl, border: `1px solid ${theme.colors.border.base}` }}>
                    <Lock size={32} color={theme.colors.warning} style={{ margin: '0 auto 1rem' }} />
                    <h3 className="heading-md" style={{ marginBottom: '0.5rem' }}>Unlock the Full Story</h3>
                    <button onClick={handleCheckout} disabled={checkoutLoading} className="btn-primary" style={{ marginTop: '1rem' }}>
                      {checkoutLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                      {checkoutLoading ? 'Processing...' : `Pay $${(comicData.price / 100).toFixed(2)} to Unlock`}
                    </button>
                  </motion.div>
                )}

                {!isLocked && (
                  <div style={{ textAlign: 'center', marginTop: '2rem' }}><span style={{ fontSize: '0.75rem', color: theme.colors.text.muted }}>PANEL {currentPage + 1} / {visiblePages.length} · Use arrow keys</span></div>
                )}
              </div>
            )}

            {viewMode === 'scroll' && (
              <div className="glass-card" style={{ overflow: 'hidden', padding: '1rem' }}>
                {visiblePages.map((panel: any, idx: number) => <ComicCard key={idx} panel={panel} idx={idx} />)}

                {isLocked && (
                  <div style={{ padding: '4rem 2rem', textAlign: 'center', background: theme.colors.bg.secondary, borderTop: `1px solid ${theme.colors.border.base}` }}>
                    <Lock size={48} color={theme.colors.warning} style={{ margin: '0 auto 1rem' }} />
                    <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Unlock the Full Story</h3>
                    <p style={{ color: theme.colors.text.muted, maxWidth: '400px', margin: '0 auto 2rem' }}>
                      Support the creator by unlocking the rest of this epic adventure for just ${(comicData.price / 100).toFixed(2)}.
                    </p>
                    <button onClick={handleCheckout} disabled={checkoutLoading} className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.25rem' }}>
                      {checkoutLoading ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />}
                      {checkoutLoading ? 'Processing...' : `Pay $${(comicData.price / 100).toFixed(2)} to Unlock`}
                    </button>
                  </div>
                )}

                {!isLocked && (
                  <div style={{ textAlign: 'center', padding: '1rem', borderTop: `1px solid ${theme.colors.border.base}`, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '4px', color: theme.colors.text.light }}>— THE END —</div>
                )}
              </div>
            )}

          </div>

          {/* Comments Section */}
          <CommentsSection
            bookId={id || ''}
            currentUserId={currentUser?.uid}
            currentUsername={currentUser?.displayName || currentUser?.email?.split('@')[0]}
          />

        </div>
      </div>
    </>
  );
}
