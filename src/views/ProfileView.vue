<template>
  <div class="profile">
    <h1>Профиль</h1>

    <div class="section">
      <h2>Отображаемое имя</h2>
      <div class="edit-name">
        <input v-model="displayName" placeholder="Ваше имя" />
        <button @click="handleSaveName" :disabled="!displayName.trim()">Сохранить</button>
      </div>
    </div>

    <div class="section">
      <h2>Друзья</h2>
      <div class="add-friend">
        <input v-model="searchTerm" placeholder="Поиск по имени..." @input="handleSearch" />
        <div v-if="searchResults.length > 0" class="search-results">
          <div v-for="u in searchResults" :key="u.id" class="search-item">
            <span>{{ u.displayName }}</span>
            <button @click="handleAddFriend(u.id)">Добавить</button>
          </div>
        </div>
      </div>

      <div v-if="profile.friends.length === 0" class="empty">Пока нет друзей.</div>
      <div v-else class="friend-list">
        <div v-for="f in profile.friends" :key="f.id" class="friend-item">
          <span>{{ f.displayName }}</span>
          <button class="btn-remove" @click="handleRemoveFriend(f.id)">Удалить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { profileStore } from '@/stores/profile'
import type { UserProfile } from '@/api'

const profile = profileStore()
const displayName = ref('')
const searchTerm = ref('')
const searchResults = ref<UserProfile[]>([])
let searchTimeout: ReturnType<typeof setTimeout>

onMounted(async () => {
  await profile.loadProfile()
  if (profile.profile) {
    displayName.value = profile.profile.displayName
  }
  await profile.loadFriends()
})

async function handleSaveName() {
  if (!displayName.value.trim()) return
  await profile.updateProfile(displayName.value.trim())
}

function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    if (searchTerm.value.trim().length < 2) {
      searchResults.value = []
      return
    }
    searchResults.value = await profile.searchUsers(searchTerm.value.trim())
  }, 300)
}

async function handleAddFriend(userId: string) {
  await profile.addFriend(userId)
  searchTerm.value = ''
  searchResults.value = []
}

async function handleRemoveFriend(friendId: string) {
  await profile.removeFriend(friendId)
}
</script>

<style scoped>
h1 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.section {
  margin-bottom: 2rem;
}

.section h2 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.edit-name {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.edit-name input {
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
  min-width: 200px;
  min-height: 44px;
}

.edit-name button {
  padding: 0.55rem 1.2rem;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  min-height: 44px;
  font-size: 1rem;
}

.add-friend {
  margin-bottom: 1rem;
}

.add-friend input {
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  min-height: 44px;
}

.search-results {
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 0.3rem;
}

.search-item {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.search-item button {
  padding: 0.4rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background: white;
  min-height: 36px;
}

.friend-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.friend-item {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.btn-remove {
  padding: 0.4rem 0.8rem;
  border: 1px solid #c00;
  color: #c00;
  border-radius: 4px;
  cursor: pointer;
  background: white;
  min-height: 36px;
}

.empty { color: #888; }
</style>