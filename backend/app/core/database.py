"""
数据库连接和会话管理
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from .config import settings


# 统一数据库URL处理
def get_sync_db_url():
    url = settings.DATABASE_URL
    if url.startswith("sqlite://"):
        return url.replace("sqlite://", "sqlite:///")
    return url

def get_async_db_url():
    url = settings.DATABASE_URL
    if url.startswith("sqlite://"):
        return url.replace("sqlite://", "sqlite+aiosqlite://")
    elif url.startswith("sqlite:///"):
        return url.replace("sqlite:///", "sqlite+aiosqlite:///")
    return url.replace("postgresql://", "postgresql+asyncpg://")

# 同步数据库引擎（用于Alembic迁移）
engine = create_engine(
    get_sync_db_url(),
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=settings.DEBUG
)

# 异步数据库引擎（用于FastAPI应用）
async_engine = create_async_engine(
    get_async_db_url(),
    echo=settings.DEBUG
)

# 会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False
)

# SQLAlchemy基类
Base = declarative_base()


async def get_async_session() -> AsyncSession:
    """获取异步数据库会话"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def get_db():
    """获取同步数据库会话（用于Alembic等）"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
