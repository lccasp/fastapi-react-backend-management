/**
 * 部门管理页面
 */

'use client';

import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Building2, Users, MapPin } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';
import { formatDateTime } from '@/lib/utils';
import { useDepartmentTree } from '@/hooks/useSystem';

export default function DepartmentsPage() {
  const [search, setSearch] = useState('');
  
  const { data: departmentTreeData, isLoading, error } = useDepartmentTree();

  // 扁平化部门数据用于显示和统计
  const flattenDepartments = (depts: any[]): any[] => {
    if (!depts) return [];
    const result: any[] = [];
    depts.forEach(dept => {
      result.push(dept);
      if (dept.children) {
        result.push(...flattenDepartments(dept.children));
      }
    });
    return result;
  };

  const allDepartments = flattenDepartments(departmentTreeData || []);
  const totalEmployees = allDepartments.reduce((sum, dept) => sum + (dept.user_count || 0), 0);
  const activeDepartments = allDepartments.filter(dept => dept.is_active).length;

  // 过滤部门
  const filteredDepartments = allDepartments.filter(dept => {
    if (!search) return true;
    return dept.name.toLowerCase().includes(search.toLowerCase()) ||
           dept.description?.toLowerCase().includes(search.toLowerCase()) ||
           dept.code.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            部门管理
          </h1>
          <p className="text-muted-foreground mt-2">
            管理组织架构，配置部门层级关系和负责人信息
          </p>
        </div>
        <PermissionGuard permission={PERMISSIONS.DEPARTMENT_CREATE}>
          <Button className="apple-button apple-shadow hover-lift">
            <Plus className="mr-2 h-4 w-4" />
            新增部门
          </Button>
        </PermissionGuard>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总部门数</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allDepartments.length}</div>
            <p className="text-xs text-muted-foreground">
              活跃: {activeDepartments}
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总员工数</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              分布在各个部门
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">管理层级</CardTitle>
            <Building2 className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allDepartments.length > 0 ? Math.max(...allDepartments.map(d => (d.level || 0))) + 1 : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              层级深度
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均规模</CardTitle>
            <Users className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allDepartments.length > 0 ? Math.round(totalEmployees / allDepartments.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              每部门平均人数
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
            使用下面的选项来搜索和筛选部门
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                <Input
                  placeholder="搜索部门名称、编码、描述..."
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

      {/* 部门列表 */}
      <Card className="apple-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            部门列表
          </CardTitle>
          <CardDescription>
            {isLoading ? '加载中...' : `共 ${filteredDepartments.length} 个部门`}
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
                  <TableHead>部门信息</TableHead>
                  <TableHead>负责人</TableHead>
                  <TableHead>员工数量</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((department) => (
                  <TableRow key={department.id} className="hover:bg-accent/30 border-border/50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center apple-shadow text-white">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-base">{department.name}</span>
                            <Badge variant="outline" className="text-xs bg-muted/50">
                              {department.code}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {department.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8 apple-shadow">
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white text-sm">
                            {department.leader_name?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{department.leader_name || '未设置'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{department.user_count || 0}</span>
                        <span className="text-xs text-muted-foreground">人</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={department.is_active ? 'default' : 'secondary'}
                        className={`rounded-lg ${department.is_active 
                          ? 'bg-success/10 text-success border-success/20' 
                          : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {department.is_active ? '正常' : '停用'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(department.created_at)}
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
                          <PermissionGuard permission={PERMISSIONS.DEPARTMENT_UPDATE}>
                            <DropdownMenuItem className="hover:bg-accent/60 rounded-lg">
                              <Edit className="mr-2 h-4 w-4" />
                              编辑部门
                            </DropdownMenuItem>
                          </PermissionGuard>
                          <PermissionGuard permission={PERMISSIONS.DEPARTMENT_CREATE}>
                            <DropdownMenuItem className="hover:bg-accent/60 rounded-lg">
                              <Plus className="mr-2 h-4 w-4" />
                              添加子部门
                            </DropdownMenuItem>
                          </PermissionGuard>
                          <DropdownMenuItem className="hover:bg-accent/60 rounded-lg">
                            <Users className="mr-2 h-4 w-4" />
                            管理成员
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <PermissionGuard permission={PERMISSIONS.DEPARTMENT_DELETE}>
                            <DropdownMenuItem className="text-destructive focus:text-destructive hover:bg-destructive/10 rounded-lg">
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除部门
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
    </div>
  );
}