import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';
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

  return (
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
  );
};
export default ChatInputArea;