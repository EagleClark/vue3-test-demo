<script setup lang="ts">
import { ref } from 'vue'

const activeIndex = ref('1')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<template>
  <el-menu
    :router="true"
    :default-active="activeIndex"
    class="el-menu-demo"
    mode="horizontal"
    @select="handleSelect"
  >
    <el-menu-item index="1" route="/">Home</el-menu-item>
    <el-menu-item index="2" route="/form">Form</el-menu-item>
    <el-menu-item index="3" route="/calculate">Calculate</el-menu-item>
  </el-menu>
</template>

<style scoped></style>
