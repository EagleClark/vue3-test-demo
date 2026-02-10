<script setup lang="ts">
import { ref } from 'vue'
import { calculateTax } from '@/utils/taxCalculator'

const input = ref('')
const tax = ref(0)

const onInputChange = (val: string) => {
  try {
    tax.value = calculateTax(val)
  } catch (e) {
    console.error(e)
    tax.value = 0
  }
}
</script>

<template>
  <div class="calculate">
    <el-input
      v-model="input"
      style="width: 600px"
      placeholder="Please input"
      :formatter="(value: string) => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
      :parser="(value: string) => value.replace(/\￥\s?|(,*)/g, '')"
      @change="onInputChange"
    >
      <template #prepend>输入月收入计算个税</template>
    </el-input>
    <p>个税（￥）：{{ tax }}</p>
  </div>
</template>

<style scoped>
.calculate {
  padding: 24px;
}
</style>
