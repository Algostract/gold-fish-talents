<script setup lang="ts">
import type { ShareDetails } from '~/components/Float/ActionBar.vue'

const {
  public: { siteUrl },
} = useRuntimeConfig()

const route = useRoute()
const slug = route.params.slug!.toString()
const { data: model, status } = await useFetch(`/api/model/${slug}`)
const { data: photos } = await useFetch(`/api/model/${slug}/photo`)

if (status.value === 'success' && !model.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const title = `${model.value?.name}`
const description = `${model.value?.name}`
const imageUrl = `https://ucarecdn.com/${model.value?.photo.image}/-/format/auto/-/crop/1440x720/50p,25p/-/scale_crop/${Math.round(720 * (2 / 1))}x720/center/`

useSeoMeta({
  title: title,
  ogTitle: title,
  twitterTitle: title,
  description: description,
  ogDescription: description,
  twitterDescription: description,
  ogImage: imageUrl,
  twitterImage: imageUrl,
  ogUrl: `${siteUrl}/model/${slug}`,
})

useSchemaOrg([
  defineImage({
    url: `${siteUrl}/photo/${slug}`,
    contentUrl: imageUrl,
    caption: description,
    width: 720,
    height: Math.round(720 * (9 / 16)),
  }),
])

// grab live viewport dimensions
// const { width, height } = useWindowSize()
const { width } = useWindowSize()

const imageModifiers = computed(() => {
  return width.value >= 768
    ? { fit: 'contain' } // for md and up
    : { fit: 'cover' } // for small screens
})

const isOpen = ref(false)
const { start } = useTimeoutFn(
  () => {
    isOpen.value = true
  },
  3000,
  { immediate: false }
)

watch(status, (value) => {
  if (value === 'success') start()
})

onMounted(() => {
  if (status.value === 'success') isOpen.value = true
})

const shareDetails = ref<ShareDetails>({
  title: title,
  image: `https://ucarecdn.com/${model.value?.photo.image}/-/format/auto/-/scale_crop/${Math.round(720 * (9 / 16))}x720/center/`,
  text: description,
  url: `${siteUrl}/model/${slug}`,
})
</script>

<template>
  <main v-if="model && status == 'success'" class="relative flex flex-col gap-8 p-2">
    <section id="hero" class="relative -left-2 -top-2 isolate h-dvh w-dvw">
      <NuxtImg :src="model.photo.image" height="100dvh" :modifiers="imageModifiers" class="absolute inset-0 -z-10 h-full w-full object-cover md:object-contain" alt="Model hero shot" />
      <!-- <CompositionOverlay /> -->
      <CardModelDetail class="absolute bottom-24 left-0" :model="model" :is-open="isOpen" @is-open="(value) => (isOpen = value)" />
    </section>
    <PhotoGallery v-if="photos" :photos="photos" />
    <FloatActionBar :share-details="shareDetails" />
  </main>
</template>

<style scoped>
img {
  view-transition-name: selected-model;
}
</style>
