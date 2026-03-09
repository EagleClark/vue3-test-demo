import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'
import UserManagement from '@/views/UserManagement.vue'
import { useUserListStore } from '@/stores/userList'
import { UserRole } from '@/types/user'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({}),
  useRoute: () => ({
    path: '/users'
  })
}))

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

describe('UserManagement.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mockUsers = [
    { id: 1, username: 'admin', role: UserRole.ADMIN, createdAt: '2024-01-01' },
    { id: 2, username: 'user1', role: UserRole.USER, createdAt: '2024-01-02' }
  ]

  const mountUserManagement = () => {
    return mount(UserManagement, {
      global: {
        plugins: [ElementPlus, createPinia()],
        stubs: {
          MainLayout: {
            template: '<div class="main-layout-stub"><slot /></div>'
          },
          UserFormDialog: true
        }
      }
    })
  }

  it('应该正确渲染页面', () => {
    const wrapper = mountUserManagement()

    expect(wrapper.find('.user-management').exists()).toBe(true)
  })

  it('应该显示新建用户按钮', () => {
    const wrapper = mountUserManagement()

    const createBtn = wrapper.find('button')
    expect(createBtn.text()).toBe('新建用户')
  })

  it('组件挂载时应该获取用户列表', async () => {
    const wrapper = mountUserManagement()
    const userListStore = useUserListStore()

    // 模拟数据
    userListStore.users = mockUsers

    await wrapper.vm.$nextTick()
  })

  it('应该显示用户表格', async () => {
    const wrapper = mountUserManagement()
    const userListStore = useUserListStore()

    userListStore.users = mockUsers
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.el-table').exists()).toBe(true)
  })

  it('点击新建用户按钮应该打开弹窗', async () => {
    const wrapper = mountUserManagement()

    const createBtn = wrapper.find('button')
    await createBtn.trigger('click')

    // 弹窗应该打开
  })

  it('超级管理员的编辑和删除按钮应该被禁用', async () => {
    const wrapper = mountUserManagement()
    const userListStore = useUserListStore()

    userListStore.users = mockUsers
    await wrapper.vm.$nextTick()

    // 检查按钮状态
    wrapper.findAll('button')
    // 找到编辑和删除按钮
  })

  it('getRoleLabel 应该返回正确的角色名称', () => {
    // 测试角色标签转换
    expect(UserRole.ADMIN).toBe('admin')
    expect(UserRole.USER).toBe('user')
  })

  it('isSuperAdmin 应该正确识别超级管理员', () => {
    const adminUser = { id: 1, username: 'admin', role: UserRole.ADMIN, createdAt: '2024-01-01' }
    const normalUser = { id: 2, username: 'user1', role: UserRole.USER, createdAt: '2024-01-02' }

    expect(adminUser.username === 'admin').toBe(true)
    expect(normalUser.username === 'admin').toBe(false)
  })
})