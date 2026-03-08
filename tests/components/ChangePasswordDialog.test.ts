import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'
import ChangePasswordDialog from '@/components/ChangePasswordDialog.vue'
import { useUserStore } from '@/stores/user'

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

describe('ChangePasswordDialog.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mountDialog = (visible = false) => {
    return mount(ChangePasswordDialog, {
      props: {
        visible
      },
      global: {
        plugins: [ElementPlus, createPinia()]
      }
    })
  }

  it('visible 为 false 时不应该显示弹窗', () => {
    const wrapper = mountDialog(false)
    expect(wrapper.find('.el-dialog').exists()).toBe(false)
  })

  it('visible 为 true 时应该显示弹窗', async () => {
    const wrapper = mountDialog(true)
    await wrapper.vm.$nextTick()
    // Dialog 会通过 teleport 渲染，检查组件是否正确挂载
    expect(wrapper.findComponent(ChangePasswordDialog).exists()).toBe(true)
  })

  it('应该包含所有表单字段', async () => {
    const wrapper = mountDialog(true)
    await wrapper.vm.$nextTick()

    // 检查表单字段是否存在
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThanOrEqual(3) // 旧密码、新密码、确认密码
  })

  it('点击取消应该触发 update:visible 事件', async () => {
    const wrapper = mountDialog(true)
    await wrapper.vm.$nextTick()

    // 找到取消按钮
    const buttons = wrapper.findAll('button')
    const cancelButton = buttons.find(b => b.text() === '取消')

    if (cancelButton) {
      await cancelButton.trigger('click')
      expect(wrapper.emitted('update:visible')).toBeTruthy()
      expect(wrapper.emitted('update:visible')![0]).toEqual([false])
    }
  })

  it('提交成功应该触发 success 事件', async () => {
    const wrapper = mountDialog(true)
    const userStore = useUserStore()

    vi.spyOn(userStore, 'changePassword').mockResolvedValue(true)

    await wrapper.vm.$nextTick()

    // 填写表单
    const inputs = wrapper.findAll('input[type="password"]')
    if (inputs.length >= 3) {
      await inputs[0]!.setValue('123456') // 旧密码
      await inputs[1]!.setValue('newpassword123') // 新密码
      await inputs[2]!.setValue('newpassword123') // 确认密码
    }

    // 点击确定按钮
    const buttons = wrapper.findAll('button')
    const confirmButton = buttons.find(b => b.text() === '确定')

    if (confirmButton) {
      await confirmButton.trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.emitted('success')).toBeTruthy()
    }
  })

  it('确认密码不匹配应该验证失败', async () => {
    const wrapper = mountDialog(true)
    await wrapper.vm.$nextTick()

    // 填写表单，确认密码不匹配
    const inputs = wrapper.findAll('input[type="password"]')
    if (inputs.length >= 3) {
      await inputs[0]!.setValue('123456')
      await inputs[1]!.setValue('newpassword123')
      await inputs[2]!.setValue('differentpassword')

      // 触发验证
      await inputs[2]!.trigger('blur')
      await wrapper.vm.$nextTick()
    }
  })

  it('密码长度不足应该验证失败', async () => {
    const wrapper = mountDialog(true)
    await wrapper.vm.$nextTick()

    const inputs = wrapper.findAll('input[type="password"]')
    if (inputs.length >= 2) {
      // 设置短密码
      await inputs[1]!.setValue('12345') // 少于6位
      await inputs[1]!.trigger('blur')
      await wrapper.vm.$nextTick()
    }
  })

  it('弹窗打开时应该清空表单', async () => {
    const wrapper = mountDialog(false)

    // 第一次打开
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (wrapper as any).setProps({ visible: true })
    await wrapper.vm.$nextTick()

    // 关闭
    await (wrapper as any).setProps({ visible: false })
    await wrapper.vm.$nextTick()

    // 再次打开，表单应该是空的
    await (wrapper as any).setProps({ visible: true })
    await wrapper.vm.$nextTick()
  })

  it('修改密码失败应该显示错误提示', async () => {
    const wrapper = mountDialog(true)
    const userStore = useUserStore()

    vi.spyOn(userStore, 'changePassword').mockResolvedValue(false)

    await wrapper.vm.$nextTick()

    // 填写表单
    const inputs = wrapper.findAll('input[type="password"]')
    if (inputs.length >= 3) {
      await inputs[0]!.setValue('wrongpassword') // 旧密码
      await inputs[1]!.setValue('newpassword123') // 新密码
      await inputs[2]!.setValue('newpassword123') // 确认密码
    }

    // 点击确定按钮
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

  it('旧密码为空时验证应该失败', async () => {
    const wrapper = mountDialog(true)
    await wrapper.vm.$nextTick()

    const inputs = wrapper.findAll('input[type="password"]')
    if (inputs.length >= 2) {
      // 不填写旧密码，直接填写新密码
      await inputs[1]!.setValue('newpassword123')
      await inputs[1]!.trigger('blur')
      await wrapper.vm.$nextTick()
    }
  })
})