import React from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';

const LogsToolbar = ({ search, setSearch, type, setType, category, setCategory, onClear, onRefresh, loading }) => {
  return (
    <div className="flex flex-col gap-4 mb-6 relative z-20">

      {/* Filter Row */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-3 rounded-2xl border shadow-sm transition-all duration-300 bg-white dark:bg-[#16181d] border-slate-200 dark:border-slate-800/60">
        
        {/* Advanced Search */}
        <div className="relative flex-1 w-full xl:max-w-xl">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search logs by User, Email, IP Address, Device, or Event ID..."
            value={search || ''}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all font-mono"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto no-scrollbar pb-1 xl:pb-0">
          
          <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 shrink-0">
            <SlidersHorizontal size={14} className="text-slate-400" />
            <select
              value={category || 'all'}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="auth">Authentication</option>
              <option value="api">API Requests</option>
              <option value="admin">Admin Actions</option>
              <option value="security">Security</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 shrink-0">
            <SlidersHorizontal size={14} className="text-slate-400" />
            <select
              value={type || 'all'}
              onChange={(e) => setType(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed / Errors</option>
              <option value="warning">Warnings</option>
            </select>
          </div>
          
          <button onClick={onClear} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors shrink-0" title="Reset Filters">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogsToolbar;
