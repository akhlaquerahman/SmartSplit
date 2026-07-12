import React from 'react';
import { Activity, Clock, FileText, Zap } from 'lucide-react';

const TraceSummaryCard = ({ trace }) => {
  if (!trace) return null;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-lg mb-6">
      <h3 className="text-slate-300 font-semibold mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
        <Activity size={16} className="text-blue-400" /> Execution Summary
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-slate-500 text-xs">Total Latency</span>
          <div className="text-slate-200 font-mono flex items-center gap-2">
            <Clock size={14} className="text-amber-400" />
            {trace.latency || 0}ms
          </div>
        </div>
        
        <div className="space-y-1">
          <span className="text-slate-500 text-xs">Final Intent</span>
          <div className="text-slate-200 font-mono text-sm truncate">
            {trace.pipeline?.find(s => s.stage === 'Intent Detector')?.output || 'Unknown'}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-slate-500 text-xs">Gemini Called</span>
          <div className="text-slate-200 font-mono flex items-center gap-2">
            {trace.geminiCalled ? (
              <span className="text-red-400">TRUE</span>
            ) : (
              <span className="text-green-400">FALSE (Skipped)</span>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-slate-500 text-xs">Cache Hit</span>
          <div className="text-slate-200 font-mono flex items-center gap-2">
             {trace.cacheHit ? (
              <span className="text-green-400"><Zap size={14} className="inline mr-1"/> TRUE</span>
            ) : (
              <span className="text-slate-400">FALSE</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
        <span className="text-slate-500 text-xs">Normalized Input</span>
        <div className="text-slate-300 font-mono text-xs bg-slate-950 p-2 rounded break-all">
          "{trace.normalizedInput || trace.rawInput}"
        </div>
      </div>
    </div>
  );
};

export default TraceSummaryCard;
