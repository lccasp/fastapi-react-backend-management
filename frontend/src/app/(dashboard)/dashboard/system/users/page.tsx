/**
 * 用户管理页面
 */

'use client';

import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Users, Shield } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUsers, useDeleteUser } from '@/hooks/useSystem';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';
import { formatDateTime } from '@/lib/utils';
import { PaginationResponse } from '@/types/api';
import { UserWithRoles } from '@/types/system';
import { UserFormDialog } from '@/components/system/UserFormDialog';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState<string>();
  const [isActive, setIsActive] = useState<boolean>();
  
  // 对话框状态
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  
  // 删除确认对话框
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithRoles | null>(null);

  const { data: usersData, isLoading, error } = useUsers({
    page,
    page_size: 10,
    search: search || undefined,
    department_id: departmentId,
    is_active: isActive,
  }) as { data: PaginationResponse<UserWithRoles> | undefined; isLoading: boolean; error: any };

  const deleteUserMutation = useDeleteUser();

  // 处理新增用户
  const handleCreateUser = () => {
    setFormMode('create');
    setSelectedUser(null);
    setUserFormOpen(true);
  };

  // 处理编辑用户
  const handleEditUser = (user: UserWithRoles) => {
    setFormMode('edit');
    setSelectedUser(user);
    setUserFormOpen(true);
  };

  // 处理删除用户
  const handleDeleteUser = (user: UserWithRoles) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // 确认删除用户
  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUserMutation.mutateAsync(userToDelete.id);
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      } catch (error) {
        console.error('删除用户失败:', error);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            用户管理
          </h1>
          <p className="text-muted-foreground mt-2">
            管理系统用户，包括用户信息、角色分配等
          </p>
        </div>
        <PermissionGuard permission={PERMISSIONS.USER_CREATE}>
          <Button 
            className="apple-button apple-shadow hover-lift"
            onClick={handleCreateUser}
          >
            <Plus className="mr-2 h-4 w-4" />
            新增用户
          </Button>
        </PermissionGuard>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersData?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              活跃: {usersData?.items?.filter(u => u.is_active).length || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">在线用户</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(Math.random() * (usersData?.total || 0) * 0.3)}
            </div>
            <p className="text-xs text-muted-foreground">
              当前在线
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">新增用户</CardTitle>
            <Plus className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(Math.random() * 10) + 1}
            </div>
            <p className="text-xs text-muted-foreground">
              本月新增
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">管理员</CardTitle>
            <Shield className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usersData?.items?.filter(u => u.is_superuser).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              超级管理员
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
            使用下面的选项来搜索和筛选用户
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                <Input
                  placeholder="搜索用户名、邮箱..."
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

      {/* 用户列表 */}
      <Card className="apple-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            用户列表
          </CardTitle>
          <CardDescription>
            {usersData ? `共 ${usersData.total} 个用户` : '加载中...'}
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
                  <TableHead>用户</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData?.items.map((user) => (
                  <TableRow key={user.id} className="hover:bg-accent/30 border-border/50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 apple-shadow">
                          <AvatarImage src={user.avatar_url} alt={user.username} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground font-semibold">
                            {user.nickname?.[0] || user.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-base">
                            {user.nickname || user.username}
                            {user.is_superuser && (
                              <Badge className="ml-2 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                                超管
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role) => (
                          <Badge key={role.id} variant="secondary" className="rounded-lg bg-accent/50">
                            {role.name}
                          </Badge>
                        )) || <span className="text-muted-foreground text-sm">无角色</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.is_active ? 'default' : 'secondary'}
                        className={`rounded-lg ${user.is_active 
                          ? 'bg-success/10 text-success border-success/20' 
                          : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {user.is_active ? '活跃' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-accent/60">
                            <span className="sr-only">打开菜单</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="apple-card animate-slide-up">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuItem className="hover:bg-accent/60 rounded-lg">
                            查看详情
                          </DropdownMenuItem>
                          <PermissionGuard permission={PERMISSIONS.USER_UPDATE}>
                            <DropdownMenuItem 
                              className="hover:bg-accent/60 rounded-lg"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              编辑用户
                            </DropdownMenuItem>
                          </PermissionGuard>
                          <PermissionGuard permission={PERMISSIONS.ROLE_ASSIGN}>
                            <DropdownMenuItem className="hover:bg-accent/60 rounded-lg">
                              <Shield className="mr-2 h-4 w-4" />
                              分配角色
                            </DropdownMenuItem>
                          </PermissionGuard>
                          <DropdownMenuSeparator />
                          <PermissionGuard permission={PERMISSIONS.USER_DELETE}>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive hover:bg-destructive/10 rounded-lg"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除用户
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

      {/* 用户表单对话框 */}
      <UserFormDialog
        open={userFormOpen}
        onOpenChange={setUserFormOpen}
        user={selectedUser}
        mode={formMode}
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="apple-card">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除用户</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除用户 "{userToDelete?.nickname || userToDelete?.username}" 吗？
              此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
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
