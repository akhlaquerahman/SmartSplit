import React from 'react';
import useAIChatStore from '../../store/useAIChatStore';
import AIChatWindow from './AIChatWindow';
import { Bot } from 'lucide-react';

const AIChatWidget = () => {
  const { isOpen, isSidebarOpen, isFullScreen, toggleChat } = useAIChatStore();

  return (

    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={toggleChat}
            className="w-14 h-14 rounded-full shadow-[0_8px_30px_rgb(99,102,241,0.4)] flex items-center justify-center text-white bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 hover:shadow-[0_8px_35px_rgb(139,92,246,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 relative border border-white/10"
          >
            <span className="font-black text-xl tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>AI</span>
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#16181d] animate-pulse"></span>
          </button>
        </div>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div className={`fixed inset-0 z-[100] bg-white overflow-hidden flex flex-col transform transition-all duration-300 ${
          isFullScreen 
            ? 'w-full h-full' 
            : 'sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[380px] lg:w-[420px] sm:h-[calc(100vh-48px)] sm:max-h-[850px] sm:rounded-2xl shadow-2xl sm:border sm:border-gray-200 origin-bottom-right'
        }`}>
          <AIChatWindow />
        </div>
      )}



    </>
  );
};
export default AIChatWidget;