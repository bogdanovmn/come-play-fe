<template>
  <div class="invitations">
    <div class="header">
      <BackButton :fallback="`/clubs/${clubId}`" />
      <h1>Приглашения</h1>
      <button class="btn-primary" @click="showCreate = true">Новое приглашение</button>
    </div>

    <div v-if="invitationList.length === 0" class="empty">Пока нет приглашений.</div>

    <div v-else class="invitation-list">
      <div v-for="inv in invitationList" :key="inv.id" class="invitation-card">
        <div>
          <strong>{{ inv.name }}</strong>
          <span class="joined">{{ inv.joinedCount }} присоед.</span>
        </div>
        <button class="btn-copy" @click="copyLink(inv.id)">Копировать</button>
      </div>
    </div>

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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as api from '@/api'
import type { InvitationBrief } from '@/api'
import BackButton from '@/components/BackButton.vue'

const props = defineProps<{ clubId: string }>()
const invitationList = ref<InvitationBrief[]>([])
const showCreate = ref(false)
const newName = ref('')

onMounted(async () => {
  invitationList.value = await api.listInvitations(props.clubId)
})

async function handleCreate() {
  if (!newName.value.trim()) return
  await api.createInvitation(props.clubId, newName.value.trim())
  invitationList.value = await api.listInvitations(props.clubId)
  showCreate.value = false
  newName.value = ''
}

function copyLink(invitationId: string) {
  const url = `${window.location.origin}/come-play/invitations/${invitationId}`
  navigator.clipboard.writeText(url)
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

h1 { font-size: 1.5rem; }

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

.joined {
  display: block;
  margin-top: 0.2rem;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.btn-copy {
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  background: var(--color-surface);
  min-height: 40px;
  white-space: nowrap;
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