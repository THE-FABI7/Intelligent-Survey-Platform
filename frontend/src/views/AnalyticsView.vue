<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Page header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Campaign Analytics</h1>
          <p class="mt-1 text-sm text-gray-400">View performance metrics and insights</p>
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

      <!-- Campaign info -->
      <AppCard v-if="campaign">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-white">{{ campaign.name }}</h2>
            <p class="text-sm text-gray-400 mt-1">
              {{ campaign.surveyVersion.survey.title }} (v{{ campaign.surveyVersion.versionNumber }})
            </p>
          </div>
          <AppTag :status="campaign.status" />
        </div>
      </AppCard>

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-12 text-gray-400">
        Loading analytics...
      </div>

      <!-- Analytics content -->
      <template v-else-if="metrics">
        <!-- Key metrics -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AppCard>
            <div>
              <p class="text-sm text-gray-400">Total Responses</p>
              <p class="mt-2 text-3xl font-bold text-white">{{ metrics.totalResponses }}</p>
            </div>
          </AppCard>

          <AppCard>
            <div>
              <p class="text-sm text-gray-400">Completion Rate</p>
              <p class="mt-2 text-3xl font-bold text-white">{{ metrics.completionRate.toFixed(1) }}%</p>
            </div>
          </AppCard>

          <AppCard>
            <div>
              <p class="text-sm text-gray-400">Avg Time</p>
              <p class="mt-2 text-3xl font-bold text-white">{{ formatTime(metrics.averageCompletionTime) }}</p>
            </div>
          </AppCard>

          <AppCard>
            <div>
              <p class="text-sm text-gray-400">Response Quality</p>
              <p class="mt-2 text-3xl font-bold text-white">
                {{ calculateQuality() }}%
              </p>
            </div>
          </AppCard>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Response trends -->
          <AppCard>
            <template #header>
              <h3 class="text-lg font-semibold text-white">Response Trends</h3>
            </template>
            <div class="h-64 flex items-center justify-center text-gray-400">
              <div class="text-center">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                </svg>
                <p>Chart visualization coming soon</p>
                <p class="text-sm mt-2">Install Chart.js to view trends</p>
              </div>
            </div>
          </AppCard>

          <!-- Completion funnel -->
          <AppCard>
            <template #header>
              <h3 class="text-lg font-semibold text-white">Completion Funnel</h3>
            </template>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-400">Started</span>
                  <span class="text-white font-medium">{{ metrics.totalResponses }}</span>
                </div>
                <div class="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
                  <div class="h-full bg-primary-500" :style="{ width: '100%' }"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-400">In Progress</span>
                  <span class="text-white font-medium">
                    {{ Math.floor(metrics.totalResponses * (1 - metrics.completionRate / 100)) }}
                  </span>
                </div>
                <div class="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-yellow-500" 
                    :style="{ width: `${100 - metrics.completionRate}%` }"
                  ></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-400">Completed</span>
                  <span class="text-white font-medium">
                    {{ Math.floor(metrics.totalResponses * (metrics.completionRate / 100)) }}
                  </span>
                </div>
                <div class="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-green-500" 
                    :style="{ width: `${metrics.completionRate}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </AppCard>
        </div>

        <!-- Question performance -->
        <AppCard>
          <template #header>
            <h3 class="text-lg font-semibold text-white">Question Performance</h3>
          </template>

          <div v-if="metrics.questionMetrics.length === 0" class="text-center py-8 text-gray-400">
            No question metrics available yet
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="question in metrics.questionMetrics"
              :key="question.questionId"
              class="p-4 bg-dark-900 rounded-lg"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <p class="text-white font-medium">{{ question.questionText }}</p>
                  <p class="text-sm text-gray-400 mt-1">
                    Type: {{ question.questionType }}
                  </p>
                </div>
                <span class="text-sm text-gray-400">
                  {{ question.responseCount }} responses
                </span>
              </div>

              <div v-if="question.answerDistribution && Object.keys(question.answerDistribution).length > 0">
                <p class="text-sm text-gray-400 mb-2">Answer Distribution:</p>
                <div class="space-y-2">
                  <div
                    v-for="(count, answer) in question.answerDistribution"
                    :key="answer"
                    class="flex items-center gap-3"
                  >
                    <div class="flex-1">
                      <div class="flex justify-between text-sm mb-1">
                        <span class="text-gray-300">{{ answer }}</span>
                        <span class="text-gray-400">{{ count }} ({{ getPercentage(count, question.responseCount) }}%)</span>
                      </div>
                      <div class="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                        <div 
                          class="h-full bg-primary-500" 
                          :style="{ width: `${getPercentage(count, question.responseCount)}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AppCard>
      </template>

      <!-- Error state -->
      <div v-else class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-gray-400">Failed to load analytics</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import AppCard from '@/components/AppCard.vue'
import AppButton from '@/components/AppButton.vue'
import AppTag from '@/components/AppTag.vue'
import { analyticsService, campaignService } from '@/services/api'
import type { Campaign, CampaignMetrics } from '@/types'

const route = useRoute()
const campaignId = route.params.campaignId as string

const campaign = ref<Campaign | null>(null)
const metrics = ref<CampaignMetrics | null>(null)
const loading = ref(true)

const formatTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

const calculateQuality = () => {
  if (!metrics.value) return 0
  // Simple quality score based on completion rate and response count
  const completionScore = metrics.value.completionRate
  const responseScore = Math.min(metrics.value.totalResponses / 10, 1) * 100
  return Math.round((completionScore + responseScore) / 2)
}

const getPercentage = (count: number, total: number) => {
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}

const loadData = async () => {
  try {
    loading.value = true
    
    // Load campaign details
    const campaignResponse = await campaignService.getOne(campaignId)
    campaign.value = campaignResponse.data
    
    // Load analytics
    const metricsResponse = await analyticsService.getCampaignMetrics(campaignId)
    metrics.value = metricsResponse.data
  } catch (error) {
    console.error('Failed to load analytics:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
