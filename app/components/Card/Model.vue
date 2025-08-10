<script setup lang="ts">
import type { Model } from '~~/shared/types'

interface ExtendedModel extends Model {
  isFavorite: boolean
}

const props = withDefaults(defineProps<ExtendedModel>(), {
  isFeatured: false,
  isFavorite: false,
})

const isFavorite = ref(props.isFavorite)
const activeModel = useState<string | null>()
</script>

<template>
  <div class="relative isolate grid aspect-[170/227] grid-cols-1 grid-rows-1">
    <AppRibbon :title="'Featured'" class="absolute -left-2 top-2 z-10" />
    <NuxtLink :to="url" class="col-span-full col-start-1 row-span-full row-start-1 size-full overflow-clip rounded-md bg-light-500 dark:bg-dark-500" @click="activeModel = name">
      <NuxtImg
        :src="`${photo.image}/-/scale_crop/480x640/50p,0p/`"
        :alt="photo.description"
        :width="480"
        :height="Math.round(480 / (3 / 4))"
        fit="cover"
        loading="lazy"
        :placeholder="[120, Math.round(120 / (3 / 4)), 'lightest', 25]"
        class="w-full rounded-sm bg-light-600 object-cover dark:bg-dark-500"
        :class="{ active: activeModel === name }" />
      />
    </NuxtLink>
    <div
      class="glass-effect absolute bottom-0 left-0 right-0 z-10 grid grid-cols-[auto,min-content] grid-rows-[auto,auto] gap-1 overflow-clip rounded-b-md rounded-t-2xl border-none bg-black/20 p-2 pt-3 before:absolute before:inset-0 before:-z-10 before:rounded-t-2xl before:border-none before:bg-black/20 before:content-['']">
      <span class="col-span-full text-sm font-regular">{{ name }}</span>
      <div class="flex size-fit items-center justify-center gap-1 self-end rounded-full bg-light-500 fill-black p-1 pr-2 text-black dark:bg-dark-500 dark:fill-white dark:text-white">
        <NuxtIcon name="local:star" class="text-[16px]" />
        <span class="-ml-1 text-xs font-semi-bold">{{ rating }}</span>
        <span class="text-xs">|</span>
        <span class="text-xs">{{ reviewCount }}</span>
      </div>
      <button
        class="aspect-square size-fit rounded-full bg-light-500 p-1 transition-colors ease-in-out dark:bg-dark-500"
        :class="isFavorite ? 'fill-primary-400' : 'fill-black dark:fill-white'"
        @click="isFavorite = !isFavorite">
        <NuxtIcon name="local:love" class="text-[24px]" />
      </button>
    </div>
  </div>
</template>

<style lang="css" scoped>
:root {
  @apply fill-primary-400;
}

img.active {
  view-transition-name: selected-model;
}
</style>
