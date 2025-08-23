/**
 * API响应类型定义
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: string;
  code?: string;
  timestamp?: string;
}

export interface PaginationParams {
  page: number;
  page_size: number;
}

export interface PaginationResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
