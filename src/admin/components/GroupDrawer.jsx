import React, { useState, useEffect, useMemo } from 'react';
import { X, Users, Receipt, Calendar, Activity, Shield, Settings, ExternalLink, Archive, MapPin, Trash2, Plus, ArrowUpRight, ArrowDownRight, CheckCircle2, MoreVertical, Loader2, ArrowRight, Search, ChevronDown, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import api from '../../utils/api';

const GroupDrawer = ({ group, isOpen, onClose, onDelete }) => {
  const isCreateMode = !group;
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', category: 'General', adminId: '', members: [] });
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [allUsers, setAllUsers] = useState([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const navigate = useNavigate();

  // Reset state when opening and fetch details
  useEffect(() => {
    if (isOpen) {
      if (isCreateMode) {
        setIsEditing(true);
        setFormData({ name: '', description: '', category: 'General', adminId: '', members: [] });
        setExpenses([]);
        setSettlements([]);
      } else {
        setIsEditing(false);
        setFormData({ 
          name: group.name, 
          description: group.description, 
          category: group.category || 'General',
          adminId: group.createdBy?._id || group.createdBy || '',
          members: (group.members || []).map(m => m.user?._id || m.user || m._id)
        });
        fetchGroupDetails(group._id);
      }
      setActiveTab('overview');
    }
  }, [isOpen, group, isCreateMode]);

  const fetchGroupDetails = async (groupId) => {
    setIsLoadingDetails(true);
    try {
      const res = await api.get(`/admin/groups/${groupId}`);
      setExpenses(res.data.expenses || []);
      setSettlements(res.data.settlements || []);
    } catch (err) {
      console.error("Failed to fetch group details", err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (isOpen && (isCreateMode || isEditing) && allUsers.length === 0) {
      const fetchUsers = async () => {
        try {
          const res = await api.get('/admin/users?limit=1000');
          setAllUsers(res.data.users || res.data || []);
        } catch(err) {
          console.error(err);
        }
      };
      fetchUsers();
    }
  }, [isOpen, isCreateMode, isEditing, allUsers.length]);

  const filteredAdmins = useMemo(() => allUsers.filter(u => u.name?.toLowerCase().includes(adminSearch.toLowerCase()) || u.email?.toLowerCase().includes(adminSearch.toLowerCase())), [allUsers, adminSearch]);
  const filteredMembers = useMemo(() => allUsers.filter(u => u.name?.toLowerCase().includes(memberSearch.toLowerCase()) || u.email?.toLowerCase().includes(memberSearch.toLowerCase())), [allUsers, memberSearch]);
  const selectedAdminUser = allUsers.find(u => u._id === formData.adminId);

  const toggleMember = (userId) => {
    if (formData.members.includes(userId)) {
      setFormData({ ...formData, members: formData.members.filter(id => id !== userId) });
    } else {
      setFormData({ ...formData, members: [...formData.members, userId] });
    }
  };


  // Analytics calculations
  const safeGroup = group || {};
  const budget = safeGroup.budget || 25000;
  
  const analytics = useMemo(() => {
    let totalAmt = 0;
    const payerMap = {};
    const memberBalances = {};

    // Initialize member balances
    (safeGroup.members || []).forEach(m => {
      const uid = m.user?._id || m.user || m._id;
      memberBalances[uid] = { 
        paid: 0, 
        share: 0, 
        name: m.user?.name || m.name || 'Unknown', 
        email: m.user?.email || m.email,
        avatar: m.user?.avatar || m.avatar
      };
    });

    expenses.forEach(e => {
      totalAmt += e.amount;
      const pid = e.paidBy?._id || e.paidBy;
      if (pid) {
        payerMap[pid] = (payerMap[pid] || 0) + e.amount;
        if (memberBalances[pid]) memberBalances[pid].paid += e.amount;
      }
      
      (e.splitDetails || []).forEach(s => {
        const uid = s.user?._id || s.user;
        if (uid && memberBalances[uid]) {
          memberBalances[uid].share += s.amount;
        }
      });
    });

    let topPayer = { id: null, amount: -1 };
    let leastPayer = { id: null, amount: Infinity };

    Object.entries(payerMap).forEach(([id, amt]) => {
      if (amt > topPayer.amount) topPayer = { id, amount: amt };
      if (amt < leastPayer.amount) leastPayer = { id, amount: amt };
    });
    
    // If least payer didn't pay anything
    (safeGroup.members || []).forEach(m => {
       const uid = m.user?._id || m.user || m._id;
       if (!payerMap[uid] && 0 < leastPayer.amount) {
           leastPayer = { id: uid, amount: 0 };
       }
    });

    return {
      totalExpenses: totalAmt,
      totalSettlements: settlements.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.amount, 0),
      topPayer: topPayer.id ? memberBalances[topPayer.id]?.name : 'N/A',
      leastPayer: leastPayer.id ? memberBalances[leastPayer.id]?.name : 'N/A',
      balances: memberBalances
    };
  }, [expenses, settlements, safeGroup.members]);

  const progressPercent = Math.min((analytics.totalExpenses / budget) * 100, 100);

  return (
    <AnimatePresence>
      {isOpen && (
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
          className="w-full max-w-[500px] h-full bg-white dark:bg-[#16181d] border-l border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20">
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {isCreateMode ? 'Create Workspace' : 'Workspace Details'}
            </h2>
            <div className="flex items-center gap-2">
              {!isCreateMode && (
                <button 
                  onClick={() => { onClose(); navigate(`/admin/reports?groupId=${safeGroup._id}`); }}
                  className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                  title="View Report"
                >
                  <FileText size={18} />
                  <span className="hidden sm:inline">Report</span>
                </button>
              )}
              <button 
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Group Hero Section */}
          {!isEditing && !isCreateMode && (
            <div className="p-6 pb-0 flex flex-col items-center border-b border-slate-100 dark:border-slate-800/60">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 transform -rotate-3 hover:rotate-0 transition-transform">
                <span className="text-3xl font-black">{safeGroup.name?.charAt(0).toUpperCase()}</span>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 dark:text-white text-center">{safeGroup.name}</h3>
              <p className="text-sm font-medium text-slate-500 mt-1 mb-4 text-center max-w-[350px]">
                {safeGroup.description || 'No description provided for this workspace.'}
              </p>
              
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-widest">
                  {safeGroup.category || 'General'}
                </span>
                <span className={cn(
                  "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest",
                  safeGroup.isArchived 
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" 
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                )}>
                  {safeGroup.isArchived ? 'Archived' : 'Active'}
                </span>
              </div>

              {/* Tabs */}
              <div className="flex items-center justify-center gap-4 w-full mt-2 overflow-x-auto no-scrollbar px-4">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={cn(
                    "pb-3 text-xs font-bold tracking-wide uppercase transition-colors relative whitespace-nowrap",
                    activeTab === 'overview' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  Overview
                  {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />}
                </button>
                <button 
                  onClick={() => setActiveTab('members')}
                  className={cn(
                    "pb-3 text-xs font-bold tracking-wide uppercase transition-colors relative whitespace-nowrap",
                    activeTab === 'members' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  Members ({safeGroup.members?.length || 0})
                  {activeTab === 'members' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />}
                </button>
                <button 
                  onClick={() => setActiveTab('expenses')}
                  className={cn(
                    "pb-3 text-xs font-bold tracking-wide uppercase transition-colors relative whitespace-nowrap",
                    activeTab === 'expenses' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  Expenses
                  {activeTab === 'expenses' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />}
                </button>
                <button 
                  onClick={() => setActiveTab('settlements')}
                  className={cn(
                    "pb-3 text-xs font-bold tracking-wide uppercase transition-colors relative whitespace-nowrap",
                    activeTab === 'settlements' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  Settlements
                  {activeTab === 'settlements' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />}
                </button>
                <button 
                  onClick={() => setActiveTab('activity')}
                  className={cn(
                    "pb-3 text-xs font-bold tracking-wide uppercase transition-colors relative whitespace-nowrap",
                    activeTab === 'activity' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  Activity
                  {activeTab === 'activity' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />}
                </button>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/10">
            {!isEditing && !isCreateMode ? (
              <>
                {activeTab === 'overview' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Workspace Health */}
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Workspace Health</h4>
                      <div className="bg-white dark:bg-[#16181d] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
                        <div className="flex justify-between items-end mb-2">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Budget Utilization</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1 mt-1">
                              ₹{analytics.totalExpenses.toLocaleString()} <span className="text-xs font-medium text-slate-400">/ ₹{budget.toLocaleString()}</span>
                            </p>
                          </div>
                          <span className={cn(
                            "text-xs font-black",
                            progressPercent >= 100 ? "text-rose-500" : progressPercent > 80 ? "text-amber-500" : "text-emerald-500"
                          )}>
                            {progressPercent.toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden my-3">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              progressPercent >= 100 ? "bg-rose-500" : progressPercent > 80 ? "bg-amber-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Expenses</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white">{expenses.length} (₹{analytics.totalExpenses.toLocaleString()})</span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Settlements</span>
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{analytics.totalSettlements.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Top Payer</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{analytics.topPayer}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Least Payer</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{analytics.leastPayer}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Workspace Details</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-[#16181d] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-start gap-3">
                          <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg shrink-0"><Calendar size={16} /></div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created On</p>
                            <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{new Date(safeGroup.createdAt || Date.now()).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="bg-white dark:bg-[#16181d] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-start gap-3">
                          <div className="p-2 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg shrink-0"><Shield size={16} /></div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Owner</p>
                            <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">{safeGroup.createdBy?.name || 'Unknown'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

            {activeTab === 'members' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {isLoadingDetails ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : (
                  (safeGroup.members || []).map((member, i) => {
                    const uid = member.user?._id || member.user || member._id;
                    const bal = analytics.balances[uid] || { paid: 0, share: 0 };
                    const net = bal.paid - bal.share;

                    return (
                      <div key={i} className="bg-white dark:bg-[#16181d] p-3 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={member.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user?.name || member.name || 'User')}&background=random`} 
                              alt="Member"
                              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{member.user?.name || member.name || 'Unknown'}</p>
                                {member.user?._id === safeGroup.createdBy?._id && (
                                  <span className="px-1.5 py-0.5 text-[8px] font-black rounded bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 uppercase tracking-widest">
                                    Owner
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 truncate w-[160px]">{member.user?.email || member.email}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Net Balance</p>
                            <p className={cn(
                              "text-sm font-black flex items-center gap-1 justify-end",
                              net > 0 ? "text-emerald-600 dark:text-emerald-400" : net < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-600 dark:text-slate-400"
                            )}>
                              {net > 0 ? <ArrowUpRight size={14} /> : net < 0 ? <ArrowDownRight size={14} /> : null}
                              ₹{Math.abs(net).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paid</p>
                            <p className="text-xs font-black text-slate-700 dark:text-slate-300 mt-0.5">₹{bal.paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                          <div className="w-px bg-slate-200 dark:bg-slate-800" />
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Share</p>
                            <p className="text-xs font-black text-slate-700 dark:text-slate-300 mt-0.5">₹{bal.share.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'expenses' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {isLoadingDetails ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : expenses.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Receipt size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest">No Expenses</p>
                  </div>
                ) : (
                  expenses.map((expense) => (
                    <div key={expense._id} className="bg-white dark:bg-[#16181d] p-3 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Receipt size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{expense.description}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                            By {expense.paidBy?.name || 'Unknown'} • {new Date(expense.date || expense.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white">₹{expense.amount.toLocaleString()}</p>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 mt-1">
                          {expense.category || 'General'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'settlements' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {isLoadingDetails ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : settlements.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <CheckCircle2 size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest">No Settlements</p>
                  </div>
                ) : (
                  settlements.map((settlement) => (
                    <div key={settlement._id} className="bg-white dark:bg-[#16181d] p-3 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                            settlement.status === 'completed' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                            : settlement.status === 'pending' ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                            : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                          )}>
                            {settlement.status}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(settlement.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">₹{settlement.amount.toLocaleString()}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl">
                        <div className="flex-1 flex flex-col items-center">
                          <img src={settlement.payerId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(settlement.payerId?.name || 'U')}`} className="w-6 h-6 rounded-full mb-1" />
                          <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full text-center">{settlement.payerId?.name?.split(' ')[0]}</p>
                        </div>
                        <ArrowRight size={14} className="text-slate-400 shrink-0" />
                        <div className="flex-1 flex flex-col items-center">
                          <img src={settlement.receiverId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(settlement.receiverId?.name || 'U')}`} className="w-6 h-6 rounded-full mb-1" />
                          <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full text-center">{settlement.receiverId?.name?.split(' ')[0]}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
                <div className="absolute left-6 top-2 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
                <div className="space-y-6 py-2">
                  <div className="flex gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border-4 border-white dark:border-[#16181d]">
                      <Plus size={16} />
                    </div>
                    <div className="pt-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Workspace Created</p>
                      <p className="text-xs text-slate-500 mt-0.5">By {safeGroup.createdBy?.name || 'Unknown'}</p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 block">{new Date(safeGroup.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border-4 border-white dark:border-[#16181d]">
                      <Users size={16} />
                    </div>
                    <div className="pt-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Members Joined</p>
                      <p className="text-xs text-slate-500 mt-0.5">{safeGroup.members?.length || 0} members added to workspace.</p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 block">{new Date(safeGroup.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter workspace name"
                    className="w-full px-4 py-3 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description of the workspace..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none"
                  >
                    <option value="General">General</option>
                    <option value="Trip">Trip</option>
                    <option value="Home">Home & Utilities</option>
                    <option value="Couple">Couple</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1 relative">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin (Owner)</label>
                  <div 
                    onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                    className="w-full px-4 py-3 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium flex items-center justify-between cursor-pointer text-slate-900 dark:text-white"
                  >
                    {selectedAdminUser ? (
                      <div className="flex items-center gap-2">
                        <img src={selectedAdminUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAdminUser.name || 'U')}`} className="w-5 h-5 rounded-full" />
                        <span>{selectedAdminUser.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Select an admin...</span>
                    )}
                    <ChevronDown size={16} className="text-slate-400" />
                  </div>

                  {showAdminDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 overflow-hidden">
                      <div className="p-2 border-b border-slate-100 dark:border-slate-800/60">
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={adminSearch}
                            onChange={(e) => setAdminSearch(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-none rounded-lg text-xs outline-none text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto p-2 space-y-1">
                        {filteredAdmins.length === 0 ? <p className="text-xs text-center p-4 text-slate-400">No users found.</p> : null}
                        {filteredAdmins.map(u => (
                          <div 
                            key={u._id}
                            onClick={() => { setFormData({ ...formData, adminId: u._id }); setShowAdminDropdown(false); setAdminSearch(''); }}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                              formData.adminId === u._id ? "bg-blue-50 dark:bg-blue-500/10" : ""
                            )}
                          >
                            <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}`} className="w-6 h-6 rounded-full shrink-0" />
                            <div className="flex-1 truncate">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{u.name}</p>
                              <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                            </div>
                            {formData.adminId === u._id && <CheckCircle2 size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1 relative">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                    <span>Members ({formData.members.length})</span>
                  </label>
                  <div 
                    onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                    className="w-full min-h-[46px] px-2 py-2 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-wrap gap-2 items-center cursor-text"
                  >
                    {formData.members.map(id => {
                      const mUser = allUsers.find(u => u._id === id);
                      if (!mUser) return null;
                      return (
                        <div key={id} className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                          <img src={mUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mUser.name || 'U')}`} className="w-4 h-4 rounded-full" />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{mUser.name?.split(' ')[0]}</span>
                          <X 
                            size={12} 
                            className="text-slate-400 hover:text-slate-600 cursor-pointer ml-0.5" 
                            onClick={(e) => { e.stopPropagation(); toggleMember(id); }}
                          />
                        </div>
                      )
                    })}
                    <input
                      type="text"
                      placeholder={formData.members.length === 0 ? "Search to add members..." : ""}
                      value={memberSearch}
                      onChange={(e) => { setMemberSearch(e.target.value); setShowMemberDropdown(true); }}
                      onFocus={() => setShowMemberDropdown(true)}
                      className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 px-2"
                    />
                    <ChevronDown size={16} className="text-slate-400 mx-2 shrink-0 cursor-pointer" onClick={() => setShowMemberDropdown(!showMemberDropdown)} />
                  </div>

                  {showMemberDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 overflow-hidden">
                      <div className="max-h-[250px] overflow-y-auto p-2 space-y-1">
                        {filteredMembers.length === 0 ? <p className="text-xs text-center p-4 text-slate-400">No users found.</p> : null}
                        {filteredMembers.map(u => {
                          const isSelected = formData.members.includes(u._id);
                          return (
                            <div 
                              key={u._id}
                              onClick={() => { toggleMember(u._id); setMemberSearch(''); }}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                                isSelected ? "bg-blue-50 dark:bg-blue-500/10" : ""
                              )}
                            >
                              <div className="w-4 h-4 rounded border flex items-center justify-center shrink-0 border-slate-300 dark:border-slate-600">
                                {isSelected && <div className="w-2.5 h-2.5 rounded-sm bg-blue-600 dark:bg-blue-400" />}
                              </div>
                              <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}`} className="w-6 h-6 rounded-full shrink-0" />
                              <div className="flex-1 truncate">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{u.name}</p>
                                <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Admin Actions */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#16181d] flex gap-3">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <Settings size={16} /> Manage
              </button>
            ) : (
              <div className="flex flex-1 gap-2">
                {!isCreateMode && (
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  onClick={() => {
                    alert('Saved! (Simulated)');
                    if (isCreateMode) onClose();
                    else setIsEditing(false);
                  }}
                  className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                >
                  Save Workspace
                </button>
              </div>
            )}
            {!isCreateMode && (
              <button 
                onClick={() => { onDelete(safeGroup._id); onClose(); }}
                className="px-6 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center shrink-0"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};

export default GroupDrawer;
