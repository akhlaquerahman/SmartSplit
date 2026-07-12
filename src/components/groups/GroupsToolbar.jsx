import React from 'react';
import { Search, Grid, List, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const GroupsToolbar = ({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  sortOrder,
  setSortOrder,
  viewMode,
  setViewMode,
  categories
}) => {
  const hasFilters = search || categoryFilter !== 'all' || statusFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-center gap-4 bg-white dark:bg-[#16181d] p-3 md:p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm mb-6 relative z-20">
      <div className="relative flex-1 w-full">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search groups by name or description..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white text-sm font-medium rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-400 placeholder:font-normal"
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-200 dark:bg-slate-800 rounded-full p-0.5"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full xl:w-auto shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 sm:p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/50">
          <div className="hidden sm:flex items-center text-slate-400 ml-2">
            <SlidersHorizontal size={16} />
          </div>
          
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)} 
            className="w-full sm:w-auto bg-transparent border border-slate-200 dark:border-slate-700 sm:border-none rounded-lg sm:rounded-none text-slate-700 dark:text-slate-300 text-sm font-bold px-3 sm:pl-2 sm:pr-6 py-2.5 sm:py-1.5 outline-none min-w-[120px]"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="w-full sm:w-auto bg-transparent border border-slate-200 dark:border-slate-700 sm:border-none rounded-lg sm:rounded-none text-slate-700 dark:text-slate-300 text-sm font-bold px-3 sm:pl-2 sm:pr-6 py-2.5 sm:py-1.5 outline-none min-w-[110px]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="settled">Settled</option>
          </select>

          <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)} 
            className="w-full sm:w-auto bg-transparent border border-slate-200 dark:border-slate-700 sm:border-none rounded-lg sm:rounded-none text-slate-700 dark:text-slate-300 text-sm font-bold px-3 sm:pl-2 sm:pr-6 py-2.5 sm:py-1.5 outline-none min-w-[130px]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest_budget">Highest Budget</option>
            <option value="highest_spent">Highest Spent</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
          {hasFilters && (
            <button 
              onClick={clearFilters}
              className="px-4 py-2.5 sm:py-2 text-sm sm:text-xs font-bold text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors whitespace-nowrap bg-slate-50 dark:bg-slate-900 md:bg-transparent"
            >
              Clear Filters
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 sm:p-1.5 rounded-lg transition-colors flex-1 flex justify-center", 
                viewMode === 'grid' ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              )}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 sm:p-1.5 rounded-lg transition-colors flex-1 flex justify-center", 
                viewMode === 'list' ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              )}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupsToolbar;
