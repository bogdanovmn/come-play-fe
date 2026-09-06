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
      <div v-for="slot in store.slots" :key="slot.id" class="slot-card" @click="router.push(`/slots/${slot.id}`)">
        <div class="slot-date">{{ formatDate(slot.slotDate) }}</div>
        <div class="slot-info">
          <span class="enrolled">{{ slot.enrolledCount }}/{{ slot.maxPlayers }}</span>
        </div>
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

const props = defineProps<{ clubId: string }>()
const router = useRouter()
const store = trainingsStore()
const clubs = clubsStore()
const profile = profileStore()

const from = ref(format(new Date(), 'yyyy-MM-dd'))
const to = ref(format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd'))

const club = computed(() => clubs.currentClub)
const isOwner = computed(() =>
  club.value !== null && profile.profile !== null && club.value.ownerId === profile.profile.id
)

onMounted(() => {
  clubs.loadClub(props.clubId)
  profile.loadProfile()
  loadSlots()
})

function loadSlots() {
  store.loadSlots(props.clubId, from.value, to.value)
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

.slot-date {
  font-weight: bold;
}

.enrolled {
  color: #888;
}

.loading, .empty {
  text-align: center;
  padding: 3rem 1rem;
  color: #888;
}
</style>