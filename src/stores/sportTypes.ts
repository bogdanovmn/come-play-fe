import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api'
import type { SportType } from '@/api'

export const sportTypesStore = defineStore('sportTypesStore', () => {
  const sportTypes = ref<SportType[]>([])
  const isLoading = ref(false)

  async function load(): Promise<void> {
    if (sportTypes.value.length > 0) return
    isLoading.value = true
    try {
      sportTypes.value = await api.listSportTypes()
    } finally {
      isLoading.value = false
    }
  }

  async function add(name: string): Promise<void> {
    const created = await api.createSportType(name)
    sportTypes.value.push(created)
  }

  return { sportTypes, isLoading, load, add }
})