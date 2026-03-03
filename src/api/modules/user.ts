import { useFetch } from '@vueuse/core'
import type { LoginRequest, LoginResponse, ChangePasswordRequest, ChangePasswordResponse } from '../types'
import { mockApi } from '../mock'
import { USE_MOCK } from '../config'

/**
 * 登录
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCK) {
    return mockApi.login(request)
  }

  const { data, error } = await useFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(request)
  }).json<LoginResponse>()

  if (error.value) {
    return {
      success: false,
      message: error.value.message || '登录失败'
    }
  }

  return data.value!
}

/**
 * 修改密码
 */
export async function changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  if (USE_MOCK) {
    return mockApi.changePassword(request)
  }

  const { data, error } = await useFetch('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(request)
  }).json<ChangePasswordResponse>()

  if (error.value) {
    return {
      success: false,
      message: error.value.message || '修改密码失败'
    }
  }

  return data.value!
}