// 用户角色常量
export const UserRole = {
  ADMIN: 'admin',
  USER: 'user'
} as const

export type UserRole = typeof UserRole[keyof typeof UserRole]

// 用户角色显示名称
export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: '管理员',
  [UserRole.USER]: '普通用户'
}

// 用户信息接口
export interface UserInfo {
  id: number
  username: string
  nickname?: string
  token: string
}

// 用户列表项接口
export interface UserListItem {
  id: number
  username: string
  role: UserRole
  createdAt: string
}

// 用户表单接口
export interface UserFormData {
  id?: number
  username: string
  password: string
  confirmPassword: string
  role: UserRole
}

// 登录表单接口
export interface LoginForm {
  username: string
  password: string
  remember?: boolean
}

// 登录响应接口（模拟后端返回）
export interface LoginResponse {
  success: boolean
  message: string
  data?: UserInfo
}