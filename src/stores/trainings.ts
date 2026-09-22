import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api'
import type { TrainingBrief, TrainingSlot } from '@/api'

export const trainingsStore = defineStore('trainingsStore', () => {
  const trainings = ref<TrainingBrief[]>([])
  const slots = ref<TrainingSlot[]>([])
  const historySlots = ref<TrainingSlot[]>([])
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

  async function loadHistorySlots(clubId: string, days: number): Promise<void> {
    isLoading.value = true
    try {
      historySlots.value = await api.listHistorySlots(clubId, days)
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
    maxPlayers: number,
    features: string | null
  ): Promise<TrainingBrief> {
    const training = await api.createTraining(clubId, dayOfWeek, startTime, endTime, maxPlayers, features)
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
    maxPlayers: number,
    features: string | null
  ): Promise<TrainingBrief> {
    const training = await api.updateTraining(clubId, trainingId, dayOfWeek, startTime, endTime, maxPlayers, features)
    const index = trainings.value.findIndex(t => t.id === trainingId)
    if (index !== -1) trainings.value[index] = training
    return training
  }

  function replaceSlot(updated: TrainingSlot): void {
    const index = slots.value.findIndex(s => s.id === updated.id)
    if (index !== -1) slots.value[index] = updated
  }

  async function updateSlotParams(
    slotId: string,
    startTime: string,
    endTime: string,
    maxPlayers: number,
    features: string | null
  ): Promise<TrainingSlot> {
    const updated = await api.updateSlotParams(slotId, startTime, endTime, maxPlayers, features)
    replaceSlot(updated)
    return updated
  }

  async function clearSlotParams(slotId: string): Promise<TrainingSlot> {
    const updated = await api.clearSlotParams(slotId)
    replaceSlot(updated)
    return updated
  }

  async function cancelSlot(slotId: string): Promise<TrainingSlot> {
    const updated = await api.cancelSlot(slotId)
    replaceSlot(updated)
    return updated
  }

  async function restoreSlot(slotId: string): Promise<TrainingSlot> {
    const updated = await api.restoreSlot(slotId)
    replaceSlot(updated)
    return updated
  }

  return { trainings, slots, historySlots, slot, isLoading, loadTrainings, loadSlots, loadHistorySlots, loadSlotsByTraining, loadSlot, create, remove, update, updateSlotParams, clearSlotParams, cancelSlot, restoreSlot }
})
