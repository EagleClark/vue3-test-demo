import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mockApi } from '@/api/mock'
import { login, changePassword } from '@/api/modules/user'
import {
  fetchUserList,
  fetchUser,
  createUser,
  updateUser,
  deleteUser
} from '@/api/modules/userList'
import { useUserStore } from '@/stores/user'
import { useUserListStore } from '@/stores/userList'
import { UserRole } from '@/types/user'
import { storage } from '@/utils/storage'
import { clearLocalStorage } from '../utils/test-helpers'

describe('API 集成测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    clearLocalStorage()
  })

  describe('登录 API 集成', () => {
    it('完整的登录流程：API → Store → localStorage', async () => {
      // 1. 调用登录 API
      const response = await login({
        username: 'admin',
        password: '123456'
      })

      // 2. 验证 API 响应
      expect(response.success).toBe(true)
      expect(response.data?.username).toBe('admin')
      expect(response.data?.token).toBeTruthy()

      // 3. 更新 Store
      const userStore = useUserStore()
      userStore.token = response.data!.token
      userStore.userInfo = {
        id: response.data!.id,
        username: response.data!.username,
        nickname: response.data!.nickname,
        token: response.data!.token
      }

      // 4. 存储到 localStorage
      storage.setToken(response.data!.token)
      storage.setUser(userStore.userInfo)

      // 5. 验证完整流程
      expect(userStore.isLoggedIn).toBe(true)
      expect(storage.getToken()).toBe(response.data!.token)
      expect(storage.getUser()?.username).toBe('admin')
    })

    it('登录失败流程', async () => {
      const response = await login({
        username: 'admin',
        password: 'wrongpassword'
      })

      expect(response.success).toBe(false)
      expect(response.message).toBe('用户名或密码错误')

      // 验证 store 没有被更新
      const userStore = useUserStore()
      expect(userStore.isLoggedIn).toBe(false)
    })
  })

  describe('修改密码 API 集成', () => {
    it('修改密码成功流程', async () => {
      const response = await changePassword({
        oldPassword: '123456',
        newPassword: 'newpassword123'
      })

      expect(response.success).toBe(true)
      expect(response.message).toBe('密码修改成功')
    })

    it('修改密码失败流程', async () => {
      const response = await changePassword({
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      })

      expect(response.success).toBe(false)
      expect(response.message).toBe('原密码错误')
    })
  })

  describe('用户列表 API 集成', () => {
    it('获取用户列表流程', async () => {
      const response = await fetchUserList()

      expect(response.success).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
      expect(response.data!.length).toBeGreaterThan(0)
    })

    it('获取单个用户流程', async () => {
      const response = await fetchUser(1)

      expect(response.success).toBe(true)
      expect(response.data?.username).toBe('admin')
    })

    it('获取不存在的用户', async () => {
      const response = await fetchUser(99999)

      expect(response.success).toBe(false)
      expect(response.message).toBe('用户不存在')
    })
  })

  describe('用户 CRUD API 集成', () => {
    it('完整的创建用户流程', async () => {
      // 1. 创建用户
      const createResponse = await createUser({
        username: 'api_integration_user',
        password: '123456',
        role: UserRole.USER
      })

      expect(createResponse.success).toBe(true)
      expect(createResponse.data?.username).toBe('api_integration_user')

      // 2. 验证用户已创建
      const listResponse = await fetchUserList()
      const found = listResponse.data?.find(u => u.username === 'api_integration_user')
      expect(found).toBeDefined()
    })

    it('创建重复用户名应该失败', async () => {
      // 创建第一个用户
      await createUser({
        username: 'duplicate_api_user',
        password: '123456',
        role: UserRole.USER
      })

      // 尝试创建同名用户
      const response = await createUser({
        username: 'duplicate_api_user',
        password: '123456',
        role: UserRole.USER
      })

      expect(response.success).toBe(false)
      expect(response.message).toBe('用户名已存在')
    })

    it('完整的更新用户流程', async () => {
      // 1. 创建用户
      const createResponse = await createUser({
        username: 'update_api_test',
        password: '123456',
        role: UserRole.USER
      })

      const userId = createResponse.data!.id

      // 2. 更新用户
      const updateResponse = await updateUser(userId, {
        username: 'updated_api_test',
        role: UserRole.ADMIN
      })

      expect(updateResponse.success).toBe(true)
      expect(updateResponse.data?.username).toBe('updated_api_test')
      expect(updateResponse.data?.role).toBe(UserRole.ADMIN)

      // 3. 验证更新成功
      const fetchResponse = await fetchUser(userId)
      expect(fetchResponse.data?.username).toBe('updated_api_test')
    })

    it('完整的删除用户流程', async () => {
      // 1. 创建用户
      const createResponse = await createUser({
        username: 'delete_api_test',
        password: '123456',
        role: UserRole.USER
      })

      const userId = createResponse.data!.id

      // 2. 删除用户
      const deleteResponse = await deleteUser(userId)
      expect(deleteResponse.success).toBe(true)

      // 3. 验证用户已删除
      const fetchResponse = await fetchUser(userId)
      expect(fetchResponse.success).toBe(false)
      expect(fetchResponse.message).toBe('用户不存在')
    })

    it('不能删除 admin 用户', async () => {
      const response = await deleteUser(1)

      expect(response.success).toBe(false)
      expect(response.message).toBe('不能删除管理员用户')
    })

    it('不能修改 admin 角色', async () => {
      const response = await updateUser(1, {
        username: 'admin',
        role: UserRole.USER
      })

      expect(response.success).toBe(false)
      expect(response.message).toBe('不能修改管理员角色')
    })
  })

  describe('API 与 Store 完整集成', () => {
    it('完整的登录 → 操作 → 登出流程', async () => {
      const userStore = useUserStore()
      const userListStore = useUserListStore()

      // 1. 登录
      const loginResult = await userStore.login({
        username: 'admin',
        password: '123456'
      })
      expect(loginResult).toBe(true)
      expect(userStore.isLoggedIn).toBe(true)

      // 2. 获取用户列表
      await userListStore.fetchUsers()
      expect(userListStore.users.length).toBeGreaterThan(0)

      // 3. 创建新用户
      const newUser = await userListStore.addUser({
        username: 'full_flow_user',
        password: '123456',
        role: UserRole.USER
      })
      expect(newUser).not.toBeNull()

      // 4. 更新用户
      if (newUser) {
        const updateResult = await userListStore.updateUser(newUser.id, {
          username: 'updated_full_flow_user',
          role: UserRole.ADMIN
        })
        expect(updateResult).toBe(true)
      }

      // 5. 删除用户
      if (newUser) {
        const deleteResult = await userListStore.deleteUser(newUser.id)
        expect(deleteResult).toBe(true)
      }

      // 6. 登出
      userStore.logout()
      expect(userStore.isLoggedIn).toBe(false)
      expect(storage.getToken()).toBeNull()
    })
  })

  describe('错误处理集成', () => {
    it('API 错误应该正确传递到 Store', async () => {
      const userStore = useUserStore()

      // 登录失败
      await userStore.login({
        username: 'admin',
        password: 'wrongpassword'
      })

      expect(userStore.error).toBe('用户名或密码错误')
    })

    it('用户列表操作错误应该正确传递到 Store', async () => {
      const userListStore = useUserListStore()

      // 获取列表
      await userListStore.fetchUsers()

      // 尝试删除 admin
      await userListStore.deleteUser(1)

      expect(userListStore.error).toBe('不能删除管理员用户')
    })
  })
})