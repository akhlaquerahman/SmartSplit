import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Replace with configured Axios instance if available in the project
const api = axios.create({ baseURL: '/api' });
// Assume there's a token interceptor in the real app if needed.

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['ruleDashboardStats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/ai/greetings/dashboard');
      return data;
    }
  });
};

export const useGreetings = (params) => {
  return useQuery({
    queryKey: ['greetings', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/ai/greetings', { params });
      return data;
    }
  });
};

export const useCreateGreeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newRule) => {
      const { data } = await api.post('/admin/ai/greetings', newRule);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['greetings']);
      queryClient.invalidateQueries(['ruleDashboardStats']);
    }
  });
};

export const useUpdateGreeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      const { data } = await api.put(`/admin/ai/greetings/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['greetings']);
    }
  });
};

export const useDeleteGreeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/admin/ai/greetings/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['greetings']);
      queryClient.invalidateQueries(['ruleDashboardStats']);
    }
  });
};

export const useTestGreeting = () => {
  return useMutation({
    mutationFn: async (input) => {
      const { data } = await api.post('/admin/ai/greetings/test', { input });
      return data;
    }
  });
};

export const useFallbacks = (params) => {
  return useQuery({
    queryKey: ['fallbacks', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/ai/fallbacks', { params });
      return data;
    }
  });
};

export const useCreateFallback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newRule) => {
      const { data } = await api.post('/admin/ai/fallbacks', newRule);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['fallbacks']);
      queryClient.invalidateQueries(['ruleDashboardStats']);
    }
  });
};

export const useUpdateFallback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      const { data } = await api.put(`/admin/ai/fallbacks/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['fallbacks']);
    }
  });
};
