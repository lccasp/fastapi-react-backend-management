"""
日志配置模块
"""
import sys
from loguru import logger

from .config import settings


def setup_logging():
    """设置日志配置"""
    
    # 移除默认处理器
    logger.remove()
    
    # 添加控制台处理器
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
               "<level>{level: <8}</level> | "
               "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
               "<level>{message}</level>",
        level="DEBUG" if settings.DEBUG else "INFO",
        colorize=True
    )
    
    # 添加文件处理器
    logger.add(
        "logs/app.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} | {message}",
        level="INFO",
        rotation="10 MB",
        retention="30 days",
        compression="zip"
    )
    
    return logger
