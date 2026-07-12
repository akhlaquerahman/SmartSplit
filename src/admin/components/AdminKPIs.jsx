import React from 'react';
import { motion } from 'framer-motion';
import { Users, FolderOpen, Receipt, HandCoins, TrendingUp, TrendingDown, CreditCard, DollarSign, ArrowRightLeft, Activity, Server } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { cn } from '../../utils/cn';

// Simple mock data for the tiny sparklines
const generateSparkline = (trend) => {
  const data = [];
  let current = trend === 'up' ? 10 : 50;
  for (let i = 0; i < 7; i++) {
    data.push({ value: current });
    current += trend === 'up' ? Math.random() * 10 : -Math.random() * 10;
  }
  return data;
};

const KPICard = ({ title, value, icon: Icon, colorClass, bgClass, strokeColor, trend, trendValue, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className={cn(
      "bg-white dark:bg-[#16181d] rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between",
      "dark:border-slate-800/60"
    )}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-2.5 rounded-xl shrink-0", bgClass, colorClass)}>
        <Icon size={20} />
      </div>
      
      <div className="text-right">
        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white truncate max-w-[120px]">{value}</h3>
      </div>
    </div>
    
    <div className="flex items-end justify-between mt-2">
      <div className="flex items-center gap-1.5 text-[11px] font-bold">
        {trend === 'up' ? (
          <span className="flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
            <TrendingUp size={12} className="mr-1" /> +{trendValue}%
          </span>
        ) : trend === 'down' ? (
          <span className="flex items-center text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-md">
            <TrendingDown size={12} className="mr-1" /> -{trendValue}%
          </span>
        ) : (
          <span className="flex items-center text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10 px-2 py-0.5 rounded-md">
            ~ 0%
          </span>
        )}
        <span className="text-slate-400 dark:text-slate-500 font-medium">vs last week</span>
      </div>
      
      <div className="h-8 w-16 opacity-40 group-hover:opacity-100 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={generateSparkline(trend)}>
            <defs>
              <linearGradient id={`color-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke={strokeColor} strokeWidth={2} fill={`url(#color-${index})`} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </motion.div>
);

const AdminKPIs = ({ stats }) => {
  const kpis = [
    { title: 'Active Users', value: stats?.totalUsers?.toLocaleString() || 0, icon: Users, bgClass: 'bg-blue-50 dark:bg-blue-500/10', colorClass: 'text-blue-600 dark:text-blue-400', strokeColor: '#3b82f6', trend: 'up', trendValue: 12.5 },
    { title: 'Total Groups', value: stats?.totalGroups?.toLocaleString() || 0, icon: FolderOpen, bgClass: 'bg-indigo-50 dark:bg-indigo-500/10', colorClass: 'text-indigo-600 dark:text-indigo-400', strokeColor: '#6366f1', trend: 'up', trendValue: 8.2 },
    { title: 'Expenses', value: stats?.totalExpenses?.toLocaleString() || 0, icon: Receipt, bgClass: 'bg-purple-50 dark:bg-purple-500/10', colorClass: 'text-purple-600 dark:text-purple-400', strokeColor: '#a855f7', trend: 'up', trendValue: 24.1 },
    { title: 'Settlements', value: stats?.totalSettlements?.toLocaleString() || 0, icon: HandCoins, bgClass: 'bg-emerald-50 dark:bg-emerald-500/10', colorClass: 'text-emerald-600 dark:text-emerald-400', strokeColor: '#10b981', trend: 'down', trendValue: 3.4 },
    { title: 'Transactions', value: '45,231', icon: ArrowRightLeft, bgClass: 'bg-amber-50 dark:bg-amber-500/10', colorClass: 'text-amber-600 dark:text-amber-400', strokeColor: '#f59e0b', trend: 'up', trendValue: 18.7 },
    { title: 'Revenue', value: '$12,450', icon: DollarSign, bgClass: 'bg-teal-50 dark:bg-teal-500/10', colorClass: 'text-teal-600 dark:text-teal-400', strokeColor: '#14b8a6', trend: 'up', trendValue: 5.2 },
    { title: 'Pending Actions', value: '14', icon: Activity, bgClass: 'bg-rose-50 dark:bg-rose-500/10', colorClass: 'text-rose-600 dark:text-rose-400', strokeColor: '#f43f5e', trend: 'down', trendValue: 12.0 },
    { title: 'Platform Health', value: '99.9%', icon: Server, bgClass: 'bg-cyan-50 dark:bg-cyan-500/10', colorClass: 'text-cyan-600 dark:text-cyan-400', strokeColor: '#06b6d4', trend: 'up', trendValue: 0.1 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi, i) => (
        <KPICard key={kpi.title} index={i} {...kpi} />
      ))}
    </div>
  );
};

export default AdminKPIs;
