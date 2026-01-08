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

      <!-- Campaign info + actions -->
      <AppCard v-if="campaign">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-white">{{ campaign.name }}</h2>
            <p class="text-sm text-gray-400 mt-1">
              {{ campaign.surveyVersion.survey.title }} (v{{ campaign.surveyVersion.versionNumber }})
            </p>
          </div>
          <div class="flex items-center gap-3">
            <AppButton variant="secondary" @click="exportCsv">Export CSV</AppButton>
            <AppButton variant="secondary" @click="exportExcel">Export Excel</AppButton>
            <AppTag :status="campaign.status" />
          </div>
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
          <!-- Response distribution / completion -->
          <AppCard>
            <template #header>
              <h3 class="text-lg font-semibold text-white">Completion Funnel</h3>
            </template>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-400">Completed</span>
                  <span class="text-white font-medium">
                    {{ Math.floor(metrics.totalResponses * (metrics.completionRate / 100)) }} / {{ metrics.totalResponses }}
                  </span>
                </div>
                <div class="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500" :style="{ width: `${metrics.completionRate}%` }"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-400">In progress</span>
                  <span class="text-white font-medium">
                    {{ Math.max(metrics.totalResponses - Math.floor(metrics.totalResponses * (metrics.completionRate / 100)), 0) }}
                  </span>
                </div>
                <div class="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
                  <div class="h-full bg-yellow-500" :style="{ width: `${Math.max(100 - metrics.completionRate, 0)}%` }"></div>
                </div>
              </div>
            </div>
          </AppCard>

          <AppCard>
            <template #header>
              <h3 class="text-lg font-semibold text-white">Answers over time</h3>
            </template>
            <canvas ref="trendCanvas" class="w-full h-64"></canvas>
          </AppCard>
        </div>

        <!-- Question performance -->
        <AppCard>
          <template #header>
            <h3 class="text-lg font-semibold text-white">Question Performance</h3>
          </template>

          <div v-if="activeFilter" class="mb-4 flex items-center gap-2 text-sm text-gray-300">
            <span>Filter:</span>
            <span class="px-3 py-1 bg-primary-500/20 text-primary-200 rounded-full">
              {{ activeFilter.questionId }} = {{ activeFilter.value }}
            </span>
            <button class="text-primary-300 hover:text-primary-100" @click="clearFilter">Clear</button>
          </div>

          <div v-if="questionAnalytics.length === 0" class="text-center py-8 text-gray-400">
            No question metrics available yet
          </div>

          <div v-else class="space-y-6">
            <div
              v-for="question in questionAnalytics"
              :key="question.questionId"
              class="p-4 bg-dark-900 rounded-lg space-y-3"
            >
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-white font-medium">{{ question.questionText }}</p>
                  <p class="text-sm text-gray-400">Type: {{ question.type }}</p>
                </div>
                <span class="text-sm text-gray-400">{{ question.totalAnswers }} responses</span>
              </div>
              <canvas :ref="(el) => setQuestionCanvas(question.questionId, el)" class="w-full h-64"></canvas>
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
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import AppCard from '@/components/AppCard.vue'
import AppButton from '@/components/AppButton.vue'
import AppTag from '@/components/AppTag.vue'
import { analyticsService, campaignService } from '@/services/api'
import type { Campaign, CampaignMetrics } from '@/types'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement } from 'chart.js'

const route = useRoute()
const campaignId = route.params.campaignId as string

const campaign = ref<Campaign | null>(null)
const metrics = ref<CampaignMetrics | null>(null)
const loading = ref(true)
const questionAnalytics = ref<any[]>([])
const rawResponses = ref<any[]>([])
const activeFilter = ref<{ questionId: string; value: any } | null>(null)
const trendCanvas = ref<HTMLCanvasElement | null>(null)
const questionCanvases = new Map<string, HTMLCanvasElement | null>()
const charts: Chart[] = []

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement)

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

const destroyCharts = () => {
  charts.forEach((c) => c.destroy())
  charts.length = 0
}

const renderTrend = () => {
  if (!trendCanvas.value || !metrics.value) return
  // Fake trend from completion rate and total responses (placeholder using aggregate)
  const completed = Math.floor(metrics.value.totalResponses * (metrics.value.completionRate / 100))
  const started = metrics.value.totalResponses
  const labels = ['Started', 'Completed']
  const data = [started, completed]
  const chart = new Chart(trendCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Responses', data, backgroundColor: ['#38bdf8', '#22c55e'] }],
    },
    options: { responsive: true, plugins: { legend: { display: false } } },
  })
  charts.push(chart)
}

const renderQuestionCharts = () => {
  questionAnalytics.value.forEach((q) => {
    const canvas = questionCanvases.get(q.questionId)
    if (!canvas) return

    let labels: string[] = []
    let data: number[] = []
    let type: 'bar' | 'pie' = 'bar'

    if (q.distribution) {
      labels = q.distribution.map((d: any) => d.key)
      data = q.distribution.map((d: any) => d.count)
      type = labels.length <= 5 ? 'pie' : 'bar'
    } else if (q.histogram) {
      labels = q.histogram.map((h: any) => `${h.bucketStart.toFixed(1)}-${h.bucketEnd.toFixed(1)}`)
      data = q.histogram.map((h: any) => h.count)
      type = 'bar'
    } else if (q.topWords) {
      labels = q.topWords.map((t: any) => t.term)
      data = q.topWords.map((t: any) => t.count)
      type = 'bar'
    }

    const chart = new Chart(canvas, {
      type,
      data: {
        labels,
        datasets: [
          {
            label: 'Answers',
            data,
            backgroundColor: type === 'pie' ? ['#22c55e', '#38bdf8', '#a855f7', '#f97316', '#eab308'] : '#38bdf8',
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: type === 'pie' },
          tooltip: { enabled: true },
        },
        onClick: (evt, elems) => {
          if (!elems.length) return
          const index = elems[0].index
          const value = labels[index]
          activeFilter.value = { questionId: q.questionId, value }
          applyFilter()
        },
      },
    })
    charts.push(chart)
  })
}

const setQuestionCanvas = (id: string, el: HTMLCanvasElement | null) => {
  questionCanvases.set(id, el)
}

const exportFile = async (kind: 'csv' | 'excel') => {
  const blob = kind === 'csv' ? await analyticsService.exportCsv(campaignId) : await analyticsService.exportExcel(campaignId)
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = kind === 'csv' ? `campaign-${campaignId}.csv` : `campaign-${campaignId}.xlsx`
  a.click()
  window.URL.revokeObjectURL(url)
}

const exportCsv = () => exportFile('csv')
const exportExcel = () => exportFile('excel')

const matchesFilter = (itemVal: any, filterVal: any) => {
  if (Array.isArray(itemVal)) return itemVal.includes(filterVal)
  return itemVal === filterVal
}

const computeQuestionAnalytics = (responses: any[]) => {
  const map = new Map<string, { questionId: string; questionText: string; type: string; answers: any[] }>()

  responses.forEach((r) => {
    (r.items || []).forEach((item: any) => {
      if (!item.question) return
      const existing = map.get(item.question.id) || {
        questionId: item.question.id,
        questionText: item.question.text,
        type: item.question.type,
        answers: [],
      }
      existing.answers.push(item.value)
      map.set(item.question.id, existing)
    })
  })

  const analytics: any[] = []

  map.forEach((entry) => {
    const base: any = {
      questionId: entry.questionId,
      questionText: entry.questionText,
      type: entry.type,
      totalAnswers: entry.answers.length,
    }

    if (entry.type === 'MULTIPLE_CHOICE' || entry.type === 'CHECKBOX') {
      const counter: Record<string, number> = {}
      entry.answers.forEach((ans) => {
        if (Array.isArray(ans)) {
          ans.forEach((v) => {
            const key = String(v)
            counter[key] = (counter[key] || 0) + 1
          })
        } else {
          const key = String(ans)
          counter[key] = (counter[key] || 0) + 1
        }
      })
      base.distribution = Object.entries(counter).map(([key, count]) => ({ key, count }))
      analytics.push(base)
      return
    }

    if (entry.type === 'NUMBER' || entry.type === 'SCALE') {
      const nums = entry.answers
        .map((v) => (typeof v === 'number' ? v : Number(v)))
        .filter((v) => !Number.isNaN(v))
      nums.sort((a, b) => a - b)
      const count = nums.length
      const min = count ? nums[0] : 0
      const max = count ? nums[count - 1] : 0
      const sum = nums.reduce((a, b) => a + b, 0)
      const avg = count ? sum / count : 0
      const mid = Math.floor(count / 2)
      const median = count ? (count % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid]) : 0
      const bucketCount = 8
      const width = max === min ? 1 : (max - min) / bucketCount
      const histogram = Array.from({ length: bucketCount }).map((_, idx) => {
        const start = min + idx * width
        const end = idx === bucketCount - 1 ? max : start + width
        return { bucketStart: start, bucketEnd: end, count: 0 }
      })
      nums.forEach((v) => {
        const idx = width === 1 && min === max ? 0 : Math.min(Math.floor((v - min) / width), bucketCount - 1)
        histogram[idx].count += 1
      })
      analytics.push({ ...base, histogram, average: avg, median, min, max })
      return
    }

    if (entry.type === 'TEXT') {
      const texts = entry.answers
        .map((v) => (typeof v === 'string' ? v : String(v ?? '')))
        .filter((t) => t.trim().length > 0)
      const counts: Record<string, number> = {}
      texts.forEach((t) => {
        t.split(/\s+/).forEach((word) => {
          const w = word.toLowerCase()
          if (!w) return
          counts[w] = (counts[w] || 0) + 1
        })
      })
      const topWords = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([term, count]) => ({ term, count }))
      analytics.push({ ...base, topWords })
      return
    }

    analytics.push(base)
  })

  return analytics
}

const applyFilter = () => {
  const data = activeFilter.value
    ? rawResponses.value.filter((r) =>
        (r.items || []).some((item: any) => item.question?.id === activeFilter.value?.questionId && matchesFilter(item.value, activeFilter.value?.value)),
      )
    : rawResponses.value

  questionAnalytics.value = computeQuestionAnalytics(data)
  nextTick().then(() => {
    destroyCharts()
    renderTrend()
    renderQuestionCharts()
  })
}

const clearFilter = () => {
  activeFilter.value = null
  applyFilter()
}

const loadData = async () => {
  try {
    loading.value = true
    
    campaign.value = await campaignService.getById(campaignId)
    metrics.value = await analyticsService.getCampaignMetrics(campaignId)
    rawResponses.value = await analyticsService.getRawResponses(campaignId)
    // Start with server analytics; fall back to local recompute for filters
    questionAnalytics.value = await analyticsService.getQuestionsAnalytics(campaignId)
    // Recompute locally to enable filtering
    questionAnalytics.value = computeQuestionAnalytics(rawResponses.value)
    await nextTick()
    destroyCharts()
    renderTrend()
    renderQuestionCharts()
  } catch (error) {
    console.error('Failed to load analytics:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

onBeforeUnmount(() => {
  destroyCharts()
})
</script>
