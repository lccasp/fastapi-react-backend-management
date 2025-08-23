/**
 * 仪表盘首页
 */

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth';
import { useCurrentUser } from '@/hooks/useAuth';
import { formatDateTime } from '@/lib/utils';
import { Users, Shield, Building2, Briefcase, Activity, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  useCurrentUser(); // 获取最新用户信息

  const stats = [
    {
      title: '总用户数',
      value: '1,234',
      change: '+20.1%',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: '活跃角色',
      value: '23',
      change: '+12.5%',
      icon: Shield,
      color: 'text-green-600',
    },
    {
      title: '部门数量',
      value: '45',
      change: '+5.2%',
      icon: Building2,
      color: 'text-purple-600',
    },
    {
      title: '岗位数量',
      value: '128',
      change: '+8.7%',
      icon: Briefcase,
      color: 'text-orange-600',
    },
  ];

  // 快速操作导航函数
  const navigateToPage = (path: string) => {
    router.push(path);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 欢迎信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            欢迎回来，{user?.nickname || user?.username}！
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            今天是 {formatDateTime(new Date().toISOString()).split(' ')[0]}，祝您工作愉快！
          </p>
        </div>
        <div className="flex items-center space-x-3 apple-card p-4">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <Activity className="h-5 w-5 text-success" />
          <span className="text-sm font-medium">系统运行正常</span>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={stat.title} className="apple-card hover-lift" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color === 'text-blue-600' ? 'bg-blue-500/10' : stat.color === 'text-green-600' ? 'bg-green-500/10' : stat.color === 'text-purple-600' ? 'bg-purple-500/10' : 'bg-orange-500/10'}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <TrendingUp className="mr-1 h-4 w-4 text-success" />
                <span className="font-medium text-success">{stat.change}</span>
                <span className="ml-1">较上月</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 快速操作和近期活动 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 快速操作 */}
        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              快速操作
            </CardTitle>
            <CardDescription>
              常用的管理功能快捷入口
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <PermissionGuard permission={PERMISSIONS.USER_MANAGE}>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-2 rounded-xl hover:bg-accent/60 hover-lift apple-shadow border-border/50"
                  onClick={() => navigateToPage('/dashboard/system/users')}
                >
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">用户管理</span>
                </Button>
              </PermissionGuard>
              <PermissionGuard permission={PERMISSIONS.ROLE_MANAGE}>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-2 rounded-xl hover:bg-accent/60 hover-lift apple-shadow border-border/50"
                  onClick={() => navigateToPage('/dashboard/system/roles')}
                >
                  <Shield className="h-5 w-5 text-success" />
                  <span className="text-sm font-medium">角色管理</span>
                </Button>
              </PermissionGuard>
              <PermissionGuard permission={PERMISSIONS.DEPARTMENT_MANAGE}>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-2 rounded-xl hover:bg-accent/60 hover-lift apple-shadow border-border/50"
                  onClick={() => navigateToPage('/dashboard/system/departments')}
                >
                  <Building2 className="h-5 w-5 text-warning" />
                  <span className="text-sm font-medium">部门管理</span>
                </Button>
              </PermissionGuard>
              <PermissionGuard permission={PERMISSIONS.POSITION_MANAGE}>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-2 rounded-xl hover:bg-accent/60 hover-lift apple-shadow border-border/50"
                  onClick={() => navigateToPage('/dashboard/system/positions')}
                >
                  <Briefcase className="h-5 w-5 text-info" />
                  <span className="text-sm font-medium">岗位管理</span>
                </Button>
              </PermissionGuard>
            </div>
          </CardContent>
        </Card>

        {/* 系统信息 */}
        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-success" />
              </div>
              系统信息
            </CardTitle>
            <CardDescription>
              当前系统运行状态和用户信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-accent/20">
                <span className="text-sm text-muted-foreground">当前用户</span>
                <span className="font-semibold">{user?.username}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-accent/20">
                <span className="text-sm text-muted-foreground">邮箱地址</span>
                <span className="font-medium text-sm">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-accent/20">
                <span className="text-sm text-muted-foreground">用户类型</span>
                <Badge className={user?.is_superuser ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-muted text-muted-foreground'}>
                  {user?.is_superuser ? '超级管理员' : '普通用户'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-accent/20">
                <span className="text-sm text-muted-foreground">上次登录</span>
                <span className="font-medium text-sm">
                  {user?.updated_at ? formatDateTime(user.updated_at) : '未知'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
