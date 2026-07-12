import React from 'react';
import { Activity } from 'lucide-react';

const WaterfallVisualizer = () => {
  // Mock Data mimicking AITracer Spans
  const spans = [
    { name: 'NLU / Intent', ms: 45, width: '10%' },
    { name: 'Vector Search', ms: 120, width: '25%' },
    { name: 'MongoDB Query', ms: 30, width: '5%' },
    { name: 'LLM Generation', ms: 850, width: '60%' },
  ];

  return (
    <div className="border border-slate-700 rounded bg-slate-950 p-4">
      <h3 className="text-xs font-mono font-bold text-slate-400 mb-4 flex items-center gap-2 uppercase">
        <Activity className="w-4 h-4" /> Pipeline Latency Waterfall
      </h3>
      <div className="space-y-3">
        {spans.map((span, i) => (
          <div key={i} className="flex items-center text-xs font-mono">
            <div className="w-32 text-slate-500 truncate pr-2">{span.name}</div>
            <div className="flex-1 bg-slate-900 h-6 rounded overflow-hidden flex items-center relative">
              <div 
                className="h-full bg-blue-900/50 border-r border-blue-500/50" 
                style={{ width: span.width }}
              />
              <span className="absolute left-2 text-blue-300">{span.ms}ms</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default WaterfallVisualizer;