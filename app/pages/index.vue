<script setup lang="ts">
const title = `Gold Fish Bowl`
const description = `Locality‑focused, talent marketplace marketplace where models, makeup artist, designer etc can be found for commercial shoot`

const {
  public: { siteUrl },
} = useRuntimeConfig()
const imageUrl = `${siteUrl}/previews/landing.webp`

useSeoMeta({
  title: title,
  ogTitle: title,
  twitterTitle: title,
  description: description,
  ogDescription: description,
  twitterDescription: description,
  ogImage: imageUrl,
  twitterImage: imageUrl,
  ogUrl: siteUrl,
})

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [{ name: 'Home', item: '/' }],
  }),
])

const { data: featuredModels } = await useFetch('/api/model', {
  query: {
    query: '',
    queryBy: 'name',
    filterBy: '',
    sortBy: 'name:asc',
    perPage: 10,
  },
})

const currentIndex = ref(0)
const activeModel = computed(() => featuredModels.value![currentIndex.value]!)

watchEffect((onCleanup) => {
  const interval = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % (featuredModels.value?.length || 1)
  }, 4000) // 4s per image
  onCleanup(() => clearInterval(interval))
})

const { width } = useWindowSize()

const imageModifiers = computed(() => {
  return width.value >= 768
    ? { fit: 'contain' } // for md and up
    : { fit: 'cover' } // for small screens
})
</script>

<template>
  <main class="relative isolate mx-auto flex h-dvh w-dvw max-w-[90rem] flex-col items-center justify-center gap-4 overflow-hidden px-2 md:px-4">
    <header class="absolute left-0 right-0 top-4 mx-auto max-w-[90rem] fill-black px-4 text-black md:px-16">
      <nav class="relative z-20 grid grid-cols-3 items-center">
        <NuxtLink to="/" class="flex w-max items-center justify-center gap-2" aria-label="home">
          <NuxtIcon name="local:logo" filled class="text-[80px]" />
          <span class="hidden text-xl font-semi-bold md:inline">Gold Fish <br /><span class="text-4xl">Bowl</span></span>
        </NuxtLink>
        <DevOnly>
          <div class="col-start-3 self-start justify-self-end">
            <LazyButtonColorMode hydrate-on-visible class="block" />
          </div>
        </DevOnly>
      </nav>
    </header>
    <!-- Hero section -->
    <section class="overlay relative isolate h-dvh w-dvw max-w-[90rem]">
      <div class="absolute bottom-0 left-0 z-10 flex w-full flex-col gap-5 px-4 py-8 text-white">
        <div>
          <p class="font-sub text-xl font-semi-bold uppercase [text-shadow:2px_2px_4px_rgba(0,0,0,0.25)]">
            World's Best
            <br />
            <strong class="text-3xl font-regular">models</strong>
          </p>
          <p class="text-base [text-shadow:2px_2px_4px_rgba(0,0,0,0.25)]">Connect with nearby <br />models with ease</p>
        </div>
        <div class="scrollbar-hidden relative w-full overflow-x-scroll">
          <div class="flex w-fit gap-6">
            <MarkerModel v-for="{ id, photo, name, url } in featuredModels" :id="id" :key="id" :photo="photo" :name="name" :url="url" />
          </div>
        </div>
        <NuxtLink to="/model" class="w-full rounded-full bg-light-500 px-5 py-4 text-center text-lg text-primary-500 dark:bg-dark-500"> Get started </NuxtLink>
      </div>
      <!-- <NuxtImg provider="ipx" src="/images/model-1.png" alt="Model" :width="720" :height="Math.round(720 / (9 / 16))"
        fit="cover" class="size-full bg-[#D4E0EA] object-contain object-bottom" /> -->
      <Transition
        enter-active-class="transition-transform duration-500 ease-out "
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-from-class="translate-x-0"
        leave-to-class="-translate-x-[10%] opacity-80"
        leave-active-class="absolute duration-1000 -z-10"
        mode="default">
        <NuxtImg
          :key="activeModel.id"
          :src="`${activeModel.photo.image}/-/scale_crop/720x1440/50p,0p/`"
          :alt="`${activeModel.name} hero image`"
          :height="Math.round(1440 / (1 / 2))"
          :modifiers="imageModifiers"
          :placeholder="[360, Math.round(360 / (1 / 2)), 'lightest', 25]"
          class="absolute inset-0 -z-10 h-full w-full object-cover object-top md:object-contain" />
      </Transition>
    </section>
  </main>
</template>

<style>
.overlay {
  @apply after:absolute after:inset-0 after:z-0 after:bg-gradient-to-b after:from-black/0 after:from-[50%] after:to-black/80 after:to-[100%] after:content-[''];
}
</style>
