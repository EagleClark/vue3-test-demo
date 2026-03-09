import { createRouter, createMemoryHistory, type Router, type RouteRecordRaw } from 'vue-router'
import { createPinia, setActivePinia, type Pinia } from 'pinia'

/**
 * 等待所有 Promise 完成
 */
export function flushPromises(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * 创建测试用的 Pinia 实例
 */
export function createTestPinia(): Pinia {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/**
 * 创建测试用的路由器
 */
export function createTestRouter(routes?: RouteRecordRaw[]): Router {
  const defaultRoutes: RouteRecordRaw[] = [
    {
      path: '/',
      name: 'Home',
      component: { template: '<div>Home</div>' },
      meta: { title: '首页', requiresAuth: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: { template: '<div>Login</div>' },
      meta: { title: '登录', requiresAuth: false }
    },
    {
      path: '/users',
      name: 'Users',
      component: { template: '<div>Users</div>' },
      meta: { title: '用户管理', requiresAuth: true }
    }
  ]

  return createRouter({
    history: createMemoryHistory(),
    routes: routes || defaultRoutes
  })
}

/**
 * 清空 localStorage
 */
export function clearLocalStorage(): void {
  localStorage.clear()
}

/**
 * 等待指定时间
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}