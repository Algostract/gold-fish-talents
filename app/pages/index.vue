<script setup lang="ts">
definePageMeta({
  middleware: ['guest'],
})

const title = `Gold Fish Bowl`
const description = `Locality‑focused, talent marketplace marketplace where talents, makeup artist, designer etc can be found for commercial shoot`

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

const { data: featuredTalents } = await useFetch('/api/model', {
  query: {
    query: '',
    queryBy: 'name',
    filterBy: '',
    sortBy: 'name:asc',
    perPage: 10,
  },
  default: () => [],
})

const currentIndex = ref(0)
// const activeModel = computed(() => featuredTalents.value[currentIndex.value])

watchEffect((onCleanup) => {
  const interval = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % (featuredTalents.value?.length || 1)
  }, 4000)
  onCleanup(() => clearInterval(interval))
})

// const { width } = useWindowSize()

/* const imageModifiers = computed(() => {
  return width.value >= 768
    ? { fit: 'contain' } // for md and up
    : { fit: 'cover' } // for small screens
}) */

const featuredVideo = {
  name: 'hero',
  type: 'feature',
  poster: 'https://ucarecdn.com/de3af005-6e67-48cf-b77f-86a042589120/-/preview/1920x1080/',
  sources: (['1440p', '1080p', '720p'] as const).flatMap((resolution) => {
    return (['av1', 'hevc', 'vp9', 'avc'] as const).flatMap((codec) => {
      return {
        src: `/media/video/hero-${codec}-${resolution}-portrait.${codec === 'av1' || codec === 'vp9' ? 'webm' : 'mp4'}`,
        type: `video/${codec === 'av1' || codec === 'vp9' ? 'webm' : 'mp4'}`,
        media: '',
        codec: codec,
        resolution: resolution,
      }
    })
  }),
}
</script>

<template>
  <div class="relative">
    <!-- Hero section -->
    <section class="overlay relative -left-2 isolate h-dvh w-dvw md:-left-4">
      <div class="absolute bottom-0 left-0 z-10 flex w-full flex-col gap-5 px-4 py-8 text-white">
        <div>
          <p class="font-sub text-xl font-semi-bold uppercase [text-shadow:2px_2px_4px_rgba(0,0,0,0.25)]">
            Talent meets
            <br />
            <strong class="text-3xl font-regular">Opportunity</strong>
          </p>
          <p class="text-base [text-shadow:2px_2px_4px_rgba(0,0,0,0.25)]">Connect with nearby <br />talents with ease</p>
        </div>
        <div class="scrollbar-hidden relative w-full overflow-x-scroll">
          <div class="flex w-fit gap-6">
            <MarkerModel v-for="{ id, photo, name, url } in featuredTalents" :id="id" :key="id" :photo="photo" :name="name" :url="url" />
          </div>
        </div>
        <div class="flex gap-2">
          <NuxtLink to="/auth/signin" class="text-md w-full rounded-full bg-light-500 px-4 py-3 text-center text-primary-500 dark:bg-dark-500"> Sign In </NuxtLink>
          <NuxtLink to="/model" class="text-md w-full rounded-full bg-primary-500 px-4 py-3 text-center text-dark-500"> Get started</NuxtLink>
        </div>
      </div>
      <!-- <Transition v-if="activeModel" enter-active-class="transition-transform duration-500 ease-out "
        enter-from-class="translate-x-full" enter-to-class="translate-x-0" leave-from-class="translate-x-0"
        leave-to-class="-translate-x-[10%] opacity-80" leave-active-class="absolute duration-1000 -z-10" mode="default">
        <NuxtImg :key="activeModel.id" :src="`${activeModel.photo.image}/-/scale_crop/360x720/50p,0p/`"
          :alt="`${activeModel.name} hero image`" :height="Math.round(720 / (1 / 2))" :modifiers="imageModifiers"
          :placeholder="[360, Math.round(360 / (1 / 2)), 'lightest', 25]"
          class="absolute inset-0 -z-10 h-full w-full object-cover object-top md:object-contain" />
      </Transition> -->
      <NuxtVideo
        v-if="featuredVideo"
        class="absolute left-1/2 top-0 col-span-full col-start-1 row-span-full row-start-1 h-screen w-screen -translate-x-1/2 object-cover"
        :source="featuredVideo.sources"
        :poster="featuredVideo.poster"
        :disable-picture-in-picture="true"
        controls-list="nodownload"
        :autoplay="true"
        :muted="true"
        :playsinline="true"
        :loop="true"
        preload="metadata" />
    </section>
    <!-- <section id="hero" class="grid h-screen grid-cols-3 grid-rows-[repeat(3,min-content)] items-center gap-y-[4.5rem] overflow-hidden pt-24 text-white md:px-16 md:pt-32 lg:grid-rows-1 lg:pt-0">
    <NuxtVideo
      v-if="featuredVideo"
      class="absolute left-1/2 top-0 col-span-full col-start-1 row-span-full row-start-1 h-screen w-screen -translate-x-1/2 object-cover"
      :source="featuredVideo.sources"
      :poster="featuredVideo.poster"
      :disable-picture-in-picture="true"
      controls-list="nodownload"
      :autoplay="true"
      :muted="true"
      :playsinline="true"
      :loop="true"
      preload="metadata" />
    <div class="relative col-span-3 !col-start-1 row-start-1 flex flex-col gap-6 text-center md:row-start-2 lg:col-span-2 lg:text-left">
      <h1 class="-mb-1 text-3xl font-semi-bold md:text-5xl">Elevate Your <br /><span class="rounded bg-primary-500 px-2 py-2">Brand</span> Image</h1>
      <p class="mx-auto max-w-screen-sm text-lg leading-9 tracking-wide md:text-xl lg:mx-0">Nurture the essence of your product with our photography & videography services</p>
      <ButtonCTA class="hidden self-start lg:flex" @click="emit('contact')" />
    </div>
    <div class="relative bottom-[5rem] col-span-full col-start-1 row-start-4 flex flex-col items-center gap-4 self-end md:bottom-16">
      <ButtonCTA class="items-center justify-self-center lg:hidden" @click="emit('contact')" />
      <BrandSlider />
    </div>
  </section> -->
  </div>
</template>

<style>
.overlay {
  @apply after:absolute after:inset-0 after:z-0 after:bg-gradient-to-b after:from-black/0 after:from-[50%] after:to-black/80 after:to-[100%] after:content-[''];
}
</style>
