"""
通用响应模式
"""
from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

DataT = TypeVar('DataT')


class ApiResponse(BaseModel, Generic[DataT]):
    """通用API响应模式"""
    success: bool = Field(description="请求是否成功")
    data: Optional[DataT] = Field(default=None, description="响应数据")
    error: str = Field(default="", description="错误信息")
    code: Optional[str] = Field(default=None, description="错误代码")
    timestamp: Optional[datetime] = Field(default_factory=datetime.now, description="响应时间")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class PaginationParams(BaseModel):
    """分页参数"""
    page: int = Field(default=1, ge=1, description="页码")
    page_size: int = Field(default=10, ge=1, le=100, description="每页数量")
    
    @property
    def offset(self) -> int:
        """计算偏移量"""
        return (self.page - 1) * self.page_size


class PaginationResponse(BaseModel, Generic[DataT]):
    """分页响应模式"""
    items: list[DataT] = Field(description="数据列表")
    total: int = Field(description="总数量")
    page: int = Field(description="当前页码")
    page_size: int = Field(description="每页数量")
    total_pages: int = Field(description="总页数")
    
    @classmethod
    def create(
        cls, 
        items: list[DataT], 
        total: int, 
        page: int, 
        page_size: int
    ) -> "PaginationResponse[DataT]":
        """创建分页响应"""
        import math
        return cls(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=math.ceil(total / page_size) if page_size > 0 else 0
        )


class BaseSchema(BaseModel):
    """基础响应模式"""
    id: str = Field(description="唯一标识")
    created_at: datetime = Field(description="创建时间")
    updated_at: datetime = Field(description="更新时间")
    is_active: bool = Field(description="是否激活")
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
