import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FolderOpen, Receipt, HandCoins, TrendingUp, TrendingDown, RefreshCw, BarChart3, LineChart as LineIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    totalExpenses: 0,
    totalSettlements: 0,
    monthlyStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border shadow-sm p-6 relative overflow-hidden group">
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        <Icon size={120} />
      </div>
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-2xl ${color}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs">
          <p className="font-black mb-2 uppercase tracking-widest text-[10px] opacity-50">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 py-1">
              <span className="font-bold opacity-70">{entry.name}:</span>
              <span className="font-black text-primary-400">
                {entry.name.includes('Amount') ? `Rs. ${entry.value.toFixed(2)}` : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <RefreshCw className="animate-spin text-primary-600" size={40} />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Gathering Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Admin Console</h1>
          <p className="text-slate-500 text-sm font-medium">Real-time platform performance monitoring</p>
        </div>
        <button
          onClick={fetchDashboardStats}
          className="p-3 bg-white dark:bg-slate-900 border rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-50 dark:bg-blue-900/20 text-blue-600"
        />
        <StatCard
          title="Total Groups"
          value={stats.totalGroups}
          icon={FolderOpen}
          color="bg-purple-50 dark:bg-purple-900/20 text-purple-600"
        />
        <StatCard
          title="Expenses Created"
          value={stats.totalExpenses}
          icon={Receipt}
          color="bg-amber-50 dark:bg-amber-900/20 text-amber-600"
        />
        <StatCard
          title="Settlements"
          value={stats.totalSettlements}
          icon={HandCoins}
          color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <BarChart3 className="text-primary-600" size={20} /> Monthly Activity
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Expenses & Spending Volume</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                <Bar 
                  dataKey="expenseCount" 
                  name="Expenses" 
                  fill="#6366f1" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                />
                <Bar 
                  dataKey="totalAmount" 
                  name="Total Amount (Rs.)" 
                  fill="#94a3b8" 
                  radius={[6, 6, 0, 0]} 
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Trends Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <LineIcon className="text-emerald-600" size={20} /> Growth Trends
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">User & Group Onboarding</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyStats}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="newUsers" 
                  name="New Users" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="newGroups" 
                  name="New Groups" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;