#!/usr/bin/env python3
"""
简化的数据库初始化脚本
"""
import asyncio
import sys
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app.core.database import Base, async_engine, AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.department import Department
from app.models.position import Position


async def create_basic_data():
    """创建基础数据"""
    
    # 创建数据库表
    print("创建数据库表...")
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ 数据库表创建成功")
    
    async with AsyncSessionLocal() as db:
        try:
            print("开始创建基础数据...")
            
            # 创建基础权限
            permissions = [
                Permission(name="系统管理", code="system", resource="system", action="manage", permission_type="menu"),
                Permission(name="用户管理", code="user", resource="user", action="manage", permission_type="menu"),
                Permission(name="查看用户", code="user:list", resource="user", action="list", permission_type="api"),
                Permission(name="创建用户", code="user:create", resource="user", action="create", permission_type="api"),
                Permission(name="个人中心", code="profile", resource="profile", action="manage", permission_type="menu"),
                Permission(name="查看个人信息", code="profile:view", resource="profile", action="view", permission_type="api"),
            ]
            
            for perm in permissions:
                db.add(perm)
            
            await db.flush()  # 获取权限ID
            print("✅ 基础权限创建成功")
            
            # 创建角色
            super_admin_role = Role(
                name="超级管理员",
                code="super_admin",
                description="系统超级管理员，拥有所有权限"
            )
            db.add(super_admin_role)
            
            user_role = Role(
                name="普通用户",
                code="user",
                description="普通用户，只能访问个人中心"
            )
            db.add(user_role)
            
            await db.flush()
            print("✅ 角色创建成功")
            
            # 为角色分配权限 - 手动插入关联表
            from app.models.associations import role_permission_table
            
            # 超级管理员拥有所有权限
            for perm in permissions:
                await db.execute(
                    role_permission_table.insert().values(
                        role_id=super_admin_role.id,
                        permission_id=perm.id
                    )
                )
            
            # 普通用户只有个人中心权限
            profile_permissions = [p for p in permissions if p.code.startswith("profile")]
            for perm in profile_permissions:
                await db.execute(
                    role_permission_table.insert().values(
                        role_id=user_role.id,
                        permission_id=perm.id
                    )
                )
            
            # 创建部门
            company_dept = Department(
                name="总公司",
                code="company",
                description="总公司"
            )
            db.add(company_dept)
            
            await db.flush()
            print("✅ 部门创建成功")
            
            # 创建岗位
            ceo_position = Position(
                name="CEO",
                code="ceo",
                description="首席执行官",
                department_id=company_dept.id
            )
            db.add(ceo_position)
            
            await db.flush()
            print("✅ 岗位创建成功")
            
            # 创建超级管理员用户
            admin_user = User(
                email="admin@example.com",
                username="admin",
                hashed_password=get_password_hash("admin123"),
                nickname="超级管理员",
                is_superuser=True,
                department_id=company_dept.id,
                position_id=ceo_position.id
            )
            db.add(admin_user)
            
            await db.flush()
            
            # 为用户分配角色 - 手动插入关联表
            from app.models.associations import user_role_table
            
            await db.execute(
                user_role_table.insert().values(
                    user_id=admin_user.id,
                    role_id=super_admin_role.id
                )
            )
            
            await db.commit()
            print("✅ 超级管理员用户创建成功")
            
            print("\n🎉 数据库初始化完成！")
            print("默认超级管理员账户:")
            print("用户名: admin")
            print("密码: admin123")
            
        except Exception as e:
            print(f"❌ 初始化失败: {str(e)}")
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(create_basic_data())
