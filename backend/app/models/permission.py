"""
权限模型
"""
from sqlalchemy import Column, String, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship

from .base import BaseModel
from .associations import role_permission_table


class Permission(BaseModel):
    """权限模型"""
    __tablename__ = "permissions"
    
    name = Column(String(100), nullable=False)
    code = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    resource = Column(String(50), nullable=False)  # 资源名称，如 'user', 'role'
    action = Column(String(50), nullable=False)    # 操作名称，如 'create', 'read'
    sort_order = Column(Integer, default=0)
    permission_type = Column(String(20), default="menu")  # menu, button, api
    
    # 自引用外键，支持权限层级结构
    parent_id = Column(String(36), ForeignKey("permissions.id"), nullable=True)
    
    # 关系
    parent = relationship("Permission", remote_side="Permission.id", backref="children")
    roles = relationship(
        "Role", 
        secondary=role_permission_table, 
        back_populates="permissions"
    )
    
    def __repr__(self):
        return f"<Permission(id={self.id}, name={self.name}, code={self.code})>"
