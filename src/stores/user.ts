import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, LoginForm } from '@/types/user'
import { storage } from '@/utils/storage'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string | null>(storage.getToken())
  const userInfo = ref<UserInfo | null>(storage.getUser<UserInfo>())

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')

  // Actions
  async function login(form: LoginForm): Promise<boolean> {
    // 模拟 API 调用（实际项目中替换为真实 API）
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟验证
        if (form.username === 'admin' && form.password === '123456') {
          const user: UserInfo = {
            id: 1,
            username: form.username,
            nickname: '管理员',
            token: 'mock-jwt-token-' + Date.now()
          }

          // 更新 state
          token.value = user.token
          userInfo.value = user

          // 持久化存储
          storage.setToken(user.token)
          storage.setUser(user)

          resolve(true)
        } else {
          resolve(false)
        }
      }, 500)
    })
  }

  function logout(): void {
    token.value = null
    userInfo.value = null
    storage.clearAuth()
  }

  // 初始化时从 localStorage 恢复状态
  function init(): void {
    const savedToken = storage.getToken()
    const savedUser = storage.getUser<UserInfo>()

    if (savedToken && savedUser) {
      token.value = savedToken
      userInfo.value = savedUser
    }
  }

  return {
    // State
    token,
    userInfo,
    // Getters
    isLoggedIn,
    username,
    // Actions
    login,
    logout,
    init
  }
})