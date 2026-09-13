<template>
  <div class="club-edit" v-if="clubs.currentClub">
    <div class="heading-row">
      <BackButton fallback="/trainings" />
      <h1>Настройки клуба</h1>
    </div>
    <div class="form">
      <label>Название</label>
      <input v-model="name" placeholder="Название клуба" />

      <label>Вид спорта</label>
      <select v-model="sportTypeId">
        <option v-if="sportTypes.length === 0" value="" disabled>
          {{ sportTypesStoreInstance.isLoading ? 'Загрузка видов спорта...' : 'Нет доступных видов спорта' }}
        </option>
        <option v-if="clubSportTypeMissing" :value="clubs.currentClub!.sportTypeId">
          {{ clubs.currentClub!.sportTypeName }}
        </option>
        <option v-for="s in sportTypes" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>

      <label>Описание</label>
      <textarea v-model="description" rows="4" maxlength="2000" placeholder="Расскажите о клубе: место, уровень игры, инвентарь и т.д."></textarea>

      <div class="form-actions">
        <button @click="handleSave" :disabled="!name.trim()">Сохранить</button>
        <button class="btn-close" @click="handleClose" v-if="!clubs.currentClub.closed">Закрыть клуб</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { clubsStore } from '@/stores/clubs'
import { sportTypesStore } from '@/stores/sportTypes'
import BackButton from '@/components/BackButton.vue'

const props = defineProps<{ clubId: string }>()
const router = useRouter()
const clubs = clubsStore()
const sportTypesStoreInstance = sportTypesStore()
const name = ref('')
const description = ref('')
const sportTypeId = ref<number | null>(null)
const sportTypes = sportTypesStoreInstance.sportTypes

const clubSportTypeMissing = computed(() => {
  const club = clubs.currentClub
  return club !== null && !sportTypes.some(s => s.id === club.sportTypeId)
})

onMounted(async () => {
  const loadSportTypes = sportTypesStoreInstance.load()
  await Promise.all([
    clubs.loadClub(props.clubId),
    loadSportTypes
  ])
  if (clubs.currentClub) {
    name.value = clubs.currentClub.name
    description.value = clubs.currentClub.description ?? ''
    sportTypeId.value = clubs.currentClub.sportTypeId
  }
})

async function handleSave() {
  if (sportTypeId.value === null) return
  await clubs.update(props.clubId, name.value, description.value.trim() || null, sportTypeId.value)
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
}

.heading-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.form {
  max-width: 400px;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}

.form label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 500;
}

.form input, .form select, .form textarea {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-sizing: border-box;
  margin-bottom: 1rem;
  min-height: 44px;
}

.form textarea {
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.form-actions button {
  padding: 0.55rem 1.2rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  min-height: 40px;
  font-size: 1rem;
}

.form-actions button:first-child {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
}

.form-actions button:first-child:hover {
  background: var(--color-primary-hover);
}

.btn-close {
  color: var(--color-danger) !important;
}
</style>