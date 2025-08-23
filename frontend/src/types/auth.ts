/**
 * 认证相关类型定义
 */

export interface User {
  id: string;
  email: string;
  username: string;
  nickname?: string;
  avatar_url?: string;
  is_superuser: boolean;
  department_id?: string;
  position_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  description?: string;
  resource: string;
  action: string;
  sort_order: number;
  permission_type: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  nickname?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
  permissions: string[];
}

export interface CurrentUserResponse {
  user: User;
  permissions: string[];
  roles: string[];
}

export interface PasswordChangeRequest {
  old_password: string;
  new_password: string;
}
