import React, { useState } from 'react';
import { MoreVertical, ChevronDown, Info, Server, ShieldCheck, Fingerprint, Lock, ShieldAlert, FileText, Monitor, Smartphone, Globe, Terminal, Activity, Database, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

// Mocking enterprise log details
const getMockEventDetails = (log) => {
  // If it's a login log but we want to simulate an enterprise SOC, we'll randomize some event types based on id length or timestamp modulo
  const modulo = new Date(log.timestamp).getTime() % 10;
  
  if (modulo === 0) return { category: 'Security', action: 'Failed Authentication', risk: 'High', type: 'failed', icon: ShieldAlert, color: 'text-rose-500' };
  if (modulo === 1) return { category: 'Admin', action: 'Modified System Settings', risk: 'Medium', type: 'warning', icon: Terminal, color: 'text-amber-500' };
  if (modulo === 2) return { category: 'API', action: 'API Key Rotation', risk: 'Low', type: 'success', icon: Key, color: 'text-emerald-500' };
  if (modulo === 3) return { category: 'Database', action: 'Manual DB Export', risk: 'High', type: 'warning', icon: Database, color: 'text-orange-500' };
  
  return { category: 'Authentication', action: 'User Login', risk: 'Normal', type: 'success', icon: Fingerprint, color: 'text-blue-500' };
};

const getDeviceIcon = (device) => {
  if (device?.toLowerCase().includes('phone') || device?.toLowerCase().includes('mobile')) return <Smartphone size={14} className="text-slate-500" />;
  if (device?.toLowerCase().includes('mac') || device?.toLowerCase().includes('windows')) return <Monitor size={14} className="text-slate-500" />;
  return <Globe size={14} className="text-slate-500" />;
};

const RiskBadge = ({ risk }) => {
  const risks = {
    'Critical': 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200/50 dark:border-rose-500/20',
    'High': 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200/50 dark:border-orange-500/20',
    'Medium': 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20',
    'Low': 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/20',
    'Normal': 'bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200/50 dark:border-slate-500/20',
  };
  const colorClass = risks[risk] || risks.Normal;
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider", colorClass)}>
      {risk}
    </span>
  );
};

const StatusBadge = ({ type }) => {
  if (type === 'success') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20 uppercase tracking-wider">Success</span>;
  }
  if (type === 'failed') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20 uppercase tracking-wider">Failed</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20 uppercase tracking-wider">Warning</span>;
};

const LogsTable = ({ logs, onRowClick }) => {
  const [activeMenuId, setActiveMenuId] = useState(null);

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-[#16181d] rounded-[2rem] border border-slate-200 dark:border-slate-800/60 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[1200px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/60">
              <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-600 flex items-center gap-1">
                Timestamp <ChevronDown size={14} />
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Event / Action
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                User / Entity
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                IP & Location
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden lg:table-cell">
                Client / Device
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Status
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Risk
              </th>
              <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
                      <FileText size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">No Logs Found</p>
                    <p className="text-xs text-slate-500 mt-1">No activity matches the current filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const eventDetails = getMockEventDetails(log);
                const Icon = eventDetails.icon;
                
                return (
                  <tr 
                    key={log._id} 
                    onClick={() => onRowClick(log, eventDetails)}
                    className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-6">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] font-mono font-medium text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}.{new Date(log.timestamp).getMilliseconds()}
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-3 px-3">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
                            <Icon size={14} className={eventDetails.color} />
                         </div>
                         <div className="flex flex-col">
                           <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{eventDetails.action}</span>
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{eventDetails.category}</span>
                         </div>
                       </div>
                    </td>
                    
                    <td className="py-3 px-3 max-w-[150px]">
                       <div className="flex flex-col gap-0.5">
                         <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                           {log.username || 'System User'}
                         </span>
                         <span className="text-[10px] text-slate-500 truncate">
                           {log.email || 'system@smartsplit.internal'}
                         </span>
                       </div>
                    </td>
                    
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                          {log.ipAddress}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                          <Globe size={10} /> {log.location || 'Unknown Location'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700">
                          {getDeviceIcon(log.deviceInfo?.device)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                            {log.deviceInfo?.browser || 'Unknown Client'}
                          </span>
                          <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">
                            {log.deviceInfo?.os || 'Unknown OS'}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-3 px-3">
                      <StatusBadge type={eventDetails.type} />
                    </td>

                    <td className="py-3 px-3">
                      <RiskBadge risk={eventDetails.risk} />
                    </td>
                    
                    <td className="py-3 px-6 text-right relative" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={(e) => toggleMenu(e, log._id)}
                        className={cn(
                          "p-2 rounded-xl transition-colors",
                          activeMenuId === log._id 
                            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white" 
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-50 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                        )}
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      <AnimatePresence>
                        {activeMenuId === log._id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.1 }}
                            className="absolute right-6 top-10 w-40 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700/60 z-50 py-1 overflow-hidden"
                          >
                            <button onClick={() => { onRowClick(log, eventDetails); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left">
                              <Info size={14} /> Inspect Payload
                            </button>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                            <button onClick={() => { setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10 transition-colors text-left">
                              <Activity size={14} /> View User Trace
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {activeMenuId && (
        <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
      )}
    </div>
  );
};

export default LogsTable;
