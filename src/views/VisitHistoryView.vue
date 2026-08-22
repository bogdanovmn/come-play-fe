<template>
  <div class="history">
    <h1>Visit History</h1>

    <div class="date-range">
      <label>From:</label>
      <input type="date" v-model="from" />
      <label>To:</label>
      <input type="date" v-model="to" />
      <button @click="loadHistory">Show</button>
    </div>

    <div class="tabs">
      <button :class="{ active: tab === 'day' }" @click="tab = 'day'">By Day</button>
      <button :class="{ active: tab === 'player' }" @click="tab = 'player'">By Player</button>
    </div>

    <div v-if="loading" class="loading">Loading...</div>

    <div v-else-if="tab === 'day'">
      <div v-if="byDay.length === 0" class="empty">No data for this period.</div>
      <table velse class="history-table">
        <thead><tr><th>Date</th><th>Visits</th></tr></thead>
        <tbody>
          <tr v-for="v in byDay" :key="v.date">
            <td>{{ formatDate(v.date) }}</td>
            <td>{{ v.visitCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else>
      <div v-if="byPlayer.length === 0" class="empty">No data for this period.</div>
      <table velse class="history-table">
        <thead><tr><th>Player</th><th>Visits</th></tr></thead>
        <tbody>
          <tr v-for="v in byPlayer" :key="v.userId">
            <td>{{ v.userId }}</td>
            <td>{{ v.visitCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { format } from 'date-fns'
import * as api from '@/api'
import type { VisitByDay, VisitByPlayer } from '@/api'

const props = defineProps<{ clubId: string }>()

const from = ref(format(new Date(Date.now() - 90 * 86400000), 'yyyy-MM-dd'))
const to = ref(format(new Date(), 'yyyy-MM-dd'))
const tab = ref<'day' | 'player'>('day')
const byDay = ref<VisitByDay[]>([])
const byPlayer = ref<VisitByPlayer[]>([])
const loading = ref(false)

onMounted(() => {
  loadHistory()
})

async function loadHistory() {
  loading.value = true
  try {
    const [dayData, playerData] = await Promise.all([
      api.visitByDay(props.clubId, from.value, to.value),
      api.visitByPlayer(props.clubId, from.value, to.value)
    ])
    byDay.value = dayData
    byPlayer.value = playerData
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string) {
  return format(new Date(dateStr), 'MMM d, yyyy')
}
</script>

<style scoped>
.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
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

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tabs button {
  padding: 0.4rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background: white;
}

.tabs button.active {
  background: #e94560;
  color: white;
  border-color: #e94560;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th,
.history-table td {
  padding: 0.6rem;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.history-table th {
  font-weight: bold;
  background: #f5f5f5;
}

.loading, .empty {
  text-align: center;
  padding: 3rem;
  color: #888;
}
</style>
