<template>
  <AppLayout>
    <div class="space-y-6">
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 class="text-2xl font-bold text-white">Encuestas disponibles</h1>
          <p class="mt-1 text-sm text-gray-400">Responde las campañas activas que los administradores han publicado.</p>
        </div>
        <AppTag status="PUBLISHED">Activas</AppTag>
      </div>

      <AppCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white">Campañas activas</h3>
            <button
              class="text-sm text-gray-400 hover:text-white flex items-center gap-2"
              @click="loadCampaigns"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9M20 20v-5h-.581m-15.357-2a8.003 8.003 0 0015.357 2" />
              </svg>
              Actualizar
            </button>
          </div>
        </template>

        <div v-if="loading" class="py-12 text-center text-gray-400">Cargando campañas...</div>

        <div v-else-if="campaigns.length === 0" class="py-12 text-center text-gray-400 space-y-3">
          <p>No hay campañas publicadas en este momento.</p>
          <p class="text-sm text-gray-500">Vuelve más tarde cuando un administrador publique nuevas encuestas.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="campaign in campaigns"
            :key="campaign.id"
            class="p-4 rounded-xl bg-dark-900 border border-dark-700 space-y-3"
          >
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-lg font-semibold text-white">{{ campaign.name }}</h4>
                <p class="text-sm text-gray-400">{{ campaign.surveyVersion?.survey?.title || 'Encuesta' }} · v{{ campaign.surveyVersion?.versionNumber }}</p>
              </div>
              <AppTag :status="campaign.status" />
            </div>

            <p class="text-sm text-gray-400" v-if="campaign.description">{{ campaign.description }}</p>

            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>Del {{ formatDate(campaign.startDate) }} al {{ formatDate(campaign.endDate) }}</span>
              <span>{{ campaign.surveyVersion?.questions?.length || 0 }} preguntas</span>
            </div>

            <div class="flex justify-end">
              <AppButton variant="primary" @click="goRespond(campaign.id)">
                Responder encuesta
              </AppButton>
            </div>
          </div>
        </div>
      </AppCard>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import AppCard from '@/components/AppCard.vue'
import AppButton from '@/components/AppButton.vue'
import AppTag from '@/components/AppTag.vue'
import { campaignService } from '@/services/api'
import type { Campaign } from '@/types'

const campaigns = ref<Campaign[]>([])
const loading = ref(false)
const router = useRouter()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const loadCampaigns = async () => {
  try {
    loading.value = true
    campaigns.value = await campaignService.getAvailable()
  } catch (error) {
    console.error('No se pudieron cargar las campañas', error)
  } finally {
    loading.value = false
  }
}

const goRespond = (id: string) => {
  router.push(`/respond/${id}`)
}

onMounted(loadCampaigns)
</script>
