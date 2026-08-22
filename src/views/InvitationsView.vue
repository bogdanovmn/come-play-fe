<template>
  <div class="invitations">
    <div class="header">
      <h1>Invitations</h1>
      <button class="btn-primary" @click="showCreate = true">New Invitation</button>
    </div>

    <div v-if="invitationList.length === 0" class="empty">No invitations yet.</div>

    <div v-else class="invitation-list">
      <div v-for="inv in invitationList" :key="inv.id" class="invitation-card">
        <div>
          <strong>{{ inv.name }}</strong>
          <span class="joined">{{ inv.joinedCount }} joined</span>
        </div>
        <button class="btn-copy" @click="copyLink(inv.id)">Copy Link</button>
      </div>
    </div>

    <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
      <div class="modal">
        <h2>New Invitation</h2>
        <input v-model="newName" placeholder="Invitation name" @keyup.enter="handleCreate" />
        <div class="modal-actions">
          <button @click="showCreate = false">Cancel</button>
          <button class="btn-primary" @click="handleCreate" :disabled="!newName.trim()">Create</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as api from '@/api'
import type { InvitationBrief } from '@/api'

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
  margin-bottom: 2rem;
}

.btn-primary {
  padding: 0.5rem 1.5rem;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
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
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.joined {
  margin-left: 1rem;
  color: #888;
  font-size: 0.9rem;
}

.btn-copy {
  padding: 0.3rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background: white;
}

.empty { text-align: center; padding: 3rem; color: #888; }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
}

.modal input {
  width: 100%;
  padding: 0.6rem;
  margin: 1rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.modal-actions button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}
</style>
