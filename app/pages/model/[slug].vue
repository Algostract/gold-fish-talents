<script setup lang="ts">
const {
  public: { siteUrl },
} = useRuntimeConfig()

const route = useRoute()
const slug = route.params.slug!.toString()
const { data: model } = await useFetch(`/api/model/${slug}`)
const { data: photos } = useFetch(`/api/model/${slug}/photo`, { default: () => [] })
const { data: videos } = useFetch(`/api/model/${slug}/video`, { default: () => [] })

if (!model.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const title = `${model.value?.name}`
const description = `${model.value?.description}`
const imageUrl = `https://ucarecdn.com/${model.value?.photo.image}/-/setfill/9d9d9d/-/crop/face/300px300p/50p,50p/-/resize/x1024/`

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

const { width } = useWindowSize()

const imageModifiers = computed(() => {
  return width.value >= 768
    ? { fit: 'contain' } // for md and up
    : { fit: 'cover' } // for small screens
})

const isModelDetailOpen = ref(false)
const { start: startModelDetailTimer } = useTimeoutFn(
  () => {
    isModelDetailOpen.value = true
  },
  3000,
  { immediate: false }
)

onMounted(() => {
  startModelDetailTimer()
})

const shareAsset = ref<ShareAsset>({
  name: title,
  imageUrl: `https://ucarecdn.com/${model.value?.photo.image}/-/format/jpeg/-/scale_crop/720x960/50p,0p/`,
  url: `${siteUrl}/model/${slug}`,
})
</script>

<template>
  <main v-if="model" class="relative flex flex-col gap-8 p-2">
    <section id="hero" class="relative -left-2 -top-2 isolate h-dvh w-dvw">
      <NuxtImg
        :src="`${model.photo.image}/-/scale_crop/720x1440/50p,0p/`"
        :alt="`${model.name} hero image`"
        :height="Math.round(1440 / (1 / 2))"
        :modifiers="imageModifiers"
        :placeholder="[360, Math.round(360 / (1 / 2)), 'lightest', 25]"
        class="absolute inset-0 -z-10 h-full w-full object-cover object-top md:object-contain" />
      <!-- <CompositionOverlay /> -->
      <CardModelDetail class="absolute bottom-24 left-0" :model="model" :is-open="isModelDetailOpen" @is-open="(value) => (isModelDetailOpen = value)" />
    </section>
    <PhotoGallery :photos="photos" />
    <VideoGallery :videos="videos" />
    <FloatActionBar :share-asset="shareAsset" :asset-type="'model'" />
  </main>
</template>

<style scoped>
img {
  view-transition-name: selected-model;
}
</style>
