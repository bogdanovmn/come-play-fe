<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <router-link to="/">Come Play</router-link>
      </div>
      <div class="nav-links">
        <template v-if="auth.isAuthenticated">
          <router-link to="/trainings">Тренировки</router-link>
          <router-link v-if="auth.userName" to="/profile" class="user-name full" :title="auth.userName">{{ auth.userName }}</router-link>
          <router-link v-if="auth.userName" to="/profile" class="user-name short" :title="auth.userName">{{ initials(auth.userName) }}</router-link>
          <button class="icon-btn" title="Выйти" aria-label="Выйти" @click="handleLogout">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </template>
        <template v-else>
          <button class="icon-btn" title="Войти" aria-label="Войти" @click="handleLogin">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          </button>
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

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return parts
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('')
}

onMounted(() => {
  auth.update()
})

function handleLogin() {
  router.push('/login')
}

async function handleLogout() {
  await logout(ssoService)
  router.push('/')
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-nav);
  color: var(--color-on-primary);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.nav-brand a {
  color: var(--color-on-primary);
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
  color: var(--color-nav-link);
  text-decoration: none;
  font-size: 0.95rem;
  padding: 0.4rem 0.25rem;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--color-on-primary);
}

.user-name {
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.95rem;
  color: var(--color-nav-link);
}

.user-name:hover {
  color: var(--color-on-primary);
}

.user-name.short {
  display: none;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.icon-btn:hover {
  background: var(--color-nav-hover);
}

.icon-btn svg {
  width: 20px;
  height: 20px;
}

.content {
  max-width: 1200px;
  margin: 1rem auto;
  padding: 0 1rem;
}

@media (max-width: 599px) {
  .user-name.full {
    display: none;
  }

  .user-name.short {
    display: inline;
  }
}

@media (min-width: 768px) {
  .navbar {
    padding: 1rem 2rem;
  }

  .nav-brand a {
    font-size: 1.4rem;
  }

  .nav-links {
    gap: 1.25rem;
  }

  .content {
    margin: 2rem auto;
    padding: 0 2rem;
  }
}
</style>