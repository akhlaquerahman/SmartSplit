import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const GroupsGrid = ({ groups, onCreateGroup }) => {
  if (!groups || groups.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-[#16181d] rounded-2xl border border-dashed dark:border-slate-800">
        <Users size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 mb-4">No groups yet. Start by creating one!</p>
        <button onClick={onCreateGroup} className="text-primary-600 font-bold hover:underline">
          Create your first group
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users size={20} className="text-primary-600" /> Active Groups
        </h2>
        <Link to="/groups" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center">
          View All <ChevronRight size={16} />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5">
        {groups.map((group, idx) => {
          const totalSpent = group.summary?.totalExpense || 0;
          const progress = Math.min((totalSpent / (group.budget || Math.max(totalSpent, 1000))) * 100, 100);
          
          return (
            <Link key={group._id} to={`/group/${group._id}`}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-[#16181d] p-5 rounded-2xl border dark:border-slate-800/60 hover:shadow-lg hover:border-primary-500/30 transition-all group-card"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-md uppercase tracking-wide">
                      {group.category}
                    </span>
                  </div>
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 3).map((m, i) => (
                      <img key={i} src={m.user.avatar} className="w-7 h-7 rounded-full border-2 border-white dark:border-[#16181d]" title={m.user.name} alt={m.user.name} />
                    ))}
                    {group.members.length > 3 && (
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-[#16181d] flex items-center justify-center text-[9px] font-bold text-slate-500">
                        +{group.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold mb-1 truncate text-slate-900 dark:text-white">{group.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-4 h-4">{group.description || 'No description'}</p>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-slate-500">Spent: ₹{totalSpent.toFixed(0)}</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {group.budget ? `₹${group.budget}` : 'No limit'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${progress > 90 ? 'bg-red-500' : progress > 70 ? 'bg-amber-500' : 'bg-primary-500'}`} 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t dark:border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {progress < 100 ? (
                        <CheckCircle2 size={14} className="text-green-500" />
                      ) : (
                        <AlertCircle size={14} className="text-red-500" />
                      )}
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {progress < 100 ? 'On Track' : 'Over Budget'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default GroupsGrid;
