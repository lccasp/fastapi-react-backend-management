/**
 * 顶部导航栏组件
 */

'use client';

import { Bell, Menu, Search, Sun, Moon, LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUIStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { useLogout } from '@/hooks/useAuth';
import Link from 'next/link';

export function Header() {
  const { toggleSidebarCollapse } = useUIStore();
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 apple-blur glass-effect">
      <div className="flex h-16 items-center px-6">
        {/* 侧边栏切换按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebarCollapse}
          className="mr-6 h-10 w-10 rounded-xl hover:bg-accent/60 transition-all duration-200"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* 搜索框 */}
        <div className="flex flex-1 items-center space-x-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
            <Input
              type="search"
              placeholder="搜索用户、角色、部门..."
              className="pl-12 h-11 apple-input border-0 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* 右侧操作区 */}
        <div className="flex items-center space-x-3">
          {/* 主题切换 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-10 w-10 rounded-xl hover:bg-accent/60 transition-all duration-200"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* 通知 */}
          <Button 
            variant="ghost" 
            size="sm"
            className="relative h-10 w-10 rounded-xl hover:bg-accent/60 transition-all duration-200"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center">
              3
            </span>
          </Button>

          {/* 用户菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all duration-200">
                <Avatar className="h-10 w-10 apple-shadow">
                  <AvatarImage src={user?.avatar_url} alt={user?.nickname || user?.username} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground font-semibold">
                    {user?.nickname?.[0] || user?.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 apple-card animate-slide-up" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar_url} alt={user?.nickname || user?.username} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground">
                        {user?.nickname?.[0] || user?.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold leading-none">
                        {user?.nickname || user?.username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  {user?.is_superuser && (
                    <div className="inline-flex items-center px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                      超级管理员
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="hover:bg-accent/60 rounded-lg m-1">
                <Link href="/dashboard/profile" className="flex items-center px-3 py-2">
                  <User className="mr-3 h-4 w-4" />
                  个人中心
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:bg-accent/60 rounded-lg m-1">
                <Link href="/dashboard/profile/settings" className="flex items-center px-3 py-2">
                  <Settings className="mr-3 h-4 w-4" />
                  账户设置
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive hover:bg-destructive/10 rounded-lg m-1"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-3 h-4 w-4" />
                {logoutMutation.isPending ? '退出中...' : '退出登录'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
