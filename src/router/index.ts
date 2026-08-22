import { createRouter, createWebHistory } from 'vue-router'
import { tokenStorage } from '@bogdanovmn/ssofw'

import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory('/come-play/'),
  routes: [
    { path: '/', component: HomeView },
    { path: '/sso-callback', component: () => import('@/views/SsoCallbackView.vue') },
    { path: '/clubs', component: () => import('@/views/ClubsView.vue'), meta: { private: true } },
    { path: '/clubs/member', component: () => import('@/views/JoinedClubsView.vue'), meta: { private: true } },
    { path: '/clubs/:clubId', component: () => import('@/views/ClubDetailView.vue'), meta: { private: true }, props: true },
    { path: '/clubs/:clubId/edit', component: () => import('@/views/ClubEditView.vue'), meta: { private: true }, props: true },
    { path: '/clubs/:clubId/invitations', component: () => import('@/views/InvitationsView.vue'), meta: { private: true }, props: true },
    { path: '/invitations/:invitationId', component: () => import('@/views/InvitationJoinView.vue'), meta: { private: true }, props: true },
    { path: '/clubs/:clubId/trainings', component: () => import('@/views/TrainingScheduleView.vue'), meta: { private: true }, props: true },
    { path: '/clubs/:clubId/trainings/new', component: () => import('@/views/TrainingFormView.vue'), meta: { private: true }, props: true },
    { path: '/slots/:slotId', component: () => import('@/views/TrainingDetailView.vue'), meta: { private: true }, props: true },
    { path: '/clubs/:clubId/history', component: () => import('@/views/VisitHistoryView.vue'), meta: { private: true }, props: true },
    { path: '/profile', component: () => import('@/views/ProfileView.vue'), meta: { private: true } },
  ]
})

router.beforeEach((to) => {
  if (to.meta.private && !tokenStorage.defined()) {
    return { path: '/' }
  }
})

export default router
