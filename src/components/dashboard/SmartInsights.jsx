import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, TrendingDown, Clock, PiggyBank } from 'lucide-react';

const SmartInsights = ({ insights }) => {
  return (
    <div className="bg-white dark:bg-[#16181d] p-6 rounded-2xl border dark:border-slate-800/60 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-lg">
          <Lightbulb size={18} />
        </div>
        <h3 className="text-lg font-bold">Smart Insights</h3>
      </div>
      
      <div className="space-y-4">
        {insights.map((insight, index) => {
          let Icon = Lightbulb;
          let colorClass = "text-slate-500";
          let bgClass = "bg-slate-50 dark:bg-slate-800/50";
          
          if (insight.type === 'increase') {
            Icon = TrendingUp;
            colorClass = "text-red-500";
            bgClass = "bg-red-50 dark:bg-red-500/10";
          } else if (insight.type === 'decrease') {
            Icon = TrendingDown;
            colorClass = "text-green-500";
            bgClass = "bg-green-50 dark:bg-green-500/10";
          } else if (insight.type === 'warning') {
            Icon = Clock;
            colorClass = "text-orange-500";
            bgClass = "bg-orange-50 dark:bg-orange-500/10";
          } else if (insight.type === 'saving') {
            Icon = PiggyBank;
            colorClass = "text-teal-500";
            bgClass = "bg-teal-50 dark:bg-teal-500/10";
          }

          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className={`p-1.5 rounded-md mt-0.5 ${bgClass} ${colorClass}`}>
                <Icon size={14} />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {insight.message}
              </p>
            </motion.div>
          );
        })}
        {insights.length === 0 && (
          <p className="text-sm text-slate-500 italic text-center py-4">No insights available right now.</p>
        )}
      </div>
    </div>
  );
};

export default SmartInsights;
