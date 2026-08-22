<template>
  <div class="schedule">
    <div class="header">
      <h1>Training Schedule</h1>
      <router-link :to="`/clubs/${clubId}/trainings/new`" class="btn-primary">New Training</router-link>
    </div>

    <div class="date-range">
      <label>From:</label>
      <input type="date" v-model="from" />
      <label>To:</label>
      <input type="date" v-model="to" />
      <button @click="loadSlots">Show</button>
    </div>

    <div v-if="store.isLoading" class="loading">Loading...</div>

    <div v-else-if="store.slots.length === 0" class="empty">No trainings in this period.</div>

    <div v-else class="slot-list">
      <div v-for="slot in store.slots" :key="slot.id" class="slot-card" @click="router.push(`/slots/${slot.id}`)">
        <div class="slot-date">{{ formatDate(slot.slotDate) }}</div>
        <div class="slot-info">
          <span class="enrolled">{{ slot.enrolledCount }}/{{ slot.maxPlayers }} players</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { trainingsStore } from '@/stores/trainings'

const props = defineProps<{ clubId: string }>()
const router = useRouter()
const store = trainingsStore()

const from = ref(format(new Date(), 'yyyy-MM-dd'))
const to = ref(format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd'))

onMounted(() => {
  loadSlots()
})

function loadSlots() {
  store.loadSlots(props.clubId, from.value, to.value)
}

function formatDate(dateStr: string) {
  return format(new Date(dateStr), 'EEE, MMM d')
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.btn-primary {
  padding: 0.5rem 1.5rem;
  background: #e94560;
  color: white;
  text-decoration: none;
  border-radius: 6px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.date-range input {
  padding: 0.4rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.date-range button {
  padding: 0.4rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
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
  padding: 3rem;
  color: #888;
}
</style>
