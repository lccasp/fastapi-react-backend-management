"""
关联表模型
定义多对多关系的关联表
"""
from sqlalchemy import Table, Column, ForeignKey, DateTime, String
from sqlalchemy.sql import func

from app.core.database import Base


# 用户角色关联表
user_role_table = Table(
    'user_role',
    Base.metadata,
    Column('user_id', String(36), ForeignKey('users.id'), primary_key=True),
    Column('role_id', String(36), ForeignKey('roles.id'), primary_key=True),
    Column('created_at', DateTime(timezone=True), server_default=func.now()),
)

# 角色权限关联表
role_permission_table = Table(
    'role_permission',
    Base.metadata,
    Column('role_id', String(36), ForeignKey('roles.id'), primary_key=True),
    Column('permission_id', String(36), ForeignKey('permissions.id'), primary_key=True),
    Column('created_at', DateTime(timezone=True), server_default=func.now()),
)
