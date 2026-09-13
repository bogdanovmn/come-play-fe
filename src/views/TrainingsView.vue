<template>
  <div class="trainings-page">
    <h1>Тренировки</h1>
    <p class="subtitle">Клубы, в которых вы состоите</p>

    <div v-if="clubs.isLoading" class="loading">Загрузка...</div>

    <div v-else-if="clubs.memberClubs.length === 0" class="empty">
      Вы пока не состоите ни в одном клубе.
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
  font-size: 1.35rem;
}

.subtitle {
  color: #6f8f77;
  margin: 0.25rem 0 1.5rem;
}

.club-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.6rem;
}

.club-card {
  padding: 1rem;
  border: 1px solid #d5e3d6;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.club-card:hover {
  border-color: #2e7d32;
  box-shadow: 0 1px 4px rgba(46, 125, 50, 0.15);
}

.club-card h3 { margin: 0 0 0.4rem; font-size: 1.05rem; }

.sport-type {
  display: inline-block;
  background: #e9f2e9;
  border-radius: 4px;
  padding: 0.15rem 0.5rem;
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
}

.members { display: block; color: #6f8f77; font-size: 0.9rem; }

.loading, .empty {
  text-align: center;
  padding: 2.5rem 1rem;
  color: #6f8f77;
}

@media (min-width: 600px) {
  .club-list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}
</style>