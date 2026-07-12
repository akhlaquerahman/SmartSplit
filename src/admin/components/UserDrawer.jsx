import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Calendar, Edit2, CheckCircle2, Shield, AlertTriangle, Wallet, CreditCard, Activity, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const UserDrawer = ({ user, isOpen, onClose, onSave, onBlock, isSaving }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Edit State
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: '',
    role: 'user',
    status: 'active',
    upiId: '',
  });

  const isCreateMode = !user;

  React.useEffect(() => {
    if (isOpen) {
      if (isCreateMode) {
        setIsEditing(true);
        setEditForm({ name: '', email: '', mobile: '', role: 'user', status: 'active', upiId: '' });
      } else {
        setIsEditing(false);
        setEditForm({
          name: user?.name || '',
          email: user?.email || '',
          mobile: user?.mobile || user?.mobileNumber || '',
          role: user?.role || 'user',
          status: user?.status || (user?.isBlocked ? 'suspended' : 'active'),
          upiId: user?.upiId || '',
        });
      }
    }
  }, [isOpen, user, isCreateMode]);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (isCreateMode) {
      onSave('new', editForm);
    } else {
      onSave(user._id, editForm);
    }
    if (!isCreateMode) {
      setIsEditing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-0"
        />
        
        {/* Drawer Panel */}
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-md h-full bg-white dark:bg-[#16181d] border-l border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20">
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{isCreateMode ? 'Create New User' : 'User Details'}</h2>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Hero Section */}
          {!isCreateMode && (
          <div className="p-6 pb-0 flex flex-col items-center">
            <div className="relative">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`} 
                alt={user.name} 
                className="w-24 h-24 rounded-full border-4 border-white dark:border-[#16181d] shadow-lg object-cover"
              />
              <div className={cn(
                "absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white dark:border-[#16181d]",
                user.isOnline ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
              )} />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-4">{user.name}</h3>
            <p className="text-sm font-medium text-slate-500">{user.email}</p>
            
            <div className="flex items-center gap-2 mt-4">
              <span className={cn(
                "px-3 py-1 text-xs font-bold rounded-full uppercase tracking-widest",
                user.role === 'admin' 
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" 
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
              )}>
                {user.role}
              </span>
              <span className={cn(
                "px-3 py-1 text-xs font-bold rounded-full uppercase tracking-widest",
                user.isBlocked 
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400" 
                  : user.isVerified 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
              )}>
                {user.isBlocked ? 'Suspended' : user.isVerified ? 'Verified' : 'Pending'}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 w-full mt-6 pb-6 border-b border-slate-100 dark:border-slate-800/60">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2",
                  isEditing 
                    ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" 
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                )}
              >
                <Edit2 size={14} /> {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
              <button 
                onClick={() => onBlock(user._id, user.isBlocked)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2",
                  user.isBlocked 
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20" 
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                )}
              >
                {user.isBlocked ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} 
                {user.isBlocked ? 'Restore Access' : 'Suspend Account'}
              </button>
            </div>
          </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {!isEditing && user ? (
              <div className="space-y-6">
                {/* Contact Info */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Contact Information</h4>
                  <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 shadow-sm"><Mail size={14} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 shadow-sm"><Phone size={14} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.mobile || user.mobileNumber || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 shadow-sm"><Calendar size={14} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Joined</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Financial Details</h4>
                  <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 shadow-sm"><Wallet size={14} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">UPI ID</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.upiId || 'Not connected'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Stats */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Platform Activity</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 text-center">
                      <p className="text-2xl font-black text-slate-900 dark:text-white">12</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Total Groups</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 text-center">
                      <p className="text-2xl font-black text-slate-900 dark:text-white">45</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Expenses</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Form */
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-500/20 mb-6 flex items-start gap-3">
                  <Shield size={16} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                    You are editing this user's core profile. Changes made here will take effect immediately across the platform.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                  <input
                    type="text"
                    name="mobile"
                    value={editForm.mobile}
                    onChange={handleEditChange}
                    placeholder="+1 234 567 890"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">UPI ID</label>
                  <input
                    type="text"
                    name="upiId"
                    value={editForm.upiId}
                    onChange={handleEditChange}
                    placeholder="username@bank"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Role</label>
                    <select
                      name="role"
                      value={editForm.role}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions (Only when editing) */}
          {isEditing && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#16181d]">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {isSaving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><Save size={16} /> {isCreateMode ? 'Create User' : 'Save Changes'}</>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UserDrawer;
