<template>
  <div class="club-members">
    <div v-if="clubs.isLoading" class="loading">Загрузка...</div>
    <div v-else-if="clubs.members.length === 0" class="empty">В клубе пока нет участников.</div>
    <div v-else class="member-list">
      <div v-for="m in clubs.members" :key="m.id" class="member-row">
        <span class="member-main">
          <span class="member-name">
            <svg v-if="m.owner" class="crown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-label="Владелец клуба" title="Владелец клуба">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {{ m.name }}
          </span>
          <SkillBadge :skill="m.skill" />
        </span>
        <select
          v-if="isOwner"
          class="member-skill-select"
          :value="m.overridden ? m.skill || '' : ''"
          @change="handleSkillChange(m.id, ($event.target as HTMLSelectElement).value as string)"
        >
          <option value="">По умолчанию</option>
          <option v-for="s in SKILL_LEVELS" :key="s" :value="s">{{ SKILL_LABELS[s] }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { clubsStore } from '@/stores/clubs'
import { profileStore } from '@/stores/profile'
import { SKILL_LABELS, SKILL_LEVELS, clearMemberSkill, setMemberSkill, type SkillLevel } from '@/api'
import SkillBadge from '@/components/SkillBadge.vue'

const props = defineProps<{ clubId: string }>()
const clubs = clubsStore()
const profile = profileStore()

const isOwner = computed(() =>
  clubs.currentClub !== null && profile.profile !== null &&
  clubs.currentClub.ownerId === profile.profile.id
)

onMounted(async () => {
  await Promise.all([
    clubs.loadMembers(props.clubId),
    profile.loadProfile()
  ])
})

async function handleSkillChange(memberId: string, value: string) {
  if (value === '') {
    await clearMemberSkill(props.clubId, memberId)
  } else {
    await setMemberSkill(props.clubId, memberId, value as SkillLevel)
  }
  await clubs.loadMembers(props.clubId)
}
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
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.member-row:last-child {
  border-bottom: none;
}

.member-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  min-width: 0;
}

.member-name {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 500;
}

.crown {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--color-primary);
}

.member-skill-select {
  margin-left: auto;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.85rem;
  min-height: 36px;
  max-width: 100%;
}

.loading, .empty {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--color-muted);
}
</style>