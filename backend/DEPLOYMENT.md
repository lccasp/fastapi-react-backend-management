# 部署指南

## 快速开始

### 1. 环境准备

确保您已安装：
- Python 3.11+
- uv（现代Python包管理器）

### 2. 安装和配置

```bash
# 1. 克隆项目并进入目录
cd fastapi-template

# 2. 创建uv虚拟环境
uv venv

# 3. 激活虚拟环境
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

# 4. 进入backend目录
cd backend

# 5. 安装依赖
uv pip install -r requirements.txt
uv pip install pydantic-settings 'pydantic[email]' aiosqlite

# 6. 初始化数据库
python simple_init.py

# 7. 启动服务器
python main.py
```

### 3. 验证安装

服务启动后：
- API文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/health

### 4. 默认账户

- 用户名: `admin`
- 密码: `admin123`

## API端点

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 用户登出

### 系统管理
- `GET /api/system/users` - 获取用户列表
- `POST /api/system/users` - 创建用户
- `GET /api/system/roles` - 获取角色列表
- `GET /api/system/permissions/tree` - 获取权限树
- `GET /api/system/departments/tree` - 获取部门树

### 个人中心
- `GET /api/profile/me` - 获取个人信息
- `PUT /api/profile/me` - 更新个人信息
- `POST /api/profile/change-password` - 修改密码

## 测试API

使用curl或任何API客户端测试：

```bash
# 登录获取token
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# 获取用户信息（需要token）
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 生产环境部署

### Docker部署

```bash
# 构建镜像
docker build -t enterprise-admin-backend .

# 运行容器
docker run -p 8000:8000 enterprise-admin-backend
```

### 使用Docker Compose

```bash
docker-compose up -d
```

### 环境变量配置

生产环境建议修改以下配置：

```env
SECRET_KEY=your-very-secure-secret-key
DEBUG=false
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

## 故障排除

### 常见问题

1. **模块导入错误**
   - 确保虚拟环境已激活
   - 确保所有依赖包已安装

2. **数据库错误**
   - 确保数据库文件路径正确
   - 重新运行 `python simple_init.py`

3. **权限错误**
   - 检查JWT token是否有效
   - 确认用户角色和权限配置

### 日志查看

```bash
# 查看应用日志
tail -f logs/app.log
```

## 技术支持

如果遇到问题，请检查：
1. Python版本是否符合要求
2. 所有依赖包是否正确安装
3. 数据库是否正确初始化
4. 环境变量配置是否正确
