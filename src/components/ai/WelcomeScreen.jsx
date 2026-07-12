import React from 'react';
import { Sparkles, Users, Receipt, BarChart3, HelpCircle } from 'lucide-react';
import { useAIChat } from '../../hooks/useAIChat';

const WelcomeScreen = () => {
  const { sendMessage } = useAIChat();

  const suggestions = [
    { text: 'Create Group', icon: Users },
    { text: 'Add Expense', icon: Receipt },
    { text: 'Reports Analytics', icon: BarChart3 },
    { text: 'What can you do', icon: HelpCircle }
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-16 h-16 rounded-full shadow-[0_8px_30px_rgb(99,102,241,0.4)] flex items-center justify-center text-white bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border border-white/10 mb-2">
        <span className="font-black text-2xl tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>AI</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hello! 👋</h2>
        <p className="text-gray-500">I'm SmartSplit AI. I can help you with groups, expenses, and settlements.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-md mt-4">
        {suggestions.map((s, i) => {
          const Icon = s.icon;
          return (
            <button 
              key={i}
              onClick={() => sendMessage(s.text)}
              className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all text-sm text-gray-700 text-left"
            >
              <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">{s.text}</span>
            </button>
          )
        })}
      </div>
    </div>
  );
};
export default WelcomeScreen;