<template>
  <div class="joiners" v-if="club">
    <div class="heading-row">
      <BackButton :fallback="`/clubs/${clubId}/invitations`" />
      <h1>Участники</h1>
    </div>
    <div class="heading-sub">
      <span>Клуб {{ club.name }}</span>
      <router-link :to="`/clubs/${clubId}/info`" class="info-icon" title="Информация о клубе" aria-label="Информация о клубе">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      </router-link>
    </div>

    <div v-if="joiners.length === 0" class="empty">Никто ещё не присоединился по этому приглашению.</div>

    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Дата регистрации</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="j in joiners" :key="j.userId">
            <td>{{ j.name }}</td>
            <td>{{ formatDate(j.registeredAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div v-else class="loading">Загрузка...</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import * as api from '@/api'
import type { InvitationJoiner } from '@/api'
import { clubsStore } from '@/stores/clubs'
import BackButton from '@/components/BackButton.vue'

const props = defineProps<{ clubId: string; invitationId: string }>()
const joiners = ref<InvitationJoiner[]>([])

const clubs = clubsStore()
const club = computed(() => clubs.currentClub)

function formatDate(value: string) {
  return format(new Date(value), 'd MMMM yyyy', { locale: ru })
}

onMounted(async () => {
  await Promise.all([
    api.listInvitationJoiners(props.clubId, props.invitationId).then(list => { joiners.value = list }),
    clubs.loadClub(props.clubId)
  ])
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

h1 {
  font-size: 1.5rem;
  margin: 0;
}

.heading-sub {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--color-muted);
  margin: 0 0 1rem 48px;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

.table-wrap {
  max-width: 640px;
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  text-align: left;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid var(--color-row-border);
}

th {
  font-size: 0.85rem;
  color: var(--color-muted);
  font-weight: 600;
}

tbody tr:last-child td {
  border-bottom: none;
}

.empty {
  text-align: center;
  padding: 2.5rem;
  color: var(--color-muted);
}

.loading {
  text-align: center;
  padding: 2.5rem;
  color: var(--color-muted);
}
</style>