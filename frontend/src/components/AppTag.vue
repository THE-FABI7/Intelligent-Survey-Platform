<template>
  <span :class="tagClasses">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Status = 'CREATED' | 'PUBLISHED' | 'CLOSED' | 'ACTIVE' | 'INACTIVE' | 'SUCCESS' | 'ERROR' | 'WARNING'

interface Props {
  status: Status
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const tagClasses = computed(() => {
  const base = 'inline-flex items-center rounded-full font-medium'
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }
  
  const variants: Record<Status, string> = {
    CREATED: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    PUBLISHED: 'bg-primary-500/10 text-primary-400 border border-primary-500/20',
    CLOSED: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
    ACTIVE: 'bg-primary-500/10 text-primary-400 border border-primary-500/20',
    INACTIVE: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
    SUCCESS: 'bg-primary-500/10 text-primary-400 border border-primary-500/20',
    ERROR: 'bg-red-500/10 text-red-400 border border-red-500/20',
    WARNING: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  }
  
  return `${base} ${sizes[props.size]} ${variants[props.status]}`
})
</script>
