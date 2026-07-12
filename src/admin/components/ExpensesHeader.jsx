import React from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';

const ExpensesHeader = ({ selectedCount, onDeleteSelected }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-20">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financial Operations</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Audit expenses, manage settlements, and monitor compliance</p>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-slate-800/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shadow-sm">
          <Download size={14} /> Export CSV
        </button>
        <button className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-slate-800/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shadow-sm">
          <Upload size={14} /> Export Excel
        </button>
        {selectedCount > 0 && (
          <>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />
            <button 
              onClick={onDeleteSelected}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
            >
              <Trash2 size={14} /> Delete Selected ({selectedCount})
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ExpensesHeader;
