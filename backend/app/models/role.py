"""
角色模型
"""
from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel
from .associations import user_role_table, role_permission_table


class Role(BaseModel):
    """角色模型"""
    __tablename__ = "roles"
    
    name = Column(String(50), nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # 关系
    users = relationship(
        "User", 
        secondary=user_role_table, 
        back_populates="roles"
    )
    permissions = relationship(
        "Permission", 
        secondary=role_permission_table, 
        back_populates="roles",
        lazy="selectin"
    )
    
    def __repr__(self):
        return f"<Role(id={self.id}, name={self.name}, code={self.code})>"
