<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-400">Survey builder</p>
          <h1 class="text-2xl font-bold text-white">{{ survey?.title || 'Loading survey...' }}</h1>
          <p class="text-sm text-gray-500 mt-1">Create versions with LEGO-like blocks, logic, options, and files.</p>
        </div>
        <div class="flex gap-3">
          <AppButton variant="secondary" @click="saveTemplate" :disabled="questions.length === 0 || savingTemplate">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Save as template
          </AppButton>
          <AppButton variant="primary" @click="createVersion" :loading="savingVersion" :disabled="questions.length === 0">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Publish new version
          </AppButton>
        </div>
      </div>

      <!-- Versions list -->
      <AppCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-white">Versions</h3>
              <p class="text-sm text-gray-400">History of published versions</p>
            </div>
            <span class="text-sm text-gray-400">Total: {{ versions.length }}</span>
          </div>
        </template>

        <div v-if="loading" class="text-gray-400 py-6 text-center">Loading...</div>
        <div v-else-if="versions.length === 0" class="text-gray-400 py-6 text-center">No versions yet. Create your first one below.</div>
        <div v-else class="space-y-3">
          <div
            v-for="version in versions"
            :key="version.id"
            class="flex items-center justify-between bg-dark-900 rounded-lg px-4 py-3 border border-dark-700"
          >
            <div>
              <p class="text-white font-medium">Version v{{ version.versionNumber }}</p>
              <p class="text-xs text-gray-400">{{ formatDate(version.createdAt) }}</p>
            </div>
            <div class="text-sm text-gray-400">
              {{ version.changeLog || 'No changelog' }}
            </div>
          </div>
        </div>
      </AppCard>

      <!-- Builder -->
      <AppCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-white">Question blocks</h3>
              <p class="text-sm text-gray-400">Add text, choices, scales, files, and apply skip logic.</p>
            </div>
            <div class="flex gap-2">
              <AppButton variant="secondary" @click="addQuestion()">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add question
              </AppButton>
            </div>
          </div>
        </template>

        <div v-if="questions.length === 0" class="text-center py-10 text-gray-400">
          Start by adding a question block.
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(q, idx) in questions"
            :key="q.localId"
            class="border border-dark-700 rounded-xl p-4 bg-dark-900 space-y-3"
          >
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-primary-500/10 text-primary-300 flex items-center justify-center font-semibold">
                {{ idx + 1 }}
              </div>
              <div class="flex-1 space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label class="text-xs text-gray-400">Question text</label>
                    <input
                      v-model="q.text"
                      class="w-full mt-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                      placeholder="e.g., How satisfied are you?"
                    />
                  </div>
                  <div>
                    <label class="text-xs text-gray-400">Type</label>
                    <select
                      v-model="q.type"
                      class="w-full mt-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                      @change="onTypeChange(q)"
                    >
                      <option value="TEXT">Text</option>
                      <option value="NUMBER">Number</option>
                      <option value="MULTIPLE_CHOICE">Multiple choice</option>
                      <option value="CHECKBOX">Checkboxes</option>
                      <option value="SCALE">Scale (1-10)</option>
                      <option value="FILE_UPLOAD">File upload</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label class="text-xs text-gray-400">Code (for logic)</label>
                    <input v-model="q.code" class="w-full mt-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white" placeholder="q{{ idx + 1 }}" />
                  </div>
                  <div class="flex items-center gap-2 pt-6">
                    <input type="checkbox" v-model="q.required" class="h-4 w-4" />
                    <label class="text-sm text-gray-300">Required</label>
                  </div>
                  <div>
                    <label class="text-xs text-gray-400">Order</label>
                    <input type="number" v-model.number="q.orderIndex" min="1" class="w-full mt-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white" />
                  </div>
                </div>

                <!-- Options for multiple choice / checkbox -->
                <div v-if="q.type === 'MULTIPLE_CHOICE' || q.type === 'CHECKBOX'" class="space-y-2">
                  <div class="flex items-center justify-between">
                    <p class="text-xs text-gray-400">Options</p>
                    <button class="text-primary-400 text-sm" @click="addOption(q)">+ Add option</button>
                  </div>
                  <div v-if="!q.options || q.options.length === 0" class="text-sm text-gray-500">Add at least one option.</div>
                  <div v-else class="space-y-2">
                    <div v-for="(opt, optIdx) in q.options" :key="opt.localId" class="grid grid-cols-5 gap-2">
                      <input v-model="opt.text" class="col-span-3 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white" placeholder="Option text" />
                      <input v-model="opt.value" class="col-span-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white" placeholder="Value" />
                      <div class="flex items-center justify-end">
                        <button class="text-red-400 text-sm" @click="removeOption(q, optIdx)">Remove</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Scale preset -->
                <div v-if="q.type === 'SCALE'" class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="text-xs text-gray-400">Min</label>
                    <input type="number" v-model.number="q.validationRules.min" class="w-full mt-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white" />
                  </div>
                  <div>
                    <label class="text-xs text-gray-400">Max</label>
                    <input type="number" v-model.number="q.validationRules.max" class="w-full mt-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white" />
                  </div>
                </div>

                <!-- File upload rules -->
                <div v-if="q.type === 'FILE_UPLOAD'" class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="text-xs text-gray-400">Allowed extensions (comma separated)</label>
                    <input
                      v-model="fileExtensions[q.localId]"
                      @blur="syncExtensions(q)"
                      class="w-full mt-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                      placeholder="jpg,png,pdf"
                    />
                  </div>
                  <div>
                    <label class="text-xs text-gray-400">Max file size (MB)</label>
                    <input type="number" v-model.number="q.validationRules.max" class="w-full mt-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white" />
                  </div>
                </div>

                <!-- Visibility / skip logic -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <p class="text-xs text-gray-400">Visibility (skip logic)</p>
                    <button class="text-primary-400 text-sm" @click="addVisibility(q, idx)">+ Add condition</button>
                  </div>
                  <div v-if="!q.visibilityConditions || q.visibilityConditions.length === 0" class="text-sm text-gray-500">
                    No conditions. This question always shows.
                  </div>
                  <div v-else class="space-y-2">
                    <div
                      v-for="(cond, cIdx) in q.visibilityConditions"
                      :key="cIdx"
                      class="grid grid-cols-4 gap-2 items-center"
                    >
                      <select v-model="cond.questionCode" class="px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white">
                        <option value="" disabled>Select prior question</option>
                        <option
                          v-for="prior in priorQuestions(idx)"
                          :key="prior.code"
                          :value="prior.code"
                        >
                          {{ prior.code }} — {{ prior.text.slice(0, 40) }}
                        </option>
                      </select>
                      <select v-model="cond.operator" class="px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white">
                        <option v-for="op in operators" :key="op" :value="op">{{ op }}</option>
                      </select>
                      <input v-model="cond.value" class="px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white" placeholder="Value" />
                      <button class="text-red-400 text-sm" @click="removeVisibility(q, cIdx)">Remove</button>
                    </div>
                  </div>
                </div>

                <div class="flex justify-end">
                  <button class="text-red-400 text-sm" @click="removeQuestion(idx)">Remove question</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppCard>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import AppCard from '@/components/AppCard.vue'
import AppButton from '@/components/AppButton.vue'
import { surveyService } from '@/services/api'
import type {
  Survey,
  SurveyVersion,
  CreateSurveyVersionDto,
  CreateQuestionDto,
  VisibilityOperator,
  SurveyTemplate,
} from '@/types'

const route = useRoute()
const surveyId = computed(() => route.params.id as string)

const survey = ref<Survey | null>(null)
const versions = ref<SurveyVersion[]>([])
const loading = ref(true)
const savingVersion = ref(false)
const savingTemplate = ref(false)
const questions = ref<Array<CreateQuestionDto & { localId: string; options?: any[] }>>([])
const fileExtensions = reactive<Record<string, string>>({})

const operators: VisibilityOperator[] = [
  'EQUALS',
  'NOT_EQUALS',
  'IN',
  'NOT_IN',
  'GREATER_THAN',
  'GREATER_OR_EQUAL',
  'LESS_THAN',
  'LESS_OR_EQUAL',
  'CONTAINS',
  'NOT_CONTAINS',
  'IS_EMPTY',
  'IS_NOT_EMPTY',
]

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const priorQuestions = (idx: number) => {
  return questions.value
    .slice(0, idx)
    .filter((q) => q.code)
    .map((q) => ({ code: q.code as string, text: q.text }))
}

const addQuestion = () => {
  questions.value.push({
    localId: crypto.randomUUID(),
    text: '',
    type: 'TEXT',
    code: '',
    required: false,
    orderIndex: questions.value.length + 1,
    validationRules: {},
    options: [],
    visibilityConditions: [],
  })
}

const removeQuestion = (idx: number) => {
  questions.value.splice(idx, 1)
}

const onTypeChange = (q: any) => {
  if (q.type === 'MULTIPLE_CHOICE' || q.type === 'CHECKBOX') {
    q.options = q.options && q.options.length ? q.options : [createOption()]
  } else {
    q.options = []
  }
  if (q.type !== 'SCALE' && q.type !== 'FILE_UPLOAD') {
    q.validationRules = {}
  }
}

const createOption = () => ({
  localId: crypto.randomUUID(),
  text: '',
  value: '',
})

const addOption = (q: any) => {
  q.options = q.options || []
  q.options.push(createOption())
}

const removeOption = (q: any, idx: number) => {
  q.options.splice(idx, 1)
}

const addVisibility = (q: any, idx: number) => {
  q.visibilityConditions = q.visibilityConditions || []
  q.visibilityConditions.push({
    questionCode: priorQuestions(idx)[0]?.code || '',
    operator: 'EQUALS',
    value: '',
  })
}

const removeVisibility = (q: any, idx: number) => {
  q.visibilityConditions.splice(idx, 1)
}

const syncExtensions = (q: any) => {
  if (!fileExtensions[q.localId]) return
  const parts = fileExtensions[q.localId]
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  q.validationRules = q.validationRules || {}
  q.validationRules.allowedExtensions = parts
}

const normalizeQuestions = (): CreateQuestionDto[] => {
  return questions.value.map((q, idx) => ({
    text: q.text,
    type: q.type,
    code: (q.code || `q${idx + 1}`).trim(),
    required: q.required ?? false,
    orderIndex: q.orderIndex ?? idx + 1,
    validationRules: q.validationRules,
    options: q.options?.map((opt, oIdx) => ({
      text: opt.text,
      value: opt.value || opt.text,
      orderIndex: oIdx + 1,
    })),
    visibilityConditions: q.visibilityConditions?.filter((c) => c.questionCode),
  }))
}

const createVersion = async () => {
  try {
    savingVersion.value = true
    const payload: CreateSurveyVersionDto = {
      changeLog: 'Draft created from builder',
      isActive: true,
      questions: normalizeQuestions(),
    }
    const version = await surveyService.createVersion(surveyId.value, payload)
    versions.value = [version, ...versions.value]
  } catch (error) {
    console.error('Failed to create version', error)
    alert('Failed to create version. Check required fields and logic references.')
  } finally {
    savingVersion.value = false
  }
}

const saveTemplate = async () => {
  if (questions.value.length === 0) return
  try {
    savingTemplate.value = true
    await surveyService.createTemplate({
      name: survey.value?.title || 'Untitled template',
      description: survey.value?.description,
      questions: normalizeQuestions(),
    })
    alert('Template saved')
  } catch (error) {
    console.error('Failed to save template', error)
    alert('Failed to save template')
  } finally {
    savingTemplate.value = false
  }
}

const loadSurvey = async () => {
  try {
    loading.value = true
    const data = await surveyService.getById(surveyId.value)
    survey.value = data
    versions.value = data.versions || []
  } catch (error) {
    console.error('Failed to load survey', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSurvey()
})
</script>
