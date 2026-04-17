import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api`;

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
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ groups: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  fetchGroupDetails: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const groupRes = await axios.get(`${API_URL}/groups/${groupId}`, { headers: { Authorization: `Bearer ${token}` } });
      let settlementData = [];
      try {
        const settlementRes = await axios.get(`${API_URL}/settlements/${groupId}`, { headers: { Authorization: `Bearer ${token}` } });
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
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/groups`, groupData, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/groups/${groupId}/add-member`, { email }, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/groups/${groupId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
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
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/expenses`, expenseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await get().fetchGroupDetails(expenseData.groupId);
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      return false;
    }
  },

  createSettlement: async (settlementData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/settlements`, settlementData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await get().fetchGroupDetails(settlementData.groupId);
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      return false;
    }
  },

  respondSettlement: async (settlementId, action, groupId) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/settlements/${settlementId}/respond`, { action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      set({ history: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  }
}));

export default useGroupStore;
