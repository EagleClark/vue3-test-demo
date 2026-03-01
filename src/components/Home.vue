<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue'
</script>

<template>
  <MainLayout>
    <div class="home-content">
      <h1>欢迎来到管理系统</h1>
      <p>这是一个基于 Vue3 + Element Plus 的管理系统演示项目。</p>
      <div class="features">
        <h3>功能特性：</h3>
        <ul>
          <li>用户登录认证</li>
          <li>用户管理（新增、编辑、删除）</li>
          <li>路由权限控制</li>
          <li>状态管理（Pinia）</li>
        </ul>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.home-content {
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.home-content h1 {
  margin: 0 0 16px;
  color: #303133;
  font-size: 28px;
}

.home-content p {
  color: #606266;
  font-size: 16px;
  margin-bottom: 24px;
}

.features {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.features h3 {
  margin: 0 0 12px;
  color: #303133;
}

.features ul {
  margin: 0;
  padding-left: 20px;
  color: #606266;
}

.features li {
  margin-bottom: 8px;
}
</style>