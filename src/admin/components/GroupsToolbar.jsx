import React from 'react';
import { Search, Filter, SlidersHorizontal, Download, Upload, Plus, Folder, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';

const GroupsToolbar = ({ search, setSearch, category, setCategory, status, setStatus, viewMode, setViewMode }) => {
  return (
    <div className="flex flex-col gap-4 mb-6 relative z-20">


      {/* Filter Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-3 rounded-2xl border shadow-sm transition-all duration-300 bg-white dark:bg-[#16181d] border-slate-200 dark:border-slate-800/60">
        
        {/* Standard Search & Filters */}
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by workspace name, owner, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 shrink-0">
            <Folder size={14} className="text-slate-400" />
            <select
              value={category || 'all'}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Trip">Trips</option>
              <option value="Home">Home & Utilities</option>
              <option value="Couple">Couples</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 shrink-0">
            <SlidersHorizontal size={14} className="text-slate-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />
          
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl shrink-0">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("p-1.5 rounded-lg transition-colors", viewMode === 'grid' ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300")}
              title="Card View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-1.5 rounded-lg transition-colors", viewMode === 'list' ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300")}
              title="List View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
            </button>
          </div>

          <button onClick={() => { setSearch(''); setCategory('all'); setStatus('all'); }} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors shrink-0" title="Reset Filters">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupsToolbar;
