import React from 'react';
import { Users, Receipt, Send, FileText, Wallet, MessageSquareText } from 'lucide-react';
import useAIChatStore from '../../../store/useAIChatStore';

const FeatureCatalog = () => {
  // We can hook into the chat store to dispatch messages for the actions
  // This requires the chat hook, but for now we can just display the features
  
  const handleFeatureClick = (action) => {
    document.dispatchEvent(new CustomEvent('aiChatSend', { detail: action }));
  };

  const features = [
    { icon: <Users className="w-5 h-5 text-blue-500" />, title: 'Create Group', query: 'create group', desc: 'Start a new expense group' },
    { icon: <Receipt className="w-5 h-5 text-orange-500" />, title: 'Add Expense', query: 'add expense', desc: 'Record a new bill' },
    { icon: <Send className="w-5 h-5 text-emerald-500" />, title: 'Settlement', query: 'request settlement', desc: 'Settle pending dues' },
    { icon: <FileText className="w-5 h-5 text-indigo-500" />, title: 'Reports', query: 'reports', desc: 'View financial summary' },
    { icon: <Wallet className="w-5 h-5 text-purple-500" />, title: 'Net Balance', query: 'my balance', desc: 'Check total owe/owed' },
    { icon: <MessageSquareText className="w-5 h-5 text-teal-500" />, title: 'Ask Questions', query: 'how do i split unevenly', desc: 'Search knowledge base' },
  ];

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm w-full">
      <div className="mb-4 pb-3 border-b border-gray-50">
        <h3 className="font-semibold text-gray-800 text-lg">What I Can Do</h3>
        <p className="text-xs text-gray-500 mt-1">Click any action to start or type naturally in the chat.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {features.map((feature, idx) => (
          <button 
            key={idx}
            onClick={() => handleFeatureClick(feature.query)}
            className="flex flex-col items-start p-3 border border-gray-100 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all text-left group"
          >
            <div className="p-2 bg-gray-50 rounded-md group-hover:bg-white transition-colors mb-2">
              {feature.icon}
            </div>
            <div className="font-medium text-gray-800 text-sm mb-0.5">{feature.title}</div>
            <div className="text-xs text-gray-500 line-clamp-1">{feature.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeatureCatalog;
