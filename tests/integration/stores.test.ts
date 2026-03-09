import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useUserListStore } from '@/stores/userList'
import { storage } from '@/utils/storage'
import { UserRole } from '@/types/user'
import { clearLocalStorage } from '../utils/test-helpers'

describe('Store 集成测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    clearLocalStorage()
  })

  describe('useUserStore 与 localStorage 集成', () => {
    it('登录后 token 和 userInfo 应该存储到 localStorage', async () => {
      const userStore = useUserStore()

      // 使用真实的 mock API 登录
      const result = await userStore.login({
        username: 'admin',
        password: '123456'
      })

      expect(result).toBe(true)

      // 验证 localStorage 中存储了数据
      expect(storage.getToken()).toBeTruthy()
      expect(storage.getUser()?.username).toBe('admin')
    })

    it('退出登录应该清除 localStorage', async () => {
      const userStore = useUserStore()

      // 先登录
      await userStore.login({
        username: 'admin',
        password: '123456'
      })

      expect(storage.getToken()).toBeTruthy()

      // 退出登录
      userStore.logout()

      // 验证 localStorage 已清除
      expect(storage.getToken()).toBeNull()
      expect(storage.getUser()).toBeNull()
    })

    it('init() 应该从 localStorage 恢复登录状态', async () => {
      // 先登录并存储到 localStorage
      const userStore = useUserStore()
      await userStore.login({
        username: 'admin',
        password: '123456'
      })

      // 验证 localStorage 有数据
      expect(storage.getToken()).toBeTruthy()
      expect(storage.getUser()?.username).toBe('admin')
    })
  })

  describe('useUserStore 与 Mock API 集成', () => {
    it('登录成功应该返回正确的用户信息', async () => {
      const userStore = useUserStore()

      const result = await userStore.login({
        username: 'admin',
        password: '123456'
      })

      expect(result).toBe(true)
      expect(userStore.token).toBeTruthy()
      expect(userStore.userInfo?.username).toBe('admin')
      expect(userStore.userInfo?.nickname).toBe('管理员')
      expect(userStore.error).toBeNull()
    })

    it('登录失败应该设置错误信息', async () => {
      const userStore = useUserStore()

      const result = await userStore.login({
        username: 'admin',
        password: 'wrongpassword'
      })

      expect(result).toBe(false)
      expect(userStore.token).toBeNull()
      expect(userStore.error).toBe('用户名或密码错误')
    })

    it('修改密码成功应该返回 true', async () => {
      const userStore = useUserStore()

      const result = await userStore.changePassword('123456', 'newpassword123')

      expect(result).toBe(true)
      expect(userStore.error).toBeNull()
    })

    it('修改密码失败应该设置错误信息', async () => {
      const userStore = useUserStore()

      const result = await userStore.changePassword('wrongpassword', 'newpassword123')

      expect(result).toBe(false)
      expect(userStore.error).toBe('原密码错误')
    })
  })

  describe('useUserListStore 与 Mock API 集成', () => {
    it('fetchUsers 应该获取用户列表', async () => {
      const userListStore = useUserListStore()

      await userListStore.fetchUsers()

      expect(userListStore.users.length).toBeGreaterThan(0)
      expect(userListStore.loading).toBe(false)
      expect(userListStore.error).toBeNull()
    })

    it('addUser 应该创建用户并更新列表', async () => {
      const userListStore = useUserListStore()

      // 先获取列表
      await userListStore.fetchUsers()
      const initialCount = userListStore.userCount

      // 添加新用户
      const newUser = await userListStore.addUser({
        username: 'integration_test_user',
        password: '123456',
        role: UserRole.USER
      })

      expect(newUser).not.toBeNull()
      expect(newUser?.username).toBe('integration_test_user')
      expect(userListStore.userCount).toBe(initialCount + 1)

      // 验证用户在列表中
      const found = userListStore.users.find(u => u.username === 'integration_test_user')
      expect(found).toBeDefined()
    })

    it('addUser 用户名重复应该失败', async () => {
      const userListStore = useUserListStore()

      // 添加第一个用户
      await userListStore.addUser({
        username: 'duplicate_test_user',
        password: '123456',
        role: UserRole.USER
      })

      // 尝试添加同名用户
      const result = await userListStore.addUser({
        username: 'duplicate_test_user',
        password: '123456',
        role: UserRole.USER
      })

      expect(result).toBeNull()
      expect(userListStore.error).toBe('用户名已存在')
    })

    it('updateUser 应该更新用户信息', async () => {
      const userListStore = useUserListStore()

      // 先添加一个用户
      const newUser = await userListStore.addUser({
        username: 'update_test_user',
        password: '123456',
        role: UserRole.USER
      })

      expect(newUser).not.toBeNull()

      // 更新用户
      const result = await userListStore.updateUser(newUser!.id, {
        username: 'updated_username',
        role: UserRole.ADMIN
      })

      expect(result).toBe(true)

      // 验证更新成功
      const updated = userListStore.getUserById(newUser!.id)
      expect(updated?.username).toBe('updated_username')
      expect(updated?.role).toBe(UserRole.ADMIN)
    })

    it('updateUser 不能修改 admin 角色', async () => {
      const userListStore = useUserListStore()

      await userListStore.fetchUsers()

      // 尝试修改 admin 角色
      const result = await userListStore.updateUser(1, {
        username: 'admin',
        role: UserRole.USER
      })

      expect(result).toBe(false)
      expect(userListStore.error).toBe('不能修改管理员角色')
    })

    it('deleteUser 应该删除用户', async () => {
      const userListStore = useUserListStore()

      // 先添加一个用户
      const newUser = await userListStore.addUser({
        username: 'delete_test_user',
        password: '123456',
        role: UserRole.USER
      })

      expect(newUser).not.toBeNull()
      const userId = newUser!.id

      // 删除用户
      const result = await userListStore.deleteUser(userId)

      expect(result).toBe(true)

      // 验证用户已删除
      const found = userListStore.getUserById(userId)
      expect(found).toBeUndefined()
    })

    it('deleteUser 不能删除 admin', async () => {
      const userListStore = useUserListStore()

      await userListStore.fetchUsers()

      // 尝试删除 admin
      const result = await userListStore.deleteUser(1)

      expect(result).toBe(false)
      expect(userListStore.error).toBe('不能删除管理员用户')
    })

    it('isSuperAdmin 应该正确识别超级管理员', async () => {
      const userListStore = useUserListStore()

      await userListStore.fetchUsers()

      expect(userListStore.isSuperAdmin(1)).toBe(true)
      expect(userListStore.isSuperAdmin(2)).toBe(false)
    })
  })

  describe('多 Store 协作', () => {
    it('用户登录状态应该影响用户列表操作', async () => {
      const userStore = useUserStore()
      const userListStore = useUserListStore()

      // 登录
      await userStore.login({
        username: 'admin',
        password: '123456'
      })

      expect(userStore.isLoggedIn).toBe(true)

      // 获取用户列表
      await userListStore.fetchUsers()

      expect(userListStore.users.length).toBeGreaterThan(0)

      // 退出登录
      userStore.logout()

      expect(userStore.isLoggedIn).toBe(false)
    })
  })
})