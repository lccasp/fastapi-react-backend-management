/**
 * UI状态管理
 */

import { create } from 'zustand';

interface UIState {
  // 侧边栏状态
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // 全局加载状态
  globalLoading: boolean;
  
  // 全局错误
  globalError: string | null;
  
  // 操作
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  setGlobalLoading: (loading: boolean) => void;
  setGlobalError: (error: string | null) => void;
  clearGlobalError: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // 初始状态
  sidebarOpen: true,
  sidebarCollapsed: false,
  globalLoading: false,
  globalError: null,

  // 侧边栏操作
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
  
  toggleSidebar: () => {
    const currentOpen = get().sidebarOpen;
    set({ sidebarOpen: !currentOpen });
  },
  
  toggleSidebarCollapse: () => {
    const currentCollapsed = get().sidebarCollapsed;
    set({ sidebarCollapsed: !currentCollapsed });
  },

  // 全局状态操作
  setGlobalLoading: (loading: boolean) => set({ globalLoading: loading }),
  
  setGlobalError: (error: string | null) => set({ globalError: error }),
  
  clearGlobalError: () => set({ globalError: null }),
}));
