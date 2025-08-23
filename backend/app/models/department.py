"""
部门模型
"""
from sqlalchemy import Column, String, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship

from .base import BaseModel


class Department(BaseModel):
    """部门模型"""
    __tablename__ = "departments"
    
    name = Column(String(100), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0)
    
    # 自引用外键，支持部门层级结构
    parent_id = Column(String(36), ForeignKey("departments.id"), nullable=True)
    
    # 部门负责人
    leader_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    
    # 关系
    parent = relationship("Department", remote_side="Department.id", backref="children")
    leader = relationship("User", foreign_keys=[leader_id], post_update=True)
    users = relationship("User", foreign_keys="User.department_id", back_populates="department")
    positions = relationship("Position", back_populates="department")
    
    def __repr__(self):
        return f"<Department(id={self.id}, name={self.name}, code={self.code})>"
