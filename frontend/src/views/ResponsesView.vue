<template>
  <AppLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Campaign Responses</h1>
          <p v-if="campaign" class="mt-1 text-sm text-gray-400">{{ campaign.name }}</p>
        </div>
        <router-link to="/campaigns">
          <AppButton variant="ghost">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Campaigns
          </AppButton>
        </router-link>
      </div>

      <AppCard>
        <div v-if="loading" class="text-center py-12 text-gray-400">
          Loading responses...
        </div>

        <div v-else-if="responses.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-gray-400">No responses yet</p>
        </div>

        <AppTable
          v-else
          :columns="[
            { key: 'id', label: 'Response ID' },
            { key: 'respondent', label: 'Respondent' },
            { key: 'duration', label: 'Time (s)' },
            { key: 'createdAt', label: 'Submitted' },
          ]"
          :data="responses"
        >
          <template #cell-id="{ row }">
            <span class="font-mono text-sm text-gray-300">
              {{ row.id.substring(0, 8) }}...
            </span>
          </template>

          <template #cell-respondent="{ row }">
            <span class="text-gray-300">
              {{ row.user?.email || row.anonymousId || 'Anonymous' }}
            </span>
          </template>

          <template #cell-duration="{ row }">
            <span class="text-gray-300">{{ row.completionTimeSeconds ?? '—' }}</span>
          </template>

          <template #cell-createdAt="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>

          <template #actions="{ row }">
            <button
              @click="viewResponse(row)"
              class="text-sm text-primary-400 hover:text-primary-300"
            >
              View Details
            </button>
          </template>
        </AppTable>
      </AppCard>
    </div>

    <!-- Response detail modal -->
    <div
      v-if="selectedResponse"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      @click.self="selectedResponse = null"
    >
      <AppCard class="max-w-4xl w-full my-8">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white">Response Details</h3>
            <button
              @click="selectedResponse = null"
              class="text-gray-400 hover:text-white"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </template>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4 pb-4 border-b border-dark-700">
            <div>
              <p class="text-sm text-gray-400">Response ID</p>
              <p class="text-white font-mono text-sm mt-1">{{ selectedResponse.id }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-400">Respondent</p>
              <p class="text-white mt-1">{{ selectedResponse.user?.email || selectedResponse.anonymousId || 'Anonymous' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-400">Started</p>
              <p class="text-white mt-1">{{ formatDate(selectedResponse.startedAt) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-400">Submitted</p>
              <p class="text-white mt-1">{{ formatDate(selectedResponse.completedAt || selectedResponse.createdAt) }}</p>
            </div>
          </div>

          <div>
            <h4 class="text-white font-medium mb-4">Answers</h4>
            <div v-if="selectedResponse.items.length === 0" class="text-center py-8 text-gray-400">
              No answers submitted yet
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="item in selectedResponse.items"
                :key="item.id"
                class="p-4 bg-dark-900 rounded-lg"
              >
                <p class="text-white font-medium mb-2">{{ item.question?.text }}</p>
                <p class="text-sm text-gray-400 mb-2">Type: {{ item.question?.type }}</p>
                <p class="text-gray-300 break-words">{{ formatValue(item.value) }}</p>
              </div>
            </div>
          </div>
        </div>
      </AppCard>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import AppCard from '@/components/AppCard.vue'
import AppButton from '@/components/AppButton.vue'
import AppTable from '@/components/AppTable.vue'
import AppTag from '@/components/AppTag.vue'
import { responseService, campaignService } from '@/services/api'
import type { Response, Campaign } from '@/types'

const route = useRoute()
const campaignId = route.params.campaignId as string

const campaign = ref<Campaign | null>(null)
const responses = ref<Response[]>([])
const selectedResponse = ref<Response | null>(null)
const loading = ref(true)

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const viewResponse = (response: Response) => {
  selectedResponse.value = response
}

const formatValue = (val: any) => {
  if (Array.isArray(val)) return val.join(', ')
  if (val === null || val === undefined) return '—'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

const loadData = async () => {
  try {
    loading.value = true
    
    // Load campaign details
    const campaignResponse = await campaignService.getOne(campaignId)
    campaign.value = campaignResponse.data
    
    // Load responses
    const responsesData = await responseService.getByCampaign(campaignId)
    responses.value = responsesData.data
  } catch (error) {
    console.error('Failed to load responses:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
