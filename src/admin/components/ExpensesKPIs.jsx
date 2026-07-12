import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, AlertCircle, Clock, ShieldAlert, FileX } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { cn } from '../../utils/cn';

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
    className="bg-white dark:bg-[#16181d] rounded-2xl border border-slate-200 dark:border-slate-800/60 p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-2.5 rounded-xl shrink-0 transition-colors", bgClass, colorClass)}>
        <Icon size={20} />
      </div>
      
      <div className="text-right">
        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white truncate">{value}</h3>
      </div>
    </div>
    
    <div className="flex items-end justify-between mt-2">
      <div className="flex items-center gap-1.5 text-[11px] font-bold">
        {trend === 'up' ? (
          <span className="flex items-center text-emerald-600 dark:text-emerald-400">
            +{trendValue}%
          </span>
        ) : trend === 'down' ? (
          <span className="flex items-center text-rose-600 dark:text-rose-400">
            -{trendValue}%
          </span>
        ) : (
          <span className="flex items-center text-slate-600 dark:text-slate-400">
            ~ 0%
          </span>
        )}
        <span className="text-slate-400 dark:text-slate-500 font-medium hidden xl:inline">vs last month</span>
      </div>
      
      <div className="h-8 w-16 opacity-40 group-hover:opacity-100 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={generateSparkline(trend)}>
            <defs>
              <linearGradient id={`expense-color-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke={strokeColor} strokeWidth={2} fill={`url(#expense-color-${index})`} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </motion.div>
);

const ExpensesKPIs = ({ stats }) => {
  const kpis = [
    { title: 'Total Expenses', value: `₹${(stats?.totalAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, bgClass: 'bg-blue-50 dark:bg-blue-500/10 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20', colorClass: 'text-blue-600 dark:text-blue-400', strokeColor: '#3b82f6', trend: 'up', trendValue: 14.5 },
    { title: '30-Day Spending', value: `₹${(stats?.thirtyDaySpending || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingUp, bgClass: 'bg-indigo-50 dark:bg-indigo-500/10 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20', colorClass: 'text-indigo-600 dark:text-indigo-400', strokeColor: '#6366f1', trend: 'up', trendValue: 8.2 },
    { title: 'Avg Expense', value: `₹${(stats?.avgAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: AlertCircle, bgClass: 'bg-emerald-50 dark:bg-emerald-500/10 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20', colorClass: 'text-emerald-600 dark:text-emerald-400', strokeColor: '#10b981', trend: 'down', trendValue: 2.4 },
    { title: 'More Expenses Group', value: '42', icon: Clock, bgClass: 'bg-amber-50 dark:bg-amber-500/10 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20', colorClass: 'text-amber-600 dark:text-amber-400', strokeColor: '#f59e0b', trend: 'up', trendValue: 12.1 },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, i) => (
        <KPICard key={kpi.title} index={i} {...kpi} />
      ))}
    </div>
  );
};

export default ExpensesKPIs;
