<template>
  <div class="training-form">
    <div class="heading-row">
      <BackButton fallback="/trainings" />
      <h1>{{ isEdit ? 'Изменить тренировку' : 'Новая тренировка' }}</h1>
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

    <div class="form">
      <h2 class="sport-title" v-if="club">{{ club.sportTypeName }}</h2>

      <label>День недели</label>
      <select v-model="dayOfWeek">
        <option v-for="day in days" :key="day.value" :value="day.value">{{ day.label }}</option>
      </select>

      <label>Начало</label>
      <div class="time-input">
        <button type="button" class="time-value" :class="{ open: openTimeField === 'start' }" :aria-expanded="openTimeField === 'start'" @click="toggleTimeField('start')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{{ startTime }}</span>
        </button>
        <TimeWheel v-if="openTimeField === 'start'" v-model="startTime" min="00:00" :max="maxStartTime" @select="openTimeField = null" />
      </div>

      <label>Конец</label>
      <div class="time-input">
        <button type="button" class="time-value" :class="{ open: openTimeField === 'end' }" :aria-expanded="openTimeField === 'end'" @click="toggleTimeField('end')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{{ endTime }}</span>
        </button>
        <TimeWheel v-if="openTimeField === 'end'" v-model="endTime" :min="minEndTime" max="23:55" @select="openTimeField = null" />
        <div v-if="timeError" class="time-error">Конец должен быть позже начала</div>
      </div>

      <label>Максимум игроков</label>
      <div class="max-players">
        <button type="button" class="max-players-value" @click="wheelOpen = !wheelOpen" :aria-expanded="wheelOpen">
          {{ maxPlayers }}
        </button>
        <NumberWheel v-if="wheelOpen" v-model="maxPlayers" :min="2" :max="50" @select="wheelOpen = false" />
      </div>

      <label>Особенности</label>
      <textarea v-model="features" rows="3" maxlength="1000" placeholder="Например: приносить ракетки на всякий случай"></textarea>

      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="cancel">Отмена</button>
        <button class="btn-primary" @click="handleSubmit" :disabled="!isValid">{{ isEdit ? 'Сохранить' : 'Создать' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { trainingsStore } from '@/stores/trainings'
import { clubsStore } from '@/stores/clubs'
import { DayOfWeek } from '@/api'
import type { TrainingBrief } from '@/api'
import BackButton from '@/components/BackButton.vue'
import NumberWheel from '@/components/NumberWheel.vue'
import TimeWheel from '@/components/TimeWheel.vue'
import { pluralRu } from '@/utils/plural'

const props = defineProps<{ clubId: string; trainingId?: string }>()
const router = useRouter()
const store = trainingsStore()
const clubs = clubsStore()

const isEdit = computed(() => props.trainingId !== undefined)

const MIN_DURATION_MINUTES = 30

function parseMinutes(value: string): number {
  const [h, m] = value.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function formatMinutes(total: number): string {
  const hh = Math.floor(total / 60)
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

const dayOfWeek = ref<DayOfWeek>(DayOfWeek.MONDAY)
const startTime = ref('18:00')
const endTime = ref('20:00')
const maxPlayers = ref(2)
const features = ref('')
const wheelOpen = ref(false)
const openTimeField = ref<'start' | 'end' | null>(null)

function toggleTimeField(field: 'start' | 'end') {
  openTimeField.value = openTimeField.value === field ? null : field
}

const club = computed(() => clubs.currentClub)

const minEndTime = computed(() => formatMinutes(parseMinutes(startTime.value) + MIN_DURATION_MINUTES))

const maxStartTime = computed(() => {
  const maxByEnd = parseMinutes(endTime.value) - MIN_DURATION_MINUTES
  return formatMinutes(Math.min(Math.max(maxByEnd, 0), 23 * 60))
})

const timeError = computed(() =>
  !endTime.value || !startTime.value || parseMinutes(endTime.value) <= parseMinutes(startTime.value)
)

const isValid = computed(() =>
  startTime.value && endTime.value && maxPlayers.value >= 2 && !timeError.value
)

watch(startTime, (value) => {
  if (!endTime.value || parseMinutes(endTime.value) <= parseMinutes(value)) {
    endTime.value = formatMinutes(parseMinutes(value) + MIN_DURATION_MINUTES)
  }
})

watch(endTime, (value) => {
  if (!startTime.value || parseMinutes(startTime.value) >= parseMinutes(value) - MIN_DURATION_MINUTES) {
    startTime.value = formatMinutes(Math.min(Math.max(parseMinutes(value) - MIN_DURATION_MINUTES, 0), 23 * 60))
  }
})

const dayLabels: Record<string, string> = {
  MONDAY: 'Понедельник',
  TUESDAY: 'Вторник',
  WEDNESDAY: 'Среда',
  THURSDAY: 'Четверг',
  FRIDAY: 'Пятница',
  SATURDAY: 'Суббота',
  SUNDAY: 'Воскресенье'
}
const days = Object.values(DayOfWeek).map(value => ({ value, label: dayLabels[value] }))

const today = format(new Date(), 'yyyy-MM-dd')

const futureSlots = computed(() =>
  isEdit.value && props.trainingId
    ? store.slots.filter(s => s.trainingId === props.trainingId && s.slotDate >= today)
    : []
)

onMounted(async () => {
  clubs.loadClub(props.clubId)
  if (isEdit.value && props.trainingId) {
    await store.loadTrainings(props.clubId)
    const trainingId = props.trainingId
    const training: TrainingBrief | undefined = store.trainings.find(t => t.id === trainingId)
    if (training) {
      dayOfWeek.value = training.dayOfWeek as DayOfWeek
      startTime.value = training.startTime.slice(0, 5)
      endTime.value = training.endTime.slice(0, 5)
      maxPlayers.value = training.maxPlayers
      features.value = training.features ?? ''
      store.loadSlotsByTraining(props.clubId, trainingId)
    } else {
      router.push(`/clubs/${props.clubId}/trainings`)
    }
  }
})

function cancel() {
  const state = window.history.state as { back?: string } | null
  if (state?.back) {
    router.back()
  } else {
    router.push(`/clubs/${props.clubId}/trainings`)
  }
}

async function handleSubmit() {
  if (!isValid.value) return
  const trimmedFeatures = features.value.trim() || null
  if (isEdit.value && props.trainingId) {
    const training = store.trainings.find(t => t.id === props.trainingId)
    const dayChanged = training !== undefined && training.dayOfWeek !== dayOfWeek.value
    if (dayChanged && futureSlots.value.length > 0) {
      const count = futureSlots.value.length
      const noun = pluralRu(count, 'тренировка', 'тренировки', 'тренировок')
      if (!window.confirm(`Смена дня недели удалит все предстоящие ${noun} этой периодичности (${count} шт.), включая записи игроков. Продолжить?`)) return
    }
    await store.update(props.clubId, props.trainingId, dayOfWeek.value, startTime.value, endTime.value, maxPlayers.value, trimmedFeatures)
  } else {
    await store.create(props.clubId, dayOfWeek.value, startTime.value, endTime.value, maxPlayers.value, trimmedFeatures)
  }
  router.push({ path: `/clubs/${props.clubId}`, query: { tab: 'schedule' } })
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
  margin-bottom: 0.25rem;
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

.form {
  max-width: 400px;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}

.sport-title {
  font-size: 1.05rem;
  margin: 0 0 0.25rem;
  color: var(--color-primary);
}

.form label {
  display: block;
  margin-top: 1rem;
  margin-bottom: 0.3rem;
  font-weight: 500;
}

.form input, .form select, .form textarea {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-sizing: border-box;
  min-height: 44px;
  font-family: inherit;
}

.form textarea {
  resize: vertical;
}

.time-input {
  position: relative;
}

.time-input .time-wheel {
  margin-top: 0.4rem;
}

.time-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.time-value svg {
  width: 18px;
  height: 18px;
  color: var(--color-muted);
  flex-shrink: 0;
}

.time-value:hover,
.time-value.open {
  border-color: var(--color-primary);
}

.time-error {
  margin-top: 0.3rem;
  color: var(--color-danger);
  font-size: 0.85rem;
}

.max-players-value {
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

.max-players-value:hover {
  border-color: var(--color-primary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 2rem;
}

.form-actions button {
  padding: 0.55rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  min-height: 40px;
  font-size: 1rem;
}

.btn-cancel {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-cancel:hover {
  background: var(--color-primary-soft);
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>