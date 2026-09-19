<template>
  <div class="wheel" ref="wheelEl" @scroll="onScroll">
    <div v-for="n in numbers" :key="n" class="wheel-item" :class="{ active: n === modelValue }" @click="select(n)">
      {{ display(n) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: number
  min: number
  max: number
  step?: number
  pad?: number
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'select'): void
}>()

const ITEM_HEIGHT = 44

const wheelEl = ref<HTMLElement | null>(null)
let syncing = false

const step = computed(() => props.step ?? 1)

const numbers = computed(() => {
  const arr: number[] = []
  for (let n = props.min; n <= props.max; n += step.value) arr.push(n)
  return arr
})

function display(n: number): string {
  return props.pad ? String(n).padStart(props.pad, '0') : String(n)
}

function scrollToValue(value: number) {
  syncing = true
  const title = Math.min(props.max, Math.max(props.min, value))
  const top = ((title - props.min) / step.value) * ITEM_HEIGHT
  if (wheelEl.value) wheelEl.value.scrollTop = top
  requestAnimationFrame(() => { syncing = false })
}

function onScroll() {
  if (syncing || !wheelEl.value) return
  const index = Math.round(wheelEl.value.scrollTop / ITEM_HEIGHT)
  const value = Math.min(props.max, props.min + index * step.value)
  if (value !== props.modelValue) emit('update:modelValue', value)
}

function select(n: number) {
  scrollToValue(n)
  emit('update:modelValue', n)
  emit('select')
}

watch(() => props.modelValue, (value) => scrollToValue(value))
watch(() => [props.min, props.max, props.step], () => scrollToValue(props.modelValue), { immediate: true })

onMounted(() => {
  scrollToValue(props.modelValue)
})
</script>

<style scoped>
.wheel {
  position: relative;
  height: 220px;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  scroll-snap-type: y proximity;
}

.wheel::-webkit-scrollbar {
  display: none;
}

.wheel-item {
  height: 44px;
  line-height: 44px;
  text-align: center;
  font-size: 0.95rem;
  color: var(--color-muted);
  cursor: pointer;
  scroll-snap-align: center;
  transition: color 0.15s, font-size 0.15s, font-weight 0.15s;
}

.wheel-item.active {
  color: var(--color-primary);
  font-size: 1.15rem;
  font-weight: 700;
}
</style>