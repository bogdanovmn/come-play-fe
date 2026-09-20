<template>
  <div class="invitations">
    <div class="heading-row">
      <BackButton :fallback="`/clubs/${clubId}`" />
      <h1>Приглашения</h1>
    </div>
    <div v-if="club" class="heading-sub">
      <span class="club-name">
        <span class="club-label">Клуб</span>
        «{{ club.name }}»<router-link :to="`/clubs/${clubId}/info`" class="info-icon" title="Информация о клубе" aria-label="Информация о клубе">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </router-link>
      </span>
    </div>

    <div v-if="invitationList.length === 0" class="empty">Пока нет приглашений.</div>

    <div v-else class="invitation-list">
      <div v-for="inv in invitationList" :key="inv.id" class="invitation-card" :class="{ inactive: !inv.active }">
        <div class="invitation-info">
          <div class="invitation-head">
            <strong>{{ inv.name }}</strong>
            <span v-if="!inv.active" class="inactive-badge">Неактивно</span>
          </div>
          <span class="joined">{{ inv.joinedCount }} {{ pluralRu(inv.joinedCount, 'присоединился', 'присоединились', 'присоединились') }}</span>
        </div>
        <div class="invitation-actions">
          <router-link :to="`/clubs/${clubId}/invitations/${inv.id}/joiners`" class="btn-icon" title="Участники" aria-label="Участники">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </router-link>
          <button v-if="inv.active" class="btn-icon" title="Копировать ссылку" aria-label="Копировать ссылку" @click="copyLink(inv.id)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
          <button v-if="inv.active" class="btn-icon btn-icon-danger" title="Удалить приглашение" aria-label="Удалить приглашение" @click="handleDelete(inv)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <button class="btn-primary btn-add" @click="showCreate = true">Новое приглашение</button>

    <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
      <div class="modal">
        <h2>Новое приглашение</h2>
        <input v-model="newName" placeholder="Название приглашения" @keyup.enter="handleCreate" />
        <div class="modal-actions">
          <button @click="showCreate = false">Отмена</button>
          <button class="btn-primary" @click="handleCreate" :disabled="!newName.trim()">Создать</button>
        </div>
      </div>
    </div>

    <div v-if="showCopyInfo" class="modal-overlay" @click.self="showCopyInfo = false">
      <div class="modal">
        <h2>Ссылка скопирована</h2>
        <p class="modal-text">Ссылка на вступление в клуб скопирована в буфер обмена.</p>
        <div class="modal-actions">
          <button class="btn-primary" @click="showCopyInfo = false">ОК</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import * as api from '@/api'
import type { InvitationBrief } from '@/api'
import { clubsStore } from '@/stores/clubs'
import BackButton from '@/components/BackButton.vue'
import { pluralRu } from '@/utils/plural'

const props = defineProps<{ clubId: string }>()
const invitationList = ref<InvitationBrief[]>([])
const showCreate = ref(false)
const showCopyInfo = ref(false)
const newName = ref('')

const clubs = clubsStore()
const club = computed(() => clubs.currentClub)

onMounted(async () => {
  await Promise.all([
    api.listInvitations(props.clubId).then(list => { invitationList.value = list }),
    clubs.loadClub(props.clubId)
  ])
})

async function handleCreate() {
  if (!newName.value.trim()) return
  await api.createInvitation(props.clubId, newName.value.trim())
  invitationList.value = await api.listInvitations(props.clubId)
  showCreate.value = false
  newName.value = ''
}

async function copyLink(invitationId: string) {
  const url = `${window.location.origin}/comeplay/invitations/${invitationId}`
  await navigator.clipboard.writeText(url)
  showCopyInfo.value = true
}

async function handleDelete(inv: InvitationBrief) {
  if (!window.confirm(`Удалить приглашение «${inv.name}»? Ссылка перестанет работать.`)) return
  await api.deleteInvitation(props.clubId, inv.id)
  inv.active = false
}
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

.club-name {
  display: inline;
  overflow-wrap: anywhere;
}

.club-label {
  opacity: 0.7;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: -0.2em;
  margin-left: 0.3rem;
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

.btn-primary {
  padding: 0.55rem 1.2rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  min-height: 40px;
  font-size: 1rem;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-add {
  margin-top: 1rem;
}

.invitation-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.invitation-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  gap: 0.5rem;
}

.invitation-info {
  flex: 1;
  min-width: 0;
}

.invitation-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.inactive-badge {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-muted);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.1rem 0.5rem;
  white-space: nowrap;
}

.invitation-card.inactive {
  opacity: 0.55;
}

.invitation-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.invitation-actions .btn-icon:last-child {
  margin-right: 0;
}

.joined {
  display: block;
  margin-top: 0.2rem;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-primary);
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

.btn-icon:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary-hover);
  border-color: var(--color-primary);
}

.btn-icon.btn-icon-danger {
  color: var(--color-danger);
}

.btn-icon.btn-icon-danger:hover {
  background: var(--color-danger-soft);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.btn-icon svg {
  width: 18px;
  height: 18px;
}

.empty { text-align: center; padding: 2.5rem; color: var(--color-muted); }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  z-index: 100;
}

.modal {
  background: var(--color-surface);
  padding: 1.25rem;
  border-radius: 8px;
  width: 100%;
  max-width: 420px;
}

.modal h2 {
  margin: 0 0 0.5rem;
}

.modal-text {
  color: var(--color-text);
  line-height: 1.5;
}

.modal input {
  width: 100%;
  padding: 0.6rem;
  margin: 0.5rem 0;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-sizing: border-box;
  min-height: 44px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.modal-actions button {
  padding: 0.55rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  min-height: 40px;
}
</style>