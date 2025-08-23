# 企业级管理系统 - 后端

基于FastAPI构建的企业级管理系统后端API服务，实现完整的RBAC权限管理体系。

## 功能特性

- 🔐 JWT认证系统
- 👥 用户管理
- 🎭 角色权限管理 (RBAC)
- 🏢 部门组织管理
- 💼 岗位管理
- 👤 个人中心
- 📊 统一API响应格式
- 🐛 完善的错误处理
- 📝 详细的中文注释

## 技术栈

- **FastAPI** - 高性能Web框架
- **SQLAlchemy 2.0** - ORM框架
- **Alembic** - 数据库迁移工具
- **PyJWT** - JWT令牌处理
- **Passlib** - 密码哈希
- **Loguru** - 结构化日志
- **Pydantic** - 数据验证

## 快速开始

### 1. 安装依赖

确保您已经创建了uv虚拟环境，然后安装依赖：

```bash
# 激活虚拟环境
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

# 安装依赖
uv pip install -r requirements.txt
```

### 2. 环境配置

复制环境变量文件：

```bash
cp .env.example .env
```

根据需要修改 `.env` 文件中的配置。

### 3. 初始化数据库

```bash
python manage.py init-db
```

这将创建数据库表并插入基础数据，包括：
- 基础权限数据
- 默认角色（超级管理员、系统管理员、普通用户）
- 示例部门和岗位
- 超级管理员账户（admin/admin123）

### 4. 运行服务

```bash
python manage.py runserver
```

服务将在 http://localhost:8000 启动。

访问 http://localhost:8000/docs 查看API文档。

## 管理命令

```bash
# 初始化数据库和基础数据
python manage.py init-db

# 创建数据库迁移
python manage.py makemigrations "迁移说明"

# 应用数据库迁移
python manage.py migrate

# 运行开发服务器
python manage.py runserver

# 显示帮助
python manage.py help
```

## API端点

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 用户登出

### 系统管理
- 用户管理: `/api/system/users/*`
- 角色管理: `/api/system/roles/*`
- 权限管理: `/api/system/permissions/*`
- 部门管理: `/api/system/departments/*`
- 岗位管理: `/api/system/positions/*`

### 个人中心
- 个人信息: `/api/profile/*`

## 默认账户

系统初始化后会创建以下默认账户：

- **超级管理员**: admin / admin123
- 拥有所有系统权限

## 权限系统

### 权限代码格式
权限采用 `resource:action` 格式：
- `user:list` - 查看用户列表
- `user:create` - 创建用户
- `role:assign` - 分配角色
- 等等...

### 权限验证
使用依赖注入进行权限验证：

```python
from app.dependencies.permissions import has_permission

@router.get("/users")
async def get_users(
    user: User = Depends(has_permission("user:list")),
    db: AsyncSession = Depends(get_db)
):
    # 只有拥有 user:list 权限的用户才能访问
    pass
```

## 项目结构

```
backend/
├── app/                    # 应用代码
│   ├── core/              # 核心配置
│   ├── models/            # 数据模型
│   ├── schemas/           # Pydantic响应模型
│   ├── dependencies/      # 依赖注入
│   └── modules/           # 业务模块
├── alembic/               # 数据库迁移
├── scripts/               # 初始化脚本
├── main.py               # 应用入口
├── manage.py             # 管理脚本
└── requirements.txt      # 依赖列表
```

## 开发说明

### 添加新的业务模块

1. 在 `app/modules/` 下创建新模块目录
2. 创建 `router.py`、`service.py`、`schemas.py`
3. 在主应用中注册路由

### 数据库迁移

```bash
# 创建迁移
python manage.py makemigrations "添加新表"

# 应用迁移
python manage.py migrate
```

### 权限管理

1. 在初始化脚本中添加新权限
2. 重新运行 `python manage.py init-db`
3. 或手动在数据库中添加

## 部署

### Docker部署

```bash
# 构建镜像
docker build -t enterprise-admin-backend .

# 运行容器
docker run -p 8000:8000 enterprise-admin-backend
```

### 生产环境配置

1. 修改 `.env` 文件中的生产环境配置
2. 使用PostgreSQL替代SQLite
3. 配置Redis缓存
4. 设置强密码和密钥

## 许可证

MIT License
