/**
 * 角色表单对话框组件
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RoleWithPermissions } from '@/types/system';
import { useCreateRole, useUpdateRole, usePermissions } from '@/hooks/useSystem';

const roleFormSchema = z.object({
  name: z.string().min(2, '角色名称至少2个字符').max(100, '角色名称不能超过100个字符'),
  code: z.string().min(2, '角色代码至少2个字符').max(50, '角色代码不能超过50个字符'),
  description: z.string().optional(),
  is_active: z.boolean(),
  permission_ids: z.array(z.string()),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: RoleWithPermissions | null;
  mode: 'create' | 'edit';
}

export function RoleFormDialog({ open, onOpenChange, role, mode }: RoleFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const { data: permissionsData } = usePermissions();

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      is_active: true,
      permission_ids: [],
    },
  });

  // 当角色数据变化时更新表单
  useEffect(() => {
    if (mode === 'edit' && role) {
      form.reset({
        name: role.name,
        code: role.code,
        description: role.description || '',
        is_active: role.is_active,
        permission_ids: role.permissions?.map(p => p.id) || [],
      });
    } else if (mode === 'create') {
      form.reset({
        name: '',
        code: '',
        description: '',
        is_active: true,
        permission_ids: [],
      });
    }
  }, [mode, role, form]);

  const onSubmit = async (data: RoleFormData) => {
    setIsLoading(true);
    
    try {
      if (mode === 'create') {
        await createRoleMutation.mutateAsync(data);
      } else if (mode === 'edit' && role) {
        await updateRoleMutation.mutateAsync({
          id: role.id,
          data,
        });
      }
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('保存角色失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const permissions = permissionsData || [];
  const selectedPermissionIds = form.watch('permission_ids');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden apple-card backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 shadow-2xl border-0 rounded-3xl p-0">
        <div className="relative overflow-hidden">
          {/* 渐变背景 */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-orange-500/10"></div>
          
          {/* 顶部装饰条 */}
          <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
          
          <div className="relative p-8 max-h-[86vh] overflow-y-auto custom-scrollbar">
            <DialogHeader className="space-y-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {mode === 'create' ? '新增角色' : '编辑角色'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
                    {mode === 'create' ? '创建新的系统角色并配置权限' : '修改角色信息和权限设置'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* 基本信息卡片 */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    基本信息
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">角色名称 *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="请输入角色名称" 
                              className="h-12 rounded-xl border-0 bg-gray-50/80 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500/50 transition-all duration-200"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">角色代码 *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="请输入角色代码" 
                              className="h-12 rounded-xl border-0 bg-gray-50/80 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500/50 transition-all duration-200"
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
                    name="description"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">角色描述</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="请输入角色描述" 
                            className="min-h-[100px] rounded-xl border-0 bg-gray-50/80 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 resize-none"
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 border border-green-200/50 dark:border-green-700/50 mt-4">
                        <div className="space-y-1">
                          <FormLabel className="text-base font-medium text-gray-900 dark:text-white">激活状态</FormLabel>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            是否激活该角色
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
                </div>

                {/* 权限配置卡片 */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <FormField
                    control={form.control}
                    name="permission_ids"
                    render={() => (
                      <FormItem>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          <FormLabel className="text-lg font-semibold text-gray-900 dark:text-white">权限配置</FormLabel>
                          <div className="ml-auto px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full text-xs font-medium text-orange-600 dark:text-orange-400">
                            已选择 {selectedPermissionIds.length} 个权限
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-900/10 dark:to-amber-900/10 rounded-xl p-4 border border-orange-200/30 dark:border-orange-700/30 max-h-80 overflow-y-auto custom-scrollbar">
                          <div className="grid grid-cols-1 gap-3">
                            {permissions.map((permission) => (
                              <FormField
                                key={permission.id}
                                control={form.control}
                                name="permission_ids"
                                render={({ field }) => {
                                  const isSelected = selectedPermissionIds.includes(permission.id);
                                  return (
                                    <FormItem
                                      key={permission.id}
                                      className={`flex flex-row items-center space-x-4 space-y-0 p-4 rounded-xl border transition-all duration-200 ${
                                        isSelected 
                                          ? 'bg-white/80 dark:bg-gray-800/80 border-orange-300 dark:border-orange-600 shadow-md' 
                                          : 'bg-white/40 dark:bg-gray-800/40 border-gray-200/50 dark:border-gray-700/50 hover:bg-white/60 dark:hover:bg-gray-800/60'
                                      }`}
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={isSelected}
                                          onCheckedChange={(checked: boolean) => {
                                            const currentIds = field.value || [];
                                            if (checked) {
                                              field.onChange([...currentIds, permission.id]);
                                            } else {
                                              field.onChange(currentIds.filter(id => id !== permission.id));
                                            }
                                          }}
                                          className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                        />
                                      </FormControl>
                                      <div className="flex-1 grid gap-1">
                                        <label className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                                          {permission.name}
                                        </label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                          {permission.description}
                                        </p>
                                      </div>
                                      <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                                        permission.permission_type === 'menu' 
                                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                          : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                      }`}>
                                        {permission.permission_type === 'menu' ? '菜单' : 'API'}
                                      </div>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    className="h-12 px-8 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        保存中...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        {mode === 'create' ? '创建角色' : '保存修改'}
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
