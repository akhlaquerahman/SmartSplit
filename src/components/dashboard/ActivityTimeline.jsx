import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, Landmark, UserPlus, FileText, CheckCircle2 } from 'lucide-react';

const ActivityTimeline = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white dark:bg-[#16181d] p-6 rounded-2xl border dark:border-slate-800/60 shadow-sm mb-6">
        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
        <p className="text-sm text-slate-500 italic text-center py-4">No recent activity found.</p>
      </div>
    );
  }

  const getIcon = (type, action) => {
    switch (type) {
      case 'expense':
        return <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-full"><Receipt size={14} /></div>;
      case 'settlement':
        return <div className="p-1.5 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-full"><Landmark size={14} /></div>;
      case 'member_joined':
        return <div className="p-1.5 bg-purple-50 dark:bg-purple-500/10 text-purple-500 rounded-full"><UserPlus size={14} /></div>;
      default:
        return <div className="p-1.5 bg-slate-50 dark:bg-slate-500/10 text-slate-500 rounded-full"><CheckCircle2 size={14} /></div>;
    }
  };

  const getMessage = (activity) => {
    if (activity.type === 'expense') {
      return `Added expense "${activity.description}" for ₹${activity.amount?.toFixed(2)}`;
    }
    if (activity.type === 'settlement') {
      return `Settled ₹${activity.amount?.toFixed(2)}`;
    }
    return 'Performed an action';
  };

  return (
    <div className="bg-white dark:bg-[#16181d] p-6 rounded-2xl border dark:border-slate-800/60 shadow-sm mb-6">
      <h3 className="text-lg font-bold mb-5">Recent Activity</h3>
      <div className="space-y-4">
        {activities.slice(0, 5).map((activity, idx) => (
          <motion.div 
            key={activity.id || idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex gap-3 relative"
          >
            {idx !== activities.slice(0, 5).length - 1 && (
              <div className="absolute left-[13px] top-7 bottom-[-16px] w-px bg-slate-200 dark:bg-slate-800"></div>
            )}
            <div className="relative z-10 shrink-0 mt-0.5">
              {getIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                {getMessage(activity)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-slate-500 font-medium">
                  {activity.paidBy?.name || activity.payer?.name || 'Someone'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(activity.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
