<script setup lang="ts">
import type { Model } from '~~/shared/types'

defineProps<Pick<Model, 'id' | 'photo' | 'name' | 'url'>>()
</script>

<template>
  <NuxtLink :to="url" class="block size-16 rounded-full rounded-bl-none bg-light-500 p-1.5 dark:bg-dark-500">
    <NuxtImg :src="`${photo.image}/-/crop/face/200px200p/-/crop/1:1/50p,30p/`" :alt="name" width="64" height="64" loading="eager" fit="cover" class="size-full rounded-full object-cover object-top" />
  </NuxtLink>
</template>
