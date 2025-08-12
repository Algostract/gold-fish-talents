<script setup lang="ts">
import banner from '~/assets/images/banner.svg?raw'

defineProps<{ title: string }>()
// TODO: remove unnecessary scale
</script>

<template>
  <div class="flex scale-90 justify-center font-main text-xs text-black drop-shadow-md">
    <div class="relative top-[2px] scale-110 fill-primary-600" v-html="banner" />
    <strong class="relative mb-2 -translate-x-1 scale-90 overflow-hidden rounded-r-[4px] bg-primary-500 px-2 pb-[5px] pt-1">
      {{ title }}
      <span
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 animate-[maskshine_3s_linear_infinite] bg-gradient-to-tr from-transparent via-white/80 to-transparent mix-blend-screen blur-sm delay-300 dark:via-white/80" />
    </strong>
  </div>
</template>

<style>
@keyframes maskshine {
  0% {
    transform: translate(120%, -400%);
  }

  100% {
    transform: translate(-80%, 400%);
  }
}
</style>
