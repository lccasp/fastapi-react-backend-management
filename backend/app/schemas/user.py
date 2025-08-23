"""
用户相关响应模式
"""
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

from .common import BaseSchema


class UserBase(BaseModel):
    """用户基础模式"""
    email: EmailStr = Field(description="邮箱地址")
    username: str = Field(min_length=3, max_length=50, description="用户名")
    nickname: Optional[str] = Field(default=None, max_length=50, description="昵称")
    avatar_url: Optional[str] = Field(default=None, description="头像URL")
    is_superuser: bool = Field(default=False, description="是否超级管理员")
    department_id: Optional[str] = Field(default=None, description="部门ID")
    position_id: Optional[str] = Field(default=None, description="岗位ID")


class UserCreate(UserBase):
    """创建用户请求模式"""
    password: str = Field(min_length=8, description="密码")


class UserUpdate(BaseModel):
    """更新用户请求模式"""
    email: Optional[EmailStr] = Field(default=None, description="邮箱地址")
    username: Optional[str] = Field(default=None, min_length=3, max_length=50, description="用户名")
    nickname: Optional[str] = Field(default=None, max_length=50, description="昵称")
    avatar_url: Optional[str] = Field(default=None, description="头像URL")
    is_superuser: Optional[bool] = Field(default=None, description="是否超级管理员")
    department_id: Optional[str] = Field(default=None, description="部门ID")
    position_id: Optional[str] = Field(default=None, description="岗位ID")
    is_active: Optional[bool] = Field(default=None, description="是否激活")


class UserResponse(UserBase, BaseSchema):
    """用户响应模式"""
    pass


class UserWithRoles(UserResponse):
    """包含角色信息的用户响应模式"""
    roles: List["RoleResponse"] = Field(default=[], description="用户角色列表")


class UserLogin(BaseModel):
    """用户登录请求模式"""
    username: str = Field(description="用户名或邮箱")
    password: str = Field(description="密码")


class UserRegister(BaseModel):
    """用户注册请求模式"""
    email: EmailStr = Field(description="邮箱地址")
    username: str = Field(min_length=3, max_length=50, description="用户名")
    password: str = Field(min_length=8, description="密码")
    nickname: Optional[str] = Field(default=None, max_length=50, description="昵称")


class PasswordChange(BaseModel):
    """修改密码请求模式"""
    old_password: str = Field(description="原密码")
    new_password: str = Field(min_length=8, description="新密码")


class TokenResponse(BaseModel):
    """令牌响应模式"""
    access_token: str = Field(description="访问令牌")
    token_type: str = Field(default="bearer", description="令牌类型")
    expires_in: int = Field(description="过期时间（秒）")


# 避免循环导入
from .role import RoleResponse
UserWithRoles.model_rebuild()
