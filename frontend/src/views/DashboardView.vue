<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Page header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Dashboard</h1>
          <p class="mt-1 text-sm text-gray-400">Overview of your survey platform</p>
        </div>
      </div>

      <!-- Stats cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AppCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400">Total Surveys</p>
              <p class="mt-2 text-3xl font-bold text-white">{{ stats.totalSurveys }}</p>
            </div>
            <div class="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
        </AppCard>

        <AppCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400">Active Campaigns</p>
              <p class="mt-2 text-3xl font-bold text-white">{{ stats.activeCampaigns }}</p>
            </div>
            <div class="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
              </svg>
            </div>
          </div>
        </AppCard>

        <AppCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400">Total Responses</p>
              <p class="mt-2 text-3xl font-bold text-white">{{ stats.totalResponses }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
          </div>
        </AppCard>

        <AppCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400">Avg Completion Rate</p>
              <p class="mt-2 text-3xl font-bold text-white">{{ stats.avgCompletionRate }}%</p>
            </div>
            <div class="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Recent campaigns -->
      <AppCard>
        <template #header>
          <h3 class="text-lg font-semibold text-white">Recent Campaigns</h3>
        </template>

        <div v-if="loading" class="text-center py-12 text-gray-400">
          Loading...
        </div>

        <div v-else-if="campaigns.length === 0" class="text-center py-12 text-gray-400">
          No campaigns yet
        </div>

        <AppTable
          v-else
          :columns="[
            { key: 'name', label: 'Campaign Name' },
            { key: 'surveyVersion', label: 'Survey' },
            { key: 'status', label: 'Status' },
            { key: 'startDate', label: 'Start Date' },
            { key: 'responses', label: 'Responses' },
          ]"
          :data="campaigns"
        >
          <template #cell-name="{ row }">
            <router-link
              :to="`/campaigns/${row.id}`"
              class="text-primary-400 hover:text-primary-300 font-medium"
            >
              {{ row.name }}
            </router-link>
          </template>

          <template #cell-surveyVersion="{ row }">
            {{ row.surveyVersion.survey.title }} (v{{ row.surveyVersion.versionNumber }})
          </template>

          <template #cell-status="{ row }">
            <AppTag :status="row.status" />
          </template>

          <template #cell-startDate="{ row }">
            {{ formatDate(row.startDate) }}
          </template>

          <template #cell-responses="{ row }">
            {{ row.responsesCount || 0 }}
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

const stats = ref({
  totalSurveys: 0,
  activeCampaigns: 0,
  totalResponses: 0,
  avgCompletionRate: 0,
})

const campaigns = ref<Campaign[]>([])
const loading = ref(true)

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const loadDashboard = async () => {
  try {
    loading.value = true
    const response = await campaignService.getAll()
    campaigns.value = response.slice(0, 5) // Show only 5 recent campaigns

    // Calculate stats
    stats.value.activeCampaigns = response.filter((c: Campaign) => c.status === 'PUBLISHED').length
    stats.value.totalResponses = response.reduce((sum: number, c: Campaign) => sum + (c.responsesCount || 0), 0)
    
    // Get unique surveys count
    const uniqueSurveys = new Set(response.map((c: Campaign) => c.surveyVersion.survey.id))
    stats.value.totalSurveys = uniqueSurveys.size

    // Calculate average completion rate (mock for now)
    stats.value.avgCompletionRate = 73
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboard()
})
</script>
