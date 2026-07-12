import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, SkipForward, AlertCircle, Cpu, Shield, MessageSquare, Zap, Activity, Hash, BookOpen, Key, Link } from 'lucide-react';

const getStageIcon = (stageName) => {
  switch (stageName) {
    case 'Raw Input': return <MessageSquare size={16} />;
    case 'Normalizer': return <Activity size={16} />;
    case 'Gibberish Detector': return <Shield size={16} />;
    case 'Spell Check': return <CheckCircle size={16} />;
    case 'Alias Engine': return <Link size={16} />;
    case 'Regex Engine': return <Hash size={16} />;
    case 'Intent Detector': return <Zap size={16} />;
    case 'Context Decision': return <Shield size={16} />;
    case 'Prompt Construction': return <Key size={16} />;
    case 'RAG Retrieval': return <BookOpen size={16} />;
    case 'Semantic Cache': return <Clock size={16} />;
    case 'LLM Router': return <Cpu size={16} />;
    default: return <Clock size={16} />;
  }
};

const TraceTimeline = ({ trace }) => {
  const [expandedStage, setExpandedStage] = useState(null);

  if (!trace || !trace.pipeline) return <div className="p-4 text-slate-400">Waiting for trace data...</div>;

  return (
    <div className="space-y-4 relative">
      {/* Vertical Line */}
      <div className="absolute top-0 bottom-0 left-[23px] w-px bg-slate-800 z-0"></div>
      
      {trace.pipeline.map((stage, index) => {
        const isExpanded = expandedStage === index;
        const isSkipped = stage.status === 'SKIPPED';
        const isError = stage.status === 'ERROR';
        
        let colorClass = "text-green-400 bg-green-400/10 border-green-400/30";
        if (isSkipped) colorClass = "text-slate-500 bg-slate-800 border-slate-700";
        if (isError) colorClass = "text-red-400 bg-red-400/10 border-red-400/30";

        return (
          <div key={index} className="relative z-10 flex flex-col gap-2">
            <div 
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-800 transition-colors ${isExpanded ? 'bg-slate-800' : 'bg-slate-900'} ${isSkipped ? 'opacity-70' : ''}`}
              onClick={() => setExpandedStage(isExpanded ? null : index)}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${colorClass}`}>
                {isSkipped ? <SkipForward size={14} /> : getStageIcon(stage.stage)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 truncate text-sm">{stage.stage}</span>
                  <span className="text-xs font-mono text-slate-400">{stage.latency}ms</span>
                </div>
                <div className="text-xs text-slate-500 truncate mt-0.5">
                  {stage.reason || stage.status}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="ml-12 p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-4 shadow-inner text-sm font-mono overflow-x-auto">
                {stage.input && (
                  <div>
                    <span className="text-slate-500 text-xs block mb-1">INPUT</span>
                    <pre className="text-slate-300 whitespace-pre-wrap break-all">{typeof stage.input === 'object' ? JSON.stringify(stage.input, null, 2) : stage.input}</pre>
                  </div>
                )}
                
                {stage.output && (
                  <div>
                    <span className="text-slate-500 text-xs block mb-1">OUTPUT</span>
                    <pre className="text-slate-300 whitespace-pre-wrap break-all">{typeof stage.output === 'object' ? JSON.stringify(stage.output, null, 2) : stage.output}</pre>
                  </div>
                )}

                {stage.metadata && Object.keys(stage.metadata).length > 0 && (
                  <div>
                    <span className="text-slate-500 text-xs block mb-1">METADATA</span>
                    <pre className="text-amber-300/80 text-xs whitespace-pre-wrap break-all">{JSON.stringify(stage.metadata, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TraceTimeline;
