<template>
  <div class="club-detail" v-if="clubs.currentClub">
    <div class="header">
      <div>
        <h1>{{ clubs.currentClub.name }}</h1>
        <span class="sport-type">{{ clubs.currentClub.sportTypeName }}</span>
      </div>
      <div class="actions">
        <router-link :to="`/clubs/${clubId}/edit`" class="btn-secondary">Настройки</router-link>
        <router-link :to="`/clubs/${clubId}/invitations`" class="btn-secondary">Приглашения</router-link>
        <router-link :to="`/clubs/${clubId}/trainings`" class="btn-primary">Тренировки</router-link>
        <router-link :to="`/clubs/${clubId}/history`" class="btn-secondary">История</router-link>
      </div>
    </div>
    <div v-if="clubs.currentClub.closed" class="closed-badge">Клуб закрыт</div>
  </div>
  <div v-else class="loading">Загрузка...</div>
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
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-direction: column;
  gap: 1rem;
}

h1 {
  font-size: 1.4rem;
  margin-bottom: 0.3rem;
}

.sport-type {
  display: inline-block;
  background: #e9f2e9;
  border-radius: 4px;
  padding: 0.2rem 0.6rem;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  display: inline-block;
  padding: 0.5rem 1.1rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.95rem;
  min-height: 40px;
}

.btn-primary {
  background: #2e7d32;
  color: white;
}

.btn-primary:hover {
  background: #245c27;
}

.btn-secondary {
  border: 1px solid #d5e3d6;
  color: #22332a;
  background: white;
}

.closed-badge {
  display: inline-block;
  padding: 0.3rem 1rem;
  background: #fdeaea;
  color: #c62828;
  border-radius: 4px;
  font-size: 0.9rem;
}

.loading {
  text-align: center;
  padding: 2.5rem;
  color: #6f8f77;
}

@media (min-width: 600px) {
  .header {
    flex-direction: row;
    align-items: center;
  }
}
</style>