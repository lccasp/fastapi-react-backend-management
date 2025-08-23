"""
数据库依赖注入
"""
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_async_session


# 数据库会话依赖
async def get_db() -> AsyncSession:
    """获取数据库会话"""
    async for session in get_async_session():
        yield session
