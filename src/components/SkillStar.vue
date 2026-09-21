<template>
  <svg
    v-if="skill"
    class="skill-star"
    :class="{ 'skill-star--expert': skill === SkillLevel.EXPERT }"
    viewBox="0 0 24 24"
    role="img"
    :aria-label="`Уровень: ${SKILL_LABELS[skill]}`"
  >
    <defs>
      <clipPath :id="fillId">
        <rect y="0" height="24" :width="fillWidth" />
      </clipPath>
    </defs>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" class="skill-star__base" />
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" class="skill-star__fill" :clip-path="`url(#${fillId})`" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SKILL_LABELS, SkillLevel, type SkillLevel as LevelType } from '@/api'

const props = defineProps<{ skill: SkillLevel | null }>()

const uid = `skill-star-${Math.random().toString(36).slice(2, 9)}`
const fillId = `${uid}-fill`

const FILL_FRACTION: Record<LevelType, number> = {
  [SkillLevel.BEGINNER]: 0.25,
  [SkillLevel.INTERMEDIATE]: 0.5,
  [SkillLevel.ADVANCED]: 0.75,
  [SkillLevel.EXPERT]: 1,
}

const fillWidth = computed(() => (props.skill ? 24 * FILL_FRACTION[props.skill] : 0))
</script>

<style scoped>
.skill-star {
  display: inline-block;
  vertical-align: middle;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--color-primary);
}

.skill-star__base {
  fill: currentColor;
  fill-opacity: 0.25;
}

.skill-star__fill {
  fill: currentColor;
}

.skill-star--expert {
  color: #c9a32e;
}
</style>