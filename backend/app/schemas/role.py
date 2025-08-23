"""
角色相关响应模式
"""
from typing import Optional, List
from pydantic import BaseModel, Field

from .common import BaseSchema


class RoleBase(BaseModel):
    """角色基础模式"""
    name: str = Field(max_length=50, description="角色名称")
    code: str = Field(max_length=50, description="角色代码")
    description: Optional[str] = Field(default=None, description="角色描述")


class RoleCreate(RoleBase):
    """创建角色请求模式"""
    permission_ids: List[str] = Field(default=[], description="权限ID列表")


class RoleUpdate(BaseModel):
    """更新角色请求模式"""
    name: Optional[str] = Field(default=None, max_length=50, description="角色名称")
    code: Optional[str] = Field(default=None, max_length=50, description="角色代码")
    description: Optional[str] = Field(default=None, description="角色描述")
    is_active: Optional[bool] = Field(default=None, description="是否激活")
    permission_ids: Optional[List[str]] = Field(default=None, description="权限ID列表")


class RoleResponse(RoleBase, BaseSchema):
    """角色响应模式"""
    pass


class RoleWithPermissions(RoleResponse):
    """包含权限信息的角色响应模式"""
    permissions: List["PermissionResponse"] = Field(default=[], description="角色权限列表")


# 避免循环导入
from .permission import PermissionResponse
RoleWithPermissions.model_rebuild()
