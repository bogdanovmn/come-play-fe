<template>
  <div class="training-form">
    <div class="heading-row">
      <BackButton fallback="/trainings" />
      <h1>{{ isEdit ? 'Изменить тренировку' : 'Новая тренировка' }}</h1>
    </div>
    <div class="club-sport" v-if="club">
      Вид спорта: <strong>{{ club.sportTypeName }}</strong>
    </div>

    <div class="form">
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
        <TimeWheel v-if="openTimeField === 'start'" v-model="startTime" @select="openTimeField = null" />
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
        <TimeWheel v-if="openTimeField === 'end'" v-model="endTime" @select="openTimeField = null" />
      </div>

      <label>Максимум игроков</label>
      <div class="max-players">
        <button type="button" class="max-players-value" @click="wheelOpen = !wheelOpen" :aria-expanded="wheelOpen">
          {{ maxPlayers }}
        </button>
        <NumberWheel v-if="wheelOpen" v-model="maxPlayers" :min="2" :max="50" @select="wheelOpen = false" />
      </div>

      <div class="form-actions">
        <router-link :to="`/clubs/${clubId}/trainings`">Отмена</router-link>
        <button class="btn-primary" @click="handleSubmit" :disabled="!isValid">{{ isEdit ? 'Сохранить' : 'Создать' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { trainingsStore } from '@/stores/trainings'
import { clubsStore } from '@/stores/clubs'
import { DayOfWeek } from '@/api'
import type { TrainingBrief } from '@/api'
import BackButton from '@/components/BackButton.vue'
import NumberWheel from '@/components/NumberWheel.vue'
import TimeWheel from '@/components/TimeWheel.vue'

const props = defineProps<{ clubId: string; trainingId?: string }>()
const router = useRouter()
const store = trainingsStore()
const clubs = clubsStore()

const isEdit = computed(() => props.trainingId !== undefined)

const dayOfWeek = ref<DayOfWeek>(DayOfWeek.MONDAY)
const startTime = ref('18:00')
const endTime = ref('20:00')
const maxPlayers = ref(2)
const wheelOpen = ref(false)
const openTimeField = ref<'start' | 'end' | null>(null)

function toggleTimeField(field: 'start' | 'end') {
  openTimeField.value = openTimeField.value === field ? null : field
}

const club = computed(() => clubs.currentClub)

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

const isValid = computed(() =>
  startTime.value && endTime.value && maxPlayers.value >= 2
)

onMounted(async () => {
  clubs.loadClub(props.clubId)
  if (isEdit.value) {
    await store.loadTrainings(props.clubId)
    const training: TrainingBrief | undefined = store.trainings.find(t => t.id === props.trainingId)
    if (training) {
      dayOfWeek.value = training.dayOfWeek as DayOfWeek
      startTime.value = training.startTime
      endTime.value = training.endTime
      maxPlayers.value = training.maxPlayers
    } else {
      router.push(`/clubs/${props.clubId}/trainings`)
    }
  }
})

async function handleSubmit() {
  if (isEdit.value && props.trainingId) {
    await store.update(props.clubId, props.trainingId, dayOfWeek.value, startTime.value, endTime.value, maxPlayers.value)
  } else {
    await store.create(props.clubId, dayOfWeek.value, startTime.value, endTime.value, maxPlayers.value)
  }
  router.push(`/clubs/${props.clubId}/trainings`)
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
  margin-bottom: 0.5rem;
}

.club-sport {
  margin-bottom: 1rem;
  color: var(--color-muted);
}

.form {
  max-width: 400px;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}

.form label {
  display: block;
  margin-top: 1rem;
  margin-bottom: 0.3rem;
  font-weight: 500;
}

.form input, .form select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-sizing: border-box;
  min-height: 44px;
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

.form-actions a {
  padding: 0.5rem 1rem;
  text-decoration: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  min-height: 40px;
}

.btn-primary {
  padding: 0.55rem 1.2rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  min-height: 40px;
  font-size: 1rem;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}
</style>