import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api'
import type { UserProfile, FriendBrief, PlayerSkill, SportSkillUpdate } from '@/api'

export const profileStore = defineStore('profileStore', () => {
  const profile = ref<UserProfile | null>(null)
  const friends = ref<FriendBrief[]>([])
  const skills = ref<PlayerSkill[]>([])
  const isLoading = ref(false)

  async function loadProfile(): Promise<void> {
    isLoading.value = true
    try {
      profile.value = await api.getProfile()
    } finally {
      isLoading.value = false
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

  async function loadSkills(): Promise<void> {
    isLoading.value = true
    try {
      skills.value = await api.listMySportSkills()
    } finally {
      isLoading.value = false
    }
  }

  async function saveSettings(displayName: string, sportSkills: SportSkillUpdate[]): Promise<void> {
    await api.saveSettings(displayName, sportSkills)
    if (profile.value) {
      profile.value = { ...profile.value, displayName }
    }
    await loadSkills()
  }

  return { profile, friends, skills, isLoading, loadProfile, loadFriends, addFriend, removeFriend, loadSkills, saveSettings }
})
