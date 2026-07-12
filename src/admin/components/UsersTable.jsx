import React, { useState } from 'react';
import { MoreVertical, Shield, ChevronDown, Check, X, ShieldAlert, FileText, UserCircle, Edit, KeyRound, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const StatusBadge = ({ isVerified, isBlocked }) => {
  if (isBlocked) return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Suspended</span>;
  if (isVerified) return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Verified</span>;
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending</span>;
};

const RoleBadge = ({ role }) => {
  if (role === 'admin') {
    return <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400"><Shield size={12} /> Admin</span>;
  }
  return <span className="text-xs font-medium text-slate-600 dark:text-slate-400">User</span>;
};

const UsersTable = ({ users, selectedUsers, setSelectedUsers, onRowClick, onResetPassword, onSuspendUser, onDeleteUser }) => {
  const [activeMenuId, setActiveMenuId] = useState(null);

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u._id));
    }
  };

  const toggleSelectUser = (e, id) => {
    e.stopPropagation();
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(userId => userId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-[#16181d] rounded-[2rem] border border-slate-200 dark:border-slate-800/60 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[900px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/60">
              <th className="py-4 pl-6 pr-3 sticky left-0 z-10 bg-slate-50/50 dark:bg-slate-900/40 w-12">
                <div 
                  className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors",
                    selectedUsers.length === users.length && users.length > 0 
                      ? "bg-blue-600 border-blue-600 text-white" 
                      : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-transparent"
                  )}
                  onClick={toggleSelectAll}
                >
                  <Check size={14} />
                </div>
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-600 flex items-center gap-1">
                User <ChevronDown size={14} />
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Contact
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Role
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Status
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden lg:table-cell">
                Joined
              </th>
              <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <UserCircle size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-bold">No users found</p>
                    <p className="text-xs mt-1">Try adjusting your filters or search query.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isSelected = selectedUsers.includes(user._id);
                return (
                  <tr 
                    key={user._id} 
                    onClick={() => onRowClick(user)}
                    className={cn(
                      "group cursor-pointer transition-colors",
                      isSelected 
                        ? "bg-blue-50/50 dark:bg-blue-500/5" 
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    )}
                  >
                    <td className="py-3 pl-6 pr-3 sticky left-0 z-10" onClick={(e) => e.stopPropagation()}>
                      <div 
                        className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors mt-2",
                          isSelected 
                            ? "bg-blue-600 border-blue-600 text-white" 
                            : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-transparent hover:border-slate-400"
                        )}
                        onClick={(e) => toggleSelectUser(e, user._id)}
                      >
                        <Check size={14} />
                      </div>
                    </td>
                    
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`} 
                            alt={user.name || 'User'} 
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                          />
                          {user.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#16181d] rounded-full" />
                          )}
                        </div>
                        <div className="flex flex-col max-w-[180px]">
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</span>
                          <span className="text-[11px] text-slate-500 truncate">ID: {user._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-3 px-3">
                      <div className="flex flex-col max-w-[180px]">
                        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 truncate">{user.email}</span>
                        <span className="text-[11px] text-slate-500 truncate">{user.mobile || user.mobileNumber || 'No Phone'}</span>
                      </div>
                    </td>
                    
                    <td className="py-3 px-3">
                      <RoleBadge role={user.role} />
                    </td>
                    
                    <td className="py-3 px-3">
                      <StatusBadge isVerified={user.isVerified} isBlocked={user.isBlocked} />
                    </td>
                    
                    <td className="py-3 px-3 hidden lg:table-cell">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-medium text-slate-700 dark:text-slate-300">
                          {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase">
                          {new Date(user.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-3 px-6 text-right relative" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={(e) => toggleMenu(e, user._id)}
                        className={cn(
                          "p-2 rounded-xl transition-colors",
                          activeMenuId === user._id 
                            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white" 
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-50 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                        )}
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      <AnimatePresence>
                        {activeMenuId === user._id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.1 }}
                            className="absolute right-6 top-10 w-48 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700/60 z-50 overflow-hidden py-1"
                          >
                            <button onClick={() => { onRowClick(user); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left">
                              <UserCircle size={14} /> View Profile
                            </button>
                            <button onClick={() => { onRowClick(user); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left">
                              <Edit size={14} /> Edit User
                            </button>
                            <button onClick={() => { onResetPassword(user._id); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left">
                              <KeyRound size={14} /> Reset Password
                            </button>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                            <button onClick={() => { onSuspendUser(user._id, user.isBlocked); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:text-amber-500 dark:hover:bg-amber-500/10 transition-colors text-left">
                              <ShieldAlert size={14} /> {user.isBlocked ? 'Restore Access' : 'Suspend User'}
                            </button>
                            <button onClick={() => { onDeleteUser(user._id); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-500 dark:hover:bg-rose-500/10 transition-colors text-left">
                              <Trash2 size={14} /> Delete User
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Click outside to close menu overlay */}
      {activeMenuId && (
        <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
      )}
    </div>
  );
};

export default UsersTable;
