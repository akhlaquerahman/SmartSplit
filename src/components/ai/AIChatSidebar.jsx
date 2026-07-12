import React, { useState } from 'react';
import { MessageSquare, Plus, MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react';
import useAIChatStore from '../../store/useAIChatStore';
import { useConversations, useUpdateConversation, useDeleteConversation, useConversationHistory } from '../../hooks/chatApi';

const AIChatSidebar = () => {
  const { isSidebarOpen, setActiveConversation, clearMessages, activeConversationId, setMessages } = useAIChatStore();
  const { data: conversations, isLoading } = useConversations();
  const updateMutation = useUpdateConversation();
  const deleteMutation = useDeleteConversation();
  const { refetch: fetchHistory } = useConversationHistory(activeConversationId);
  
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [hoverId, setHoverId] = useState(null);

  // Remove the unmount so we can animate it


  const handleNewChat = () => {
    setActiveConversation(null);
    clearMessages();
  };

  const handleSelectChat = async (id) => {
    setActiveConversation(id);
    // Actually, useConversationHistory hook automatically fetches when activeConversationId changes.
    // Wait, the hook is in AIChatSidebar? No, it's not fetching the messages to the store.
    // Let's manually fetch here for simplicity, or we can use the hook's refetch.
    try {
      const response = await fetch(`/api/admin/ai/chat/conversations/${id}/history`);
      const data = await response.json();
      setMessages(data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (e, conv) => {
    e.stopPropagation();
    setEditingId(conv._id);
    setEditTitle(conv.title);
  };

  const handleSaveEdit = (e, id) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      updateMutation.mutate({ id, title: editTitle });
    }
    setEditingId(null);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteMutation.mutate(id);
      if (activeConversationId === id) {
        handleNewChat();
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isSidebarOpen && (
        <div 
          className="absolute inset-0 bg-black/20 z-10" 
          onClick={useAIChatStore.getState().toggleSidebar}
        />
      )}
      <div 
        className={`absolute top-0 left-0 w-64 h-full bg-white border-r border-gray-200 z-20 flex flex-col shadow-xl transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >

      <div className="p-4 border-b border-gray-200">
        <button 
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2 mt-2">Recent</div>
        
        {isLoading ? (
          <div className="text-center text-gray-400 text-sm mt-4">Loading...</div>
        ) : conversations?.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-4">No conversations yet.</div>
        ) : (
          conversations?.map((conv) => (
            <div 
              key={conv._id}
              className={`group relative flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-left cursor-pointer transition-colors ${activeConversationId === conv._id ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
              onClick={() => handleSelectChat(conv._id)}
              onMouseEnter={() => setHoverId(conv._id)}
              onMouseLeave={() => setHoverId(null)}
            >
              <MessageSquare className="w-4 h-4 text-gray-400 shrink-0" />
              
              {editingId === conv._id ? (
                <div className="flex-1 flex items-center gap-1">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 w-full bg-white border border-blue-500 rounded px-1 py-0.5 outline-none text-xs"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(e, conv._id);
                      if (e.key === 'Escape') handleCancelEdit(e);
                    }}
                    autoFocus
                  />
                  <button onClick={(e) => handleSaveEdit(e, conv._id)} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={14} /></button>
                  <button onClick={handleCancelEdit} className="text-red-600 hover:bg-red-50 p-1 rounded"><X size={14} /></button>
                </div>
              ) : (
                <>
                  <span className="truncate flex-1">{conv.title}</span>
                  
                  {hoverId === conv._id && (
                    <div className="flex items-center gap-1 shrink-0 bg-gradient-to-l from-gray-50 pl-2">
                      <button 
                        onClick={(e) => handleEditClick(e, conv)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-white rounded transition-colors"
                        title="Edit title"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, conv._id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-white rounded transition-colors"
                        title="Delete chat"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
    </>

  );
};


export default AIChatSidebar;