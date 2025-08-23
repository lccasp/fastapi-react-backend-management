#!/usr/bin/env python3
"""
基础功能测试脚本
验证后端主要组件是否正常工作
"""
import asyncio
import sys
import os
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))


async def test_imports():
    """测试模块导入"""
    print("🔍 测试模块导入...")
    
    try:
        # 测试核心模块
        from app.core.config import settings
        print("✅ 配置模块导入成功")
        
        from app.core.database import Base, engine
        print("✅ 数据库模块导入成功")
        
        from app.core.security import create_access_token, verify_password
        print("✅ 安全模块导入成功")
        
        # 测试模型
        from app.models.user import User
        from app.models.role import Role
        from app.models.permission import Permission
        print("✅ 数据模型导入成功")
        
        # 测试路由
        from app.modules.auth.router import router as auth_router
        from app.modules.system.router import router as system_router
        from app.modules.profile.router import router as profile_router
        print("✅ 路由模块导入成功")
        
        # 测试主应用
        from main import app
        print("✅ 主应用导入成功")
        
        return True
        
    except Exception as e:
        print(f"❌ 模块导入失败: {str(e)}")
        return False


def test_config():
    """测试配置"""
    print("\n🔧 测试配置...")
    
    try:
        from app.core.config import settings
        
        print(f"📋 项目名称: {settings.PROJECT_NAME}")
        print(f"📋 项目版本: {settings.PROJECT_VERSION}")
        print(f"📋 调试模式: {settings.DEBUG}")
        print(f"📋 数据库URL: {settings.DATABASE_URL}")
        print("✅ 配置测试通过")
        
        return True
        
    except Exception as e:
        print(f"❌ 配置测试失败: {str(e)}")
        return False


def test_database():
    """测试数据库连接"""
    print("\n💾 测试数据库...")
    
    try:
        from app.core.database import Base, engine
        
        # 创建表
        Base.metadata.create_all(bind=engine)
        print("✅ 数据库表创建成功")
        
        return True
        
    except Exception as e:
        print(f"❌ 数据库测试失败: {str(e)}")
        return False


def test_security():
    """测试安全功能"""
    print("\n🔐 测试安全功能...")
    
    try:
        from app.core.security import create_access_token, verify_password, get_password_hash
        
        # 测试密码哈希
        password = "test123"
        hashed = get_password_hash(password)
        
        if verify_password(password, hashed):
            print("✅ 密码哈希验证成功")
        else:
            print("❌ 密码哈希验证失败")
            return False
        
        # 测试JWT令牌
        token = create_access_token(subject="test-user-id")
        if token:
            print("✅ JWT令牌创建成功")
        else:
            print("❌ JWT令牌创建失败")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ 安全功能测试失败: {str(e)}")
        return False


async def test_services():
    """测试服务功能"""
    print("\n🔧 测试服务功能...")
    
    try:
        from app.modules.auth.service import AuthService
        from app.modules.system.service import UserService
        
        print("✅ 服务类导入成功")
        return True
        
    except Exception as e:
        print(f"❌ 服务功能测试失败: {str(e)}")
        return False


async def main():
    """主测试函数"""
    print("🚀 开始后端基础功能测试...\n")
    
    tests = [
        ("模块导入", test_imports()),
        ("配置", test_config()),
        ("数据库", test_database()),
        ("安全功能", test_security()),
        ("服务功能", test_services()),
    ]
    
    passed = 0
    total = len(tests)
    
    for name, test_func in tests:
        if asyncio.iscoroutine(test_func):
            result = await test_func
        else:
            result = test_func
        
        if result:
            passed += 1
    
    print(f"\n📊 测试结果: {passed}/{total} 通过")
    
    if passed == total:
        print("🎉 所有测试通过！后端基础功能正常")
        return True
    else:
        print("⚠️  部分测试失败，请检查错误信息")
        return False


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
