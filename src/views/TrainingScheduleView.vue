<template>
  <div class="schedule">
    <div class="header">
      <h1>Расписание тренировок</h1>
      <router-link v-if="isOwner" :to="`/clubs/${clubId}/trainings/new`" class="btn-primary">Новая тренировка</router-link>
    </div>

    <div v-if="club" class="sport-type">{{ club.sportTypeName }}</div>

    <div class="date-range">
      <label>С:</label>
      <input type="date" v-model="from" />
      <label>По:</label>
      <input type="date" v-model="to" />
      <button @click="loadSlots">Показать</button>
    </div>

    <div v-if="store.isLoading" class="loading">Загрузка...</div>

    <div v-else-if="store.slots.length === 0" class="empty">Нет тренировок в этом периоде.</div>

    <div v-else class="slot-list">
      <div v-for="slot in visibleSlots" :key="slot.id" class="slot-card" @click="router.push(`/slots/${slot.id}`)">
        <div class="slot-main">
          <div class="slot-date">{{ formatDate(slot.slotDate) }}</div>
          <div class="slot-time">{{ dayLabel(slot.dayOfWeek) }}, {{ slot.startTime }} – {{ slot.endTime }}</div>
        </div>
        <div class="slot-info">
          <span class="enrolled">{{ slot.enrolledCount }}/{{ slot.maxPlayers }}</span>
        </div>
      </div>
      <div v-if="store.slots.length > 3" class="hint">Показаны 3 ближайшие тренировки</div>
    </div>

    <div v-if="isOwner && store.trainings.length > 0" class="manage">
      <h2>Мои тренировки</h2>
      <div v-for="t in store.trainings" :key="t.id" class="training-row">
        <span class="training-info">
          <strong>{{ dayLabel(t.dayOfWeek) }}</strong>
          {{ t.startTime }} – {{ t.endTime }} ({{ t.maxPlayers }} чел.)
        </span>
        <span class="training-actions">
          <router-link :to="`/clubs/${clubId}/trainings/${t.id}/edit`">Изменить</router-link>
          <button @click="handleDelete(t.id)">Удалить</button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { trainingsStore } from '@/stores/trainings'
import { clubsStore } from '@/stores/clubs'
import { profileStore } from '@/stores/profile'
import { DayOfWeek } from '@/api'

const props = defineProps<{ clubId: string }>()
const router = useRouter()
const store = trainingsStore()
const clubs = clubsStore()
const profile = profileStore()

const from = ref(format(new Date(), 'yyyy-MM-dd'))
const to = ref(format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd'))

const visibleSlots = computed(() => store.slots.slice(0, 3))

const club = computed(() => clubs.currentClub)
const isOwner = computed(() =>
  club.value !== null && profile.profile !== null && club.value.ownerId === profile.profile.id
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

onMounted(() => {
  clubs.loadClub(props.clubId)
  profile.loadProfile()
  store.loadTrainings(props.clubId)
  loadSlots()
})

function loadSlots() {
  store.loadSlots(props.clubId, from.value, to.value)
}

async function handleDelete(trainingId: string) {
  if (!window.confirm('Удалить тренировку?')) return
  await store.remove(props.clubId, trainingId)
  loadSlots()
}

function formatDate(dateStr: string) {
  return format(new Date(dateStr), 'EEE, d MMM', { locale: ru })
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

h1 { font-size: 1.5rem; }

.btn-primary {
  display: inline-block;
  padding: 0.55rem 1.2rem;
  background: #e94560;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  min-height: 40px;
}

.sport-type {
  display: inline-block;
  background: #f0f0f0;
  border-radius: 4px;
  padding: 0.2rem 0.6rem;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.date-range input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 40px;
}

.date-range button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  min-height: 40px;
}

.slot-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slot-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
}

.slot-card:hover {
  border-color: #e94560;
}

.slot-main {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.slot-date {
  font-weight: bold;
}

.slot-time {
  color: #666;
  font-size: 0.9rem;
}

.enrolled {
  color: #888;
}

.loading, .empty {
  text-align: center;
  padding: 3rem 1rem;
  color: #888;
}

.hint {
  text-align: center;
  color: #888;
  font-size: 0.9rem;
  padding: 0.5rem;
}

.manage {
  margin-top: 2rem;
}

.manage h2 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.training-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.training-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.training-actions a,
.training-actions button {
  padding: 0.45rem 0.9rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background: white;
  color: #333;
  text-decoration: none;
  min-height: 38px;
}

.training-actions button {
  color: #c00;
}
</style>