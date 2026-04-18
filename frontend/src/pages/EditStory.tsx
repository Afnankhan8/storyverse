import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, Send, GitCommit } from 'lucide-react';
import AppShell from '../components/AppShell';

export default function EditStory({ user, onLogout }: { user?: any, onLogout?: () => void }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/hub/book/${id}`);
        const bookData = response.data;

        // Security check
        if (bookData.authorId !== user.email) {
          setError('You do not have permission to edit this book.');
        } else {
          setBook(bookData);
        }
      } catch (err) {
        setError('Failed to load book data.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBook();
  }, [id, user]);

  const handlePageChange = (index: number, field: string, value: string) => {
    const newPages = [...book.pages];
    newPages[index] = { ...newPages[index], [field]: value };
    setBook({ ...book, pages: newPages });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`http://localhost:8000/api/hub/book/${id}`, {
        title: book.title,
        pages: book.pages,
        authorId: user.email
      });
      alert('Changes pushed to production successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to push changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell user={user} onLogout={onLogout}>
        <div className="flex items-center justify-center min-h-[60vh] text-slate-400">Loading...</div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell user={user} onLogout={onLogout}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
          <AlertCircle size={48} className="text-red-500" />
          <h2 className="text-xl font-bold text-slate-900">{error}</h2>
          <button onClick={() => navigate('/creator')} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all">Return to Studio</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={user} onLogout={onLogout}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px' }}>

        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '8px' }}>
              <GitCommit size={14} /> REVISION MODE
            </div>
            <input
              type="text"
              value={book.title}
              onChange={(e) => setBook({ ...book, title: e.target.value })}
              style={{ background: 'transparent', border: 'none', borderBottom: '1px dashed rgba(255,255,255,0.3)', outline: 'none', fontSize: '2.5rem', fontWeight: 800, color: '#fff', width: '100%', paddingBottom: '4px', fontFamily: "'Syne', sans-serif" }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{ padding: '12px 24px', opacity: saving ? 0.7 : 1 }}
          >
            <Send size={16} /> {saving ? 'Pushing...' : 'Commit & Push Updates'}
          </button>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {book.pages.map((page: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', gap: '24px', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}
            >
              <div style={{ width: '160px', flexShrink: 0 }}>
                <div style={{ position: 'relative', aspectRatio: '2/3', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                  <img src={page.image_url} alt={`Panel ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em' }}>
                    PANEL {page.panel_number}
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Scene Description</label>
                  <textarea
                    value={page.action}
                    onChange={(e) => handlePageChange(idx, 'action', e.target.value)}
                    rows={3}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Speaker 1</label>
                    <input
                      type="text" value={page.speaker_1 || ''}
                      onChange={(e) => handlePageChange(idx, 'speaker_1', e.target.value)}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', outline: 'none', marginBottom: '8px' }}
                      placeholder="Character name"
                    />
                    <textarea
                      value={page.line_1 || ''}
                      onChange={(e) => handlePageChange(idx, 'line_1', e.target.value)}
                      rows={2} placeholder="Dialogue..."
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Speaker 2</label>
                    <input
                      type="text" value={page.speaker_2 || ''}
                      onChange={(e) => handlePageChange(idx, 'speaker_2', e.target.value)}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', outline: 'none', marginBottom: '8px' }}
                      placeholder="Character name"
                    />
                    <textarea
                      value={page.line_2 || ''}
                      onChange={(e) => handlePageChange(idx, 'line_2', e.target.value)}
                      rows={2} placeholder="Dialogue..."
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
