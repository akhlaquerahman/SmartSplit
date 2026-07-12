import { create } from 'zustand';
import api from '../utils/api';

const useGroupStore = create((set, get) => ({
  groups: [],
  activeGroup: null,
  expenses: [],
  settlements: [],
  history: [],
  loading: false,
  error: null,

  fetchGroups: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/groups');
      set({ groups: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  fetchGroupDetails: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const groupRes = await api.get(`/groups/${groupId}`);
      let settlementData = [];
      try {
        const settlementRes = await api.get(`/settlements/${groupId}`);
        settlementData = settlementRes.data;
      } catch (settlementError) {
        // Keep group data even when settlement lookup fails
        settlementData = [];
      }
      set({ 
        activeGroup: groupRes.data, 
        expenses: groupRes.data.expenses || [],
        settlements: settlementData,
        loading: false 
      });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      return false;
    }
  },

  createGroup: async (groupData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/groups', groupData);
      set((state) => ({ groups: [...state.groups, response.data], loading: false }));
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      return false;
    }
  },

  addMember: async (groupId, email) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/groups/${groupId}/add-member`, { email });
      if (get().activeGroup && get().activeGroup._id === groupId) {
        set((state) => ({ activeGroup: { ...state.activeGroup, members: response.data } }));
      }
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      return false;
    }
  },

  removeMember: async (groupId, userId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/groups/${groupId}/members`, {
        data: { userId }
      });
      if (get().activeGroup && get().activeGroup._id === groupId) {
        set((state) => ({
          activeGroup: {
            ...state.activeGroup,
            members: state.activeGroup.members.filter((member) => member.user._id !== userId)
          }
        }));
      }
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      return false;
    }
  },

  addExpense: async (expenseData) => {
    set({ loading: true, error: null });
    try {
      await api.post('/expenses', expenseData);
      
      // Attempt background refresh, but don't block the UI if it fails intermittently
      try {
        await get().fetchGroupDetails(expenseData.groupId);
      } catch (refreshError) {
        console.error('Background refresh failed after adding expense:', refreshError);
      }
      
      set({ loading: false });
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  updateExpense: async (expenseId, expenseData) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/expenses/${expenseId}`, expenseData);
      
      try {
        await get().fetchGroupDetails(expenseData.groupId);
      } catch (refreshError) {
        console.error('Background refresh failed after updating expense:', refreshError);
      }
      
      set({ loading: false });
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  deleteExpense: async (expenseId, groupId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/expenses/${expenseId}`);
      
      try {
        await get().fetchGroupDetails(groupId);
      } catch (refreshError) {
        console.error('Background refresh failed after deleting expense:', refreshError);
      }
      
      set({ loading: false });
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  fetchExpenseEditHistory: async (expenseId) => {
    try {
      const response = await api.get(`/expenses/${expenseId}/history`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch expense edit history:', error);
      return [];
    }
  },

  createSettlement: async (settlementData) => {
    set({ loading: true, error: null });
    try {
      await api.post('/settlements', settlementData);
      await get().fetchGroupDetails(settlementData.groupId);
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      return false;
    }
  },

  respondSettlement: async (settlementId, action, groupId, disputeReason) => {
    set({ loading: true, error: null });
    try {
      await api.patch(`/settlements/${settlementId}/respond`, { action, disputeReason });
      await get().fetchGroupDetails(groupId);
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      return false;
    }
  },

  fetchHistory: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/history', {
        params: filters
      });
      set({ history: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  updateGroup: async (groupId, groupData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/groups/${groupId}`, groupData);
      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? { ...g, ...response.data } : g)),
        activeGroup: state.activeGroup?._id === groupId ? { ...state.activeGroup, ...response.data } : state.activeGroup,
        loading: false
      }));
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      return false;
    }
  },

  deleteGroup: async (groupId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/groups/${groupId}`);
      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
        activeGroup: state.activeGroup?._id === groupId ? null : state.activeGroup,
        loading: false
      }));
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      return false;
    }
  }
}));

export default useGroupStore;
