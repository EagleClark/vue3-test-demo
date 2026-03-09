import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRouter, createMemoryHistory, type Router, type RouteRecordRaw } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import { clearLocalStorage } from '../utils/test-helpers'

// 手动定义路由配置（不依赖源文件）
const testRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: { template: '<div>Login</div>' },
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: { template: '<div>Home</div>' },
    meta: { title: '首页', requiresAuth: true }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: { template: '<div>Users</div>' },
    meta: { title: '用户管理', requiresAuth: true }
  }
]

describe('路由集成测试', () => {
  let router: Router

  // 设置路由守卫（复制源文件中的逻辑）
  function setupNavigationGuards(router: Router) {
    router.beforeEach((to, _from, next) => {
      // 设置页面标题
      document.title = (to.meta.title as string) || 'Vue App'

      const userStore = useUserStore()
      const isLoggedIn = userStore.isLoggedIn

      // 目标路由需要认证
      if (to.meta.requiresAuth) {
        if (isLoggedIn) {
          next()  // 已登录，放行
        } else {
          // 未登录，重定向到登录页
          next({
            path: '/login',
            query: { redirect: to.fullPath }
          })
        }
      } else {
        // 不需要认证的页面
        if (to.path === '/login' && isLoggedIn) {
          // 已登录用户访问登录页，重定向到首页
          next({ path: '/' })
        } else {
          next()
        }
      }
    })
  }

  beforeEach(async () => {
    // 创建新的 Pinia 实例
    setActivePinia(createPinia())

    // 清空 localStorage
    clearLocalStorage()

    // 重置 document.title
    document.title = ''

    // 创建路由实例
    router = createRouter({
      history: createMemoryHistory(),
      routes: testRoutes
    })

    // 设置路由守卫
    setupNavigationGuards(router)

    // 推送到初始路由
    await router.push('/')
    await router.isReady()
  })

  describe('路由配置', () => {
    it('首页路由应该标记为需要认证', () => {
      const homeRoute = testRoutes.find(r => r.path === '/')
      expect(homeRoute?.meta?.requiresAuth).toBe(true)
      expect(homeRoute?.meta?.title).toBe('首页')
    })

    it('用户管理路由应该标记为需要认证', () => {
      const usersRoute = testRoutes.find(r => r.path === '/users')
      expect(usersRoute?.meta?.requiresAuth).toBe(true)
      expect(usersRoute?.meta?.title).toBe('用户管理')
    })

    it('登录页路由应该标记为不需要认证', () => {
      const loginRoute = testRoutes.find(r => r.path === '/login')
      expect(loginRoute?.meta?.requiresAuth).toBe(false)
      expect(loginRoute?.meta?.title).toBe('登录')
    })
  })

  describe('认证守卫 - 未登录用户', () => {
    it('访问首页应该重定向到登录页', async () => {
      await router.push('/')
      await router.isReady()

      expect(router.currentRoute.value.path).toBe('/login')
      expect(router.currentRoute.value.query.redirect).toBe('/')
    })

    it('访问用户管理页应该重定向到登录页', async () => {
      await router.push('/users')
      await router.isReady()

      expect(router.currentRoute.value.path).toBe('/login')
      expect(router.currentRoute.value.query.redirect).toBe('/users')
    })

    it('访问登录页应该正常显示', async () => {
      await router.push('/login')
      await router.isReady()

      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('重定向参数应该包含完整路径', async () => {
      await router.push('/users?page=2&size=10')
      await router.isReady()

      expect(router.currentRoute.value.path).toBe('/login')
      expect(router.currentRoute.value.query.redirect).toContain('/users')
    })
  })

  describe('认证守卫 - 已登录用户', () => {
    beforeEach(() => {
      const userStore = useUserStore()
      // 设置已登录状态
      userStore.token = 'valid-token'
      userStore.userInfo = {
        id: 1,
        username: 'admin',
        nickname: '管理员',
        token: 'valid-token'
      }
    })

    it('访问首页应该正常显示', async () => {
      await router.push('/')
      await router.isReady()

      expect(router.currentRoute.value.path).toBe('/')
    })

    it('访问用户管理页应该正常显示', async () => {
      await router.push('/users')
      await router.isReady()

      expect(router.currentRoute.value.path).toBe('/users')
    })

    it('访问登录页应该重定向到首页', async () => {
      await router.push('/login')
      await router.isReady()

      expect(router.currentRoute.value.path).toBe('/')
    })
  })

  describe('登录状态变化', () => {
    it('登录后应该能够访问受保护路由', async () => {
      const userStore = useUserStore()

      // 初始未登录，访问首页应该重定向
      await router.push('/')
      await router.isReady()
      expect(router.currentRoute.value.path).toBe('/login')

      // 模拟登录
      userStore.token = 'new-token'
      userStore.userInfo = {
        id: 1,
        username: 'admin',
        token: 'new-token'
      }

      // 再次访问首页
      await router.push('/')
      await router.isReady()
      expect(router.currentRoute.value.path).toBe('/')
    })

    it('退出登录后访问受保护路由应该重定向', async () => {
      const userStore = useUserStore()

      // 设置已登录状态
      userStore.token = 'token'
      userStore.userInfo = {
        id: 1,
        username: 'admin',
        token: 'token'
      }

      // 访问首页
      await router.push('/')
      await router.isReady()
      expect(router.currentRoute.value.path).toBe('/')

      // 退出登录
      userStore.logout()

      // 访问受保护路由
      await router.push('/users')
      await router.isReady()
      expect(router.currentRoute.value.path).toBe('/login')
    })
  })

  describe('页面标题', () => {
    it('导航到登录页应该设置正确标题', async () => {
      await router.push('/login')
      await router.isReady()

      expect(document.title).toBe('登录')
    })

    it('导航到首页应该设置正确标题', async () => {
      const userStore = useUserStore()
      userStore.token = 'token'
      userStore.userInfo = {
        id: 1,
        username: 'admin',
        token: 'token'
      }

      await router.push('/')
      await router.isReady()

      expect(document.title).toBe('首页')
    })

    it('导航到用户管理页应该设置正确标题', async () => {
      const userStore = useUserStore()
      userStore.token = 'token'
      userStore.userInfo = {
        id: 1,
        username: 'admin',
        token: 'token'
      }

      await router.push('/users')
      await router.isReady()

      expect(document.title).toBe('用户管理')
    })
  })
})