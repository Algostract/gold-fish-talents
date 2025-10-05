<script setup lang="ts"></script>

<template>
  <div class="flex h-screen w-screen flex-col items-center justify-start">
    <LazyAppHeader hydrate-on-idle />
    <main class="relative isolate mx-auto flex w-full max-w-[90rem] grow flex-col gap-4 overflow-hidden px-2 md:mb-8 md:px-4">
      <slot />
    </main>
    <!-- <LazyAppFooter hydrate-on-visible /> -->
  </div>
</template>
