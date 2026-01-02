<template>
  <AppLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Analytics Overview</h1>
          <p class="mt-1 text-sm text-gray-400">Select a campaign to view detailed analytics</p>
        </div>
      </div>

      <AppCard>
        <div v-if="loading" class="text-center py-12 text-gray-400">
          Loading campaigns...
        </div>

        <div v-else-if="campaigns.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <p class="text-gray-400">No campaigns available for analytics</p>
        </div>

        <AppTable
          v-else
          :columns="[
            { key: 'name', label: 'Campaign Name' },
            { key: 'status', label: 'Status' },
            { key: 'responses', label: 'Responses' },
          ]"
          :data="campaigns"
        >
          <template #cell-name="{ row }">
            <span class="text-white font-medium">{{ row.name }}</span>
          </template>

          <template #cell-status="{ row }">
            <AppTag :status="row.status" />
          </template>

          <template #cell-responses="{ row }">
            <span class="text-gray-300">{{ row.responsesCount || 0 }}</span>
          </template>

          <template #actions="{ row }">
            <router-link
              :to="`/analytics/${row.id}`"
              class="text-sm text-primary-400 hover:text-primary-300"
            >
              View Analytics
            </router-link>
          </template>
        </AppTable>
      </AppCard>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import AppCard from '@/components/AppCard.vue'
import AppTable from '@/components/AppTable.vue'
import AppTag from '@/components/AppTag.vue'
import { campaignService } from '@/services/api'
import type { Campaign } from '@/types'

const campaigns = ref<Campaign[]>([])
const loading = ref(true)

const loadCampaigns = async () => {
  try {
    loading.value = true
    const response = await campaignService.getAll()
    // Only show published or closed campaigns with responses
    campaigns.value = response.filter((c: Campaign) => 
      (c.status === 'PUBLISHED' || c.status === 'CLOSED') && (c.responsesCount || 0) > 0
    )
  } catch (error) {
    console.error('Failed to load campaigns:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCampaigns()
})
</script>
