<template>
  <div class="clubs-page">
    <h1>Клубы, в которых участвую</h1>

    <div v-if="clubs.isLoading" class="loading">Загрузка...</div>

    <div v-else-if="clubs.memberClubs.length === 0" class="empty">
      Вы пока не присоединились ни к одному клубу.
    </div>

    <div v-else class="club-list">
      <div v-for="club in clubs.memberClubs" :key="club.id" class="club-card" @click="router.push(`/clubs/${club.id}`)">
        <h3>{{ club.name }}</h3>
        <span class="sport-type">{{ club.sportTypeName }}</span>
        <span class="members">{{ club.membersCount }} участн.</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { clubsStore } from '@/stores/clubs'

const router = useRouter()
const clubs = clubsStore()

onMounted(() => {
  clubs.loadMember()
})
</script>

<style scoped>
h1 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.club-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.club-card {
  padding: 1.25rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.club-card:hover {
  border-color: #e94560;
}

.club-card h3 { margin: 0 0 0.4rem; font-size: 1.1rem; }

.sport-type {
  display: inline-block;
  background: #f0f0f0;
  border-radius: 4px;
  padding: 0.15rem 0.5rem;
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
}

.members { display: block; color: #888; font-size: 0.9rem; }

.loading, .empty {
  text-align: center;
  padding: 3rem 1rem;
  color: #888;
}

@media (min-width: 600px) {
  .club-list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}
</style>