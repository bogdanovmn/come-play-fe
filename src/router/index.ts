import { createRouter, createWebHistory } from 'vue-router'
import { tokenStorage } from '@bogdanovmn/ssofw'

import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory('/come-play/'),
  routes: [
    { path: '/', component: HomeView },
    {
      path: '/login',
      redirect: () => {
        const ssoUrl = import.meta.env.VITE_SSO_FRONT_URL
        const redirectUri = `${window.location.origin}/come-play/sso-callback`
        window.location.href = `${ssoUrl}/login?from=${encodeURIComponent(redirectUri)}`
        return '/'
      }
    },
    { path: '/sso-callback', component: () => import('@/views/SsoCallbackView.vue') },
    { path: '/trainings', component: () => import('@/views/TrainingsView.vue'), meta: { private: true } },
    { path: '/clubs/:clubId', component: () => import('@/views/ClubDetailView.vue'), meta: { private: true }, props: true },
    { path: '/clubs/:clubId/info', component: () => import('@/views/ClubInfoView.vue'), meta: { private: true }, props: true },
    { path: '/clubs/:clubId/edit', component: () => import('@/views/ClubEditView.vue'), meta: { private: true }, props: true },
    { path: '/clubs/:clubId/invitations', component: () => import('@/views/InvitationsView.vue'), meta: { private: true }, props: true },
    { path: '/clubs/:clubId/invitations/:invitationId/joiners', component: () => import('@/views/InvitationJoinersView.vue'), meta: { private: true }, props: true },
    { path: '/invitations/:invitationId', component: () => import('@/views/InvitationJoinView.vue'), props: true },
    { path: '/clubs/:clubId/trainings', component: () => import('@/views/TrainingScheduleView.vue'), meta: { private: true }, props: true },
    { path: '/clubs/:clubId/trainings/new', component: () => import('@/views/TrainingFormView.vue'), meta: { private: true }, props: true },
    { path: '/clubs/:clubId/trainings/:trainingId/edit', component: () => import('@/views/TrainingFormView.vue'), meta: { private: true }, props: true },
    { path: '/slots/:slotId', component: () => import('@/views/TrainingDetailView.vue'), meta: { private: true }, props: true },
    { path: '/clubs/:clubId/history', component: () => import('@/views/VisitHistoryView.vue'), meta: { private: true }, props: true },
    { path: '/profile', component: () => import('@/views/ProfileView.vue'), meta: { private: true } },
  ]
})

router.beforeEach((to) => {
  const isAuthenticated = tokenStorage.defined()
  if (to.meta.private && !isAuthenticated) {
    return { path: '/' }
  }
  if (to.path === '/' && isAuthenticated) {
    return { path: '/trainings' }
  }
})

export default router
