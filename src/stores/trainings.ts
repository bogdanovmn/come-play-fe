import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api'
import type { TrainingBrief, TrainingSlot } from '@/api'

export const trainingsStore = defineStore('trainingsStore', () => {
  const trainings = ref<TrainingBrief[]>([])
  const slots = ref<TrainingSlot[]>([])
  const slot = ref<TrainingSlot | null>(null)
  const isLoading = ref(false)

  async function loadSlot(slotId: string): Promise<void> {
    isLoading.value = true
    try {
      slot.value = await api.getSlot(slotId)
    } finally {
      isLoading.value = false
    }
  }

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

  async function update(
    clubId: string,
    trainingId: string,
    dayOfWeek: api.DayOfWeek,
    startTime: string,
    endTime: string,
    maxPlayers: number
  ): Promise<TrainingBrief> {
    const training = await api.updateTraining(clubId, trainingId, dayOfWeek, startTime, endTime, maxPlayers)
    const index = trainings.value.findIndex(t => t.id === trainingId)
    if (index !== -1) trainings.value[index] = training
    return training
  }

  return { trainings, slots, slot, isLoading, loadTrainings, loadSlots, loadSlotsByTraining, loadSlot, create, remove, update }
})
