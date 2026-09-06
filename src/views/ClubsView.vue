<template>
  <div class="clubs-page">
    <div class="header">
      <h1>Мои клубы</h1>
      <button class="btn-primary" @click="showCreate = true">Создать клуб</button>
    </div>

    <div v-if="clubs.isLoading" class="loading">Загрузка...</div>

    <div v-else-if="clubs.ownedClubs.length === 0" class="empty">
      У вас пока нет клубов.
    </div>

    <div v-else class="club-list">
      <div v-for="club in clubs.ownedClubs" :key="club.id" class="club-card" @click="router.push(`/clubs/${club.id}`)">
        <h3>{{ club.name }}</h3>
        <span class="sport-type">{{ club.sportTypeName }}</span>
        <span class="members">{{ club.membersCount }} участн.</span>
      </div>
    </div>

    <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
      <div class="modal">
        <h2>Новый клуб</h2>
        <input v-model="newClubName" placeholder="Название клуба" @keyup.enter="handleCreate" />
        <label class="field-label">Вид спорта</label>
        <select v-model="newClubSportTypeId">
          <option v-for="s in sportTypes" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <div class="modal-actions">
          <button @click="showCreate = false">Отмена</button>
          <button class="btn-primary" @click="handleCreate" :disabled="!newClubName.trim()">Создать</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { clubsStore } from '@/stores/clubs'
import { sportTypesStore } from '@/stores/sportTypes'

const router = useRouter()
const clubs = clubsStore()
const sportTypesStoreInstance = sportTypesStore()
const showCreate = ref(false)
const newClubName = ref('')
const newClubSportTypeId = ref<number | null>(null)
const sportTypes = sportTypesStoreInstance.sportTypes

onMounted(async () => {
  clubs.loadOwned()
  await sportTypesStoreInstance.load()
  if (sportTypesStoreInstance.sportTypes.length > 0) {
    newClubSportTypeId.value = sportTypesStoreInstance.sportTypes[0].id
  }
})

async function handleCreate() {
  if (!newClubName.value.trim() || newClubSportTypeId.value === null) return
  const club = await clubs.create(newClubName.value.trim(), newClubSportTypeId.value)
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
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

h1 {
  font-size: 1.5rem;
}

.btn-primary {
  padding: 0.55rem 1.2rem;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  min-height: 40px;
  font-size: 1rem;
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

.club-card h3 {
  margin: 0 0 0.4rem;
  font-size: 1.1rem;
}

.sport-type {
  display: inline-block;
  background: #f0f0f0;
  border-radius: 4px;
  padding: 0.15rem 0.5rem;
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
}

.members {
  display: block;
  color: #888;
  font-size: 0.9rem;
}

.loading, .empty {
  text-align: center;
  padding: 3rem 1rem;
  color: #888;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  z-index: 100;
}

.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  width: 100%;
  max-width: 420px;
}

.modal input, .modal select {
  width: 100%;
  padding: 0.6rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  min-height: 44px;
}

.field-label {
  display: block;
  font-weight: 500;
  margin-top: 0.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.modal-actions button {
  padding: 0.55rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  min-height: 40px;
}

@media (min-width: 600px) {
  .club-list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}
</style>