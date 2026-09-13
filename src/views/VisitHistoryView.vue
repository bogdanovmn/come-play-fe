<template>
  <div class="history">
    <div class="heading-row">
      <BackButton :fallback="`/clubs/${clubId}`" />
      <h1>История посещений</h1>
    </div>

    <p class="subtitle">За последние 3 месяца</p>

    <div class="tabs">
      <button :class="{ active: tab === 'day' }" @click="tab = 'day'">По дням</button>
      <button :class="{ active: tab === 'player' }" @click="tab = 'player'">По игрокам</button>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>

    <div v-else-if="tab === 'day'">
      <div v-if="byDay.length === 0" class="empty">Нет данных за этот период.</div>
      <table class="history-table">
        <thead><tr><th>Дата</th><th>Посещения</th></tr></thead>
        <tbody>
          <tr v-for="v in byDay" :key="v.date">
            <td>{{ formatDate(v.date) }}</td>
            <td>{{ v.visitCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else>
      <div v-if="byPlayer.length === 0" class="empty">Нет данных за этот период.</div>
      <table class="history-table">
        <thead><tr><th>Игрок</th><th>Посещения</th></tr></thead>
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
import { ru } from 'date-fns/locale'
import * as api from '@/api'
import type { VisitByDay, VisitByPlayer } from '@/api'
import BackButton from '@/components/BackButton.vue'

const props = defineProps<{ clubId: string }>()

const to = format(new Date(), 'yyyy-MM-dd')
const from = format(new Date(Date.now() - 90 * 86400000), 'yyyy-MM-dd')
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
      api.visitByDay(props.clubId, from, to),
      api.visitByPlayer(props.clubId, from, to)
    ])
    byDay.value = dayData
    byPlayer.value = playerData
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string) {
  return format(new Date(dateStr), 'd MMM yyyy', { locale: ru })
}
</script>

<style scoped>
h1 {
  font-size: 1.35rem;
}

.heading-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: var(--color-muted);
  font-size: 0.9rem;
  margin: 0 0 1.5rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tabs button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  background: var(--color-surface);
  min-height: 40px;
}

.tabs button.active {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th,
.history-table td {
  padding: 0.6rem;
  border-bottom: 1px solid var(--color-row-border);
  text-align: left;
}

.history-table th {
  font-weight: bold;
  background: var(--color-primary-soft);
}

.loading, .empty {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--color-muted);
}
</style>