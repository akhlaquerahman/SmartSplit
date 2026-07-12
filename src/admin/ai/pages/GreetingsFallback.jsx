import React, { useState } from 'react';
import AIPageHeader from '../components/AIPageHeader';
import { MessageCircle, ShieldAlert, Edit2 } from 'lucide-react';

const GreetingsFallback = () => {
  const [activeTab, setActiveTab] = useState('Greetings');

  return (
    <div className="animate-in fade-in duration-500 p-2 md:p-6 pb-20">
      <AIPageHeader 
        title="Greetings & Fallback Engine" 
        description="Manage edge-case conversations: Welcome messages and Human Escalation thresholds."
      />

      <div className="flex items-center gap-6 border-b border-gray-200 dark:border-white/10 mb-6">
        <button 
          onClick={() => setActiveTab('Greetings')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'Greetings' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500'}`}
        >
          <MessageCircle className="w-4 h-4" /> Greetings
        </button>
        <button 
          onClick={() => setActiveTab('Fallback')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'Fallback' ? 'border-amber-600 text-amber-600 dark:text-amber-400' : 'border-transparent text-gray-500'}`}
        >
          <ShieldAlert className="w-4 h-4" /> Fallback & Escalation
        </button>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-6">
        {activeTab === 'Greetings' && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Welcome Messages</h3>
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-black/50 text-xs uppercase text-gray-500 font-semibold tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="p-4">Input Triggers (Aliases)</th>
                    <th className="p-4">Static Response</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  <tr className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="p-4"><span className="text-sm font-mono text-gray-700 dark:text-gray-300">hello, hi, hey, good morning</span></td>
                    <td className="p-4"><span className="text-sm text-gray-600 dark:text-gray-400">Hi there! How can I help you with SmartSplit today?</span></td>
                    <td className="p-4 text-right"><button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500"><Edit2 className="w-4 h-4" /></button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Fallback' && (
          <div className="max-w-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confidence Thresholds</h3>
            <p className="text-sm text-gray-500 mb-6">If the deterministic engine and LLM confidence both fall below these thresholds, trigger the fallback responses.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Primary Fallback Message (Confidence &lt; 40%)</label>
                <textarea className="w-full p-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" rows="2" defaultValue="I'm not completely sure about that. Could you rephrase your question?" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Secondary Escalation Message (Retry count &gt; 2)</label>
                <textarea className="w-full p-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" rows="2" defaultValue="It seems I'm unable to help with this. Would you like me to connect you with a human agent?" />
              </div>
              <button className="bg-amber-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-amber-700 transition">Save Fallback Logic</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default GreetingsFallback;