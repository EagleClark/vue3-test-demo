import type { UserListItem, UserRole } from '@/types/user'

// 通用 API 响应包装类型
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
}

// 登录请求
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应数据
export interface LoginResponseData {
  id: number
  username: string
  nickname?: string
  token: string
}

export type LoginResponse = ApiResponse<LoginResponseData>

// 修改密码请求
export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export type ChangePasswordResponse = ApiResponse<void>

// 用户列表响应
export type UserListResponse = ApiResponse<UserListItem[]>

// 创建用户请求
export interface CreateUserRequest {
  username: string
  password: string
  role: UserRole
}

export type CreateUserResponse = ApiResponse<UserListItem>

// 更新用户请求
export interface UpdateUserRequest {
  username: string
  role: UserRole
}

export type UpdateUserResponse = ApiResponse<UserListItem>

// 删除用户响应
export type DeleteUserResponse = ApiResponse<void>

// 获取单个用户响应
export type FetchUserResponse = ApiResponse<UserListItem>