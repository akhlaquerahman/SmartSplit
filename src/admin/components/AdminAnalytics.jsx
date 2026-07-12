import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, LineChart as LineIcon, PieChart, Download, Maximize2 } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area,
  PieChart as RechartsPie,
  Pie,
  Cell
} from 'recharts';
import { cn } from '../../utils/cn';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs">
        <p className="font-black mb-2 uppercase tracking-widest text-[10px] opacity-50">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 py-1">
            <span className="font-bold opacity-70 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
              {entry.name}:
            </span>
            <span className="font-black text-white">
              {entry.name.includes('Amount') || entry.name.includes('Volume') ? `₹${entry.value.toFixed(2)}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ChartHeader = ({ title, subtitle, icon: Icon, colorClass }) => (
  <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
    <div className="min-w-0">
      <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2 whitespace-nowrap">
        <Icon className={`${colorClass} shrink-0`} size={20} /> {title}
      </h2>
      <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg px-2 py-1 outline-none">
        <option>7 Days</option>
        <option>30 Days</option>
        <option>90 Days</option>
        <option>Year</option>
      </select>
      <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors">
        <Download size={16} />
      </button>
      <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors hidden sm:block">
        <Maximize2 size={16} />
      </button>
    </div>
  </div>
);

const AdminAnalytics = ({ stats }) => {
  // Use provided stats or fallback to dummy data for demonstration
  const monthlyData = stats?.monthlyStats || [
    { month: 'Jan', expenseCount: 120, totalAmount: 4500, newUsers: 45 },
    { month: 'Feb', expenseCount: 140, totalAmount: 5200, newUsers: 52 },
    { month: 'Mar', expenseCount: 180, totalAmount: 7100, newUsers: 68 },
    { month: 'Apr', expenseCount: 160, totalAmount: 6800, newUsers: 58 },
    { month: 'May', expenseCount: 210, totalAmount: 8900, newUsers: 75 },
    { month: 'Jun', expenseCount: 245, totalAmount: 11200, newUsers: 92 },
  ];

  const categoryData = [
    { name: 'Food', value: 45 },
    { name: 'Travel', value: 25 },
    { name: 'Housing', value: 15 },
    { name: 'Utilities', value: 10 },
    { name: 'Other', value: 5 },
  ];
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      {/* Expense Volume Bar Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#16181d] rounded-[2rem] border border-slate-200 dark:border-slate-800/60 shadow-sm p-6 md:p-8 xl:col-span-2"
      >
        <ChartHeader 
          title="Expense Volume" 
          subtitle="Monthly creation vs total amount" 
          icon={BarChart3} 
          colorClass="text-blue-600" 
        />
        <div className="h-[250px] md:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} className="dark:stroke-slate-800" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
              <Bar dataKey="expenseCount" name="Expenses" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="totalAmount" name="Total Volume" fill="#cbd5e1" className="dark:fill-slate-700" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* User Growth Area Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-[#16181d] rounded-[2rem] border border-slate-200 dark:border-slate-800/60 shadow-sm p-6 md:p-8 xl:col-span-1"
      >
        <ChartHeader 
          title="User Growth" 
          subtitle="New registrations trend" 
          icon={LineIcon} 
          colorClass="text-emerald-600" 
        />
        <div className="h-[250px] md:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} className="dark:stroke-slate-800" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="newUsers" name="New Users" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;
