import React from 'react';
import { Download, Upload, UserPlus } from 'lucide-react';

const UsersHeader = ({ onExportCSV, onImport, onCreateUser }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 relative z-20">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">User Management</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Manage platform access, roles, and user verification</p>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={onExportCSV}
          className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-slate-800/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shadow-sm"
        >
          <Download size={14} /> Export CSV
        </button>
        <button 
          onClick={onImport}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-slate-800/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shadow-sm"
        >
          <Upload size={14} /> Import
        </button>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />
        <button 
          onClick={onCreateUser}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
        >
          <UserPlus size={14} /> Create User
        </button>
      </div>
    </div>
  );
};

export default UsersHeader;
