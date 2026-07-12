import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, FolderPlus, Download, Send, DatabaseBackup, RefreshCw, FileText } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';

const QuickActionBtn = ({ icon: Icon, label, colorClass, bgClass, delay, onClick }) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className={cn(
      "flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border transition-all group",
      "bg-white dark:bg-[#16181d] border-slate-200 dark:border-slate-800/60",
      "hover:shadow-md hover:-translate-y-1 active:scale-95"
    )}
    onClick={onClick}
  >
    <div className={cn("p-3 rounded-xl transition-colors", bgClass, colorClass)}>
      <Icon size={20} />
    </div>
    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white text-center">
      {label}
    </span>
  </motion.button>
);

const AdminQuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { label: 'Create User', icon: UserPlus, colorClass: 'text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white', bgClass: 'bg-blue-50 dark:bg-blue-500/10', onClick: () => navigate('/admin/users') },
    { label: 'Create Group', icon: FolderPlus, colorClass: 'text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white', bgClass: 'bg-indigo-50 dark:bg-indigo-500/10', onClick: () => navigate('/admin/groups') },
    { label: 'Export Reports', icon: Download, colorClass: 'text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white', bgClass: 'bg-emerald-50 dark:bg-emerald-500/10', onClick: () => navigate('/admin/groups') },
    { label: 'Backup DB', icon: DatabaseBackup, colorClass: 'text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white', bgClass: 'bg-rose-50 dark:bg-rose-500/10', onClick: () => navigate('/admin/database-explorer') },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((action, i) => (
          <QuickActionBtn key={action.label} {...action} delay={i * 0.05} />
        ))}
      </div>
    </div>
  );
};

export default AdminQuickActions;
