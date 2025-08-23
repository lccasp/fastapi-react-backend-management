/**
 * 首页 - 重定向到适当的页面
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { isAuthenticated } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  const isAuth = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // 检查认证状态并重定向
    if (isAuthenticated() && isAuth) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [isAuth, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">正在跳转...</p>
      </div>
    </div>
  );
}