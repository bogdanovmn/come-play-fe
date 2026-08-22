<template>
  <div class="club-edit" v-if="clubs.currentClub">
    <h1>Edit Club</h1>
    <div class="form">
      <label>Name</label>
      <input v-model="name" placeholder="Club name" />
      <div class="form-actions">
        <button @click="handleSave" :disabled="!name.trim()">Save</button>
        <button class="btn-close" @click="handleClose" v-if="!clubs.currentClub.closed">Close Club</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { clubsStore } from '@/stores/clubs'

const props = defineProps<{ clubId: string }>()
const router = useRouter()
const clubs = clubsStore()
const name = ref('')

onMounted(async () => {
  await clubs.loadClub(props.clubId)
  if (clubs.currentClub) {
    name.value = clubs.currentClub.name
  }
})

async function handleSave() {
  await clubs.update(props.clubId, name.value)
  router.push(`/clubs/${props.clubId}`)
}

async function handleClose() {
  if (confirm('Close this club? No new trainings will be created.')) {
    await clubs.close(props.clubId)
    router.push(`/clubs/${props.clubId}`)
  }
}
</script>

<style scoped>
.form {
  max-width: 400px;
}

.form label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: bold;
}

.form input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.form-actions button {
  padding: 0.5rem 1.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.btn-close {
  color: #c00 !important;
}
</style>
