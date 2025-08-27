<script setup lang="ts">
defineProps<{
  projects: Project[]
}>()
</script>

<template>
  <section>
    <div v-if="projects.length === 0" class="relative m-auto h-fit w-fit">
      <NuxtImg provider="ipx" src="/images/blank-canvas.svg" width="256" />
      <span class="mt-8 inline-block w-full text-center">No Project Found</span>
    </div>
    <div v-else class="flex flex-col gap-4">
      <CardProject v-for="project in projects" :key="project.id" :project="project" />
    </div>
  </section>
</template>
