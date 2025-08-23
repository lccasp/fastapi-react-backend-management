"""
应用配置模块
管理所有环境变量和应用配置
"""
from typing import List
from functools import lru_cache
try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings


class Settings(BaseSettings):
    """应用配置类"""
    
    # 应用基本信息
    PROJECT_NAME: str = "企业级管理系统"
    PROJECT_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # 数据库配置
    DATABASE_URL: str = "sqlite:///./backend.db"
    
    # Redis配置
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT配置
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    
    # 跨域配置
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """获取配置实例（单例模式）"""
    return Settings()


# 全局配置实例
settings = get_settings()
