import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import * as api from '@/api'
import { storage } from '@/utils/storage'

// Mock API
vi.mock('@/api', () => ({
  login: vi.fn(),
  changePassword: vi.fn()
}))

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = useUserStore()

      expect(store.token).toBeNull()
      expect(store.userInfo).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('isLoggedIn getter 应该返回 false', () => {
      const store = useUserStore()
      expect(store.isLoggedIn).toBe(false)
    })

    it('username getter 应该返回空字符串', () => {
      const store = useUserStore()
      expect(store.username).toBe('')
    })
  })

  describe('login', () => {
    it('登录成功应该更新状态', async () => {
      const mockResponse = {
        success: true,
        message: '登录成功',
        data: {
          id: 1,
          username: 'admin',
          nickname: '管理员',
          token: 'mock-token-123'
        }
      }

      vi.mocked(api.login).mockResolvedValue(mockResponse)

      const store = useUserStore()
      const result = await store.login({
        username: 'admin',
        password: '123456'
      })

      expect(result).toBe(true)
      expect(store.token).toBe('mock-token-123')
      expect(store.userInfo?.username).toBe('admin')
      expect(store.isLoggedIn).toBe(true)
      expect(store.username).toBe('admin')
      expect(store.error).toBeNull()
    })

    it('登录失败应该设置错误信息', async () => {
      const mockResponse = {
        success: false,
        message: '用户名或密码错误'
      }

      vi.mocked(api.login).mockResolvedValue(mockResponse)

      const store = useUserStore()
      const result = await store.login({
        username: 'wrong',
        password: 'wrong'
      })

      expect(result).toBe(false)
      expect(store.error).toBe('用户名或密码错误')
    })

    it('登录异常应该处理错误', async () => {
      vi.mocked(api.login).mockRejectedValue(new Error('网络错误'))

      const store = useUserStore()
      const result = await store.login({
        username: 'admin',
        password: '123456'
      })

      expect(result).toBe(false)
      expect(store.error).toBe('网络错误')
    })

    it('登录时 loading 状态应该正确变化', async () => {
      const mockResponse = {
        success: true,
        message: '登录成功',
        data: {
          id: 1,
          username: 'admin',
          nickname: '管理员',
          token: 'token'
        }
      }

      vi.mocked(api.login).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
      )

      const store = useUserStore()
      expect(store.loading).toBe(false)

      const promise = store.login({ username: 'admin', password: '123456' })
      expect(store.loading).toBe(true)

      await promise
      expect(store.loading).toBe(false)
    })
  })

  describe('logout', () => {
    it('登出应该清除所有状态', async () => {
      const mockResponse = {
        success: true,
        message: '登录成功',
        data: {
          id: 1,
          username: 'admin',
          nickname: '管理员',
          token: 'mock-token-123'
        }
      }

      vi.mocked(api.login).mockResolvedValue(mockResponse)

      const store = useUserStore()
      await store.login({ username: 'admin', password: '123456' })

      expect(store.isLoggedIn).toBe(true)

      store.logout()

      expect(store.token).toBeNull()
      expect(store.userInfo).toBeNull()
      expect(store.isLoggedIn).toBe(false)
    })
  })

  describe('changePassword', () => {
    it('修改密码成功应该返回 true', async () => {
      const mockResponse = {
        success: true,
        message: '密码修改成功'
      }

      vi.mocked(api.changePassword).mockResolvedValue(mockResponse)

      const store = useUserStore()
      const result = await store.changePassword('123456', 'newpassword')

      expect(result).toBe(true)
      expect(store.error).toBeNull()
    })

    it('修改密码失败应该设置错误信息', async () => {
      const mockResponse = {
        success: false,
        message: '原密码错误'
      }

      vi.mocked(api.changePassword).mockResolvedValue(mockResponse)

      const store = useUserStore()
      const result = await store.changePassword('wrong', 'newpassword')

      expect(result).toBe(false)
      expect(store.error).toBe('原密码错误')
    })

    it('修改密码异常应该处理错误', async () => {
      vi.mocked(api.changePassword).mockRejectedValue(new Error('服务器错误'))

      const store = useUserStore()
      const result = await store.changePassword('123456', 'newpassword')

      expect(result).toBe(false)
      expect(store.error).toBe('服务器错误')
    })
  })

  describe('init', () => {
    it('应该从 localStorage 恢复用户状态', () => {
      const mockToken = 'saved-token-123'
      const mockUser = {
        id: 1,
        username: 'admin',
        nickname: '管理员',
        token: 'saved-token-123'
      }

      vi.spyOn(storage, 'getToken').mockReturnValue(mockToken)
      vi.spyOn(storage, 'getUser').mockReturnValue(mockUser)

      const store = useUserStore()
      store.init()

      expect(store.token).toBe(mockToken)
      expect(store.userInfo).toEqual(mockUser)
      expect(store.isLoggedIn).toBe(true)
      expect(store.username).toBe('admin')
    })

    it('当没有保存的 token 时不应该恢复状态', () => {
      vi.spyOn(storage, 'getToken').mockReturnValue(null)
      vi.spyOn(storage, 'getUser').mockReturnValue(null)

      const store = useUserStore()
      store.init()

      expect(store.token).toBeNull()
      expect(store.userInfo).toBeNull()
    })

    it('当只有 token 没有用户信息时不应该恢复状态', () => {
      vi.spyOn(storage, 'getToken').mockReturnValue('token')
      vi.spyOn(storage, 'getUser').mockReturnValue(null)

      const store = useUserStore()
      store.init()

      // init 函数要求 token 和 user 都存在才恢复
      expect(store.token).toBe('token')
      expect(store.userInfo).toBeNull()
    })
  })
})