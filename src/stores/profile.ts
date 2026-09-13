import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api'
import type { UserProfile, FriendBrief } from '@/api'

export const profileStore = defineStore('profileStore', () => {
  const profile = ref<UserProfile | null>(null)
  const friends = ref<FriendBrief[]>([])
  const isLoading = ref(false)

  async function loadProfile(): Promise<void> {
    isLoading.value = true
    try {
      profile.value = await api.getProfile()
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(displayName: string): Promise<void> {
    await api.updateProfile(displayName)
    if (profile.value) {
      profile.value = { ...profile.value, displayName }
    }
  }

  async function loadFriends(): Promise<void> {
    isLoading.value = true
    try {
      friends.value = await api.listFriends()
    } finally {
      isLoading.value = false
    }
  }

async function addFriend(name: string): Promise<void> {
  await api.addFriend(name)
  await loadFriends()
}

async function removeFriend(friendId: string): Promise<void> {
  await api.removeFriend(friendId)
  friends.value = friends.value.filter(f => f.id !== friendId)
}

  return { profile, friends, isLoading, loadProfile, updateProfile, loadFriends, addFriend, removeFriend }
})
