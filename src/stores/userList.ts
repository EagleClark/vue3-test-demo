import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserListItem, UserFormData } from '@/types/user'
import { UserRole } from '@/types/user'

// 模拟初始用户数据
const initialUsers: UserListItem[] = [
  {
    id: 1,
    username: 'admin',
    role: UserRole.ADMIN,
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 2,
    username: 'user1',
    role: UserRole.USER,
    createdAt: '2024-01-15 10:30:00'
  },
  {
    id: 3,
    username: 'user2',
    role: UserRole.USER,
    createdAt: '2024-02-01 14:20:00'
  }
]

export const useUserListStore = defineStore('userList', () => {
  // State
  const users = ref<UserListItem[]>([...initialUsers])
  const nextId = ref(4)

  // Getters
  const userCount = computed(() => users.value.length)

  // Actions
  function getUserById(id: number): UserListItem | undefined {
    return users.value.find(u => u.id === id)
  }

  function addUser(data: Omit<UserFormData, 'id' | 'confirmPassword'>): UserListItem {
    const newUser: UserListItem = {
      id: nextId.value++,
      username: data.username,
      role: data.role,
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-')
    }
    users.value.push(newUser)
    return newUser
  }

  function updateUser(id: number, data: Partial<Omit<UserFormData, 'id' | 'password' | 'confirmPassword'>>): boolean {
    const index = users.value.findIndex(u => u.id === id)
    if (index === -1) return false

    // 不能修改 admin 用户的角色
    const currentUser = users.value[index]
    if (currentUser!.username === 'admin' && data.role && data.role !== UserRole.ADMIN) {
      return false
    }

    users.value[index] = {
      id: currentUser!.id,
      username: data.username ?? currentUser!.username,
      role: data.role ?? currentUser!.role,
      createdAt: currentUser!.createdAt
    }
    return true
  }

  function deleteUser(id: number): boolean {
    const index = users.value.findIndex(u => u.id === id)
    if (index === -1) return false

    // 不能删除 admin 用户
    const currentUser = users.value[index]
    if (currentUser!.username === 'admin') return false

    users.value.splice(index, 1)
    return true
  }

  function isSuperAdmin(id: number): boolean {
    const user = users.value.find(u => u.id === id)
    return user?.username === 'admin'
  }

  return {
    // State
    users,
    // Getters
    userCount,
    // Actions
    getUserById,
    addUser,
    updateUser,
    deleteUser,
    isSuperAdmin
  }
})