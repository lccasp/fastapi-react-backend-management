/**
 * 认证状态管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginResponse, CurrentUserResponse } from '@/types/auth';
import { saveToken, clearToken } from '@/lib/auth';

interface AuthState {
  // 状态
  user: User | null;
  permissions: string[];
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;

  // 操作
  login: (loginData: LoginResponse) => void;
  setCurrentUser: (userData: CurrentUserResponse) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      permissions: [],
      roles: [],
      isAuthenticated: false,
      isLoading: false,

      // 登录
      login: (loginData: LoginResponse) => {
        // 保存token到cookie
        saveToken(loginData.access_token);
        
        // 更新状态
        set({
          user: loginData.user,
          permissions: loginData.permissions,
          roles: [], // 登录响应中暂时没有角色信息
          isAuthenticated: true,
          isLoading: false,
        });
      },

      // 设置当前用户信息
      setCurrentUser: (userData: CurrentUserResponse) => {
        set({
          user: userData.user,
          permissions: userData.permissions,
          roles: userData.roles,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      // 更新用户信息
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      // 登出
      logout: () => {
        clearToken();
        set({
          user: null,
          permissions: [],
          roles: [],
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // 只持久化必要的状态，token通过cookie管理
        user: state.user,
        permissions: state.permissions,
        roles: state.roles,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
