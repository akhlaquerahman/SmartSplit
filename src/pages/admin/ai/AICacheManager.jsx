import React, { useState, useEffect } from 'react';
import { Database, MessageSquare, BookOpen, Brain, Zap, Hash, Link, Trash2, RefreshCw } from 'lucide-react';
import api from '../../../utils/api';

const CacheCard = ({ title, icon: Icon, metrics, onClear, isLoading, colorClass }) => (
  <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col justify-between h-full shadow-sm hover:shadow-md transition-shadow">
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500 dark:text-slate-400">Entries</span>
          <span className="font-mono text-sm text-slate-800 dark:text-slate-200">{metrics.entries}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500 dark:text-slate-400">Memory Usage</span>
          <span className="font-mono text-sm text-slate-800 dark:text-slate-200">{metrics.memoryUsage}</span>
        </div>
        {metrics.version && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500 dark:text-slate-400">Version</span>
            <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{metrics.version}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500 dark:text-slate-400">Hit Ratio</span>
          <span className="font-mono text-sm text-green-600 dark:text-green-400">{metrics.hitRatio || 'N/A'}</span>
        </div>
      </div>
    </div>
    
    <button
      onClick={onClear}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2 ${metrics.version ? 'bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-400' : 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400'} rounded-lg transition-colors font-medium text-sm disabled:opacity-50`}
    >
      {metrics.version ? <RefreshCw className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
      {metrics.version ? 'Reload Cache' : 'Clear Cache'}
    </button>
  </div>
);

const AICacheManager = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState({});

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/ai/cache/status');
      if (res.data.success) {
        setStatus(res.data.status);
      }
    } catch (error) {
      console.error('Failed to fetch cache status', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleClear = async (type, endpoint) => {
    try {
      setClearing(prev => ({ ...prev, [type]: true }));
      await api.post(`/admin/ai/cache/${endpoint}`);
      await fetchStatus();
    } catch (error) {
      console.error(`Failed to clear ${type}`, error);
    } finally {
      setClearing(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleClearAll = async () => {
    await handleClear('all', 'clear');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#fafafa] dark:bg-[#060606] font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Database className="w-8 h-8 text-purple-600" />
            AI Cache Manager
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Monitor and manually purge isolated cache layers to prevent Context Pollution.
          </p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={fetchStatus}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-slate-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button 
            onClick={handleClearAll}
            disabled={clearing['all']}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Caches
          </button>
        </div>
      </div>

      {!status ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <CacheCard 
            title="Semantic Cache" 
            icon={Brain} 
            metrics={status.semanticCache} 
            onClear={() => handleClear('semantic', 'semantic')}
            isLoading={clearing['semantic']}
            colorClass="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
          />
          <CacheCard 
            title="Conversation Memory" 
            icon={MessageSquare} 
            metrics={status.conversationMemory} 
            onClear={() => handleClear('conversation', 'conversation')}
            isLoading={clearing['conversation']}
            colorClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
          />
          <CacheCard 
            title="RAG Cache" 
            icon={BookOpen} 
            metrics={{ entries: 'Inherits Semantic', memoryUsage: 'N/A', hitRatio: 'N/A' }} 
            onClear={() => handleClear('semantic', 'semantic')}
            isLoading={clearing['semantic']}
            colorClass="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
          />
          <CacheCard 
            title="Intent Cache" 
            icon={Zap} 
            metrics={{ entries: 'Static', memoryUsage: 'Node Memory', version: status.versions?.intent }} 
            onClear={() => handleClear('intent', 'intent')}
            isLoading={clearing['intent']}
            colorClass="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
          />
          <CacheCard 
            title="Regex Cache" 
            icon={Hash} 
            metrics={{ entries: 'Static', memoryUsage: 'Node Memory', version: status.versions?.regex }} 
            onClear={() => handleClear('regex', 'regex')}
            isLoading={clearing['regex']}
            colorClass="bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400"
          />
          <CacheCard 
            title="Alias Cache" 
            icon={Link} 
            metrics={{ entries: 'Static', memoryUsage: 'Node Memory', version: status.versions?.alias }} 
            onClear={() => handleClear('alias', 'alias')}
            isLoading={clearing['alias']}
            colorClass="bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400"
          />
        </div>
      )}
    </div>
  );
};

export default AICacheManager;
