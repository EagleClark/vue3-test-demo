<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserListStore } from '@/stores/userList'
import { UserRole, UserRoleLabels } from '@/types/user'
import MainLayout from '@/layouts/MainLayout.vue'
import UserFormDialog from '@/components/UserFormDialog.vue'
import type { UserListItem } from '@/types/user'

const userListStore = useUserListStore()

// 弹窗相关
const dialogVisible = ref(false)
const editingUser = ref<UserListItem | null>(null)

// 打开新建弹窗
function handleCreate() {
  editingUser.value = null
  dialogVisible.value = true
}

// 打开编辑弹窗
function handleEdit(user: UserListItem) {
  editingUser.value = user
  dialogVisible.value = true
}

// 删除用户
async function handleDelete(user: UserListItem) {
  // 检查是否是超级管理员
  if (user.username === 'admin') {
    ElMessage.warning('超级管理员不能删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const success = userListStore.deleteUser(user.id)
    if (success) {
      ElMessage.success('删除成功')
    } else {
      ElMessage.error('删除失败')
    }
  } catch {
    // 用户取消
  }
}

// 弹窗保存成功回调
function handleDialogSuccess() {
  dialogVisible.value = false
}

// 获取角色显示名称
function getRoleLabel(role: UserRole): string {
  return UserRoleLabels[role]
}

// 检查是否是超级管理员
function isSuperAdmin(user: UserListItem): boolean {
  return user.username === 'admin'
}
</script>

<template>
  <MainLayout>
    <div class="user-management">
      <!-- 工具栏 -->
      <div class="toolbar">
        <el-button type="primary" @click="handleCreate">
          新建用户
        </el-button>
      </div>

      <!-- 用户列表 -->
      <el-table :data="userListStore.users" stripe border>
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column label="角色" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === UserRole.ADMIN ? 'danger' : 'info'">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :disabled="isSuperAdmin(row)"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              :disabled="isSuperAdmin(row)"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 用户表单弹窗 -->
      <UserFormDialog
        v-model:visible="dialogVisible"
        :user="editingUser"
        @success="handleDialogSuccess"
      />
    </div>
  </MainLayout>
</template>

<style scoped>
.user-management {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

.toolbar {
  margin-bottom: 16px;
}
</style>