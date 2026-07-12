import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { RefreshCw } from 'lucide-react';
import AdminHero from '../components/AdminHero';
import AdminKPIs from '../components/AdminKPIs';
import AdminQuickActions from '../components/AdminQuickActions';
import AdminAnalytics from '../components/AdminAnalytics';
import AdminActivityFeed from '../components/AdminActivityFeed';
import AdminPlatformHealth from '../components/AdminPlatformHealth';

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
      const response = await api.get(`/admin/dashboard`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <RefreshCw className="animate-spin text-blue-600" size={40} />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Gathering Platform Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AdminHero stats={stats} />
      <AdminQuickActions />
      <AdminAnalytics stats={stats} />
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[500px]">
        <AdminPlatformHealth platformHealth={stats.platformHealth} />
        <AdminActivityFeed activities={stats.activityFeed} />
      </div>
    </div>
  );
};

export default Dashboard;