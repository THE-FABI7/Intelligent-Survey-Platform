<template>
  <div :class="cardClasses">
    <div v-if="$slots.header || title" class="px-6 py-4 border-b border-dark-700">
      <slot name="header">
        <h3 class="text-lg font-semibold text-gray-100">{{ title }}</h3>
      </slot>
    </div>
    <div class="p-6">
      <slot />
    </div>
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-dark-700 bg-dark-900">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  padding?: boolean
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  padding: true,
  hover: false,
})

const cardClasses = computed(() => {
  const base = 'bg-dark-800 rounded-lg border border-dark-700'
  const hoverClass = props.hover ? 'hover:border-dark-600 transition-colors' : ''
  return `${base} ${hoverClass}`
})
</script>
