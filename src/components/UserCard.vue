<!-- UserCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name: string
  status: 'online' | 'offline' | 'busy'
}

const props = defineProps<Props>()

const statusColor = computed(() => {
  const colors = {
    online: 'green',
    offline: 'gray',
    busy: 'red'
  }
  return colors[props.status]
})

const statusText = computed(() => {
  const texts = {
    online: '在线',
    offline: '离线',
    busy: '忙碌'
  }
  return texts[props.status]
})
</script>

<template>
  <p :style="{ color: statusColor }" class="status">
    {{ statusText }}:
    <span class="name">{{ name }}</span>
  </p>
</template>