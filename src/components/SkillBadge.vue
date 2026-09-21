<template>
  <span v-if="skill" class="skill-badge" :class="`skill-${skill.toLowerCase()}`">
    {{ SKILL_LABELS[skill] }}
  </span>
</template>

<script setup lang="ts">
import { SKILL_LABELS, type SkillLevel } from '@/api'

defineProps<{ skill: SkillLevel | null }>()
</script>

<style scoped>
.skill-badge {
  display: inline-block;
  vertical-align: middle;
  padding: 0.05rem 0.45rem;
  border-radius: 4px;
  font-size: 0.65rem;
  line-height: 1.4;
  white-space: nowrap;
  border: 1px solid transparent;
}

.skill-beginner {
  background: #ece2c9;
  color: #6b5638;
  border-color: #d5c7a8;
}

.skill-intermediate {
  background: #e2d4b0;
  color: #5d4a35;
  border-color: #c4b183;
}

.skill-advanced {
  background: #d6c49a;
  color: #4a3b29;
  border-color: #ab9570;
}

.skill-expert {
  background: #c5af85;
  color: #342a1e;
  border-color: #947f5d;
}
</style>