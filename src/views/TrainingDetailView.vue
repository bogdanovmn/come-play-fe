<template>
  <div class="training-detail" v-if="enrollments.isLoading || profile.profile === null">
    <div class="loading">Загрузка...</div>
  </div>
  <div class="training-detail" v-else>
    <div class="heading-row">
      <BackButton :fallback="backFallback" />
      <h1>{{ isPast ? 'Прошедшая тренировка' : 'Тренировка' }}</h1>
      <div class="actions">
        <button v-if="canEnroll" class="btn-primary" @click="handleEnroll">Записаться</button>
      </div>
    </div>

    <div v-if="trainings.slot" class="heading-sub">
      <span class="club-name">
        <span class="club-label">Клуб</span>
        «{{ trainings.slot.clubName }}»<router-link :to="`/clubs/${trainings.slot.clubId}/info`" class="info-icon" title="Информация о клубе" aria-label="Информация о клубе">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </router-link>
      </span>
    </div>

    <div v-if="trainings.slot" class="slot-when">
      <span class="slot-dow">{{ weekday(trainings.slot.slotDate) }}, </span>
      <span class="slot-date-muted">{{ monthDay(trainings.slot.slotDate) }}</span>
      <span class="slot-time">{{ formatTime(trainings.slot.startTime) }} – {{ formatTime(trainings.slot.endTime) }}</span>
    </div>

    <div class="tab-bar">
      <button v-if="!isCancelled" :class="{ active: tab === 'signup' }" @click="tab = 'signup'">Запись ({{ enrollments.enrollments.length }})</button>
      <button v-if="isCancelled || !isPast || enrollments.comments.length > 0" :class="{ active: tab === 'comments' }" @click="tab = 'comments'">Комментарии ({{ enrollments.comments.length }})</button>
    </div>

    <div v-if="tab === 'signup' && !isCancelled" class="tab-content">
      <div class="section">
        <div v-if="enrollments.enrollments.length === 0" class="empty">Пока никто не записан.</div>
        <div v-else class="enrollment-list">
          <div v-for="e in sortedEnrollments" :key="e.userId ?? e.friendId" class="enrollment-item">
            <span class="enrollment-name" :class="{ 'enrollment-name--owner': e.owner }">
                <SkillStar :skill="e.skill" />
                <svg
                  v-if="e.friendId"
                  class="friend-plus"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {{ e.name }}
              </span>
            <span class="enrollment-side">
              <button
                v-if="e.userId === profile.profile?.id && !isPast"
                class="coming-toggle"
                :class="{ active: e.comingLater }"
                :disabled="comingLaterLoading"
                @click="handleToggleComingLater"
              >Приду позднее</button>
              <span v-else-if="e.comingLater" class="coming-badge">придёт позже</span>
              <button v-if="canCancel(e) && !isPast" class="btn-cancel" title="Отменить запись" aria-label="Отменить запись" @click="handleCancel(e)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          </div>
        </div>
      </div>

      <div v-if="!isPast && availableFriends.length > 0" class="section">
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

    <div v-if="tab === 'comments'" class="tab-content">
      <div class="section">
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
        <div v-if="!isPast" class="comment-input">
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
import { ref, computed, onMounted, watch } from 'vue'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { enrollmentsStore } from '@/stores/enrollments'
import { profileStore } from '@/stores/profile'
import { trainingsStore } from '@/stores/trainings'
import type { Enrollment } from '@/api'
import BackButton from '@/components/BackButton.vue'
import SkillStar from '@/components/SkillStar.vue'
import { isSlotEnded } from '@/utils/slotTime'

const props = defineProps<{ slotId: string }>()
const enrollments = enrollmentsStore()
const profile = profileStore()
const trainings = trainingsStore()
const newComment = ref('')
const tab = ref<'signup' | 'comments'>('signup')

function formatTime(value: string): string {
  return value.length > 5 ? value.slice(0, 5) : value
}

function weekday(dateStr: string) {
  return format(new Date(dateStr), 'EEEE', { locale: ru })
}

function monthDay(dateStr: string) {
  return format(new Date(dateStr), 'd MMMM', { locale: ru })
}

function formatCommentDate(value: string) {
  return format(new Date(value), 'd MMM HH:mm', { locale: ru })
}

const isEnrolled = computed(() =>
  profile.profile !== null && enrollments.enrollments.some(e => e.userId === profile.profile!.id)
)

const isPast = computed(() => trainings.slot !== null && isSlotEnded(trainings.slot))

const isCancelled = computed(() => trainings.slot?.cancelled ?? false)

const canEnroll = computed(() => !isEnrolled.value && !isPast.value && !isCancelled.value)

const backFallback = computed(() => {
  const slot = trainings.slot
  if (slot && isPast.value) return `/clubs/${slot.clubId}/trainings/history`
  return '/trainings'
})

watch(isCancelled, (value) => {
  if (value && tab.value === 'signup') {
    tab.value = 'comments'
  }
})

watch(() => enrollments.comments.length, (count) => {
  if (isPast.value && count === 0 && !isCancelled.value && tab.value === 'comments') {
    tab.value = 'signup'
  }
})

const myComingLater = computed(() => {
  if (profile.profile === null) return false
  const mine = enrollments.enrollments.find(e => e.userId === profile.profile!.id)
  return mine?.comingLater ?? false
})

const comingLaterLoading = ref(false)

async function handleToggleComingLater() {
  if (comingLaterLoading.value) return
  comingLaterLoading.value = true
  try {
    await enrollments.setComingLater(props.slotId, !myComingLater.value)
  } finally {
    comingLaterLoading.value = false
  }
}

const isFriendEnrolled = (friendId: string): boolean =>
  enrollments.enrollments.some(e => e.friendId === friendId)

const availableFriends = computed(() =>
  profile.friends.filter(f => !isFriendEnrolled(f.id))
)

const isFriendEnrollment = (e: Enrollment): boolean => e.friendId != null

const sortedEnrollments = computed<Enrollment[]>(() => {
  const byName = (a: Enrollment, b: Enrollment) => a.name.localeCompare(b.name, 'ru')

  const enrolledAnchorIds = new Set(
    enrollments.enrollments
      .filter(e => !isFriendEnrollment(e))
      .map(e => e.enrolledBy)
  )

  const friendsByAnchor = new Map<string, Enrollment[]>()
  const leaders: Enrollment[] = []

  for (const e of enrollments.enrollments) {
    if (!isFriendEnrollment(e)) {
      leaders.push(e)
    } else if (enrolledAnchorIds.has(e.enrolledBy)) {
      const group = friendsByAnchor.get(e.enrolledBy) ?? []
      group.push(e)
      friendsByAnchor.set(e.enrolledBy, group)
    } else {
      leaders.push(e)
    }
  }

  for (const group of friendsByAnchor.values()) {
    group.sort(byName)
  }
  leaders.sort(byName)

  const result: Enrollment[] = []
  for (const leader of leaders) {
    result.push(leader)
    result.push(...(friendsByAnchor.get(leader.enrolledBy) ?? []))
  }
  return result
})

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
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.slot-when {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem;
  margin: 0 0 1rem 48px;
  font-size: 0.95rem;
}

.slot-dow {
  font-weight: bold;
}

.slot-date-muted {
  color: var(--color-muted);
  font-weight: 400;
}

.slot-time {
  font-weight: bold;
}

.enrollment-name {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.enrollment-side {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.enrollment-name--owner {
  font-weight: 700;
  color: var(--color-muted);
}

.friend-plus {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--color-muted);
  opacity: 0.45;
}

.coming-toggle {
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  background: var(--color-surface);
  color: var(--color-muted);
  font-size: 0.8rem;
  white-space: nowrap;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

.coming-toggle:hover:not(:disabled) {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-text);
}

.coming-toggle.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
}

.coming-toggle:disabled {
  opacity: 0.5;
  cursor: default;
}

.coming-badge {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--color-muted);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.05rem 0.5rem;
  white-space: nowrap;
}

.heading-sub {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--color-muted);
  margin: 0 0 0.25rem 48px;
}

.club-name {
  display: inline;
  overflow-wrap: anywhere;
}

.club-label {
  opacity: 0.7;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: -0.2em;
  margin-left: 0.3rem;
  color: var(--color-muted);
  transition: color 0.2s;
}

.info-icon:hover {
  color: var(--color-primary);
}

.info-icon svg {
  width: 16px;
  height: 16px;
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