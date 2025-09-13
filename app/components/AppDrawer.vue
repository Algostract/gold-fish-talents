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
  <Transition>
    <div v-if="isOpen" ref="container" class="container fixed bottom-0 left-0 z-50 size-full" :class="{ 'bg-black/50': isBackdrop }" v-bind="$attrs" @click.self="onClose">
      <div
        :style="!isFixed ? { height: `${height}%` } : {}"
        :class="{ 'h-fit': isFixed }"
        class="drawer absolute bottom-0 left-0 z-50 flex w-screen flex-col items-center rounded-t-[2rem] bg-dark-400 transition-[height] duration-300">
        <div ref="pull-tap" class="absolute left-1/2 top-0 -translate-x-1/2 px-16 py-5 after:block after:h-[5px] after:w-12 after:rounded-full after:bg-dark-600/60" />
        <div class="relative mb-4 mt-10 w-screen overflow-y-scroll px-4 py-1" v-bind="$attrs">
          <slot />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
.v-enter-active .container,
.v-leave-active .container {
  @apply transition duration-300 ease-in-out;
}

.v-enter-from .container,
.v-leave-to .container {
  @apply translate-y-full transform;
}

.v-enter-to .container,
.v-leave-from .container {
  @apply translate-y-0 transform;
}

.v-enter-active .drawer,
.v-leave-active .drawer {
  @apply transition duration-300 ease-in-out;
}

.v-enter-from .drawer,
.v-leave-to .drawer {
  @apply translate-y-full transform;
}

.v-enter-to .drawer,
.v-leave-from .drawer {
  @apply translate-y-0 transform;
}
</style>
