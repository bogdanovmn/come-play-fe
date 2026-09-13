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
      <div v-if="clubs.currentClub.closed" class="closed-badge">Клуб закрыт</div>
    </div>

    <div class="section">
      <h2>Описание</h2>
      <p v-if="clubs.currentClub.description" class="description">{{ clubs.currentClub.description }}</p>
      <p v-else class="empty">Описание пока не добавлено.</p>
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
  gap: 0.75rem;
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
  justify-content: space-between;
  gap: 1rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--color-row-border);
}

.info-row:last-of-type {
  border-bottom: none;
}

.label {
  color: var(--color-muted);
}

.value {
  font-weight: 500;
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

.section {
  margin-bottom: 1.5rem;
}

.section h2 {
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
}

.description {
  line-height: 1.5;
  white-space: pre-wrap;
  max-width: 640px;
}

.empty {
  color: var(--color-muted);
}

.loading {
  text-align: center;
  padding: 2.5rem;
  color: var(--color-muted);
}
</style>