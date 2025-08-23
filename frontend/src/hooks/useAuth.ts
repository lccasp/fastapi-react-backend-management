/**
 * 认证相关React Query hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { LoginRequest, RegisterRequest, PasswordChangeRequest } from '@/types/auth';

/**
 * 登录Hook
 */
export function useLogin() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const setGlobalError = useUIStore((state) => state.setGlobalError);

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data) => {
      login(data);
      setGlobalError(null);
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      setGlobalError(error.message);
    },
  });
}

/**
 * 注册Hook
 */
export function useRegister() {
  const router = useRouter();
  const setGlobalError = useUIStore((state) => state.setGlobalError);

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => {
      setGlobalError(null);
      router.push('/login?message=注册成功，请登录');
    },
    onError: (error: Error) => {
      setGlobalError(error.message);
    },
  });
}

/**
 * 获取当前用户信息Hook
 */
export function useCurrentUser() {
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5分钟
    onSuccess: (data) => {
      setCurrentUser(data);
    },
    onError: () => {
      logout();
    },
  });
}

/**
 * 登出Hook
 */
export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      // 无论成功还是失败都执行登出
      logout();
      queryClient.clear();
      router.push('/login');
    },
  });
}

/**
 * 修改密码Hook
 */
export function useChangePassword() {
  const setGlobalError = useUIStore((state) => state.setGlobalError);

  return useMutation({
    mutationFn: (data: PasswordChangeRequest) => authService.changePassword(data),
    onSuccess: () => {
      setGlobalError(null);
    },
    onError: (error: Error) => {
      setGlobalError(error.message);
    },
  });
}
