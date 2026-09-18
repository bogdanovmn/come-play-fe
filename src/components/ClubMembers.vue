<template>
  <div class="club-members">
    <div v-if="clubs.isLoading" class="loading">Загрузка...</div>
    <div v-else-if="clubs.members.length === 0" class="empty">В клубе пока нет участников.</div>
    <div v-else class="member-list">
      <div v-for="m in clubs.members" :key="m.id" class="member-row">
        <span>{{ m.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { clubsStore } from '@/stores/clubs'

const props = defineProps<{ clubId: string }>()
const clubs = clubsStore()

onMounted(() => {
  clubs.loadMembers(props.clubId)
})
</script>

<style scoped>
.member-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.member-row {
  padding: 0.6rem;
  border-bottom: 1px solid var(--color-row-border);
  word-break: break-word;
}

.member-row:last-child {
  border-bottom: none;
}

.loading, .empty {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--color-muted);
}
</style>