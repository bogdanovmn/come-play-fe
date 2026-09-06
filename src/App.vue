<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <router-link to="/">Come Play</router-link>
      </div>
      <div class="nav-links">
        <template v-if="auth.isAuthenticated">
          <router-link to="/clubs">Мои клубы</router-link>
          <router-link to="/clubs/member">Участвую</router-link>
          <router-link to="/profile">Профиль</router-link>
          <button class="btn-logout" @click="handleLogout">Выйти</button>
        </template>
        <template v-else>
          <button class="btn-login" @click="handleLogin">Войти</button>
        </template>
      </div>
    </nav>
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '@/stores/auth'
import { logout } from '@/logout'
import { SsoService } from '@bogdanovmn/ssofw'

const router = useRouter()
const auth = authStore()
const ssoService = inject<SsoService>('ssoService')!

onMounted(() => {
  auth.update()
})

function handleLogin() {
  router.push('/login')
}

function handleLogout() {
  logout(ssoService)
  router.push('/')
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #1a1a2e;
  color: white;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.nav-brand a {
  color: white;
  text-decoration: none;
  font-size: 1.25rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.nav-links a {
  color: #ccc;
  text-decoration: none;
  font-size: 0.95rem;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: white;
}

.btn-login,
.btn-logout {
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #e94560;
  color: white;
  font-size: 0.95rem;
  min-height: 36px;
}

.btn-logout {
  background: #555;
}

.content {
  max-width: 1200px;
  margin: 1rem auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .navbar {
    padding: 1rem 2rem;
  }

  .nav-brand a {
    font-size: 1.4rem;
  }

  .nav-links {
    gap: 1rem;
  }

  .content {
    margin: 2rem auto;
    padding: 0 2rem;
  }
}
</style>