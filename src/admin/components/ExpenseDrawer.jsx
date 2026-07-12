import React, { useState } from 'react';
import { X, Users, Receipt, Calendar, Activity, Shield, Settings, ExternalLink, Archive, MapPin, Download, SplitSquareHorizontal, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const ExpenseDrawer = ({ expense, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !expense) return null;

  // Mock data for UI
  const isFlagged = expense.amount > 50000;
  const splitType = expense.splitType || 'equal';

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
          className="w-full max-w-[550px] h-full bg-white dark:bg-[#16181d] border-l border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Expense Audit Details</h2>
              <p className="text-[10px] font-bold text-slate-500 font-mono mt-1 uppercase tracking-widest">ID: {expense._id}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Hero Section */}
          <div className="p-6 pb-0 flex flex-col items-center border-b border-slate-100 dark:border-slate-800/60 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-900/20">
            <div className="mb-2">
              <span className={cn(
                "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest border",
                isFlagged 
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200/50 dark:border-rose-500/20" 
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20"
              )}>
                {isFlagged ? 'Flagged for Review' : 'Approved'}
              </span>
            </div>
            
            <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-2 flex items-start gap-1">
              <span className="text-xl mt-1.5 text-slate-400">₹</span>
              {expense.amount.toLocaleString()}
            </h3>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-3 text-center">
              {expense.description}
            </p>
            
            <div className="flex items-center gap-4 mt-4 mb-6">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                  {new Date(expense.date || expense.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                  {expense.category || 'General'}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-center gap-6 w-full mt-2">
              <button 
                onClick={() => setActiveTab('overview')}
                className={cn(
                  "pb-3 text-xs font-bold tracking-wide uppercase transition-colors relative",
                  activeTab === 'overview' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                Overview
                {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('splits')}
                className={cn(
                  "pb-3 text-xs font-bold tracking-wide uppercase transition-colors relative",
                  activeTab === 'splits' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                Splits & Settlement
                {activeTab === 'splits' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('receipt')}
                className={cn(
                  "pb-3 text-xs font-bold tracking-wide uppercase transition-colors relative",
                  activeTab === 'receipt' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                Receipt
                {activeTab === 'receipt' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />}
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/10">
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {isFlagged && (
                  <div className="bg-rose-50 dark:bg-rose-500/10 p-4 rounded-xl border border-rose-200/50 dark:border-rose-500/20 flex gap-3">
                    <ShieldAlert size={20} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-rose-900 dark:text-rose-300">Unusual Amount Detected</h4>
                      <p className="text-xs text-rose-700 dark:text-rose-400/80 mt-1">This expense amount exceeds the standard threshold of ₹50,000 for this category and requires manual review.</p>
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Transaction Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-[#16181d] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-start gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg shrink-0"><Users size={16} /></div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">{expense.groupId?.name || 'Unknown'}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-[#16181d] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-start gap-3">
                      <div className="p-2 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg shrink-0"><Shield size={16} /></div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paid By</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">{expense.paidBy?.name || 'Unknown'}</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#16181d] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-start gap-3">
                      <div className="p-2 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg shrink-0"><SplitSquareHorizontal size={16} /></div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Split Type</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 capitalize">{splitType}</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#16181d] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-start gap-3">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0"><CheckCircle2 size={16} /></div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Participants</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{expense.splitDetails?.length || 2} Members</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#16181d] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Audit Timeline</h4>
                   <div className="flex flex-col items-center justify-center py-6 opacity-40">
                     <Activity size={24} className="mb-2" />
                     <p className="text-xs font-bold">Activity log generated dynamically.</p>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'splits' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-end mb-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settlement Breakdown</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-wider">{splitType} Split</span>
                </div>
                
                {/* Map real splits if provided */}
                {(expense.splitDetails && expense.splitDetails.length > 0 ? expense.splitDetails : [
                  { user: { name: expense.paidBy?.name, email: expense.paidBy?.email, avatar: expense.paidBy?.avatar }, amount: expense.amount / 2, isPaid: true },
                  { user: { name: 'Participant User', email: 'user@example.com' }, amount: expense.amount / 2, isPaid: false }
                ]).map((split, i) => (
                  <div key={i} className="bg-white dark:bg-[#16181d] p-3 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={split.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(split.user?.name || 'User')}&background=random`} 
                        alt="Member"
                        className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                          {split.user?.name}
                          {split.user?.name === expense.paidBy?.name && (
                            <span className="px-1.5 py-0.5 text-[8px] font-black rounded bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 uppercase tracking-widest">Paid</span>
                          )}
                        </p>
                        <p className="text-[11px] font-bold text-slate-500">₹{split.amount.toLocaleString()} ({((split.amount / expense.amount) * 100).toFixed(0)}%)</p>
                      </div>
                    </div>
                    {split.user?.name !== expense.paidBy?.name && (
                      <span className={cn(
                        "px-2 py-1 text-[10px] font-bold rounded uppercase tracking-widest border",
                        split.isPaid 
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20"
                      )}>
                        {split.isPaid ? 'Settled' : 'Pending'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'receipt' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proof of Payment</h4>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded border border-emerald-200/50 dark:border-emerald-500/20 uppercase tracking-wider">
                    <CheckCircle2 size={12} /> OCR Verified
                  </div>
                </div>
                
                {expense.receipt ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex flex-col relative group">
                    <img src={expense.receipt} alt="Proof" className="w-full object-contain max-h-[400px]" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white rounded-xl text-xs font-bold transition-colors">
                        <Download size={14} /> Download Receipt
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-50 dark:bg-slate-800/20">
                    <Receipt size={48} className="mb-3 opacity-30" />
                    <p className="text-sm font-bold text-slate-500">No receipt attached</p>
                    <p className="text-xs text-slate-400 mt-1">This transaction is missing required documentation.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Admin Actions */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#16181d] flex gap-3">
            {isFlagged ? (
              <button className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm">
                <CheckCircle2 size={16} /> Approve & Clear Flag
              </button>
            ) : (
              <button className="flex-1 py-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                <ShieldAlert size={16} /> Flag for Review
              </button>
            )}
            <button 
              className="px-6 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center"
            >
              Reject
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExpenseDrawer;
