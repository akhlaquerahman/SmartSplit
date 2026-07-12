import React from 'react';
import { motion } from 'framer-motion';
import { Server, Database, Cloud, Mail, Zap, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Activity } from 'lucide-react';
import { cn } from '../../utils/cn';

const HealthItem = ({ title, status, uptime, latency, icon: Icon, delay }) => {
  let statusColor = "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20";
  let statusIcon = <CheckCircle2 size={16} />;
  let statusText = "Healthy";

  if (status === 'warning') {
    statusColor = "text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20";
    statusIcon = <AlertTriangle size={16} />;
    statusText = "Warning";
  } else if (status === 'critical') {
    statusColor = "text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20";
    statusIcon = <XCircle size={16} />;
    statusText = "Critical";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className={cn("p-2.5 rounded-xl border", statusColor)}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</p>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {uptime} Uptime
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span>{latency} latency</span>
          </div>
        </div>
      </div>
      
      <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold", 
        status === 'healthy' ? "text-emerald-600 dark:text-emerald-400" : 
        status === 'warning' ? "text-amber-600 dark:text-amber-400" : 
        "text-rose-600 dark:text-rose-400"
      )}>
        {statusIcon}
        <span className="hidden sm:inline">{statusText}</span>
      </div>
    </motion.div>
  );
};

const AdminPlatformHealth = ({ platformHealth }) => {
  const defaultServices = [
    { title: 'Core API Servers', status: 'healthy', uptime: '99.99%', latency: '45ms', icon: Server },
    { title: 'Primary Database', status: 'healthy', uptime: '100%', latency: '12ms', icon: Database },
    { title: 'Storage Buckets', status: 'healthy', uptime: '99.98%', latency: '85ms', icon: Cloud },
    { title: 'Email Queue', status: 'healthy', uptime: '99.95%', latency: '1.2s', icon: Mail },
    { title: 'Background Jobs', status: 'healthy', uptime: '99.99%', latency: '30ms', icon: Zap },
    { title: 'Authentication', status: 'healthy', uptime: '100%', latency: '65ms', icon: RefreshCw },
  ];

  const services = platformHealth?.services?.map((svc, i) => {
    const Icon = defaultServices[i]?.icon || Server;
    return { ...svc, icon: Icon };
  }) || defaultServices;

  const isAllOperational = !services.some(s => s.status !== 'healthy');

  return (
    <div className="bg-white dark:bg-[#16181d] rounded-[2rem] border border-slate-200 dark:border-slate-800/60 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Activity className="text-blue-500" size={20} /> Platform Health
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Live Service Status</p>
        </div>
        <div className={cn("px-3 py-1.5 text-xs font-bold rounded-full border flex items-center gap-1.5",
          isAllOperational ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20"
        )}>
          <span className={cn("w-2 h-2 rounded-full animate-pulse", isAllOperational ? "bg-emerald-500" : "bg-amber-500")} />
          {isAllOperational ? "All Systems Operational" : "System Warnings"}
        </div>
      </div>
      
      <div className="p-4 md:p-6 flex-1 flex flex-col gap-3">
        {services.map((service, i) => (
          <HealthItem key={service.title} {...service} delay={i * 0.1} />
        ))}
      </div>
    </div>
  );
};

export default AdminPlatformHealth;
