<template>
  <div class="sso-callback">
    <p>Completing login...</p>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authStore } from '@/stores/auth'
import { SsoService } from '@bogdanovmn/ssofw'

const router = useRouter()
const route = useRoute()
const auth = authStore()
const ssoService = inject<SsoService>('ssoService')!

onMounted(async () => {
  const code = route.query.code as string
  if (code) {
    await ssoService.exchangeCodeToJwt(code)
    auth.update()
    router.push('/')
  } else {
    router.push('/')
  }
})
</script>

<style scoped>
.sso-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.2rem;
  color: #666;
}
</style>
