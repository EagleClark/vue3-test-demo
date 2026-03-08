import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'
import Home from '@/components/Home.vue'

describe('Home.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mountHome = () => {
    return mount(Home, {
      global: {
        plugins: [ElementPlus, createPinia()],
        stubs: {
          MainLayout: {
            template: '<div class="main-layout-stub"><slot /></div>'
          }
        }
      }
    })
  }

  it('应该正确渲染首页', () => {
    const wrapper = mountHome()

    expect(wrapper.find('.home-content').exists()).toBe(true)
  })

  it('应该显示欢迎标题', () => {
    const wrapper = mountHome()

    expect(wrapper.find('h1').text()).toBe('欢迎来到管理系统')
  })

  it('应该显示项目描述', () => {
    const wrapper = mountHome()

    expect(wrapper.find('p').text()).toContain('Vue3 + Element Plus')
  })

  it('应该显示功能特性列表', () => {
    const wrapper = mountHome()

    expect(wrapper.find('.features').exists()).toBe(true)
    expect(wrapper.find('.features h3').text()).toBe('功能特性：')

    const listItems = wrapper.findAll('li')
    expect(listItems.length).toBeGreaterThanOrEqual(4)
  })

  it('应该包含用户登录认证功能', () => {
    const wrapper = mountHome()

    const listItems = wrapper.findAll('li')
    const texts = listItems.map(li => li.text())

    expect(texts).toContain('用户登录认证')
  })

  it('应该包含用户管理功能', () => {
    const wrapper = mountHome()

    const listItems = wrapper.findAll('li')
    const texts = listItems.map(li => li.text())

    expect(texts).toContain('用户管理（新增、编辑、删除）')
  })

  it('应该包含路由权限控制功能', () => {
    const wrapper = mountHome()

    const listItems = wrapper.findAll('li')
    const texts = listItems.map(li => li.text())

    expect(texts).toContain('路由权限控制')
  })

  it('应该包含状态管理功能', () => {
    const wrapper = mountHome()

    const listItems = wrapper.findAll('li')
    const texts = listItems.map(li => li.text())

    expect(texts).toContain('状态管理（Pinia）')
  })
})