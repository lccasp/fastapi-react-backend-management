/**
 * 侧边栏导航组件
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';
import {
  LayoutDashboard,
  Users,
  Shield,
  Key,
  Building2,
  Briefcase,
  User,
  ChevronDown,
  ChevronRight,
  Settings,
} from 'lucide-react';

interface MenuItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: '仪表盘',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '系统管理',
    icon: Settings,
    permission: PERMISSIONS.SYSTEM_MANAGE,
    children: [
      {
        title: '用户管理',
        href: '/dashboard/system/users',
        icon: Users,
        permission: PERMISSIONS.USER_MANAGE,
      },
      {
        title: '角色管理',
        href: '/dashboard/system/roles',
        icon: Shield,
        permission: PERMISSIONS.ROLE_MANAGE,
      },
      {
        title: '权限管理',
        href: '/dashboard/system/permissions',
        icon: Key,
        permission: PERMISSIONS.PERMISSION_MANAGE,
      },
      {
        title: '部门管理',
        href: '/dashboard/system/departments',
        icon: Building2,
        permission: PERMISSIONS.DEPARTMENT_MANAGE,
      },
      {
        title: '岗位管理',
        href: '/dashboard/system/positions',
        icon: Briefcase,
        permission: PERMISSIONS.POSITION_MANAGE,
      },
    ],
  },
  {
    title: '个人中心',
    href: '/dashboard/profile',
    icon: User,
    permission: PERMISSIONS.PROFILE_MANAGE,
  },
];

interface SidebarItemProps {
  item: MenuItem;
  collapsed: boolean;
}

function SidebarItem({ item, collapsed }: SidebarItemProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href ? pathname === item.href : false;
  const hasActiveChild = hasChildren && item.children?.some(child => 
    child.href && pathname === child.href
  );

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  const ItemContent = (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover-lift',
        'hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
        isActive && 'bg-gradient-to-r from-primary to-blue-600 text-primary-foreground apple-shadow',
        hasActiveChild && 'bg-sidebar-accent/40 text-sidebar-accent-foreground',
        !isActive && !hasActiveChild && 'text-sidebar-foreground/80'
      )}
    >
      <item.icon className={cn(
        "h-5 w-5 shrink-0 transition-colors", 
        isActive ? "text-primary-foreground" : "text-current"
      )} />
      {!collapsed && (
        <>
          <span className="flex-1 font-medium">{item.title}</span>
          {hasChildren && (
            <div className="shrink-0">
              {isOpen ? (
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-4 w-4 transition-transform duration-200" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <PermissionGuard permission={item.permission}>
      <div>
        {item.href ? (
          <Link href={item.href} onClick={handleClick}>
            {ItemContent}
          </Link>
        ) : (
          <button
            className="w-full text-left"
            onClick={handleClick}
          >
            {ItemContent}
          </button>
        )}
        
        {hasChildren && isOpen && !collapsed && (
          <div className="ml-8 mt-2 space-y-1 animate-slide-up">
            {item.children?.map((child, index) => (
              <div key={index} className="relative">
                <div className="absolute left-0 top-1/2 h-px w-4 bg-border/30 -translate-y-1/2"></div>
                <div className="pl-6">
                  <SidebarItem item={child} collapsed={false} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}

export function Sidebar() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div
      className={cn(
        'flex h-full flex-col apple-blur glass-effect border-r border-sidebar-border',
        sidebarCollapsed ? 'w-16' : 'w-72'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border/50 px-6">
        {sidebarCollapsed ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-primary-foreground apple-shadow">
            <Settings className="h-5 w-5" />
          </div>
        ) : (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-primary-foreground apple-shadow">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-sidebar-foreground">企业管理</h1>
              <p className="text-xs text-muted-foreground">Management System</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item, index) => (
          <SidebarItem key={index} item={item} collapsed={sidebarCollapsed} />
        ))}
      </nav>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="border-t border-sidebar-border/50 p-4 animate-fade-in">
          <div className="text-xs text-muted-foreground text-center">
            <p>© 2024 企业管理系统</p>
            <p className="mt-1">版本 1.0.0</p>
          </div>
        </div>
      )}
    </div>
  );
}
