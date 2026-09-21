<template>
  <div class="time-wheel">
    <NumberWheel v-model="h" :min="hourMin" :max="hourMax" :pad="2" class="time-wheel-col" @select="commit" />
    <span class="time-wheel-sep">:</span>
    <NumberWheel v-model="m" :min="minuteMin(h)" :max="minuteMax(h)" :step="5" :pad="2" class="time-wheel-col" @select="commit" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import NumberWheel from '@/components/NumberWheel.vue'

const props = defineProps<{ modelValue: string; min?: string; max?: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'select'): void
}>()

function parseTime(value: string): number {
  const [hh, mm] = value.split(':').map(Number)
  return (hh || 0) * 60 + (mm || 0)
}

function formatTime(totalMinutes: number): string {
  const hh = Math.floor(totalMinutes / 60)
  const mm = totalMinutes % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

const minTime = computed(() => parseTime(props.min ?? '00:00'))
const maxTime = computed(() => parseTime(props.max ?? '23:55'))
const hourMin = computed(() => Math.floor(minTime.value / 60))
const hourMax = computed(() => Math.floor(maxTime.value / 60))

function clampHour(hh: number): number {
  return Math.min(hourMax.value, Math.max(hourMin.value, hh))
}

function minuteMin(hh: number): number {
  return hh === hourMin.value ? minTime.value % 60 : 0
}

function minuteMax(hh: number): number {
  return hh === hourMax.value ? maxTime.value % 60 : 55
}

function clampMinute(hh: number, mm: number): number {
  return Math.min(minuteMax(hh), Math.max(minuteMin(hh), mm))
}

const currentTotal = computed(() => parseTime(props.modelValue))

const h = ref(clampHour(Math.floor(currentTotal.value / 60)))
const m = ref(clampMinute(h.value, currentTotal.value % 60))

watch(() => props.modelValue, (value) => {
  const total = parseTime(value)
  const nh = clampHour(Math.floor(total / 60))
  h.value = nh
  m.value = clampMinute(nh, total % 60)
})

watch([h, m], () => {
  const nh = clampHour(h.value)
  const nm = clampMinute(nh, m.value)
  if (nh !== h.value) {
    h.value = nh
    return
  }
  if (nm !== m.value) {
    m.value = nm
    return
  }
  const time = formatTime(nh * 60 + nm)
  if (time !== props.modelValue) emit('update:modelValue', time)
})

function commit() {
  const nh = clampHour(h.value)
  const nm = clampMinute(nh, m.value)
  if (nh !== h.value) h.value = nh
  if (nm !== m.value) m.value = nm
  const time = formatTime(nh * 60 + nm)
  if (time !== props.modelValue) emit('update:modelValue', time)
  emit('select')
}
</script>

<style scoped>
.time-wheel {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.time-wheel-col {
  flex: 1;
  min-width: 0;
}

.time-wheel-sep {
  font-size: 1.2rem;
  color: var(--color-muted);
}
</style>