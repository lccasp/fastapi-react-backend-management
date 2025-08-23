/**
 * 认证相关页面布局
 */

import { AuthGuard } from '@/components/auth/AuthGuard';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md w-full space-y-8 p-8">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
