# 🗑️ 演示功能移除指南

本指南详细说明如何在生产环境部署前移除所有演示功能和数据。

## 📋 需要移除的演示功能

### 1. 前端演示提示
**文件**: `frontend/src/app/(auth)/login/page.tsx`

**移除内容**: 第 125-164 行的演示账户信息区块
```tsx
{/* 
⚠️ 演示环境提示 - 生产环境请移除这个区块
移除步骤：
1. 删除下面整个演示账户信息区块
2. 删除后端 scripts/demo_data.py 文件
3. 清空数据库并重新初始化生产数据
*/}
<div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
  <!-- 整个演示账户信息区块 -->
</div>
```

### 2. 后端演示数据脚本
**文件**: `backend/scripts/demo_data.py`

**操作**: 完全删除此文件
```bash
rm backend/scripts/demo_data.py
```

### 3. 演示数据库内容
**文件**: `backend/backend.db`

**操作**: 删除现有数据库文件
```bash
rm backend/backend.db
```

## 🔧 生产环境初始化步骤

### 步骤 1: 清理演示内容

```bash
# 1. 删除演示数据脚本
rm backend/scripts/demo_data.py

# 2. 删除演示数据库
rm backend/backend.db

# 3. 编辑登录页面，移除演示账户提示框
# 编辑 frontend/src/app/(auth)/login/page.tsx
# 删除第 125-164 行的演示区块
```

### 步骤 2: 重新初始化数据库

```bash
cd backend

# 方式一：使用 manage.py (推荐)
python manage.py init-db

# 方式二：使用 simple_init.py
python simple_init.py
```

### 步骤 3: 创建生产管理员账户

编辑 `backend/scripts/initial_data.py`，保留基础权限和角色，但修改管理员账户信息：

```python
# 替换演示密码为安全密码
admin_user = User(
    id=str(uuid.uuid4()),
    username="admin",  # 可以修改为您的用户名
    email="your-email@company.com",  # 修改为真实邮箱
    hashed_password=get_password_hash("your-secure-password"),  # 使用安全密码
    nickname="系统管理员",
    is_superuser=True,
    is_active=True,
    created_at=datetime.utcnow(),
    updated_at=datetime.utcnow()
)
```

### 步骤 4: 验证生产环境

1. **启动后端服务**:
   ```bash
   cd backend
   python main.py
   ```

2. **启动前端服务**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **验证功能**:
   - 访问 http://localhost:3000
   - 确认登录页面无演示提示
   - 使用新的管理员账户登录
   - 验证所有功能正常工作

## 🔒 生产环境安全建议

### 1. 环境变量配置

**后端** (`backend/.env`):
```env
# 数据库配置 - 生产环境使用 PostgreSQL
DATABASE_URL=postgresql://user:password@localhost/dbname

# 安全密钥 - 使用强随机密钥
SECRET_KEY=your-256-bit-secret-key-here

# JWT 配置
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# 调试模式 - 生产环境设为 False
DEBUG=false

# CORS 配置 - 限制为生产域名
ALLOWED_ORIGINS=["https://yourdomain.com"]
```

**前端** (`frontend/.env.local`):
```env
# API 地址 - 使用生产后端地址
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# 应用配置
NEXT_PUBLIC_APP_NAME=您的系统名称
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 2. 数据库迁移

如果使用 PostgreSQL：

```bash
# 1. 创建数据库
createdb your_database_name

# 2. 运行迁移
cd backend
alembic upgrade head

# 3. 初始化数据
python manage.py init-db
```

### 3. 权限优化

根据实际业务需求，调整 `backend/scripts/initial_data.py` 中的权限定义：

- 移除不需要的权限
- 添加业务特定权限
- 调整角色权限组合
- 设置合适的权限层级

### 4. 安全检查清单

- [ ] 移除所有演示数据和提示
- [ ] 更改默认管理员密码
- [ ] 配置安全的 JWT 密钥
- [ ] 设置正确的 CORS 域名
- [ ] 配置生产数据库
- [ ] 启用 HTTPS
- [ ] 设置防火墙规则
- [ ] 配置日志记录
- [ ] 备份数据库
- [ ] 测试所有功能

## 📝 快速移除脚本

创建以下脚本文件 `remove_demo.sh` (Linux/Mac) 或 `remove_demo.bat` (Windows)：

**Linux/Mac**:
```bash
#!/bin/bash
echo "🗑️ 正在移除演示功能..."

# 删除演示数据脚本
rm -f backend/scripts/demo_data.py

# 删除演示数据库
rm -f backend/backend.db

# 提示手动编辑登录页面
echo "✅ 演示脚本和数据库已删除"
echo "⚠️ 请手动编辑以下文件移除演示提示:"
echo "   - frontend/src/app/(auth)/login/page.tsx (第 125-164 行)"
echo ""
echo "📋 下一步:"
echo "1. 编辑登录页面移除演示提示框"
echo "2. 运行: cd backend && python manage.py init-db"
echo "3. 配置生产环境变量"
echo "4. 测试系统功能"
```

**Windows**:
```batch
@echo off
echo 🗑️ 正在移除演示功能...

:: 删除演示数据脚本
del backend\scripts\demo_data.py 2>nul

:: 删除演示数据库
del backend\backend.db 2>nul

echo ✅ 演示脚本和数据库已删除
echo ⚠️ 请手动编辑以下文件移除演示提示:
echo    - frontend\src\app\(auth)\login\page.tsx (第 125-164 行)
echo.
echo 📋 下一步:
echo 1. 编辑登录页面移除演示提示框
echo 2. 运行: cd backend ^&^& python manage.py init-db
echo 3. 配置生产环境变量
echo 4. 测试系统功能
pause
```

## 🆘 遇到问题？

如果在移除演示功能过程中遇到问题：

1. **数据库初始化失败**: 检查数据库连接配置和权限
2. **登录失败**: 确认管理员账户已正确创建
3. **前端无法连接后端**: 检查 API 地址配置
4. **权限错误**: 重新运行初始化脚本

**获取帮助**: 检查项目文档或联系开发团队。

---

⚠️ **重要提醒**: 在执行这些操作前，请确保已备份重要数据！
