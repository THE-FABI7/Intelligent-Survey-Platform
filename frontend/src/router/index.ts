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
    meta: { requiresAuth: true, roles: ['RESPONDENT'] },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const roleHome = (role?: string) => (role === 'RESPONDENT' ? '/respondent' : '/dashboard')

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  const allowedRoles = to.matched
    .map(record => record.meta.roles as string[] | undefined)
    .find((roles) => roles !== undefined)
  const user = authService.getCurrentUser()

  if (requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  if (to.path === '/login' && isAuthenticated) {
    next(roleHome(user?.role))
    return
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    next(roleHome(user.role))
    return
  }

  next()
})

export default router
