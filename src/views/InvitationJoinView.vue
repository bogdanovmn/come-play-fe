<template>
  <div class="invitation-join">
    <div v-if="loading" class="loading">Загрузка...</div>

    <div v-else-if="error" class="error">
      <h2>Не удалось открыть приглашение</h2>
      <p>{{ error }}</p>
      <router-link to="/" class="btn-primary">На главную</router-link>
    </div>

    <div v-else-if="info" class="invite">
      <h2>Вы приглашены в клуб</h2>
      <p class="club-name">{{ info.clubName }}</p>
      <p class="text">Чтобы видеть расписание и записываться на тренировки, необходимо зарегистрироваться или войти в систему.</p>
      <div class="cta">
        <button class="btn-primary" @click="handleLogin">Войти / Зарегистрироваться</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as api from '@/api'
import type { InvitationInfo } from '@/api'
import { authStore } from '@/stores/auth'

const props = defineProps<{ invitationId: string }>()
const router = useRouter()
const auth = authStore()

const loading = ref(true)
const error = ref('')
const info = ref<InvitationInfo | null>(null)

onMounted(async () => {
  auth.update()
  try {
    const invitation = await api.getInvitationInfo(props.invitationId)
    if (auth.isAuthenticated) {
      await api.joinByInvitation(props.invitationId)
      router.replace(`/clubs/${invitation.clubId}/trainings`)
      return
    }
    info.value = invitation
  } catch (e: any) {
    error.value = e.response?.data?.message || e.message || 'Не удалось загрузить приглашение'
  } finally {
    loading.value = false
  }
})

function handleLogin() {
  sessionStorage.setItem('redirectAfterLogin', router.currentRoute.value.fullPath)
  router.push('/login')
}
</script>

<style scoped>
.invitation-join {
  text-align: center;
  padding: 2.5rem 1rem;
}

.invite {
  max-width: 560px;
  margin: 0 auto;
}

.invite h2 {
  font-size: 1.35rem;
  margin-bottom: 1rem;
}

.club-name {
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 1rem;
  overflow-wrap: anywhere;
}

.text {
  color: var(--color-muted);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.cta {
  margin-top: 1.5rem;
}

.btn-primary {
  display: inline-block;
  padding: 0.7rem 1.8rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
  text-decoration: none;
  border: none;
  border-radius: 6px;
  font-size: 1.05rem;
  cursor: pointer;
  min-height: 44px;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.loading { color: var(--color-muted); }
.error { color: var(--color-danger); }

.error p {
  margin: 0.75rem 0 1.5rem;
}

.error a {
  color: var(--color-on-primary);
  display: inline-block;
  margin-top: 0.5rem;
}
</style>