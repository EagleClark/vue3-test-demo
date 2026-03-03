import type {
  LoginRequest,
  LoginResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  UserListResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteUserResponse,
  FetchUserResponse
} from './types'
import type { UserListItem } from '@/types/user'
import { UserRole } from '@/types/user'

// 模拟内存数据库
let mockUsers: UserListItem[] = [
  {
    id: 1,
    username: 'admin',
    role: UserRole.ADMIN,
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 2,
    username: 'user1',
    role: UserRole.USER,
    createdAt: '2024-01-15 10:30:00'
  },
  {
    id: 3,
    username: 'user2',
    role: UserRole.USER,
    createdAt: '2024-02-01 14:20:00'
  }
]

let nextId = 4

// 模拟网络延迟
function delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 格式化日期
function formatDate(): string {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-')
}

// 模拟 API 处理器
export const mockApi = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    await delay(500)

    if (request.username === 'admin' && request.password === '123456') {
      return {
        success: true,
        message: '登录成功',
        data: {
          id: 1,
          username: request.username,
          nickname: '管理员',
          token: `mock-jwt-token-${Date.now()}`
        }
      }
    }

    return {
      success: false,
      message: '用户名或密码错误'
    }
  },

  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    await delay(300)

    if (request.oldPassword === '123456') {
      return {
        success: true,
        message: '密码修改成功'
      }
    }

    return {
      success: false,
      message: '原密码错误'
    }
  },

  async fetchUserList(): Promise<UserListResponse> {
    await delay(200)

    return {
      success: true,
      message: '获取成功',
      data: [...mockUsers]
    }
  },

  async fetchUser(id: number): Promise<FetchUserResponse> {
    await delay(200)

    const user = mockUsers.find(u => u.id === id)

    if (user) {
      return {
        success: true,
        message: '获取成功',
        data: user
      }
    }

    return {
      success: false,
      message: '用户不存在'
    }
  },

  async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    await delay(300)

    // 检查用户名是否已存在
    if (mockUsers.some(u => u.username === request.username)) {
      return {
        success: false,
        message: '用户名已存在'
      }
    }

    const newUser: UserListItem = {
      id: nextId++,
      username: request.username,
      role: request.role,
      createdAt: formatDate()
    }

    mockUsers.push(newUser)

    return {
      success: true,
      message: '创建成功',
      data: newUser
    }
  },

  async updateUser(id: number, request: UpdateUserRequest): Promise<UpdateUserResponse> {
    await delay(300)

    const index = mockUsers.findIndex(u => u.id === id)

    if (index === -1) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    const currentUser = mockUsers[index]!

    // 不能修改 admin 的角色
    if (currentUser.username === 'admin' && request.role !== UserRole.ADMIN) {
      return {
        success: false,
        message: '不能修改管理员角色'
      }
    }

    // 检查用户名是否已存在（排除当前用户）
    if (request.username && mockUsers.some(u => u.username === request.username && u.id !== id)) {
      return {
        success: false,
        message: '用户名已存在'
      }
    }

    mockUsers[index] = {
      ...currentUser,
      username: request.username,
      role: request.role
    }

    return {
      success: true,
      message: '更新成功',
      data: mockUsers[index]
    }
  },

  async deleteUser(id: number): Promise<DeleteUserResponse> {
    await delay(300)

    const index = mockUsers.findIndex(u => u.id === id)

    if (index === -1) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    const currentUser = mockUsers[index]!

    // 不能删除 admin
    if (currentUser.username === 'admin') {
      return {
        success: false,
        message: '不能删除管理员用户'
      }
    }

    mockUsers.splice(index, 1)

    return {
      success: true,
      message: '删除成功'
    }
  }
}