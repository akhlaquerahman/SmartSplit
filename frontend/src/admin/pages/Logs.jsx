import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Search, RefreshCw, Smartphone, Monitor, Globe } from 'lucide-react';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [emailSearch, setEmailSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}/api/admin/login-logs`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 20, email: emailSearch }
      });
      
      setLogs(response.data.logs);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching login logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getDeviceIcon = (device) => {
    if (device?.toLowerCase().includes('phone') || device?.toLowerCase().includes('mobile')) return <Smartphone size={16} />;
    if (device?.toLowerCase().includes('mac') || device?.toLowerCase().includes('windows')) return <Monitor size={16} />;
    return <Globe size={16} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
          <Shield className="text-primary-600" size={32} /> Login Activity
        </h1>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by email..."
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-sm w-64"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all flex items-center gap-2">
            Search
          </button>
          <button type="button" onClick={() => { setEmailSearch(''); setPage(1); fetchLogs(); }} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition-all">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">IP Address</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Device / Browser</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-500">Loading activity logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-500">No login activity found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{log.username}</span>
                        <span className="text-xs text-slate-500">{log.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-400">
                        {log.ipAddress}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          {getDeviceIcon(log.deviceInfo?.device)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800 dark:text-slate-200">{log.deviceInfo?.browser}</span>
                          <span className="text-[10px] opacity-70">{log.deviceInfo?.os}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{new Date(log.timestamp).toLocaleDateString()}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border rounded-xl text-xs font-bold hover:bg-white transition-all disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border rounded-xl text-xs font-bold hover:bg-white transition-all disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;
