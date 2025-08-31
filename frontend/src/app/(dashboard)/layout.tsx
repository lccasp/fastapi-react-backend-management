/**
 * 仪表盘布局页面
 */

import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </AuthGuard>
  );
}

