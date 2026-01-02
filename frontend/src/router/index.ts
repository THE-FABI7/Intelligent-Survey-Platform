import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { authService } from '@/services/api'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/surveys',
    name: 'Surveys',
    component: () => import('@/views/SurveysView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/surveys/:id',
    name: 'SurveyDetail',
    component: () => import('@/views/SurveyDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/campaigns',
    name: 'Campaigns',
    component: () => import('@/views/CampaignsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/campaigns/:id',
    name: 'CampaignDetail',
    component: () => import('@/views/CampaignDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/analytics',
    name: 'AnalyticsList',
    component: () => import('@/views/AnalyticsListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/analytics/:campaignId',
    name: 'Analytics',
    component: () => import('@/views/AnalyticsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/responses/:campaignId',
    name: 'Responses',
    component: () => import('@/views/ResponsesView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
