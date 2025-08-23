"""
权限相关响应模式
"""
from typing import Optional, List
from pydantic import BaseModel, Field

from .common import BaseSchema


class PermissionBase(BaseModel):
    """权限基础模式"""
    name: str = Field(max_length=100, description="权限名称")
    code: str = Field(max_length=100, description="权限代码")
    description: Optional[str] = Field(default=None, description="权限描述")
    resource: str = Field(max_length=50, description="资源名称")
    action: str = Field(max_length=50, description="操作名称")
    sort_order: int = Field(default=0, description="排序")
    permission_type: str = Field(default="menu", description="权限类型")
    parent_id: Optional[str] = Field(default=None, description="父权限ID")


class PermissionCreate(PermissionBase):
    """创建权限请求模式"""
    pass


class PermissionUpdate(BaseModel):
    """更新权限请求模式"""
    name: Optional[str] = Field(default=None, max_length=100, description="权限名称")
    code: Optional[str] = Field(default=None, max_length=100, description="权限代码")
    description: Optional[str] = Field(default=None, description="权限描述")
    resource: Optional[str] = Field(default=None, max_length=50, description="资源名称")
    action: Optional[str] = Field(default=None, max_length=50, description="操作名称")
    sort_order: Optional[int] = Field(default=None, description="排序")
    permission_type: Optional[str] = Field(default=None, description="权限类型")
    parent_id: Optional[str] = Field(default=None, description="父权限ID")
    is_active: Optional[bool] = Field(default=None, description="是否激活")


class PermissionResponse(PermissionBase, BaseSchema):
    """权限响应模式"""
    pass


class PermissionTree(PermissionResponse):
    """权限树形结构响应模式"""
    children: List["PermissionTree"] = Field(default=[], description="子权限列表")


# 解决前向引用
PermissionTree.model_rebuild()
