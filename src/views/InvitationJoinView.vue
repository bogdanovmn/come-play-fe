<template>
  <div class="invitation-join">
    <div v-if="joining" class="loading">Joining club...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="success">
      <h2>You've been added to the club!</h2>
      <router-link to="/clubs/member" class="btn-primary">Go to My Clubs</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as api from '@/api'

const props = defineProps<{ invitationId: string }>()
const router = useRouter()
const joining = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    await api.joinByInvitation(props.invitationId)
    joining.value = false
  } catch (e: any) {
    joining.value = false
    error.value = e.response?.data?.message || 'Failed to join club'
  }
})
</script>

<style scoped>
.invitation-join {
  text-align: center;
  padding: 4rem 2rem;
}

.btn-primary {
  display: inline-block;
  padding: 0.8rem 2rem;
  background: #e94560;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  margin-top: 1rem;
}

.loading { color: #888; }
.error { color: #c00; }
</style>
