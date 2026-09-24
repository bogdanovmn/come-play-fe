<template>
  <div class="history">
    <div class="heading-row">
      <BackButton fallback="/trainings" />
      <h1>История тренировок</h1>
    </div>
    <div v-if="club" class="heading-sub">
      <span class="club-name">
        <span class="club-label">Клуб</span>
        «{{ club.name }}»<router-link :to="`/clubs/${club.id}/info`" class="info-icon" title="Информация о клубе" aria-label="Информация о клубе">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </router-link>
      </span>
    </div>

    <div v-if="store.isLoading" class="loading">Загрузка...</div>

    <div v-else-if="pastSlots.length === 0" class="empty">Прошедших тренировок нет.</div>

    <div v-else class="slot-list">
      <div v-for="slot in pastSlots" :key="slot.id" class="slot-card" :class="{ overridden: slot.overridden, cancelled: slot.cancelled }">
        <div class="slot-row" @click="router.push(`/slots/${slot.id}`)">
          <div class="slot-main">
            <div class="slot-date">
              <span class="slot-day">{{ weekday(slot.slotDate) }}, </span>
              <span class="slot-date-muted">{{ monthDay(slot.slotDate) }}</span>
            </div>
            <div class="slot-time">
              <svg v-if="slot.enrolled" class="enrolled-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{{ formatTime(slot.startTime) }} – {{ formatTime(slot.endTime) }}</span>
            </div>
            <span v-if="slot.overridden" class="adjusted-badge">Изменено</span>
            <span v-if="slot.cancelled" class="cancelled-badge">Отменена</span>
          </div>
          <div class="slot-side">
            <div class="slot-info">
              <span class="enrolled" :class="{ full: isSlotFull(slot) }">{{ slot.enrolledCount }}/{{ slot.maxPlayers }}</span>
              <span v-if="slot.commentsCount > 0" class="comments">{{ slot.commentsCount }} {{ pluralRu(slot.commentsCount, 'комментарий', 'комментария', 'комментариев') }}</span>
            </div>
          </div>
        </div>
        <div class="slot-actions">
          <div class="slot-actions-left">
            <button
              v-if="slot.features"
              class="btn-icon features-btn"
              title="Особенности"
              aria-label="Особенности"
              :class="{ active: featuresOpenId === slot.id }"
              @click.stop="toggleFeatures(slot.id)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
          </div>
          <div class="slot-action-buttons"></div>
        </div>
        <div v-if="featuresOpenId === slot.id && slot.features" class="slot-features">{{ slot.features }}</div>
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
import type { TrainingSlot } from '@/api'
import BackButton from '@/components/BackButton.vue'
import { pluralRu } from '@/utils/plural'
import { isSlotEnded } from '@/utils/slotTime'

const props = defineProps<{ clubId: string }>()
const router = useRouter()
const store = trainingsStore()
const clubs = clubsStore()

const HISTORY_DAYS = 30
const featuresOpenId = ref<string | null>(null)

const club = computed(() => clubs.currentClub)

const pastSlots = computed(() => store.historySlots.filter(s => isSlotEnded(s)))

function formatTime(value: string): string {
  return value.length > 5 ? value.slice(0, 5) : value
}

function isSlotFull(slot: TrainingSlot): boolean {
  return slot.enrolledCount >= slot.maxPlayers
}

function weekday(dateStr: string) {
  return format(new Date(dateStr), 'EEEE', { locale: ru })
}

function monthDay(dateStr: string) {
  return format(new Date(dateStr), 'd MMMM', { locale: ru })
}

function toggleFeatures(slotId: string) {
  featuresOpenId.value = featuresOpenId.value === slotId ? null : slotId
}

onMounted(async () => {
  await clubs.loadClub(props.clubId)
  await store.loadHistorySlots(props.clubId, HISTORY_DAYS)
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
  margin: 0 0 1rem 48px;
}

.club-name {
  display: inline;
  overflow-wrap: anywhere;
}

.club-label {
  opacity: 0.7;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: -0.2em;
  margin-left: 0.3rem;
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

.slot-card.overridden {
  border: 2px dashed var(--color-primary);
  background: var(--color-primary-soft);
}

.slot-card.cancelled {
  border-style: dashed;
  border-color: var(--color-danger);
  background: var(--color-danger-soft);
  opacity: 0.55;
}

.slot-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.slot-main {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.slot-date {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
}

.slot-day {
  font-weight: bold;
}

.enrolled-check {
  width: 20px;
  height: 20px;
  color: var(--color-gold);
  flex-shrink: 0;
  align-self: center;
}

.slot-date-muted {
  color: var(--color-muted);
  font-weight: 400;
}

.slot-time {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.adjusted-badge {
  align-self: flex-start;
  margin-top: 0.25rem;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  padding: 0.05rem 0.5rem;
  white-space: nowrap;
}

.cancelled-badge {
  align-self: flex-start;
  margin-top: 0.25rem;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
  border-radius: 4px;
  padding: 0.05rem 0.5rem;
  white-space: nowrap;
}

.slot-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
}

.slot-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
}

.enrolled {
  color: var(--color-muted);
  font-weight: 600;
  font-size: 2em;
  line-height: 1.1;
}

.enrolled.full {
  color: var(--color-danger);
  font-weight: 700;
}

.comments {
  color: var(--color-muted);
  font-size: 0.85rem;
}

.slot-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.slot-actions-left {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.slot-action-buttons {
  display: flex;
  gap: 0.4rem;
  margin-left: auto;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  min-height: 36px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-primary);
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

.btn-icon:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary-hover);
  border-color: var(--color-primary);
}

.btn-icon svg {
  width: 18px;
  height: 18px;
}

.btn-icon.features-btn.active {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
}

.slot-features {
  margin-top: 0.6rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-word;
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