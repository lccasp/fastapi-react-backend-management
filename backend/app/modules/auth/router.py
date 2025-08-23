"""
认证路由模块
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_active_user
from app.dependencies.permissions import get_user_permissions
from app.schemas.user import UserLogin, UserRegister, UserResponse
from app.schemas.common import ApiResponse
from app.models.user import User
from .service import AuthService
from .schemas import LoginResponse, CurrentUserResponse


router = APIRouter(prefix="/auth", tags=["认证"])


@router.post(
    "/login",
    response_model=ApiResponse[LoginResponse],
    summary="用户登录",
    description="使用用户名/邮箱和密码进行登录"
)
async def login(
    user_credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """用户登录接口"""
    
    # 验证用户凭证
    user = await AuthService.authenticate_user(
        db, user_credentials.username, user_credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )
    
    # 创建访问令牌
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user.id),
        expires_delta=access_token_expires
    )
    
    # 获取用户权限和角色
    permissions = list(await get_user_permissions(user, db))
    
    # 构建响应数据
    login_data = LoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.from_orm(user),
        permissions=permissions
    )
    
    return ApiResponse(success=True, data=login_data)


@router.post(
    "/register",
    response_model=ApiResponse[UserResponse],
    summary="用户注册",
    description="新用户注册"
)
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    """用户注册接口"""
    
    # 检查用户名是否已存在
    if await AuthService.check_username_exists(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
    
    # 检查邮箱是否已存在
    if await AuthService.check_email_exists(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已存在"
        )
    
    # 创建用户
    try:
        user = await AuthService.register_user(db, user_data)
        return ApiResponse(
            success=True,
            data=UserResponse.from_orm(user)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"注册失败: {str(e)}"
        )


@router.get(
    "/me",
    response_model=ApiResponse[CurrentUserResponse],
    summary="获取当前用户信息",
    description="获取当前登录用户的详细信息"
)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """获取当前用户信息接口"""
    
    # 获取用户权限和角色
    permissions = list(await get_user_permissions(current_user, db))
    roles = await AuthService.get_user_roles(db, current_user)
    
    # 构建响应数据
    user_info = CurrentUserResponse(
        user=UserResponse.from_orm(current_user),
        permissions=permissions,
        roles=roles
    )
    
    return ApiResponse(success=True, data=user_info)


@router.post(
    "/logout",
    response_model=ApiResponse[dict],
    summary="用户登出",
    description="用户登出（客户端需要清除令牌）"
)
async def logout(
    current_user: User = Depends(get_current_active_user)
):
    """用户登出接口"""
    
    # 由于使用JWT，服务端无状态，实际登出由客户端处理
    # 这里只是提供一个标准的登出端点
    return ApiResponse(
        success=True,
        data={"message": "登出成功"}
    )
