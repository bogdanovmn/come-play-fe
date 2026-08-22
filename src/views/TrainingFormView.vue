<template>
  <div class="training-form">
    <h1>New Training</h1>
    <div class="form">
      <label>Sport Type</label>
      <input v-model="sportType" placeholder="e.g. Badminton" />

      <label>Day of Week</label>
      <select v-model="dayOfWeek">
        <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
      </select>

      <label>Start Time</label>
      <input type="time" v-model="startTime" />

      <label>End Time</label>
      <input type="time" v-model="endTime" />

      <label>Max Players</label>
      <input type="number" v-model.number="maxPlayers" min="1" max="100" />

      <div class="form-actions">
        <router-link :to="`/clubs/${clubId}/trainings`">Cancel</router-link>
        <button class="btn-primary" @click="handleCreate" :disabled="!isValid">Create</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { trainingsStore } from '@/stores/trainings'
import { DayOfWeek } from '@/api'

const props = defineProps<{ clubId: string }>()
const router = useRouter()
const store = trainingsStore()

const sportType = ref('')
const dayOfWeek = ref<DayOfWeek>(DayOfWeek.MONDAY)
const startTime = ref('18:00')
const endTime = ref('20:00')
const maxPlayers = ref(10)

const days = Object.values(DayOfWeek)

const isValid = computed(() =>
  sportType.value.trim() && startTime.value && endTime.value && maxPlayers.value > 0
)

async function handleCreate() {
  await store.create(props.clubId, sportType.value, dayOfWeek.value, startTime.value, endTime.value, maxPlayers.value)
  router.push(`/clubs/${props.clubId}/trainings`)
}
</script>

<style scoped>
.form {
  max-width: 400px;
}

.form label {
  display: block;
  margin-top: 1rem;
  margin-bottom: 0.3rem;
  font-weight: bold;
}

.form input, .form select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
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
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #333;
}

.btn-primary {
  padding: 0.5rem 1.5rem;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
