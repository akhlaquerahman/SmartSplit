import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';


export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await api.get('/ai-chat/conversations');


      return data.data; // assuming { data: conversations }
    }
  });
};

export const useConversationHistory = (id) => {
  return useQuery({
    queryKey: ['conversations', id, 'history'],
    queryFn: async () => {
      const { data } = await api.get(`/ai-chat/conversations/${id}/history`);


      return data.data;
    },
    enabled: !!id
  });
};

export const useUpdateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, title }) => {
      const { data } = await api.put(`/ai-chat/conversations/${id}`, { title });


      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
    }
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/ai-chat/conversations/${id}`);


      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
    }
  });
};
