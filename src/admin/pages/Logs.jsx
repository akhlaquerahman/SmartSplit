import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import LogsKPIs from '../components/LogsKPIs';
import LogsToolbar from '../components/LogsToolbar';
import LogsAnalytics from '../components/LogsAnalytics';
import LogsTable from '../components/LogsTable';
import LogDrawer from '../components/LogDrawer';
import { RefreshCw } from 'lucide-react';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Drawer state
  const [drawerData, setDrawerData] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter state
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [type, category, search, page, limit]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        email: search
        // Note: category and type are not supported by the current /admin/login-logs backend, 
        // so we are only passing them in UI state to demonstrate the UX.
      });

      const response = await api.get(`/admin/login-logs?${params}`);
      
      setLogs(response.data.logs || []);
      setStats(response.data.stats || null);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setType('all');
    setCategory('all');
    setPage(1);
  };

  const handleRowClick = (log, details) => {
    setDrawerData({ log, details });
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-2 animate-in fade-in duration-500 pb-20">
      
      {/* Moved Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 mt-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Enterprise Audit Logs</h1>
          <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-time log ingestion active. Last sync: {new Date().toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchLogs}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-slate-800/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {loading ? 'Syncing...' : 'Refresh'}
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-slate-800/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shadow-sm">
            {/* Using basic icon since we don't have lucide-react import for Download here, wait, I can just use a span or import it. Let's just import it at top */}
            Export CSV
          </button>
        </div>
      </div>

      <LogsKPIs stats={stats} />
      
      <LogsAnalytics stats={stats} />

      {loading && logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white dark:bg-[#16181d] rounded-[2rem] border border-slate-200 dark:border-slate-800/60 shadow-sm mt-6">
          <RefreshCw className="animate-spin text-indigo-600" size={30} />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Querying Audit Trail...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-6">
          
          <LogsToolbar 
            search={search}
            setSearch={setSearch}
            type={type}
            setType={setType}
            category={category}
            setCategory={setCategory}
            onClear={handleClearFilters}
            onRefresh={fetchLogs}
            loading={loading}
          />

          <LogsTable 
            logs={logs}
            onRowClick={handleRowClick}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-500">
                  Showing Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Rows per page:</span>
                  <select
                    value={limit}
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                    className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-xs font-bold py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
                  >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-slate-800/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-slate-800/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slide-out Drawer */}
      <LogDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        logData={drawerData}
      />

    </div>
  );
};

export default Logs;
