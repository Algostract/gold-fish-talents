<script setup lang="ts">
const props = defineProps<{
  model: DetailedModel
  isOpen: boolean
}>()
const emit = defineEmits<{
  isOpen: [value: boolean]
}>()

function humanizeKey(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (m) => m.toUpperCase())
    .trim()
}

const sections = computed(() => {
  if (!props.model.details) return []

  const keys = Object.keys(props.model.details).filter((k) => k !== 'fee' && k !== 'name')

  return keys.map((key) => {
    const rawSection = props.model!.details[key as keyof typeof props.model.details]
    if (typeof rawSection !== 'object' || !rawSection) return { key, title: humanizeKey(key), items: [] }
    const items = Object.entries(rawSection as object).map(([k, v]) => {
      let display: string | number = v

      if (Array.isArray(v)) {
        display = v.join(', ')
      } else if (typeof v === 'boolean') {
        display = v ? 'Yes' : 'No'
      } else if (k.toLowerCase() === 'age' && typeof v === 'number') {
        display = `${v} Years`
      }

      const color = typeof v === 'string' && /^#([0-9A-F]{3,6})$/i.test(v) ? v : undefined

      return {
        label: humanizeKey(k),
        value: display,
        color,
      }
    })

    return {
      key,
      title: humanizeKey(key),
      items,
    }
  })
})

function toggleOpen() {
  emit('isOpen', !props.isOpen)
}
</script>

<template>
  <div
    class="glass-effect flex aspect-[10/9] w-full max-w-[90vw] flex-col rounded-r-xl text-white transition-transform duration-500 before:rounded-r-xl before:bg-black/20 before:content-[''] md:max-w-md"
    :class="{ '-translate-x-[92%]': !isOpen }">
    <div class="relative flex size-full flex-col justify-between gap-5 p-6">
      <h1 class="whitespace-nowrap text-xl">{{ model.name }}</h1>
      <!-- Auto-discovered Sections -->
      <div class="flex flex-1 flex-col gap-6 overflow-y-auto">
        <div v-for="section in sections" :key="section.key">
          <h2 class="text-md mb-3">{{ section.title }}</h2>
          <div class="grid grid-cols-2 text-sm">
            <div v-for="item in section.items" :key="item.label" class="flex flex-col gap-2 capitalize">
              <span>{{ item.label }}</span>
              <span :class="item.color ? `text-[${item.color}]` : ''">
                {{ item.value }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <button class="absolute right-0 top-3/4 flex h-12 w-6 -translate-y-1/2 items-center justify-center rounded-l-lg bg-primary-500" @click="toggleOpen">
        <NuxtIcon name="local:chevron-bold" class="fill-black duration-300" :class="{ 'rotate-180': !isOpen }" />
      </button>
      <div class="flex flex-col gap-1">
        <h2 class="text-xl">Fee</h2>
        <p class="text-lg">₹ {{ model.fee }} / day</p>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
*::-webkit-scrollbar {
  @apply bg-transparent;
}

*::-webkit-scrollbar-thumb {
  @apply bg-light-400/50;
}
</style>
