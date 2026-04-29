import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { ChevronLeft, BookOpen, Loader2, AlertCircle, Maximize, Play, Pause, Volume2, StopCircle } from 'lucide-react';
import { theme, ComicCard, FlipSpread, panelAccents } from '../components/Theme';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const API = 'http://localhost:8000'; // Default port for local dev

export default function ComicReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookData, setBookData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // PDF states
  const [numPages, setNumPages] = useState(0);
  const [pdfError, setPdfError] = useState(false);
  const [pdfScale, setPdfScale] = useState(1.0);

  // Comic states
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'flip' | 'scroll'>('flip');

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Try Firestore 'books' collection (Uploaded Books)
        const docRef = doc(db, 'books', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setBookData({ id: docSnap.id, ...docSnap.data() });
        } else {
          // 2. Try Backend API (Published/AI Books)
          try {
            const res = await axios.get(`${API}/api/hub/book/${id}`);
            if (res.data) {
              setBookData(res.data);
            } else {
              setError("Book not found.");
            }
          } catch (apiErr) {
            console.error("API Fetch Error:", apiErr);
            setError("Could not find book in library or hub.");
          }
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("An error occurred while loading the book.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Opening your adventure...</p>
      </div>
    );
  }

  if (error || !bookData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
        <p className="text-slate-400 mb-8 max-w-md">{error || "The book you're looking for doesn't exist or is unavailable."}</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isPDF = !!bookData.fileUrl;
  const hasPages = bookData.pages && bookData.pages.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30">
      {/* Top Navigation */}
      <nav className="fixed top-0 inset-x-0 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="font-bold text-sm md:text-base truncate max-w-[200px] md:max-w-md">{bookData.title}</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">By {bookData.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isPDF && hasPages && (
            <div className="bg-slate-800 p-1 rounded-lg flex">
              <button 
                onClick={() => setViewMode('flip')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${viewMode === 'flip' ? 'bg-cyan-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Flip
              </button>
              <button 
                onClick={() => setViewMode('scroll')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${viewMode === 'scroll' ? 'bg-cyan-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Scroll
              </button>
            </div>
          )}
          <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <Maximize size={18} />
          </button>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* PDF VIEWER */}
          {isPDF ? (
            <div className="flex flex-col items-center">
              <div className="bg-slate-900 rounded-2xl p-4 md:p-8 shadow-2xl border border-slate-800 overflow-hidden w-full flex justify-center">
                {pdfError ? (
                  <div className="py-20 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-400">Failed to load PDF document.</p>
                    <p className="text-slate-500 text-sm mt-2">Try refreshing the page or check your connection.</p>
                  </div>
                ) : (
                  <Document
                    file={`${API}/proxy-pdf?url=${encodeURIComponent(bookData.fileUrl)}`}
                    loading={
                      <div className="py-20 text-center">
                        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-400">Rendering pages...</p>
                      </div>
                    }
                    onLoadSuccess={({ numPages }) => {
                      setNumPages(numPages);
                      setPdfError(false);
                    }}
                    onLoadError={(err) => {
                      console.error('PDF LOAD ERROR:', err);
                      console.error('Failed URL:', `${API}/proxy-pdf?url=${encodeURIComponent(bookData.fileUrl)}`);
                      setPdfError(true);
                    }}
                  >
                    <HTMLFlipBook 
                      width={window.innerWidth > 768 ? 550 : 350} 
                      height={window.innerWidth > 768 ? 750 : 500} 
                      showCover={true} 
                      className="mx-auto"
                      style={{}}
                      startPage={0}
                      size="fixed"
                      minWidth={300}
                      maxWidth={1000}
                      minHeight={400}
                      maxHeight={1500}
                      drawShadow={true}
                      flippingTime={1000}
                      usePortrait={window.innerWidth < 1024}
                      startZIndex={0}
                      autoSize={true}
                      maxShadowOpacity={0.5}
                      mobileScrollSupport={true}
                      clickEventForward={true}
                      useMouseEvents={true}
                      swipeDistance={30}
                      showPageCorners={true}
                      disableFlipByClick={false}
                    >
                      {Array.from(new Array(numPages), (_, index) => (
                        <div key={index} className="bg-white shadow-2xl overflow-hidden">
                          <Page
                            pageNumber={index + 1}
                            width={window.innerWidth > 768 ? 550 : 350}
                            devicePixelRatio={window.devicePixelRatio}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            className="shadow-inner"
                          />
                        </div>
                      ))}
                    </HTMLFlipBook>
                  </Document>
                )}
              </div>
              {numPages > 0 && !pdfError && (
                <p className="mt-6 text-slate-500 font-medium text-sm">
                  {numPages} Pages · Use your mouse or swipe to flip
                </p>
              )}
            </div>
          ) : hasPages ? (
            /* COMIC PANEL VIEWER */
            <div className="space-y-12">
              {viewMode === 'flip' ? (
                <div className="relative min-h-[600px] flex flex-col items-center">
                  <div className="w-full max-w-2xl">
                    <FlipSpread 
                      panel={bookData.pages[currentPage]} 
                      pageNum={currentPage + 1} 
                      totalPages={bookData.pages.length} 
                      storyTitle={bookData.title}
                    />
                  </div>
                  
                  {/* Comic Navigation */}
                  <div className="flex items-center gap-8 mt-12">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    
                    <div className="text-center">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Panel</p>
                      <p className="text-2xl font-black text-cyan-500 tracking-tighter">
                        {String(currentPage + 1).padStart(2, '0')} <span className="text-slate-700 mx-1">/</span> {String(bookData.pages.length).padStart(2, '0')}
                      </p>
                    </div>

                    <button 
                      onClick={() => setCurrentPage(p => Math.min(bookData.pages.length - 1, p + 1))}
                      disabled={currentPage === bookData.pages.length - 1}
                      className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl"
                    >
                      <ChevronLeft size={24} className="rotate-180" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-8">
                  {bookData.pages.map((panel: any, idx: number) => (
                    <div key={idx} className="anim-fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <ComicCard panel={panel} idx={idx} />
                    </div>
                  ))}
                  <div className="py-20 text-center border-t border-slate-900 mt-20">
                    <h3 className="text-slate-700 font-black text-4xl tracking-[0.2em] uppercase">The End</h3>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-slate-800 mx-auto mb-4" />
              <p className="text-slate-500">This book appears to be empty.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
