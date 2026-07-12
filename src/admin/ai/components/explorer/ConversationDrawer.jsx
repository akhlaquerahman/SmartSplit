import React, { useState } from 'react';
import useExplorerStore from '../../store/useExplorerStore';
import { useConversationDetails } from '../../hooks/useConversationExplorer';
import { X, Activity, MessageSquare, Database, BrainCircuit } from 'lucide-react';

const ConversationDrawer = () => {
  const { isDrawerOpen, selectedConversationId, closeDrawer } = useExplorerStore();
  const { data, isLoading } = useConversationDetails(selectedConversationId);
  const [activeTab, setActiveTab] = useState('Overview');

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[650px] bg-white dark:bg-[#1a1a1a] shadow-2xl border-l border-gray-200 dark:border-white/10 z-50 flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#111111] flex items-center justify-between shrink-0">
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Session Details</h3>
          <p className="text-xs text-gray-500 font-mono mt-1">{selectedConversationId}</p>
        </div>
        <button onClick={closeDrawer} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 flex items-center gap-6 border-b border-gray-200 dark:border-white/10 shrink-0 overflow-x-auto custom-scrollbar">
        {['Overview', 'Messages', 'Pipeline', 'Knowledge', 'Tools', 'Timeline'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#141414] custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500">Loading deep diagnostics...</div>
        ) : !data ? (
          <div className="flex items-center justify-center h-full text-gray-500">Failed to load conversation</div>
        ) : (
          <div className="space-y-6">
            
            {activeTab === 'Overview' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl">
                  <p className="text-xs text-gray-500 mb-1 uppercase font-bold tracking-wider">User</p>
                  <p className="font-medium text-gray-900 dark:text-white">{data.overview.name || (data.overview.username ? `@${data.overview.username}` : 'Unknown')}</p>
                  <p className="text-sm text-gray-500">{data.overview.email}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl">
                  <p className="text-xs text-gray-500 mb-1 uppercase font-bold tracking-wider">Status</p>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-bold">{data.overview.status}</span>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl">
                  <p className="text-xs text-gray-500 mb-1 uppercase font-bold tracking-wider">Source</p>
                  <p className="font-medium text-gray-900 dark:text-white">{data.overview.metadata?.source || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl">
                  <p className="text-xs text-gray-500 mb-1 uppercase font-bold tracking-wider">Intent</p>
                  <p className="font-medium text-gray-900 dark:text-white font-mono">{data.overview.metadata?.intent || 'UNKNOWN'}</p>
                </div>
              </div>
            )}

            {activeTab === 'Messages' && (
              <div className="space-y-6">
                {data.messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? '' : ''}`}>
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white ${msg.role === 'user' ? 'bg-gray-300 dark:bg-gray-700' : 'bg-blue-600'}`}>
                      {msg.role === 'user' ? 'U' : <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className={`p-4 rounded-2xl border shadow-sm text-sm ${msg.role === 'user' ? 'bg-white dark:bg-[#222] border-gray-200 dark:border-gray-800 rounded-tl-sm' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900 rounded-tr-sm text-blue-900 dark:text-blue-100'}`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">{new Date(msg.createdAt).toLocaleTimeString()} • {msg.tokenCount} tokens</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Pipeline' && (
              <div className="pl-6 space-y-4 relative before:absolute before:inset-y-0 before:left-[1rem] before:w-px before:bg-blue-200">
                <div className="flex items-center gap-3 text-sm text-gray-600 bg-white dark:bg-[#1a1a1a] border border-gray-200 p-3 rounded-lg shadow-sm">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span><strong>NLU Engine:</strong> Input normalized. No aliases matched.</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 bg-white dark:bg-[#1a1a1a] border border-gray-200 p-3 rounded-lg shadow-sm">
                  <Database className="w-4 h-4 text-indigo-500" />
                  <span><strong>Vector Search:</strong> Retrieved 2 chunks from MongoDB (Similarity: 0.89)</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 bg-white dark:bg-[#1a1a1a] border border-gray-200 p-3 rounded-lg shadow-sm">
                  <BrainCircuit className="w-4 h-4 text-purple-500" />
                  <span><strong>LLM Router:</strong> Sent prompt to GPT-4o. Output generated in 1.2s.</span>
                </div>
              </div>
            )}

            {['Knowledge', 'Tools', 'Timeline'].includes(activeTab) && (
              <div className="text-center text-gray-500 py-10">
                Advanced telemetry for {activeTab} is tracked but rendering logic is pending in next version.
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationDrawer;