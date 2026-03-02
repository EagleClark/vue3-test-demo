<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import type { FormInstance, FormRules } from 'element-plus'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const userStore = useUserStore()

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 加载状态
const loading = ref(false)

// 确认密码验证
const validateConfirmPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error('请再次输入新密码'))
    return
  }
  if (value !== formData.newPassword) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  callback()
}

// 表单验证规则
const rules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6-20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 监听弹窗打开
watch(() => props.visible, (val) => {
  if (val) {
    formData.oldPassword = ''
    formData.newPassword = ''
    formData.confirmPassword = ''
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
      const success = await userStore.changePassword(
        formData.oldPassword,
        formData.newPassword
      )

      if (success) {
        ElMessage.success('密码修改成功')
        emit('success')
        emit('update:visible', false)
      } else {
        ElMessage.error('旧密码错误')
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
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="修改密码"
    width="450px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input
          v-model="formData.oldPassword"
          type="password"
          placeholder="请输入旧密码"
          show-password
          maxlength="20"
        />
      </el-form-item>

      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="formData.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password
          maxlength="20"
        />
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
          maxlength="20"
        />
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