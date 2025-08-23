/**
 * 登录页面
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogin } from '@/hooks/useAuth';
import { LoginRequest } from '@/types/auth';

// 表单验证schema
const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data);
  };

  return (
    <Card className="w-full apple-card animate-fade-in apple-shadow-lg">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center apple-shadow mb-4">
          <LogIn className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          登录系统
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          使用您的账户登录企业级管理系统
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="username" className="text-sm font-semibold">用户名</Label>
            <Input
              id="username"
              type="text"
              placeholder="请输入用户名或邮箱"
              {...register('username')}
              className={`apple-input h-12 ${errors.username ? 'border-destructive focus:border-destructive' : ''}`}
            />
            {errors.username && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <span className="w-1 h-1 bg-destructive rounded-full"></span>
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-sm font-semibold">密码</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="请输入密码"
                {...register('password')}
                className={`apple-input h-12 pr-12 ${errors.password ? 'border-destructive focus:border-destructive' : ''}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg hover:bg-accent/60"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <span className="w-1 h-1 bg-destructive rounded-full"></span>
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 apple-button text-base font-semibold"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>登录中...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <LogIn className="h-5 w-5" />
                <span>登录系统</span>
              </div>
            )}
          </Button>
        </form>

        <div className="text-center">
          <span className="text-muted-foreground text-sm">还没有账户？</span>
          <Link
            href="/register"
            className="font-semibold text-primary hover:text-primary/80 ml-1 text-sm"
          >
            立即注册
          </Link>
        </div>

        {/* 
        ⚠️ 演示环境提示 - 生产环境请移除这个区块
        移除步骤：
        1. 删除下面整个演示账户信息区块
        2. 删除后端 scripts/demo_data.py 文件
        3. 清空数据库并重新初始化生产数据
        */}
        <div className="glass-effect rounded-2xl p-6 border apple-shadow animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <h4 className="text-base font-semibold text-foreground">🎭 演示环境</h4>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="apple-card p-4 hover-lift">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    🔑
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">超级管理员</div>
                    <div className="font-mono text-sm text-muted-foreground">admin / admin123</div>
                    <div className="text-xs text-muted-foreground">拥有所有系统权限</div>
                  </div>
                </div>
              </div>
              <div className="apple-card p-4 hover-lift">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                    👨‍💼
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">部门经理</div>
                    <div className="font-mono text-sm text-muted-foreground">manager / manager123</div>
                    <div className="text-xs text-muted-foreground">部门管理权限</div>
                  </div>
                </div>
              </div>
              <div className="apple-card p-4 hover-lift">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                    👥
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">HR专员</div>
                    <div className="font-mono text-sm text-muted-foreground">hr / hr123</div>
                    <div className="text-xs text-muted-foreground">人力资源管理权限</div>
                  </div>
                </div>
              </div>
              <div className="apple-card p-4 hover-lift">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gray-500 to-slate-500 flex items-center justify-center text-white font-bold text-sm">
                    👤
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">普通员工</div>
                    <div className="font-mono text-sm text-muted-foreground">employee / employee123</div>
                    <div className="text-xs text-muted-foreground">基础个人中心权限</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground text-center pt-3 border-t border-border/50">
              💡 这是演示环境，生产部署时请移除此提示框
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}