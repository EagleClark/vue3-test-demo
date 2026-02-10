<script setup lang="ts">
import UserCard from './UserCard.vue'
</script>

<template>
  <div class="home">
    <UserCard name="张三" status="online"></UserCard>
    <UserCard name="李四" status="offline"></UserCard>
    <UserCard name="王麻子" status="busy"></UserCard>
  </div>
</template>

<style scoped>
.home {
  width: 100vw;
  padding: 24px;
}
</style>
