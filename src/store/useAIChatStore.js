import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAIChatStore = create(
  persist(
    (set) => ({
      isOpen: false,
      isSidebarOpen: false,
      isStreaming: false,
      activeConversationId: null,
      messages: [],
      
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      openChat: () => set({ isOpen: true }),
      closeChat: () => set({ isOpen: false }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      
      setStreaming: (isStreaming) => set({ isStreaming }),
      setActiveConversation: (id) => set({ activeConversationId: id }),

      
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      setMessages: (messages) => set({ messages }),
      updateLastMessage: (delta) => set((state) => {
        const newMessages = [...state.messages];
        if (newMessages.length > 0) {
          const last = newMessages[newMessages.length - 1];
          if (last.role === 'assistant') {
            last.content += delta;
          }
        }
        return { messages: newMessages };
      }),
      clearMessages: () => set({ messages: [] })

    }),
    {
      name: 'smartsplit-ai-chat',
      partialize: (state) => ({ 
        isOpen: state.isOpen, 
        activeConversationId: state.activeConversationId 
      }),
    }
  )
);

export default useAIChatStore;