import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserListStore } from '@/stores/userList'
import { UserRole } from '@/types/user'
import * as api from '@/api'

// Mock API
vi.mock('@/api', () => ({
  fetchUserList: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn()
}))

describe('useUserListStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mockUsers = [
    { id: 1, username: 'admin', role: UserRole.ADMIN, createdAt: '2024-01-01' },
    { id: 2, username: 'user1', role: UserRole.USER, createdAt: '2024-01-02' }
  ]

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = useUserListStore()

      expect(store.users).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('userCount getter 应该返回 0', () => {
      const store = useUserListStore()
      expect(store.userCount).toBe(0)
    })
  })

  describe('fetchUsers', () => {
    it('获取用户列表成功', async () => {
      vi.mocked(api.fetchUserList).mockResolvedValue({
        success: true,
        message: '获取成功',
        data: mockUsers
      })

      const store = useUserListStore()
      await store.fetchUsers()

      expect(store.users).toEqual(mockUsers)
      expect(store.userCount).toBe(2)
      expect(store.error).toBeNull()
    })

    it('获取用户列表失败应该设置错误', async () => {
      vi.mocked(api.fetchUserList).mockResolvedValue({
        success: false,
        message: '获取失败'
      })

      const store = useUserListStore()
      await store.fetchUsers()

      expect(store.users).toEqual([])
      expect(store.error).toBe('获取失败')
    })

    it('获取用户列表异常应该处理错误', async () => {
      vi.mocked(api.fetchUserList).mockRejectedValue(new Error('网络错误'))

      const store = useUserListStore()
      await store.fetchUsers()

      expect(store.error).toBe('网络错误')
    })
  })

  describe('getUserById', () => {
    it('应该返回正确的用户', async () => {
      vi.mocked(api.fetchUserList).mockResolvedValue({
        success: true,
        message: '获取成功',
        data: mockUsers
      })

      const store = useUserListStore()
      await store.fetchUsers()

      const user = store.getUserById(1)
      expect(user?.username).toBe('admin')
    })

    it('用户不存在应该返回 undefined', async () => {
      vi.mocked(api.fetchUserList).mockResolvedValue({
        success: true,
        message: '获取成功',
        data: mockUsers
      })

      const store = useUserListStore()
      await store.fetchUsers()

      const user = store.getUserById(999)
      expect(user).toBeUndefined()
    })
  })

  describe('addUser', () => {
    it('添加用户成功', async () => {
      const newUser = { id: 3, username: 'newuser', role: UserRole.USER, createdAt: '2024-01-03' }

      vi.mocked(api.createUser).mockResolvedValue({
        success: true,
        message: '创建成功',
        data: newUser
      })

      const store = useUserListStore()
      const result = await store.addUser({
        username: 'newuser',
        password: '123456',
        role: UserRole.USER
      })

      expect(result).toEqual(newUser)
      expect(store.users).toContainEqual(newUser)
      expect(store.userCount).toBe(1)
    })

    it('添加用户失败（用户名已存在）', async () => {
      vi.mocked(api.createUser).mockResolvedValue({
        success: false,
        message: '用户名已存在'
      })

      const store = useUserListStore()
      const result = await store.addUser({
        username: 'admin',
        password: '123456',
        role: UserRole.USER
      })

      expect(result).toBeNull()
      expect(store.error).toBe('用户名已存在')
    })

    it('添加用户异常应该处理错误', async () => {
      vi.mocked(api.createUser).mockRejectedValue(new Error('服务器错误'))

      const store = useUserListStore()
      const result = await store.addUser({
        username: 'testuser',
        password: '123456',
        role: UserRole.USER
      })

      expect(result).toBeNull()
      expect(store.error).toBe('服务器错误')
    })
  })

  describe('updateUser', () => {
    it('更新用户成功', async () => {
      const updatedUser = { id: 2, username: 'user1_updated', role: UserRole.ADMIN, createdAt: '2024-01-02' }

      vi.mocked(api.fetchUserList).mockResolvedValue({
        success: true,
        message: '获取成功',
        data: mockUsers
      })

      vi.mocked(api.updateUser).mockResolvedValue({
        success: true,
        message: '更新成功',
        data: updatedUser
      })

      const store = useUserListStore()
      await store.fetchUsers()

      const result = await store.updateUser(2, { username: 'user1_updated', role: UserRole.ADMIN })

      expect(result).toBe(true)
      expect(store.users.find(u => u.id === 2)?.username).toBe('user1_updated')
    })

    it('更新用户失败（不能修改管理员角色）', async () => {
      vi.mocked(api.fetchUserList).mockResolvedValue({
        success: true,
        message: '获取成功',
        data: mockUsers
      })

      vi.mocked(api.updateUser).mockResolvedValue({
        success: false,
        message: '不能修改管理员角色'
      })

      const store = useUserListStore()
      await store.fetchUsers()

      const result = await store.updateUser(1, { username: 'admin', role: UserRole.USER })

      expect(result).toBe(false)
      expect(store.error).toBe('不能修改管理员角色')
    })

    it('更新用户异常应该处理错误', async () => {
      vi.mocked(api.fetchUserList).mockResolvedValue({
        success: true,
        message: '获取成功',
        data: mockUsers
      })

      vi.mocked(api.updateUser).mockRejectedValue(new Error('网络错误'))

      const store = useUserListStore()
      await store.fetchUsers()

      const result = await store.updateUser(2, { username: 'test', role: UserRole.USER })

      expect(result).toBe(false)
      expect(store.error).toBe('网络错误')
    })
  })

  describe('deleteUser', () => {
    it('删除用户成功', async () => {
      vi.mocked(api.fetchUserList).mockResolvedValue({
        success: true,
        message: '获取成功',
        data: mockUsers
      })

      vi.mocked(api.deleteUser).mockResolvedValue({
        success: true,
        message: '删除成功'
      })

      const store = useUserListStore()
      await store.fetchUsers()
      expect(store.userCount).toBe(2)

      const result = await store.deleteUser(2)

      expect(result).toBe(true)
      expect(store.userCount).toBe(1)
    })

    it('删除用户失败（不能删除管理员）', async () => {
      vi.mocked(api.fetchUserList).mockResolvedValue({
        success: true,
        message: '获取成功',
        data: mockUsers
      })

      vi.mocked(api.deleteUser).mockResolvedValue({
        success: false,
        message: '不能删除管理员用户'
      })

      const store = useUserListStore()
      await store.fetchUsers()

      const result = await store.deleteUser(1)

      expect(result).toBe(false)
      expect(store.error).toBe('不能删除管理员用户')
    })

    it('删除用户异常应该处理错误', async () => {
      vi.mocked(api.fetchUserList).mockResolvedValue({
        success: true,
        message: '获取成功',
        data: mockUsers
      })

      vi.mocked(api.deleteUser).mockRejectedValue(new Error('服务器错误'))

      const store = useUserListStore()
      await store.fetchUsers()

      const result = await store.deleteUser(2)

      expect(result).toBe(false)
      expect(store.error).toBe('服务器错误')
    })
  })

  describe('isSuperAdmin', () => {
    it('应该识别超级管理员', async () => {
      vi.mocked(api.fetchUserList).mockResolvedValue({
        success: true,
        message: '获取成功',
        data: mockUsers
      })

      const store = useUserListStore()
      await store.fetchUsers()

      expect(store.isSuperAdmin(1)).toBe(true)
      expect(store.isSuperAdmin(2)).toBe(false)
    })
  })
})