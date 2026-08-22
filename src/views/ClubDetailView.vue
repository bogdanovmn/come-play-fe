<template>
  <div class="club-detail" v-if="clubs.currentClub">
    <div class="header">
      <h1>{{ clubs.currentClub.name }}</h1>
      <div class="actions">
        <router-link :to="`/clubs/${clubId}/edit`" class="btn-secondary">Edit</router-link>
        <router-link :to="`/clubs/${clubId}/invitations`" class="btn-secondary">Invitations</router-link>
        <router-link :to="`/clubs/${clubId}/trainings`" class="btn-primary">Trainings</router-link>
        <router-link :to="`/clubs/${clubId}/history`" class="btn-secondary">History</router-link>
      </div>
    </div>
    <div v-if="clubs.currentClub.closed" class="closed-badge">Club is closed</div>
  </div>
  <div v-else class="loading">Loading...</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { clubsStore } from '@/stores/clubs'

const props = defineProps<{ clubId: string }>()
const clubs = clubsStore()

onMounted(() => {
  clubs.loadClub(props.clubId)
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary {
  padding: 0.5rem 1.5rem;
  background: #e94560;
  color: white;
  text-decoration: none;
  border-radius: 6px;
}

.btn-secondary {
  padding: 0.5rem 1.5rem;
  border: 1px solid #ddd;
  text-decoration: none;
  border-radius: 6px;
  color: #333;
}

.closed-badge {
  display: inline-block;
  padding: 0.3rem 1rem;
  background: #ffcccc;
  color: #c00;
  border-radius: 4px;
  font-size: 0.9rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #888;
}
</style>
