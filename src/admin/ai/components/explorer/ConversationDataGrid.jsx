import React, { useState } from 'react';
import useExplorerStore from '../../store/useExplorerStore';
import { ChevronUp, ChevronDown } from 'lucide-react';

const ConversationDataGrid = ({ data, isLoading, onRowClick }) => {
  const { filters, setFilter } = useExplorerStore();
  const [selectedIds, setSelectedIds] = useState([]);

  const handleSort = (field) => {
    if (filters.sortField === field) {
      setFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setFilter('sortField', field);
      setFilter('sortOrder', 'desc');
    }
  };

  const getSortIcon = (field) => {
    if (filters.sortField !== field) return null;
    return filters.sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />;
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading enterprise datagrid...</div>;
  }

  if (!data?.items?.length) {
    return <div className="p-8 text-center text-gray-500 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-b-2xl">No conversations found matching filters.</div>;
  }

  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-b-2xl overflow-hidden shadow-sm flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-black/50 sticky top-0 z-10">
            <tr className="text-xs uppercase text-gray-500 font-semibold tracking-wider">
              <th className="p-4 w-10">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('_id')}>Session ID {getSortIcon('_id')}</th>
              <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('username')}>User {getSortIcon('username')}</th>
              <th className="p-4">Topic</th>
              <th className="p-4">Source</th>
              <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('status')}>Status {getSortIcon('status')}</th>
              <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('metadata.confidence')}>Confidence {getSortIcon('metadata.confidence')}</th>
              <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('createdAt')}>Created {getSortIcon('createdAt')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/5">
            {data.items.map((row) => (
              <tr key={row._id} onClick={() => onRowClick(row._id)} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="p-4 text-sm font-medium text-gray-900 dark:text-gray-100">{row._id.slice(-6).toUpperCase()}</td>
                <td className="p-4">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{row.name || (row.username ? `@${row.username}` : 'Unknown')}</p>
                  <p className="text-xs text-gray-500">{row.email || 'N/A'}</p>
                </td>
                <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{row.metadata?.topic || 'General'}</td>
                <td className="p-4">
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-300">{row.metadata?.source || 'N/A'}</span>
                </td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${row.status === 'Closed' ? 'text-green-600 bg-green-50' : row.status === 'Handoff' ? 'text-amber-600 bg-amber-50' : 'text-blue-600 bg-blue-50'}`}>
                    {row.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${row.metadata?.confidence || 0}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500">{row.metadata?.confidence || 0}%</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-500">{new Date(row.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#111111] flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Rows per page:</span>
          <select value={filters.limit} onChange={(e) => setFilter('limit', parseInt(e.target.value))} className="bg-transparent border-none font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer">
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={500}>500</option>
          </select>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">
            Showing {(data.pagination.page - 1) * data.pagination.limit + 1} - {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {data.pagination.total}
          </span>
          <div className="flex items-center gap-1">
            <button 
              disabled={!data.pagination.hasPrevious}
              onClick={() => setFilter('page', data.pagination.page - 1)}
              className="px-3 py-1 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-100 disabled:opacity-50"
            >Prev</button>
            <button 
              disabled={!data.pagination.hasNext}
              onClick={() => setFilter('page', data.pagination.page + 1)}
              className="px-3 py-1 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-100 disabled:opacity-50"
            >Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationDataGrid;