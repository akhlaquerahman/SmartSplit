import React, { useState } from 'react';
import { MoreVertical, Folder, Users, Receipt, Calendar, ShieldAlert, Trash2, Edit, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const GroupsTable = ({ groups, onRowClick, onDeleteGroup }) => {
  const [activeMenuId, setActiveMenuId] = useState(null);

  return (
    <div className="bg-white dark:bg-[#16181d] rounded-[2rem] border border-slate-200 dark:border-slate-800/60 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Workspace</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Owner</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Category</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Created</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {groups.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Folder size={32} className="opacity-20 mb-3" />
                    <p className="text-sm font-bold uppercase tracking-widest">No Workspaces Found</p>
                  </div>
                </td>
              </tr>
            ) : (
              groups.map((group) => (
                <tr 
                  key={group._id} 
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group/row cursor-pointer"
                  onClick={() => onRowClick(group)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                        <span className="text-lg font-black">{group.name?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{group.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 truncate max-w-[200px]">{group.description || 'No description'}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {(group.createdBy?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{group.createdBy?.name || 'Unknown'}</p>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {group.category || 'General'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit border",
                      group.isArchived 
                        ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" 
                        : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", group.isArchived ? "bg-amber-500" : "bg-emerald-500")} />
                      {group.isArchived ? 'Archived' : 'Active'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-right relative" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === group._id ? null : group._id)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>

                    <AnimatePresence>
                      {activeMenuId === group._id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-6 top-10 w-48 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700/60 z-50 overflow-hidden py-1"
                        >
                          <button onClick={() => { onRowClick(group); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left">
                            <Folder size={14} /> View Details
                          </button>
                          <button onClick={() => { onRowClick(group); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left">
                            <Edit size={14} /> Manage Workspace
                          </button>
                          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                          <button onClick={() => { onDeleteGroup(group._id); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-500 dark:hover:bg-rose-500/10 transition-colors text-left">
                            <Trash2 size={14} /> Delete Workspace
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Click outside to close menu overlay */}
      {activeMenuId && (
        <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
      )}
    </div>
  );
};

export default GroupsTable;
