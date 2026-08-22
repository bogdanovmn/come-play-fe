<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <router-link to="/">Come Play</router-link>
      </div>
      <div class="nav-links">
        <template v-if="auth.isAuthenticated">
          <router-link to="/clubs">My Clubs</router-link>
          <router-link to="/clubs/member">Joined Clubs</router-link>
          <router-link to="/profile">Profile</router-link>
          <button class="btn-logout" @click="handleLogout">Logout</button>
        </template>
        <template v-else>
          <button class="btn-login" @click="handleLogin">Login</button>
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
  ssoService.login()
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
  padding: 1rem 2rem;
  background: #1a1a2e;
  color: white;
}

.nav-brand a {
  color: white;
  text-decoration: none;
  font-size: 1.4rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-links a {
  color: #ccc;
  text-decoration: none;
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
}

.btn-logout {
  background: #555;
}

.content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}
</style>
