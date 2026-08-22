<template>
  <div class="profile">
    <h1>Profile</h1>

    <div class="section">
      <h2>Display Name</h2>
      <div class="edit-name">
        <input v-model="displayName" placeholder="Your name" />
        <button @click="handleSaveName" :disabled="!displayName.trim()">Save</button>
      </div>
    </div>

    <div class="section">
      <h2>Friends</h2>
      <div class="add-friend">
        <input v-model="searchTerm" placeholder="Search by name..." @input="handleSearch" />
        <div v-if="searchResults.length > 0" class="search-results">
          <div v-for="u in searchResults" :key="u.id" class="search-item">
            <span>{{ u.displayName }}</span>
            <button @click="handleAddFriend(u.id)">Add</button>
          </div>
        </div>
      </div>

      <div v-if="profile.friends.length === 0" class="empty">No friends yet.</div>
      <div v-else class="friend-list">
        <div v-for="f in profile.friends" :key="f.id" class="friend-item">
          <span>{{ f.displayName }}</span>
          <button class="btn-remove" @click="handleRemoveFriend(f.id)">Remove</button>
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
}

.edit-name input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 300px;
}

.edit-name button {
  padding: 0.5rem 1rem;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-friend {
  margin-bottom: 1rem;
}

.add-friend input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 300px;
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
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.search-item button {
  padding: 0.2rem 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background: white;
}

.friend-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.friend-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.btn-remove {
  padding: 0.2rem 0.6rem;
  border: 1px solid #c00;
  color: #c00;
  border-radius: 4px;
  cursor: pointer;
  background: white;
}

.empty { color: #888; }
</style>
