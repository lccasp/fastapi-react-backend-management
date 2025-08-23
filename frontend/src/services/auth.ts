/**
 * 认证相关API服务
 */

import { apiClient } from '@/lib/api';
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  CurrentUserResponse,
  PasswordChangeRequest,
} from '@/types/auth';

export const authService = {
  /**
   * 用户登录
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    return apiClient.post('/auth/login', data);
  },

  /**
   * 用户注册
   */
  async register(data: RegisterRequest): Promise<any> {
    return apiClient.post('/auth/register', data);
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<CurrentUserResponse> {
    return apiClient.get('/auth/me');
  },

  /**
   * 用户登出
   */
  async logout(): Promise<any> {
    return apiClient.post('/auth/logout');
  },

  /**
   * 修改密码
   */
  async changePassword(data: PasswordChangeRequest): Promise<any> {
    return apiClient.post('/profile/change-password', data);
  },
};
