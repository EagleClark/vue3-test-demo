import { createWebHistory, createRouter, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 路由配置
export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false  // 登录页不需要认证
    }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/components/Home.vue'),
    meta: {
      title: '首页',
      requiresAuth: true  // 需要认证
    }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: () => import('@/views/UserManagement.vue'),
    meta: {
      title: '用户管理',
      requiresAuth: true  // 需要认证
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
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
      // 未登录，重定向到登录页，并记录原始目标路径
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

export default router