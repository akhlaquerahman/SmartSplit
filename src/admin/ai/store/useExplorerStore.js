import { create } from 'zustand';

const useExplorerStore = create((set) => ({
  filters: {
    page: 1,
    limit: 20,
    search: '',
    status: '',
    source: '',
    intent: '',
    dateFrom: '',
    dateTo: '',
    sortField: 'createdAt',
    sortOrder: 'desc'
  },
  selectedConversationId: null,
  isDrawerOpen: false,

  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value, page: key !== 'page' ? 1 : state.filters.page }
  })),
  resetFilters: () => set({
    filters: {
      page: 1, limit: 20, search: '', status: '', source: '', intent: '', dateFrom: '', dateTo: '', sortField: 'createdAt', sortOrder: 'desc'
    }
  }),
  
  openDrawer: (id) => set({ selectedConversationId: id, isDrawerOpen: true }),
  closeDrawer: () => set({ selectedConversationId: null, isDrawerOpen: false })
}));

export default useExplorerStore;