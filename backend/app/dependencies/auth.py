"""
认证相关依赖注入
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import verify_token
from app.models.user import User
from app.dependencies.database import get_db


# JWT Bearer认证
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    获取当前登录用户
    
    Args:
        credentials: JWT凭证
        db: 数据库会话
        
    Returns:
        当前用户对象
        
    Raises:
        HTTPException: 认证失败时抛出401错误
    """
    # 验证令牌
    user_id = verify_token(credentials.credentials)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭证",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 查询用户
    result = await db.execute(
        select(User).where(User.id == user_id, User.is_active == True)
    )
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在或已被禁用",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    获取当前活跃用户
    
    Args:
        current_user: 当前用户
        
    Returns:
        活跃用户对象
        
    Raises:
        HTTPException: 用户未激活时抛出400错误
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户账户已被禁用"
        )
    return current_user


async def get_superuser(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    获取超级管理员用户
    
    Args:
        current_user: 当前用户
        
    Returns:
        超级管理员用户对象
        
    Raises:
        HTTPException: 非超级管理员时抛出403错误
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足，需要超级管理员权限"
        )
    return current_user


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """
    获取可选用户（用于公开接口）
    
    Args:
        credentials: JWT凭证（可选）
        
    Returns:
        用户ID或None
    """
    if credentials is None:
        return None
    
    user_id = verify_token(credentials.credentials)
    return user_id
