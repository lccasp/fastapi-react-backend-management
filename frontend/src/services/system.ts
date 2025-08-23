/**
 * 系统管理相关API服务
 */

import { apiClient } from '@/lib/api';
import {
  UserWithRoles,
  RoleWithPermissions,
  PermissionTree,
  DepartmentTree,
  Position,
  UserCreateRequest,
  UserUpdateRequest,
  RoleCreateRequest,
  RoleUpdateRequest,
  UserRoleAssign,
} from '@/types/system';
import { PaginationParams, PaginationResponse } from '@/types/api';

export const systemService = {
  // 用户管理
  users: {
    /**
     * 获取用户列表
     */
    async getList(params: PaginationParams & {
      search?: string;
      department_id?: string;
      is_active?: boolean;
    }): Promise<PaginationResponse<UserWithRoles>> {
      return apiClient.get('/system/users', { params });
    },

    /**
     * 获取用户详情
     */
    async getById(id: string): Promise<UserWithRoles> {
      return apiClient.get(`/system/users/${id}`);
    },

    /**
     * 创建用户
     */
    async create(data: UserCreateRequest): Promise<any> {
      return apiClient.post('/system/users', data);
    },

    /**
     * 更新用户
     */
    async update(id: string, data: UserUpdateRequest): Promise<any> {
      return apiClient.put(`/system/users/${id}`, data);
    },

    /**
     * 删除用户
     */
    async delete(id: string): Promise<any> {
      return apiClient.delete(`/system/users/${id}`);
    },

    /**
     * 分配用户角色
     */
    async assignRoles(data: UserRoleAssign): Promise<any> {
      return apiClient.post('/system/users/assign-roles', data);
    },
  },

  // 角色管理
  roles: {
    /**
     * 获取角色列表
     */
    async getList(params: PaginationParams & {
      search?: string;
      is_active?: boolean;
    }): Promise<PaginationResponse<RoleWithPermissions>> {
      return apiClient.get('/system/roles', { params });
    },

    /**
     * 创建角色
     */
    async create(data: RoleCreateRequest): Promise<any> {
      return apiClient.post('/system/roles', data);
    },

    /**
     * 更新角色
     */
    async update(id: string, data: RoleUpdateRequest): Promise<any> {
      return apiClient.put(`/system/roles/${id}`, data);
    },

    /**
     * 删除角色
     */
    async delete(id: string): Promise<any> {
      return apiClient.delete(`/system/roles/${id}`);
    },
  },

  // 权限管理
  permissions: {
    /**
     * 获取权限列表
     */
    async getList(): Promise<any[]> {
      return apiClient.get('/system/permissions');
    },

    /**
     * 获取权限树
     */
    async getTree(): Promise<PermissionTree[]> {
      return apiClient.get('/system/permissions/tree');
    },
  },

  // 部门管理
  departments: {
    /**
     * 获取部门列表
     */
    async getList(): Promise<any[]> {
      return apiClient.get('/system/departments');
    },

    /**
     * 获取部门树
     */
    async getTree(): Promise<DepartmentTree[]> {
      return apiClient.get('/system/departments/tree');
    },

    /**
     * 创建部门
     */
    async create(data: any): Promise<any> {
      return apiClient.post('/system/departments', data);
    },

    /**
     * 更新部门
     */
    async update(id: string, data: any): Promise<any> {
      return apiClient.put(`/system/departments/${id}`, data);
    },

    /**
     * 删除部门
     */
    async delete(id: string): Promise<any> {
      return apiClient.delete(`/system/departments/${id}`);
    },
  },

  // 岗位管理
  positions: {
    /**
     * 获取岗位列表
     */
    async getList(params: PaginationParams & {
      department_id?: string;
      search?: string;
    }): Promise<PaginationResponse<Position>> {
      return apiClient.get('/system/positions', { params });
    },

    /**
     * 创建岗位
     */
    async create(data: any): Promise<any> {
      return apiClient.post('/system/positions', data);
    },

    /**
     * 更新岗位
     */
    async update(id: string, data: any): Promise<any> {
      return apiClient.put(`/system/positions/${id}`, data);
    },

    /**
     * 删除岗位
     */
    async delete(id: string): Promise<any> {
      return apiClient.delete(`/system/positions/${id}`);
    },
  },
};
