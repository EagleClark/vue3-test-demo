import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, LoginForm } from '@/types/user'
import { storage } from '@/utils/storage'
import { login as loginApi, changePassword as changePasswordApi } from '@/api'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string | null>(storage.getToken())
  const userInfo = ref<UserInfo | null>(storage.getUser<UserInfo>())
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')

  // Actions
  async function login(form: LoginForm): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await loginApi({
        username: form.username,
        password: form.password
      })

      if (response.success && response.data) {
        const user: UserInfo = {
          id: response.data.id,
          username: response.data.username,
          nickname: response.data.nickname,
          token: response.data.token
        }

        token.value = user.token
        userInfo.value = user
        storage.setToken(user.token)
        storage.setUser(user)

        return true
      }

      error.value = response.message
      return false
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登录失败'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout(): void {
    token.value = null
    userInfo.value = null
    storage.clearAuth()
  }

  async function changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await changePasswordApi({
        oldPassword,
        newPassword
      })

      if (!response.success) {
        error.value = response.message
      }

      return response.success
    } catch (err) {
      error.value = err instanceof Error ? err.message : '修改密码失败'
      return false
    } finally {
      loading.value = false
    }
  }

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
    loading,
    error,
    // Getters
    isLoggedIn,
    username,
    // Actions
    login,
    logout,
    changePassword,
    init
  }
})