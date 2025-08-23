/**
 * 系统管理相关类型定义
 */

import { User, Role, Permission } from './auth';

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  sort_order: number;
  parent_id?: string;
  leader_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DepartmentTree extends Department {
  children: DepartmentTree[];
  leader_name?: string;
  user_count: number;
}

export interface Position {
  id: string;
  name: string;
  code: string;
  description?: string;
  sort_order: number;
  department_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  department_name?: string;
  user_count: number;
}

export interface UserWithRoles extends User {
  roles: Role[];
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface PermissionTree extends Permission {
  children: PermissionTree[];
}

export interface UserCreateRequest {
  email: string;
  username: string;
  password: string;
  nickname?: string;
  avatar_url?: string;
  is_superuser: boolean;
  department_id?: string;
  position_id?: string;
}

export interface UserUpdateRequest {
  email?: string;
  username?: string;
  nickname?: string;
  avatar_url?: string;
  is_superuser?: boolean;
  department_id?: string;
  position_id?: string;
  is_active?: boolean;
}

export interface RoleCreateRequest {
  name: string;
  code: string;
  description?: string;
  permission_ids: string[];
}

export interface RoleUpdateRequest {
  name?: string;
  code?: string;
  description?: string;
  is_active?: boolean;
  permission_ids?: string[];
}

export interface UserRoleAssign {
  user_id: string;
  role_ids: string[];
}
