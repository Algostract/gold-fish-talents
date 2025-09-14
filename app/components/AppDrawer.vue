<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    isOpen: boolean
    isBackdrop?: boolean
    isFixed?: boolean
  }>(),
  {
    isBackdrop: true,
    isFixed: false,
  }
)
const emit = defineEmits<{ (event: 'close'): void }>()

enum Height {
  MAX = 80,
  MIN = 30,
}

const container = useTemplateRef('container')
const pullTap = useTemplateRef('pull-tap')

const containerWidth = computed(() => container.value?.offsetWidth)
const height = ref(props.isFixed ? null : Height.MIN)

const { lengthY } = useSwipe(pullTap, {
  passive: false,
  onSwipe() {
    if (containerWidth.value && height.value) {
      if (lengthY.value > 200) height.value = Height.MAX
      else if (Math.abs(lengthY.value) < 200) height.value = Math.max(Math.min(30 + Math.round(lengthY.value) / 5, Height.MAX), Height.MIN)
      else height.value = Height.MIN
    }
  },
  onSwipeEnd() {
    if (height.value) height.value = height.value > 30 ? Height.MAX : Height.MIN
  },
})

function onClose() {
  height.value = Height.MIN
  emit('close')
}
</script>
<template>
  <!-- Backdrop -->
  <Transition name="fade">
    <div v-if="isOpen" ref="container" class="container fixed bottom-0 left-0 z-50 size-full bg-black/50" :class="{ 'bg-black/50': isBackdrop }" @click.self="onClose" />
  </Transition>

  <!-- Drawer -->
  <Transition name="slide-up">
    <div
      v-if="isOpen"
      :style="!isFixed ? { height: `${height}%` } : {}"
      :class="{ 'h-fit': isFixed }"
      class="drawer fixed bottom-0 left-0 z-[100] flex w-screen flex-col items-center rounded-t-[2rem] bg-dark-400 transition-[height] duration-300">
      <div ref="pull-tap" class="absolute left-1/2 top-0 -translate-x-1/2 px-16 py-5 after:block after:h-[5px] after:w-12 after:rounded-full after:bg-dark-600/60" />
      <div class="relative mb-4 mt-10 w-screen overflow-y-scroll px-4 py-1">
        <slot />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Overlay fade */
.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-300;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}

.fade-enter-to,
.fade-leave-from {
  @apply opacity-100;
}

/* Drawer slide-up */
.slide-up-enter-active,
.slide-up-leave-active {
  @apply transition-transform duration-300 ease-in-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  @apply translate-y-full;
}

.slide-up-enter-to,
.slide-up-leave-from {
  @apply translate-y-0;
}
</style>
