import React from 'react';
import { X, Minimize2, PanelLeft, Bot, Activity } from 'lucide-react';
import useAIChatStore from '../../store/useAIChatStore';
import useDebuggerStore from '../../store/useDebuggerStore';

const AIChatHeader = () => {
  const { closeChat, toggleSidebar, isStreaming } = useAIChatStore();
  const { toggleDrawer } = useDebuggerStore();

  return (
    <div className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10 shadow-sm">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
          <PanelLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full shadow-[0_2px_10px_rgb(99,102,241,0.3)] flex items-center justify-center text-white bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border border-white/10 shrink-0">
          <span className="font-black text-[11px] tracking-tight" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>AI</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">SmartSplit AI</h3>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></span>
            {isStreaming ? 'Thinking...' : 'Online'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={toggleDrawer}
          className="px-2 py-1 bg-slate-900 text-green-400 font-mono text-[10px] font-bold rounded shadow-sm hover:bg-slate-800 transition-colors"
        >
          DEV MODE
        </button>
        <button onClick={closeChat} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
export default AIChatHeader;