import React from 'react';
import AIChatHeader from './AIChatHeader';
import AIChatSidebar from './AIChatSidebar';
import ChatInputArea from './ChatInputArea';
import MessageList from './MessageList';
import WelcomeScreen from './WelcomeScreen';
import useAIChatStore from '../../store/useAIChatStore';

const AIChatWindow = () => {
  const { isSidebarOpen, messages } = useAIChatStore();

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      <AIChatHeader />
      
      <div className="flex-1 flex overflow-hidden relative">
        <AIChatSidebar />
        
        <main className="flex-1 flex flex-col h-full">

          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? <WelcomeScreen /> : <MessageList />}
          </div>
          <div className="p-4 bg-white border-t border-gray-200">
            <ChatInputArea />
          </div>
        </main>
      </div>
    </div>
  );
};
export default AIChatWindow;