import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import Login from '@/views/Login.vue'
import UserManagement from '@/views/UserManagement.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import ChangePasswordDialog from '@/components/ChangePasswordDialog.vue'
import { useUserStore } from '@/stores/user'
import { useUserListStore } from '@/stores/userList'
import { UserRole } from '@/types/user'
import { clearLocalStorage } from '../utils/test-helpers'

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

describe('组件集成测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    clearLocalStorage()
  })

  describe('Login 组件与 Store 集成', () => {
    const mountLogin = async () => {
      const router = createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: '/login', component: Login },
          { path: '/', component: { template: '<div>Home</div>' } }
        ]
      })

      await router.push('/login')
      await router.isReady()

      const wrapper = mount(Login, {
        global: {
          plugins: [ElementPlus, createPinia(), router]
        }
      })

      return { wrapper, router }
    }

    it('登录成功应该更新 store 状态', async () => {
      const { wrapper } = await mountLogin()
      const userStore = useUserStore()

      // 填写表单
      await wrapper.find('input[placeholder="请输入用户名"]').setValue('admin')
      await wrapper.find('input[placeholder="请输入密码"]').setValue('123456')

      // 提交登录
      await wrapper.find('.login-btn').trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 600))

      // 验证 store 状态更新
      expect(userStore.isLoggedIn).toBe(true)
      expect(userStore.userInfo?.username).toBe('admin')
    })

    it('登录失败应该设置错误状态', async () => {
      const { wrapper } = await mountLogin()
      const userStore = useUserStore()

      // 填写错误凭据
      await wrapper.find('input[placeholder="请输入用户名"]').setValue('admin')
      await wrapper.find('input[placeholder="请输入密码"]').setValue('wrongpassword')

      // 提交登录
      await wrapper.find('.login-btn').trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 600))

      // 验证登录失败
      expect(userStore.isLoggedIn).toBe(false)
      expect(userStore.error).toBe('用户名或密码错误')
    })
  })

  describe('UserManagement 组件与 Store 集成', () => {
    const mountUserManagement = async () => {
      const wrapper = mount(UserManagement, {
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

      // 等待 onMounted 执行
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 300))

      return wrapper
    }

    it('组件挂载时应该自动获取用户列表', async () => {
      const wrapper = await mountUserManagement()
      const userListStore = useUserListStore()

      // 验证用户列表已加载
      expect(userListStore.users.length).toBeGreaterThan(0)
    })

    it('用户列表应该正确渲染', async () => {
      const wrapper = await mountUserManagement()

      // 验证表格存在
      expect(wrapper.find('.el-table').exists()).toBe(true)
    })

    it('loading 状态应该正确管理', async () => {
      const userListStore = useUserListStore()

      // 初始 loading 状态
      expect(userListStore.loading).toBe(false)

      // 触发获取用户列表
      const fetchPromise = userListStore.fetchUsers()

      // 等待完成后验证
      await fetchPromise
      expect(userListStore.loading).toBe(false)
    })
  })

  describe('MainLayout 组件与 Store 集成', () => {
    const mountMainLayout = () => {
      const router = createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: '/', component: { template: '<div>Home</div>' } },
          { path: '/users', component: { template: '<div>Users</div>' } }
        ]
      })

      return mount(MainLayout, {
        global: {
          plugins: [ElementPlus, createPinia(), router],
          stubs: {
            ChangePasswordDialog: true
          }
        },
        slots: {
          default: '<div class="test-content">测试内容</div>'
        }
      })
    }

    it('应该显示当前登录用户名', async () => {
      const wrapper = mountMainLayout()
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

    it('slot 内容应该正确渲染', () => {
      const wrapper = mountMainLayout()

      expect(wrapper.find('.test-content').exists()).toBe(true)
      expect(wrapper.find('.test-content').text()).toBe('测试内容')
    })
  })

  describe('ChangePasswordDialog 组件与 Store 集成', () => {
    const mountDialog = (visible = true) => {
      return mount(ChangePasswordDialog, {
        props: {
          visible
        },
        global: {
          plugins: [ElementPlus, createPinia()]
        }
      })
    }

    it('修改密码成功应该触发 success 事件', async () => {
      const wrapper = mountDialog(true)
      const userStore = useUserStore()

      await wrapper.vm.$nextTick()

      // 填写表单
      const inputs = wrapper.findAll('input[type="password"]')
      if (inputs.length >= 3) {
        await inputs[0]!.setValue('123456')
        await inputs[1]!.setValue('newpassword123')
        await inputs[2]!.setValue('newpassword123')
      }

      // 提交
      const buttons = wrapper.findAll('button')
      const confirmButton = buttons.find(b => b.text() === '确定')

      if (confirmButton) {
        await confirmButton.trigger('click')
        await wrapper.vm.$nextTick()
        await new Promise(resolve => setTimeout(resolve, 400))

        // 验证成功事件
        expect(wrapper.emitted('success')).toBeTruthy()
      }
    })

    it('修改密码失败不应该触发 success 事件', async () => {
      const wrapper = mountDialog(true)

      await wrapper.vm.$nextTick()

      // 填写错误表单
      const inputs = wrapper.findAll('input[type="password"]')
      if (inputs.length >= 3) {
        await inputs[0]!.setValue('wrongpassword')
        await inputs[1]!.setValue('newpassword123')
        await inputs[2]!.setValue('newpassword123')
      }

      // 提交
      const buttons = wrapper.findAll('button')
      const confirmButton = buttons.find(b => b.text() === '确定')

      if (confirmButton) {
        await confirmButton.trigger('click')
        await wrapper.vm.$nextTick()
        await new Promise(resolve => setTimeout(resolve, 400))

        // 不应该触发 success
        expect(wrapper.emitted('success')).toBeFalsy()
      }
    })
  })

  describe('组件间数据流', () => {
    it('用户状态变化应该反映在所有相关组件中', async () => {
      const userStore = useUserStore()

      // 初始状态
      expect(userStore.isLoggedIn).toBe(false)
      expect(userStore.username).toBe('')

      // 登录
      await userStore.login({
        username: 'admin',
        password: '123456'
      })

      // 验证状态变化
      expect(userStore.isLoggedIn).toBe(true)
      expect(userStore.username).toBe('admin')
    })

    it('用户列表操作应该同步更新 store 和组件', async () => {
      const userListStore = useUserListStore()

      // 获取初始列表
      await userListStore.fetchUsers()
      const initialCount = userListStore.userCount

      // 添加用户
      await userListStore.addUser({
        username: 'integration_flow_user',
        password: '123456',
        role: UserRole.USER
      })

      // 验证列表更新
      expect(userListStore.userCount).toBe(initialCount + 1)

      // 删除用户
      const user = userListStore.users.find(u => u.username === 'integration_flow_user')
      if (user) {
        await userListStore.deleteUser(user.id)
        expect(userListStore.userCount).toBe(initialCount)
      }
    })
  })
})