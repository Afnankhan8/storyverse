import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, BarChart3, Settings, LogOut, Search, Plus, Edit2,
  Trash2, Shield, Ban, AlertCircle,
  User
} from 'lucide-react';
import { collection, doc, updateDoc, deleteDoc, setDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
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

type Tab = 'users' | 'analytics' | 'settings';

// Helper: generate strong random password
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'banned'>('all');
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    credits: 10,
    plan: 'free' as 'free' | 'pro' | 'team',
    status: 'active' as 'active' | 'inactive' | 'banned'
  });
  
  // Credits adjustment modal
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsUser, setCreditsUser] = useState<UserData | null>(null);
  const [creditAdjustment, setCreditAdjustment] = useState({ mode: 'set', value: 0 });
  
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Real-time Firestore listener
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
    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const bannedUsers = users.filter(u => u.status === 'banned').length;
  const totalCredits = users.reduce((sum, u) => sum + u.credits, 0);
  const proUsers = users.filter(u => u.plan === 'pro').length;
  const teamUsers = users.filter(u => u.plan === 'team').length;
  const freeUsers = totalUsers - proUsers - teamUsers;
  const topUsersByCredits = [...users].sort((a,b) => b.credits - a.credits).slice(0,5);

  // Add/Edit user (now creates Auth + Firestore)
  const handleSaveUser = async () => {
    setModalLoading(true);
    try {
      if (editingUser) {
        // Update existing user (Firestore only)
        const userRef = doc(db, 'users', editingUser.id);
        await updateDoc(userRef, {
          name: formData.name,
          email: formData.email,
          credits: formData.credits,
          plan: formData.plan,
          status: formData.status,
        });
        alert('User updated successfully');
      } else {
        // 1. Generate strong password
        const tempPassword = generateTempPassword();
        // 2. Create Auth user
        const authApp = getAuth();
        const userCredential = await createUserWithEmailAndPassword(authApp, formData.email, tempPassword);
        const uid = userCredential.user.uid;
        // 3. Create Firestore document
        await setDoc(doc(db, 'users', uid), {
          name: formData.name,
          email: formData.email,
          credits: formData.credits,
          plan: formData.plan,
          status: formData.status,
          comicsCount: 0,
          createdAt: new Date(),
        });
        // 4. Show password to admin
        alert(`✅ User created successfully!\n\nEmail: ${formData.email}\nTemporary password: ${tempPassword}\n\nPlease provide this password to the user. They can change it after login.`);
      }
      setShowUserModal(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', credits: 10, plan: 'free', status: 'active' });
    } catch (err: any) {
      console.error('Full error:', err);
      if (err.code === 'auth/email-already-in-use') {
        alert('❌ A user with this email already exists in Authentication. Use a different email or delete the existing Auth user first.');
      } else if (err.code === 'auth/weak-password') {
        alert('❌ Password too weak. The auto-generated password is strong – this error should not occur. Check Firebase password policy.');
      } else {
        alert(`❌ Failed to create user: ${err.message}\n\nCheck console for details.`);
      }
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
    } catch (err) {
      alert('Failed to update credits');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Note: This only deletes Firestore doc. Auth user remains (requires Cloud Function for full deletion)
      await deleteDoc(doc(db, 'users', userId));
      setDeleteConfirm(null);
      alert('User document deleted. Auth user (if any) must be deleted manually from Firebase Console if needed.');
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleBanToggle = async (user: UserData) => {
    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    await updateDoc(doc(db, 'users', user.id), { status: newStatus });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] to-[#1a0a2e]">
      {/* Header */}
      <div className="glass border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold gradient-text">Super Admin Portal</h1>
          </div>
          <button
            onClick={async () => { await signOut(auth); onLogout(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-2 border-b border-white/10 mb-6">
          {[
            { id: 'users', label: 'Users', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-lg transition ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <button
                onClick={() => { setEditingUser(null); setFormData({ name: '', email: '', credits: 10, plan: 'free', status: 'active' }); setShowUserModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
              >
                <Plus size={18} /> Add User
              </button>
            </div>

            {loading ? (
              <div className="text-center py-20 text-gray-400">Loading users...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr className="text-left text-gray-400">
                      <th className="pb-3">User</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Credits</th>
                      <th className="pb-3">Comics</th>
                      <th className="pb-3">Plan</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <User size={14} className="text-purple-400" />
                          </div>
                          {user.name}
                        </td>
                        <td className="py-3">{user.email}</td>
                        <td className="py-3">
                          <span className="font-mono">{user.credits}</span>
                          <button
                            onClick={() => { setCreditsUser(user); setCreditAdjustment({ mode: 'set', value: user.credits }); setShowCreditsModal(true); }}
                            className="ml-2 text-xs text-purple-400 hover:text-purple-300"
                          >
                            adjust
                          </button>
                        </td>
                        <td className="py-3">{user.comicsCount}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.plan === 'pro' ? 'bg-yellow-500/20 text-yellow-400' :
                            user.plan === 'team' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {user.plan}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            user.status === 'banned' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setEditingUser(user); setFormData({ name: user.name, email: user.email, credits: user.credits, plan: user.plan, status: user.status }); setShowUserModal(true); }}
                              className="p-1 hover:text-blue-400"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleBanToggle(user)} className="p-1 hover:text-yellow-400">
                              <Ban size={16} />
                            </button>
                            <button onClick={() => setDeleteConfirm(user.id)} className="p-1 hover:text-red-400">
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
          </motion.div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass p-4 rounded-xl"><div className="text-gray-400 text-sm">Total Users</div><div className="text-3xl font-bold">{totalUsers}</div></div>
              <div className="glass p-4 rounded-xl"><div className="text-gray-400 text-sm">Active Users</div><div className="text-3xl font-bold text-green-400">{activeUsers}</div></div>
              <div className="glass p-4 rounded-xl"><div className="text-gray-400 text-sm">Banned Users</div><div className="text-3xl font-bold text-red-400">{bannedUsers}</div></div>
              <div className="glass p-4 rounded-xl"><div className="text-gray-400 text-sm">Total Credits</div><div className="text-3xl font-bold text-purple-400">{totalCredits}</div></div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-xl"><h3 className="text-lg font-semibold mb-4">Plan Distribution</h3><div className="space-y-2"><div>Free: {freeUsers}</div><div>Pro: {proUsers}</div><div>Team: {teamUsers}</div></div></div>
              <div className="glass p-6 rounded-xl"><h3 className="text-lg font-semibold mb-4">Top 5 by Credits</h3>{topUsersByCredits.map((u,i)=> <div key={i} className="flex justify-between py-1 border-b border-white/10"><span>{u.name}</span><span className="font-mono">{u.credits}</span></div>)}</div>
            </div>
          </motion.div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-6 rounded-xl max-w-lg">
            <h3 className="text-xl font-semibold mb-4">Admin Credentials</h3>
            <div className="space-y-2"><p><strong>Email:</strong> superadmin@bookify.ai</p><p><strong>Password:</strong> bookify@2025</p></div>
            <div className="mt-6 pt-4 border-t border-white/10"><p className="text-gray-400 text-sm">This dashboard manages Firestore 'users' collection in real time.</p></div>
          </motion.div>
        )}
      </div>

      {/* Modals (Add/Edit User) */}
      <AnimatePresence>
        {showUserModal && (
          <motion.div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass p-6 rounded-xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">{editingUser ? 'Edit User' : 'Add User'}</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Name" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full px-4 py-2 glass rounded-lg text-white" />
                <input type="email" placeholder="Email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} className="w-full px-4 py-2 glass rounded-lg text-white" />
                <input type="number" placeholder="Credits" value={formData.credits} onChange={e=>setFormData({...formData, credits:parseInt(e.target.value)})} className="w-full px-4 py-2 glass rounded-lg text-white" />
                <select value={formData.plan} onChange={e=>setFormData({...formData, plan:e.target.value as any})} className="w-full px-4 py-2 glass rounded-lg text-white"><option value="free">Free</option><option value="pro">Pro</option><option value="team">Team</option></select>
                <select value={formData.status} onChange={e=>setFormData({...formData, status:e.target.value as any})} className="w-full px-4 py-2 glass rounded-lg text-white"><option value="active">Active</option><option value="inactive">Inactive</option><option value="banned">Banned</option></select>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={()=>setShowUserModal(false)} className="flex-1 py-2 glass rounded-lg">Cancel</button>
                <button onClick={handleSaveUser} disabled={modalLoading} className="flex-1 py-2 bg-purple-600 rounded-lg">{modalLoading ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </motion.div>
        )}

        {showCreditsModal && creditsUser && (
          <motion.div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass p-6 rounded-xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-2">Adjust Credits: {creditsUser.name}</h3>
              <p className="text-gray-400 mb-4">Current: {creditsUser.credits}</p>
              <div className="flex gap-2 mb-4">
                {['set','add','subtract'].map(mode => <button key={mode} onClick={()=>setCreditAdjustment({...creditAdjustment, mode})} className={`px-3 py-1 rounded ${creditAdjustment.mode===mode?'bg-purple-600':'glass'}`}>{mode}</button>)}
              </div>
              <input type="number" value={creditAdjustment.value} onChange={e=>setCreditAdjustment({...creditAdjustment, value:parseInt(e.target.value)})} className="w-full px-4 py-2 glass rounded-lg text-white mb-4" placeholder="Amount" />
              <div className="flex gap-3">
                <button onClick={()=>setShowCreditsModal(false)} className="flex-1 py-2 glass rounded-lg">Cancel</button>
                <button onClick={handleAdjustCredits} disabled={modalLoading} className="flex-1 py-2 bg-purple-600 rounded-lg">{modalLoading ? 'Updating...' : 'Update'}</button>
              </div>
            </div>
          </motion.div>
        )}

        {deleteConfirm && (
          <motion.div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass p-6 rounded-xl w-full max-w-sm text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="mb-6">Delete this user permanently?</p>
              <div className="flex gap-3">
                <button onClick={()=>setDeleteConfirm(null)} className="flex-1 py-2 glass rounded-lg">Cancel</button>
                <button onClick={()=>handleDeleteUser(deleteConfirm)} className="flex-1 py-2 bg-red-600 rounded-lg">Delete</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}