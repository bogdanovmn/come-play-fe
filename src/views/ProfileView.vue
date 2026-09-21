<template>
  <div class="profile">
    <div class="heading-row">
      <BackButton fallback="/trainings" />
      <h1>Профиль</h1>
    </div>

    <div class="tab-bar">
      <button :class="{ active: activeTab === 'about' }" @click="activeTab = 'about'">Обо мне</button>
      <button :class="{ active: activeTab === 'friends' }" @click="activeTab = 'friends'">Друзья</button>
      <button :class="{ active: activeTab === 'clubs' }" @click="activeTab = 'clubs'">Мои клубы</button>
    </div>

    <div v-if="activeTab === 'about'" class="tab-content">
      <div class="info-card">
        <div class="setting-head">
          <h2>Отображаемое имя</h2>
          <span class="hint-area">
            <button class="hint-btn" title="Подсказка" aria-label="Подсказка" @click.stop="toggleHint('name')">?</button>
            <div v-if="hintOpen === 'name'" class="hint-popup">Имя, которое увидят другие игроки в списках участников клуба и в записи на тренировку.</div>
          </span>
        </div>
        <input v-model="displayName" class="setting-input" placeholder="Ваше имя" maxlength="50" />
      </div>

      <div class="info-card">
        <div class="setting-head">
          <h2>Уровень игры</h2>
          <span class="hint-area">
            <button class="hint-btn" title="Подсказка" aria-label="Подсказка" @click.stop="toggleHint('skill')">?</button>
            <div v-if="hintOpen === 'skill'" class="hint-popup">Укажите свой уровень для каждого вида спорта. Бейдж с вашим уровнем показывается рядом с именем в списке участников клуба и в записи на тренировку — у клубов и тренировок того же вида спорта.</div>
          </span>
        </div>
        <div v-if="sportTypes.isLoading" class="loading">Загрузка...</div>
        <div v-else class="skill-list">
          <div v-for="s in sportTypeOptions" :key="s.id" class="skill-row">
            <span class="skill-name">{{ s.name }}</span>
            <select class="skill-select" :value="skillEditFor(s.id)" @change="onSkillEdit(s.id, ($event.target as HTMLSelectElement).value as string)">
              <option value="">Не указан</option>
              <option v-for="lv in SKILL_LEVELS" :key="lv" :value="lv">{{ SKILL_LABELS[lv] }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="save-block">
        <button class="save-btn" @click="handleSave" :disabled="!hasChanges || saving">
          {{ saving ? 'Сохранение...' : 'Сохранить' }}
        </button>
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
            <span class="members">{{ club.membersCount }} {{ pluralRu(club.membersCount, 'участник', 'участника', 'участников') }}</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { profileStore } from '@/stores/profile'
import { clubsStore } from '@/stores/clubs'
import { sportTypesStore } from '@/stores/sportTypes'
import { SKILL_LABELS, SKILL_LEVELS, type SkillLevel } from '@/api'
import BackButton from '@/components/BackButton.vue'
import { pluralRu } from '@/utils/plural'

const router = useRouter()
const profile = profileStore()
const clubs = clubsStore()
const sportTypes = sportTypesStore()
const activeTab = ref<'about' | 'friends' | 'clubs'>('about')
const displayName = ref('')
const skillEdits = ref<Record<number, SkillLevel | ''>>({})
const hintOpen = ref<'name' | 'skill' | null>(null)
const saving = ref(false)
const newFriendName = ref('')
const showCreateClub = ref(false)
const newClubName = ref('')
const newClubSportTypeId = ref<number | null>(null)

const sportTypeOptions = computed(() => sportTypes.sportTypes)

onMounted(async () => {
  await Promise.all([
    profile.loadProfile(),
    profile.loadFriends(),
    profile.loadSkills(),
    clubs.loadOwned(),
    sportTypes.load()
  ])
  if (profile.profile) {
    displayName.value = profile.profile.displayName
  }
  for (const s of profile.skills) {
    skillEdits.value[s.sportTypeId] = s.skill
  }
  if (sportTypes.sportTypes.length > 0) {
    newClubSportTypeId.value = sportTypes.sportTypes[0].id
  }
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})

function onDocumentClick() {
  hintOpen.value = null
}

function toggleHint(which: 'name' | 'skill') {
  hintOpen.value = hintOpen.value === which ? null : which
}

function skillValueFor(sportTypeId: number): SkillLevel | null {
  return profile.skills.find(s => s.sportTypeId === sportTypeId)?.skill ?? null
}

function skillEditFor(sportTypeId: number): SkillLevel | '' {
  return skillEdits.value[sportTypeId] ?? ''
}

function onSkillEdit(sportTypeId: number, value: string) {
  skillEdits.value[sportTypeId] = value === '' ? '' : (value as SkillLevel)
}

const hasChanges = computed(() => {
  const savedName = profile.profile?.displayName ?? ''
  if (displayName.value.trim() !== savedName.trim()) return true
  return sportTypes.sportTypes.some(s => {
    const edited = skillEdits.value[s.id] ?? ''
    const saved = skillValueFor(s.id) ?? ''
    return edited !== saved
  })
})

async function handleSave() {
  if (saving.value) return
  saving.value = true
  try {
    const sportSkills = sportTypes.sportTypes.map(s => ({
      sportTypeId: s.id,
      skill: (skillEdits.value[s.id] ?? '') === '' ? null : (skillEdits.value[s.id] as SkillLevel)
    }))
    await profile.saveSettings(displayName.value.trim(), sportSkills)
  } finally {
    saving.value = false
  }
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
}

.heading-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

.tab-bar button {
  padding: 0.55rem 1.1rem;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  background: none;
  color: var(--color-muted);
  font-size: 1rem;
  min-height: 44px;
}

.tab-bar button.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
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
  color: var(--color-muted);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.info-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.9rem;
}

.setting-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.setting-head h2 {
  margin-bottom: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-muted);
}

.hint-area {
  position: relative;
  display: inline-flex;
}

.hint-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  min-height: 20px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-muted);
  font-size: 0.75rem;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.2s, border-color 0.2s;
}

.hint-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.hint-popup {
  position: absolute;
  top: 1.7rem;
  right: 0;
  z-index: 10;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.6rem 0.75rem;
  font-size: 0.85rem;
  color: var(--color-text);
  width: min(260px, calc(100vw - 2rem));
  text-align: left;
  box-shadow: 0 2px 8px rgba(58, 47, 34, 0.18);
}

.setting-input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  color: var(--color-text);
  min-height: 44px;
}

.save-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.save-btn {
  width: 100%;
  padding: 0.65rem 1.2rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  min-height: 48px;
}

.save-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.add-friend {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.add-friend input {
  padding: 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  flex: 1;
  min-width: 200px;
  min-height: 44px;
}

.add-friend button {
  padding: 0.55rem 1.2rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  min-height: 44px;
}

.add-friend button:hover {
  background: var(--color-primary-hover);
}

.friend-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.skill-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem;
  border-bottom: 1px solid var(--color-row-border);
  flex-wrap: wrap;
}

.skill-row:last-of-type {
  border-bottom: none;
}

.skill-name {
  flex: 1;
  min-width: 120px;
  word-break: break-word;
}

.skill-select {
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.9rem;
  min-height: 40px;
}

.friend-item {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem;
  border-bottom: 1px solid var(--color-row-border);
  align-items: center;
}

.btn-remove {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  border-radius: 4px;
  cursor: pointer;
  background: var(--color-surface);
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
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  min-height: 40px;
  font-size: 0.95rem;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.club-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.6rem;
}

.club-card {
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.club-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 1px 4px rgba(93, 74, 53, 0.15);
}

.club-card h3 {
  margin: 0 0 0.4rem;
  font-size: 1.05rem;
  overflow-wrap: anywhere;
}

.sport-type {
  display: inline-block;
  background: var(--color-primary-soft);
  border-radius: 4px;
  padding: 0.15rem 0.5rem;
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
}

.members {
  display: block;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.empty { color: var(--color-muted); }

.loading {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--color-muted);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  z-index: 100;
}

.modal {
  background: var(--color-surface);
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
  border: 1px solid var(--color-border);
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
  border: 1px solid var(--color-border);
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