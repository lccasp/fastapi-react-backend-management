#!/usr/bin/env python3
"""
管理脚本 - 执行常见的开发和部署任务
"""
import asyncio
import sys
import os
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))


async def init_db():
    """初始化数据库和基础数据"""
    print("正在初始化数据库...")
    
    # 创建数据库表（同步引擎）
    from app.core.database import Base, engine
    Base.metadata.create_all(bind=engine)
    print("数据库表已创建")
    
    # 初始化基础数据（异步会话）
    from scripts.initial_data import init_data
    await init_data()
    print("数据库初始化完成！")


def create_migration(message: str):
    """创建数据库迁移"""
    os.system(f'alembic revision --autogenerate -m "{message}"')


def upgrade_db():
    """升级数据库到最新版本"""
    os.system('alembic upgrade head')


def run_server():
    """运行开发服务器"""
    import uvicorn
    from main import app
    from app.core.config import settings
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info"
    )


def show_help():
    """显示帮助信息"""
    print("""
企业级管理系统 - 管理脚本

用法: python manage.py <command>

可用命令:
  init-db        初始化数据库和基础数据
  makemigrations 创建数据库迁移 (需要提供消息)
  migrate        应用数据库迁移
  runserver      运行开发服务器
  help           显示此帮助信息

示例:
  python manage.py init-db
  python manage.py makemigrations "添加用户表"
  python manage.py migrate
  python manage.py runserver
    """)


async def main():
    """主函数"""
    if len(sys.argv) < 2:
        show_help()
        return
    
    command = sys.argv[1]
    
    if command == "init-db":
        await init_db()
    elif command == "makemigrations":
        if len(sys.argv) < 3:
            print("错误: 请提供迁移消息")
            print("用法: python manage.py makemigrations '消息内容'")
            return
        message = sys.argv[2]
        create_migration(message)
    elif command == "migrate":
        upgrade_db()
    elif command == "runserver":
        run_server()
    elif command in ["help", "-h", "--help"]:
        show_help()
    else:
        print(f"未知命令: {command}")
        show_help()


if __name__ == "__main__":
    asyncio.run(main())
