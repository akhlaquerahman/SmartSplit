import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Filter, IndianRupee, Calendar, ArrowUpRight, ArrowDownRight, 
  Download, Eye, Edit, Trash2, Plus, Users, Clock, History,
  Image as ImageIcon, MoreVertical, X, CheckCircle2, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const GroupExpensesTab = ({ 
  group, 
  expenses = [],
  settlements = [],
  currentUser, 
  isAdmin, 
  onAddExpense, 
  onEditExpense, 
  onDeleteExpense,
  onViewReceipt,
  onViewHistory,
  expenseEditHistoryList = [],
  loadingHistory = false
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paidByFilter, setPaidByFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [drawerTab, setDrawerTab] = useState('overview');
  const [openMobileDropdown, setOpenMobileDropdown] = useState(null);

  useEffect(() => {
    if (drawerTab === 'activity' && selectedExpense) {
      onViewHistory && onViewHistory(selectedExpense);
    }
  }, [drawerTab, selectedExpense]);

  // Filtering & Sorting
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        if (categoryFilter !== 'all' && (e.category || 'General').toLowerCase() !== categoryFilter.toLowerCase()) return false;
        if (paidByFilter !== 'all') {
          if (paidByFilter === 'me' && e.paidBy?._id !== currentUser?._id) return false;
          if (paidByFilter !== 'me' && e.paidBy?._id !== paidByFilter) return false;
        }
        
        if (search) {
          const term = search.toLowerCase();
          return e.description?.toLowerCase().includes(term) || 
                 e.paidBy?.name?.toLowerCase().includes(term) || 
                 (e.category || 'General').toLowerCase().includes(term) ||
                 e.amount.toString().includes(term);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
        if (sortOrder === 'oldest') return new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt);
        if (sortOrder === 'highest_amount') return b.amount - a.amount;
        if (sortOrder === 'lowest_amount') return a.amount - b.amount;
        if (sortOrder === 'alphabetical') return (a.description || '').localeCompare(b.description || '');
        return 0;
      });
  }, [expenses, search, categoryFilter, paidByFilter, sortOrder, currentUser]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, paidByFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + rowsPerPage);

  // Analytics
  const analytics = useMemo(() => {
    if (!expenses.length) return { totalAmount: 0, avgExpense: 0, largestExpense: 0, mostActive: 'N/A', pendingCount: 0, topCategory: 'N/A' };
    
    let totalAmount = 0;
    let maxAmt = 0;
    const catCounts = {};
    const payerCounts = {};
    let pendingCount = settlements.filter(s => s.status === 'pending').length;

    expenses.forEach(e => {
      totalAmount += e.amount;
      if (e.amount > maxAmt) maxAmt = e.amount;
      
      const cat = e.category || 'General';
      catCounts[cat] = (catCounts[cat] || 0) + e.amount;
      
      const payerName = e.paidBy?.name || 'Unknown';
      payerCounts[payerName] = (payerCounts[payerName] || 0) + e.amount;
    });

    const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const topPayer = Object.entries(payerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      totalAmount,
      avgExpense: totalAmount / expenses.length,
      largestExpense: maxAmt,
      mostActive: topPayer,
      pendingCount,
      topCategory: topCat
    };
  }, [expenses, settlements]);

  const getCategoryBadge = (category) => {
    const cat = (category || 'General').toLowerCase();
    const map = {
      food: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      travel: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      shopping: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      bills: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      entertainment: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      medical: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
      general: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    };
    const colors = map[cat] || map.general;
    return <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${colors}`}>{category || 'General'}</span>;
  };

  const getPaymentBadge = (method) => {
    const m = (method || 'Cash').toLowerCase();
    const map = {
      upi: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      cash: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      card: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      bank_transfer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      other: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    };
    const colors = map[m] || map.other;
    return <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${colors}`}>{method || 'Cash'}</span>;
  };

  const getStatusBadge = (expense) => {
    const isEdited = expense.updatedAt && new Date(expense.updatedAt).getTime() - new Date(expense.createdAt).getTime() > 1000;
    // Assuming for now expense is active if it's here (we don't have a 'cancelled' flag in the schema based on previous views, but we show edited)
    if (isEdited) {
       return <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-md border border-amber-200/50 dark:border-amber-900/50"><Edit size={10} /> Edited</span>;
    }
    return <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-md border border-emerald-200/50 dark:border-emerald-900/50"><CheckCircle2 size={10} /> Active</span>;
  };

  const handleExportCSV = () => {
    const headers = "Date,Description,Category,Paid By,Amount,Split Between (Count)\n";
    const csv = expenses.map(e => 
      `"${formatDate(e.date || e.createdAt)}","${e.description}","${e.category || 'General'}","${e.paidBy?.name}",${e.amount},${e.splitDetails?.length || 0}`
    ).join("\n");
    const blob = new Blob([headers + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `group_expenses_${group.name.replace(/\s+/g, '_')}.csv`;
    a.click();
  };
  
  const canEditExpense = (expense) => {
    return isAdmin || expense.paidBy?._id === currentUser?._id || expense.addedBy?._id === currentUser?._id;
  };

  // Distinct members who paid for filters
  const uniquePayers = useMemo(() => {
    const map = new Map();
    expenses.forEach(e => {
      if (e.paidBy?._id && e.paidBy?._id !== currentUser?._id) {
        map.set(e.paidBy._id, e.paidBy.name);
      }
    });
    return Array.from(map.entries());
  }, [expenses, currentUser]);

  return (
    <div className="space-y-6">
      {/* 1. Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            EXPENSES <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs px-2 py-0.5 rounded-full">{expenses.length}</span>
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Manage all group expenses and spending history.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={onAddExpense} className="rounded-full bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 text-xs font-black uppercase tracking-wider shadow-md shadow-primary-500/20 active:scale-95 transition-all flex items-center gap-2">
            <Plus size={14} className="stroke-[3]" /> Add Expense
          </button>
        </div>
      </div>

      {/* 2. Analytics KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Spent</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(analytics.totalAmount)}</p>
            <IndianRupee size={16} className="text-slate-300 dark:text-slate-700 mb-1" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Avg Expense</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(analytics.avgExpense)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Top Category</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-lg font-black text-slate-900 dark:text-white truncate pr-2">{analytics.topCategory}</p>
          </div>
        </div>
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Largest Expense</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{formatCurrency(analytics.largestExpense)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Top Payer</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-lg font-black text-slate-900 dark:text-white truncate pr-2">{analytics.mostActive}</p>
          </div>
        </div>
        <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl p-4 border border-rose-100 dark:border-rose-900/30 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">Pending Req.</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-xl font-black text-rose-700 dark:text-rose-300">{analytics.pendingCount}</p>
          </div>
        </div>
      </div>

      {/* 3. Filter Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search expenses..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-medium rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-400 placeholder:font-normal"
          />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 lg:pb-0 hide-scrollbar">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer min-w-[120px]">
            <option value="all">All Categories</option>
            <option value="food">Food</option>
            <option value="travel">Travel</option>
            <option value="shopping">Shopping</option>
            <option value="bills">Bills</option>
            <option value="entertainment">Entertainment</option>
            <option value="medical">Medical</option>
            <option value="general">General</option>
          </select>
          <select value={paidByFilter} onChange={(e) => setPaidByFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer min-w-[130px]">
            <option value="all">All Payers</option>
            <option value="me">Paid by Me</option>
            {uniquePayers.map(([id, name]) => (
              <option key={id} value={id}>Paid by {name}</option>
            ))}
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer min-w-[140px]">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest_amount">Highest Amount</option>
            <option value="lowest_amount">Lowest Amount</option>
            <option value="alphabetical">Alphabetical</option>
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
                <th className="py-4 px-3 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">Date & Time</th>
                <th className="py-4 px-3 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">Expense Details</th>
                <th className="py-4 px-3 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">Split Breakdown</th>
                <th className="py-4 px-3 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">Payment Method</th>
                <th className="py-4 px-3 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">Paid By</th>
                <th className="py-4 px-3 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap text-right">Amount</th>
                <th className="py-4 px-3 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">Status</th>
                <th className="py-4 px-3 text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedExpenses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-medium text-sm">
                    No expenses found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedExpenses.map((e) => {
                  const isPaidByMe = e.paidBy?._id === currentUser?._id;
                  
                  return (
                    <tr key={e._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors group cursor-pointer" onClick={() => setSelectedExpense(e)}>
                      <td className="py-4 px-3 whitespace-nowrap text-xs font-bold text-slate-500">
                        {formatDate(e.date || e.createdAt)}
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <IndianRupee size={14} className="text-slate-500" />
                          </div>
                          <div className="max-w-[200px]">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate" title={e.description}>{e.description}</p>
                            {e.notes && <p className="text-xs font-medium text-slate-500 truncate" title={e.notes}>{e.notes}</p>}
                            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                              Added by {e.addedBy?._id === currentUser?._id ? 'You' : e.addedBy?.name || 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-[200px]">
                          {e.splitDetails?.map((split, idx) => {
                            const isPayer = split.user?._id === e.paidBy?._id;
                            return (
                              <span 
                                key={idx} 
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap ${
                                  isPayer 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                {split.user?.name?.split(' ')[0]}: {formatCurrency(split.amount)}
                                {isPayer && <span className="ml-0.5 text-[8px] uppercase tracking-wider opacity-80">(Paid)</span>}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-3 whitespace-nowrap">
                        {getPaymentBadge(e.paymentMethod)}
                      </td>
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img src={e.paidBy?.avatar || `https://ui-avatars.com/api/?name=${e.paidBy?.name}`} className="w-5 h-5 rounded-full object-cover" alt="payer" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{isPaidByMe ? 'You' : e.paidBy?.name?.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 whitespace-nowrap text-right font-black text-slate-900 dark:text-white text-sm">
                        {formatCurrency(e.amount)}
                      </td>
                      <td className="py-4 px-3 whitespace-nowrap">
                        {getStatusBadge(e)}
                      </td>
                      <td className="py-4 px-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2 transition-opacity" onClick={(ev) => ev.stopPropagation()}>
                          {e.receipt && (
                            <button onClick={() => onViewReceipt && onViewReceipt(e.receipt)} className="p-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors" title="View Receipt">
                              <ImageIcon size={16} />
                            </button>
                          )}
                          <button onClick={() => setSelectedExpense(e)} className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors" title="View Details">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => onEditExpense && onEditExpense(e)} className="p-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg transition-colors" title="Edit Expense">
                            <Edit size={16} />
                          </button>
                          {e.paidBy?._id === currentUser?._id && (
                            <button onClick={() => onDeleteExpense && onDeleteExpense(e._id)} className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg transition-colors" title="Delete Expense">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {paginatedExpenses.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-medium text-sm">
              No expenses found.
            </div>
          ) : (
            paginatedExpenses.map((e) => {
              const isPaidByMe = e.paidBy?._id === currentUser?._id;
              
              return (
                <div key={e._id} className="p-4 space-y-4 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <IndianRupee size={16} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">{e.description}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {getPaymentBadge(e.paymentMethod)}
                          <span className="text-[10px] font-bold text-slate-400">{formatDate(e.date || e.createdAt)}</span>
                        </div>
                        <p className="text-[10px] font-semibold text-slate-400 mt-1">
                          Added by {e.addedBy?._id === currentUser?._id ? 'You' : e.addedBy?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">{formatCurrency(e.amount)}</p>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img src={e.paidBy?.avatar || `https://ui-avatars.com/api/?name=${e.paidBy?.name}`} className="w-6 h-6 rounded-full object-cover" alt="payer" />
                      <div>
                         <p className="text-[10px] font-black uppercase text-slate-400 leading-none">Paid By</p>
                         <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{isPaidByMe ? 'You' : e.paidBy?.name}</p>
                      </div>
                    </div>
                    {getStatusBadge(e)}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {e.splitDetails?.map((split, idx) => {
                      const isSplitPayer = split.user?._id === e.paidBy?._id;
                      return (
                        <span 
                          key={idx} 
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap ${
                            isSplitPayer 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {split.user?.name?.split(' ')[0]}: {formatCurrency(split.amount)}
                          {isSplitPayer && <span className="ml-0.5 text-[8px] uppercase tracking-wider opacity-80">(Paid)</span>}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex justify-between gap-2 pt-1 relative">
                    <button onClick={() => setSelectedExpense(e)} className="text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg w-full text-center transition-colors">View Details</button>
                    
                    <button 
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setOpenMobileDropdown(openMobileDropdown === e._id ? null : e._id);
                      }}
                      className="p-2 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {openMobileDropdown === e._id && (
                      <div className="absolute right-0 bottom-full mb-2 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg shadow-slate-900/10 overflow-hidden z-20">
                        <button 
                          onClick={() => { setOpenMobileDropdown(null); onEditExpense(e); }}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        {(isAdmin || e.addedBy?._id === currentUser?._id) && (
                          <button 
                            onClick={() => { setOpenMobileDropdown(null); onDeleteExpense(e._id); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination UI */}
        {filteredExpenses.length > 0 && (
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
                Showing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredExpenses.length)} of {filteredExpenses.length}
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

      {/* 5. Right-Side Drawer (Expense Details) */}
      <AnimatePresence>
        {selectedExpense && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
              onClick={() => setSelectedExpense(null)}
            />
            <motion.div 
              initial={{ x: '100%', boxShadow: '-20px 0 25px -5px rgb(0 0 0 / 0)' }} 
              animate={{ x: 0, boxShadow: '-20px 0 25px -5px rgb(0 0 0 / 0.1)' }} 
              exit={{ x: '100%', boxShadow: '-20px 0 25px -5px rgb(0 0 0 / 0)' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[450px] md:w-[500px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-start justify-between shrink-0">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                    <IndianRupee size={24} className="text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white line-clamp-1" title={selectedExpense.description}>{selectedExpense.description}</h3>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{formatCurrency(selectedExpense.amount)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {canEditExpense(selectedExpense) && (
                    <button 
                      onClick={() => {
                        onEditExpense && onEditExpense(selectedExpense);
                        setSelectedExpense(null);
                      }} 
                      className="p-2 bg-white dark:bg-slate-800 rounded-full text-amber-500 hover:text-amber-600 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  <button onClick={() => setSelectedExpense(null)} className="p-2 bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              </div>
              
              <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 shrink-0 overflow-x-auto hide-scrollbar">
                {['overview', 'receipt', 'activity'].map((tab) => (
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
                      <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest mb-3">Expense Details</h4>
                      <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Date</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar size={14} className="text-slate-400" />
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatDate(selectedExpense.date || selectedExpense.createdAt)}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Category</p>
                            <div className="mt-1">
                              {getCategoryBadge(selectedExpense.category)}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Payment</p>
                            <div className="mt-1">
                              {getPaymentBadge(selectedExpense.paymentMethod)}
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/60">
                          <p className="text-[10px] font-black uppercase text-slate-400">Paid By</p>
                          <div className="flex items-center gap-3 mt-2">
                            <img src={selectedExpense.paidBy?.avatar || `https://ui-avatars.com/api/?name=${selectedExpense.paidBy?.name}`} className="w-8 h-8 rounded-full border border-slate-200" alt="payer" />
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedExpense.paidBy?.name}</p>
                              <p className="text-[10px] font-bold text-slate-500">Paid full amount of {formatCurrency(selectedExpense.amount)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/60">
                          <p className="text-[10px] font-black uppercase text-slate-400">Split Method</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 capitalize">{selectedExpense.splitMethod || 'equally'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Individual Shares */}
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest mb-3">Individual Shares</h4>
                      <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="py-2.5 px-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Participant</th>
                              <th className="py-2.5 px-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Share</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {selectedExpense.splitDetails?.map((split, idx) => (
                              <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/40">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <img src={split.user?.avatar || `https://ui-avatars.com/api/?name=${split.user?.name}`} className="w-6 h-6 rounded-full object-cover" alt="participant" />
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{split.user?.name} {split.user?._id === selectedExpense.paidBy?._id && '(Paid)'}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white text-sm">
                                  {formatCurrency(split.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'receipt' && (
                  <div className="space-y-4 h-full flex flex-col">
                    <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest mb-3">Proof of Payment</h4>
                    {selectedExpense.receipt ? (
                      <div className="flex-1 min-h-[300px] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative bg-slate-100 dark:bg-slate-950 group">
                        <img src={selectedExpense.receipt} className="w-full h-full object-contain" alt="Receipt" />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={() => onViewReceipt && onViewReceipt(selectedExpense.receipt)} className="px-4 py-2 bg-white text-slate-900 font-bold rounded-lg text-sm flex items-center gap-2">
                            <Eye size={16} /> View Fullscreen
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 min-h-[300px] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/20 text-slate-400">
                        <ImageIcon size={48} className="mb-3 text-slate-300" />
                        <p className="font-bold">No receipt uploaded</p>
                      </div>
                    )}
                  </div>
                )}

                {drawerTab === 'activity' && (
                  <div className="space-y-4 pb-4">
                    <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest mb-3">Audit Log</h4>
                    
                    {loadingHistory ? (
                      <div className="text-center py-12 text-slate-500">Loading edit history...</div>
                    ) : (
                      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[15px] md:before:ml-[15px] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                        
                        {/* Render actual edit history timeline */}
                        {expenseEditHistoryList.map((log, index) => (
                          <div key={log._id || index} className="relative flex items-center group is-active">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white dark:border-slate-900 bg-amber-500 text-white shadow shrink-0 z-10">
                              <Edit size={12} className="stroke-[3]" />
                            </div>
                            <div className="w-[calc(100%-2rem)] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm ml-4 space-y-3">
                              <div className="flex items-center gap-2.5">
                                <img src={log.editedBy?.avatar} className="w-6 h-6 rounded-full shadow-sm" alt="Editor Avatar" />
                                <div>
                                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                                    {log.editedBy?.name} {log.editedBy?._id === currentUser?._id ? '(You)' : ''} edited
                                  </p>
                                  <p className="text-[10px] font-bold text-slate-400">
                                    {new Date(log.editedAt || log.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3 border border-slate-100 dark:border-slate-800 space-y-2">
                                <p className="text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">Changed Fields</p>
                                <div className="space-y-2">
                                  {log.changes.map((change, cIdx) => (
                                    <div key={cIdx} className="text-xs border-b last:border-0 border-slate-100 dark:border-slate-800 pb-2.5 last:pb-0 pt-1">
                                      <div className="font-semibold text-slate-700 dark:text-slate-300 capitalize mb-1.5">
                                        {change.field === 'paidBy' ? 'Who Paid' : change.field === 'splitDetails' ? 'Split Shares' : change.field === 'receipt' ? 'Receipt Proof' : change.field}
                                      </div>
                                      <div className="space-y-1.5">
                                        <div className="text-rose-600 dark:text-rose-400 line-through bg-rose-50 dark:bg-rose-950/20 px-2 py-1.5 rounded-lg block text-[10px] break-words whitespace-normal w-full">
                                          {change.oldValue || 'None'}
                                        </div>
                                        <div className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1.5 rounded-lg block text-[10px] break-words whitespace-normal w-full">
                                          {change.newValue || 'None'}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Created Event (Always at the bottom) */}
                        <div className="relative flex items-center group is-active">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white dark:border-slate-900 bg-emerald-500 text-white shadow shrink-0 z-10">
                            <Plus size={12} className="stroke-[3]" />
                          </div>
                          <div className="w-[calc(100%-2rem)] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm ml-4">
                            <p className="text-xs font-black text-slate-900 dark:text-white">Expense Created</p>
                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">By {selectedExpense.addedBy?.name || selectedExpense.paidBy?.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">{new Date(selectedExpense.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        
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

export default GroupExpensesTab;
