<template>
  <div class="training-detail" v-if="enrollments.isLoading || profile.profile === null">
    <div class="loading">Загрузка...</div>
  </div>
  <div class="training-detail" v-else>
    <div class="header">
      <h1>Тренировка</h1>
      <div class="actions">
        <button v-if="!isEnrolled" class="btn-primary" @click="handleEnroll">Записаться</button>
        <button v-else class="btn-danger" @click="handleUnenroll">Отменить запись</button>
      </div>
    </div>

    <div class="section">
      <h2>Записаны ({{ enrollments.enrollments.length }})</h2>
      <div v-if="enrollments.enrollments.length === 0" class="empty">Пока никто не записан.</div>
      <div v-else class="enrollment-list">
        <div v-for="e in enrollments.enrollments" :key="e.userId" class="enrollment-item">
          <span>{{ displayName(e.userId) }}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Друзья</h2>
      <div v-if="profile.friends.length === 0" class="empty">Друзей пока нет.</div>
      <div v-else class="friend-list">
        <div v-for="f in profile.friends" :key="f.id" class="friend-item">
          <span>{{ f.displayName }}</span>
          <button @click="handleEnrollFriend(f.id)">Записать</button>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Комментарии</h2>
      <div class="comment-list">
        <div v-for="c in enrollments.comments" :key="c.id" class="comment-item">
          <strong>{{ displayName(c.userId) }}:</strong> {{ c.text }}
        </div>
      </div>
      <div class="comment-input">
        <input v-model="newComment" placeholder="Написать комментарий..." @keyup.enter="handleComment" />
        <button @click="handleComment" :disabled="!newComment.trim()">Отправить</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { enrollmentsStore } from '@/stores/enrollments'
import { profileStore } from '@/stores/profile'

const props = defineProps<{ slotId: string }>()
const enrollments = enrollmentsStore()
const profile = profileStore()
const newComment = ref('')

const isEnrolled = computed(() =>
  profile.profile !== null && enrollments.enrollments.some(e => e.userId === profile.profile!.id)
)

function displayName(userId: string): string {
  if (profile.profile?.id === userId) return profile.profile.displayName
  const friend = profile.friends.find(f => f.id === userId)
  return friend ? friend.displayName : userId
}

onMounted(async () => {
  await Promise.all([
    enrollments.loadEnrollments(props.slotId),
    enrollments.loadComments(props.slotId),
    profile.loadProfile(),
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
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

h1 { font-size: 1.5rem; }

.btn-primary, .btn-danger {
  padding: 0.55rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  min-height: 44px;
  font-size: 1rem;
}

.btn-primary { background: #e94560; }
.btn-danger { background: #c00; }

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
  padding: 0.6rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  word-break: break-word;
}

.friend-item button {
  padding: 0.4rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background: white;
  min-height: 40px;
}

.comment-input {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.comment-input input {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 44px;
}

.comment-input button {
  padding: 0.55rem 1rem;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  min-height: 44px;
}

.empty { color: #888; }
.loading { text-align: center; padding: 3rem; color: #888; }
</style>