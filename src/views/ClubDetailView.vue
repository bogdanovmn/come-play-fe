<template>
  <div class="club-detail" v-if="clubs.currentClub">
    <div class="header">
      <BackButton fallback="/trainings" />
      <div class="actions" v-if="isOwner">
        <router-link :to="`/clubs/${clubId}/edit`" class="icon-link" title="Настройки" aria-label="Настройки">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </router-link>
        <router-link :to="`/clubs/${clubId}/invitations`" class="icon-link" title="Приглашения" aria-label="Приглашения">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </router-link>
      </div>
    </div>

    <h1 class="club-title">
      {{ clubs.currentClub.name }}
      <span class="sport-badge">{{ clubs.currentClub.sportTypeName }}</span>
    </h1>

    <div v-if="clubs.currentClub.closed" class="closed-badge">Клуб закрыт</div>

    <div class="tab-bar">
      <button v-if="isOwner" :class="{ active: tab === 'schedule' }" @click="tab = 'schedule'">Расписание</button>
      <button :class="{ active: tab === 'members' }" @click="tab = 'members'">Участники</button>
    </div>

    <div v-if="isOwner && tab === 'schedule'" class="schedule-manage">
      <div v-if="trainings.isLoading" class="loading">Загрузка...</div>
      <div v-else-if="trainings.trainings.length === 0" class="empty">
        Вы пока не создали ни одной тренировки. Создайте расписание, чтобы игроки могли записываться.
      </div>
      <div v-else class="training-list">
        <div v-for="t in trainings.trainings" :key="t.id" class="training-row">
          <span class="training-info">
            <strong>{{ dayLabel(t.dayOfWeek) }}</strong>
            {{ formatTime(t.startTime) }} – {{ formatTime(t.endTime) }} ({{ t.maxPlayers }} {{ pluralRu(t.maxPlayers, 'человек', 'человека', 'человек') }})
          </span>
          <span class="training-actions">
            <router-link :to="`/clubs/${clubId}/trainings/${t.id}/edit`" class="btn-icon" title="Изменить" aria-label="Изменить">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </router-link>
            <button class="btn-icon btn-icon-danger" title="Удалить" aria-label="Удалить" @click="handleDelete(t.id)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </span>
        </div>
      </div>
      <router-link :to="`/clubs/${clubId}/trainings/new`" class="btn-primary add-btn">Добавить</router-link>
    </div>

    <div v-else-if="tab === 'members'" class="members-block">
      <ClubMembers :club-id="clubId" />
    </div>
  </div>
  <div v-else class="loading">Загрузка...</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { clubsStore } from '@/stores/clubs'
import { trainingsStore } from '@/stores/trainings'
import { profileStore } from '@/stores/profile'
import { DayOfWeek } from '@/api'
import BackButton from '@/components/BackButton.vue'
import ClubMembers from '@/components/ClubMembers.vue'
import { pluralRu } from '@/utils/plural'

const props = defineProps<{ clubId: string }>()
const route = useRoute()
const clubs = clubsStore()
const trainings = trainingsStore()
const profile = profileStore()
const tab = ref<'schedule' | 'members'>('members')

const isOwner = computed(() =>
  clubs.currentClub !== null && profile.profile !== null &&
  clubs.currentClub.ownerId === profile.profile.id
)

const dayLabels: Record<string, string> = {
  [DayOfWeek.MONDAY]: 'Понедельник',
  [DayOfWeek.TUESDAY]: 'Вторник',
  [DayOfWeek.WEDNESDAY]: 'Среда',
  [DayOfWeek.THURSDAY]: 'Четверг',
  [DayOfWeek.FRIDAY]: 'Пятница',
  [DayOfWeek.SATURDAY]: 'Суббота',
  [DayOfWeek.SUNDAY]: 'Воскресенье',
}

function dayLabel(day: string): string {
  return dayLabels[day] ?? day
}

function formatTime(value: string): string {
  return value.length > 5 ? value.slice(0, 5) : value
}

onMounted(async () => {
  await Promise.all([
    clubs.loadClub(props.clubId),
    profile.loadProfile(),
    trainings.loadTrainings(props.clubId)
  ])
  const q = route.query.tab
  if (q === 'schedule' || q === 'members') {
    tab.value = q
  } else {
    tab.value = isOwner.value ? 'schedule' : 'members'
  }
})

async function handleDelete(trainingId: string) {
  if (!window.confirm('Удалить тренировку?')) return
  await trainings.remove(props.clubId, trainingId)
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.club-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 0.5rem;
  font-size: 1.4rem;
  margin: 0 0 0.5rem;
  overflow-wrap: anywhere;
}

.sport-badge {
  font-size: 0.75rem;
  font-weight: 400;
  background: var(--color-primary-soft);
  color: var(--color-text);
  border-radius: 4px;
  padding: 0.15rem 0.6rem;
  white-space: nowrap;
}

h1 {
  font-size: 1.4rem;
  margin: 0;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-primary);
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

.icon-link:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary-hover);
  border-color: var(--color-primary);
}

.icon-link svg {
  width: 20px;
  height: 20px;
}

.btn-primary {
  display: inline-block;
  padding: 0.5rem 1.1rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.95rem;
  min-height: 40px;
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.closed-badge {
  display: inline-block;
  padding: 0.3rem 1rem;
  background: var(--color-danger-soft);
  color: var(--color-danger);
  border-radius: 4px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.schedule-manage {
  margin-top: 2rem;
  max-width: 720px;
}

.members-block {
  margin-top: 2rem;
  max-width: 640px;
}

.tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
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

.training-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.training-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 0.5rem;
  background: var(--color-surface);
}

.training-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-height: 40px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-primary);
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

.btn-icon:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary-hover);
  border-color: var(--color-primary);
}

.btn-icon.btn-icon-danger {
  color: var(--color-danger);
}

.btn-icon.btn-icon-danger:hover {
  background: var(--color-danger-soft);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.btn-icon svg {
  width: 18px;
  height: 18px;
}

.loading, .empty {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--color-muted);
}

.add-btn {
  display: inline-block;
  margin-top: 1rem;
}

.empty {
  border: 1px dashed var(--color-border);
  border-radius: 8px;
}
</style>