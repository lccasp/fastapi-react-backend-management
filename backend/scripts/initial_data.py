"""
初始化数据脚本
创建基础权限、角色和超级管理员用户
"""
import asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.department import Department
from app.models.position import Position


# 基础权限数据
INITIAL_PERMISSIONS = [
    # 系统管理
    {"name": "系统管理", "code": "system", "resource": "system", "action": "manage", "permission_type": "menu", "parent_id": None},
    
    # 用户管理
    {"name": "用户管理", "code": "user", "resource": "user", "action": "manage", "permission_type": "menu", "parent_id": None},
    {"name": "查看用户", "code": "user:list", "resource": "user", "action": "list", "permission_type": "api", "parent_code": "user"},
    {"name": "创建用户", "code": "user:create", "resource": "user", "action": "create", "permission_type": "api", "parent_code": "user"},
    {"name": "更新用户", "code": "user:update", "resource": "user", "action": "update", "permission_type": "api", "parent_code": "user"},
    {"name": "删除用户", "code": "user:delete", "resource": "user", "action": "delete", "permission_type": "api", "parent_code": "user"},
    
    # 角色管理
    {"name": "角色管理", "code": "role", "resource": "role", "action": "manage", "permission_type": "menu", "parent_id": None},
    {"name": "查看角色", "code": "role:list", "resource": "role", "action": "list", "permission_type": "api", "parent_code": "role"},
    {"name": "创建角色", "code": "role:create", "resource": "role", "action": "create", "permission_type": "api", "parent_code": "role"},
    {"name": "更新角色", "code": "role:update", "resource": "role", "action": "update", "permission_type": "api", "parent_code": "role"},
    {"name": "删除角色", "code": "role:delete", "resource": "role", "action": "delete", "permission_type": "api", "parent_code": "role"},
    {"name": "分配权限", "code": "role:assign", "resource": "role", "action": "assign", "permission_type": "api", "parent_code": "role"},
    
    # 权限管理
    {"name": "权限管理", "code": "permission", "resource": "permission", "action": "manage", "permission_type": "menu", "parent_id": None},
    {"name": "查看权限", "code": "permission:list", "resource": "permission", "action": "list", "permission_type": "api", "parent_code": "permission"},
    {"name": "创建权限", "code": "permission:create", "resource": "permission", "action": "create", "permission_type": "api", "parent_code": "permission"},
    {"name": "更新权限", "code": "permission:update", "resource": "permission", "action": "update", "permission_type": "api", "parent_code": "permission"},
    {"name": "删除权限", "code": "permission:delete", "resource": "permission", "action": "delete", "permission_type": "api", "parent_code": "permission"},
    
    # 部门管理
    {"name": "部门管理", "code": "department", "resource": "department", "action": "manage", "permission_type": "menu", "parent_id": None},
    {"name": "查看部门", "code": "department:list", "resource": "department", "action": "list", "permission_type": "api", "parent_code": "department"},
    {"name": "创建部门", "code": "department:create", "resource": "department", "action": "create", "permission_type": "api", "parent_code": "department"},
    {"name": "更新部门", "code": "department:update", "resource": "department", "action": "update", "permission_type": "api", "parent_code": "department"},
    {"name": "删除部门", "code": "department:delete", "resource": "department", "action": "delete", "permission_type": "api", "parent_code": "department"},
    
    # 岗位管理
    {"name": "岗位管理", "code": "position", "resource": "position", "action": "manage", "permission_type": "menu", "parent_id": None},
    {"name": "查看岗位", "code": "position:list", "resource": "position", "action": "list", "permission_type": "api", "parent_code": "position"},
    {"name": "创建岗位", "code": "position:create", "resource": "position", "action": "create", "permission_type": "api", "parent_code": "position"},
    {"name": "更新岗位", "code": "position:update", "resource": "position", "action": "update", "permission_type": "api", "parent_code": "position"},
    {"name": "删除岗位", "code": "position:delete", "resource": "position", "action": "delete", "permission_type": "api", "parent_code": "position"},
    
    # 个人中心
    {"name": "个人中心", "code": "profile", "resource": "profile", "action": "manage", "permission_type": "menu", "parent_id": None},
    {"name": "查看个人信息", "code": "profile:view", "resource": "profile", "action": "view", "permission_type": "api", "parent_code": "profile"},
    {"name": "更新个人信息", "code": "profile:update", "resource": "profile", "action": "update", "permission_type": "api", "parent_code": "profile"},
    {"name": "修改密码", "code": "profile:password", "resource": "profile", "action": "password", "permission_type": "api", "parent_code": "profile"},
]

# 基础角色数据
INITIAL_ROLES = [
    {
        "name": "超级管理员",
        "code": "super_admin",
        "description": "系统超级管理员，拥有所有权限",
        "permissions": ["system", "user", "role", "permission", "department", "position", "profile"]
    },
    {
        "name": "系统管理员",
        "code": "admin",
        "description": "系统管理员，负责用户和角色管理",
        "permissions": ["user", "role", "department", "position", "profile"]
    },
    {
        "name": "普通用户",
        "code": "user",
        "description": "普通用户，只能访问个人中心",
        "permissions": ["profile"]
    }
]

# 基础部门数据
INITIAL_DEPARTMENTS = [
    {
        "name": "总公司",
        "code": "company",
        "description": "总公司",
        "parent_code": None
    },
    {
        "name": "技术部",
        "code": "tech",
        "description": "技术研发部门",
        "parent_code": "company"
    },
    {
        "name": "市场部",
        "code": "market",
        "description": "市场营销部门",
        "parent_code": "company"
    },
    {
        "name": "行政部",
        "code": "admin_dept",
        "description": "行政管理部门",
        "parent_code": "company"
    }
]

# 基础岗位数据
INITIAL_POSITIONS = [
    {
        "name": "CEO",
        "code": "ceo",
        "description": "首席执行官",
        "department_code": "company"
    },
    {
        "name": "技术总监",
        "code": "cto",
        "description": "首席技术官",
        "department_code": "tech"
    },
    {
        "name": "高级开发工程师",
        "code": "senior_dev",
        "description": "高级开发工程师",
        "department_code": "tech"
    },
    {
        "name": "市场总监",
        "code": "marketing_director",
        "description": "市场总监",
        "department_code": "market"
    },
    {
        "name": "行政专员",
        "code": "admin_specialist",
        "description": "行政专员",
        "department_code": "admin_dept"
    }
]


async def create_permissions(db: AsyncSession) -> dict:
    """创建权限数据"""
    permission_map = {}
    
    # 先创建父权限
    for perm_data in INITIAL_PERMISSIONS:
        if perm_data.get("parent_id") is None and "parent_code" not in perm_data:
            # 检查权限是否已存在
            result = await db.execute(
                select(Permission).where(Permission.code == perm_data["code"])
            )
            existing_perm = result.scalar_one_or_none()
            
            if not existing_perm:
                permission = Permission(
                    name=perm_data["name"],
                    code=perm_data["code"],
                    resource=perm_data["resource"],
                    action=perm_data["action"],
                    permission_type=perm_data["permission_type"],
                    description=perm_data.get("description"),
                    sort_order=len(permission_map)
                )
                db.add(permission)
                await db.flush()
                permission_map[perm_data["code"]] = permission.id
                print(f"创建权限: {perm_data['name']}")
    
    # 再创建子权限
    for perm_data in INITIAL_PERMISSIONS:
        if "parent_code" in perm_data:
            result = await db.execute(
                select(Permission).where(Permission.code == perm_data["code"])
            )
            existing_perm = result.scalar_one_or_none()
            
            if not existing_perm:
                parent_id = permission_map.get(perm_data["parent_code"])
                permission = Permission(
                    name=perm_data["name"],
                    code=perm_data["code"],
                    resource=perm_data["resource"],
                    action=perm_data["action"],
                    permission_type=perm_data["permission_type"],
                    description=perm_data.get("description"),
                    parent_id=parent_id,
                    sort_order=len(permission_map)
                )
                db.add(permission)
                await db.flush()
                permission_map[perm_data["code"]] = permission.id
                print(f"创建子权限: {perm_data['name']}")
    
    await db.commit()
    return permission_map


async def create_departments(db: AsyncSession) -> dict:
    """创建部门数据"""
    department_map = {}
    
    # 先创建父部门
    for dept_data in INITIAL_DEPARTMENTS:
        if dept_data.get("parent_code") is None:
            result = await db.execute(
                select(Department).where(Department.code == dept_data["code"])
            )
            existing_dept = result.scalar_one_or_none()
            
            if not existing_dept:
                department = Department(
                    name=dept_data["name"],
                    code=dept_data["code"],
                    description=dept_data["description"],
                    sort_order=len(department_map)
                )
                db.add(department)
                await db.flush()
                department_map[dept_data["code"]] = department.id
                print(f"创建部门: {dept_data['name']}")
    
    # 再创建子部门
    for dept_data in INITIAL_DEPARTMENTS:
        if dept_data.get("parent_code") is not None:
            result = await db.execute(
                select(Department).where(Department.code == dept_data["code"])
            )
            existing_dept = result.scalar_one_or_none()
            
            if not existing_dept:
                parent_id = department_map.get(dept_data["parent_code"])
                department = Department(
                    name=dept_data["name"],
                    code=dept_data["code"],
                    description=dept_data["description"],
                    parent_id=parent_id,
                    sort_order=len(department_map)
                )
                db.add(department)
                await db.flush()
                department_map[dept_data["code"]] = department.id
                print(f"创建子部门: {dept_data['name']}")
    
    await db.commit()
    return department_map


async def create_positions(db: AsyncSession, department_map: dict) -> dict:
    """创建岗位数据"""
    position_map = {}
    
    for pos_data in INITIAL_POSITIONS:
        result = await db.execute(
            select(Position).where(Position.code == pos_data["code"])
        )
        existing_pos = result.scalar_one_or_none()
        
        if not existing_pos:
            department_id = department_map.get(pos_data["department_code"])
            position = Position(
                name=pos_data["name"],
                code=pos_data["code"],
                description=pos_data["description"],
                department_id=department_id,
                sort_order=len(position_map)
            )
            db.add(position)
            await db.flush()
            position_map[pos_data["code"]] = position.id
            print(f"创建岗位: {pos_data['name']}")
    
    await db.commit()
    return position_map


async def create_roles(db: AsyncSession, permission_map: dict) -> dict:
    """创建角色数据"""
    role_map = {}
    
    for role_data in INITIAL_ROLES:
        # 检查角色是否已存在
        result = await db.execute(
            select(Role).where(Role.code == role_data["code"])
        )
        existing_role = result.scalar_one_or_none()
        
        if not existing_role:
            role = Role(
                name=role_data["name"],
                code=role_data["code"],
                description=role_data["description"]
            )
            db.add(role)
            await db.flush()
            
            # 分配权限
            permission_ids = []
            for perm_code in role_data["permissions"]:
                perm_id = permission_map.get(perm_code)
                if perm_id:
                    permission_ids.append(perm_id)
            
            # 查询权限对象并关联
            if permission_ids:
                result = await db.execute(
                    select(Permission).where(Permission.id.in_(permission_ids))
                )
                permissions = result.scalars().all()
                role.permissions.extend(permissions)
            
            role_map[role_data["code"]] = role.id
            print(f"创建角色: {role_data['name']}")
    
    await db.commit()
    return role_map


async def create_super_user(db: AsyncSession, role_map: dict, department_map: dict, position_map: dict):
    """创建超级管理员用户"""
    # 检查是否已存在超级管理员
    result = await db.execute(
        select(User).where(User.username == "admin")
    )
    existing_user = result.scalar_one_or_none()
    
    if not existing_user:
        # 创建超级管理员
        admin_user = User(
            email="admin@example.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            nickname="超级管理员",
            is_superuser=True,
            department_id=department_map.get("company"),
            position_id=position_map.get("ceo")
        )
        db.add(admin_user)
        await db.flush()
        
        # 分配超级管理员角色
        result = await db.execute(
            select(Role).where(Role.code == "super_admin")
        )
        super_admin_role = result.scalar_one()
        admin_user.roles.append(super_admin_role)
        
        await db.commit()
        print("创建超级管理员用户: admin/admin123")
    else:
        print("超级管理员用户已存在")


async def init_data():
    """初始化所有基础数据"""
    async with AsyncSessionLocal() as db:
        try:
            print("开始初始化基础数据...")
            
            # 创建权限
            permission_map = await create_permissions(db)
            
            # 创建部门
            department_map = await create_departments(db)
            
            # 创建岗位
            position_map = await create_positions(db, department_map)
            
            # 创建角色
            role_map = await create_roles(db, permission_map)
            
            # 创建超级管理员
            await create_super_user(db, role_map, department_map, position_map)
            
            print("基础数据初始化完成！")
            
        except Exception as e:
            print(f"初始化数据失败: {str(e)}")
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(init_data())
