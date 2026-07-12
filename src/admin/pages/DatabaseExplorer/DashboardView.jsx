import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { Database, Files, Users, FolderOpen, Receipt, HandCoins } from 'lucide-react';

const DashboardView = ({ stats, collections, onSelectCollection }) => {
  const { theme } = useTheme();

  if (!stats) return null;

  const kpis = [
    { label: 'Collections', value: stats.collections, icon: Database, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-500/20' },
    { label: 'Total Documents', value: stats.totalDocuments, icon: Files, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20' },
    { label: 'Users', value: stats.users, icon: Users, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-500/20' },
    { label: 'Groups', value: stats.groups, icon: FolderOpen, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/20' },
    { label: 'Expenses', value: stats.expenses, icon: Receipt, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-500/20' },
    { label: 'Settlements', value: stats.settlements, icon: HandCoins, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20' }
  ];

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-xl font-semibold mb-6">Database Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">{kpi.label}</p>
                <h3 className="text-3xl font-bold">{kpi.value.toLocaleString()}</h3>
              </div>
              <div className={`p-4 rounded-full ${kpi.bg}`}>
                <Icon className={`w-8 h-8 ${kpi.color}`} />
              </div>
            </div>
          )
        })}
      </div>

      <h2 className="text-xl font-semibold mb-6">All Collections</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {collections.map((col) => (
          <div 
            key={col.name}
            onClick={() => onSelectCollection(col.name)}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              <span className="font-medium">{col.name}</span>
            </div>
            <span className="bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">
              {col.count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardView;
