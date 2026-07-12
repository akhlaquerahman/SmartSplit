import React from 'react';
import { MessageSquare, Activity, AlertTriangle, Clock } from 'lucide-react';
import { useConversationStats } from '../../hooks/useConversationExplorer';

const StatCard = ({ title, value, icon: Icon, trend, color, bgColor }) => (
  <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl p-4 flex items-center justify-between shadow-sm">
    <div>
      <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h4>
        {trend && <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{trend}</span>}
      </div>
    </div>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColor} ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

const ConversationKPIs = () => {
  const { data, isLoading } = useConversationStats();

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-pulse">
      {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>)}
    </div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
      <StatCard title="Today's Conversations" value={data?.total || 0} icon={MessageSquare} color="text-blue-500" bgColor="bg-blue-50 dark:bg-blue-900/20" />
      <StatCard title="Resolved Rate" value={`${data?.resolvedRate?.toFixed(1) || 0}%`} icon={Activity} color="text-emerald-500" bgColor="bg-emerald-50 dark:bg-emerald-900/20" />
      <StatCard title="Fallback Rate" value={`${data?.fallbackRate?.toFixed(1) || 0}%`} icon={AlertTriangle} color="text-amber-500" bgColor="bg-amber-50 dark:bg-amber-900/20" />
      <StatCard title="Avg Latency" value={`${data?.avgLatency?.toFixed(1) || 0}ms`} icon={Clock} color="text-purple-500" bgColor="bg-purple-50 dark:bg-purple-900/20" />
    </div>
  );
};

export default ConversationKPIs;