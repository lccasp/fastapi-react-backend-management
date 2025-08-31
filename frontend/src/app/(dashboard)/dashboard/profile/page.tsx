/**
 * 个人中心页面
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Save, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth';
import { useCurrentUser } from '@/hooks/useAuth';
import { formatDateTime } from '@/lib/utils';

// 个人信息表单验证
const profileSchema = z.object({
  nickname: z.string().min(1, '昵称不能为空'),
  email: z.string().email('邮箱格式不正确'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// 密码修改表单验证
const passwordSchema = z.object({
  old_password: z.string().min(1, '请输入当前密码'),
  new_password: z.string().min(6, '新密码至少6位'),
  confirm_password: z.string().min(6, '确认密码至少6位'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: '两次输入的密码不一致',
  path: ['confirm_password'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  useCurrentUser(); // 获取最新用户信息

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: user?.nickname || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    console.log('更新个人信息:', data);
    // TODO: 调用API更新个人信息
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    console.log('修改密码:', data);
    // TODO: 调用API修改密码
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">个人中心</h1>
        <p className="text-muted-foreground">
          管理您的个人信息和账户设置
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 用户信息卡片 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>用户信息</CardTitle>
            <CardDescription>
              您的基本信息概览
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 头像 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar_url} alt={user.username} />
                  <AvatarFallback className="text-lg">
                    {user.nickname?.[0] || user.username[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {user.nickname || user.username}
                </h3>
                <p className="text-sm text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </div>

            {/* 用户状态 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">账户状态:</span>
                <Badge variant={user.is_active ? 'default' : 'secondary'}>
                  {user.is_active ? '正常' : '禁用'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">用户类型:</span>
                <Badge variant={user.is_superuser ? 'destructive' : 'outline'}>
                  {user.is_superuser ? '超级管理员' : '普通用户'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">创建时间:</span>
                <span className="text-sm">
                  {formatDateTime(user.created_at).split(' ')[0]}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">最后更新:</span>
                <span className="text-sm">
                  {formatDateTime(user.updated_at).split(' ')[0]}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 设置表单 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 标签切换 */}
          <div className="flex space-x-1 border-b">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              个人信息
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'password'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('password')}
            >
              修改密码
            </button>
          </div>

          {/* 个人信息表单 */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>个人信息</CardTitle>
                <CardDescription>
                  更新您的个人基本信息
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">用户名</Label>
                      <Input
                        id="username"
                        value={user.username}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        用户名不可修改
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nickname">昵称</Label>
                      <Input
                        id="nickname"
                        {...profileForm.register('nickname')}
                        className={profileForm.formState.errors.nickname ? 'border-red-500' : ''}
                      />
                      {profileForm.formState.errors.nickname && (
                        <p className="text-sm text-red-500">
                          {profileForm.formState.errors.nickname.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱地址</Label>
                    <Input
                      id="email"
                      type="email"
                      {...profileForm.register('email')}
                      className={profileForm.formState.errors.email ? 'border-red-500' : ''}
                    />
                    {profileForm.formState.errors.email && (
                      <p className="text-sm text-red-500">
                        {profileForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full md:w-auto">
                    <Save className="mr-2 h-4 w-4" />
                    保存更改
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* 密码修改表单 */}
          {activeTab === 'password' && (
            <Card>
              <CardHeader>
                <CardTitle>修改密码</CardTitle>
                <CardDescription>
                  更改您的登录密码以确保账户安全
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="old_password">当前密码</Label>
                    <Input
                      id="old_password"
                      type="password"
                      {...passwordForm.register('old_password')}
                      className={passwordForm.formState.errors.old_password ? 'border-red-500' : ''}
                    />
                    {passwordForm.formState.errors.old_password && (
                      <p className="text-sm text-red-500">
                        {passwordForm.formState.errors.old_password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_password">新密码</Label>
                    <Input
                      id="new_password"
                      type="password"
                      {...passwordForm.register('new_password')}
                      className={passwordForm.formState.errors.new_password ? 'border-red-500' : ''}
                    />
                    {passwordForm.formState.errors.new_password && (
                      <p className="text-sm text-red-500">
                        {passwordForm.formState.errors.new_password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">确认新密码</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      {...passwordForm.register('confirm_password')}
                      className={passwordForm.formState.errors.confirm_password ? 'border-red-500' : ''}
                    />
                    {passwordForm.formState.errors.confirm_password && (
                      <p className="text-sm text-red-500">
                        {passwordForm.formState.errors.confirm_password.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full md:w-auto">
                    <Key className="mr-2 h-4 w-4" />
                    修改密码
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

