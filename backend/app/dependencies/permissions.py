"""
权限验证依赖注入
"""
from typing import List, Set
from functools import wraps
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.dependencies.auth import get_current_active_user
from app.dependencies.database import get_db


async def get_user_permissions(
    user: User,
    db: AsyncSession
) -> Set[str]:
    """
    获取用户的所有权限
    
    Args:
        user: 用户对象
        db: 数据库会话
        
    Returns:
        用户权限代码集合
    """
    # 如果是超级管理员，拥有所有权限
    if user.is_superuser:
        result = await db.execute(
            select(Permission.code).where(Permission.is_active == True)
        )
        return set(result.scalars().all())
    
    # 查询用户的角色和权限
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.roles).selectinload(Role.permissions)
        )
        .where(User.id == user.id)
    )
    user_with_roles = result.scalar_one()
    
    # 收集所有权限代码
    permissions = set()
    for role in user_with_roles.roles:
        if role.is_active:
            for permission in role.permissions:
                if permission.is_active:
                    permissions.add(permission.code)
    
    return permissions


def require_permissions(*permission_codes: str):
    """
    权限验证装饰器
    
    Args:
        permission_codes: 需要的权限代码列表
        
    Returns:
        装饰器函数
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 从kwargs中获取依赖注入的参数
            user = kwargs.get('current_user')
            db = kwargs.get('db')
            
            if not user or not db:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="权限验证配置错误"
                )
            
            # 获取用户权限
            user_permissions = await get_user_permissions(user, db)
            
            # 检查权限
            required_permissions = set(permission_codes)
            if not required_permissions.issubset(user_permissions):
                missing_permissions = required_permissions - user_permissions
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"权限不足，缺少权限: {', '.join(missing_permissions)}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


class PermissionChecker:
    """权限检查器"""
    
    def __init__(self, permission_codes: List[str]):
        self.permission_codes = set(permission_codes)
    
    async def __call__(
        self,
        user: User = Depends(get_current_active_user),
        db: AsyncSession = Depends(get_db)
    ) -> User:
        """
        检查用户权限
        
        Args:
            user: 当前用户
            db: 数据库会话
            
        Returns:
            验证通过的用户对象
            
        Raises:
            HTTPException: 权限不足时抛出403错误
        """
        # 获取用户权限
        user_permissions = await get_user_permissions(user, db)
        
        # 检查权限
        if not self.permission_codes.issubset(user_permissions):
            missing_permissions = self.permission_codes - user_permissions
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"权限不足，缺少权限: {', '.join(missing_permissions)}"
            )
        
        return user


def has_permission(*permission_codes: str):
    """
    创建权限检查依赖
    
    Args:
        permission_codes: 权限代码列表
        
    Returns:
        权限检查器实例
    """
    return PermissionChecker(list(permission_codes))
