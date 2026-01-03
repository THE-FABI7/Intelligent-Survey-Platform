<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Page header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Surveys</h1>
          <p class="mt-1 text-sm text-gray-400">Manage your survey templates</p>
        </div>
        <AppButton variant="primary" @click="showCreateModal = true">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Create Survey
        </AppButton>
      </div>

      <!-- Surveys table -->
      <AppCard>
        <div v-if="loading" class="text-center py-12 text-gray-400">
          Loading surveys...
        </div>

        <div v-else-if="surveys.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-gray-400 mb-4">No surveys yet</p>
          <AppButton variant="primary" @click="showCreateModal = true">
            Create your first survey
          </AppButton>
        </div>

        <AppTable
          v-else
          :columns="[
            { key: 'title', label: 'Survey Title' },
            { key: 'description', label: 'Description' },
            { key: 'versions', label: 'Versions' },
            { key: 'createdAt', label: 'Created' },
          ]"
          :data="surveys"
        >
          <template #cell-title="{ row }">
            <router-link
              :to="`/surveys/${row.id}`"
              class="text-primary-400 hover:text-primary-300 font-medium"
            >
              {{ row.title }}
            </router-link>
          </template>

          <template #cell-description="{ row }">
            <span class="text-gray-400 truncate max-w-md block">
              {{ row.description || 'No description' }}
            </span>
          </template>

          <template #cell-versions="{ row }">
            <span class="text-gray-300">{{ row.versionsCount || 0 }} version(s)</span>
          </template>

          <template #cell-createdAt="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>

          <template #actions="{ row }">
            <div class="flex items-center gap-3">
              <router-link
                :to="`/surveys/${row.id}`"
                class="text-sm text-primary-400 hover:text-primary-300"
              >
                Edit
              </router-link>
              <button
                @click="deleteSurvey(row.id)"
                class="text-sm text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </div>
          </template>
        </AppTable>
      </AppCard>
    </div>

    <!-- Create survey modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click.self="showCreateModal = false"
    >
      <AppCard class="max-w-2xl w-full">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white">Create New Survey</h3>
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

        <form @submit.prevent="handleCreateSurvey" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Survey Title *
            </label>
            <input
              v-model="newSurvey.title"
              type="text"
              required
              class="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Customer Satisfaction Survey"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              v-model="newSurvey.description"
              rows="3"
              class="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe the purpose of this survey..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Start from template (optional)
            </label>
            <select
              v-model="selectedTemplateId"
              class="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Blank survey</option>
              <option
                v-for="template in templates"
                :key="template.id"
                :value="template.id"
              >
                {{ template.name }}
              </option>
            </select>
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
              Create Survey
            </AppButton>
          </div>
        </form>
      </AppCard>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import AppCard from '@/components/AppCard.vue'
import AppTable from '@/components/AppTable.vue'
import AppButton from '@/components/AppButton.vue'
import { surveyService } from '@/services/api'
import type { Survey, SurveyTemplate } from '@/types'

const router = useRouter()

const surveys = ref<Survey[]>([])
const templates = ref<SurveyTemplate[]>([])
const loading = ref(true)
const showCreateModal = ref(false)
const creating = ref(false)
const selectedTemplateId = ref('')

const newSurvey = ref({
  title: '',
  description: '',
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const loadSurveys = async () => {
  try {
    loading.value = true
    const response = await surveyService.getAll()
    surveys.value = response
  } catch (error) {
    console.error('Failed to load surveys:', error)
  } finally {
    loading.value = false
  }
}

const loadTemplates = async () => {
  try {
    const response = await surveyService.getTemplates()
    templates.value = response
  } catch (error) {
    console.error('Failed to load templates:', error)
  }
}

const handleCreateSurvey = async () => {
  try {
    creating.value = true
    const survey = selectedTemplateId.value
      ? await surveyService.applyTemplate(selectedTemplateId.value, {
          title: newSurvey.value.title,
          description: newSurvey.value.description,
        })
      : await surveyService.create(newSurvey.value)
    
    showCreateModal.value = false
    newSurvey.value = { title: '', description: '' }
    selectedTemplateId.value = ''
    
    // Redirect to the survey detail page to add questions
    router.push(`/surveys/${survey.id}`)
  } catch (error) {
    console.error('Failed to create survey:', error)
    alert('Failed to create survey. Please try again.')
  } finally {
    creating.value = false
  }
}

const deleteSurvey = async (id: string) => {
  if (!confirm('Are you sure you want to delete this survey? This action cannot be undone.')) {
    return
  }

  try {
    await surveyService.delete(id)
    await loadSurveys()
  } catch (error) {
    console.error('Failed to delete survey:', error)
    alert('Failed to delete survey. It may be used in active campaigns.')
  }
}

onMounted(() => {
  loadSurveys()
  loadTemplates()
})
</script>
