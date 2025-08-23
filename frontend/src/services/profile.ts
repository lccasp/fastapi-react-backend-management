/**
 * 个人中心相关API服务
 */

import { apiClient } from '@/lib/api';

export interface ProfileUpdateRequest {
  nickname?: string;
  avatar_url?: string;
}

export interface AvatarUploadResponse {
  avatar_url: string;
}

export const profileService = {
  /**
   * 获取个人信息
   */
  async getProfile(): Promise<any> {
    return apiClient.get('/profile/me');
  },

  /**
   * 更新个人信息
   */
  async updateProfile(data: ProfileUpdateRequest): Promise<any> {
    return apiClient.put('/profile/me', data);
  },

  /**
   * 上传头像
   */
  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post('/profile/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
