<template>
  <header class="absolute left-0 right-0 top-4 mx-auto max-w-[90rem] fill-black px-4 text-black md:px-16">
    <nav class="relative z-20 grid grid-cols-3 items-center">
      <NuxtLink to="/" class="flex w-max items-center justify-center gap-2" aria-label="home">
        <NuxtIcon name="local:logo" filled class="text-[56px]" />
        <span class="hidden text-xl font-semi-bold md:inline">Gold Fish <br /><span class="text-4xl">Bowl</span></span>
      </NuxtLink>
      <DevOnly>
        <div class="col-start-3 self-start justify-self-end">
          <LazyButtonColorMode hydrate-on-visible class="block" />
        </div>
      </DevOnly>
    </nav>
  </header>
</template>
