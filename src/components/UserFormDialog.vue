<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserListStore } from '@/stores/userList'
import { UserRole, UserRoleLabels, type UserListItem, type UserFormData } from '@/types/user'
import type { FormInstance, FormRules } from 'element-plus'

const props = defineProps<{
  visible: boolean
  user: UserListItem | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const userListStore = useUserListStore()

// 表单引用
const formRef = ref<FormInstance>()

// 是否是编辑模式
const isEdit = computed(() => !!props.user)

// 弹窗标题
const dialogTitle = computed(() => isEdit.value ? '编辑用户' : '新建用户')

// 表单数据
const formData = reactive<UserFormData>({
  username: '',
  password: '',
  confirmPassword: '',
  role: UserRole.USER
})

// 加载状态
const loading = ref(false)

// 用户名验证规则
const validateUsername = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error('请输入用户名'))
    return
  }
  if (value.length < 1 || value.length > 32) {
    callback(new Error('用户名长度为 1-32 个字符'))
    return
  }
  // 只允许字母、数字、下划线
  const regex = /^[a-zA-Z0-9_]+$/
  if (!regex.test(value)) {
    callback(new Error('用户名只能包含字母、数字和下划线'))
    return
  }
  // 检查用户名是否已存在（编辑时排除自己）
  const exists = userListStore.users.some(
    u => u.username === value && u.id !== props.user?.id
  )
  if (exists) {
    callback(new Error('用户名已存在'))
    return
  }
  callback()
}

// 确认密码验证
const validateConfirmPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!isEdit.value && !value) {
    callback(new Error('请再次输入密码'))
    return
  }
  if (formData.password && value !== formData.password) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  callback()
}

// 表单验证规则
const rules = computed<FormRules>(() => ({
  username: [
    { required: true, validator: validateUsername, trigger: 'blur' }
  ],
  password: [
    { required: !isEdit.value, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6-20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: !isEdit.value, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}))

// 监听弹窗打开
watch(() => props.visible, (val) => {
  if (val) {
    if (props.user) {
      // 编辑模式：填充数据
      formData.username = props.user.username
      formData.password = ''
      formData.confirmPassword = ''
      formData.role = props.user.role
    } else {
      // 新建模式：重置表单
      formData.username = ''
      formData.password = ''
      formData.confirmPassword = ''
      formData.role = UserRole.USER
    }
    // 清除验证
    setTimeout(() => {
      formRef.value?.clearValidate()
    }, 0)
  }
})

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      if (isEdit.value && props.user) {
        // 编辑用户
        const success = userListStore.updateUser(props.user.id, {
          username: formData.username,
          role: formData.role
        })
        if (success) {
          ElMessage.success('编辑成功')
          emit('success')
          emit('update:visible', false)
        } else {
          ElMessage.error('编辑失败')
        }
      } else {
        // 新建用户
        userListStore.addUser({
          username: formData.username,
          password: formData.password,
          role: formData.role
        })
        ElMessage.success('创建成功')
        emit('success')
        emit('update:visible', false)
      }
    } finally {
      loading.value = false
    }
  })
}

// 关闭弹窗
function handleClose() {
  emit('update:visible', false)
}

// 角色选项
const roleOptions = [
  { value: UserRole.ADMIN, label: UserRoleLabels[UserRole.ADMIN] },
  { value: UserRole.USER, label: UserRoleLabels[UserRole.USER] }
]
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="500px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="formData.username"
          placeholder="请输入用户名"
          maxlength="32"
          clearable
        />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          :placeholder="isEdit ? '不修改请留空' : '请输入密码'"
          show-password
          maxlength="20"
        />
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          :placeholder="isEdit ? '不修改请留空' : '请再次输入密码'"
          show-password
          maxlength="20"
        />
      </el-form-item>

      <el-form-item label="角色" prop="role">
        <el-select v-model="formData.role" placeholder="请选择角色">
          <el-option
            v-for="item in roleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>