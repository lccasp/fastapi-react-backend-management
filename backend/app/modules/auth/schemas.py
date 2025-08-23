"""
认证模块专用响应模式
"""
from typing import List
from pydantic import BaseModel, Field

from app.schemas.user import UserResponse


class LoginResponse(BaseModel):
    """登录响应模式"""
    access_token: str = Field(description="访问令牌")
    token_type: str = Field(default="bearer", description="令牌类型")
    expires_in: int = Field(description="过期时间（秒）")
    user: UserResponse = Field(description="用户信息")
    permissions: List[str] = Field(description="用户权限列表")


class CurrentUserResponse(BaseModel):
    """当前用户信息响应模式"""
    user: UserResponse = Field(description="用户信息")
    permissions: List[str] = Field(description="用户权限列表")
    roles: List[str] = Field(description="用户角色列表")
