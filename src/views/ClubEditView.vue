<template>
  <div class="club-edit" v-if="clubs.currentClub">
    <h1>Настройки клуба</h1>
    <div class="form">
      <label>Название</label>
      <input v-model="name" placeholder="Название клуба" />

      <label>Вид спорта</label>
      <select v-model="sportTypeId">
        <option v-for="s in sportTypes" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>

      <div class="form-actions">
        <button @click="handleSave" :disabled="!name.trim()">Сохранить</button>
        <button class="btn-close" @click="handleClose" v-if="!clubs.currentClub.closed">Закрыть клуб</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { clubsStore } from '@/stores/clubs'
import { sportTypesStore } from '@/stores/sportTypes'

const props = defineProps<{ clubId: string }>()
const router = useRouter()
const clubs = clubsStore()
const sportTypesStoreInstance = sportTypesStore()
const name = ref('')
const sportTypeId = ref<number | null>(null)
const sportTypes = sportTypesStoreInstance.sportTypes

onMounted(async () => {
  await clubs.loadClub(props.clubId)
  await sportTypesStoreInstance.load()
  if (clubs.currentClub) {
    name.value = clubs.currentClub.name
    sportTypeId.value = clubs.currentClub.sportTypeId
  }
})

async function handleSave() {
  if (sportTypeId.value === null) return
  await clubs.update(props.clubId, name.value, sportTypeId.value)
  router.push(`/clubs/${props.clubId}`)
}

async function handleClose() {
  if (confirm('Закрыть клуб? Новые тренировки создаваться не будут. История останется доступной.')) {
    await clubs.close(props.clubId)
    router.push(`/clubs/${props.clubId}`)
  }
}
</script>

<style scoped>
h1 {
  font-size: 1.35rem;
  margin-bottom: 1.5rem;
}

.form {
  max-width: 400px;
  padding: 1rem;
  border: 1px solid #d5e3d6;
  border-radius: 8px;
  background: white;
}

.form label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 500;
}

.form input, .form select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #d5e3d6;
  border-radius: 4px;
  box-sizing: border-box;
  margin-bottom: 1rem;
  min-height: 44px;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.form-actions button {
  padding: 0.55rem 1.2rem;
  border: 1px solid #d5e3d6;
  border-radius: 4px;
  cursor: pointer;
  min-height: 40px;
  font-size: 1rem;
}

.form-actions button:first-child {
  background: #2e7d32;
  color: white;
  border-color: #2e7d32;
}

.form-actions button:first-child:hover {
  background: #245c27;
}

.btn-close {
  color: #c62828 !important;
}
</style>