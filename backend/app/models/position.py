"""
岗位模型
"""
from sqlalchemy import Column, String, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship

from .base import BaseModel


class Position(BaseModel):
    """岗位模型"""
    __tablename__ = "positions"
    
    name = Column(String(100), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0)
    
    # 外键关系
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=False)
    
    # 关系
    department = relationship("Department", back_populates="positions")
    users = relationship("User", back_populates="position")
    
    def __repr__(self):
        return f"<Position(id={self.id}, name={self.name}, code={self.code})>"
