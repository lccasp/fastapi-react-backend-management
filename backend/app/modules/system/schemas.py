"""
系统管理模块专用响应模式
"""
from typing import List, Optional
from pydantic import BaseModel, Field

from app.schemas.user import UserResponse
from app.schemas.role import RoleResponse
from app.schemas.permission import PermissionResponse


class DepartmentBase(BaseModel):
    """部门基础模式"""
    name: str = Field(max_length=100, description="部门名称")
    code: str = Field(max_length=50, description="部门代码")
    description: Optional[str] = Field(default=None, description="部门描述")
    sort_order: int = Field(default=0, description="排序")
    parent_id: Optional[str] = Field(default=None, description="父部门ID")
    leader_id: Optional[str] = Field(default=None, description="负责人ID")


class DepartmentCreate(DepartmentBase):
    """创建部门请求模式"""
    pass


class DepartmentUpdate(BaseModel):
    """更新部门请求模式"""
    name: Optional[str] = Field(default=None, max_length=100, description="部门名称")
    code: Optional[str] = Field(default=None, max_length=50, description="部门代码")
    description: Optional[str] = Field(default=None, description="部门描述")
    sort_order: Optional[int] = Field(default=None, description="排序")
    parent_id: Optional[str] = Field(default=None, description="父部门ID")
    leader_id: Optional[str] = Field(default=None, description="负责人ID")
    is_active: Optional[bool] = Field(default=None, description="是否激活")


class DepartmentResponse(DepartmentBase):
    """部门响应模式"""
    id: str = Field(description="部门ID")
    is_active: bool = Field(description="是否激活")
    
    class Config:
        from_attributes = True


class DepartmentTree(DepartmentResponse):
    """部门树形结构响应模式"""
    children: List["DepartmentTree"] = Field(default=[], description="子部门列表")
    leader_name: Optional[str] = Field(default=None, description="负责人姓名")
    user_count: int = Field(default=0, description="部门人数")


class PositionBase(BaseModel):
    """岗位基础模式"""
    name: str = Field(max_length=100, description="岗位名称")
    code: str = Field(max_length=50, description="岗位代码")
    description: Optional[str] = Field(default=None, description="岗位描述")
    sort_order: int = Field(default=0, description="排序")
    department_id: str = Field(description="所属部门ID")


class PositionCreate(PositionBase):
    """创建岗位请求模式"""
    pass


class PositionUpdate(BaseModel):
    """更新岗位请求模式"""
    name: Optional[str] = Field(default=None, max_length=100, description="岗位名称")
    code: Optional[str] = Field(default=None, max_length=50, description="岗位代码")
    description: Optional[str] = Field(default=None, description="岗位描述")
    sort_order: Optional[int] = Field(default=None, description="排序")
    department_id: Optional[str] = Field(default=None, description="所属部门ID")
    is_active: Optional[bool] = Field(default=None, description="是否激活")


class PositionResponse(PositionBase):
    """岗位响应模式"""
    id: str = Field(description="岗位ID")
    is_active: bool = Field(description="是否激活")
    department_name: Optional[str] = Field(default=None, description="部门名称")
    user_count: int = Field(default=0, description="岗位人数")
    
    class Config:
        from_attributes = True


class UserRoleAssign(BaseModel):
    """用户角色分配请求模式"""
    user_id: str = Field(description="用户ID")
    role_ids: List[str] = Field(description="角色ID列表")


# 解决前向引用
DepartmentTree.model_rebuild()
