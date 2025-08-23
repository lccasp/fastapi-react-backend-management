/**
 * 认证守卫组件
 */

'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { isAuthenticated } from '@/lib/auth';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * 认证守卫组件
 * 检查用户认证状态，未认证则跳转到登录页
 */
export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: AuthGuardProps) {
  const router = useRouter();
  const isAuth = useAuthStore((state) => state.isAuthenticated);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    // 检查token是否存在
    const hasToken = isAuthenticated();
    
    if (requireAuth) {
      if (!hasToken || !isAuth) {
        setLoading(false);
        router.push(redirectTo);
        return;
      }
    } else {
      // 不需要认证的页面，如果已登录则跳转到dashboard
      if (hasToken && isAuth) {
        router.push('/dashboard');
        return;
      }
    }
    
    setLoading(false);
  }, [isAuth, requireAuth, redirectTo, router, setLoading]);

  // 需要认证但未认证时不渲染内容
  if (requireAuth && (!isAuthenticated() || !isAuth)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 不需要认证但已认证时不渲染内容（会跳转）
  if (!requireAuth && isAuthenticated() && isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
