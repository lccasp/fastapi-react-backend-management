/**
 * 主题状态管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      
      setTheme: (theme: Theme) => {
        set({ theme });
        
        // 应用主题到document
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');
          
          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light';
            root.classList.add(systemTheme);
          } else {
            root.classList.add(theme);
          }
        }
      },
      
      toggleTheme: () => {
        const current = get().theme;
        const next = current === 'light' ? 'dark' : 'light';
        get().setTheme(next);
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
