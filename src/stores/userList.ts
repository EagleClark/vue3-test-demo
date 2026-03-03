import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserListItem, UserFormData } from '@/types/user'
import { UserRole } from '@/types/user'
import {
  fetchUserList,
  createUser,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi
} from '@/api'

export const useUserListStore = defineStore('userList', () => {
  // State
  const users = ref<UserListItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const userCount = computed(() => users.value.length)

  // Actions
  async function fetchUsers(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await fetchUserList()

      if (response.success && response.data) {
        users.value = response.data
      } else {
        error.value = response.message
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取用户列表失败'
    } finally {
      loading.value = false
    }
  }

  function getUserById(id: number): UserListItem | undefined {
    return users.value.find(u => u.id === id)
  }

  async function addUser(data: Omit<UserFormData, 'id' | 'confirmPassword'>): Promise<UserListItem | null> {
    loading.value = true
    error.value = null

    try {
      const response = await createUser({
        username: data.username,
        password: data.password,
        role: data.role
      })

      if (response.success && response.data) {
        users.value.push(response.data)
        return response.data
      }

      error.value = response.message
      return null
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建用户失败'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id: number, data: Partial<Omit<UserFormData, 'id' | 'password' | 'confirmPassword'>>): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await updateUserApi(id, {
        username: data.username ?? '',
        role: data.role ?? UserRole.USER
      })

      if (response.success && response.data) {
        const index = users.value.findIndex(u => u.id === id)
        if (index !== -1) {
          users.value[index] = response.data
        }
        return true
      }

      error.value = response.message
      return false
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新用户失败'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(id: number): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await deleteUserApi(id)

      if (response.success) {
        const index = users.value.findIndex(u => u.id === id)
        if (index !== -1) {
          users.value.splice(index, 1)
        }
        return true
      }

      error.value = response.message
      return false
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除用户失败'
      return false
    } finally {
      loading.value = false
    }
  }

  function isSuperAdmin(id: number): boolean {
    const user = users.value.find(u => u.id === id)
    return user?.username === 'admin'
  }

  return {
    // State
    users,
    loading,
    error,
    // Getters
    userCount,
    // Actions
    fetchUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser,
    isSuperAdmin
  }
})