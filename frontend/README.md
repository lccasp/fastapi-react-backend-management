# 企业级管理系统 - 前端

基于 Next.js 14 构建的现代化企业级管理系统前端。

## 🚀 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **组件库**: Shadcn/ui
- **状态管理**: Zustand
- **数据获取**: TanStack Query (React Query)
- **表单处理**: React Hook Form + Zod
- **HTTP客户端**: Axios
- **图标**: Lucide React
- **认证**: JWT + Cookie

## 📦 项目结构

```
src/
├── app/                    # Next.js 应用路由
│   ├── (auth)/            # 认证相关页面
│   ├── (dashboard)/       # 仪表盘页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── auth/              # 认证相关组件
│   ├── layout/            # 布局组件
│   ├── providers/         # 提供程序组件
│   └── ui/                # UI 基础组件
├── hooks/                 # 自定义 React Hooks
├── lib/                   # 工具库
├── services/              # API 服务层
├── stores/                # Zustand 状态管理
└── types/                 # TypeScript 类型定义
```

## 🏗️ 核心功能

### 认证系统
- ✅ JWT 令牌认证
- ✅ 登录/登出功能
- ✅ 认证状态管理
- ✅ 路由保护

### 权限管理
- ✅ RBAC 基于角色的权限控制
- ✅ 细粒度权限检查
- ✅ 组件级权限守卫
- ✅ 页面级权限保护

### 用户界面
- ✅ 现代化响应式设计
- ✅ 明暗主题切换
- ✅ 侧边栏导航
- ✅ 用户头像和菜单

### 系统管理
- ✅ 用户管理界面
- ✅ 角色权限管理
- ✅ 部门岗位管理
- ✅ 个人中心页面

## 🔧 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

### 代码检查

```bash
npm run lint
```

## 🌐 API 配置

在 `.env.local` 中配置 API 地址：

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 📱 页面路由

- `/` - 首页（重定向到仪表盘或登录）
- `/login` - 登录页面
- `/dashboard` - 仪表盘首页
- `/dashboard/system/users` - 用户管理
- `/dashboard/system/roles` - 角色管理
- `/dashboard/system/permissions` - 权限管理
- `/dashboard/system/departments` - 部门管理
- `/dashboard/system/positions` - 岗位管理
- `/dashboard/profile` - 个人中心

## 🔐 权限系统

系统采用 RBAC（基于角色的访问控制）模型：

### 权限代码格式
```
resource:action
```

### 示例权限
- `user:list` - 查看用户列表
- `user:create` - 创建用户
- `user:update` - 更新用户
- `user:delete` - 删除用户
- `role:assign` - 分配角色

### 使用权限守卫
```tsx
import { PermissionGuard } from '@/components/auth/PermissionGuard';

<PermissionGuard permission="user:create">
  <Button>新增用户</Button>
</PermissionGuard>
```

## 📊 状态管理

使用 Zustand 进行状态管理：

- `useAuthStore` - 认证状态（用户信息、权限、角色）
- `useThemeStore` - 主题状态（明暗主题）
- `useUIStore` - UI 状态（侧边栏、全局加载、错误）

## 🎨 样式指南

- 使用 Tailwind CSS 进行样式设计
- 遵循 Shadcn/ui 设计系统
- 支持明暗主题切换
- 响应式设计优先

## 🚀 部署说明

### Docker 部署

项目包含 Docker 配置，可以使用 Docker Compose 部署：

```bash
docker-compose up -d
```

### 静态部署

构建静态文件并部署到 CDN：

```bash
npm run build
npm run export
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。