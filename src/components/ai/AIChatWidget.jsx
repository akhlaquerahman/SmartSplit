import React from 'react';
import useAIChatStore from '../../store/useAIChatStore';
import AIChatWindow from './AIChatWindow';
import { Bot } from 'lucide-react';

const AIChatWidget = () => {
  const { isOpen, isSidebarOpen, toggleChat } = useAIChatStore();

  return (

    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={toggleChat}
            className="w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 hover:scale-105 transition-all duration-300 relative"
          >
            <Bot className="w-6 h-8" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>
        </div>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[100] w-full sm:w-[380px] lg:w-[420px] h-[100dvh] sm:h-[calc(100vh-48px)] sm:max-h-[850px] bg-white sm:rounded-2xl shadow-2xl border-0 sm:border sm:border-gray-200 overflow-hidden flex flex-col transform transition-transform duration-300 origin-bottom-right">
          <AIChatWindow />
        </div>
      )}



    </>
  );
};
export default AIChatWidget;