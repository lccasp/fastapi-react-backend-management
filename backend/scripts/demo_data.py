"""
演示数据创建脚本
================

这个脚本用于创建系统演示所需的各种账号和数据。

🗑️ 如何移除演示功能：
1. 删除这个文件 (demo_data.py)
2. 在 simple_init.py 中移除演示数据创建部分
3. 在前端登录页面移除演示账户提示框
4. 清空数据库重新初始化生产数据

📋 演示账号列表：
- 超级管理员: admin / admin123
- 部门经理: manager / manager123  
- 普通员工: employee / employee123
- HR专员: hr / hr123
"""

import asyncio
import uuid
from datetime import datetime
from sqlalchemy import select
from app.core.database import async_engine, AsyncSessionLocal, Base
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.department import Department
from app.models.position import Position
from app.models.associations import user_role_table, role_permission_table
from app.core.security import get_password_hash


async def create_demo_data():
    """创建演示数据"""
    print("🎭 开始创建演示数据...")
    
    # 创建数据库表
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as db:
        # 检查是否已有数据
        result = await db.execute(select(User).where(User.username == "admin"))
        if result.scalar_one_or_none():
            print("✅ 演示数据已存在，跳过创建")
            return
        
        # 1. 创建演示部门
        print("📁 创建演示部门...")
        departments = [
            Department(
                id=str(uuid.uuid4()),
                name="技术部",
                code="TECH",
                description="负责产品研发和技术创新",
                sort_order=1,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            ),
            Department(
                id=str(uuid.uuid4()),
                name="人事部", 
                code="HR",
                description="负责人力资源管理",
                sort_order=2,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            ),
            Department(
                id=str(uuid.uuid4()),
                name="财务部",
                code="FINANCE", 
                description="负责财务管理和预算控制",
                sort_order=3,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            ),
            Department(
                id=str(uuid.uuid4()),
                name="市场部",
                code="MARKETING",
                description="负责市场推广和销售",
                sort_order=4,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        ]
        
        for dept in departments:
            db.add(dept)
        await db.commit()
        
        # 获取部门ID
        tech_dept = departments[0]
        hr_dept = departments[1]
        finance_dept = departments[2]
        marketing_dept = departments[3]
        
        # 2. 创建演示岗位
        print("💼 创建演示岗位...")
        positions = [
            # 技术部岗位
            Position(
                id=str(uuid.uuid4()),
                name="技术总监",
                code="TECH_DIRECTOR",
                description="技术团队负责人",
                sort_order=1,
                department_id=tech_dept.id,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            ),
            Position(
                id=str(uuid.uuid4()),
                name="高级工程师",
                code="SENIOR_ENG",
                description="资深开发工程师",
                sort_order=2,
                department_id=tech_dept.id,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            ),
            Position(
                id=str(uuid.uuid4()),
                name="初级工程师",
                code="JUNIOR_ENG",
                description="初级开发工程师",
                sort_order=3,
                department_id=tech_dept.id,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            ),
            # 人事部岗位
            Position(
                id=str(uuid.uuid4()),
                name="人事经理",
                code="HR_MANAGER",
                description="人事部门负责人",
                sort_order=1,
                department_id=hr_dept.id,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            ),
            Position(
                id=str(uuid.uuid4()),
                name="招聘专员",
                code="RECRUITER",
                description="负责人才招聘",
                sort_order=2,
                department_id=hr_dept.id,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            ),
            # 财务部岗位
            Position(
                id=str(uuid.uuid4()),
                name="财务经理",
                code="FINANCE_MANAGER",
                description="财务部门负责人",
                sort_order=1,
                department_id=finance_dept.id,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            ),
            # 市场部岗位
            Position(
                id=str(uuid.uuid4()),
                name="市场经理",
                code="MARKETING_MANAGER",
                description="市场部门负责人",
                sort_order=1,
                department_id=marketing_dept.id,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        ]
        
        for pos in positions:
            db.add(pos)
        await db.commit()
        
        # 获取岗位ID
        tech_director_pos = positions[0]
        senior_eng_pos = positions[1]
        junior_eng_pos = positions[2]
        hr_manager_pos = positions[3]
        recruiter_pos = positions[4]
        finance_manager_pos = positions[5]
        marketing_manager_pos = positions[6]
        
        # 3. 创建演示权限（如果不存在）
        print("🔐 检查并创建权限...")
        permissions_data = [
            # 系统管理权限
            ("系统管理", "system", "完整的系统管理权限", "system", "*", 1, "menu"),
            
            # 用户管理权限
            ("用户管理", "user", "用户管理模块权限", "user", "*", 2, "menu"),
            ("查看用户", "user:list", "查看用户列表权限", "user", "list", 3, "action"),
            ("创建用户", "user:create", "创建新用户权限", "user", "create", 4, "action"),
            ("编辑用户", "user:update", "编辑用户信息权限", "user", "update", 5, "action"),
            ("删除用户", "user:delete", "删除用户权限", "user", "delete", 6, "action"),
            
            # 角色管理权限
            ("角色管理", "role", "角色管理模块权限", "role", "*", 7, "menu"),
            ("查看角色", "role:list", "查看角色列表权限", "role", "list", 8, "action"),
            ("创建角色", "role:create", "创建新角色权限", "role", "create", 9, "action"),
            ("编辑角色", "role:update", "编辑角色信息权限", "role", "update", 10, "action"),
            ("删除角色", "role:delete", "删除角色权限", "role", "delete", 11, "action"),
            ("分配角色", "role:assign", "为用户分配角色权限", "role", "assign", 12, "action"),
            
            # 权限管理权限
            ("权限管理", "permission", "权限管理模块权限", "permission", "*", 13, "menu"),
            ("查看权限", "permission:list", "查看权限列表权限", "permission", "list", 14, "action"),
            ("创建权限", "permission:create", "创建新权限权限", "permission", "create", 15, "action"),
            ("编辑权限", "permission:update", "编辑权限信息权限", "permission", "update", 16, "action"),
            ("删除权限", "permission:delete", "删除权限权限", "permission", "delete", 17, "action"),
            
            # 部门管理权限
            ("部门管理", "department", "部门管理模块权限", "department", "*", 18, "menu"),
            ("查看部门", "department:list", "查看部门列表权限", "department", "list", 19, "action"),
            ("创建部门", "department:create", "创建新部门权限", "department", "create", 20, "action"),
            ("编辑部门", "department:update", "编辑部门信息权限", "department", "update", 21, "action"),
            ("删除部门", "department:delete", "删除部门权限", "department", "delete", 22, "action"),
            
            # 岗位管理权限
            ("岗位管理", "position", "岗位管理模块权限", "position", "*", 23, "menu"),
            ("查看岗位", "position:list", "查看岗位列表权限", "position", "list", 24, "action"),
            ("创建岗位", "position:create", "创建新岗位权限", "position", "create", 25, "action"),
            ("编辑岗位", "position:update", "编辑岗位信息权限", "position", "update", 26, "action"),
            ("删除岗位", "position:delete", "删除岗位权限", "position", "delete", 27, "action"),
            
            # 个人中心权限
            ("个人中心", "profile", "个人中心模块权限", "profile", "*", 28, "menu"),
            ("查看个人信息", "profile:view", "查看个人信息权限", "profile", "view", 29, "action"),
            ("编辑个人信息", "profile:update", "编辑个人信息权限", "profile", "update", 30, "action"),
            ("修改密码", "profile:password", "修改个人密码权限", "profile", "password", 31, "action"),
        ]
        
        permission_objects = []
        for name, code, desc, resource, action, sort_order, perm_type in permissions_data:
            # 检查权限是否已存在
            result = await db.execute(select(Permission).where(Permission.code == code))
            existing_permission = result.scalar_one_or_none()
            
            if not existing_permission:
                permission = Permission(
                    id=str(uuid.uuid4()),
                    name=name,
                    code=code,
                    description=desc,
                    resource=resource,
                    action=action,
                    sort_order=sort_order,
                    permission_type=perm_type,
                    is_active=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(permission)
                permission_objects.append(permission)
            else:
                permission_objects.append(existing_permission)
        
        await db.commit()
        
        # 4. 创建演示角色
        print("👥 创建演示角色...")
        roles_data = [
            ("超级管理员", "super_admin", "拥有所有系统权限", [p.code for p in permission_objects]),
            ("部门经理", "dept_manager", "部门管理权限", [
                "user:list", "user:create", "user:update", "department:list", 
                "position:list", "position:create", "position:update", 
                "profile:view", "profile:update", "profile:password"
            ]),
            ("HR专员", "hr_specialist", "人力资源相关权限", [
                "user:list", "user:create", "user:update", "department:list", 
                "position:list", "role:list", "role:assign",
                "profile:view", "profile:update", "profile:password"
            ]),
            ("普通员工", "employee", "基础权限", [
                "profile:view", "profile:update", "profile:password"
            ])
        ]
        
        role_objects = []
        for name, code, desc, perm_codes in roles_data:
            # 检查角色是否已存在
            result = await db.execute(select(Role).where(Role.code == code))
            existing_role = result.scalar_one_or_none()
            
            if not existing_role:
                role = Role(
                    id=str(uuid.uuid4()),
                    name=name,
                    code=code,
                    description=desc,
                    is_active=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(role)
                await db.flush()  # 确保获得ID
                
                # 分配权限给角色
                role_permissions = []
                for perm_code in perm_codes:
                    perm = next((p for p in permission_objects if p.code == perm_code), None)
                    if perm:
                        role_permissions.append({
                            'role_id': role.id,
                            'permission_id': perm.id
                        })
                
                if role_permissions:
                    await db.execute(role_permission_table.insert().values(role_permissions))
                
                role_objects.append(role)
            else:
                role_objects.append(existing_role)
        
        await db.commit()
        
        # 5. 创建演示用户
        print("👤 创建演示用户...")
        users_data = [
            {
                "username": "admin",
                "email": "admin@example.com", 
                "password": "admin123",
                "nickname": "系统管理员",
                "is_superuser": True,
                "department_id": tech_dept.id,
                "position_id": tech_director_pos.id,
                "roles": ["super_admin"]
            },
            {
                "username": "manager",
                "email": "manager@example.com",
                "password": "manager123", 
                "nickname": "张经理",
                "is_superuser": False,
                "department_id": tech_dept.id,
                "position_id": tech_director_pos.id,
                "roles": ["dept_manager"]
            },
            {
                "username": "hr",
                "email": "hr@example.com",
                "password": "hr123",
                "nickname": "李HR",
                "is_superuser": False,
                "department_id": hr_dept.id,
                "position_id": hr_manager_pos.id,
                "roles": ["hr_specialist"]
            },
            {
                "username": "employee",
                "email": "employee@example.com",
                "password": "employee123",
                "nickname": "王员工",
                "is_superuser": False,
                "department_id": tech_dept.id,
                "position_id": junior_eng_pos.id,
                "roles": ["employee"]
            },
            {
                "username": "john_doe",
                "email": "john@example.com",
                "password": "john123",
                "nickname": "John Doe",
                "is_superuser": False,
                "department_id": tech_dept.id,
                "position_id": senior_eng_pos.id,
                "roles": ["employee"]
            },
            {
                "username": "jane_smith",
                "email": "jane@example.com",
                "password": "jane123",
                "nickname": "Jane Smith",
                "is_superuser": False,
                "department_id": hr_dept.id,
                "position_id": recruiter_pos.id,
                "roles": ["hr_specialist"]
            }
        ]
        
        for user_data in users_data:
            # 检查用户是否已存在
            result = await db.execute(select(User).where(User.username == user_data["username"]))
            existing_user = result.scalar_one_or_none()
            
            if not existing_user:
                user = User(
                    id=str(uuid.uuid4()),
                    username=user_data["username"],
                    email=user_data["email"],
                    hashed_password=get_password_hash(user_data["password"]),
                    nickname=user_data["nickname"],
                    is_superuser=user_data["is_superuser"],
                    department_id=user_data["department_id"],
                    position_id=user_data["position_id"],
                    is_active=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(user)
                await db.flush()  # 确保获得ID
                
                # 分配角色给用户
                user_roles = []
                for role_code in user_data["roles"]:
                    role = next((r for r in role_objects if r.code == role_code), None)
                    if role:
                        user_roles.append({
                            'user_id': user.id,
                            'role_id': role.id
                        })
                
                if user_roles:
                    await db.execute(user_role_table.insert().values(user_roles))
        
        await db.commit()
        
        print("✅ 演示数据创建完成！")
        print("\n📋 演示账号列表：")
        print("1. 超级管理员: admin / admin123")
        print("2. 部门经理: manager / manager123")
        print("3. HR专员: hr / hr123")
        print("4. 普通员工: employee / employee123")
        print("5. 技术员工: john_doe / john123")
        print("6. HR招聘: jane_smith / jane123")
        print("\n🌐 前端地址: http://localhost:3000")
        print("📚 API文档: http://localhost:8000/docs")


if __name__ == "__main__":
    asyncio.run(create_demo_data())
