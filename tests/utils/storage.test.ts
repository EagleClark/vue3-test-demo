import { describe, it, expect, beforeEach } from 'vitest'
import { storage } from '@/utils/storage'

describe('storage 工具函数', () => {
  // 在每个测试前清空 localStorage
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Token 操作', () => {
    it('getToken 应该返回 null 当没有设置 token 时', () => {
      expect(storage.getToken()).toBeNull()
    })

    it('setToken 应该正确设置 token', () => {
      storage.setToken('test-token-123')
      expect(storage.getToken()).toBe('test-token-123')
    })

    it('removeToken 应该正确移除 token', () => {
      storage.setToken('test-token-123')
      expect(storage.getToken()).toBe('test-token-123')

      storage.removeToken()
      expect(storage.getToken()).toBeNull()
    })
  })

  describe('用户信息操作', () => {
    it('getUser 应该返回 null 当没有设置用户信息时', () => {
      expect(storage.getUser()).toBeNull()
    })

    it('setUser 应该正确设置用户信息', () => {
      const user = { id: 1, username: 'admin', nickname: '管理员', token: 'token-123' }
      storage.setUser(user)

      const savedUser = storage.getUser<typeof user>()
      expect(savedUser).toEqual(user)
    })

    it('removeUser 应该正确移除用户信息', () => {
      const user = { id: 1, username: 'admin' }
      storage.setUser(user)
      expect(storage.getUser()).toEqual(user)

      storage.removeUser()
      expect(storage.getUser()).toBeNull()
    })
  })

  describe('clearAuth', () => {
    it('应该同时清除 token 和用户信息', () => {
      // 设置 token 和用户信息
      storage.setToken('test-token')
      storage.setUser({ id: 1, username: 'test' })

      // 验证已设置
      expect(storage.getToken()).toBe('test-token')
      expect(storage.getUser()).toEqual({ id: 1, username: 'test' })

      // 清除所有认证信息
      storage.clearAuth()

      // 验证已清除
      expect(storage.getToken()).toBeNull()
      expect(storage.getUser()).toBeNull()
    })
  })

  describe('泛型支持', () => {
    it('getUser 应该支持泛型类型', () => {
      interface CustomUser {
        id: number
        name: string
        email: string
      }

      const customUser: CustomUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      }

      storage.setUser(customUser)
      const savedUser = storage.getUser<CustomUser>()

      expect(savedUser).toEqual(customUser)
      expect(savedUser?.email).toBe('test@example.com')
    })
  })

  describe('边界情况', () => {
    it('应该正确处理空字符串 token', () => {
      storage.setToken('')
      expect(storage.getToken()).toBe('')
    })

    it('应该正确处理特殊字符', () => {
      const specialUser = {
        id: 1,
        name: '测试用户<script>',
        special: '值 with "quotes" and \n newlines'
      }

      storage.setUser(specialUser)
      expect(storage.getUser()).toEqual(specialUser)
    })
  })
})