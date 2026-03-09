import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchUserList,
  fetchUser,
  createUser,
  updateUser,
  deleteUser
} from '@/api/modules/userList'
import { UserRole } from '@/types/user'

// Mock config
vi.mock('@/api/config', () => ({
  USE_MOCK: true,
  API_BASE_URL: '/api',
  API_TIMEOUT: 10000
}))

// Mock useFetch
const mockUseFetch = vi.fn()
vi.mock('@vueuse/core', () => ({
  useFetch: () => mockUseFetch()
}))

describe('api/modules/userList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchUserList', () => {
    it('应该返回用户列表', async () => {
      const result = await fetchUserList()

      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
    })
  })

  describe('fetchUser', () => {
    it('应该返回指定用户', async () => {
      const result = await fetchUser(1)

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe(1)
      expect(result.data?.username).toBe('admin')
    })

    it('用户不存在应该返回失败', async () => {
      const result = await fetchUser(99999)

      expect(result.success).toBe(false)
      expect(result.message).toBe('用户不存在')
    })
  })

  describe('createUser', () => {
    it('应该创建新用户', async () => {
      const result = await createUser({
        username: 'test_new_api_user',
        password: '123456',
        role: UserRole.USER
      })

      expect(result.success).toBe(true)
      expect(result.data?.username).toBe('test_new_api_user')
    })

    it('重复用户名应该返回失败', async () => {
      // 先创建一个
      await createUser({
        username: 'duplicate_api_user',
        password: '123456',
        role: UserRole.USER
      })

      // 再创建同名用户
      const result = await createUser({
        username: 'duplicate_api_user',
        password: '123456',
        role: UserRole.USER
      })

      expect(result.success).toBe(false)
      expect(result.message).toBe('用户名已存在')
    })
  })

  describe('updateUser', () => {
    it('应该更新用户', async () => {
      // 先创建一个用户
      const createResult = await createUser({
        username: 'update_api_test_user',
        password: '123456',
        role: UserRole.USER
      })
      const userId = createResult.data!.id

      const result = await updateUser(userId, {
        username: 'updated_api_username',
        role: UserRole.ADMIN
      })

      expect(result.success).toBe(true)
      expect(result.data?.username).toBe('updated_api_username')
    })

    it('不能修改 admin 角色', async () => {
      const result = await updateUser(1, {
        username: 'admin',
        role: UserRole.USER
      })

      expect(result.success).toBe(false)
      expect(result.message).toBe('不能修改管理员角色')
    })
  })

  describe('deleteUser', () => {
    it('应该删除用户', async () => {
      // 先创建一个用户
      const createResult = await createUser({
        username: 'delete_api_test_user',
        password: '123456',
        role: UserRole.USER
      })
      const userId = createResult.data!.id

      const result = await deleteUser(userId)

      expect(result.success).toBe(true)
    })

    it('不能删除 admin 用户', async () => {
      const result = await deleteUser(1)

      expect(result.success).toBe(false)
      expect(result.message).toBe('不能删除管理员用户')
    })
  })
})