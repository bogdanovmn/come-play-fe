<template>
  <div class="training-form">
    <h1>{{ isEdit ? 'Изменить тренировку' : 'Новая тренировка' }}</h1>
    <div class="club-sport" v-if="club">
      Вид спорта: <strong>{{ club.sportTypeName }}</strong>
    </div>

    <div class="form">
      <label>День недели</label>
      <select v-model="dayOfWeek">
        <option v-for="day in days" :key="day.value" :value="day.value">{{ day.label }}</option>
      </select>

      <label>Начало</label>
      <input type="time" v-model="startTime" />

      <label>Конец</label>
      <input type="time" v-model="endTime" />

      <label>Макс. игроков</label>
      <input type="number" v-model.number="maxPlayers" min="1" max="100" />

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

const props = defineProps<{ clubId: string; trainingId?: string }>()
const router = useRouter()
const store = trainingsStore()
const clubs = clubsStore()

const isEdit = computed(() => props.trainingId !== undefined)

const dayOfWeek = ref<DayOfWeek>(DayOfWeek.MONDAY)
const startTime = ref('18:00')
const endTime = ref('20:00')
const maxPlayers = ref(10)

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
  startTime.value && endTime.value && maxPlayers.value > 0
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
  margin-bottom: 0.5rem;
}

.club-sport {
  margin-bottom: 1rem;
  color: #6f8f77;
}

.form {
  max-width: 400px;
  padding: 1rem;
  border: 1px solid #d5e3d6;
  border-radius: 8px;
  background: white;
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
  border: 1px solid #d5e3d6;
  border-radius: 4px;
  box-sizing: border-box;
  min-height: 44px;
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
  border: 1px solid #d5e3d6;
  border-radius: 4px;
  color: #22332a;
  min-height: 40px;
}

.btn-primary {
  padding: 0.55rem 1.2rem;
  background: #2e7d32;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  min-height: 40px;
  font-size: 1rem;
}

.btn-primary:hover {
  background: #245c27;
}
</style>