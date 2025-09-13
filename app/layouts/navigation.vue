<script setup lang="ts">
const { clear } = useUserSession()

async function onLogout() {
  await clear()
  navigateTo('/')
}

const isMainDrawerOpen = useState<boolean>()
</script>

<template>
  <div class="relative flex h-screen flex-col overflow-hidden bg-primary-500">
    <div class="fixed bottom-0 left-0 right-0 top-0 overflow-hidden text-black">
      <!-- <NuxtIcon name="brand" class="fixed -top-[106px] -left-[113px] text-white/20 text-[240px]" /> -->
      <ul class="relative left-8 top-1/2 flex -translate-y-1/2 flex-col justify-between gap-6">
        <li>
          <span>Help</span>
        </li>
        <li class="mt-auto" @click="onLogout">
          <span>Logout</span>
        </li>
      </ul>
    </div>
    <div class="z-10 flex flex-grow flex-col bg-dark-400 transition-transform duration-300 ease-out" :class="{ 'translate-x-1/2 scale-75 overflow-hidden rounded-[20px]': isMainDrawerOpen }">
      <button class="absolute left-4 top-4" @click="isMainDrawerOpen = !isMainDrawerOpen">Menu</button>
      <slot />
    </div>
  </div>
</template>
