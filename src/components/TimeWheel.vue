<template>
  <div class="time-wheel">
    <NumberWheel v-model="hours" :min="0" :max="23" :pad="2" class="time-wheel-col" @select="emit('select')" />
    <span class="time-wheel-sep">:</span>
    <NumberWheel v-model="minutes" :min="0" :max="55" :step="5" :pad="2" class="time-wheel-col" @select="emit('select')" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import NumberWheel from '@/components/NumberWheel.vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'select'): void
}>()

const minutes = computed({
  get: () => parseInt(props.modelValue.split(':')[1] ?? '0', 10) || 0,
  set: (m: number) => emit('update:modelValue', `${hours.value}:${String(m).padStart(2, '0')}`)
})

const hours = computed({
  get: () => parseInt(props.modelValue.split(':')[0] ?? '0', 10) || 0,
  set: (h: number) => emit('update:modelValue', `${String(h).padStart(2, '0')}:${String(minutes.value).padStart(2, '0')}`)
})
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