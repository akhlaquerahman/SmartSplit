import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Users, Receipt, Wallet, FileText, Zap } from 'lucide-react';
import { useAIChat } from '../../hooks/useAIChat';
import useAIChatStore from '../../store/useAIChatStore';

const ChatInputArea = () => {
  const [input, setInput] = useState('');
  const { sendMessage } = useAIChat();
  const { isStreaming } = useAIChatStore();
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  useEffect(() => {
    const handleCustomSend = (e) => {
      if (e.detail && !isStreaming) {
        sendMessage(e.detail);
      }
    };
    document.addEventListener('aiChatSend', handleCustomSend);
    return () => {
      document.removeEventListener('aiChatSend', handleCustomSend);
    };
  }, [isStreaming, sendMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isStreaming) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const quickActions = [
    { icon: <Wallet className="w-3.5 h-3.5 text-purple-500" />, label: "Balance", query: "my balance" },
    { icon: <FileText className="w-3.5 h-3.5 text-indigo-500" />, label: "Recent Expenses", query: "recent expenses" },
    { icon: <FileText className="w-3.5 h-3.5 text-blue-600" />, label: "Reports", query: "generate report" },
    { icon: <Zap className="w-3.5 h-3.5 text-emerald-500" />, label: "+ Settlement", query: "request settlement" },
    { icon: <Users className="w-3.5 h-3.5 text-blue-500" />, label: "+ Group", query: "create group" },
    { icon: <Receipt className="w-3.5 h-3.5 text-orange-500" />, label: "+ Expense", query: "add expense" }, 
  ];

  return (
    <div className="flex flex-col gap-2">
      {/* Quick Action Shortcuts */}
      <div className="flex overflow-x-auto thin-scrollbar gap-2 px-1 pb-1">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendMessage(action.query)}
            className="flex items-center gap-1.5 whitespace-nowrap shrink-0 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all shadow-sm"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-gray-50 rounded-2xl p-2 border border-gray-200 shadow-inner focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
        <button type="button" className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
          <Paperclip className="w-5 h-5" />
        </button>
        
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask SmartSplit AI..."
          className="flex-1 max-h-[120px] bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none resize-none py-2.5 px-2 text-[15px] placeholder-gray-400"
          rows="1"
        />
        
        {input.trim() ? (
          <button 
            type="submit" 
            disabled={isStreaming}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button type="button" className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
            <Mic className="w-5 h-5" />
          </button>
        )}
      </form>
    </div>
  );
};
export default ChatInputArea;