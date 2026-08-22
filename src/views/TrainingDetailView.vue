<template>
  <div class="training-detail" v-if="!enrollments.isLoading">
    <div class="header">
      <h1>Training Slot</h1>
      <div class="actions">
        <button v-if="!isEnrolled" class="btn-primary" @click="handleEnroll">Sign Up</button>
        <button v-else class="btn-danger" @click="handleUnenroll">Cancel</button>
      </div>
    </div>

    <div class="section">
      <h2>Signed Up ({{ enrollments.enrollments.length }})</h2>
      <div v-if="enrollments.enrollments.length === 0" class="empty">No one signed up yet.</div>
      <div v-else class="enrollment-list">
        <div v-for="e in enrollments.enrollments" :key="e.userId" class="enrollment-item">
          <span>{{ e.userId }}</span>
          <span class="by" v-if="e.enrolledBy !== e.userId">by {{ e.enrolledBy }}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Friends</h2>
      <div v-if="profile.friends.length === 0" class="empty">No friends added yet.</div>
      <div v-else class="friend-list">
        <div v-for="f in profile.friends" :key="f.id" class="friend-item">
          <span>{{ f.displayName }}</span>
          <button @click="handleEnrollFriend(f.id)">Sign Up</button>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Comments</h2>
      <div class="comment-list">
        <div v-for="c in enrollments.comments" :key="c.id" class="comment-item">
          <strong>{{ c.userId }}:</strong> {{ c.text }}
        </div>
      </div>
      <div class="comment-input">
        <input v-model="newComment" placeholder="Add a comment..." @keyup.enter="handleComment" />
        <button @click="handleComment" :disabled="!newComment.trim()">Send</button>
      </div>
    </div>
  </div>
  <div v-else class="loading">Loading...</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { enrollmentsStore } from '@/stores/enrollments'
import { profileStore } from '@/stores/profile'
import { authStore } from '@/stores/auth'

const props = defineProps<{ slotId: string }>()
const enrollments = enrollmentsStore()
const profile = profileStore()
const auth = authStore()
const newComment = ref('')

const isEnrolled = computed(() =>
  enrollments.enrollments.some(e => e.userId === auth.userName)
)

onMounted(async () => {
  await Promise.all([
    enrollments.loadEnrollments(props.slotId),
    enrollments.loadComments(props.slotId),
    profile.loadFriends()
  ])
})

async function handleEnroll() {
  await enrollments.enroll(props.slotId)
}

async function handleUnenroll() {
  await enrollments.unenroll(props.slotId)
}

async function handleEnrollFriend(friendId: string) {
  await enrollments.enroll(props.slotId, friendId)
}

async function handleComment() {
  if (!newComment.value.trim()) return
  await enrollments.addComment(props.slotId, newComment.value.trim())
  newComment.value = ''
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-primary {
  padding: 0.5rem 1.5rem;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-danger {
  padding: 0.5rem 1.5rem;
  background: #c00;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.section {
  margin-bottom: 2rem;
}

.section h2 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.enrollment-list, .friend-list, .comment-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.enrollment-item, .friend-item, .comment-item {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.by {
  color: #888;
  font-size: 0.85rem;
}

.friend-item button {
  padding: 0.2rem 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background: white;
}

.comment-input {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.comment-input input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.comment-input button {
  padding: 0.5rem 1rem;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.empty { color: #888; }
.loading { text-align: center; padding: 3rem; color: #888; }
</style>
