import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { authService } from '@/services/api'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      const user = authService.getCurrentUser()
      if (user?.role === 'RESPONDENT') return '/respondent'
      return '/dashboard'
    },
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
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/surveys',
    name: 'Surveys',
    component: () => import('@/views/SurveysView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/surveys/:id',
    name: 'SurveyDetail',
    component: () => import('@/views/SurveyDetailView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/campaigns',
    name: 'Campaigns',
    component: () => import('@/views/CampaignsView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/campaigns/:id',
    name: 'CampaignDetail',
    component: () => import('@/views/CampaignDetailView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/analytics',
    name: 'AnalyticsList',
    component: () => import('@/views/AnalyticsListView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/analytics/:campaignId',
    name: 'Analytics',
    component: () => import('@/views/AnalyticsView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/responses/:campaignId',
    name: 'Responses',
    component: () => import('@/views/ResponsesView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/respondent',
    name: 'RespondentHome',
    component: () => import('@/views/RespondentHomeView.vue'),
    meta: { requiresAuth: true, roles: ['RESPONDENT'] },
  },
  {
    path: '/respond/:campaignId',
    name: 'RespondCampaign',
    component: () => import('@/views/RespondCampaignView.vue'),
    meta: { requiresAuth: false },
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
  const user = authService.getCurrentUser()

  const allowedRoles = to.matched
    .map(record => record.meta.roles as string[] | undefined)
    .find((roles) => Array.isArray(roles) && roles.length > 0)

  const defaultHome = user?.role === 'RESPONDENT' ? '/respondent' : '/dashboard'

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    next(defaultHome)
  } else if (to.path === '/login' && isAuthenticated) {
    next(defaultHome)
  } else {
    next()
  }
})

export default router
