"""
个人中心模块专用响应模式
"""
from typing import Optional
from pydantic import BaseModel, Field, EmailStr

from app.schemas.user import UserResponse


class ProfileUpdate(BaseModel):
    """个人信息更新请求模式"""
    nickname: Optional[str] = Field(default=None, max_length=50, description="昵称")
    avatar_url: Optional[str] = Field(default=None, description="头像URL")


class ProfileResponse(UserResponse):
    """个人信息响应模式"""
    department_name: Optional[str] = Field(default=None, description="部门名称")
    position_name: Optional[str] = Field(default=None, description="岗位名称")


class PasswordChangeRequest(BaseModel):
    """修改密码请求模式"""
    old_password: str = Field(description="原密码")
    new_password: str = Field(min_length=8, description="新密码")


class AvatarUploadResponse(BaseModel):
    """头像上传响应模式"""
    avatar_url: str = Field(description="头像URL")
