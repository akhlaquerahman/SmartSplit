import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Server, Database, HardDrive, Cpu, Activity, Fingerprint, Lock, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';

const COLORS = ['#3b82f6', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'];

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
        <p className="font-bold mb-1 opacity-80">{label}</p>
        {payload.map(p => (
          <p key={p.dataKey} className="font-black text-sm" style={{ color: p.color || p.fill }}>
            {p.name}: {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ServiceStatus = ({ name, status, uptime }) => (
  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20">
    <div className="flex items-center gap-3">
      <div className="relative flex h-3 w-3">
        {status === 'operational' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
        <span className={cn(
          "relative inline-flex rounded-full h-3 w-3",
          status === 'operational' ? "bg-emerald-500" :
          status === 'degraded' ? "bg-amber-500" : "bg-rose-500"
        )}></span>
      </div>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{name}</span>
    </div>
    <span className="text-xs font-mono font-black text-slate-500">{uptime}</span>
  </div>
);

const LogsAnalytics = ({ stats }) => {
  const categoryData = stats?.categoryData?.length > 0 ? stats.categoryData : [{ name: 'No Data', value: 1 }];
  const hourlyData = stats?.hourlyData || [];

  const totalEvents = categoryData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
      
      {/* Services Status Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-[#16181d] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm p-6 lg:col-span-1 flex flex-col"
      >
        <ChartHeader 
          title="Service Health" 
          subtitle="Core platform services" 
          icon={Activity} 
          colorClass="text-emerald-600 dark:text-emerald-400" 
        />
        <div className="space-y-2 flex-1 flex flex-col justify-center">
          <ServiceStatus name="Authentication" status="operational" uptime="99.99%" />
          <ServiceStatus name="Primary Database" status="operational" uptime="99.98%" />
          <ServiceStatus name="Rest API v1" status="degraded" uptime="98.45%" />
          <ServiceStatus name="Background Workers" status="operational" uptime="100%" />
        </div>
      </motion.div>

      {/* Log Categories Distribution */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-[#16181d] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm p-6 lg:col-span-1"
      >
        <ChartHeader 
          title="Audit Trail" 
          subtitle="Events by Category" 
          icon={PieChartIcon} 
          colorClass="text-indigo-600 dark:text-indigo-400" 
        />
        <div className="h-[200px] w-full flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
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
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              {totalEvents > 1 ? totalEvents.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          {categoryData.slice(0,3).map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
              <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400">{entry.name}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 24h Event Volume */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-[#16181d] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm p-6 lg:col-span-2"
      >
        <div className="flex justify-between items-start">
          <ChartHeader 
            title="Event Volume" 
            subtitle="Log ingested per hour" 
            icon={Zap} 
            colorClass="text-blue-600 dark:text-blue-400" 
          />
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Peak Volume</p>
            <p className="text-lg font-black text-blue-600 dark:text-blue-400">85K/hr</p>
          </div>
        </div>

        <div className="h-[200px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="timeLabel" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.1 }} />
              <Bar dataKey="events" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Events" />
              <Bar dataKey="failed" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Failed/Errors" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

    </div>
  );
};

// Helper icon
const PieChartIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
    <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
  </svg>
);

export default LogsAnalytics;
