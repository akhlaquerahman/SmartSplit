import React from 'react';
import { Search, Filter, RefreshCw, Download, Trash2 } from 'lucide-react';
import useExplorerStore from '../../store/useExplorerStore';

const AdvancedFilters = ({ onRefresh, onExport, onBulkDelete, selectedCount }) => {
  const { filters, setFilter, resetFilters } = useExplorerStore();

  return (
    <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-t-2xl border border-gray-200 dark:border-white/10 border-b-0 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3 flex-1">
        <div className="relative w-full max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search ID, user, topic..." 
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        
        <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} className="py-2 px-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Closed">Resolved</option>
          <option value="Handoff">Escalated</option>
        </select>
        
        <select value={filters.source} onChange={(e) => setFilter('source', e.target.value)} className="py-2 px-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none">
          <option value="">All Sources</option>
          <option value="FAQ">FAQ</option>
          <option value="Knowledge">Knowledge</option>
          <option value="LLM + Tool">LLM + Tool</option>
          <option value="Fallback">Fallback</option>
        </select>

        <button onClick={resetFilters} className="text-sm text-blue-600 hover:underline">Reset</button>
      </div>
      
      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <button onClick={onBulkDelete} className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition">
            <Trash2 className="w-4 h-4" /> Delete ({selectedCount})
          </button>
        )}
        <button onClick={onRefresh} className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-600 hover:bg-gray-50 tooltip" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button onClick={onExport} className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-600 hover:bg-gray-50 tooltip" title="Export CSV">
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AdvancedFilters;