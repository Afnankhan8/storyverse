/**
 * SettingsPage — Full premium settings with all tabs
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, Bell, Palette, Shield, Globe,
  Eye, EyeOff, CheckCircle2, AlertCircle, LogOut, Trash2,
  Camera, ChevronRight, Sun, Moon, Monitor, Languages,
  Save, Loader2
} from 'lucide-react';
import { updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../firebase';
import AppShell from '../components/AppShell';

interface Props { user?: any; onLogout?: () => void; }

type TabId = 'profile' | 'security' | 'notifications' | 'appearance' | 'privacy' | 'language';

const TABS = [
  { id: 'profile' as TabId,       label: 'Profile',        icon: User,     desc: 'Name, bio, photo' },
  { id: 'security' as TabId,      label: 'Security',       icon: Shield,   desc: 'Password, sessions' },
  { id: 'notifications' as TabId, label: 'Notifications',  icon: Bell,     desc: 'Email, push alerts' },
  { id: 'appearance' as TabId,    label: 'Appearance',     icon: Palette,  desc: 'Theme, font' },
  { id: 'privacy' as TabId,       label: 'Privacy',        icon: Eye,      desc: 'Visibility, data' },
  { id: 'language' as TabId,      label: 'Language',       icon: Languages,desc: 'Locale settings' },
];

export default function SettingsPage({ user, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [showCurPw, setShowCurPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  const [notifPrefs, setNotifPrefs] = useState({
    newFollower: true, newLike: true, newReview: true, weeklyDigest: false,
    collaborationInvite: true, promotions: false, comments: true,
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: true, showEmail: false, showBooks: true, allowFollows: true,
  });

  const showToast = (msg: string, type: 'success' | 'error', setter: (m: string) => void, clear: (m: string) => void) => {
    setter(msg);
    setTimeout(() => clear(''), 4000);
  };

  const handleSaveProfile = async () => {
    setSaving(true); setSaveMsg(''); setSaveErr('');
    try {
      if (auth.currentUser) await updateProfile(auth.currentUser, { displayName });
      showToast('Profile updated successfully!', 'success', setSaveMsg, setSaveMsg);
    } catch { setSaveErr('Failed to update profile. Please try again.'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) { setPwErr('Please fill in all fields.'); return; }
    if (newPw.length < 8) { setPwErr('New password must be at least 8 characters.'); return; }
    setPwLoading(true); setPwMsg(''); setPwErr('');
    try {
      const fireUser = auth.currentUser;
      if (!fireUser?.email) throw new Error('No user');
      const cred = EmailAuthProvider.credential(fireUser.email, currentPw);
      await reauthenticateWithCredential(fireUser, cred);
      await updatePassword(fireUser, newPw);
      setPwMsg('Password updated successfully!');
      setCurrentPw(''); setNewPw('');
      setTimeout(() => setPwMsg(''), 4000);
    } catch (e: any) {
      setPwErr(e.code === 'auth/wrong-password' ? 'Current password is incorrect.' : 'Failed to update password.');
    } finally { setPwLoading(false); }
  };

  const Alert = ({ msg, type }: { msg: string; type: 'success' | 'error' }) => (
    <AnimatePresence>
      {msg && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border ${type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {type === 'success' ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" /> : <AlertCircle size={16} className="text-red-500 flex-shrink-0" />}
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`w-11 h-6 rounded-full transition-all duration-200 relative flex-shrink-0 ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}>
      <div className={`w-4.5 h-4.5 bg-white rounded-full shadow absolute top-0.5 transition-all duration-200 ${checked ? 'left-[22px]' : 'left-0.5'}`} style={{ width: 18, height: 18 }} />
    </button>
  );

  return (
    <AppShell user={user} onLogout={onLogout}>
      <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your account, security, and preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar Nav */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-all border-b border-slate-50 last:border-0 text-left group ${activeTab === tab.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${activeTab === tab.id ? 'bg-blue-600' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                    <tab.icon size={15} className={activeTab === tab.id ? 'text-white' : 'text-slate-500'} />
                  </div>
                  <div className="min-w-0">
                    <div className={`font-semibold truncate ${activeTab === tab.id ? 'text-blue-700' : 'text-slate-700'}`}>{tab.label}</div>
                    <div className="text-xs text-slate-400 truncate">{tab.desc}</div>
                  </div>
                  {activeTab === tab.id && <ChevronRight size={14} className="text-blue-400 ml-auto flex-shrink-0" />}
                </button>
              ))}
              <div className="p-3 border-t border-slate-100">
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut size={16} className="flex-shrink-0" /> Sign Out
                </button>
              </div>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

              {/* PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-5">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="font-bold text-slate-900 text-lg mb-5">Public Profile</h2>

                    {/* Avatar */}
                    <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-50">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-500/20">
                          {(user?.name || 'U')[0].toUpperCase()}
                        </div>
                        <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg text-white hover:bg-blue-700 transition-colors">
                          <Camera size={13} />
                        </button>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-lg">{user?.name}</div>
                        <div className="text-sm text-slate-500">{user?.email}</div>
                        <button className="text-xs text-blue-600 font-medium mt-1.5 hover:text-blue-700 transition-colors">Upload photo</button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Alert msg={saveMsg} type="success" />
                      <Alert msg={saveErr} type="error" />

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Display Name</label>
                        <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <div className="relative">
                          <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="email" value={user?.email || ''} disabled
                            className="w-full pl-9 border border-slate-100 rounded-xl px-4 py-3 text-sm bg-slate-50 text-slate-400 cursor-not-allowed" />
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5">Email address cannot be changed.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Author Bio</label>
                        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                          placeholder="Tell readers about yourself, your writing style, and your inspirations…"
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all" />
                        <p className="text-xs text-slate-400 mt-1">{bio.length}/300 characters</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Website</label>
                        <div className="relative">
                          <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="url" value={website} onChange={e => setWebsite(e.target.value)}
                            placeholder="https://yourwebsite.com"
                            className="w-full pl-9 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                        </div>
                      </div>
                      <button onClick={handleSaveProfile} disabled={saving}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-60 shadow-md shadow-blue-600/20">
                        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        {saving ? 'Saving…' : 'Save Profile'}
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
                    <h2 className="font-bold text-red-700 mb-3 flex items-center gap-2"><Trash2 size={16} />Danger Zone</h2>
                    <p className="text-sm text-slate-500 mb-4 leading-relaxed">Permanently delete your account and all associated data. This action cannot be undone and all your books, notes, and analytics will be permanently lost.</p>
                    <button className="flex items-center gap-2 border border-red-300 text-red-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors">
                      <Trash2 size={15} /> Delete My Account
                    </button>
                  </div>
                </div>
              )}

              {/* SECURITY */}
              {activeTab === 'security' && (
                <div className="space-y-5">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="font-bold text-slate-900 text-lg mb-5 flex items-center gap-2"><Lock size={18} className="text-blue-600" />Change Password</h2>
                    <Alert msg={pwMsg} type="success" />
                    <Alert msg={pwErr} type="error" />
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                        <div className="relative">
                          <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type={showCurPw ? 'text' : 'password'} value={currentPw}
                            onChange={e => { setCurrentPw(e.target.value); setPwErr(''); }}
                            placeholder="Enter current password"
                            className="w-full pl-9 pr-10 border border-slate-200 rounded-xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                          <button onClick={() => setShowCurPw(!showCurPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showCurPw ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                        <div className="relative">
                          <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type={showNewPw ? 'text' : 'password'} value={newPw}
                            onChange={e => { setNewPw(e.target.value); setPwErr(''); }}
                            placeholder="Min. 8 characters"
                            className="w-full pl-9 pr-10 border border-slate-200 rounded-xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                          <button onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        {newPw && (
                          <div className="flex gap-1 mt-2">
                            {[1,2,3,4].map(i => (
                              <div key={i} className={`flex-1 h-1 rounded-full transition-all ${newPw.length >= i * 2 ? (newPw.length >= 8 ? 'bg-emerald-500' : 'bg-amber-400') : 'bg-slate-200'}`} />
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={handleChangePassword} disabled={pwLoading}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-60 shadow-md">
                        {pwLoading ? <Loader2 size={15} className="animate-spin" /> : <Shield size={15} />}
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="font-bold text-slate-900 mb-4">Active Sessions</h2>
                    <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Current Browser</p>
                        <p className="text-xs text-slate-500 mt-0.5">Active now · {new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
                      </div>
                      <span className="text-xs bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-full">Current</span>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="font-bold text-slate-900 text-lg mb-5 flex items-center gap-2"><Bell size={18} className="text-blue-600" />Notification Preferences</h2>
                  <div className="space-y-0.5">
                    {[
                      { key: 'newFollower', label: 'New Followers', desc: 'When someone starts following you' },
                      { key: 'newLike', label: 'Likes & Reactions', desc: 'When someone likes your book' },
                      { key: 'newReview', label: 'Reviews & Ratings', desc: 'When someone leaves a review on your book' },
                      { key: 'collaborationInvite', label: 'Collaboration Invites', desc: 'When you receive a collaboration request' },
                      { key: 'comments', label: 'Comments & Replies', desc: 'New comments on your content' },
                      { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'A weekly summary of your performance' },
                      { key: 'promotions', label: 'Product Updates', desc: 'New features and platform announcements' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                        <Toggle
                          checked={notifPrefs[item.key as keyof typeof notifPrefs]}
                          onChange={() => setNotifPrefs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* APPEARANCE */}
              {activeTab === 'appearance' && (
                <div className="space-y-5">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="font-bold text-slate-900 text-lg mb-5">Theme</h2>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'light' as const, label: 'Light', icon: Sun, preview: 'bg-white border-2' },
                        { id: 'dark' as const, label: 'Dark', icon: Moon, preview: 'bg-slate-900 border-2' },
                        { id: 'system' as const, label: 'System', icon: Monitor, preview: 'bg-gradient-to-br from-white to-slate-900 border-2' },
                      ].map(t => (
                        <button key={t.id} onClick={() => setTheme(t.id)}
                          className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === t.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                          {theme === t.id && <div className="absolute top-2 right-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>}
                          <div className={`w-12 h-8 rounded-lg ${t.preview} ${theme === t.id ? 'border-blue-300' : 'border-slate-200'}`} />
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                            <t.icon size={14} />{t.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="font-bold text-slate-900 mb-4">Reading Font Size</h2>
                    <div className="flex gap-3">
                      {(['small', 'medium', 'large'] as const).map(size => (
                        <button key={size} onClick={() => setFontSize(size)}
                          className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold capitalize transition-all ${fontSize === size ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          {size === 'small' ? 'Aa' : size === 'medium' ? 'Aa' : 'Aa'}
                          <div className={`mt-1 text-xs font-normal ${fontSize === size ? 'text-blue-500' : 'text-slate-400'}`}>{size}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PRIVACY */}
              {activeTab === 'privacy' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="font-bold text-slate-900 text-lg mb-5 flex items-center gap-2"><Eye size={18} className="text-blue-600" />Privacy Settings</h2>
                  <div className="space-y-0.5">
                    {[
                      { key: 'profilePublic', label: 'Public Profile', desc: 'Allow anyone to view your author profile page' },
                      { key: 'showBooks', label: 'Show My Books', desc: 'Display your published books on your profile' },
                      { key: 'allowFollows', label: 'Allow Follows', desc: 'Let other users follow you and get updates' },
                      { key: 'showEmail', label: 'Show Email', desc: 'Display your email on your public profile' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                        <Toggle
                          checked={privacy[item.key as keyof typeof privacy]}
                          onChange={() => setPrivacy(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LANGUAGE */}
              {activeTab === 'language' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="font-bold text-slate-900 text-lg mb-5 flex items-center gap-2"><Languages size={18} className="text-blue-600" />Language & Region</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Interface Language</label>
                      <select className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700">
                        <option>English (US)</option>
                        <option>English (UK)</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                        <option>Japanese</option>
                        <option>Arabic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Date Format</label>
                      <select className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700">
                        <option>MM/DD/YYYY</option>
                        <option>DD/MM/YYYY</option>
                        <option>YYYY-MM-DD</option>
                      </select>
                    </div>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20">
                      <Save size={15} /> Save Preferences
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
