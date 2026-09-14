<template>
  <div class="schedule">
    <div class="heading-row">
      <BackButton fallback="/trainings" />
      <h1>Запись на тренировки</h1>
    </div>
    <div v-if="club" class="heading-sub">
      <span>в клуб {{ club.name }}</span>
      <router-link :to="`/clubs/${club.id}/info`" class="info-icon" title="Информация о клубе" aria-label="Информация о клубе">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      </router-link>
    </div>

    <div v-if="store.isLoading" class="loading">Загрузка...</div>

    <div v-else-if="store.slots.length === 0" class="empty">В ближайшее время тренировок нет.</div>

    <div v-else>
      <div class="slot-list">
        <div v-for="slot in visibleSlots" :key="slot.id" class="slot-card" @click="router.push(`/slots/${slot.id}`)">
          <div class="slot-main">
            <div class="slot-date">{{ formatDate(slot.slotDate) }}</div>
            <div class="slot-time">{{ formatTime(slot.startTime) }} – {{ formatTime(slot.endTime) }}</div>
          </div>
          <div class="slot-info">
            <span class="enrolled">{{ slot.enrolledCount }}/{{ slot.maxPlayers }}</span>
            <span v-if="slot.commentsCount > 0" class="comments">{{ slot.commentsCount }} {{ pluralRu(slot.commentsCount, 'комментарий', 'комментария', 'комментариев') }}</span>
          </div>
        </div>
      </div>
      <div v-if="store.slots.length > 3" class="more-hint">
        и ещё {{ store.slots.length - 3 }} {{ pluralRu(store.slots.length - 3, 'тренировка', 'тренировки', 'тренировок') }} в ближайшее время
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { trainingsStore } from '@/stores/trainings'
import { clubsStore } from '@/stores/clubs'
import BackButton from '@/components/BackButton.vue'
import { pluralRu } from '@/utils/plural'

const props = defineProps<{ clubId: string }>()
const router = useRouter()
const store = trainingsStore()
const clubs = clubsStore()

const from = ref(format(new Date(), 'yyyy-MM-dd'))
const to = ref(format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd'))

const club = computed(() => clubs.currentClub)
const visibleSlots = computed(() => store.slots.slice(0, 3))

function formatTime(value: string): string {
  return value.length > 5 ? value.slice(0, 5) : value
}

function formatDate(dateStr: string) {
  return format(new Date(dateStr), 'EEEE, d MMMM', { locale: ru })
}

onMounted(() => {
  clubs.loadClub(props.clubId)
  store.loadSlots(props.clubId, from.value, to.value)
})
</script>

<style scoped>
.heading-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  flex-wrap: wrap;
}

h1 { font-size: 1.35rem; margin: 0; }

.heading-sub {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--color-muted);
  margin-bottom: 1rem;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
  transition: color 0.2s;
}

.info-icon:hover {
  color: var(--color-primary);
}

.info-icon svg {
  width: 16px;
  height: 16px;
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
  padding: 0.9rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  background: var(--color-surface);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.slot-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 1px 4px rgba(93, 74, 53, 0.15);
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
  color: var(--color-muted);
  font-size: 0.9rem;
}

.enrolled {
  color: var(--color-muted);
  font-weight: 600;
}

.slot-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
}

.comments {
  color: var(--color-muted);
  font-size: 0.85rem;
}

.more-hint {
  margin-top: 0.75rem;
  text-align: center;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.loading, .empty {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--color-muted);
}

.empty {
  border: 1px dashed var(--color-border);
  border-radius: 8px;
}
</style>