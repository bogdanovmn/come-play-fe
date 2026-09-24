<template>
  <div class="schedule">
    <div class="heading-row">
      <BackButton fallback="/trainings" />
      <h1>Запись на тренировки</h1>
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

    <div v-if="club && club.closed && !isOwner" class="closed-block">
      Клуб закрыт. Запись на тренировки недоступна.
    </div>

    <template v-else>
      <div v-if="store.isLoading" class="loading">Загрузка...</div>

      <div v-else-if="visibleSlots.length === 0" class="empty">В ближайшее время тренировок нет.</div>

      <div v-else class="slot-list">
        <div v-for="slot in visibleSlots" :key="slot.id" class="slot-card" :class="{ overridden: slot.overridden, cancelled: slot.cancelled }">
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
                <span v-if="slot.waitlistCount > 0" class="waitlist">+{{ slot.waitlistCount }} {{ pluralRu(slot.waitlistCount, 'резерв', 'резерва', 'резервов') }}</span>
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
            <div class="slot-action-buttons">
              <button v-if="isOwner && !slot.cancelled" class="btn-icon btn-icon-danger" title="Отменить тренировку" aria-label="Отменить тренировку" @click.stop="handleCancel(slot)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <button v-if="isOwner && slot.cancelled" class="btn-icon btn-icon-restore" title="Вернуть тренировку в расписание" aria-label="Вернуть тренировку в расписание" @click.stop="handleRestore(slot)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </button>
              <button v-if="isOwner" class="btn-icon" title="Изменить параметры" aria-label="Изменить параметры" @click.stop="openEdit(slot)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          </div>
          <div v-if="featuresOpenId === slot.id && slot.features" class="slot-features">{{ slot.features }}</div>
        </div>
      </div>

      <div v-if="!store.isLoading && store.slots.length > 0" class="history-footer">
        <router-link :to="`/clubs/${clubId}/trainings/history`" class="history-link">История</router-link>
      </div>
    </template>

    <div v-if="editingSlot" class="modal-overlay" @click.self="editingSlot = null">
      <div class="modal">
        <h2>Параметры тренировки</h2>
        <p class="modal-date">{{ weekday(editingSlot.slotDate) }}, {{ monthDay(editingSlot.slotDate) }}</p>

        <label>Начало</label>
        <div class="time-input">
          <button type="button" class="time-value" :class="{ open: editTimeField === 'start' }" @click="toggleEditTimeField('start')">
            {{ editStart }}
          </button>
          <TimeWheel v-if="editTimeField === 'start'" v-model="editStart" min="00:00" :max="startMax" @select="editTimeField = null" />
        </div>

        <label>Конец</label>
        <div class="time-input">
          <button type="button" class="time-value" :class="{ open: editTimeField === 'end' }" @click="toggleEditTimeField('end')">
            {{ editEnd }}
          </button>
          <TimeWheel v-if="editTimeField === 'end'" v-model="editEnd" :min="minEditEnd" max="23:55" @select="editTimeField = null" />
        </div>
        <div v-if="editTimeError" class="time-error">Конец должен быть позже начала</div>

        <label>Максимум игроков</label>
        <div class="max-players">
          <button type="button" class="time-value" @click="editWheelOpen = !editWheelOpen">
            {{ editMax }}
          </button>
          <NumberWheel v-if="editWheelOpen" v-model="editMax" :min="1" :max="100" @select="editWheelOpen = false" />
        </div>

        <label>Особенности</label>
        <textarea v-model="editFeatures" rows="3" maxlength="1000" placeholder="Особенности этого дня"></textarea>

        <div class="modal-actions">
          <button v-if="editingSlot.overridden" class="btn-reset" @click="handleResetSlot">Сбросить</button>
          <button @click="editingSlot = null">Закрыть</button>
          <button class="btn-primary" @click="handleSaveSlot" :disabled="!!editTimeError">Сохранить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { trainingsStore } from '@/stores/trainings'
import { clubsStore } from '@/stores/clubs'
import { profileStore } from '@/stores/profile'
import type { TrainingSlot } from '@/api'
import BackButton from '@/components/BackButton.vue'
import NumberWheel from '@/components/NumberWheel.vue'
import TimeWheel from '@/components/TimeWheel.vue'
import { pluralRu } from '@/utils/plural'
import { isSlotEnded } from '@/utils/slotTime'

const props = defineProps<{ clubId: string }>()
const router = useRouter()
const store = trainingsStore()
const clubs = clubsStore()
const profile = profileStore()

const from = ref(format(new Date(), 'yyyy-MM-dd'))
const to = ref(format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd'))

const isOwner = computed(() =>
  clubs.currentClub !== null && profile.profile !== null &&
  clubs.currentClub.ownerId === profile.profile.id
)

const club = computed(() => clubs.currentClub)

const canViewSchedule = computed(() =>
  club.value === null || !club.value.closed || isOwner.value
)

const visibleSlots = computed(() => {
  const upcoming = store.slots.filter(s => !isSlotEnded(s))
  const datesWithSlots = [...new Set(upcoming.map(s => s.slotDate).filter(Boolean))].sort()
  const windowDates = new Set(datesWithSlots.slice(0, 3))
  return upcoming.filter(s => s.slotDate !== undefined && windowDates.has(s.slotDate))
})

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

const featuresOpenId = ref<string | null>(null)

function toggleFeatures(slotId: string) {
  featuresOpenId.value = featuresOpenId.value === slotId ? null : slotId
}

const MIN_DURATION_MINUTES = 30
const startMax = '23:00'

function parseMinutes(value: string): number {
  const [h, m] = value.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function formatMinutes(total: number): string {
  const hh = Math.floor(total / 60)
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

const editingSlot = ref<TrainingSlot | null>(null)
const editStart = ref('')
const editEnd = ref('')
const editMax = ref(1)
const editFeatures = ref('')
const editTimeField = ref<'start' | 'end' | null>(null)
const editWheelOpen = ref(false)

const minEditEnd = computed(() => formatMinutes(parseMinutes(editStart.value) + MIN_DURATION_MINUTES))

const editTimeError = computed(() =>
  !editEnd.value || !editStart.value || parseMinutes(editEnd.value) <= parseMinutes(editStart.value)
)

watch(editStart, (value) => {
  if (!editEnd.value || parseMinutes(editEnd.value) <= parseMinutes(value)) {
    editEnd.value = formatMinutes(parseMinutes(value) + MIN_DURATION_MINUTES)
  }
})

function toggleEditTimeField(field: 'start' | 'end') {
  editTimeField.value = editTimeField.value === field ? null : field
}

function openEdit(slot: TrainingSlot) {
  editingSlot.value = slot
  editStart.value = slot.startTime.slice(0, 5)
  editEnd.value = slot.endTime.slice(0, 5)
  editMax.value = slot.maxPlayers
  editFeatures.value = slot.features ?? ''
  editTimeField.value = null
  editWheelOpen.value = false
}

async function handleSaveSlot() {
  if (!editingSlot.value || editTimeError.value) return
  await store.updateSlotParams(editingSlot.value.id, editStart.value, editEnd.value, editMax.value, editFeatures.value.trim() || null)
  editingSlot.value = null
}

async function handleResetSlot() {
  if (!editingSlot.value) return
  await store.clearSlotParams(editingSlot.value.id)
  editingSlot.value = null
}

async function handleCancel(slot: TrainingSlot) {
  if (!window.confirm('Отменить тренировку?')) return
  await store.cancelSlot(slot.id)
}

async function handleRestore(slot: TrainingSlot) {
  if (!window.confirm('Вернуть тренировку в расписание?')) return
  await store.restoreSlot(slot.id)
}

onMounted(async () => {
  await Promise.all([
    clubs.loadClub(props.clubId),
    profile.loadProfile()
  ])
  if (canViewSchedule.value) {
    await store.loadSlots(props.clubId, from.value, to.value)
  }
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

.history-footer {
  margin-top: 0.75rem;
}

.history-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.95rem;
  transition: border-color 0.2s, background-color 0.2s;
}

.history-link:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

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

.closed-block {
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  padding: 2rem 1rem;
  text-align: center;
  color: var(--color-muted);
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

.slot-date {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
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

.waitlist {
  color: var(--color-danger);
  font-size: 0.85rem;
  font-weight: 600;
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

.btn-icon.btn-icon-danger {
  color: var(--color-danger);
}

.btn-icon.btn-icon-danger:hover {
  background: var(--color-danger-soft);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.btn-icon.btn-icon-restore {
  color: var(--color-primary);
}

.btn-icon.btn-icon-restore:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary-hover);
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
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  margin: 0 0 0.25rem;
}

.modal-date {
  margin: 0 0 0.75rem;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.modal label {
  display: block;
  margin-top: 0.75rem;
  margin-bottom: 0.3rem;
  font-weight: 500;
}

.modal textarea {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-sizing: border-box;
  min-height: 44px;
  font-family: inherit;
  resize: vertical;
}

.time-error {
  margin-top: 0.3rem;
  color: var(--color-danger);
  font-size: 0.85rem;
}

.time-value {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-sizing: border-box;
  min-height: 44px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
}

.time-value:hover,
.time-value.open {
  border-color: var(--color-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}

.modal-actions button {
  padding: 0.55rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  min-height: 40px;
}

.modal-actions .btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
}

.modal-actions .btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.modal-actions .btn-primary:disabled {
  opacity: 0.5;
  cursor: default;
}

.modal-actions .btn-reset {
  color: var(--color-danger);
  border-color: var(--color-danger);
  margin-right: auto;
}
</style>