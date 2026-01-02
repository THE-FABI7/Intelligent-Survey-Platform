<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Placeholder views for remaining routes -->
      <AppCard>
        <div class="text-center py-12">
          <h2 class="text-xl font-semibold text-white mb-2">
            {{ title }}
          </h2>
          <p class="text-gray-400">This view is under construction</p>
        </div>
      </AppCard>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import AppCard from '@/components/AppCard.vue'

const route = useRoute()

const title = computed(() => {
  return route.name?.toString() || 'Page'
})
</script>
