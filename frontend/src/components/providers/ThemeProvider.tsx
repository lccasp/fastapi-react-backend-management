/**
 * 主题提供程序
 */

'use client';

import { useEffect, ReactNode } from 'react';
import { useThemeStore } from '@/stores/theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // 初始化主题
    setTheme(theme);
  }, [theme, setTheme]);

  return <>{children}</>;
}
