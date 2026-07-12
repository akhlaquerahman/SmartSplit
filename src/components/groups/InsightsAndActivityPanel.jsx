import React, { useMemo } from 'react';
import { Trophy, TrendingUp, Zap, Clock, ArrowRight, UserPlus, FileText, CheckCircle2 } from 'lucide-react';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const InsightsAndActivityPanel = ({ groups }) => {
  const insights = useMemo(() => {
    if (!groups.length) return null;
    
    // Sort groups for insights
    const byBudget = [...groups].sort((a, b) => (b.budget || 0) - (a.budget || 0));
    const bySpent = [...groups].sort((a, b) => (b.summary?.totalExpense || 0) - (a.summary?.totalExpense || 0));
    const byMembers = [...groups].sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0));
    
    return {
      largestBudget: byBudget[0],
      highestSpent: bySpent[0],
      mostActive: byMembers[0]
    };
  }, [groups]);

  // Mock timeline data for recent activity
  const recentActivity = useMemo(() => {
    if (!groups.length) return [];
    return [
      { id: 1, type: 'expense', title: 'New expense added', group: groups[0]?.name, time: new Date(Date.now() - 3600000), icon: FileText, color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' },
      { id: 2, type: 'settle', title: 'Settlement completed', group: groups[0]?.name, time: new Date(Date.now() - 7200000), icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
      { id: 3, type: 'join', title: 'New member joined', group: groups[1]?.name || groups[0]?.name, time: new Date(Date.now() - 86400000), icon: UserPlus, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' }
    ];
  }, [groups]);

  return (
    <div className="space-y-6">
      {/* Quick Insights */}
      <div className="bg-white dark:bg-[#16181d] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
            <Zap size={16} className="text-amber-500" /> Key Insights
          </h3>
        </div>
        
        <div className="p-5 space-y-4">
          {insights?.largestBudget && (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                <Trophy size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Largest Budget</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{insights.largestBudget.name}</p>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(insights.largestBudget.budget || 1000)} allocated</p>
              </div>
            </div>
          )}

          {insights?.highestSpent && (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 mt-0.5">
                <TrendingUp size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Highest Spending</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{insights.highestSpent.name}</p>
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{formatCurrency(insights.highestSpent.summary?.totalExpense || 0)} spent</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white dark:bg-[#16181d] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
            <Clock size={16} className="text-blue-500" /> Recent Activity
          </h3>
          <button className="text-[10px] font-bold text-primary-600 uppercase tracking-wider hover:underline">View All</button>
        </div>
        
        <div className="p-5">
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white dark:border-[#16181d] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 bg-slate-50 dark:bg-slate-900 absolute left-0 md:left-1/2 -ml-4 md:ml-0">
                  <div className={`w-full h-full rounded-full flex items-center justify-center ${activity.color}`}>
                    <activity.icon size={12} strokeWidth={3} />
                  </div>
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] ml-12 md:ml-0 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{activity.title}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">in <span className="text-primary-600 dark:text-primary-400">{activity.group}</span></div>
                  <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                    {timeAgo(activity.time)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsAndActivityPanel;
