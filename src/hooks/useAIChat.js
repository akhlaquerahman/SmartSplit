import { useState } from 'react';
import useAIChatStore from '../store/useAIChatStore';
import useDebuggerStore from '../store/useDebuggerStore';
import api from '../utils/api';

export const useAIChat = () => {
  const { addMessage, updateLastMessage, setStreaming, activeConversationId } = useAIChatStore();
  const [error, setError] = useState(null);

  const sendMessage = async (text) => {
    setError(null);
    addMessage({ id: Date.now().toString(), role: 'user', content: text });
    setStreaming(true);

    try {
      const { data } = await api.post('/ai-chat/conversations/message', { 
        message: text, 
        conversationId: activeConversationId 
      });
      
      // Update store with new conversationId if this is the first message
      if (!activeConversationId && data.conversationId) {
        useAIChatStore.getState().setActiveConversation(data.conversationId);
      }

      // --- TRACE CONSOLE INTEGRATION ---
      const debugData = data.debug || (data.aiResult && data.aiResult.debug);
      if (debugData && debugData.traceId) {
        if (useDebuggerStore.getState().isOpen) {
          api.get(`/admin/ai/trace/${debugData.traceId}`).then((res) => {
            if (res.data && res.data.trace) {
              useDebuggerStore.getState().setActiveTrace(res.data.trace);
            }
          }).catch(console.error);
        }
      }
      // ---------------------------------

      const aiResult = data.aiResult;
      
      // Strict JSON Action Dispatch: Append as a widget message
      if (aiResult && aiResult.type === 'action') {
        addMessage({ 
          id: (Date.now() + 1).toString(), 
          role: 'assistant', 
          content: '', 
          metadata: { actionTrigger: aiResult.action, isWidget: true } 
        });
        setStreaming(false);
        return;
      }

      // Standard text response
      let finalResponse = "I'm sorry, I don't understand that.";
      if (data.assistantMessage && data.assistantMessage.content) {
        finalResponse = data.assistantMessage.content;
      }
      
      addMessage({ id: (Date.now() + 1).toString(), role: 'assistant', content: '' });
      
      const chunks = finalResponse.split(' ');
      for (let i = 0; i < chunks.length; i++) {
        await new Promise(r => setTimeout(r, 50));
        updateLastMessage(chunks[i] + ' ');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setStreaming(false);
    }
  };

  return { sendMessage, error };
};