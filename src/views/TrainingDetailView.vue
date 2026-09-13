<template>
  <div class="training-detail" v-if="enrollments.isLoading || profile.profile === null">
    <div class="loading">Загрузка...</div>
  </div>
  <div class="training-detail" v-else>
    <div class="header">
      <BackButton fallback="/trainings" />
      <div>
        <h1>Тренировка</h1>
        <div v-if="trainings.slot" class="slot-meta">
          <span class="slot-date">{{ formatDate(trainings.slot.slotDate) }}</span>
          <span class="slot-time">{{ dayLabel(trainings.slot.dayOfWeek) }}, {{ formatTime(trainings.slot.startTime) }} – {{ formatTime(trainings.slot.endTime) }}</span>
        </div>
      </div>
      <div class="actions">
        <button v-if="!isEnrolled" class="btn-primary" @click="handleEnroll">Записаться</button>
      </div>
    </div>

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

    <div v-if="profile.friends.length > 0" class="section">
      <h2>Друзья</h2>
      <div class="friend-list">
        <div v-for="f in profile.friends" :key="f.id" class="friend-item">
          <span>{{ f.name }}</span>
          <button @click="handleToggleFriend(f.id)">
            {{ isFriendEnrolled(f.id) ? 'Снять запись' : 'Записать' }}
          </button>
        </div>
      </div>
    </div>

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
        <button @click="handleComment" :disabled="!newComment.trim()">Отправить</button>
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
import { DayOfWeek } from '@/api'
import type { Enrollment } from '@/api'
import BackButton from '@/components/BackButton.vue'

const props = defineProps<{ slotId: string }>()
const enrollments = enrollmentsStore()
const profile = profileStore()
const trainings = trainingsStore()
const newComment = ref('')

const dayLabels: Record<string, string> = {
  [DayOfWeek.MONDAY]: 'Понедельник',
  [DayOfWeek.TUESDAY]: 'Вторник',
  [DayOfWeek.WEDNESDAY]: 'Среда',
  [DayOfWeek.THURSDAY]: 'Четверг',
  [DayOfWeek.FRIDAY]: 'Пятница',
  [DayOfWeek.SATURDAY]: 'Суббота',
  [DayOfWeek.SUNDAY]: 'Воскресенье',
}

function dayLabel(day: string): string {
  return dayLabels[day] ?? day
}

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

async function handleToggleFriend(friendId: string) {
  if (isFriendEnrolled(friendId)) {
    await enrollments.unenroll(props.slotId, friendId)
  } else {
    await enrollments.enroll(props.slotId, friendId)
  }
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
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

h1 { font-size: 1.35rem; }

.slot-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-top: 0.3rem;
}

.slot-date {
  font-weight: 600;
}

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

.friend-item button {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: 4px;
  cursor: pointer;
  background: var(--color-surface);
  min-height: 40px;
}

.friend-item button:hover {
  background: var(--color-primary-soft);
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

.comment-input button {
  padding: 0.55rem 1rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  min-height: 44px;
}

.comment-input button:hover {
  background: var(--color-primary-hover);
}

.empty { color: var(--color-muted); }
.loading { text-align: center; padding: 2.5rem; color: var(--color-muted); }
</style>