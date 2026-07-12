import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Receipt, HandCoins, AlertCircle, RefreshCw, Shield, Trash2, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';

const ActivityItem = ({ type, message, time, user, delay }) => {
  let icon = Zap;
  let color = "text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400";
  
  switch(type) {
    case 'user_registered':
      icon = UserPlus;
      color = "text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400";
      break;
    case 'expense_created':
      icon = Receipt;
      color = "text-indigo-500 bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400";
      break;
    case 'settlement':
      icon = HandCoins;
      color = "text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400";
      break;
    case 'admin_login':
      icon = Shield;
      color = "text-purple-500 bg-purple-50 border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400";
      break;
    case 'warning':
      icon = AlertCircle;
      color = "text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400";
      break;
    case 'deleted':
      icon = Trash2;
      color = "text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400";
      break;
  }

  const Icon = icon;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex gap-4 relative group"
    >
      <div className="absolute left-5 top-10 bottom-[-1rem] w-px bg-slate-100 dark:bg-slate-800 group-last:hidden" />
      
      <div className={cn("relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 shadow-sm", color)}>
        <Icon size={16} />
      </div>
      
      <div className="flex-1 pb-6">
        <div className="bg-white dark:bg-[#111111] border border-slate-100 dark:border-slate-800/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4 mb-2">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {message}
            </p>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
              {time}
            </span>
          </div>
          {user && (
            <div className="flex items-center gap-2 mt-2">
              <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{user.name}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const AdminActivityFeed = ({ activities = [] }) => {

  return (
    <div className="bg-white dark:bg-[#16181d] rounded-[2rem] border border-slate-200 dark:border-slate-800/60 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <RefreshCw className="text-indigo-500" size={20} /> Live Activity
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Platform Event Feed</p>
        </div>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="pt-2">
          {activities.length > 0 ? activities.map((activity, i) => (
            <ActivityItem key={i} {...activity} delay={i * 0.15} />
          )) : (
            <p className="text-slate-500 text-sm text-center py-10">No recent activity found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminActivityFeed;
