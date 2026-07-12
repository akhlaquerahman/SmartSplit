import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true
});

export const useConversationStats = () => {
  return useQuery({
    queryKey: ['ai-conversation-stats'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/ai/conversations/dashboard');
      return data;
    },
    refetchInterval: 30000 // Refetch every 30s
  });
};

export const useConversationsList = (filters) => {
  return useQuery({
    queryKey: ['ai-conversations', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params.append(key, val);
      });
      const { data } = await api.get(`/api/admin/ai/conversations?${params.toString()}`);
      return data;
    },
    keepPreviousData: true
  });
};

export const useConversationDetails = (id) => {
  return useQuery({
    queryKey: ['ai-conversation-details', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get(`/api/admin/ai/conversations/${id}`);
      return data;
    },
    enabled: !!id
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/admin/ai/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['ai-conversation-stats'] });
    }
  });
};

export const useBulkDeleteConversations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      await api.delete('/api/admin/ai/conversations/bulk', { data: { ids } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['ai-conversation-stats'] });
    }
  });
};