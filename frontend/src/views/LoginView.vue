<template>
  <div class="min-h-screen bg-dark-950 flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo and header -->
      <div class="text-center">
        <div class="mx-auto w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-white">Survey Platform</h2>
        <p class="mt-2 text-sm text-gray-400">Sign in to your admin account</p>
      </div>

      <!-- Login form -->
      <AppCard>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="error" class="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
            <p class="text-sm text-red-400">{{ error }}</p>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
              Email address
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="••••••••"
            />
          </div>

          <AppButton
            type="submit"
            variant="primary"
            size="lg"
            :loading="loading"
            class="w-full"
          >
            Sign in
          </AppButton>
        </form>
      </AppCard>

      <!-- Demo credentials -->
      <div class="text-center">
        <p class="text-xs text-gray-500">
          Demo: admin@example.com / admin123
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppCard from '@/components/AppCard.vue'
import AppButton from '@/components/AppButton.vue'
import { authService } from '@/services/api'

const router = useRouter()

const form = ref({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''
    
    await authService.login(form.value.email, form.value.password)
    
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Invalid credentials. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
