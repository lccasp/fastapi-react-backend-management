/**
 * 权限管理页面
 */

'use client';

import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Key, Shield, Settings, Layers } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';
import { formatDateTime } from '@/lib/utils';
import { usePermissions } from '@/hooks/useSystem';

// 模拟权限数据
const mockPermissions = [
  {
    id: 1,
    name: '系统管理',
    code: 'system',
    resource: 'system',
    action: 'manage',
    permission_type: 'menu',
    description: '系统管理菜单权限',
    parent_id: null,
    level: 0,
    children_count: 0,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    color: 'bg-gradient-to-r from-purple-500 to-indigo-500',
  },
  {
    id: 2,
    name: '用户管理',
    code: 'user',
    resource: 'user',
    action: 'manage',
    permission_type: 'menu',
    description: '用户管理菜单权限',
    parent_id: null,
    level: 0,
    children_count: 4,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  },
  {
    id: 3,
    name: '查看用户',
    code: 'user:list',
    resource: 'user',
    action: 'list',
    permission_type: 'api',
    description: '查看用户列表权限',
    parent_id: 2,
    level: 1,
    children_count: 0,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
  },
  {
    id: 4,
    name: '创建用户',
    code: 'user:create',
    resource: 'user',
    action: 'create',
    permission_type: 'api',
    description: '创建用户权限',
    parent_id: 2,
    level: 1,
    children_count: 0,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    color: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  },
  {
    id: 5,
    name: '更新用户',
    code: 'user:update',
    resource: 'user',
    action: 'update',
    permission_type: 'api',
    description: '更新用户信息权限',
    parent_id: 2,
    level: 1,
    children_count: 0,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    color: 'bg-gradient-to-r from-teal-500 to-blue-500',
  },
  {
    id: 6,
    name: '删除用户',
    code: 'user:delete',
    resource: 'user',
    action: 'delete',
    permission_type: 'api',
    description: '删除用户权限',
    parent_id: 2,
    level: 1,
    children_count: 0,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    color: 'bg-gradient-to-r from-red-500 to-pink-500',
  },
  {
    id: 7,
    name: '角色管理',
    code: 'role',
    resource: 'role',
    action: 'manage',
    permission_type: 'menu',
    description: '角色管理菜单权限',
    parent_id: null,
    level: 0,
    children_count: 5,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
  },
  {
    id: 8,
    name: '查看角色',
    code: 'role:list',
    resource: 'role',
    action: 'list',
    permission_type: 'api',
    description: '查看角色列表权限',
    parent_id: 7,
    level: 1,
    children_count: 0,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
  },
  {
    id: 9,
    name: '权限管理',
    code: 'permission',
    resource: 'permission',
    action: 'manage',
    permission_type: 'menu',
    description: '权限管理菜单权限',
    parent_id: null,
    level: 0,
    children_count: 4,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    color: 'bg-gradient-to-r from-pink-500 to-rose-500',
  },
  {
    id: 10,
    name: '部门管理',
    code: 'department',
    resource: 'department',
    action: 'manage',
    permission_type: 'menu',
    description: '部门管理菜单权限',
    parent_id: null,
    level: 0,
    children_count: 4,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    color: 'bg-gradient-to-r from-violet-500 to-purple-500',
  },
  {
    id: 11,
    name: '岗位管理',
    code: 'position',
    resource: 'position',
    action: 'manage',
    permission_type: 'menu',
    description: '岗位管理菜单权限',
    parent_id: null,
    level: 0,
    children_count: 4,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    color: 'bg-gradient-to-r from-indigo-500 to-blue-500',
  },
  {
    id: 12,
    name: '个人中心',
    code: 'profile',
    resource: 'profile',
    action: 'manage',
    permission_type: 'menu',
    description: '个人中心菜单权限',
    parent_id: null,
    level: 0,
    children_count: 3,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    color: 'bg-gradient-to-r from-slate-500 to-gray-500',
  },
];

const getPermissionIcon = (permissionType: string, resource: string) => {
  if (permissionType === 'menu') {
    switch (resource) {
      case 'system': return Settings;
      case 'user': return Shield;
      case 'role': return Shield;
      case 'permission': return Key;
      case 'department': return Layers;
      case 'position': return Layers;
      default: return Key;
    }
  }
  return Key;
};

export default function PermissionsPage() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');

  const { data: permissionsData, isLoading, error } = usePermissions();

  const permissionTypes = ['menu', 'api'];
  const permissions = permissionsData || [];
  
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = !search || 
      permission.name.toLowerCase().includes(search.toLowerCase()) ||
      permission.code.toLowerCase().includes(search.toLowerCase()) ||
      permission.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = !selectedType || permission.permission_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // 统计数据
  const menuPermissions = permissions.filter(p => p.permission_type === 'menu').length;
  const apiPermissions = permissions.filter(p => p.permission_type === 'api').length;
  const activePermissions = permissions.filter(p => p.is_active).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            权限管理
          </h1>
          <p className="text-muted-foreground mt-2">
            管理系统权限配置，控制功能模块和API接口的访问权限
          </p>
        </div>
        <PermissionGuard permission={PERMISSIONS.PERMISSION_CREATE}>
          <Button className="apple-button apple-shadow hover-lift">
            <Plus className="mr-2 h-4 w-4" />
            新增权限
          </Button>
        </PermissionGuard>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总权限数</CardTitle>
            <Key className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
            <p className="text-xs text-muted-foreground">
              活跃: {activePermissions}
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">菜单权限</CardTitle>
            <Settings className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menuPermissions}</div>
            <p className="text-xs text-muted-foreground">
              控制菜单显示
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API权限</CardTitle>
            <Shield className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiPermissions}</div>
            <p className="text-xs text-muted-foreground">
              控制接口访问
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">权限层级</CardTitle>
            <Layers className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {permissions.length > 0 ? Math.max(...permissions.map(p => p.level || 0)) + 1 : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              最大嵌套层级
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
            使用下面的选项来搜索和筛选权限
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                <Input
                  placeholder="搜索权限名称、代码、描述..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 apple-input"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {permissionTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  className="rounded-xl hover:bg-accent/60"
                  onClick={() => setSelectedType(selectedType === type ? '' : type)}
                >
                  {type === 'menu' ? '菜单权限' : 'API权限'}
                </Button>
              ))}
            </div>
            <Button variant="outline" className="rounded-xl hover:bg-accent/60">
              <Filter className="mr-2 h-4 w-4" />
              高级筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 权限列表 */}
      <Card className="apple-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            权限列表
          </CardTitle>
          <CardDescription>
            {isLoading ? '加载中...' : `共 ${filteredPermissions.length} 个权限`}
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
                  <TableHead>权限信息</TableHead>
                  <TableHead>权限代码</TableHead>
                  <TableHead>权限类型</TableHead>
                  <TableHead>资源/操作</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.map((permission) => {
                  const IconComponent = getPermissionIcon(permission.permission_type, permission.resource);
                  return (
                    <TableRow 
                      key={permission.id} 
                      className="hover:bg-accent/30 border-border/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3" style={{ paddingLeft: `${(permission.level || 0) * 20}px` }}>
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center apple-shadow">
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-base">{permission.name}</span>
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                              {permission.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                          {permission.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`rounded-lg ${permission.permission_type === 'menu' 
                            ? 'bg-blue/10 text-blue border-blue/20' 
                            : 'bg-green/10 text-green border-green/20'
                          }`}
                        >
                          {permission.permission_type === 'menu' ? '菜单权限' : 'API权限'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{permission.resource}</div>
                          <div className="text-xs text-muted-foreground">{permission.action}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={permission.is_active ? 'default' : 'secondary'}
                          className={`rounded-lg ${permission.is_active 
                            ? 'bg-success/10 text-success border-success/20' 
                            : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {permission.is_active ? '正常' : '禁用'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(permission.created_at)}
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
                            <PermissionGuard permission={PERMISSIONS.PERMISSION_UPDATE}>
                              <DropdownMenuItem className="hover:bg-accent/60 rounded-lg">
                                <Edit className="mr-2 h-4 w-4" />
                                编辑权限
                              </DropdownMenuItem>
                            </PermissionGuard>
                            <DropdownMenuSeparator />
                            <PermissionGuard permission={PERMISSIONS.PERMISSION_DELETE}>
                              <DropdownMenuItem className="text-destructive focus:text-destructive hover:bg-destructive/10 rounded-lg">
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除权限
                              </DropdownMenuItem>
                            </PermissionGuard>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
