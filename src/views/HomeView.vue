<template>
  <div class="home">
    <h1>Come Play</h1>
    <p>Сервис записи на игровые тренировки: бадминтон, волейбол, теннис, футбол и т.д.</p>
    <div class="cta">
      <button class="btn-primary" @click="handleLogin">Войти</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function handleLogin() {
  router.push('/login')
}
</script>

<style scoped>
.home {
  text-align: center;
  padding: 2.5rem 1rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

p {
  font-size: 1.05rem;
  color: #6f8f77;
  margin-bottom: 1.5rem;
}

.cta {
  margin-top: 1.5rem;
}

.btn-primary {
  display: inline-block;
  padding: 0.7rem 1.8rem;
  background: #2e7d32;
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 6px;
  font-size: 1.05rem;
  cursor: pointer;
  min-height: 44px;
}

.btn-primary:hover {
  background: #245c27;
}

@media (min-width: 768px) {
  .home {
    padding: 3.5rem 2rem;
  }

  h1 {
    font-size: 2.4rem;
  }
}
</style>