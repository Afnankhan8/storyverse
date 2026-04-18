import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, BarChart3, Settings, LogOut, Search, Plus, Edit2,
  Trash2, Shield, Ban, AlertCircle, CheckCircle, XCircle, BookOpen,
  User, LayoutDashboard, ChevronRight, CheckCircle2, Loader2, CreditCard,
  BookText, Zap
} from 'lucide-react';
import { collection, doc, updateDoc, deleteDoc, setDoc, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { signOut, createUserWithEmailAndPassword, getAuth } from 'firebase/auth';

interface SuperAdminDashboardProps {
  onLogout: () => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  credits: number;
  plan: 'free' | 'pro' | 'team';
  status: 'active' | 'inactive' | 'banned';
  comicsCount: number;
  createdAt: any;
}

interface BookData {
  id: string;
  title: string;
  author: string;
  genre: string;
  status: string;
  coverImage: string;
  createdAt: any;
  audience?: string;
  language?: string;
}

type Tab = 'overview' | 'queue' | 'users' | 'analytics' | 'settings';

const generateTempPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export default function SuperAdminDashboard({ onLogout }: SuperAdminDashboardProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [pendingBooks, setPendingBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'banned'>('all');

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', credits: 10, plan: 'free' as 'free' | 'pro' | 'team', status: 'active' as 'active' | 'inactive' | 'banned'
  });

  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsUser, setCreditsUser] = useState<UserData | null>(null);
  const [creditAdjustment, setCreditAdjustment] = useState({ mode: 'set', value: 0 });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: UserData[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          id: doc.id,
          name: data.name || 'No name',
          email: data.email || '',
          credits: data.credits ?? 10,
          plan: data.plan || 'free',
          status: data.status || 'active',
          comicsCount: data.comicsCount ?? 0,
          createdAt: data.createdAt,
        });
      });
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error('Firestore error:', error);
      setLoading(false);
    });

    const qBooks = query(collection(db, 'published_books'), where('status', '==', 'pending'));
    const unsubscribeBooks = onSnapshot(qBooks, (snapshot) => {
      const booksData: BookData[] = [];
      snapshot.forEach(d => booksData.push({ id: d.id, ...d.data() } as BookData));
      setPendingBooks(booksData);
    });

    return () => { unsubscribe(); unsubscribeBooks(); };
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const bannedUsers = users.filter(u => u.status === 'banned').length;
  const totalCredits = users.reduce((sum, u) => sum + u.credits, 0);
  const proUsers = users.filter(u => u.plan === 'pro').length;
  const teamUsers = users.filter(u => u.plan === 'team').length;
  const freeUsers = totalUsers - proUsers - teamUsers;
  const topUsersByCredits = [...users].sort((a, b) => b.credits - a.credits).slice(0, 5);

  const handleSaveUser = async () => {
    setModalLoading(true);
    try {
      if (editingUser) {
        const userRef = doc(db, 'users', editingUser.id);
        await updateDoc(userRef, {
          name: formData.name, email: formData.email, credits: formData.credits, plan: formData.plan, status: formData.status,
        });
        alert('User updated successfully');
      } else {
        const tempPassword = generateTempPassword();
        const authApp = getAuth();
        const userCredential = await createUserWithEmailAndPassword(authApp, formData.email, tempPassword);
        const uid = userCredential.user.uid;
        await setDoc(doc(db, 'users', uid), {
          name: formData.name, email: formData.email, credits: formData.credits, plan: formData.plan, status: formData.status, comicsCount: 0, createdAt: new Date(),
        });
        alert(`✅ User created successfully!\n\nEmail: ${formData.email}\nTemporary password: ${tempPassword}\n\nPlease provide this password to the user. They can change it after login.`);
      }
      setShowUserModal(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', credits: 10, plan: 'free', status: 'active' });
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') alert('❌ A user with this email already exists in Authentication.');
      else alert(`❌ Failed to create user: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleAdjustCredits = async () => {
    if (!creditsUser) return;
    setModalLoading(true);
    try {
      let newCredits = creditsUser.credits;
      if (creditAdjustment.mode === 'set') newCredits = creditAdjustment.value;
      else if (creditAdjustment.mode === 'add') newCredits += creditAdjustment.value;
      else if (creditAdjustment.mode === 'subtract') newCredits -= creditAdjustment.value;
      if (newCredits < 0) newCredits = 0;
      await updateDoc(doc(db, 'users', creditsUser.id), { credits: newCredits });
      setShowCreditsModal(false);
      setCreditsUser(null);
    } catch (err) { alert('Failed to update credits'); } finally { setModalLoading(false); }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      setDeleteConfirm(null);
      alert('User document deleted. Auth user must be deleted manually from Firebase Console.');
    } catch (err) { alert('Failed to delete user'); }
  };

  const handleBanToggle = async (user: UserData) => {
    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    await updateDoc(doc(db, 'users', user.id), { status: newStatus });
  };

  const handleApproveBook = async (bookId: string) => {
    try { await updateDoc(doc(db, 'published_books', bookId), { status: 'published', isPublished: true }); } catch (err) { alert('Failed to approve book'); }
  };

  const handleRejectBook = async (bookId: string) => {
    try { await updateDoc(doc(db, 'published_books', bookId), { status: 'rejected', isPublished: false }); } catch (err) { alert('Failed to reject book'); }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'queue', label: 'Moderation Queue', icon: BookOpen, badge: pendingBooks.length },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-10 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-slate-900 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Admin<span className="text-blue-600">Pro</span></h1>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Superuser Portal</p>
          </div>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Menu</div>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}>
                <tab.icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                {tab.label}
                {(tab as any).badge !== undefined && (tab as any).badge > 0 && (
                  <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-200 text-blue-800' : 'bg-red-100 text-red-600'}`}>
                    {(tab as any).badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button onClick={async () => { await signOut(auth); onLogout(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h2>
            <p className="text-sm text-slate-500">Manage and monitor the platform</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-500">
              <User size={18} />
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-500">Total Users</h3>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Users size={16} className="text-blue-600" /></div>
                      </div>
                      <p className="text-3xl font-black text-slate-900">{totalUsers.toLocaleString()}</p>
                      <p className="text-sm text-emerald-600 font-medium mt-2 flex items-center gap-1"><CheckCircle2 size={14} /> {activeUsers} active</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-500">Total Books</h3>
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><BookOpen size={16} className="text-indigo-600" /></div>
                      </div>
                      <p className="text-3xl font-black text-slate-900">4,281</p>
                      <p className="text-sm text-blue-600 font-medium mt-2 flex items-center gap-1"><BookText size={14} /> {pendingBooks.length} pending review</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-500">Total Credits</h3>
                        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center"><CreditCard size={16} className="text-violet-600" /></div>
                      </div>
                      <p className="text-3xl font-black text-slate-900">{totalCredits.toLocaleString()}</p>
                      <p className="text-sm text-slate-500 font-medium mt-2">Circulating in ecosystem</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-500">Premium Users</h3>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Zap size={16} className="text-amber-500" /></div>
                      </div>
                      <p className="text-3xl font-black text-slate-900">{(proUsers + teamUsers).toLocaleString()}</p>
                      <p className="text-sm text-slate-500 font-medium mt-2">{((proUsers + teamUsers) / (totalUsers || 1) * 100).toFixed(1)}% conversion rate</p>
                    </div>
                  </div>
                </div>
              )}

              {/* QUEUE TAB */}
              {activeTab === 'queue' && (
                <div className="space-y-6">
                  {pendingBooks.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">All caught up!</h3>
                      <p className="text-slate-500">There are no books waiting for moderation.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {pendingBooks.map(book => (
                        <div key={book.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
                          <div className="aspect-[2/3] relative bg-slate-100 overflow-hidden">
                            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-amber-500/30">
                              PENDING
                            </div>
                          </div>
                          <div className="p-5 flex flex-col">
                            <h3 className="font-bold text-slate-900 mb-1 truncate" title={book.title}>{book.title}</h3>
                            <p className="text-sm text-slate-500 mb-3 truncate">By {book.author}</p>

                            <div className="flex flex-wrap gap-1.5 mb-5">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider">{book.genre}</span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider">{book.audience || 'General'}</span>
                            </div>

                            <div className="mt-auto grid grid-cols-2 gap-2">
                              <button onClick={() => handleRejectBook(book.id)} className="flex items-center justify-center gap-1.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-sm transition-colors">
                                <XCircle size={15} /> Reject
                              </button>
                              <button onClick={() => handleApproveBook(book.id)} className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl font-bold text-sm transition-colors">
                                <CheckCircle size={15} /> Approve
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === 'users' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
                      </div>
                      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="banned">Banned</option>
                      </select>
                    </div>
                    <button onClick={() => { setEditingUser(null); setFormData({ name: '', email: '', credits: 10, plan: 'free', status: 'active' }); setShowUserModal(true); }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition shadow-md shadow-blue-600/20">
                      <Plus size={16} /> Add User
                    </button>
                  </div>

                  {loading ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
                      <Loader2 size={32} className="animate-spin mb-4" />
                      <p>Loading users...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Plan</th>
                            <th className="px-6 py-4">Credits</th>
                            <th className="px-6 py-4">Comics</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900">{user.name}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                  user.status === 'banned' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                  }`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${user.plan === 'pro' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                                  user.plan === 'team' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                                  }`}>
                                  {user.plan}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-700">{user.credits}</span>
                                  <button onClick={() => { setCreditsUser(user); setCreditAdjustment({ mode: 'set', value: user.credits }); setShowCreditsModal(true); }}
                                    className="text-[10px] text-blue-600 font-bold hover:underline">
                                    Edit
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-600 font-medium">{user.comicsCount}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => { setEditingUser(user); setFormData({ name: user.name, email: user.email, credits: user.credits, plan: user.plan, status: user.status }); setShowUserModal(true); }}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit User">
                                    <Edit2 size={16} />
                                  </button>
                                  <button onClick={() => handleBanToggle(user)}
                                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title={user.status === 'banned' ? 'Unban User' : 'Ban User'}>
                                    <Ban size={16} />
                                  </button>
                                  <button onClick={() => setDeleteConfirm(user.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ANALYTICS TAB */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><BarChart3 size={18} className="text-blue-600" /> Plan Distribution</h3>
                      <div className="space-y-4">
                        {[
                          { label: 'Free Tier', count: freeUsers, color: 'bg-slate-200', text: 'text-slate-700' },
                          { label: 'Pro Tier', count: proUsers, color: 'bg-violet-500', text: 'text-violet-700' },
                          { label: 'Team Tier', count: teamUsers, color: 'bg-blue-500', text: 'text-blue-700' },
                        ].map(tier => (
                          <div key={tier.label}>
                            <div className="flex justify-between text-sm mb-1 font-semibold">
                              <span className={tier.text}>{tier.label}</span>
                              <span className="text-slate-900">{tier.count} users</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                              <div className={`${tier.color} h-2.5 rounded-full`} style={{ width: `${(tier.count / (totalUsers || 1)) * 100}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><Zap size={18} className="text-amber-500" /> Top Users by Credits</h3>
                      <div className="space-y-3">
                        {topUsersByCredits.map((u, i) => (
                          <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">{i + 1}</div>
                              <span className="font-semibold text-slate-900">{u.name}</span>
                            </div>
                            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">{u.credits}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
                  <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><Settings size={20} className="text-slate-400" /> System Configuration</h3>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-2">Admin Account Details</h4>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between border-b border-slate-200 pb-3">
                          <span className="text-sm text-slate-500">Superadmin Email</span>
                          <span className="text-sm font-bold text-slate-900">superadmin@comixnova.ai</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">Authentication Method</span>
                          <span className="text-sm font-bold text-slate-900">Firebase Auth</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-2">Database Connection</h4>
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                        <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold">Firestore Realtime Sync Active</p>
                          <p className="text-xs mt-0.5 opacity-80">Listening to 'users' and 'published_books' collections.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showUserModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">{editingUser ? 'Edit User' : 'Add New User'}</h3>
                <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input type="text" placeholder="John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} disabled={!!editingUser} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Credits</label>
                    <input type="number" value={formData.credits} onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Plan</label>
                    <select value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value as any })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="team">Team</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button onClick={() => setShowUserModal(false)} className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={handleSaveUser} disabled={modalLoading} className="flex-1 py-2.5 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition-colors flex items-center justify-center shadow-md shadow-blue-600/20">
                  {modalLoading ? <Loader2 size={16} className="animate-spin" /> : 'Save User'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showCreditsModal && creditsUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900">Adjust Credits</h3>
                <p className="text-sm text-slate-500 mt-1">For <span className="font-bold text-slate-900">{creditsUser.name}</span></p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <span className="text-sm font-bold text-slate-600">Current Balance</span>
                  <span className="text-lg font-mono font-black text-blue-600">{creditsUser.credits}</span>
                </div>
                <div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-xl">
                  {['set', 'add', 'subtract'].map(mode => (
                    <button key={mode} onClick={() => setCreditAdjustment({ ...creditAdjustment, mode })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${creditAdjustment.mode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      {mode}
                    </button>
                  ))}
                </div>
                <input type="number" value={creditAdjustment.value} onChange={e => setCreditAdjustment({ ...creditAdjustment, value: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2" placeholder="0" />
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button onClick={() => setShowCreditsModal(false)} className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={handleAdjustCredits} disabled={modalLoading} className="flex-1 py-2.5 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition-colors flex items-center justify-center">
                  {modalLoading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 p-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Delete User?</h3>
              <p className="text-sm text-slate-500 mb-8">This action is permanent and will delete the user's Firestore document.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button onClick={() => handleDeleteUser(deleteConfirm)} className="flex-1 py-2.5 bg-red-600 rounded-xl text-sm font-bold text-white hover:bg-red-700 transition-colors">Yes, Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}