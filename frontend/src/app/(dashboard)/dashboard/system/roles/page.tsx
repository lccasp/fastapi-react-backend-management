/**
 * 角色管理页面
 */

'use client';

import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Shield, Users, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';
import { formatDateTime } from '@/lib/utils';
import { useRoles, useDeleteRole } from '@/hooks/useSystem';
import { RoleWithPermissions } from '@/types/system';
import { RoleFormDialog } from '@/components/system/RoleFormDialog';

export default function RolesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<boolean>();

  // 对话框状态
  const [roleFormOpen, setRoleFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null);
  
  // 删除确认对话框
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleWithPermissions | null>(null);

  const { data: rolesData, isLoading, error } = useRoles({
    page,
    page_size: 10,
    search: search || undefined,
    is_active: isActive,
  });

  const deleteRoleMutation = useDeleteRole();

  // 处理新增角色
  const handleCreateRole = () => {
    setFormMode('create');
    setSelectedRole(null);
    setRoleFormOpen(true);
  };

  // 处理编辑角色
  const handleEditRole = (role: RoleWithPermissions) => {
    setFormMode('edit');
    setSelectedRole(role);
    setRoleFormOpen(true);
  };

  // 处理删除角色
  const handleDeleteRole = (role: RoleWithPermissions) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  // 确认删除角色
  const confirmDeleteRole = async () => {
    if (roleToDelete) {
      try {
        await deleteRoleMutation.mutateAsync(roleToDelete.id);
        setDeleteDialogOpen(false);
        setRoleToDelete(null);
      } catch (error) {
        console.error('删除角色失败:', error);
      }
    }
  };

  const roles = rolesData?.items || [];
  const totalRoles = rolesData?.total || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            角色管理
          </h1>
          <p className="text-muted-foreground mt-2">
            管理系统角色权限，控制用户访问范围和操作权限
          </p>
        </div>
        <PermissionGuard permission={PERMISSIONS.ROLE_CREATE}>
          <Button 
            className="apple-button apple-shadow hover-lift"
            onClick={handleCreateRole}
          >
            <Plus className="mr-2 h-4 w-4" />
            新增角色
          </Button>
        </PermissionGuard>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总角色数</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRoles}</div>
            <p className="text-xs text-muted-foreground">
              活跃: {roles.filter(r => r.is_active).length}
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">关联用户</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles.reduce((sum, role) => sum + (role.users_count || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              已分配用户总数
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">权限总数</CardTitle>
            <Key className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles.reduce((sum, role) => sum + (role.permissions?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              所有角色权限汇总
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均权限</CardTitle>
            <Shield className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles.length > 0 ? Math.round(
                roles.reduce((sum, role) => sum + (role.permissions?.length || 0), 0) / roles.length
              ) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              每个角色平均权限数
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card className="apple-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            搜索筛选
          </CardTitle>
          <CardDescription>
            使用下面的选项来搜索和筛选角色
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                <Input
                  placeholder="搜索角色名称、描述..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 apple-input"
                />
              </div>
            </div>
            <Button variant="outline" className="rounded-xl hover:bg-accent/60">
              <Filter className="mr-2 h-4 w-4" />
              高级筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 角色列表 */}
      <Card className="apple-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            角色列表
          </CardTitle>
          <CardDescription>
            {isLoading ? '加载中...' : `共 ${totalRoles} 个角色`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-muted-foreground">
              加载失败，请重试
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead>角色信息</TableHead>
                  <TableHead>权限数量</TableHead>
                  <TableHead>关联用户</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow 
                    key={role.id} 
                    className="hover:bg-accent/30 border-border/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center apple-shadow">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-base">{role.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {role.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{role.permissions?.length || 0}</span>
                        <span className="text-xs text-muted-foreground">个权限</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{role.users_count || 0}</span>
                        <span className="text-xs text-muted-foreground">个用户</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={role.is_active ? 'default' : 'secondary'}
                        className={`rounded-lg ${role.is_active 
                          ? 'bg-success/10 text-success border-success/20' 
                          : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {role.is_active ? '活跃' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(role.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0 rounded-lg hover:bg-accent/60"
                          >
                            <span className="sr-only">打开菜单</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="apple-card animate-slide-up">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuItem className="hover:bg-accent/60 rounded-lg">
                            查看详情
                          </DropdownMenuItem>
                          <PermissionGuard permission={PERMISSIONS.ROLE_UPDATE}>
                            <DropdownMenuItem 
                              className="hover:bg-accent/60 rounded-lg"
                              onClick={() => handleEditRole(role)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              编辑角色
                            </DropdownMenuItem>
                          </PermissionGuard>
                          <PermissionGuard permission={PERMISSIONS.ROLE_ASSIGN}>
                            <DropdownMenuItem className="hover:bg-accent/60 rounded-lg">
                              <Users className="mr-2 h-4 w-4" />
                              分配用户
                            </DropdownMenuItem>
                          </PermissionGuard>
                          <PermissionGuard permission={PERMISSIONS.PERMISSION_ASSIGN}>
                            <DropdownMenuItem className="hover:bg-accent/60 rounded-lg">
                              <Key className="mr-2 h-4 w-4" />
                              权限配置
                            </DropdownMenuItem>
                          </PermissionGuard>
                          <DropdownMenuSeparator />
                          <PermissionGuard permission={PERMISSIONS.ROLE_DELETE}>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive hover:bg-destructive/10 rounded-lg"
                              onClick={() => handleDeleteRole(role)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除角色
                            </DropdownMenuItem>
                          </PermissionGuard>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 角色表单对话框 */}
      <RoleFormDialog
        open={roleFormOpen}
        onOpenChange={setRoleFormOpen}
        role={selectedRole}
        mode={formMode}
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="apple-card">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除角色</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除角色 "{roleToDelete?.name}" 吗？
              此操作无法撤销，关联的用户将失去该角色。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
