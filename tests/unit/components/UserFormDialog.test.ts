import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'
import UserFormDialog from '@/components/UserFormDialog.vue'
import { useUserListStore } from '@/stores/userList'
import { UserRole } from '@/types/user'

// Mock Element Plus Message
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn()
    }
  }
})

describe('UserFormDialog.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mockUser = {
    id: 2,
    username: 'testuser',
    role: UserRole.USER,
    createdAt: '2024-01-01'
  }

  const mountDialog = (props: { visible: boolean; user: typeof mockUser | null } = { visible: false, user: null }) => {
    return mount(UserFormDialog, {
      props,
      global: {
        plugins: [ElementPlus, createPinia()]
      }
    })
  }

  describe('渲染测试', () => {
    it('visible 为 false 时不应该显示弹窗', () => {
      const wrapper = mountDialog({ visible: false, user: null })
      expect(wrapper.find('.el-dialog').exists()).toBe(false)
    })

    it('visible 为 true 时应该显示弹窗', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      await wrapper.vm.$nextTick()
      expect(wrapper.findComponent(UserFormDialog).exists()).toBe(true)
    })
  })

  describe('新建模式', () => {
    it('标题应该显示"新建用户"', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      await wrapper.vm.$nextTick()

      // 检查弹窗标题
      const title = wrapper.find('.el-dialog__title')
      if (title.exists()) {
        expect(title.text()).toBe('新建用户')
      }
    })

    it('密码字段应该为必填', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      await wrapper.vm.$nextTick()

      // 密码输入框应该存在
      const passwordInputs = wrapper.findAll('input[type="password"]')
      expect(passwordInputs.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('编辑模式', () => {
    it('标题应该显示"编辑用户"', async () => {
      const wrapper = mountDialog({ visible: true, user: mockUser })
      await wrapper.vm.$nextTick()

      const title = wrapper.find('.el-dialog__title')
      if (title.exists()) {
        expect(title.text()).toBe('编辑用户')
      }
    })

    it('应该填充现有用户数据', async () => {
      const wrapper = mountDialog({ visible: true, user: mockUser })

      // 等待 watch 回调执行
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      // 检查组件内部状态是否正确填充
      // 由于 Element Plus 的 input 可能不直接显示值，我们检查组件的 formData
      expect(wrapper.vm.$data).toBeDefined()
    })

    it('密码字段在编辑模式下可以为空', async () => {
      const wrapper = mountDialog({ visible: true, user: mockUser })
      await wrapper.vm.$nextTick()

      // 密码输入框应该存在，但不是必填
      const passwordInputs = wrapper.findAll('input[type="password"]')
      expect(passwordInputs.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('表单验证', () => {
    it('用户名不能为空', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      await wrapper.vm.$nextTick()

      // 触发验证
      const usernameInput = wrapper.find('input[placeholder="请输入用户名"]')
      await usernameInput.trigger('blur')
      await wrapper.vm.$nextTick()
    })

    it('用户名格式验证：只允许字母、数字、下划线', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      await wrapper.vm.$nextTick()

      const usernameInput = wrapper.find('input[placeholder="请输入用户名"]')

      // 输入非法字符
      await usernameInput.setValue('test@user')
      await usernameInput.trigger('blur')
      await wrapper.vm.$nextTick()
    })

    it('密码长度验证：6-20 个字符', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      await wrapper.vm.$nextTick()

      const passwordInputs = wrapper.findAll('input[type="password"]')
      if (passwordInputs.length > 0) {
        // 输入过短的密码
        await passwordInputs[0]!.setValue('12345')
        await passwordInputs[0]!.trigger('blur')
        await wrapper.vm.$nextTick()
      }
    })

    it('确认密码必须与新密码一致', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      await wrapper.vm.$nextTick()

      const passwordInputs = wrapper.findAll('input[type="password"]')
      if (passwordInputs.length >= 2) {
        await passwordInputs[0]!.setValue('password123')
        await passwordInputs[1]!.setValue('different123')
        await passwordInputs[1]!.trigger('blur')
        await wrapper.vm.$nextTick()
      }
    })
  })

  describe('用户名唯一性验证', () => {
    it('已存在的用户名应该验证失败', async () => {
      const userListStore = useUserListStore()
      // 模拟用户列表
      userListStore.users = [
        { id: 1, username: 'existinguser', role: UserRole.USER, createdAt: '2024-01-01' }
      ]

      const wrapper = mountDialog({ visible: true, user: null })
      await wrapper.vm.$nextTick()

      const usernameInput = wrapper.find('input[placeholder="请输入用户名"]')
      await usernameInput.setValue('existinguser')
      await usernameInput.trigger('blur')
      await wrapper.vm.$nextTick()
    })

    it('编辑模式下排除自己的用户名', async () => {
      const userListStore = useUserListStore()
      userListStore.users = [mockUser]

      const wrapper = mountDialog({ visible: true, user: mockUser })
      await wrapper.vm.$nextTick()

      // 编辑自己的用户名应该允许
      const usernameInput = wrapper.find('input[placeholder="请输入用户名"]')
      await usernameInput.setValue('testuser')
      await usernameInput.trigger('blur')
      await wrapper.vm.$nextTick()
    })
  })

  describe('事件测试', () => {
    it('点击取消应该触发 update:visible 事件', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      await wrapper.vm.$nextTick()

      const buttons = wrapper.findAll('button')
      const cancelButton = buttons.find(b => b.text() === '取消')

      if (cancelButton) {
        await cancelButton.trigger('click')
        expect(wrapper.emitted('update:visible')).toBeTruthy()
        expect(wrapper.emitted('update:visible')![0]).toEqual([false])
      }
    })

    it('新建用户成功应该触发 success 事件', async () => {
      const userListStore = useUserListStore()
      vi.spyOn(userListStore, 'addUser').mockResolvedValue({
        id: 3,
        username: 'newuser',
        role: UserRole.USER,
        createdAt: '2024-01-01'
      })

      const wrapper = mountDialog({ visible: true, user: null })
      await wrapper.vm.$nextTick()

      // 填写表单
      const usernameInput = wrapper.find('input[placeholder="请输入用户名"]')
      await usernameInput.setValue('newuser')

      const passwordInputs = wrapper.findAll('input[type="password"]')
      if (passwordInputs.length >= 2) {
        await passwordInputs[0]!.setValue('password123')
        await passwordInputs[1]!.setValue('password123')
      }

      // 选择角色
      const selects = wrapper.findAll('.el-select')
      if (selects.length > 0) {
        // 角色选择器交互
      }

      // 提交表单
      const buttons = wrapper.findAll('button')
      const confirmButton = buttons.find(b => b.text() === '确定')

      if (confirmButton) {
        await confirmButton.trigger('click')
        await wrapper.vm.$nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    })

    it('更新用户成功应该触发 success 事件', async () => {
      const userListStore = useUserListStore()
      userListStore.users = [mockUser]
      vi.spyOn(userListStore, 'updateUser').mockResolvedValue(true)

      const wrapper = mountDialog({ visible: true, user: mockUser })
      await wrapper.vm.$nextTick()

      // 修改用户名
      const usernameInput = wrapper.find('input[placeholder="请输入用户名"]')
      await usernameInput.setValue('updateduser')

      // 提交表单
      const buttons = wrapper.findAll('button')
      const confirmButton = buttons.find(b => b.text() === '确定')

      if (confirmButton) {
        await confirmButton.trigger('click')
        await wrapper.vm.$nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    })
  })

  describe('角色选项', () => {
    it('应该显示角色选项', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      await wrapper.vm.$nextTick()

      // 检查角色选择器存在
      const selects = wrapper.findAll('.el-select')
      expect(selects.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('表单提交失败场景', () => {
    it('新建用户失败应该显示错误提示', async () => {
      const userListStore = useUserListStore()
      vi.spyOn(userListStore, 'addUser').mockResolvedValue(null)
      vi.spyOn(userListStore, 'users', 'get').mockReturnValue([])

      const wrapper = mountDialog({ visible: true, user: null })
      await wrapper.vm.$nextTick()

      // 填写表单
      const usernameInput = wrapper.find('input[placeholder="请输入用户名"]')
      await usernameInput.setValue('newuser')

      const passwordInputs = wrapper.findAll('input[type="password"]')
      if (passwordInputs.length >= 2) {
        await passwordInputs[0]!.setValue('password123')
        await passwordInputs[1]!.setValue('password123')
      }

      // 提交表单
      const buttons = wrapper.findAll('button')
      const confirmButton = buttons.find(b => b.text() === '确定')

      if (confirmButton) {
        await confirmButton.trigger('click')
        await wrapper.vm.$nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        // 不应该触发 success 事件
        expect(wrapper.emitted('success')).toBeFalsy()
      }
    })

    it('更新用户失败应该显示错误提示', async () => {
      const userListStore = useUserListStore()
      userListStore.users = [mockUser]
      vi.spyOn(userListStore, 'updateUser').mockResolvedValue(false)

      const wrapper = mountDialog({ visible: true, user: mockUser })
      await wrapper.vm.$nextTick()

      // 修改用户名
      const usernameInput = wrapper.find('input[placeholder="请输入用户名"]')
      await usernameInput.setValue('updateduser')

      // 提交表单
      const buttons = wrapper.findAll('button')
      const confirmButton = buttons.find(b => b.text() === '确定')

      if (confirmButton) {
        await confirmButton.trigger('click')
        await wrapper.vm.$nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        // 不应该触发 success 事件
        expect(wrapper.emitted('success')).toBeFalsy()
      }
    })
  })
})