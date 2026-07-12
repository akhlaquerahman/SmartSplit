import React, { useState } from 'react';
import { X, Server, Activity, ShieldAlert, Check, Clock, Code, AlertOctagon, Info, AlertTriangle, Fingerprint, Lock, Globe, Terminal, MapPin, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const LogDrawer = ({ logData, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('payload');

  if (!isOpen || !logData) return null;

  const { log, details } = logData;
  const { category, action, risk, type, icon: Icon, color } = details;

  // Mock JSON payload for enterprise SOC feel
  const mockPayload = {
    eventId: `audit_${log._id}`,
    timestamp: log.timestamp,
    category: category,
    action: action,
    status: type === 'success' ? 'SUCCESS' : type === 'failed' ? 'FAILED' : 'WARNING',
    riskLevel: risk,
    actor: {
      userId: log.userId || 'sys_0000',
      username: log.username || 'System User',
      email: log.email || 'system@smartsplit.internal',
      ipAddress: log.ipAddress,
      userAgent: log.userAgent || 'SmartSplit Internal Client',
      device: log.deviceInfo || {}
    },
    context: {
      environment: "production",
      region: "us-east-1",
      serverHost: "prod-cluster-01.smartsplit.internal",
      processId: 48922,
    },
    request: {
      method: 'POST',
      url: `/api/v1/internal/${category.toLowerCase()}/execute`,
      headers: {
        'x-forwarded-for': log.ipAddress,
        'authorization': 'Bearer ******'
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-0"
        />
        
        {/* Drawer Panel */}
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-[650px] h-full bg-white dark:bg-[#16181d] border-l border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Audit Event Inspector</h2>
              <p className="text-[10px] font-bold text-slate-500 font-mono mt-1 uppercase tracking-widest">Event ID: AUDIT-{log._id.substring(0,8).toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Hero Section */}
          <div className="p-6 pb-0 flex flex-col border-b border-slate-100 dark:border-slate-800/60 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-900/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest border",
                  type === 'success' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20" :
                  type === 'failed' ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200/50 dark:border-rose-500/20" :
                  "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20"
                )}>
                  {type === 'success' ? 'Success' : type === 'failed' ? 'Failed' : 'Warning'}
                </span>
                
                <span className={cn(
                  "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest border",
                  risk === 'Critical' ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200/50 dark:border-rose-500/20" :
                  risk === 'High' ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200/50 dark:border-orange-500/20" :
                  risk === 'Medium' ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20" :
                  risk === 'Low' ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/20" :
                  "bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200/50 dark:border-slate-500/20"
                )}>
                  {risk} Risk
                </span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
                 <Icon size={24} className={color} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {action}
                </h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">{category} Event</p>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex items-center gap-6 w-full mt-2">
              <button 
                onClick={() => setActiveTab('payload')}
                className={cn(
                  "pb-3 text-[11px] font-black tracking-widest uppercase transition-colors relative flex items-center gap-1",
                  activeTab === 'payload' ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                <Code size={12} /> JSON Payload
                {activeTab === 'payload' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('overview')}
                className={cn(
                  "pb-3 text-[11px] font-black tracking-widest uppercase transition-colors relative",
                  activeTab === 'overview' ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                Actor Details
                {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('timeline')}
                className={cn(
                  "pb-3 text-[11px] font-black tracking-widest uppercase transition-colors relative",
                  activeTab === 'timeline' ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                Audit Trail
                {activeTab === 'timeline' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />}
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/10">
            
            {activeTab === 'payload' && (
              <div className="h-full animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-4">
                
                <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-inner border border-slate-800">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-slate-700">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">audit_event.json</span>
                    <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-colors">Copy</button>
                  </div>
                  <div className="p-4 overflow-auto max-h-[350px]">
                    <pre className="text-[12px] font-mono text-slate-300 leading-relaxed">
                      <code>{JSON.stringify(mockPayload, null, 2)}</code>
                    </pre>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#16181d] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm overflow-hidden">
                   <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">HTTP Request Headers (Mock)</span>
                   </div>
                   <div className="p-4">
                     <pre className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                       <span className="text-slate-900 dark:text-white font-bold">Host:</span> api.smartsplit.com<br/>
                       <span className="text-slate-900 dark:text-white font-bold">User-Agent:</span> {log.userAgent || 'Mozilla/5.0'}<br/>
                       <span className="text-slate-900 dark:text-white font-bold">Accept:</span> application/json<br/>
                       <span className="text-slate-900 dark:text-white font-bold">X-Forwarded-For:</span> {log.ipAddress}<br/>
                       <span className="text-slate-900 dark:text-white font-bold">X-Trace-Id:</span> trace_{log._id.substring(8,24)}
                     </pre>
                   </div>
                 </div>

              </div>
            )}

            {activeTab === 'overview' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Insights Grid */}
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Entity Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-[#16181d] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex flex-col gap-2">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0 w-max"><Fingerprint size={16} /></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identity</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5 truncate">{log.username || 'System User'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{log.email || 'system@smartsplit.internal'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-[#16181d] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex flex-col gap-2">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0 w-max"><Globe size={16} /></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5 font-mono truncate">{log.ipAddress}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 truncate"><MapPin size={10} /> {log.location || 'Unknown Location'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#16181d] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm overflow-hidden mt-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/60 flex items-center gap-2">
                    <Monitor size={14} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Fingerprint</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Browser</p>
                       <p className="text-xs font-bold text-slate-900 dark:text-white">{log.deviceInfo?.browser || 'Unknown'}</p>
                     </div>
                     <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Operating System</p>
                       <p className="text-xs font-bold text-slate-900 dark:text-white">{log.deviceInfo?.os || 'Unknown'}</p>
                     </div>
                     <div className="col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Raw User Agent</p>
                       <p className="text-[10px] font-mono text-slate-500 break-all">{log.userAgent || 'Mozilla/5.0 (Internal Client)'}</p>
                     </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-8 mt-2">
                  <div className="relative opacity-50">
                    <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-400 flex items-center justify-center">
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">Session Initiated</h5>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">2 minutes prior</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase">{action}</h5>
                      <p className="text-xs text-slate-500 mt-1">Primary action recorded in audit log.</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="relative opacity-50">
                    <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center">
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-500">Log Ingestion</h5>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Processing queue...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LogDrawer;
