<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Page header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Campaigns</h1>
          <p class="mt-1 text-sm text-gray-400">Manage your survey campaigns</p>
        </div>
        <AppButton variant="primary" @click="showCreateModal = true">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          New Campaign
        </AppButton>
      </div>

      <!-- Filter tabs -->
      <div class="flex items-center gap-2 border-b border-dark-700">
        <button
          v-for="status in ['ALL', 'CREATED', 'PUBLISHED', 'CLOSED']"
          :key="status"
          @click="filterStatus = status"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors',
            filterStatus === status
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-gray-400 hover:text-gray-300'
          ]"
        >
          {{ status }}
        </button>
      </div>

      <!-- Campaigns table -->
      <AppCard>
        <div v-if="loading" class="text-center py-12 text-gray-400">
          Loading campaigns...
        </div>

        <div v-else-if="filteredCampaigns.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
          </svg>
          <p class="text-gray-400 mb-4">No campaigns found</p>
          <AppButton variant="primary" @click="showCreateModal = true">
            Create your first campaign
          </AppButton>
        </div>

        <AppTable
          v-else
          :columns="[
            { key: 'name', label: 'Campaign Name' },
            { key: 'survey', label: 'Survey' },
            { key: 'status', label: 'Status' },
            { key: 'dates', label: 'Period' },
            { key: 'responses', label: 'Responses' },
          ]"
          :data="filteredCampaigns"
        >
          <template #cell-name="{ row }">
            <router-link
              :to="`/campaigns/${row.id}`"
              class="text-primary-400 hover:text-primary-300 font-medium"
            >
              {{ row.name }}
            </router-link>
          </template>

          <template #cell-survey="{ row }">
            {{ row.surveyVersion.survey.title }} (v{{ row.surveyVersion.versionNumber }})
          </template>

          <template #cell-status="{ row }">
            <AppTag :status="row.status" />
          </template>

          <template #cell-dates="{ row }">
            <div class="text-sm text-gray-400">
              {{ formatDate(row.startDate) }}
              <span v-if="row.endDate"> - {{ formatDate(row.endDate) }}</span>
            </div>
          </template>

          <template #cell-responses="{ row }">
            <span class="text-gray-300">{{ row.responsesCount || 0 }}</span>
          </template>

          <template #actions="{ row }">
            <div class="flex items-center gap-3">
              <button
                v-if="row.status === 'CREATED'"
                @click="publishCampaign(row.id)"
                class="text-sm text-green-400 hover:text-green-300"
              >
                Publish
              </button>
              <button
                v-if="row.status === 'PUBLISHED'"
                @click="closeCampaign(row.id)"
                class="text-sm text-orange-400 hover:text-orange-300"
              >
                Close
              </button>
              <router-link
                :to="`/analytics/${row.id}`"
                class="text-sm text-primary-400 hover:text-primary-300"
              >
                Analytics
              </router-link>
              <router-link
                :to="`/responses/${row.id}`"
                class="text-sm text-blue-400 hover:text-blue-300"
              >
                Responses
              </router-link>
              <button
                class="text-sm text-red-400 hover:text-red-300"
                @click="deleteCampaign(row.id)"
              >
                Delete
              </button>
            </div>
          </template>
        </AppTable>
      </AppCard>
    </div>

    <!-- Create campaign modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click.self="showCreateModal = false"
    >
      <AppCard class="max-w-2xl w-full">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white">Create New Campaign</h3>
            <button
              @click="showCreateModal = false"
              class="text-gray-400 hover:text-white"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </template>

        <form @submit.prevent="handleCreateCampaign" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Campaign Name *
            </label>
            <input
              v-model="newCampaign.name"
              type="text"
              required
              class="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Q1 Customer Feedback"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Survey Version *
            </label>
            <select
              v-model="newCampaign.surveyVersionId"
              required
              class="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a survey version...</option>
              <option
                v-for="version in availableVersions"
                :key="version.id"
                :value="version.id"
              >
                {{ version.survey?.title || 'Untitled Survey' }} - v{{ version.versionNumber }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                v-model="newCampaign.startDate"
                type="date"
                required
                class="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                End Date
              </label>
              <input
                v-model="newCampaign.endDate"
                type="date"
                class="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <AppButton
              type="button"
              variant="ghost"
              @click="showCreateModal = false"
            >
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              :loading="creating"
            >
              Create Campaign
            </AppButton>
          </div>
        </form>
      </AppCard>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import AppCard from '@/components/AppCard.vue'
import AppTable from '@/components/AppTable.vue'
import AppButton from '@/components/AppButton.vue'
import AppTag from '@/components/AppTag.vue'
import { campaignService, surveyService } from '@/services/api'
import type { Campaign, SurveyVersion } from '@/types'

const campaigns = ref<Campaign[]>([])
const availableVersions = ref<SurveyVersion[]>([])
const loading = ref(true)
const showCreateModal = ref(false)
const creating = ref(false)
const filterStatus = ref('ALL')

const newCampaign = ref({
  name: '',
  surveyVersionId: '',
  startDate: '',
  endDate: '',
})

const filteredCampaigns = computed(() => {
  if (filterStatus.value === 'ALL') {
    return campaigns.value
  }
  return campaigns.value.filter(c => c.status === filterStatus.value)
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const loadCampaigns = async () => {
  try {
    loading.value = true
    const response = await campaignService.getAll()
    campaigns.value = response
  } catch (error) {
    console.error('Failed to load campaigns:', error)
  } finally {
    loading.value = false
  }
}

const loadSurveyVersions = async () => {
  try {
    const response = await surveyService.getAll()
    // Flatten all versions from all surveys and preserve survey reference
    availableVersions.value = response.flatMap((survey: any) => {
      return (survey.versions || []).map((version: any) => ({
        ...version,
        survey: { id: survey.id, title: survey.title }
      }))
    })
  } catch (error) {
    console.error('Failed to load survey versions:', error)
  }
}

const handleCreateCampaign = async () => {
  try {
    creating.value = true
    await campaignService.create(newCampaign.value)
    
    showCreateModal.value = false
    newCampaign.value = {
      name: '',
      surveyVersionId: '',
      startDate: '',
      endDate: '',
    }
    
    await loadCampaigns()
  } catch (error) {
    console.error('Failed to create campaign:', error)
    alert('Failed to create campaign. Please try again.')
  } finally {
    creating.value = false
  }
}

const publishCampaign = async (id: string) => {
  if (!confirm('Publish this campaign? It will become available to respondents.')) {
    return
  }

  try {
    await campaignService.publish(id)
    await loadCampaigns()
  } catch (error) {
    console.error('Failed to publish campaign:', error)
    alert('Failed to publish campaign. Please try again.')
  }
}

const closeCampaign = async (id: string) => {
  if (!confirm('Close this campaign? No more responses will be accepted.')) {
    return
  }

  try {
    await campaignService.close(id)
    await loadCampaigns()
  } catch (error) {
    console.error('Failed to close campaign:', error)
    alert('Failed to close campaign. Please try again.')
  }
}

const deleteCampaign = async (id: string) => {
  if (!confirm('Delete this campaign? This cannot be undone.')) {
    return
  }

  try {
    await campaignService.delete(id)
    await loadCampaigns()
  } catch (error) {
    console.error('Failed to delete campaign:', error)
    alert('Failed to delete campaign. It might be linked to responses.')
  }
}

onMounted(() => {
  loadCampaigns()
  loadSurveyVersions()
})
</script>
