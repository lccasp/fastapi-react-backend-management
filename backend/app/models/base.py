"""
基础模型类
提供通用字段和功能
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.sql import func

from app.core.database import Base


class BaseModel(Base):
    """基础模型类"""
    __abstract__ = True
    
    id = Column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4()), 
        index=True
    )
    created_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    is_active = Column(Boolean, default=True, nullable=False)
    
    def __repr__(self):
        return f"<{self.__class__.__name__}(id={self.id})>"
