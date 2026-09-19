import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api'
import type { ClubBrief } from '@/api'

export const clubsStore = defineStore('clubsStore', () => {
  const ownedClubs = ref<ClubBrief[]>([])
  const memberClubs = ref<ClubBrief[]>([])
  const currentClub = ref<api.Club | null>(null)
  const members = ref<api.ClubMember[]>([])
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

  async function loadMembers(clubId: string): Promise<void> {
    isLoading.value = true
    try {
      members.value = await api.listClubMembers(clubId)
    } finally {
      isLoading.value = false
    }
  }

  function removeFromMemberClubs(clubId: string): void {
    memberClubs.value = memberClubs.value.filter(c => c.id !== clubId)
  }

  async function create(name: string, sportTypeId: number): Promise<ClubBrief> {
    isCreating.value = true
    try {
      const club = await api.createClub(name, sportTypeId)
      ownedClubs.value.push(club)
      return club
    } finally {
      isCreating.value = false
    }
  }

  async function update(clubId: string, name: string, description: string | null, sportTypeId: number): Promise<void> {
    await api.updateClub(clubId, name, description, sportTypeId)
    if (currentClub.value?.id === clubId) {
      currentClub.value = {
        ...currentClub.value,
        name,
        description,
        sportTypeId
      }
    }
  }

  async function close(clubId: string): Promise<void> {
    await api.closeClub(clubId)
    if (currentClub.value?.id === clubId) {
      currentClub.value = { ...currentClub.value, closed: true }
    }
  }

  async function open(clubId: string): Promise<void> {
    await api.openClub(clubId)
    if (currentClub.value?.id === clubId) {
      currentClub.value = { ...currentClub.value, closed: false }
    }
  }

  return { ownedClubs, memberClubs, currentClub, members, isLoading, isCreating, loadOwned, loadMember, loadClub, loadMembers, removeFromMemberClubs, create, update, close, open }
})
