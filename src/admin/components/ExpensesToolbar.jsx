import React from 'react';
import { Search, Filter, SlidersHorizontal, RotateCcw, SplitSquareHorizontal, Users } from 'lucide-react';
import { cn } from '../../utils/cn';

const ExpensesToolbar = ({ search, setSearch, category, setCategory, status, setStatus, splitType, setSplitType, groupId, setGroupId, groups, onClear }) => {
  return (
    <div className="flex flex-col gap-4 mb-6 relative z-20">


      {/* Filter Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-3 rounded-2xl border shadow-sm transition-all duration-300 bg-white dark:bg-[#16181d] border-slate-200 dark:border-slate-800/60">
        
        {/* Standard Search & Filters */}
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by ID, merchant, description or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 shrink-0">
            <Users size={14} className="text-slate-400" />
            <select
              value={groupId || 'all'}
              onChange={(e) => setGroupId(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 text-xs font-bold outline-none cursor-pointer max-w-[120px]"
            >
              <option value="all">All Workspaces</option>
              {(groups || []).map(g => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 shrink-0">
            <Filter size={14} className="text-slate-400" />
            <select
              value={category || 'all'}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Food & Dining">Food</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills & Utilities">Bills</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 shrink-0">
            <SplitSquareHorizontal size={14} className="text-slate-400" />
            <select
              value={splitType || 'all'}
              onChange={(e) => setSplitType(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="all">Split Type</option>
              <option value="equal">Equal</option>
              <option value="exact">Exact Amount</option>
              <option value="percentage">Percentage</option>
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="flagged">Flagged</option>
              <option value="rejected">Rejected</option>
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

export default ExpensesToolbar;
