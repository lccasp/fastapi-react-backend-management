/**
 * 岗位管理页面
 */

'use client';

import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Briefcase, Users, Star, TrendingUp } from 'lucide-react';
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
import { usePositions } from '@/hooks/useSystem';

export default function PositionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState<string>();

  const { data: positionsData, isLoading, error } = usePositions({
    page,
    page_size: 10,
    search: search || undefined,
    department_id: departmentId,
  });

  const positions = positionsData?.items || [];
  const totalPositions = positionsData?.total || 0;

  // 统计数据
  const totalEmployees = positions.reduce((sum, pos) => sum + (pos.user_count || 0), 0);
  const totalCapacity = positions.length * 10; // 假设每个岗位平均编制10人
  const activePositions = positions.filter(pos => pos.is_active).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            岗位管理
          </h1>
          <p className="text-muted-foreground mt-2">
            管理公司岗位设置，定义职责要求和薪资结构
          </p>
        </div>
        <PermissionGuard permission={PERMISSIONS.POSITION_CREATE}>
          <Button className="apple-button apple-shadow hover-lift">
            <Plus className="mr-2 h-4 w-4" />
            新增岗位
          </Button>
        </PermissionGuard>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总岗位数</CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPositions}</div>
            <p className="text-xs text-muted-foreground">
              活跃: {activePositions}
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">在职人数</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              / {totalCapacity} 编制
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">关键岗位</CardTitle>
            <Star className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(totalPositions * 0.2)}
            </div>
            <p className="text-xs text-muted-foreground">
              核心岗位数量
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">编制利用率</CardTitle>
            <TrendingUp className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCapacity > 0 ? Math.round((totalEmployees / totalCapacity) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              人员配置比例
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
            使用下面的选项来搜索和筛选岗位
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                <Input
                  placeholder="搜索岗位名称、描述、所属部门..."
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

      {/* 岗位列表 */}
      <Card className="apple-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            岗位列表
          </CardTitle>
          <CardDescription>
            {isLoading ? '加载中...' : `共 ${totalPositions} 个岗位`}
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
                  <TableHead>岗位信息</TableHead>
                  <TableHead>所属部门</TableHead>
                  <TableHead>人员配置</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => (
                  <TableRow 
                    key={position.id} 
                    className="hover:bg-accent/30 border-border/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center apple-shadow">
                          <Briefcase className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-base">{position.name}</span>
                            <Badge variant="outline" className="text-xs bg-muted/50">
                              {position.code}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                            {position.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{position.department_name || '未分配'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{position.user_count || 0}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-muted-foreground">10</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(((position.user_count || 0) / 10) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={position.is_active ? 'default' : 'secondary'}
                        className={`rounded-lg ${position.is_active 
                          ? 'bg-success/10 text-success border-success/20' 
                          : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {position.is_active ? '正常' : '停用'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(position.created_at)}
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
                          <PermissionGuard permission={PERMISSIONS.POSITION_UPDATE}>
                            <DropdownMenuItem className="hover:bg-accent/60 rounded-lg">
                              <Edit className="mr-2 h-4 w-4" />
                              编辑岗位
                            </DropdownMenuItem>
                          </PermissionGuard>
                          <DropdownMenuItem className="hover:bg-accent/60 rounded-lg">
                            <Users className="mr-2 h-4 w-4" />
                            查看成员
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-accent/60 rounded-lg">
                            <Plus className="mr-2 h-4 w-4" />
                            招聘计划
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <PermissionGuard permission={PERMISSIONS.POSITION_DELETE}>
                            <DropdownMenuItem className="text-destructive focus:text-destructive hover:bg-destructive/10 rounded-lg">
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除岗位
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