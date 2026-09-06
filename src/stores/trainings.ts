import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api'
import type { TrainingBrief, TrainingSlot } from '@/api'

export const trainingsStore = defineStore('trainingsStore', () => {
  const trainings = ref<TrainingBrief[]>([])
  const slots = ref<TrainingSlot[]>([])
  const isLoading = ref(false)

  async function loadTrainings(clubId: string): Promise<void> {
    isLoading.value = true
    try {
      trainings.value = await api.listTrainings(clubId)
    } finally {
      isLoading.value = false
    }
  }

  async function loadSlots(clubId: string, from: string, to: string): Promise<void> {
    isLoading.value = true
    try {
      slots.value = await api.listSlots(clubId, from, to)
    } finally {
      isLoading.value = false
    }
  }

  async function loadSlotsByTraining(clubId: string, trainingId: string): Promise<void> {
    isLoading.value = true
    try {
      slots.value = await api.listSlotsByTraining(clubId, trainingId)
    } finally {
      isLoading.value = false
    }
  }

  async function create(
    clubId: string,
    dayOfWeek: api.DayOfWeek,
    startTime: string,
    endTime: string,
    maxPlayers: number
  ): Promise<TrainingBrief> {
    const training = await api.createTraining(clubId, dayOfWeek, startTime, endTime, maxPlayers)
    trainings.value.push(training)
    return training
  }

  async function remove(clubId: string, trainingId: string): Promise<void> {
    await api.deleteTraining(clubId, trainingId)
    trainings.value = trainings.value.filter(t => t.id !== trainingId)
  }

  return { trainings, slots, isLoading, loadTrainings, loadSlots, loadSlotsByTraining, create, remove }
})
