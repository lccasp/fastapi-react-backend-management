"""
个人中心服务模块
"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.core.security import verify_password, get_password_hash
from .schemas import ProfileUpdate


class ProfileService:
    """个人中心服务类"""
    
    @staticmethod
    async def get_profile(db: AsyncSession, user_id: str) -> Optional[User]:
        """
        获取用户个人信息
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            
        Returns:
            用户对象
        """
        result = await db.execute(
            select(User)
            .options(
                selectinload(User.department),
                selectinload(User.position),
                selectinload(User.roles)
            )
            .where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_profile(
        db: AsyncSession, 
        user_id: str, 
        profile_data: ProfileUpdate
    ) -> Optional[User]:
        """
        更新个人信息
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            profile_data: 更新数据
            
        Returns:
            更新后的用户对象
        """
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            return None
        
        # 更新字段
        update_data = profile_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(user, field):
                setattr(user, field, value)
        
        await db.commit()
        await db.refresh(user)
        
        return user
    
    @staticmethod
    async def change_password(
        db: AsyncSession,
        user_id: str,
        old_password: str,
        new_password: str
    ) -> tuple[bool, str]:
        """
        修改密码
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            old_password: 原密码
            new_password: 新密码
            
        Returns:
            (是否成功, 错误信息)
        """
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            return False, "用户不存在"
        
        # 验证原密码
        if not verify_password(old_password, user.hashed_password):
            return False, "原密码错误"
        
        # 更新密码
        user.hashed_password = get_password_hash(new_password)
        await db.commit()
        
        return True, ""
    
    @staticmethod
    async def update_avatar(
        db: AsyncSession,
        user_id: str,
        avatar_url: str
    ) -> Optional[User]:
        """
        更新头像
        
        Args:
            db: 数据库会话
            user_id: 用户ID
            avatar_url: 头像URL
            
        Returns:
            更新后的用户对象
        """
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            return None
        
        user.avatar_url = avatar_url
        await db.commit()
        await db.refresh(user)
        
        return user
