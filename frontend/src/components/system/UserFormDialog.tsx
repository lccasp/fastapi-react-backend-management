/**
 * 用户表单对话框组件
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { UserWithRoles } from '@/types/system';
import { useCreateUser, useUpdateUser } from '@/hooks/useSystem';

const userFormSchema = z.object({
  username: z.string().min(3, '用户名至少3个字符').max(50, '用户名不能超过50个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  nickname: z.string().optional(),
  password: z.string().min(6, '密码至少6个字符').optional(),
  avatar_url: z.string().url('请输入有效的头像URL').optional().or(z.literal('')),
  is_superuser: z.boolean(),
  is_active: z.boolean(),
  department_id: z.string().optional(),
  position_id: z.string().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserWithRoles | null;
  mode: 'create' | 'edit';
}

export function UserFormDialog({ open, onOpenChange, user, mode }: UserFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      email: '',
      nickname: '',
      password: '',
      avatar_url: '',
      is_superuser: false,
      is_active: true,
      department_id: '',
      position_id: '',
    },
  });

  // 当用户数据变化时更新表单
  useEffect(() => {
    if (mode === 'edit' && user) {
      form.reset({
        username: user.username,
        email: user.email,
        nickname: user.nickname || '',
        password: '', // 编辑时密码为空，表示不修改
        avatar_url: user.avatar_url || '',
        is_superuser: user.is_superuser,
        is_active: user.is_active,
        department_id: user.department_id || '',
        position_id: user.position_id || '',
      });
    } else if (mode === 'create') {
      form.reset({
        username: '',
        email: '',
        nickname: '',
        password: '',
        avatar_url: '',
        is_superuser: false,
        is_active: true,
        department_id: '',
        position_id: '',
      });
    }
  }, [mode, user, form]);

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    
    try {
      if (mode === 'create') {
        await createUserMutation.mutateAsync({
          ...data,
          password: data.password!, // 创建时密码必填
        });
      } else if (mode === 'edit' && user) {
        const updateData: any = { ...data };
        // 如果密码为空，则不更新密码
        if (!data.password) {
          delete updateData.password;
        }
        await updateUserMutation.mutateAsync({
          id: user.id,
          data: updateData,
        });
      }
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('保存用户失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden apple-card backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 shadow-2xl border-0 rounded-3xl p-0">
        <div className="relative overflow-hidden">
          {/* 渐变背景 */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10"></div>
          
          {/* 顶部装饰条 */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          <div className="relative p-8">
            <DialogHeader className="space-y-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {mode === 'create' ? '新增用户' : '编辑用户'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
                    {mode === 'create' ? '创建新的系统用户账户' : '修改用户账户信息'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* 基本信息卡片 */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    基本信息
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">用户名 *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="请输入用户名" 
                              className="h-12 rounded-xl border-0 bg-gray-50/80 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">邮箱 *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="请输入邮箱" 
                              className="h-12 rounded-xl border-0 bg-gray-50/80 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nickname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">昵称</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="请输入昵称" 
                              className="h-12 rounded-xl border-0 bg-gray-50/80 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            密码 {mode === 'create' ? '*' : '(留空表示不修改)'}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder={mode === 'create' ? '请输入密码' : '留空表示不修改密码'} 
                              className="h-12 rounded-xl border-0 bg-gray-50/80 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="avatar_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">头像URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="请输入头像URL" 
                            className="h-12 rounded-xl border-0 bg-gray-50/80 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 权限设置卡片 */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    权限设置
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 border border-green-200/50 dark:border-green-700/50">
                          <div className="space-y-1">
                            <FormLabel className="text-base font-medium text-gray-900 dark:text-white">激活状态</FormLabel>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              是否激活该用户账号
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-green-500"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_superuser"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-5 border border-orange-200/50 dark:border-orange-700/50">
                          <div className="space-y-1">
                            <FormLabel className="text-base font-medium text-gray-900 dark:text-white">超级管理员</FormLabel>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              拥有系统最高权限
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-orange-500"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                    className="h-12 px-8 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    取消
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="h-12 px-8 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        保存中...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {mode === 'create' ? '创建用户' : '保存修改'}
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
