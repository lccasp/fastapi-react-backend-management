"""
个人中心路由模块
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_active_user
from app.schemas.common import ApiResponse
from app.models.user import User
from .schemas import (
    ProfileUpdate, ProfileResponse, PasswordChangeRequest, AvatarUploadResponse
)
from .service import ProfileService


router = APIRouter(prefix="/profile", tags=["个人中心"])


@router.get(
    "/me",
    response_model=ApiResponse[ProfileResponse],
    summary="获取个人信息",
    description="获取当前用户的个人信息"
)
async def get_profile(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """获取个人信息"""
    user = await ProfileService.get_profile(db, str(current_user.id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户信息不存在"
        )
    
    # 构建响应数据
    profile_response = ProfileResponse.from_orm(user)
    profile_response.department_name = user.department.name if user.department else None
    profile_response.position_name = user.position.name if user.position else None
    
    return ApiResponse(success=True, data=profile_response)


@router.put(
    "/me",
    response_model=ApiResponse[ProfileResponse],
    summary="更新个人信息",
    description="更新当前用户的个人信息"
)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """更新个人信息"""
    user = await ProfileService.update_profile(
        db, str(current_user.id), profile_data
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户信息不存在"
        )
    
    # 重新获取完整信息
    user = await ProfileService.get_profile(db, str(current_user.id))
    profile_response = ProfileResponse.from_orm(user)
    profile_response.department_name = user.department.name if user.department else None
    profile_response.position_name = user.position.name if user.position else None
    
    return ApiResponse(success=True, data=profile_response)


@router.post(
    "/change-password",
    response_model=ApiResponse[dict],
    summary="修改密码",
    description="修改当前用户的登录密码"
)
async def change_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """修改密码"""
    success, error_msg = await ProfileService.change_password(
        db,
        str(current_user.id),
        password_data.old_password,
        password_data.new_password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    return ApiResponse(
        success=True,
        data={"message": "密码修改成功"}
    )


@router.post(
    "/upload-avatar",
    response_model=ApiResponse[AvatarUploadResponse],
    summary="上传头像",
    description="上传用户头像文件"
)
async def upload_avatar(
    file: UploadFile = File(..., description="头像文件"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """上传头像"""
    # 验证文件类型
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只支持图片文件"
        )
    
    # 验证文件大小（限制为2MB）
    file_size = 0
    content = await file.read()
    file_size = len(content)
    
    if file_size > 2 * 1024 * 1024:  # 2MB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="文件大小不能超过2MB"
        )
    
    # TODO: 实现文件保存逻辑
    # 这里简化处理，实际项目中应该：
    # 1. 保存文件到本地/云存储
    # 2. 生成唯一文件名
    # 3. 返回可访问的URL
    
    # 模拟生成头像URL
    import uuid
    avatar_filename = f"{uuid.uuid4()}.{file.filename.split('.')[-1]}"
    avatar_url = f"/uploads/avatars/{avatar_filename}"
    
    # 更新用户头像
    user = await ProfileService.update_avatar(
        db, str(current_user.id), avatar_url
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="头像更新失败"
        )
    
    return ApiResponse(
        success=True,
        data=AvatarUploadResponse(avatar_url=avatar_url)
    )
