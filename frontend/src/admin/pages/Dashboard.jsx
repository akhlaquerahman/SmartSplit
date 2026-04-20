import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FolderOpen, Receipt, HandCoins, TrendingUp, TrendingDown } from 'lucide-react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    totalExpenses: 0,
    totalSettlements: 0,
    activityData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('API URL:', `${import.meta.env.VITE_API_URL}/api/admin/dashboard`);
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Dashboard response:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error.response?.data || error.message);
      console.error('Error status:', error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              <span className="text-sm">{trendValue}</span>
            </div>
          )}
        </div>
        <Icon className="h-8 w-8 text-blue-600" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={fetchDashboardStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Total Groups"
          value={stats.totalGroups}
          icon={FolderOpen}
          trend="up"
          trendValue="+8%"
        />
        <StatCard
          title="Total Expenses"
          value={stats.totalExpenses}
          icon={Receipt}
          trend="up"
          trendValue="+15%"
        />
        <StatCard
          title="Total Settlements"
          value={stats.totalSettlements}
          icon={HandCoins}
          trend="down"
          trendValue="-3%"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Activity</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Chart will be displayed here</p>
          </div>
        </div>

        {/* Trends Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Growth Trends</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;