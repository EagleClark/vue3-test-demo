import { useFetch } from '@vueuse/core'
import type {
  UserListResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteUserResponse,
  FetchUserResponse
} from '../types'
import { mockApi } from '../mock'
import { USE_MOCK } from '../config'

/**
 * 获取用户列表
 */
export async function fetchUserList(): Promise<UserListResponse> {
  if (USE_MOCK) {
    return mockApi.fetchUserList()
  }

  const { data, error } = await useFetch('/api/users').json<UserListResponse>()

  if (error.value) {
    return {
      success: false,
      message: error.value.message || '获取用户列表失败'
    }
  }

  return data.value!
}

/**
 * 获取单个用户
 */
export async function fetchUser(id: number): Promise<FetchUserResponse> {
  if (USE_MOCK) {
    return mockApi.fetchUser(id)
  }

  const { data, error } = await useFetch(`/api/users/${id}`).json<FetchUserResponse>()

  if (error.value) {
    return {
      success: false,
      message: error.value.message || '获取用户失败'
    }
  }

  return data.value!
}

/**
 * 创建用户
 */
export async function createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
  if (USE_MOCK) {
    return mockApi.createUser(request)
  }

  const { data, error } = await useFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(request)
  }).json<CreateUserResponse>()

  if (error.value) {
    return {
      success: false,
      message: error.value.message || '创建用户失败'
    }
  }

  return data.value!
}

/**
 * 更新用户
 */
export async function updateUser(id: number, request: UpdateUserRequest): Promise<UpdateUserResponse> {
  if (USE_MOCK) {
    return mockApi.updateUser(id, request)
  }

  const { data, error } = await useFetch(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request)
  }).json<UpdateUserResponse>()

  if (error.value) {
    return {
      success: false,
      message: error.value.message || '更新用户失败'
    }
  }

  return data.value!
}

/**
 * 删除用户
 */
export async function deleteUser(id: number): Promise<DeleteUserResponse> {
  if (USE_MOCK) {
    return mockApi.deleteUser(id)
  }

  const { data, error } = await useFetch(`/api/users/${id}`, {
    method: 'DELETE'
  }).json<DeleteUserResponse>()

  if (error.value) {
    return {
      success: false,
      message: error.value.message || '删除用户失败'
    }
  }

  return data.value!
}