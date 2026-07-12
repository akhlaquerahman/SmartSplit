import { create } from 'zustand';

export const useRulesStore = create((set) => ({
  activeTab: 'greetings',
  setActiveTab: (tab) => set({ activeTab: tab }),

  isDrawerOpen: false,
  drawerRuleType: null, // 'greeting' | 'fallback'
  selectedRule: null,
  
  openDrawer: (ruleType, rule = null) => set({ 
    isDrawerOpen: true, 
    drawerRuleType: ruleType, 
    selectedRule: rule 
  }),
  
  closeDrawer: () => set({ 
    isDrawerOpen: false, 
    drawerRuleType: null, 
    selectedRule: null 
  }),

  isTestPanelOpen: false,
  openTestPanel: () => set({ isTestPanelOpen: true }),
  closeTestPanel: () => set({ isTestPanelOpen: false }),
}));

