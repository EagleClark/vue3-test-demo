<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import ChangePasswordDialog from '@/components/ChangePasswordDialog.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 修改密码弹窗
const changePasswordVisible = ref(false)

// 退出登录
async function handleLogout() {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    userStore.logout()
    router.push('/login')
  } catch {
    // 用户取消
  }
}
</script>

<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <h1 class="logo">管理系统</h1>
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          :ellipsis="false"
          router
          class="nav-menu"
        >
          <el-menu-item index="/">
            首页
          </el-menu-item>
          <el-menu-item index="/users">
            用户管理
          </el-menu-item>
        </el-menu>
      </div>
      <div class="header-right">
        <span class="username">{{ userStore.username }}</span>
        <el-button size="small" @click="changePasswordVisible = true">
          修改密码
        </el-button>
        <el-button type="danger" size="small" @click="handleLogout">
          退出登录
        </el-button>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="main-content">
      <slot></slot>
    </main>

    <!-- 修改密码弹窗 -->
    <ChangePasswordDialog v-model:visible="changePasswordVisible" />
  </div>
</template>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  margin: 0;
  font-size: 20px;
  color: #409eff;
  margin-right: 40px;
}

.nav-menu {
  border-bottom: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  color: #606266;
  font-size: 14px;
}

.main-content {
  flex: 1;
  padding: 20px;
  background: #f5f7fa;
}
</style>