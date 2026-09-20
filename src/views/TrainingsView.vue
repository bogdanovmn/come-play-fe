<template>
  <div class="trainings-page">
    <h1>Тренировки</h1>
    <p class="subtitle">Клубы, в которых вы состоите</p>

    <div v-if="clubs.isLoading" class="loading">Загрузка...</div>

    <div v-else-if="clubs.memberClubs.length === 0" class="empty">
      Вы пока не состоите ни в одном клубе.
    </div>

    <div v-else class="club-list">
      <div v-for="club in clubs.memberClubs" :key="club.id" class="club-card" @click="router.push(`/clubs/${club.id}/trainings`)">
        <div class="club-card-head">
          <h3 class="club-title">
            {{ club.name }}
            <span class="sport-type">{{ club.sportTypeName }}</span>
          </h3>
          <button
            v-if="!isOwned(club.id)"
            class="leave-btn"
            title="Выйти из клуба"
            aria-label="Выйти из клуба"
            @click.stop="handleLeave(club)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <span class="members">{{ club.membersCount }} {{ pluralRu(club.membersCount, 'участник', 'участника', 'участников') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { clubsStore } from '@/stores/clubs'
import * as api from '@/api'
import type { ClubBrief } from '@/api'
import { pluralRu } from '@/utils/plural'

const router = useRouter()
const clubs = clubsStore()

const ownedIds = computed(() => new Set(clubs.ownedClubs.map(c => c.id)))

function isOwned(clubId: string): boolean {
  return ownedIds.value.has(clubId)
}

onMounted(async () => {
  await Promise.all([
    clubs.loadMember(),
    clubs.loadOwned()
  ])
})

async function handleLeave(club: ClubBrief) {
  if (!window.confirm(`Выйти из клуба «${club.name}»?`)) return
  await api.leaveClub(club.id)
  clubs.removeFromMemberClubs(club.id)
}
</script>

<style scoped>
h1 {
  font-size: 1.35rem;
}

.subtitle {
  color: var(--color-muted);
  margin: 0.25rem 0 1.5rem;
}

.club-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.6rem;
}

.club-card {
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.club-card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.club-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 1px 4px rgba(93, 74, 53, 0.15);
}

.leave-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  min-height: 32px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: none;
  color: var(--color-muted);
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  flex-shrink: 0;
}

.leave-btn:hover {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.leave-btn svg {
  width: 18px;
  height: 18px;
}

.club-title {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  column-gap: 0.5rem;
  margin: 0 0 0.4rem;
  font-size: 1.05rem;
  overflow-wrap: anywhere;
}

.sport-type {
  font-size: 0.7rem;
  font-weight: 400;
  background: var(--color-primary-soft);
  border-radius: 4px;
  padding: 0.1rem 0.5rem;
  vertical-align: super;
  white-space: nowrap;
}

.members { display: block; color: var(--color-muted); font-size: 0.9rem; }

.loading, .empty {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--color-muted);
}

@media (min-width: 600px) {
  .club-list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}
</style>