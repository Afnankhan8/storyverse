/**
 * Collaboration — Real-time collaboration system
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Mail, Check, X, Crown, Eye, Edit3, Shield,
  MessageSquare, Clock, Send, BookOpen, Circle, ChevronRight,
  History, Settings, UserPlus, Reply, ThumbsUp, MoreVertical,
  GitBranch, AlertCircle, CheckCircle2, Loader2
} from 'lucide-react';
import AppShell from '../components/AppShell';

interface Props { user?: any; onLogout?: () => void; }

type Role = 'admin' | 'editor' | 'viewer';

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  online: boolean;
  avatar: string;
  color: string;
  joinedAt: Date;
}

interface Comment {
  id: string;
  author: string;
  authorColor: string;
  text: string;
  time: Date;
  page?: number;
  replies: { id: string; author: string; text: string; time: Date }[];
  likes: number;
  liked: boolean;
}

interface Room {
  id: string;
  title: string;
  book: string;
  members: Member[];
  comments: Comment[];
  lastActivity: Date;
}

const ROLE_CONFIG: Record<Role, { label: string; icon: typeof Crown; color: string; bg: string }> = {
  admin: { label: 'Admin', icon: Crown, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  editor: { label: 'Editor', icon: Edit3, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  viewer: { label: 'Viewer', icon: Eye, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
};

const MOCK_ROOMS: Room[] = [
  {
    id: '1',
    title: 'Main Collab Room',
    book: 'The Lost Chronicles',
    lastActivity: new Date(Date.now() - 300000),
    members: [
      {
        id: '1',
        name: 'You',
        email: 'you@email.com',
        role: 'admin',
        online: true,
        avatar: 'Y',
        color: 'from-blue-500 to-violet-600',
        joinedAt: new Date()
      },
      { id: '2', name: 'Aria Chen', email: 'aria@email.com', role: 'editor', online: true, avatar: 'A', color: 'from-pink-500 to-rose-500', joinedAt: new Date() },
      { id: '3', name: 'Marcus Webb', email: 'marcus@email.com', role: 'viewer', online: false, avatar: 'M', color: 'from-emerald-500 to-cyan-500', joinedAt: new Date() },
    ],
    comments: [
      {
        id: 'c1', author: 'Aria Chen', authorColor: 'from-pink-500 to-rose-500',
        text: 'The opening scene in Chapter 3 is brilliant! The pacing feels perfect.', time: new Date(Date.now() - 3600000),
        page: 42, likes: 3, liked: false,
        replies: [{ id: 'r1', author: 'You', text: 'Thank you! I spent a lot of time on that transition.', time: new Date(Date.now() - 3000000) }]
      },
      {
        id: 'c2', author: 'Marcus Webb', authorColor: 'from-emerald-500 to-cyan-500',
        text: 'Suggest renaming "The Map" to "The Cartographer\'s Secret" — feels more mysterious.', time: new Date(Date.now() - 7200000),
        page: 15, likes: 1, liked: true,
        replies: []
      },
    ],
  },
];

function timeAgo(d: Date) {
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function Collaboration({ user, onLogout }: Props) {
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [activeRoom, setActiveRoom] = useState<Room>(MOCK_ROOMS[0]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('editor');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'members' | 'history'>('comments');

  const sendInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) return;
    setInviting(true);
    await new Promise(r => setTimeout(r, 1000));
    setInviting(false);
    setInviteSuccess(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
    setTimeout(() => setInviteSuccess(''), 3000);
  };

  const postComment = () => {
    if (!newComment.trim()) return;
    const c: Comment = {
      id: Date.now().toString(),
      author: user?.name || 'You',
      authorColor: 'from-blue-500 to-violet-600',
      text: newComment,
      time: new Date(),
      likes: 0,
      liked: false,
      replies: [],
    };
    setActiveRoom(r => ({ ...r, comments: [c, ...r.comments] }));
    setNewComment('');
  };

  const postReply = (commentId: string) => {
    if (!replyText.trim()) return;
    setActiveRoom(r => ({
      ...r,
      comments: r.comments.map(c => c.id === commentId
        ? { ...c, replies: [...c.replies, { id: Date.now().toString(), author: user?.name || 'You', text: replyText, time: new Date() }] }
        : c
      )
    }));
    setReplyTo(null);
    setReplyText('');
  };

  const toggleLike = (commentId: string) => {
    setActiveRoom(r => ({
      ...r,
      comments: r.comments.map(c => c.id === commentId
        ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
        : c
      )
    }));
  };

  const changeRole = (memberId: string, role: Role) => {
    setActiveRoom(r => ({
      ...r,
      members: r.members.map(m => m.id === memberId ? { ...m, role } : m)
    }));
  };

  const removeMember = (memberId: string) => {
    setActiveRoom(r => ({ ...r, members: r.members.filter(m => m.id !== memberId) }));
  };

  const onlineCount = activeRoom.members.filter(m => m.online).length;

  return (
    <AppShell user={user} onLogout={onLogout}>
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 lg:p-8 flex flex-col">
        <div className="max-w-[1600px] w-full mx-auto flex-1 flex bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] max-h-[calc(100vh-8rem)]">

          {/* Rooms Sidebar */}
          <div className="w-72 flex-shrink-0 border-r border-slate-200 bg-slate-50/50 flex flex-col">
            <div className="p-5 border-b border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[18px] font-black text-slate-900 tracking-tight">Collab Rooms</h2>
              <button className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {rooms.map(room => (
              <div key={room.id} onClick={() => setActiveRoom(room)}
                className={`p-3 rounded-xl cursor-pointer mb-1.5 transition-all ${activeRoom.id === room.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen size={13} color="#fff" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{room.title}</p>
                    <p className="text-xs text-slate-400 truncate">{room.book}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-1">
                    {room.members.slice(0, 3).map(m => (
                      <div key={m.id} className={`w-5 h-5 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-[9px] font-black border border-white`}>{m.avatar}</div>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">{timeAgo(room.lastActivity)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

          {/* Main Collab Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">

            {/* Room Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between flex-shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-[24px] font-black text-slate-900 tracking-tight">{activeRoom.title}</h1>
                <span className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
                  <Circle size={6} className="fill-emerald-500 text-emerald-500" /> {onlineCount} online
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                <BookOpen size={13} />{activeRoom.book} · {activeRoom.members.length} members
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Live presence avatars */}
              <div className="flex -space-x-1.5 mr-2">
                {activeRoom.members.filter(m => m.online).map(m => (
                  <div key={m.id} title={m.name} className={`relative w-8 h-8 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-xs font-black border-2 border-white`}>
                    {m.avatar}
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-1.5 bg-blue-600 text-white px-3.5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20">
                <UserPlus size={14} /> Invite
              </button>
            </div>
          </div>

            {/* Tabs */}
            <div className="bg-white border-b border-slate-200 px-8 flex gap-2">
              {(['comments', 'members', 'history'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-[14px] font-semibold capitalize transition-all border-b-2 -mb-px ${activeTab === tab ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-800'}`}>
                {tab === 'comments' && <span className="flex items-center gap-1.5"><MessageSquare size={14} /> Comments <span className="bg-blue-100 text-blue-600 text-xs px-1.5 rounded-md">{activeRoom.comments.length}</span></span>}
                {tab === 'members' && <span className="flex items-center gap-1.5"><Users size={14} /> Members ({activeRoom.members.length})</span>}
                {tab === 'history' && <span className="flex items-center gap-1.5"><History size={14} /> Version History</span>}
              </button>
            ))}
          </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">

            {activeTab === 'comments' && (
              <>
                {/* Post comment */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <textarea value={newComment} onChange={e => setNewComment(e.target.value)} rows={3}
                    placeholder="Add a comment, suggest an edit, or start a discussion…"
                    className="w-full text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none resize-none bg-transparent" />
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                    <p className="text-xs text-slate-400">Tip: You can mention a page number for context</p>
                    <button onClick={postComment} disabled={!newComment.trim()}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-40">
                      <Send size={14} /> Post
                    </button>
                  </div>
                </div>

                {/* Comments list */}
                {activeRoom.comments.map(comment => (
                  <div key={comment.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${comment.authorColor} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>
                        {comment.author[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold text-slate-900">{comment.author}</span>
                          {comment.page && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">p.{comment.page}</span>}
                          <span className="text-xs text-slate-400 ml-auto">{timeAgo(comment.time)}</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{comment.text}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <button onClick={() => toggleLike(comment.id)} className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${comment.liked ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'}`}>
                            <ThumbsUp size={13} className={comment.liked ? 'fill-current' : ''} /> {comment.likes}
                          </button>
                          <button onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors">
                            <Reply size={13} /> Reply
                          </button>
                          <button className="flex items-center gap-1.5 text-xs font-medium text-amber-500 hover:text-amber-600 transition-colors ml-auto">
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-600 transition-colors">
                            <X size={13} /> Reject
                          </button>
                        </div>

                        {/* Replies */}
                        {comment.replies.length > 0 && (
                          <div className="mt-3 pl-4 border-l-2 border-slate-100 space-y-3">
                            {comment.replies.map(reply => (
                              <div key={reply.id} className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                                  {reply.author[0]}
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-slate-900">{reply.author}</span>
                                  <span className="text-xs text-slate-400 ml-2">{timeAgo(reply.time)}</span>
                                  <p className="text-xs text-slate-700 mt-0.5">{reply.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply input */}
                        <AnimatePresence>
                          {replyTo === comment.id && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                              className="mt-3 flex gap-2">
                              <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') postReply(comment.id); }}
                                placeholder="Write a reply…"
                                className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                              <button onClick={() => postReply(comment.id)} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all">
                                <Send size={12} />
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'members' && (
              <>
                {/* Invite */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><UserPlus size={16} className="text-blue-600" />Invite Collaborator</h3>
                  {inviteSuccess && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 text-sm text-emerald-700">
                      <CheckCircle2 size={16} className="text-emerald-500" />{inviteSuccess}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') sendInvite(); }}
                        placeholder="colleague@email.com"
                        className="w-full pl-9 border border-slate-200 rounded-xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <select value={inviteRole} onChange={e => setInviteRole(e.target.value as Role)}
                      className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button onClick={sendInvite} disabled={inviting}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center gap-2 shadow-md shadow-blue-600/20">
                      {inviting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send
                    </button>
                  </div>
                </div>

                {/* Members list */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-50">
                    <h3 className="font-bold text-slate-900">Members ({activeRoom.members.length})</h3>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {activeRoom.members.map(member => {
                      const rc = ROLE_CONFIG[member.role];
                      return (
                        <div key={member.id} className="flex items-center gap-4 px-5 py-4">
                          <div className="relative">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-sm font-black flex-shrink-0`}>
                              {member.avatar}
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${member.online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">{member.name}</span>
                              {member.id === '1' && <span className="text-xs text-slate-400">(you)</span>}
                            </div>
                            <p className="text-xs text-slate-400">{member.email}</p>
                          </div>
                          <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl border ${rc.bg} ${rc.color}`}>
                            <rc.icon size={11} />{rc.label}
                          </span>
                          {member.id !== '1' && (
                            <div className="flex items-center gap-1">
                              <select value={member.role} onChange={e => changeRole(member.id, e.target.value as Role)}
                                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                                <option value="admin">Admin</option>
                              </select>
                              <button onClick={() => removeMember(member.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                <X size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-50">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2"><History size={16} className="text-blue-600" />Version History</h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {[
                    { v: 'v1.4', author: 'Aria Chen', desc: 'Revised Chapter 3 opening paragraph', time: '2h ago', color: 'from-pink-500 to-rose-500' },
                    { v: 'v1.3', author: 'You', desc: 'Added character backstory for Elena', time: '6h ago', color: 'from-blue-500 to-violet-600' },
                    { v: 'v1.2', author: 'Marcus Webb', desc: 'Fixed typos in Chapter 1-2', time: '1d ago', color: 'from-emerald-500 to-cyan-500' },
                    { v: 'v1.1', author: 'You', desc: 'Initial draft uploaded', time: '3d ago', color: 'from-blue-500 to-violet-600' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-[10px] font-black flex-shrink-0`}>
                        {item.author[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{item.v}</span>
                          <span className="text-sm font-semibold text-slate-900 truncate">{item.desc}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{item.author} · {item.time}</p>
                      </div>
                      <button className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex-shrink-0">Restore</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </AppShell>
  );
}
