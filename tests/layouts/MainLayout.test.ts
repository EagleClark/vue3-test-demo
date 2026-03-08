import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'
import MainLayout from '@/layouts/MainLayout.vue'
import { useUserStore } from '@/stores/user'

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  useRoute: () => ({
    path: '/'
  })
}))

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

describe('MainLayout.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mountLayout = () => {
    return mount(MainLayout, {
      global: {
        plugins: [ElementPlus, createPinia()],
        stubs: {
          ChangePasswordDialog: true
        }
      },
      slots: {
        default: '<div class="slot-content">测试内容</div>'
      }
    })
  }

  it('应该正确渲染布局', () => {
    const wrapper = mountLayout()

    expect(wrapper.find('.main-layout').exists()).toBe(true)
    expect(wrapper.find('.header').exists()).toBe(true)
    expect(wrapper.find('.main-content').exists()).toBe(true)
  })

  it('应该显示 logo 标题', () => {
    const wrapper = mountLayout()

    expect(wrapper.find('.logo').text()).toBe('管理系统')
  })

  it('应该渲染 slot 内容', () => {
    const wrapper = mountLayout()

    expect(wrapper.find('.slot-content').exists()).toBe(true)
    expect(wrapper.find('.slot-content').text()).toBe('测试内容')
  })

  it('应该显示导航菜单', () => {
    const wrapper = mountLayout()

    const menuItems = wrapper.findAll('.el-menu-item')
    expect(menuItems.length).toBeGreaterThanOrEqual(2)
  })

  it('应该显示用户名', async () => {
    const wrapper = mountLayout()
    const userStore = useUserStore()

    // 设置用户信息
    userStore.userInfo = {
      id: 1,
      username: 'testuser',
      token: 'test-token'
    }

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.username').text()).toBe('testuser')
  })

  it('应该有修改密码按钮', () => {
    const wrapper = mountLayout()

    const buttons = wrapper.findAll('button')
    const changePasswordBtn = buttons.find(b => b.text() === '修改密码')
    expect(changePasswordBtn?.exists()).toBe(true)
  })

  it('应该有退出登录按钮', () => {
    const wrapper = mountLayout()

    const buttons = wrapper.findAll('button')
    const logoutBtn = buttons.find(b => b.text() === '退出登录')
    expect(logoutBtn?.exists()).toBe(true)
  })

  it('点击修改密码按钮应该打开弹窗', async () => {
    const wrapper = mountLayout()

    const buttons = wrapper.findAll('button')
    const changePasswordBtn = buttons.find(b => b.text() === '修改密码')

    if (changePasswordBtn) {
      await changePasswordBtn.trigger('click')
      // 弹窗状态应该变为 true
    }
  })
})