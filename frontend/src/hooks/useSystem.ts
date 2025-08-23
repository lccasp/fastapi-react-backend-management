/**
 * 系统管理相关React Query hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemService } from '@/services/system';
import { useUIStore } from '@/stores/ui';
import { PaginationParams } from '@/types/api';
import {
  UserCreateRequest,
  UserUpdateRequest,
  RoleCreateRequest,
  RoleUpdateRequest,
  UserRoleAssign,
} from '@/types/system';

// 用户管理hooks
export function useUsers(params: PaginationParams & {
  search?: string;
  department_id?: string;
  is_active?: boolean;
}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => systemService.users.getList(params),
    keepPreviousData: true,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => systemService.users.getById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const setGlobalError = useUIStore((state) => state.setGlobalError);

  return useMutation({
    mutationFn: (data: UserCreateRequest) => systemService.users.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setGlobalError(null);
    },
    onError: (error: Error) => {
      setGlobalError(error.message);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const setGlobalError = useUIStore((state) => state.setGlobalError);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdateRequest }) =>
      systemService.users.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setGlobalError(null);
    },
    onError: (error: Error) => {
      setGlobalError(error.message);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const setGlobalError = useUIStore((state) => state.setGlobalError);

  return useMutation({
    mutationFn: (id: string) => systemService.users.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setGlobalError(null);
    },
    onError: (error: Error) => {
      setGlobalError(error.message);
    },
  });
}

export function useAssignUserRoles() {
  const queryClient = useQueryClient();
  const setGlobalError = useUIStore((state) => state.setGlobalError);

  return useMutation({
    mutationFn: (data: UserRoleAssign) => systemService.users.assignRoles(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setGlobalError(null);
    },
    onError: (error: Error) => {
      setGlobalError(error.message);
    },
  });
}

// 角色管理hooks
export function useRoles(params: PaginationParams & {
  search?: string;
  is_active?: boolean;
}) {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => systemService.roles.getList(params),
    keepPreviousData: true,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  const setGlobalError = useUIStore((state) => state.setGlobalError);

  return useMutation({
    mutationFn: (data: RoleCreateRequest) => systemService.roles.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setGlobalError(null);
    },
    onError: (error: Error) => {
      setGlobalError(error.message);
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  const setGlobalError = useUIStore((state) => state.setGlobalError);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoleUpdateRequest }) =>
      systemService.roles.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setGlobalError(null);
    },
    onError: (error: Error) => {
      setGlobalError(error.message);
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  const setGlobalError = useUIStore((state) => state.setGlobalError);

  return useMutation({
    mutationFn: (id: string) => systemService.roles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setGlobalError(null);
    },
    onError: (error: Error) => {
      setGlobalError(error.message);
    },
  });
}

// 权限管理hooks
export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => systemService.permissions.getList(),
    staleTime: 10 * 60 * 1000, // 10分钟
  });
}

export function usePermissionTree() {
  return useQuery({
    queryKey: ['permissionTree'],
    queryFn: () => systemService.permissions.getTree(),
    staleTime: 10 * 60 * 1000, // 10分钟
  });
}

// 部门管理hooks
export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => systemService.departments.getList(),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useDepartmentTree() {
  return useQuery({
    queryKey: ['departmentTree'],
    queryFn: () => systemService.departments.getTree(),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

// 岗位管理hooks
export function usePositions(params: PaginationParams & {
  department_id?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['positions', params],
    queryFn: () => systemService.positions.getList(params),
    keepPreviousData: true,
  });
}
