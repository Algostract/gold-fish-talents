<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    limit: {
      min: number
      max: number
    }
    value: {
      min: number
      max: number
    }
    step?: number
  }>(),
  {
    step: 10,
  }
)

const emit = defineEmits<{ (event: 'update', lower: number, upper: number): void }>()

const thumbRadius = 7
const container = useTemplateRef('container')

const leftThumbX = ref(props.limit.min ? props.value.min / props.limit.min : 0)
const rightThumbX = ref(props.limit.max ? props.value.max / props.limit.max : 0)
const sliderWidth = ref(0)
const thumbWidth = ref(0)

function update() {
  const lower = Math.round((leftThumbX.value * (props.limit.max - props.limit.min) + props.limit.min) / props.step) * props.step
  const upper = Math.round((rightThumbX.value * (props.limit.max - props.limit.min) + props.limit.min) / props.step) * props.step
  emit('update', lower, upper)
}

function onLeftThumbDown(event: MouseEvent | TouchEvent) {
  const startX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX
  const initialThumbX = leftThumbX.value * sliderWidth.value

  const onDeviceMove = (event: MouseEvent | TouchEvent) => {
    const deltaX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX - startX
    // FIXME: Fix logic for bigger screen
    leftThumbX.value = Math.min(Math.max(initialThumbX + deltaX, 0), rightThumbX.value * sliderWidth.value - thumbWidth.value) / sliderWidth.value
  }

  const onDeviceUp = () => {
    update()

    document.removeEventListener('mousemove', onDeviceMove)
    document.removeEventListener('touchmove', onDeviceMove)
    document.removeEventListener('mouseup', onDeviceUp)
    document.removeEventListener('touchend', onDeviceUp)
  }

  document.addEventListener('mousemove', onDeviceMove)
  document.addEventListener('touchmove', onDeviceMove)
  document.addEventListener('mouseup', onDeviceUp)
  document.addEventListener('touchend', onDeviceUp)
}

function onRightThumbDown(event: MouseEvent | TouchEvent) {
  const startX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX
  const initialThumbX = rightThumbX.value * sliderWidth.value

  const onDeviceMove = (event: MouseEvent | TouchEvent) => {
    const deltaX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX - startX
    // FIXME: Fix logic for bigger screen
    rightThumbX.value = Math.min(Math.max(initialThumbX + deltaX, leftThumbX.value * sliderWidth.value + thumbWidth.value), sliderWidth.value) / sliderWidth.value
  }

  const onDeviceUp = () => {
    update()

    document.removeEventListener('mousemove', onDeviceMove)
    document.removeEventListener('touchmove', onDeviceMove)
    document.removeEventListener('mouseup', onDeviceUp)
    document.removeEventListener('touchend', onDeviceUp)
  }

  document.addEventListener('mousemove', onDeviceMove)
  document.addEventListener('touchmove', onDeviceMove)
  document.addEventListener('mouseup', onDeviceUp)
  document.addEventListener('touchend', onDeviceUp)
}

useResizeObserver(container, (entries) => {
  const entry = entries[0]
  const { width: containerWidth } = entry.contentRect

  sliderWidth.value = containerWidth
  thumbWidth.value = containerWidth / 10
})
</script>

<template>
  <div ref="container" class="relative overflow-hidden">
    <svg :width="sliderWidth" height="14" :viewBox="`0 0 ${sliderWidth} 14`" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect y="4" :width="sliderWidth" height="5" rx="2.5" class="fill-light-600" />
      <rect :x="leftThumbX * sliderWidth" y="4" :width="(rightThumbX - leftThumbX) * sliderWidth" height="5" rx="2.5" class="fill-primary-500" />
      <circle :cx="leftThumbX * sliderWidth + thumbRadius" cy="7" r="7" fill="black" @mousedown="onLeftThumbDown" @touchstart="onLeftThumbDown" />
      <circle :cx="rightThumbX * sliderWidth - thumbRadius" cy="7" r="7" fill="black" @mousedown="onRightThumbDown" @touchstart="onRightThumbDown" />
    </svg>
  </div>
</template>
