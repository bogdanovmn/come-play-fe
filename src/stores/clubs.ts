import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api'
import type { ClubBrief } from '@/api'

export const clubsStore = defineStore('clubsStore', () => {
  const ownedClubs = ref<ClubBrief[]>([])
  const memberClubs = ref<ClubBrief[]>([])
  const currentClub = ref<api.Club | null>(null)
  const isLoading = ref(false)
  const isCreating = ref(false)

  async function loadOwned(): Promise<void> {
    isLoading.value = true
    try {
      ownedClubs.value = await api.listOwnedClubs()
    } finally {
      isLoading.value = false
    }
  }

  async function loadMember(): Promise<void> {
    isLoading.value = true
    try {
      memberClubs.value = await api.listMemberClubs()
    } finally {
      isLoading.value = false
    }
  }

  async function loadClub(clubId: string): Promise<void> {
    isLoading.value = true
    try {
      currentClub.value = await api.getClub(clubId)
    } finally {
      isLoading.value = false
    }
  }

  async function create(name: string): Promise<ClubBrief> {
    isCreating.value = true
    try {
      const club = await api.createClub(name)
      ownedClubs.value.push(club)
      return club
    } finally {
      isCreating.value = false
    }
  }

  async function update(clubId: string, name: string): Promise<void> {
    await api.updateClub(clubId, name)
    if (currentClub.value?.id === clubId) {
      currentClub.value = { ...currentClub.value, name }
    }
  }

  async function close(clubId: string): Promise<void> {
    await api.closeClub(clubId)
    if (currentClub.value?.id === clubId) {
      currentClub.value = { ...currentClub.value, closed: true }
    }
  }

  return { ownedClubs, memberClubs, currentClub, isLoading, isCreating, loadOwned, loadMember, loadClub, create, update, close }
})
