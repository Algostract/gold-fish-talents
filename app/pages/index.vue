<script setup lang="ts">
definePageMeta({
  middleware: ['guest'],
})

const title = `Gold Fish Bowl`
const description = `Locality‑focused, talent marketplace where models, voice actors, makeup artist, designer etc can be found for commercial shoot`

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
    <section class="overlay relative -left-2 isolate min-h-dvh w-dvw md:-left-4">
      <div class="absolute bottom-0 left-0 z-10 flex w-full flex-col gap-3 px-4 py-8 text-white">
        <div>
          <p class="font-sub text-lg font-semi-bold uppercase [text-shadow:2px_2px_4px_rgba(0,0,0,0.25)]">
            Where Talent meets
            <br />
            <strong class="my-2 inline-block text-2xl font-regular">Opportunity</strong>
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
    <footer class="round relative flex w-full flex-col items-center gap-4 px-4 py-6 text-white">
      <ul class="grid grid-flow-col grid-cols-4 grid-rows-3 gap-y-2 whitespace-nowrap">
        <li class="col-start-1">
          <NuxtLink to="/terms">Terms</NuxtLink>
        </li>
        <li class="col-start-1">
          <NuxtLink to="/privacy">Privacy</NuxtLink>
        </li>
        <li class="col-start-2">
          <NuxtLink to="/contact">Contact us</NuxtLink>
        </li>
        <!-- Social Media -->
        <li class="col-span-2 col-start-3 row-start-3 flex justify-end gap-3 fill-white">
          <NuxtLink to="https://www.facebook.com/goldfishbowltalent" target="_blank">
            <NuxtIcon name="local:facebook" class="text-[28px]" />
          </NuxtLink>
          <NuxtLink to="https://www.instagram.com/goldfishbowltalent" target="_blank">
            <NuxtIcon name="local:instagram" class="text-[28px]" />
          </NuxtLink>
          <NuxtLink to="https://x.com/goldfishbowltalent" target="_blank">
            <NuxtIcon name="local:x" class="text-[28px]" />
          </NuxtLink>
        </li>
      </ul>
      <div class="w-full border-t border-dark-600" />
      <NuxtLink to="https://shirsendu-bairagi.dev" target="__blank" class="flex items-center gap-1">
        <span>Made by</span>
        <NuxtIcon name="local:shba007" filled class="text-[20px]" />
      </NuxtLink>
      <span class="text-xs">&copy; Gold Fish Bowl 2025. All rights reserved.</span>
    </footer>
  </div>
</template>

<style>
.overlay {
  @apply after:absolute after:inset-0 after:z-0 after:bg-gradient-to-b after:from-black/0 after:from-[50%] after:to-black/80 after:to-[100%] after:content-[''];
}
</style>
