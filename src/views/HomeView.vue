<template>
  <div class="home">
    <h1>Come Play</h1>
    <p>Сервис записи на игровые тренировки: бадминтон, волейбол, теннис, футбол и т.д.</p>
    <div v-if="!auth.isAuthenticated" class="cta">
      <button class="btn-primary" @click="handleLogin">Войти</button>
    </div>
    <div v-else class="cta">
      <router-link to="/clubs" class="btn-primary">Мои клубы</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { authStore } from '@/stores/auth'

const auth = authStore()
const router = useRouter()

function handleLogin() {
  router.push('/login')
}
</script>

<style scoped>
.home {
  text-align: center;
  padding: 3rem 1rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
}

.cta {
  margin-top: 2rem;
}

.btn-primary {
  display: inline-block;
  padding: 0.8rem 2rem;
  background: #e94560;
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  min-height: 48px;
}

.btn-primary:hover {
  background: #c73652;
}

@media (min-width: 768px) {
  .home {
    padding: 4rem 2rem;
  }

  h1 {
    font-size: 3rem;
  }
}
</style>