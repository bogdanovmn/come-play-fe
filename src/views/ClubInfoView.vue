<template>
  <div class="club-info-view" v-if="clubs.currentClub">
    <div class="header">
      <BackButton fallback="/trainings" />
      <h1>{{ clubs.currentClub.name }}</h1>
    </div>

    <div class="info-card">
      <div class="info-row">
        <span class="label">Вид спорта</span>
        <span class="value">{{ clubs.currentClub.sportTypeName }}</span>
      </div>
      <div class="info-row">
        <span class="label">Владелец</span>
        <span class="value">{{ clubs.currentClub.ownerName }}</span>
      </div>
      <div class="info-row">
        <span class="label">Клуб создан</span>
        <span class="value">{{ formatDate(clubs.currentClub.createdAt) }}</span>
      </div>
      <div class="info-row info-text">
        <span class="label">Описание</span>
        <span class="value" :class="{ empty: !clubs.currentClub.description }">
          {{ clubs.currentClub.description || 'Описание пока не добавлено.' }}
        </span>
      </div>
      <div v-if="clubs.currentClub.closed" class="closed-badge">Клуб закрыт</div>
    </div>
  </div>
  <div v-else class="loading">Загрузка...</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { clubsStore } from '@/stores/clubs'
import BackButton from '@/components/BackButton.vue'

const props = defineProps<{ clubId: string }>()
const clubs = clubsStore()

function formatDate(value: string) {
  return format(new Date(value), 'd MMM yyyy', { locale: ru })
}

onMounted(() => {
  clubs.loadClub(props.clubId)
})
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

h1 {
  font-size: 1.4rem;
  margin: 0;
}

.info-card {
  max-width: 640px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  gap: 1rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--color-row-border);
}

.info-row:last-of-type {
  border-bottom: none;
}

.info-text {
  align-items: flex-start;
}

.label {
  color: var(--color-muted);
  min-width: 150px;
}

.value {
  font-weight: 500;
  flex: 1;
  word-break: break-word;
  white-space: pre-wrap;
}

.value.empty {
  color: var(--color-muted);
  font-weight: 400;
}

.closed-badge {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.3rem 1rem;
  background: var(--color-danger-soft);
  color: var(--color-danger);
  border-radius: 4px;
  font-size: 0.9rem;
}

.loading {
  text-align: center;
  padding: 2.5rem;
  color: var(--color-muted);
}
</style>