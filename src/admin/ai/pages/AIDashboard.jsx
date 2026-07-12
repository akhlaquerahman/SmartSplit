import React from 'react';
import AIPageHeader from '../components/AIPageHeader';
import StatCard from '../components/StatCard';
import { MessageSquare, AlertTriangle, Activity, BookOpen, BrainCircuit, Banknote, Clock, HardDrive, Database, Network } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from 'recharts';

const data = [
  { name: 'Mon', conversations: 400, resolved: 240, fallback: 20 },
  { name: 'Tue', conversations: 300, resolved: 139, fallback: 10 },
  { name: 'Wed', conversations: 200, resolved: 980, fallback: 50 },
  { name: 'Thu', conversations: 278, resolved: 390, fallback: 30 },
  { name: 'Fri', conversations: 189, resolved: 480, fallback: 15 },
  { name: 'Sat', conversations: 239, resolved: 380, fallback: 25 },
  { name: 'Sun', conversations: 349, resolved: 430, fallback: 40 },
];

const AIDashboard = () => {
  return (
    <div className="animate-in fade-in duration-500 p-2 md:p-6 pb-20">
      <AIPageHeader 
        title="Enterprise AI Overview" 
        description="Command Center for SmartSplit AI. Monitor system health, pipelines, and NLP metrics."
      />
      
      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">AI Status</p>
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Online & Routing</p>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center gap-3">
          <Database className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">MongoDB</p>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Connected (12ms)</p>
          </div>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 flex items-center gap-3">
          <Network className="w-5 h-5 text-indigo-500" />
          <div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Embedding Worker</p>
            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Idle (0 in queue)</p>
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 flex items-center gap-3">
          <BrainCircuit className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">Current Model</p>
            <p className="text-sm font-medium text-purple-900 dark:text-purple-100">GPT-4o (OpenAI)</p>
          </div>
        </div>
      </div>

      {/* Primary KPIs */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard title="Conversations Today" value="1,245" icon={MessageSquare} trend="+12%" />
        <StatCard title="Resolved Automatically" value="95.8%" icon={Activity} trend="+1.2%" color="text-green-500" bgColor="bg-green-50" />
        <StatCard title="Fallback Rate" value="4.2%" icon={AlertTriangle} trend="-1.1%" color="text-amber-500" bgColor="bg-amber-50" />
        <StatCard title="Avg Response Time" value="1.2s" icon={Clock} color="text-blue-500" bgColor="bg-blue-50" />
      </div>

      {/* RAG & Knowledge KPIs */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Knowledge Engine (RAG)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Knowledge Docs" value="48" icon={BookOpen} color="text-indigo-500" bgColor="bg-indigo-50" />
        <StatCard title="Indexed Chunks" value="2,140" icon={Database} color="text-indigo-500" bgColor="bg-indigo-50" />
        <StatCard title="Cache Hit Rate" value="68%" icon={HardDrive} color="text-teal-500" bgColor="bg-teal-50" />
        <StatCard title="Vector Hit Rate" value="82%" icon={Network} color="text-teal-500" bgColor="bg-teal-50" />
        <StatCard title="Avg Retrieval" value="145ms" icon={Clock} color="text-blue-500" bgColor="bg-blue-50" />
      </div>

      {/* Deterministic KPIs */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Deterministic Logic</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Active FAQs" value="156" icon={MessageSquare} color="text-emerald-500" bgColor="bg-emerald-50" />
        <StatCard title="Greetings Rules" value="24" icon={Activity} color="text-emerald-500" bgColor="bg-emerald-50" />
        <StatCard title="Fallback Tiers" value="3" icon={AlertTriangle} color="text-emerald-500" bgColor="bg-emerald-50" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Conversation Volume & Resolution</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="conversations" stroke="#3b82f6" fillOpacity={1} fill="url(#colorConversations)" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Fallback Trends</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="fallback" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AIDashboard;