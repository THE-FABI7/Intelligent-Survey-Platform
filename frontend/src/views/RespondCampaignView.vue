<template>
  <div class="min-h-screen bg-dark-950 text-white">
    <div class="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-400">Public survey response</p>
          <h1 class="text-2xl font-bold">{{ campaign?.name || 'Loading...' }}</h1>
          <p class="text-gray-500" v-if="campaign?.description">{{ campaign.description }}</p>
          <p class="text-xs text-gray-500 mt-2" v-if="campaign">
            Version v{{ campaign.surveyVersion.versionNumber }} · {{ campaign.surveyVersion.questions?.length || 0 }} questions
          </p>
        </div>
        <AppTag v-if="campaign" :status="campaign.status" />
      </div>

      <div v-if="loading" class="text-center text-gray-400 py-10">Loading survey...</div>
      <div v-else-if="!campaign" class="text-center text-gray-400 py-10">Campaign not found or unavailable.</div>

      <form v-else class="space-y-6" @submit.prevent="submit">
        <div
          v-for="(q, idx) in visibleQuestions"
          :key="q.id"
          class="p-4 bg-dark-900 border border-dark-700 rounded-xl space-y-2"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-semibold">{{ idx + 1 }}. {{ q.text }}</p>
              <p class="text-xs text-gray-400">Type: {{ q.type }} · Code: {{ q.code || 'n/a' }}</p>
            </div>
            <span v-if="q.required" class="text-xs text-red-300">Required</span>
          </div>

          <div>
            <component
              :is="inputComponent(q)"
              :question="q"
              v-model="answers[q.id]"
              :options="q.options || []"
              class="w-full"
            />
          </div>
        </div>

        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-400">
            {{ visibleQuestions.length }} of {{ campaign.surveyVersion.questions?.length || 0 }} questions visible
          </div>
          <AppButton type="submit" variant="primary" :loading="submitting">Submit response</AppButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppTag from '@/components/AppTag.vue'
import AppButton from '@/components/AppButton.vue'
import { campaignService, responseService } from '@/services/api'
import type { Campaign, Question, VisibilityCondition } from '@/types'

const route = useRoute()
const campaignId = route.params.campaignId as string

const campaign = ref<Campaign | null>(null)
const loading = ref(true)
const submitting = ref(false)
const answers = reactive<Record<string, any>>({})

const isEmpty = (val: any) => {
  if (val === null || val === undefined) return true
  if (typeof val === 'string') return val.trim().length === 0
  if (Array.isArray(val)) return val.length === 0
  return false
}

const evaluateCondition = (cond: VisibilityCondition, map: Map<string, any>) => {
  const actual = map.get(cond.questionCode)
  switch (cond.operator) {
    case 'EQUALS':
      return actual === cond.value
    case 'NOT_EQUALS':
      return actual !== cond.value
    case 'IN':
      return Array.isArray(cond.value) ? cond.value.includes(actual) : false
    case 'NOT_IN':
      return Array.isArray(cond.value) ? !cond.value.includes(actual) : true
    case 'GREATER_THAN':
      return actual > cond.value
    case 'GREATER_OR_EQUAL':
      return actual >= cond.value
    case 'LESS_THAN':
      return actual < cond.value
    case 'LESS_OR_EQUAL':
      return actual <= cond.value
    case 'CONTAINS':
      if (Array.isArray(actual)) return actual.includes(cond.value)
      if (typeof actual === 'string') return actual.includes(String(cond.value ?? ''))
      return false
    case 'NOT_CONTAINS':
      if (Array.isArray(actual)) return !actual.includes(cond.value)
      if (typeof actual === 'string') return !actual.includes(String(cond.value ?? ''))
      return true
    case 'IS_EMPTY':
      return isEmpty(actual)
    case 'IS_NOT_EMPTY':
      return !isEmpty(actual)
    default:
      return true
  }
}

const visibleQuestions = computed<Question[]>(() => {
  const qs = campaign.value?.surveyVersion.questions || []
  const map = new Map<string, any>()
  qs.forEach((q) => {
    const key = q.code || q.id
    map.set(key, answers[q.id])
  })
  return qs.filter((q) => {
    if (!q.visibilityConditions || q.visibilityConditions.length === 0) return true
    return (q.visibilityConditions as VisibilityCondition[]).every((c) => evaluateCondition(c, map))
  })
})

const inputComponent = (q: Question) => {
  switch (q.type) {
    case 'TEXT':
      return TextInput
    case 'NUMBER':
    case 'SCALE':
      return NumberInput
    case 'MULTIPLE_CHOICE':
      return SelectInput
    case 'CHECKBOX':
      return CheckboxGroup
    case 'FILE_UPLOAD':
      return FileStub
    default:
      return TextInput
  }
}

const submit = async () => {
  if (!campaign.value) return
  try {
    submitting.value = true
    // Simple required validation on visible questions
    for (const q of visibleQuestions.value) {
      if (q.required) {
        const val = answers[q.id]
        const empty = val === undefined || val === null || (typeof val === 'string' && val.trim() === '') || (Array.isArray(val) && val.length === 0)
        if (empty) {
          alert(`La pregunta "${q.text}" es obligatoria.`)
          submitting.value = false
          return
        }
      }
    }

    const items = visibleQuestions.value.map((q) => ({
      questionId: q.id,
      value: answers[q.id],
    }))
    await responseService.submit({
      campaignId,
      anonymousId: crypto.randomUUID(),
      items,
    })
    alert('Response submitted. Thank you!')
  } catch (error) {
    console.error('Failed to submit response', error)
    alert('Could not submit response. Please check required answers.')
  } finally {
    submitting.value = false
  }
}

const loadCampaign = async () => {
  try {
    loading.value = true
    const data = await campaignService.getPublicById(campaignId)
    campaign.value = data
  } catch (error) {
    console.error('Failed to load campaign', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCampaign()
})

// Lightweight render-based input components (no runtime template compile)
const baseInputClasses = 'w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white'

const TextInput = defineComponent({
  name: 'TextInput',
  props: { modelValue: [String, Number] },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const onInput = (event: Event) => {
      emit('update:modelValue', (event.target as HTMLInputElement).value)
    }
    return () =>
      h('input', {
        value: props.modelValue ?? '',
        class: baseInputClasses,
        placeholder: 'Tu respuesta',
        onInput,
      })
  },
})

const NumberInput = defineComponent({
  name: 'NumberInput',
  props: { modelValue: [String, Number] },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement
      const value = target.value === '' ? null : target.valueAsNumber
      emit('update:modelValue', value)
    }
    return () =>
      h('input', {
        type: 'number',
        value: props.modelValue ?? '',
        class: baseInputClasses,
        onInput,
      })
  },
})

const SelectInput = defineComponent({
  name: 'SelectInput',
  props: { modelValue: [String, Number], options: { type: Array, default: () => [] } },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const onChange = (event: Event) => {
      emit('update:modelValue', (event.target as HTMLSelectElement).value)
    }
    return () =>
      h(
        'select',
        {
          value: props.modelValue ?? '',
          class: baseInputClasses,
          onChange,
        },
        [
          h('option', { value: '', disabled: true }, 'Selecciona una opción'),
          ...(props.options as any[]).map((opt: any) =>
            h('option', { key: opt.value || opt.text, value: opt.value || opt.text }, opt.text),
          ),
        ],
      )
  },
})

const CheckboxGroup = defineComponent({
  name: 'CheckboxGroup',
  props: { modelValue: { type: Array, default: () => [] }, options: { type: Array, default: () => [] } },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const toggle = (val: string) => {
      const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
      const idx = current.indexOf(val)
      if (idx >= 0) current.splice(idx, 1)
      else current.push(val)
      emit('update:modelValue', current)
    }

    return () =>
      h(
        'div',
        { class: 'space-y-2' },
        (props.options as any[]).map((opt: any) =>
          h('label', { key: opt.value || opt.text, class: 'flex items-center gap-2 text-sm text-gray-200' }, [
            h('input', {
              type: 'checkbox',
              class: 'h-4 w-4',
              checked: (props.modelValue as any[]).includes(opt.value || opt.text),
              onChange: () => toggle(opt.value || opt.text),
            }),
            h('span', null, opt.text),
          ]),
        ),
      )
  },
})

const FileStub = defineComponent({
  name: 'FileStub',
  setup: () => () =>
    h('p', { class: 'text-sm text-gray-400' }, 'Las cargas de archivo se gestionan en el servidor. Continúa.'),
})
</script>
