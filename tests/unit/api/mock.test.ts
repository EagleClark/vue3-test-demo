import { describe, it, expect } from 'vitest'
import { mockApi } from '@/api/mock'
import { UserRole } from '@/types/user'

describe('mockApi', () => {
  // 注意：由于 mockApi 使用内存数据，我们需要在每个测试后重置
  // 但由于 mockUsers 是模块级变量，我们可以通过测试顺序来确保独立性

  describe('login', () => {
    it('正确的凭据应该登录成功', async () => {
      const response = await mockApi.login({
        username: 'admin',
        password: '123456'
      })

      expect(response.success).toBe(true)
      expect(response.message).toBe('登录成功')
      expect(response.data).toBeDefined()
      expect(response.data?.username).toBe('admin')
      expect(response.data?.token).toBeDefined()
    })

    it('错误的凭据应该登录失败', async () => {
      const response = await mockApi.login({
        username: 'admin',
        password: 'wrongpassword'
      })

      expect(response.success).toBe(false)
      expect(response.message).toBe('用户名或密码错误')
      expect(response.data).toBeUndefined()
    })

    it('不存在的用户应该登录失败', async () => {
      const response = await mockApi.login({
        username: 'nonexistent',
        password: '123456'
      })

      expect(response.success).toBe(false)
      expect(response.message).toBe('用户名或密码错误')
    })
  })

  describe('changePassword', () => {
    it('正确的旧密码应该修改成功', async () => {
      const response = await mockApi.changePassword({
        oldPassword: '123456',
        newPassword: 'newpassword123'
      })

      expect(response.success).toBe(true)
      expect(response.message).toBe('密码修改成功')
    })

    it('错误的旧密码应该修改失败', async () => {
      const response = await mockApi.changePassword({
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      })

      expect(response.success).toBe(false)
      expect(response.message).toBe('原密码错误')
    })
  })

  describe('fetchUserList', () => {
    it('应该返回用户列表', async () => {
      const response = await mockApi.fetchUserList()

      expect(response.success).toBe(true)
      expect(response.data).toBeInstanceOf(Array)
      expect(response.data?.length).toBeGreaterThan(0)
    })
  })

  describe('fetchUser', () => {
    it('应该返回指定用户', async () => {
      const response = await mockApi.fetchUser(1)

      expect(response.success).toBe(true)
      expect(response.data?.id).toBe(1)
      expect(response.data?.username).toBe('admin')
    })

    it('用户不存在应该返回失败', async () => {
      const response = await mockApi.fetchUser(99999)

      expect(response.success).toBe(false)
      expect(response.message).toBe('用户不存在')
    })
  })

  describe('createUser', () => {
    it('应该成功创建用户', async () => {
      const response = await mockApi.createUser({
        username: 'test_new_user',
        password: '123456',
        role: UserRole.USER
      })

      expect(response.success).toBe(true)
      expect(response.data?.username).toBe('test_new_user')
      expect(response.data?.role).toBe(UserRole.USER)
      expect(response.data?.id).toBeDefined()
      expect(response.data?.createdAt).toBeDefined()
    })

    it('重复用户名应该创建失败', async () => {
      // 先创建一个用户
      await mockApi.createUser({
        username: 'duplicate_user',
        password: '123456',
        role: UserRole.USER
      })

      // 再次尝试创建同名用户
      const response = await mockApi.createUser({
        username: 'duplicate_user',
        password: '123456',
        role: UserRole.USER
      })

      expect(response.success).toBe(false)
      expect(response.message).toBe('用户名已存在')
    })
  })

  describe('updateUser', () => {
    it('应该成功更新用户', async () => {
      // 先创建一个用户用于更新测试
      const createResponse = await mockApi.createUser({
        username: 'update_test_user',
        password: '123456',
        role: UserRole.USER
      })
      const userId = createResponse.data!.id

      const response = await mockApi.updateUser(userId, {
        username: 'updated_username',
        role: UserRole.ADMIN
      })

      expect(response.success).toBe(true)
      expect(response.data?.username).toBe('updated_username')
      expect(response.data?.role).toBe(UserRole.ADMIN)
    })

    it('不能修改 admin 的角色', async () => {
      const response = await mockApi.updateUser(1, {
        username: 'admin',
        role: UserRole.USER
      })

      expect(response.success).toBe(false)
      expect(response.message).toBe('不能修改管理员角色')
    })

    it('更新不存在的用户应该失败', async () => {
      const response = await mockApi.updateUser(99999, {
        username: 'nobody',
        role: UserRole.USER
      })

      expect(response.success).toBe(false)
      expect(response.message).toBe('用户不存在')
    })

    it('更新用户名为已存在的用户名应该失败', async () => {
      // 创建两个用户（第一个用于产生冲突）
      await mockApi.createUser({
        username: 'conflict_user1',
        password: '123456',
        role: UserRole.USER
      })
      const user2 = await mockApi.createUser({
        username: 'conflict_user2',
        password: '123456',
        role: UserRole.USER
      })

      // 尝试将 user2 的用户名改为 user1 的用户名
      const response = await mockApi.updateUser(user2.data!.id, {
        username: 'conflict_user1',
        role: UserRole.USER
      })

      expect(response.success).toBe(false)
      expect(response.message).toBe('用户名已存在')
    })
  })

  describe('deleteUser', () => {
    it('应该成功删除用户', async () => {
      // 先创建一个用户用于删除测试
      const createResponse = await mockApi.createUser({
        username: 'delete_test_user',
        password: '123456',
        role: UserRole.USER
      })
      const userId = createResponse.data!.id

      const response = await mockApi.deleteUser(userId)

      expect(response.success).toBe(true)
      expect(response.message).toBe('删除成功')

      // 验证用户已被删除
      const fetchResponse = await mockApi.fetchUser(userId)
      expect(fetchResponse.success).toBe(false)
    })

    it('不能删除 admin 用户', async () => {
      const response = await mockApi.deleteUser(1)

      expect(response.success).toBe(false)
      expect(response.message).toBe('不能删除管理员用户')
    })

    it('删除不存在的用户应该失败', async () => {
      const response = await mockApi.deleteUser(99999)

      expect(response.success).toBe(false)
      expect(response.message).toBe('用户不存在')
    })
  })
})