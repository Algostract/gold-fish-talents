<script setup lang="ts">
const urls = [
  { url: '/', id: 'home', label: 'Home', icon: 'local:home' },
  { url: '/talents/models', id: 'grid', label: 'Grid', icon: 'local:grid' },
  { url: '/highlighted', id: 'high', label: 'highlighted', icon: 'local:love' },
]

const route = useRoute()

const activeIndex = computed(() => {
  const currentPath = route.path
  const idx = urls.findIndex((link) => link.url === currentPath)
  return idx !== -1 ? idx : 0
})

const indicatorStyle = computed(() => {
  const n = urls.length || 1
  const leftPercent = ((activeIndex.value + 0.5) / n) * 100
  return {
    left: `${leftPercent}%`,
  }
})
</script>

<template>
  <div class="fixed bottom-5 left-0 right-0 z-50">
    <nav class="relative mx-auto w-fit rounded-full bg-dark-500 px-9 py-1 shadow-2xl" role="tablist" aria-label="Primary">
      <div class="relative flex gap-4">
        <NuxtLink
          v-for="(item, i) in urls"
          :key="item.id"
          :to="item.url"
          :aria-selected="activeIndex === i"
          role="tab"
          class="relative z-10 flex flex-1 select-none flex-col items-center justify-center py-2 text-sm font-semi-bold transition-colors duration-300 ease-in-out"
          :class="activeIndex === i ? 'fill-primary-500 text-primary-500' : 'fill-white text-white'">
          <NuxtIcon :name="item.icon" class="text-[28px]" />
        </NuxtLink>
        <DevOnly>
          <!-- sliding indicator: positioned & sized by inline style percents -->
          <span aria-hidden="true" class="absolute bottom-1 h-0.5 w-2 -translate-x-1/2 rounded-full bg-primary-400 transition-all duration-300 ease-out" :style="indicatorStyle" />
        </DevOnly>
      </div>
    </nav>
  </div>
</template>
