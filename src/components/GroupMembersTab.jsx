import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Filter, Users, Shield, ArrowUpRight, ArrowDownRight, 
  TrendingUp, Download, Eye, Edit, Trash2, Mail, Phone, Calendar,
  CreditCard, Activity, Lock, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

const GroupMembersTab = ({ 
  group, 
  memberSummaries,
  expenses = [],
  settlements = [],
  currentUser, 
  isAdmin, 
  onInviteMember, 
  onRemoveMember 
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [balanceFilter, setBalanceFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('alphabetical');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [selectedMember, setSelectedMember] = useState(null);
  const [drawerTab, setDrawerTab] = useState('overview');

  // Enriched Member Data (combining summary + group data)
  const membersData = useMemo(() => {
    return memberSummaries.map(summary => {
      const groupData = group.members.find(m => m.user._id === summary.id);
      return {
        ...summary,
        email: groupData?.user?.email || '',
        mobile: groupData?.user?.mobile || groupData?.user?.mobileNumber || '',
        joinedAt: groupData?.joinedAt || group.createdAt,
        status: groupData ? 'active' : 'removed'
      };
    });
  }, [memberSummaries, group]);

  // Filtering & Sorting
  const filteredMembers = useMemo(() => {
    return membersData
      .filter((m) => {
        if (roleFilter !== 'all' && m.role !== roleFilter) return false;
        if (balanceFilter === 'receivable' && m.netBalance <= 0) return false;
        if (balanceFilter === 'payable' && m.netBalance >= 0) return false;
        if (balanceFilter === 'settled' && Math.abs(m.netBalance) > 0.01) return false;
        
        if (search) {
          const term = search.toLowerCase();
          return m.name.toLowerCase().includes(term) || m.email.toLowerCase().includes(term);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'alphabetical') return a.name.localeCompare(b.name);
        if (sortOrder === 'highest_paid') return b.totalPaid - a.totalPaid;
        if (sortOrder === 'lowest_paid') return a.totalPaid - b.totalPaid;
        if (sortOrder === 'highest_balance') return Math.abs(b.netBalance) - Math.abs(a.netBalance);
        if (sortOrder === 'newest') return new Date(b.joinedAt) - new Date(a.joinedAt);
        if (sortOrder === 'oldest') return new Date(a.joinedAt) - new Date(b.joinedAt);
        return 0;
      });
  }, [membersData, search, roleFilter, balanceFilter, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, balanceFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + rowsPerPage);

  // Analytics
  const analytics = useMemo(() => {
    let totalPaid = 0;
    let totalShare = 0;
    let totalReceivable = 0;
    let totalPayable = 0;
    
    membersData.forEach(m => {
      totalPaid += m.totalPaid;
      totalShare += m.totalShare;
      if (m.netBalance > 0) totalReceivable += m.netBalance;
      if (m.netBalance < 0) totalPayable += Math.abs(m.netBalance);
    });

    return {
      totalMembers: membersData.length,
      admins: membersData.filter(m => m.role === 'admin' || m.role === 'owner').length,
      totalPaid,
      totalShare,
      totalReceivable,
      totalPayable,
      avgContribution: membersData.length ? totalPaid / membersData.length : 0
    };
  }, [membersData]);

  const getRoleBadge = (role) => {
    switch(role) {
      case 'owner': return <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">Owner</span>;
      case 'admin': return <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">Admin</span>;
      default: return <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">Member</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active': return <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Active</span>;
      case 'removed': return <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-bold"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" />Removed</span>;
      default: return <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 text-xs font-bold"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" />Pending</span>;
    }
  };

  const renderBalance = (netBalance) => {
    if (netBalance > 0.01) {
      return <span className="text-emerald-600 dark:text-emerald-400 font-black inline-flex items-center gap-1"><ArrowUpRight size={14} /> {formatCurrency(netBalance)}</span>;
    } else if (netBalance < -0.01) {
      return <span className="text-rose-600 dark:text-rose-400 font-black inline-flex items-center gap-1"><ArrowDownRight size={14} /> {formatCurrency(Math.abs(netBalance))}</span>;
    }
    return <span className="text-slate-400 font-bold inline-flex items-center">Settled</span>;
  };

  const handleExportCSV = () => {
    // Basic CSV export
    const headers = "Name,Email,Role,Total Paid,Total Share,Net Balance,Status\n";
    const csv = membersData.map(m => 
      `"${m.name}","${m.email}","${m.role}",${m.totalPaid},${m.totalShare},${m.netBalance},"${m.status}"`
    ).join("\n");
    const blob = new Blob([headers + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `group_members_${group.name.replace(/\s+/g, '_')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            MEMBERS <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs px-2 py-0.5 rounded-full">{analytics.totalMembers}</span>
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Manage group members, balances, and permissions.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2">
            <Download size={14} /> Export
          </button>
          {isAdmin && (
            <button onClick={onInviteMember} className="rounded-full bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 text-xs font-black uppercase tracking-wider shadow-md shadow-primary-500/20 active:scale-95 transition-all flex items-center gap-2">
              <Users size={14} /> Invite Member
            </button>
          )}
        </div>
      </div>

      {/* 2. Analytics KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Members</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-xl font-black text-slate-900 dark:text-white">{analytics.totalMembers}</p>
            <Users size={16} className="text-slate-300 dark:text-slate-700 mb-1" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Admins</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-xl font-black text-slate-900 dark:text-white">{analytics.admins}</p>
            <Shield size={16} className="text-blue-300 dark:text-blue-900/50 mb-1" />
          </div>
        </div>
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Total Paid</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{formatCurrency(analytics.totalPaid)}</p>
          </div>
        </div>
        <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl p-4 border border-rose-100 dark:border-rose-900/30 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">Total Share</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-xl font-black text-rose-700 dark:text-rose-300">{formatCurrency(analytics.totalShare)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Receivable</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(analytics.totalReceivable)}</p>
            <ArrowUpRight size={16} className="text-emerald-400 mb-1" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Payable</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(analytics.totalPayable)}</p>
            <ArrowDownRight size={16} className="text-rose-400 mb-1" />
          </div>
        </div>
      </div>

      {/* 3. Filter Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-medium rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-400 placeholder:font-normal"
          />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 lg:pb-0 hide-scrollbar">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer min-w-[120px]">
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
          <select value={balanceFilter} onChange={(e) => setBalanceFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer min-w-[130px]">
            <option value="all">All Balances</option>
            <option value="receivable">Receivable</option>
            <option value="payable">Payable</option>
            <option value="settled">Settled</option>
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer min-w-[140px]">
            <option value="alphabetical">Alphabetical</option>
            <option value="highest_balance">Highest Balance</option>
            <option value="highest_paid">Highest Paid</option>
            <option value="lowest_paid">Lowest Paid</option>
            <option value="newest">Newest Joined</option>
            <option value="oldest">Oldest Joined</option>
          </select>
        </div>
      </div>

      {/* 4. Main Content: Data Table (Desktop) & Cards (Mobile) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-4 px-6 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">Member</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">Role</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap text-right">Paid</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap text-right">Share</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap text-right">Received</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap text-right">Net Balance</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">Status</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-medium text-sm">
                    No members found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors group cursor-pointer" onClick={() => setSelectedMember(m)}>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={m.avatar || `https://ui-avatars.com/api/?name=${m.name}`} className="w-8 h-8 rounded-full border border-slate-200 object-cover" alt="avatar" />
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{m.name} {m.id === currentUser?._id && '(You)'}</p>
                          <p className="text-xs text-slate-500 font-medium">{m.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getRoleBadge(m.role)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right font-black text-slate-900 dark:text-white text-sm">
                      {formatCurrency(m.totalPaid)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right font-bold text-slate-500 text-sm">
                      {formatCurrency(m.totalShare)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(m.settlementReceived || 0)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      {renderBalance(m.netBalance)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getStatusBadge(m.status)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setSelectedMember(m)} className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors" title="View Profile">
                          <Eye size={16} />
                        </button>
                        {isAdmin && m.id !== currentUser?._id && m.role !== 'owner' && (
                          <button onClick={() => onRemoveMember && onRemoveMember(m)} className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg transition-colors" title="Remove Member">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {paginatedMembers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-medium text-sm">
              No members found.
            </div>
          ) : (
            paginatedMembers.map((m) => (
              <div key={m.id} className="p-4 space-y-4 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img src={m.avatar || `https://ui-avatars.com/api/?name=${m.name}`} className="w-10 h-10 rounded-full border border-slate-200 object-cover" alt="avatar" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{m.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {getRoleBadge(m.role)}
                        {getStatusBadge(m.status)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Net Balance</p>
                    <div className="mt-1">{renderBalance(m.netBalance)}</div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Total Paid</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white mt-1">{formatCurrency(m.totalPaid)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Total Share</p>
                    <p className="text-sm font-black text-slate-500 dark:text-slate-400 mt-1">{formatCurrency(m.totalShare)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Received</p>
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(m.settlementReceived || 0)}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={() => setSelectedMember(m)} className="text-xs font-bold text-primary-600 bg-primary-50 px-4 py-2 rounded-lg w-full text-center">View Profile</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination UI */}
        {filteredMembers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 font-medium">
              <span>Rows per page:</span>
              <select 
                value={rowsPerPage} 
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>
                Showing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredMembers.length)} of {filteredMembers.length}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300 px-2">
                Page {currentPage} of {totalPages}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Right-Side Drawer (Member Profile) */}
      <AnimatePresence>
        {selectedMember && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
              onClick={() => setSelectedMember(null)}
            />
            <motion.div 
              initial={{ x: '100%', boxShadow: '-20px 0 25px -5px rgb(0 0 0 / 0)' }} 
              animate={{ x: 0, boxShadow: '-20px 0 25px -5px rgb(0 0 0 / 0.1)' }} 
              exit={{ x: '100%', boxShadow: '-20px 0 25px -5px rgb(0 0 0 / 0)' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-start justify-between shrink-0">
                <div className="flex gap-4 items-center">
                  <img src={selectedMember.avatar || `https://ui-avatars.com/api/?name=${selectedMember.name}`} className="w-14 h-14 rounded-full border-2 border-white dark:border-slate-800 shadow-sm object-cover" alt="avatar" />
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedMember.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(selectedMember.role)}
                      {getStatusBadge(selectedMember.status)}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedMember(null)} className="p-2 bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 shrink-0 overflow-x-auto hide-scrollbar">
                {['overview', 'expenses', 'settlements'].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setDrawerTab(tab)}
                    className={`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${drawerTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {drawerTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest mb-3">Contact Info</h4>
                      <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <Mail size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-700 dark:text-slate-300">{selectedMember.email || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Phone size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-700 dark:text-slate-300">{selectedMember.mobile || selectedMember.phone || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-700 dark:text-slate-300">Joined {new Date(selectedMember.joinedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest mb-3">Financial Summary</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                          <p className="text-[10px] font-black uppercase text-slate-400">Total Paid</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white mt-1">{formatCurrency(selectedMember.totalPaid)}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                          <p className="text-[10px] font-black uppercase text-slate-400">Total Share</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white mt-1">{formatCurrency(selectedMember.totalShare)}</p>
                        </div>
                        <div className="col-span-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between">
                          <p className="text-xs font-black uppercase text-slate-500">Current Balance</p>
                          <div className="text-lg">{renderBalance(selectedMember.netBalance)}</div>
                        </div>
                      </div>
                    </div>

                    {isAdmin && selectedMember.id !== currentUser?._id && selectedMember.role !== 'owner' && (
                      <div>
                         <h4 className="text-xs font-black uppercase text-rose-500 tracking-widest mb-3">Danger Zone</h4>
                         <button onClick={() => onRemoveMember && onRemoveMember(selectedMember)} className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-4 py-3 text-sm font-bold transition-colors hover:bg-rose-100 dark:hover:bg-rose-900/50">
                           <Trash2 size={16} /> Remove from Group
                         </button>
                      </div>
                    )}
                  </div>
                )}

                {drawerTab === 'expenses' && (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-500">Recent expenses added or paid by {selectedMember.name.split(' ')[0]}</p>
                    {expenses.filter(e => e.paidBy?._id === selectedMember.id || e.addedBy?._id === selectedMember.id || e.splitBetween?.some(s => s.user?._id === selectedMember.id)).slice(0, 10).length > 0 ? (
                      expenses.filter(e => e.paidBy?._id === selectedMember.id || e.addedBy?._id === selectedMember.id || e.splitBetween?.some(s => s.user?._id === selectedMember.id)).slice(0, 10).map((expense) => (
                        <div key={expense._id} className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                           <div className="flex justify-between items-start">
                             <div>
                               <p className="text-sm font-bold text-slate-900 dark:text-white">{expense.description}</p>
                               <p className="text-[10px] font-bold text-slate-400 mt-0.5">{new Date(expense.date).toLocaleDateString()}</p>
                             </div>
                             <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(expense.amount)}</p>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <CreditCard size={24} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-sm text-slate-500 font-medium">No recent expenses.</p>
                      </div>
                    )}
                  </div>
                )}

                {drawerTab === 'settlements' && (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-500">Recent settlements involving {selectedMember.name.split(' ')[0]}</p>
                    {settlements.filter(s => s.payerId?._id === selectedMember.id || s.receiverId?._id === selectedMember.id).slice(0, 10).length > 0 ? (
                      settlements.filter(s => s.payerId?._id === selectedMember.id || s.receiverId?._id === selectedMember.id).slice(0, 10).map((settle) => (
                        <div key={settle._id} className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 p-3 flex justify-between items-center">
                           <div>
                             <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                               {settle.payerId?._id === selectedMember.id ? 'Paid' : 'Received'} {formatCurrency(settle.amount)}
                             </p>
                             <p className="text-[10px] font-bold text-slate-400 mt-0.5">{new Date(settle.createdAt).toLocaleDateString()}</p>
                           </div>
                           <div>{getStatusBadge(settle.status)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <Activity size={24} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-sm text-slate-500 font-medium">No recent settlements.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupMembersTab;
