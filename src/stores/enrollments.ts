import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api'
import type { Enrollment, Comment } from '@/api'

export const enrollmentsStore = defineStore('enrollmentsStore', () => {
  const enrollments = ref<Enrollment[]>([])
  const comments = ref<Comment[]>([])
  const isLoading = ref(false)

  async function loadEnrollments(slotId: string): Promise<void> {
    isLoading.value = true
    try {
      enrollments.value = await api.listEnrollments(slotId)
    } finally {
      isLoading.value = false
    }
  }

  async function loadComments(slotId: string): Promise<void> {
    isLoading.value = true
    try {
      comments.value = await api.listComments(slotId)
    } finally {
      isLoading.value = false
    }
  }

async function enroll(slotId: string, friendId?: string): Promise<void> {
  await api.enroll(slotId, friendId)
  await loadEnrollments(slotId)
}

async function unenroll(slotId: string, friendId?: string): Promise<void> {
  await api.unenroll(slotId, friendId)
  await loadEnrollments(slotId)
}

async function setComingLater(slotId: string, comingLater: boolean): Promise<void> {
  await api.setComingLater(slotId, comingLater)
  await loadEnrollments(slotId)
}

  async function addComment(slotId: string, text: string): Promise<Comment> {
    const comment = await api.createComment(slotId, text)
    comments.value.push(comment)
    return comment
  }

  return { enrollments, comments, isLoading, loadEnrollments, loadComments, enroll, unenroll, setComingLater, addComment }
})
