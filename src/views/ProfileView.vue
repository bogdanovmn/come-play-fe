<template>
  <div class="profile">
    <h1>Профиль</h1>

    <div class="tab-bar">
      <button :class="{ active: activeTab === 'about' }" @click="activeTab = 'about'">Обо мне</button>
      <button :class="{ active: activeTab === 'friends' }" @click="activeTab = 'friends'">Друзья</button>
      <button :class="{ active: activeTab === 'clubs' }" @click="activeTab = 'clubs'">Мои клубы</button>
    </div>

    <div v-if="activeTab === 'about'" class="tab-content">
      <div class="section">
        <h2>Отображаемое имя</h2>
        <div class="edit-name">
          <input v-model="displayName" placeholder="Ваше имя" />
          <button @click="handleSaveName" :disabled="!displayName.trim()">Сохранить</button>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'friends'" class="tab-content">
      <div class="section">
        <h2>Друзья</h2>
        <p class="hint">Их можно записывать на тренировки, если они сами не могут это сделать.</p>
        <div class="add-friend">
          <input v-model="newFriendName" placeholder="Имя друга" @keyup.enter="handleAddFriend" />
          <button @click="handleAddFriend" :disabled="!newFriendName.trim()">Добавить</button>
        </div>

        <div v-if="profile.friends.length === 0" class="empty">Пока нет друзей.</div>
        <div v-else class="friend-list">
          <div v-for="f in profile.friends" :key="f.id" class="friend-item">
            <span>{{ f.name }}</span>
            <button class="btn-remove" @click="handleRemoveFriend(f.id)">Удалить</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="tab-content">
      <div class="section">
        <div class="section-header">
          <h2>Мои клубы</h2>
          <button class="btn-primary" @click="showCreateClub = true">Создать клуб</button>
        </div>

        <div v-if="clubs.isLoading" class="loading">Загрузка...</div>
        <div v-else-if="clubs.ownedClubs.length === 0" class="empty">Вы пока не создали ни одного клуба.</div>
        <div v-else class="club-list">
          <div v-for="club in clubs.ownedClubs" :key="club.id" class="club-card" @click="router.push(`/clubs/${club.id}`)">
            <h3>{{ club.name }}</h3>
            <span class="sport-type">{{ club.sportTypeName }}</span>
            <span class="members">{{ club.membersCount }} участн.</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCreateClub" class="modal-overlay" @click.self="showCreateClub = false">
      <div class="modal">
        <h2>Новый клуб</h2>
        <input v-model="newClubName" placeholder="Название клуба" @keyup.enter="handleCreateClub" />
        <label class="field-label">Вид спорта</label>
        <select v-model="newClubSportTypeId">
          <option v-for="s in sportTypeOptions" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <div class="modal-actions">
          <button @click="showCreateClub = false">Отмена</button>
          <button class="btn-primary" @click="handleCreateClub" :disabled="!newClubName.trim()">Создать</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { profileStore } from '@/stores/profile'
import { clubsStore } from '@/stores/clubs'
import { sportTypesStore } from '@/stores/sportTypes'

const router = useRouter()
const profile = profileStore()
const clubs = clubsStore()
const sportTypes = sportTypesStore()
const activeTab = ref<'about' | 'friends' | 'clubs'>('about')
const displayName = ref('')
const newFriendName = ref('')
const showCreateClub = ref(false)
const newClubName = ref('')
const newClubSportTypeId = ref<number | null>(null)

const sportTypeOptions = computed(() => sportTypes.sportTypes)

onMounted(async () => {
  await Promise.all([
    profile.loadProfile(),
    profile.loadFriends(),
    clubs.loadOwned(),
    sportTypes.load()
  ])
  if (profile.profile) {
    displayName.value = profile.profile.displayName
  }
  if (sportTypes.sportTypes.length > 0) {
    newClubSportTypeId.value = sportTypes.sportTypes[0].id
  }
})

async function handleSaveName() {
  if (!displayName.value.trim()) return
  await profile.updateProfile(displayName.value.trim())
}

async function handleAddFriend() {
  if (!newFriendName.value.trim()) return
  await profile.addFriend(newFriendName.value.trim())
  newFriendName.value = ''
}

async function handleRemoveFriend(friendId: string) {
  await profile.removeFriend(friendId)
}

async function handleCreateClub() {
  if (!newClubName.value.trim() || newClubSportTypeId.value === null) return
  const club = await clubs.create(newClubName.value.trim(), newClubSportTypeId.value)
  showCreateClub.value = false
  newClubName.value = ''
  router.push(`/clubs/${club.id}`)
}
</script>

<style scoped>
h1 {
  font-size: 1.35rem;
  margin-bottom: 1rem;
}

.tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid #d5e3d6;
}

.tab-bar button {
  padding: 0.55rem 1.1rem;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  background: none;
  color: #4a5f51;
  font-size: 1rem;
  min-height: 44px;
}

.tab-bar button.active {
  color: #2e7d32;
  border-bottom-color: #2e7d32;
  font-weight: 600;
}

.tab-content {
  max-width: 640px;
}

.section h2 {
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
}

.hint {
  color: #6f8f77;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.edit-name {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.edit-name input {
  padding: 0.6rem;
  border: 1px solid #d5e3d6;
  border-radius: 4px;
  flex: 1;
  min-width: 200px;
  min-height: 44px;
}

.edit-name button {
  padding: 0.55rem 1.2rem;
  background: #2e7d32;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  min-height: 44px;
  font-size: 1rem;
}

.edit-name button:hover {
  background: #245c27;
}

.add-friend {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.add-friend input {
  padding: 0.6rem;
  border: 1px solid #d5e3d6;
  border-radius: 4px;
  flex: 1;
  min-width: 200px;
  min-height: 44px;
}

.add-friend button {
  padding: 0.55rem 1.2rem;
  background: #2e7d32;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  min-height: 44px;
}

.add-friend button:hover {
  background: #245c27;
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
  border-bottom: 1px solid #e6efe7;
  align-items: center;
}

.btn-remove {
  padding: 0.4rem 0.8rem;
  border: 1px solid #c62828;
  color: #c62828;
  border-radius: 4px;
  cursor: pointer;
  background: white;
  min-height: 36px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.section-header h2 {
  margin-bottom: 0;
}

.btn-primary {
  padding: 0.5rem 1.1rem;
  background: #2e7d32;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  min-height: 40px;
  font-size: 0.95rem;
}

.btn-primary:hover {
  background: #245c27;
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

.club-card h3 {
  margin: 0 0 0.4rem;
  font-size: 1.05rem;
}

.sport-type {
  display: inline-block;
  background: #e9f2e9;
  border-radius: 4px;
  padding: 0.15rem 0.5rem;
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
}

.members {
  display: block;
  color: #6f8f77;
  font-size: 0.9rem;
}

.empty { color: #6f8f77; }

.loading {
  text-align: center;
  padding: 2rem 1rem;
  color: #6f8f77;
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
  padding: 1.25rem;
  border-radius: 8px;
  width: 100%;
  max-width: 420px;
}

.modal h2 {
  margin-bottom: 0.5rem;
}

.modal input, .modal select {
  width: 100%;
  padding: 0.6rem;
  margin: 0.5rem 0;
  border: 1px solid #d5e3d6;
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
  border: 1px solid #d5e3d6;
  border-radius: 4px;
  cursor: pointer;
  min-height: 40px;
}

@media (min-width: 600px) {
  .club-list {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}
</style>