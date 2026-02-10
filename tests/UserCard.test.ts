// UserCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserCard from '../src/components/UserCard.vue'

describe('UserCard.vue', () => {
  // 1. 基础渲染测试
  it('应该正确渲染组件的基础结构', () => {
    const wrapper = mount(UserCard, {
      props: {
        name: '测试用户',
        status: 'online'
      }
    })
    // 验证类名是否存在
    expect(wrapper.find('.status').exists()).toBe(true)
    expect(wrapper.find('.name').exists()).toBe(true)
  })
  // 2. Props 姓名(name)测试
  it('应该正确显示 name 属性', () => {
    const wrapper = mount(UserCard, {
      props: {
        name: 'Alice',
        status: 'online'
      }
    })
    expect(wrapper.find('.name').text()).toBe('Alice')
  })
  // 3. 状态逻辑测试 (使用循环简写，覆盖所有情况)
  describe('status 状态逻辑', () => {
    const statusCases = [
      { type: 'online' as const, text: '在线', color: 'green' },
      { type: 'offline' as const, text: '离线', color: 'gray' },
      { type: 'busy' as const, text: '忙碌', color: 'red' },
    ]
    it.each(statusCases)(
      '当 status 为 $type 时，应该显示 "$text" 且颜色为 $color',
      ({ type, text, color }) => {
        const wrapper = mount(UserCard, {
          props: {
            name: 'Bob',
            status: type
          }
        })
        const pEl = wrapper.find('.status')
        // 验证文本包含状态文字
        expect(pEl.text()).toContain(text)
        // 验证行内样式包含颜色
        // 注意：jsdom 可能会将 style 属性格式化，使用 toContain 更稳妥
        expect(pEl.attributes('style')).toContain(`color: ${color}`)
      }
    )
  })
  // 4. 响应式更新测试 (可选)
  it('status 改变之后，样式和文字应该随之更新', async () => {
    const wrapper = mount(UserCard, {
      props: {
        name: ' dynamic',
        status: 'online'
      }
    })
    // 初始状态：在线，绿色
    expect(wrapper.find('.status').text()).toContain('在线')
    expect(wrapper.find('.status').attributes('style')).toContain('green')
    // 改变 props
    await wrapper.setProps({ status: 'busy' })
    // 更新后状态：忙碌，红色
    expect(wrapper.find('.status').text()).toContain('忙碌')
    expect(wrapper.find('.status').attributes('style')).toContain('red')
  })
  // 5. 快照测试 (可选)
  it('快照应该匹配', () => {
    const wrapper = mount(UserCard, {
      props: {
        name: 'SnapshotUser',
        status: 'offline'
      }
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})