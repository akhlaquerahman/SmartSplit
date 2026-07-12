import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Receipt, Landmark, UserPlus, FileBarChart2 } from 'lucide-react';

const QuickActionsPanel = ({ onCreateGroup, onAddExpense, onSettle, onInvite, onReport }) => {
  const actions = [
    { label: 'Create Group', icon: Plus, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-900/30', onClick: onCreateGroup },
    { label: 'Add Expense', icon: Receipt, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-100 dark:border-orange-900/30', onClick: onAddExpense },
    { label: 'Split Bill', icon: Landmark, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-900/30', onClick: onSettle },
    { label: 'Invite Friend', icon: UserPlus, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-100 dark:border-purple-900/30', onClick: onInvite },
    { label: 'Report', icon: FileBarChart2, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-100 dark:border-rose-900/30', onClick: onReport },
  ];

  return (
    <div className="bg-white dark:bg-[#16181d] p-6 rounded-2xl border dark:border-slate-800/60 shadow-sm mb-6">
      <h3 className="text-lg font-bold mb-5">Quick Actions</h3>
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
        {actions.map((action, idx) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.onClick}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border ${action.border} ${action.bg} hover:shadow-sm transition-all group`}
          >
            <action.icon size={22} className={`${action.color} mb-2 group-hover:scale-110 transition-transform`} />
            <span className={`text-[11px] font-bold uppercase tracking-wider ${action.color}`}>{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsPanel;
