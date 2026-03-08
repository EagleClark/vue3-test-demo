import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, changePassword } from '@/api/modules/user'
import { USE_MOCK } from '@/api/config'

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

describe('api/modules/user', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('USE_MOCK=true 时应该调用 mockApi.login', async () => {
      vi.mocked(USE_MOCK, true)

      const result = await login({
        username: 'admin',
        password: '123456'
      })

      expect(result.success).toBe(true)
      expect(result.data?.username).toBe('admin')
    })
  })

  describe('changePassword', () => {
    it('USE_MOCK=true 时应该调用 mockApi.changePassword', async () => {
      vi.mocked(USE_MOCK, true)

      const result = await changePassword({
        oldPassword: '123456',
        newPassword: 'newpassword'
      })

      expect(result.success).toBe(true)
    })

    it('旧密码错误应该返回失败', async () => {
      const result = await changePassword({
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword'
      })

      expect(result.success).toBe(false)
      expect(result.message).toBe('原密码错误')
    })
  })
})