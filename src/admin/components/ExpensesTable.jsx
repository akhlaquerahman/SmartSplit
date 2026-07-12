import React, { useState } from 'react';
import { MoreVertical, Image as ImageIcon, ChevronDown, Check, Info, FileSearch, ShieldAlert, BadgeCheck, Eye, Trash2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const CategoryBadge = ({ category }) => {
  const categories = {
    'Food & Dining': 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200/50 dark:border-orange-500/20',
    'Travel': 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/20',
    'Shopping': 'bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400 border-pink-200/50 dark:border-pink-500/20',
    'Bills & Utilities': 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200/50 dark:border-purple-500/20',
    'Other': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200/50 dark:border-slate-700/50',
  };
  const colorClass = categories[category] || categories['Other'];
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider", colorClass)}>
      {category || 'Other'}
    </span>
  );
};

const SplitBadge = ({ splitType }) => {
  if (splitType === 'exact') return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20 uppercase tracking-wider">Exact</span>;
  if (splitType === 'percentage') return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-200/50 dark:border-teal-500/20 uppercase tracking-wider">Percentage</span>;
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50 uppercase tracking-wider">Equal</span>;
};

const ExpensesTable = ({ expenses, selectedExpenses, setSelectedExpenses, onRowClick }) => {
  const [activeMenuId, setActiveMenuId] = useState(null);

  const toggleSelectAll = () => {
    if (selectedExpenses.length === expenses.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(expenses.map(e => e._id));
    }
  };

  const toggleSelectExpense = (e, id) => {
    e.stopPropagation();
    if (selectedExpenses.includes(id)) {
      setSelectedExpenses(selectedExpenses.filter(expenseId => expenseId !== id));
    } else {
      setSelectedExpenses([...selectedExpenses, id]);
    }
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-[#16181d] rounded-[2rem] border border-slate-200 dark:border-slate-800/60 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[1100px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/60">
              <th className="py-4 pl-6 pr-3 sticky left-0 z-10 bg-slate-50/50 dark:bg-slate-900/40 w-12">
                <div 
                  className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors",
                    selectedExpenses.length === expenses.length && expenses.length > 0 
                      ? "bg-blue-600 border-blue-600 text-white" 
                      : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-transparent"
                  )}
                  onClick={toggleSelectAll}
                >
                  <Check size={14} />
                </div>
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest w-16">
                Proof
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-600 flex items-center gap-1">
                Description <ChevronDown size={14} />
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Workspace
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Paid By
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">
                Amount
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
                Split
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden md:table-cell text-left">
                Split Breakdown
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden lg:table-cell text-right">
                Date
              </th>
              <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <FileSearch size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-bold">No expenses found</p>
                    <p className="text-xs mt-1">Try adjusting your filters or search query.</p>
                  </div>
                </td>
              </tr>
            ) : (
              expenses.map((expense) => {
                const isSelected = selectedExpenses.includes(expense._id);
                // Mock flag/approval for UI demonstration
                const isFlagged = expense.amount > 50000;
                
                return (
                  <tr 
                    key={expense._id} 
                    onClick={() => onRowClick(expense)}
                    className={cn(
                      "group cursor-pointer transition-colors",
                      isSelected 
                        ? "bg-blue-50/50 dark:bg-blue-500/5" 
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40",
                      isFlagged && !isSelected && "bg-rose-50/20 dark:bg-rose-500/5"
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
                        onClick={(e) => toggleSelectExpense(e, expense._id)}
                      >
                        <Check size={14} />
                      </div>
                    </td>
                    
                    <td className="py-3 px-3">
                      {expense.receipt ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative group-hover:shadow-md transition-shadow">
                          <img src={expense.receipt} alt="Receipt" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye size={14} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400" title="No receipt provided">
                          <ImageIcon size={16} className="opacity-50" />
                        </div>
                      )}
                    </td>
                    
                    <td className="py-3 px-3">
                      <div className="flex flex-col max-w-[200px]">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                          {expense.description}
                          {isFlagged && <ShieldAlert size={12} className="text-rose-500 shrink-0" title="Unusual Amount Flag" />}
                        </span>
                        <div className="mt-1">
                          <CategoryBadge category={expense.category} />
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-3 px-3">
                      <div className="flex flex-col max-w-[150px]">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{expense.groupId?.name || 'Unknown'}</span>
                        <span className="text-[10px] text-slate-500 uppercase mt-0.5">{expense.splits?.length || 2} Participants</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <img 
                          src={expense.paidBy?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(expense.paidBy?.name || 'User')}&background=random`} 
                          alt={expense.paidBy?.name} 
                          className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                        />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{expense.paidBy?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    
                    <td className="py-3 px-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className={cn(
                          "text-sm font-black",
                          isFlagged ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                        )}>
                          ₹{expense.amount.toLocaleString()}
                        </span>
                        <div className="w-16 h-1 mt-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", isFlagged ? "bg-rose-500" : "bg-emerald-500")} style={{ width: `${Math.min((expense.amount / 50000) * 100, 100)}%` }} />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <SplitBadge splitType={expense.splitType || 'equal'} />
                    </td>

                    <td className="py-3 px-3 hidden md:table-cell">
                      <div className="flex flex-col gap-1 max-w-[200px]">
                        {(expense.splitDetails || []).map((split, i) => (
                          <div key={i} className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[90px]" title={split.user?.name}>
                              {split.user?.name?.split(' ')[0] || 'Unknown'}:
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-slate-500 dark:text-slate-400 text-right w-12">
                                ₹{split.amount?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}
                              </span>
                              {split.user?.name !== expense.paidBy?.name ? (
                                <span className={cn(
                                  "text-[8px] font-black uppercase px-1 rounded-sm tracking-wider",
                                  split.isPaid 
                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                                    : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                                )}>
                                  {split.isPaid ? '(Paid)' : '(Owes)'}
                                </span>
                              ) : (
                                <span className="text-[8px] font-black uppercase px-1 rounded-sm tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                  (Paid)
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {(!expense.splitDetails || expense.splitDetails.length === 0) && (
                           <span className="text-[10px] text-slate-400 italic">No splits available</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-3 px-3 hidden lg:table-cell text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">
                          {new Date(expense.date || expense.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase">
                          {new Date(expense.date || expense.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-3 px-6 text-right relative" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={(e) => toggleMenu(e, expense._id)}
                        className={cn(
                          "p-2 rounded-xl transition-colors",
                          activeMenuId === expense._id 
                            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white" 
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-50 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                        )}
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      <AnimatePresence>
                        {activeMenuId === expense._id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.1 }}
                            className="absolute right-6 top-10 w-48 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700/60 z-50 overflow-hidden py-1"
                          >
                            <button onClick={() => { onRowClick(expense); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left">
                              <Info size={14} /> View Details
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-500 dark:hover:bg-emerald-500/10 transition-colors text-left">
                              <BadgeCheck size={14} /> Approve Expense
                            </button>
                            {expense.receipt && (
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-500 dark:hover:bg-blue-500/10 transition-colors text-left">
                                <Download size={14} /> Download Receipt
                              </button>
                            )}
                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-500 dark:hover:bg-rose-500/10 transition-colors text-left">
                              <Trash2 size={14} /> Delete Record
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

export default ExpensesTable;
