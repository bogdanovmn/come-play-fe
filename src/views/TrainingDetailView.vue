<template>
  <div class="training-detail" v-if="enrollments.isLoading || profile.profile === null">
    <div class="loading">Загрузка...</div>
  </div>
  <div class="training-detail" v-else>
    <div class="heading-row">
      <BackButton fallback="/trainings" />
      <h1>Тренировка</h1>
      <div class="actions">
        <button v-if="!isEnrolled" class="btn-primary" @click="handleEnroll">Записаться</button>
      </div>
    </div>

    <div v-if="trainings.slot" class="slot-meta">
      <div class="slot-club">Клуб {{ trainings.slot.clubName }}</div>
      <div class="slot-when">
        <span class="slot-date">{{ formatDate(trainings.slot.slotDate) }}</span>
        <span class="slot-time">{{ formatTime(trainings.slot.startTime) }} – {{ formatTime(trainings.slot.endTime) }}</span>
      </div>
    </div>

    <div class="tab-bar">
      <button :class="{ active: tab === 'signup' }" @click="tab = 'signup'">Запись</button>
      <button :class="{ active: tab === 'comments' }" @click="tab = 'comments'">Комментарии ({{ enrollments.comments.length }})</button>
    </div>

    <div v-if="tab === 'signup'" class="tab-content">
      <div class="section">
        <h2>Записаны ({{ enrollments.enrollments.length }})</h2>
        <div v-if="enrollments.enrollments.length === 0" class="empty">Пока никто не записан.</div>
        <div v-else class="enrollment-list">
          <div v-for="e in enrollments.enrollments" :key="e.userId ?? e.friendId" class="enrollment-item">
            <span>{{ e.name }}</span>
            <button v-if="canCancel(e)" class="btn-cancel" title="Отменить запись" aria-label="Отменить запись" @click="handleCancel(e)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-if="availableFriends.length > 0" class="section">
        <h2>Добавить друга</h2>
        <div class="friend-list">
          <div v-for="f in availableFriends" :key="f.id" class="friend-item">
            <span>{{ f.name }}</span>
            <button class="btn-add-friend" title="Записать" aria-label="Записать" @click="handleAddFriend(f.id)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="tab-content">
      <div class="section">
        <h2>Комментарии</h2>
        <div class="comment-list">
          <div v-for="c in enrollments.comments" :key="c.id" class="comment-item">
            <div class="comment-head">
              <span class="comment-date">{{ formatCommentDate(c.createdAt) }}</span>
              <strong>{{ c.authorName }}:</strong>
            </div>
            <div class="comment-text">{{ c.text }}</div>
          </div>
          <div v-if="enrollments.comments.length === 0" class="empty">Пока нет комментариев.</div>
        </div>
        <div class="comment-input">
          <input v-model="newComment" placeholder="Написать комментарий..." @keyup.enter="handleComment" />
          <button class="btn-send" title="Отправить" aria-label="Отправить" @click="handleComment" :disabled="!newComment.trim()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { enrollmentsStore } from '@/stores/enrollments'
import { profileStore } from '@/stores/profile'
import { trainingsStore } from '@/stores/trainings'
import type { Enrollment } from '@/api'
import BackButton from '@/components/BackButton.vue'

const props = defineProps<{ slotId: string }>()
const enrollments = enrollmentsStore()
const profile = profileStore()
const trainings = trainingsStore()
const newComment = ref('')
const tab = ref<'signup' | 'comments'>('signup')

function formatTime(value: string): string {
  return value.length > 5 ? value.slice(0, 5) : value
}

function formatDate(dateStr: string) {
  return format(new Date(dateStr), 'd MMMM, EEEE', { locale: ru })
}

function formatCommentDate(value: string) {
  return format(new Date(value), 'd MMM HH:mm', { locale: ru })
}

const isEnrolled = computed(() =>
  profile.profile !== null && enrollments.enrollments.some(e => e.userId === profile.profile!.id)
)

const isFriendEnrolled = (friendId: string): boolean =>
  enrollments.enrollments.some(e => e.friendId === friendId)

const availableFriends = computed(() =>
  profile.friends.filter(f => !isFriendEnrolled(f.id))
)

function canCancel(e: Enrollment): boolean {
  return profile.profile !== null && e.enrolledBy === profile.profile.id
}

onMounted(async () => {
  await Promise.all([
    enrollments.loadEnrollments(props.slotId),
    enrollments.loadComments(props.slotId),
    trainings.loadSlot(props.slotId),
    profile.loadProfile(),
    profile.loadFriends()
  ])
})

async function reloadSlot() {
  await trainings.loadSlot(props.slotId)
}

async function handleEnroll() {
  await enrollments.enroll(props.slotId)
  await reloadSlot()
}

async function handleCancel(e: Enrollment) {
  if (e.friendId) {
    await enrollments.unenroll(props.slotId, e.friendId)
  } else {
    await enrollments.unenroll(props.slotId)
  }
  await reloadSlot()
}

async function handleAddFriend(friendId: string) {
  await enrollments.enroll(props.slotId, friendId)
  await reloadSlot()
}

async function handleComment() {
  if (!newComment.value.trim()) return
  await enrollments.addComment(props.slotId, newComment.value.trim())
  newComment.value = ''
  await reloadSlot()
}
</script>

<style scoped>
.heading-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  flex-wrap: wrap;
}

h1 {
  font-size: 1.35rem;
  margin: 0;
}

.actions {
  margin-left: auto;
}

.slot-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.slot-club {
  color: var(--color-text);
  font-weight: 600;
}

.slot-when {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.slot-date,
.slot-time {
  color: var(--color-muted);
}

.btn-primary {
  padding: 0.55rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-on-primary);
  min-height: 44px;
  font-size: 1rem;
}

.btn-primary { background: var(--color-primary); }
.btn-primary:hover { background: var(--color-primary-hover); }

.tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

.tab-bar button {
  padding: 0.55rem 1.1rem;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  background: none;
  color: var(--color-muted);
  font-size: 1rem;
  min-height: 44px;
}

.tab-bar button.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
}

.section {
  margin-bottom: 1.5rem;
}

.section h2 {
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
}

.enrollment-list, .friend-list, .comment-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.enrollment-item, .friend-item, .comment-item {
  padding: 0.6rem;
  border-bottom: 1px solid var(--color-row-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  word-break: break-word;
}

.btn-cancel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  min-height: 36px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: none;
  color: var(--color-danger);
  cursor: pointer;
}

.btn-cancel:hover {
  background: var(--color-danger-soft);
}

.btn-cancel svg {
  width: 18px;
  height: 18px;
}

.btn-add-friend {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  min-height: 36px;
  padding: 0;
  border: 1px solid var(--color-primary);
  border-radius: 50%;
  background: none;
  color: var(--color-primary);
  cursor: pointer;
}

.btn-add-friend:hover {
  background: var(--color-primary-soft);
}

.btn-add-friend svg {
  width: 18px;
  height: 18px;
}

.comment-item {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
}

.comment-head {
  display: flex;
  gap: 0.4rem;
  align-items: baseline;
}

.comment-date {
  color: var(--color-muted);
  font-size: 0.85rem;
}

.comment-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-input {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.comment-input input {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  min-height: 44px;
}

.btn-send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  min-height: 44px;
  padding: 0;
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-send:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: default;
}

.btn-send svg {
  width: 18px;
  height: 18px;
}

.empty { color: var(--color-muted); }
.loading { text-align: center; padding: 2.5rem; color: var(--color-muted); }
</style>