import React from 'react';
import { X, Maximize2, Minimize2, Terminal, RefreshCw } from 'lucide-react';
import useDebuggerStore from '../../../store/useDebuggerStore';
import TraceTimeline from './TraceTimeline';
import TraceSummaryCard from './TraceSummaryCard';

const DebuggerDrawer = () => {
  const { isOpen, isFullScreen, toggleFullScreen, closeDebugger, activeTrace } = useDebuggerStore();

  if (!isOpen) return null;

  return (
    <div className={`fixed top-0 right-0 h-full bg-[#0d1117] text-slate-300 border-l border-slate-700 z-[110] shadow-2xl flex flex-col transition-all duration-300 ${isFullScreen ? 'w-full' : 'w-full sm:w-[500px]'}`}>
      {/* Header */}
      <div className="h-14 border-b border-slate-700 flex items-center justify-between px-4 bg-[#010409]">
        <div className="flex items-center gap-2 text-green-400 font-mono text-sm font-bold tracking-wider">
          <Terminal className="w-4 h-4" /> AI TRACE CONSOLE
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-800 rounded text-slate-400" title="Refresh Trace">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={toggleFullScreen} className="p-2 hover:bg-slate-800 rounded text-slate-400">
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={closeDebugger} className="p-2 hover:bg-slate-800 rounded text-red-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0d1117] font-sans">
        {activeTrace ? (
          <>
            <TraceSummaryCard trace={activeTrace} />
            
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">
              Pipeline Execution Trace
            </div>
            
            <TraceTimeline trace={activeTrace} />
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
            <Terminal size={48} className="opacity-20" />
            <p className="font-mono text-sm">Waiting for incoming trace data...</p>
            <p className="text-xs max-w-xs text-center opacity-60">Send a message in the chat to see the complete execution lifecycle.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebuggerDrawer;