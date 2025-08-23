"""
系统管理路由模块
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_active_user
from app.dependencies.permissions import has_permission
from app.schemas.common import ApiResponse, PaginationParams, PaginationResponse
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserWithRoles
from app.schemas.role import RoleCreate, RoleUpdate, RoleResponse, RoleWithPermissions
from app.schemas.permission import PermissionResponse, PermissionTree
from app.models.user import User
from .schemas import (
    DepartmentCreate, DepartmentUpdate, DepartmentResponse, DepartmentTree,
    PositionCreate, PositionUpdate, PositionResponse,
    UserRoleAssign
)
from .service import UserService, RoleService, PermissionService, DepartmentService, PositionService


router = APIRouter(prefix="/system", tags=["系统管理"])


# 用户管理路由
@router.get(
    "/users",
    response_model=ApiResponse[PaginationResponse[UserWithRoles]],
    summary="获取用户列表",
    description="分页获取用户列表，支持搜索和过滤"
)
async def get_users(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    department_id: Optional[str] = Query(None, description="部门ID"),
    is_active: Optional[bool] = Query(None, description="激活状态"),
    current_user: User = Depends(has_permission("user:list")),
    db: AsyncSession = Depends(get_db)
):
    """获取用户列表"""
    pagination = PaginationParams(page=page, page_size=page_size)
    users, total = await UserService.get_users(
        db, pagination, search, department_id, is_active
    )
    
    # 转换为响应模型
    user_responses = []
    for user in users:
        user_response = UserWithRoles.from_orm(user)
        user_response.roles = [RoleResponse.from_orm(role) for role in user.roles]
        user_responses.append(user_response)
    
    pagination_response = PaginationResponse.create(
        items=user_responses,
        total=total,
        page=page,
        page_size=page_size
    )
    
    return ApiResponse(success=True, data=pagination_response)


@router.get(
    "/users/{user_id}",
    response_model=ApiResponse[UserWithRoles],
    summary="获取用户详情",
    description="根据用户ID获取用户详细信息"
)
async def get_user(
    user_id: str,
    current_user: User = Depends(has_permission("user:list")),
    db: AsyncSession = Depends(get_db)
):
    """获取用户详情"""
    user = await UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    user_response = UserWithRoles.from_orm(user)
    user_response.roles = [RoleResponse.from_orm(role) for role in user.roles]
    
    return ApiResponse(success=True, data=user_response)


@router.post(
    "/users",
    response_model=ApiResponse[UserResponse],
    summary="创建用户",
    description="创建新用户"
)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(has_permission("user:create")),
    db: AsyncSession = Depends(get_db)
):
    """创建用户"""
    # 检查用户名和邮箱是否已存在
    from app.modules.auth.service import AuthService
    
    if await AuthService.check_username_exists(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
    
    if await AuthService.check_email_exists(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已存在"
        )
    
    try:
        user = await UserService.create_user(db, user_data)
        return ApiResponse(success=True, data=UserResponse.from_orm(user))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建用户失败: {str(e)}"
        )


@router.put(
    "/users/{user_id}",
    response_model=ApiResponse[UserResponse],
    summary="更新用户",
    description="更新用户信息"
)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: User = Depends(has_permission("user:update")),
    db: AsyncSession = Depends(get_db)
):
    """更新用户"""
    # 检查用户名和邮箱是否已被其他用户使用
    from app.modules.auth.service import AuthService
    
    if user_data.username and await AuthService.check_username_exists(
        db, user_data.username, user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
    
    if user_data.email and await AuthService.check_email_exists(
        db, user_data.email, user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已存在"
        )
    
    user = await UserService.update_user(db, user_id, user_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    return ApiResponse(success=True, data=UserResponse.from_orm(user))


@router.delete(
    "/users/{user_id}",
    response_model=ApiResponse[dict],
    summary="删除用户",
    description="删除用户"
)
async def delete_user(
    user_id: str,
    current_user: User = Depends(has_permission("user:delete")),
    db: AsyncSession = Depends(get_db)
):
    """删除用户"""
    # 防止删除自己
    if str(current_user.id) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能删除自己的账户"
        )
    
    success = await UserService.delete_user(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    return ApiResponse(success=True, data={"message": "用户已删除"})


@router.post(
    "/users/assign-roles",
    response_model=ApiResponse[dict],
    summary="分配用户角色",
    description="为用户分配角色"
)
async def assign_user_roles(
    assignment: UserRoleAssign,
    current_user: User = Depends(has_permission("role:assign")),
    db: AsyncSession = Depends(get_db)
):
    """分配用户角色"""
    success = await UserService.assign_roles(
        db, assignment.user_id, assignment.role_ids
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    return ApiResponse(success=True, data={"message": "角色分配成功"})


# 角色管理路由
@router.get(
    "/roles",
    response_model=ApiResponse[PaginationResponse[RoleWithPermissions]],
    summary="获取角色列表",
    description="分页获取角色列表"
)
async def get_roles(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    is_active: Optional[bool] = Query(None, description="激活状态"),
    current_user: User = Depends(has_permission("role:list")),
    db: AsyncSession = Depends(get_db)
):
    """获取角色列表"""
    pagination = PaginationParams(page=page, page_size=page_size)
    roles, total = await RoleService.get_roles(db, pagination, search, is_active)
    
    # 转换为响应模型
    role_responses = []
    for role in roles:
        role_response = RoleWithPermissions.from_orm(role)
        role_response.permissions = [
            PermissionResponse.from_orm(perm) for perm in role.permissions
        ]
        role_responses.append(role_response)
    
    pagination_response = PaginationResponse.create(
        items=role_responses,
        total=total,
        page=page,
        page_size=page_size
    )
    
    return ApiResponse(success=True, data=pagination_response)


@router.post(
    "/roles",
    response_model=ApiResponse[RoleResponse],
    summary="创建角色",
    description="创建新角色"
)
async def create_role(
    role_data: RoleCreate,
    current_user: User = Depends(has_permission("role:create")),
    db: AsyncSession = Depends(get_db)
):
    """创建角色"""
    try:
        role = await RoleService.create_role(db, role_data)
        return ApiResponse(success=True, data=RoleResponse.from_orm(role))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建角色失败: {str(e)}"
        )


# 权限管理路由
@router.get(
    "/permissions",
    response_model=ApiResponse[List[PermissionResponse]],
    summary="获取权限列表",
    description="获取所有权限列表"
)
async def get_permissions(
    current_user: User = Depends(has_permission("permission:list")),
    db: AsyncSession = Depends(get_db)
):
    """获取权限列表"""
    permissions = await PermissionService.get_permissions(db)
    permission_responses = [PermissionResponse.from_orm(perm) for perm in permissions]
    
    return ApiResponse(success=True, data=permission_responses)


@router.get(
    "/permissions/tree",
    response_model=ApiResponse[List[dict]],
    summary="获取权限树",
    description="获取权限的树形结构"
)
async def get_permission_tree(
    current_user: User = Depends(has_permission("permission:list")),
    db: AsyncSession = Depends(get_db)
):
    """获取权限树"""
    tree = await PermissionService.get_permission_tree(db)
    return ApiResponse(success=True, data=tree)


# 部门管理路由
@router.get(
    "/departments",
    response_model=ApiResponse[List[DepartmentResponse]],
    summary="获取部门列表",
    description="获取所有部门列表"
)
async def get_departments(
    current_user: User = Depends(has_permission("department:list")),
    db: AsyncSession = Depends(get_db)
):
    """获取部门列表"""
    departments = await DepartmentService.get_departments(db)
    dept_responses = [DepartmentResponse.from_orm(dept) for dept in departments]
    
    return ApiResponse(success=True, data=dept_responses)


@router.get(
    "/departments/tree",
    response_model=ApiResponse[List[DepartmentTree]],
    summary="获取部门树",
    description="获取部门的树形结构"
)
async def get_department_tree(
    current_user: User = Depends(has_permission("department:list")),
    db: AsyncSession = Depends(get_db)
):
    """获取部门树"""
    tree = await DepartmentService.get_department_tree(db)
    return ApiResponse(success=True, data=tree)


@router.post(
    "/departments",
    response_model=ApiResponse[DepartmentResponse],
    summary="创建部门",
    description="创建新部门"
)
async def create_department(
    dept_data: DepartmentCreate,
    current_user: User = Depends(has_permission("department:create")),
    db: AsyncSession = Depends(get_db)
):
    """创建部门"""
    try:
        department = await DepartmentService.create_department(db, dept_data)
        return ApiResponse(success=True, data=DepartmentResponse.from_orm(department))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建部门失败: {str(e)}"
        )


# 岗位管理路由
@router.get(
    "/positions",
    response_model=ApiResponse[PaginationResponse[PositionResponse]],
    summary="获取岗位列表",
    description="分页获取岗位列表"
)
async def get_positions(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    department_id: Optional[str] = Query(None, description="部门ID"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    current_user: User = Depends(has_permission("position:list")),
    db: AsyncSession = Depends(get_db)
):
    """获取岗位列表"""
    pagination = PaginationParams(page=page, page_size=page_size)
    positions, total = await PositionService.get_positions(
        db, pagination, department_id, search
    )
    
    # 转换为响应模型
    position_responses = []
    for position in positions:
        pos_response = PositionResponse.from_orm(position)
        pos_response.department_name = position.department.name if position.department else None
        pos_response.user_count = 0  # TODO: 计算岗位人数
        position_responses.append(pos_response)
    
    pagination_response = PaginationResponse.create(
        items=position_responses,
        total=total,
        page=page,
        page_size=page_size
    )
    
    return ApiResponse(success=True, data=pagination_response)
