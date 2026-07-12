import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { useTheme } from '../../../context/ThemeContext';
import { Database, LayoutDashboard, Settings, Activity } from 'lucide-react';
import DashboardView from './DashboardView';
import CollectionBrowser from './CollectionBrowser';
import HealthChecks from './HealthChecks';

const DatabaseExplorer = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, collection, health
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInitialData = async () => {
    try {
      const [statsRes, collsRes] = await Promise.all([
        api.get(`/admin/db/dashboard-stats`),
        api.get(`/admin/db/collections`)
      ]);
      
      setStats(statsRes.data);
      setCollections(collsRes.data);
    } catch (error) {
      console.error('Failed to load database explorer data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleCollectionSelect = (colName) => {
    setSelectedCollection(colName);
    setActiveTab('collection');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-[calc(100vh-8rem)] ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="text-blue-500" />
            Database Explorer
          </h1>
          <p className="text-sm opacity-70">App Owner Enterprise Data Management Console</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto no-scrollbar w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}
          >
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('collection')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'collection' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}
          >
            <Database size={16} /> Collections
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col relative">
        {activeTab === 'dashboard' && <DashboardView stats={stats} collections={collections} onSelectCollection={handleCollectionSelect} />}
        {activeTab === 'collection' && <CollectionBrowser collections={collections} selectedCollection={selectedCollection} onSelectCollection={handleCollectionSelect} />}
        {activeTab === 'health' && <HealthChecks />}
      </div>
    </div>
  );
};

export default DatabaseExplorer;
