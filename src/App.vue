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
    <footer class="footer">
      <div class="footer-links">
        <router-link to="/faq">FAQ</router-link>
        <a href="https://t.me/+de8ZJF9VNcJlOGUy" target="_blank" rel="noopener noreferrer">
          Поддержка
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        </a>
      </div>
      <span class="footer-version">версия: {{ backendVersion }} / {{ frontendVersion }}</span>
    </footer>
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
const backendVersion = import.meta.env.BACKEND_VERSION
const frontendVersion = import.meta.env.FRONTEND_VERSION

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
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

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
  flex: 1;
  max-width: 1200px;
  margin: 1rem auto;
  padding: 0 1rem;
}

.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  margin-top: 2rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.85rem;
  color: var(--color-muted);
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.footer-links a {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--color-muted);
  text-decoration: none;
  padding: 0.4rem 0.25rem;
}

.footer-links a:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.footer svg {
  display: block;
}

.footer-version {
  font-size: 0.8rem;
  color: var(--color-muted);
  opacity: 0.65;
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

  .footer {
    padding: 1rem 2rem;
  }
}
</style>