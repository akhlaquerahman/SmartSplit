import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAIChatStore = create(
  persist(
    (set) => ({
      isOpen: false,
      isSidebarOpen: false,
      isFullScreen: false,
      isStreaming: false,
      activeConversationId: null,
      messages: [],
      activeAction: null,
      
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      openChat: () => set({ isOpen: true }),
      closeChat: () => set({ isOpen: false }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })),
      
      setStreaming: (isStreaming) => set({ isStreaming }),
      setActiveConversation: (id) => set({ activeConversationId: id }),
      
      setActiveAction: (action) => set({ activeAction: action }),
      clearActiveAction: () => set({ activeAction: null }),

      
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      setMessages: (messages) => set({ messages }),
      updateLastMessage: (delta, metadata = {}) => set((state) => {
        const newMessages = [...state.messages];
        if (newMessages.length > 0) {
          const last = newMessages[newMessages.length - 1];
          if (last.role === 'assistant') {
            last.content += delta;
            if (metadata) {
              last.metadata = { ...(last.metadata || {}), ...metadata };
            }
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