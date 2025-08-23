"""
认证服务模块
"""
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.models.role import Role
from app.core.security import verify_password, get_password_hash, create_access_token
from app.schemas.user import UserCreate, UserRegister
from app.dependencies.permissions import get_user_permissions


class AuthService:
    """认证服务类"""
    
    @staticmethod
    async def authenticate_user(
        db: AsyncSession,
        username: str,
        password: str
    ) -> Optional[User]:
        """
        用户认证
        
        Args:
            db: 数据库会话
            username: 用户名或邮箱
            password: 密码
            
        Returns:
            认证成功的用户对象或None
        """
        # 查询用户（支持用户名或邮箱登录）
        result = await db.execute(
            select(User).where(
                or_(User.username == username, User.email == username),
                User.is_active == True
            )
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return None
        
        # 验证密码
        if not verify_password(password, user.hashed_password):
            return None
        
        return user
    
    @staticmethod
    async def create_user(
        db: AsyncSession,
        user_data: UserCreate
    ) -> User:
        """
        创建用户
        
        Args:
            db: 数据库会话
            user_data: 用户创建数据
            
        Returns:
            创建的用户对象
        """
        # 创建用户对象
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
    async def register_user(
        db: AsyncSession,
        user_data: UserRegister
    ) -> User:
        """
        用户注册
        
        Args:
            db: 数据库会话
            user_data: 用户注册数据
            
        Returns:
            注册的用户对象
        """
        # 创建普通用户
        user_create = UserCreate(
            email=user_data.email,
            username=user_data.username,
            password=user_data.password,
            nickname=user_data.nickname,
            is_superuser=False
        )
        
        return await AuthService.create_user(db, user_create)
    
    @staticmethod
    async def get_user_roles(
        db: AsyncSession,
        user: User
    ) -> List[str]:
        """
        获取用户角色列表
        
        Args:
            db: 数据库会话
            user: 用户对象
            
        Returns:
            角色代码列表
        """
        result = await db.execute(
            select(User)
            .options(selectinload(User.roles))
            .where(User.id == user.id)
        )
        user_with_roles = result.scalar_one()
        
        return [role.code for role in user_with_roles.roles if role.is_active]
    
    @staticmethod
    async def check_username_exists(
        db: AsyncSession,
        username: str,
        exclude_user_id: Optional[str] = None
    ) -> bool:
        """
        检查用户名是否存在
        
        Args:
            db: 数据库会话
            username: 用户名
            exclude_user_id: 排除的用户ID（用于更新时检查）
            
        Returns:
            是否存在
        """
        query = select(User).where(User.username == username)
        if exclude_user_id:
            query = query.where(User.id != exclude_user_id)
        
        result = await db.execute(query)
        return result.scalar_one_or_none() is not None
    
    @staticmethod
    async def check_email_exists(
        db: AsyncSession,
        email: str,
        exclude_user_id: Optional[str] = None
    ) -> bool:
        """
        检查邮箱是否存在
        
        Args:
            db: 数据库会话
            email: 邮箱地址
            exclude_user_id: 排除的用户ID（用于更新时检查）
            
        Returns:
            是否存在
        """
        query = select(User).where(User.email == email)
        if exclude_user_id:
            query = query.where(User.id != exclude_user_id)
        
        result = await db.execute(query)
        return result.scalar_one_or_none() is not None
