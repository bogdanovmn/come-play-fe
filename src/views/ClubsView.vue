<template>
  <div class="clubs-page">
    <div class="header">
      <h1>My Clubs</h1>
      <button class="btn-primary" @click="showCreate = true">Create Club</button>
    </div>

    <div v-if="clubs.isLoading" class="loading">Loading...</div>

    <div v-else-if="clubs.ownedClubs.length === 0" class="empty">
      You don't have any clubs yet.
    </div>

    <div v-else class="club-list">
      <div v-for="club in clubs.ownedClubs" :key="club.id" class="club-card" @click="router.push(`/clubs/${club.id}`)">
        <h3>{{ club.name }}</h3>
        <span class="members">{{ club.membersCount }} members</span>
      </div>
    </div>

    <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
      <div class="modal">
        <h2>New Club</h2>
        <input v-model="newClubName" placeholder="Club name" @keyup.enter="handleCreate" />
        <div class="modal-actions">
          <button @click="showCreate = false">Cancel</button>
          <button class="btn-primary" @click="handleCreate" :disabled="!newClubName.trim()">Create</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { clubsStore } from '@/stores/clubs'

const router = useRouter()
const clubs = clubsStore()
const showCreate = ref(false)
const newClubName = ref('')

onMounted(() => {
  clubs.loadOwned()
})

async function handleCreate() {
  if (!newClubName.value.trim()) return
  const club = await clubs.create(newClubName.value.trim())
  showCreate.value = false
  newClubName.value = ''
  router.push(`/clubs/${club.id}`)
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-primary {
  padding: 0.5rem 1.5rem;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

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

.club-card h3 {
  margin: 0 0 0.5rem;
}

.members {
  color: #888;
  font-size: 0.9rem;
}

.loading, .empty {
  text-align: center;
  padding: 3rem;
  color: #888;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
}

.modal input {
  width: 100%;
  padding: 0.6rem;
  margin: 1rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.modal-actions button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}
</style>
