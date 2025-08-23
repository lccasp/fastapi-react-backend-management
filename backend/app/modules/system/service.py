"""
系统管理服务模块
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, delete
from sqlalchemy.orm import selectinload, joinedload

from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.department import Department
from app.models.position import Position
from app.models.associations import user_role_table, role_permission_table
from app.schemas.user import UserCreate, UserUpdate
from app.schemas.role import RoleCreate, RoleUpdate
from app.schemas.permission import PermissionCreate, PermissionUpdate
from app.schemas.common import PaginationParams
from app.core.security import get_password_hash
from .schemas import (
    DepartmentCreate, DepartmentUpdate, DepartmentTree,
    PositionCreate, PositionUpdate
)


class UserService:
    """用户服务类"""
    
    @staticmethod
    async def get_users(
        db: AsyncSession,
        pagination: PaginationParams,
        search: Optional[str] = None,
        department_id: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> tuple[List[User], int]:
        """
        获取用户列表
        
        Args:
            db: 数据库会话
            pagination: 分页参数
            search: 搜索关键词
            department_id: 部门ID过滤
            is_active: 激活状态过滤
            
        Returns:
            用户列表和总数
        """
        # 构建查询条件
        conditions = []
        if search:
            conditions.append(
                or_(
                    User.username.contains(search),
                    User.email.contains(search),
                    User.nickname.contains(search)
                )
            )
        if department_id:
            conditions.append(User.department_id == department_id)
        if is_active is not None:
            conditions.append(User.is_active == is_active)
        
        # 查询用户
        query = select(User).options(
            selectinload(User.roles),
            selectinload(User.department),
            selectinload(User.position)
        )
        if conditions:
            query = query.where(and_(*conditions))
        
        # 获取总数
        count_result = await db.execute(
            select(func.count(User.id)).where(and_(*conditions)) if conditions 
            else select(func.count(User.id))
        )
        total = count_result.scalar()
        
        # 分页查询
        result = await db.execute(
            query.offset(pagination.offset)
                 .limit(pagination.page_size)
                 .order_by(User.created_at.desc())
        )
        users = result.scalars().all()
        
        return users, total
    
    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
        """根据ID获取用户"""
        result = await db.execute(
            select(User)
            .options(
                selectinload(User.roles),
                selectinload(User.department),
                selectinload(User.position)
            )
            .where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
        """创建用户"""
        user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=get_password_hash(user_data.password),
            nickname=user_data.nickname,
            avatar_url=user_data.avatar_url,
            is_superuser=user_data.is_superuser,
            department_id=user_data.department_id,
            position_id=user_data.position_id
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        return user
    
    @staticmethod
    async def update_user(
        db: AsyncSession, 
        user_id: str, 
        user_data: UserUpdate
    ) -> Optional[User]:
        """更新用户"""
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            return None
        
        # 更新字段
        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(user, field):
                setattr(user, field, value)
        
        await db.commit()
        await db.refresh(user)
        
        return user
    
    @staticmethod
    async def delete_user(db: AsyncSession, user_id: str) -> bool:
        """删除用户"""
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            return False
        
        await db.delete(user)
        await db.commit()
        
        return True
    
    @staticmethod
    async def assign_roles(
        db: AsyncSession, 
        user_id: str, 
        role_ids: List[str]
    ) -> bool:
        """为用户分配角色"""
        # 获取用户
        result = await db.execute(
            select(User).options(selectinload(User.roles)).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return False
        
        # 获取新角色
        result = await db.execute(
            select(Role).where(Role.id.in_(role_ids), Role.is_active == True)
        )
        new_roles = result.scalars().all()
        
        # 更新用户角色
        user.roles.clear()
        user.roles.extend(new_roles)
        
        await db.commit()
        return True


class RoleService:
    """角色服务类"""
    
    @staticmethod
    async def get_roles(
        db: AsyncSession,
        pagination: PaginationParams,
        search: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> tuple[List[Role], int]:
        """获取角色列表"""
        conditions = []
        if search:
            conditions.append(
                or_(Role.name.contains(search), Role.code.contains(search))
            )
        if is_active is not None:
            conditions.append(Role.is_active == is_active)
        
        query = select(Role).options(selectinload(Role.permissions))
        if conditions:
            query = query.where(and_(*conditions))
        
        # 获取总数
        count_result = await db.execute(
            select(func.count(Role.id)).where(and_(*conditions)) if conditions 
            else select(func.count(Role.id))
        )
        total = count_result.scalar()
        
        # 分页查询
        result = await db.execute(
            query.offset(pagination.offset)
                 .limit(pagination.page_size)
                 .order_by(Role.created_at.desc())
        )
        roles = result.scalars().all()
        
        return roles, total
    
    @staticmethod
    async def get_role_by_id(db: AsyncSession, role_id: str) -> Optional[Role]:
        """根据ID获取角色"""
        result = await db.execute(
            select(Role)
            .options(selectinload(Role.permissions))
            .where(Role.id == role_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_role(db: AsyncSession, role_data: RoleCreate) -> Role:
        """创建角色"""
        role = Role(
            name=role_data.name,
            code=role_data.code,
            description=role_data.description
        )
        
        db.add(role)
        await db.flush()
        
        # 分配权限
        if role_data.permission_ids:
            result = await db.execute(
                select(Permission).where(
                    Permission.id.in_(role_data.permission_ids),
                    Permission.is_active == True
                )
            )
            permissions = result.scalars().all()
            role.permissions.extend(permissions)
        
        await db.commit()
        await db.refresh(role)
        
        return role
    
    @staticmethod
    async def update_role(
        db: AsyncSession, 
        role_id: str, 
        role_data: RoleUpdate
    ) -> Optional[Role]:
        """更新角色"""
        result = await db.execute(
            select(Role).options(selectinload(Role.permissions)).where(Role.id == role_id)
        )
        role = result.scalar_one_or_none()
        
        if not role:
            return None
        
        # 更新基本字段
        update_data = role_data.dict(exclude_unset=True, exclude={'permission_ids'})
        for field, value in update_data.items():
            if hasattr(role, field):
                setattr(role, field, value)
        
        # 更新权限
        if role_data.permission_ids is not None:
            result = await db.execute(
                select(Permission).where(
                    Permission.id.in_(role_data.permission_ids),
                    Permission.is_active == True
                )
            )
            permissions = result.scalars().all()
            role.permissions.clear()
            role.permissions.extend(permissions)
        
        await db.commit()
        await db.refresh(role)
        
        return role
    
    @staticmethod
    async def delete_role(db: AsyncSession, role_id: str) -> bool:
        """删除角色"""
        result = await db.execute(select(Role).where(Role.id == role_id))
        role = result.scalar_one_or_none()
        
        if not role:
            return False
        
        await db.delete(role)
        await db.commit()
        
        return True


class PermissionService:
    """权限服务类"""
    
    @staticmethod
    async def get_permissions(db: AsyncSession) -> List[Permission]:
        """获取所有权限"""
        result = await db.execute(
            select(Permission).order_by(Permission.sort_order, Permission.created_at)
        )
        return result.scalars().all()
    
    @staticmethod
    async def get_permission_tree(db: AsyncSession) -> List[Dict[str, Any]]:
        """获取权限树形结构"""
        permissions = await PermissionService.get_permissions(db)
        
        # 构建权限映射
        perm_map = {str(perm.id): perm for perm in permissions}
        
        # 构建树形结构
        tree = []
        for perm in permissions:
            if perm.parent_id is None:
                tree.append(PermissionService._build_permission_tree(perm, perm_map))
        
        return tree
    
    @staticmethod
    def _build_permission_tree(
        permission: Permission, 
        perm_map: Dict[str, Permission]
    ) -> Dict[str, Any]:
        """构建权限树节点"""
        children = []
        for perm in perm_map.values():
            if perm.parent_id == permission.id:
                children.append(PermissionService._build_permission_tree(perm, perm_map))
        
        return {
            "id": str(permission.id),
            "name": permission.name,
            "code": permission.code,
            "resource": permission.resource,
            "action": permission.action,
            "permission_type": permission.permission_type,
            "sort_order": permission.sort_order,
            "is_active": permission.is_active,
            "children": children
        }


class DepartmentService:
    """部门服务类"""
    
    @staticmethod
    async def get_departments(db: AsyncSession) -> List[Department]:
        """获取所有部门"""
        result = await db.execute(
            select(Department)
            .options(selectinload(Department.leader))
            .order_by(Department.sort_order, Department.created_at)
        )
        return result.scalars().all()
    
    @staticmethod
    async def get_department_tree(db: AsyncSession) -> List[DepartmentTree]:
        """获取部门树形结构"""
        departments = await DepartmentService.get_departments(db)
        
        # 获取每个部门的人数统计
        user_counts = await DepartmentService._get_department_user_counts(db)
        
        # 构建部门映射
        dept_map = {str(dept.id): dept for dept in departments}
        
        # 构建树形结构
        tree = []
        for dept in departments:
            if dept.parent_id is None:
                tree.append(
                    DepartmentService._build_department_tree(dept, dept_map, user_counts)
                )
        
        return tree
    
    @staticmethod
    async def _get_department_user_counts(db: AsyncSession) -> Dict[str, int]:
        """获取各部门用户数量统计"""
        result = await db.execute(
            select(User.department_id, func.count(User.id))
            .where(User.is_active == True)
            .group_by(User.department_id)
        )
        
        return {str(dept_id): count for dept_id, count in result.all() if dept_id}
    
    @staticmethod
    def _build_department_tree(
        department: Department,
        dept_map: Dict[str, Department],
        user_counts: Dict[str, int]
    ) -> DepartmentTree:
        """构建部门树节点"""
        children = []
        for dept in dept_map.values():
            if dept.parent_id == department.id:
                children.append(
                    DepartmentService._build_department_tree(dept, dept_map, user_counts)
                )
        
        return DepartmentTree(
            id=str(department.id),
            name=department.name,
            code=department.code,
            description=department.description,
            sort_order=department.sort_order,
            parent_id=str(department.parent_id) if department.parent_id else None,
            leader_id=str(department.leader_id) if department.leader_id else None,
            is_active=department.is_active,
            children=children,
            leader_name=department.leader.nickname if department.leader else None,
            user_count=user_counts.get(str(department.id), 0)
        )
    
    @staticmethod
    async def create_department(
        db: AsyncSession, 
        dept_data: DepartmentCreate
    ) -> Department:
        """创建部门"""
        department = Department(
            name=dept_data.name,
            code=dept_data.code,
            description=dept_data.description,
            sort_order=dept_data.sort_order,
            parent_id=dept_data.parent_id,
            leader_id=dept_data.leader_id
        )
        
        db.add(department)
        await db.commit()
        await db.refresh(department)
        
        return department


class PositionService:
    """岗位服务类"""
    
    @staticmethod
    async def get_positions(
        db: AsyncSession,
        pagination: PaginationParams,
        department_id: Optional[str] = None,
        search: Optional[str] = None
    ) -> tuple[List[Position], int]:
        """获取岗位列表"""
        conditions = []
        if department_id:
            conditions.append(Position.department_id == department_id)
        if search:
            conditions.append(
                or_(Position.name.contains(search), Position.code.contains(search))
            )
        
        query = select(Position).options(selectinload(Position.department))
        if conditions:
            query = query.where(and_(*conditions))
        
        # 获取总数
        count_result = await db.execute(
            select(func.count(Position.id)).where(and_(*conditions)) if conditions 
            else select(func.count(Position.id))
        )
        total = count_result.scalar()
        
        # 分页查询
        result = await db.execute(
            query.offset(pagination.offset)
                 .limit(pagination.page_size)
                 .order_by(Position.sort_order, Position.created_at)
        )
        positions = result.scalars().all()
        
        return positions, total
