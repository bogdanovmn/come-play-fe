<template>
  <div class="clubs-page">
    <h1>Joined Clubs</h1>

    <div v-if="clubs.isLoading" class="loading">Loading...</div>

    <div v-else-if="clubs.memberClubs.length === 0" class="empty">
      You haven't joined any clubs yet.
    </div>

    <div v-else class="club-list">
      <div v-for="club in clubs.memberClubs" :key="club.id" class="club-card" @click="router.push(`/clubs/${club.id}`)">
        <h3>{{ club.name }}</h3>
        <span class="members">{{ club.membersCount }} members</span>
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
.club-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.club-card {
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.club-card:hover {
  border-color: #e94560;
}

.club-card h3 { margin: 0 0 0.5rem; }
.members { color: #888; font-size: 0.9rem; }

.loading, .empty {
  text-align: center;
  padding: 3rem;
  color: #888;
}
</style>
