import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show label for very small slices

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const ChartHeader = ({ title, subtitle, icon: Icon, colorClass }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className={cn("p-2 rounded-xl bg-slate-50 dark:bg-slate-800", colorClass)}>
      <Icon size={18} />
    </div>
    <div>
      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{title}</h3>
      <p className="text-[10px] font-bold text-slate-500">{subtitle}</p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 dark:bg-black text-white p-3 rounded-xl shadow-xl border border-slate-700/50 text-xs">
        <p className="font-bold mb-1 opacity-80">{label || payload[0].name}</p>
        {payload.map(p => (
          <p key={p.dataKey} className="font-black text-sm" style={{ color: p.color }}>
            {p.name === 'completed' ? 'Completed: ' : p.name === 'requested' ? 'Requested: ' : ''}
            ₹{p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SettlementsAnalytics = ({ stats }) => {
  const methodData = stats?.paymentMethodsBreakdown?.length > 0 ? stats.paymentMethodsBreakdown : [{ name: 'No Data', value: 1 }];
  const trendData = stats?.dailyTrend || [];
  
  const totalMethodAmount = methodData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      {/* Payment Method Distribution */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-[#16181d] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm p-6 lg:col-span-1"
      >
        <ChartHeader 
          title="Payment Methods" 
          subtitle="Volume by instrument" 
          icon={PieChartIcon} 
          colorClass="text-emerald-600 dark:text-emerald-400" 
        />
        <div className="h-[200px] w-full flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={methodData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {methodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              ₹{totalMethodAmount > 1 ? totalMethodAmount.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {methodData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{entry.name}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 7-Day Trend */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-[#16181d] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm p-6 lg:col-span-2"
      >
        <div className="flex justify-between items-start">
          <ChartHeader 
            title="Settlement Velocity" 
            subtitle="Requested vs Completed volume" 
            icon={TrendingUp} 
            colorClass="text-blue-600 dark:text-blue-400" 
          />
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completion Rate</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">92.4%</p>
          </div>
        </div>

        <div className="h-[220px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRequested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="requested" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorRequested)" />
              <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

    </div>
  );
};

export default SettlementsAnalytics;
