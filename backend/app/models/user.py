"""
用户模型
"""
from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from .base import BaseModel
from .associations import user_role_table


class User(BaseModel):
    """用户模型"""
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    nickname = Column(String(50), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_superuser = Column(Boolean, default=False, nullable=False)
    
    # 外键关系
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=True)
    position_id = Column(String(36), ForeignKey("positions.id"), nullable=True)
    
    # 关系
    department = relationship("Department", foreign_keys=[department_id], back_populates="users")
    position = relationship("Position", back_populates="users")
    roles = relationship(
        "Role", 
        secondary=user_role_table, 
        back_populates="users",
        lazy="selectin"
    )
    
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"
