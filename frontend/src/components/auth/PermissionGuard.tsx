/**
 * 权限守卫组件
 */

'use client';

import { ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/permissions';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

/**
 * 权限守卫组件
 * 根据用户权限决定是否显示子组件
 */
export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
}: PermissionGuardProps) {
  const userPermissions = useAuthStore((state) => state.permissions);
  
  // 单个权限检查
  if (permission) {
    if (!hasPermission(userPermissions, permission)) {
      return <>{fallback}</>;
    }
  }
  
  // 多个权限检查
  if (permissions && permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(userPermissions, permissions)
      : hasAnyPermission(userPermissions, permissions);
    
    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }
  
  return <>{children}</>;
}

/**
 * 权限检查Hook
 */
export function usePermissionCheck() {
  const userPermissions = useAuthStore((state) => state.permissions);
  
  return {
    hasPermission: (permission: string) => hasPermission(userPermissions, permission),
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(userPermissions, permissions),
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(userPermissions, permissions),
    userPermissions,
  };
}
