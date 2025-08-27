<script setup lang="ts">
import { parseISO, format, isBefore, startOfDay, addDays } from 'date-fns'

const props = defineProps<{ project: Project }>()

const {
  public: { siteUrl },
} = useRuntimeConfig()

const dateObj = computed(() => parseISO(props.project.datetime))
// formatted parts
const date = computed(() => format(dateObj.value, 'MMMM d, yyyy'))
const day = computed(() => format(dateObj.value, 'EEEE'))
const time = computed(() => format(dateObj.value, 'hh:mm a'))
const isActive = computed(() => isBefore(new Date(), addDays(startOfDay(dateObj.value), 1)))

const image = computed(() => (props.project.image ? { provider: 'uploadcare', src: props.project.image } : { provider: 'ipx', src: 'https://api.dicebear.com/9.x/glass/svg' }))

async function downloadMedia(url: string | Source[], filename: string, type: 'photo' | 'video') {
  let finalUrl = ''

  if (type === 'photo') {
    finalUrl = `https://ucarecdn.com/${url}/`
  } else {
    if (Array.isArray(url)) {
      // find 1440p + AVC format
      const match = url.find((s) => s.resolution === '1440p' && s.codec === 'avc')

      if (!match) {
        throw new Error('No 1440p AVC video source found')
      }

      finalUrl = `${siteUrl}${match.src}`
    } else {
      finalUrl = `${siteUrl}${url}`
    }
  }

  const blob = await $fetch<Blob>(finalUrl, { responseType: 'blob' })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = type === 'photo' ? `${filename}.jpg` : `${filename}.mp4`
  link.click()
  URL.revokeObjectURL(link.href)
}
</script>

<template>
  <div class="relative space-y-4">
    <!-- Date -->
    <div class="grid grid-flow-col grid-cols-2 grid-rows-2 items-center justify-between text-white">
      <span class="font-medium">
        {{ date }}
      </span>
      <span class="opacity-60">{{ day }}</span>
      <!-- {{ relativeTime }} -->
      <span class="self-start justify-self-end">{{ time }} </span>
    </div>
    <!-- Card -->
    <div class="relative grid max-w-md grid-cols-[2fr_1fr] grid-rows-[repeat(4,auto)_fit-content_fit-content] gap-2 overflow-hidden rounded-xl border border-dark-600 bg-dark-500 text-white shadow-md">
      <NuxtImg
        :provider="image.provider"
        :src="image.src"
        alt="event"
        height="256"
        width="256"
        fit="cover"
        class="col-span-1 col-start-2 row-span-4 row-start-1 aspect-square rounded-bl-lg object-cover" />
      <!-- <div class="flex-1 space-y-1"> -->
      <h3 class="font-semibold col-start-1 row-start-1 ml-4 mt-4 text-base">{{ project.name }}</h3>
      <p class="col-start-1 row-start-2 ml-4 text-sm leading-snug opacity-60">
        {{ project.location.address }}
      </p>
      <!-- </div> -->
      <!-- Actions -->
      <div v-show="isActive" class="col-span-full col-start-1 row-start-5 ml-4 mt-4 flex gap-2">
        <NuxtLink :to="project.mapUrl" external target="_blank" class="font-medium text-gray-900 flex h-fit items-center gap-1 rounded-full bg-white px-2 py-1.5 pr-3 text-xs text-black shadow">
          <NuxtIcon name="local:geo" class="text-[16px]" /> Direction
        </NuxtLink>
        <NuxtLink :to="project.helpline" external class="font-medium text-gray-900 flex h-fit items-center gap-1 rounded-full bg-white px-2 py-1.5 pr-3 text-xs text-black shadow">
          <NuxtIcon name="local:call-accept" class="text-[16px]" /> Ask for Help
        </NuxtLink>
      </div>
      <!-- Media -->
      <div class="relative col-span-full col-start-1 row-start-6 m-2 mt-4">
        <div v-if="project.media.photo.length + project.media.video.length === 0" class="relative m-auto size-fit">
          <NuxtImg provider="ipx" src="/images/image-gallery.svg" width="192" />
          <span class="mb-4 inline-block w-full text-center">Media in process</span>
        </div>
        <div v-else class="relative z-10 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
          <!-- url -->
          <div v-for="{ id, image, description } in project.media.photo" :key="id" class="relative">
            <NuxtImg
              :src="image"
              :alt="description"
              :width="480"
              :height="Math.round(480 / (3 / 4))"
              fit="cover"
              loading="lazy"
              :placeholder="[120, Math.round(120 / (3 / 4)), 'lightest', 25]"
              class="w-full rounded-sm bg-light-600 object-cover dark:bg-dark-500" />
            <button
              v-if="image"
              class="absolute bottom-2 right-2 z-10 items-center gap-1 rounded-md bg-black/60 p-2 text-sm text-white backdrop-blur-sm transition hover:bg-black/80 focus:bg-primary-500/60 focus:text-black"
              @click="downloadMedia(image, id, 'photo')">
              <NuxtIcon name="local:download" class="text-[16px]" />
            </button>
          </div>
          <div v-for="{ id, sources, poster } in project.media.video" :key="id" class="relative">
            <NuxtVideo
              :key="id"
              class="aspect-video"
              :poster="poster"
              :source="sources"
              :disable-picture-in-picture="true"
              controls-list="nodownload"
              :autoplay="true"
              :muted="true"
              :playsinline="true"
              preload="metadata"
              :loop="true" />
            <button
              v-if="sources[0]?.src"
              class="absolute bottom-2 right-2 z-10 items-center gap-1 rounded-md bg-black/60 p-2 text-sm text-white backdrop-blur-sm transition hover:bg-black/80 focus:bg-primary-500/60 focus:text-black"
              @click="downloadMedia(sources, id, 'video')">
              <NuxtIcon name="local:download" class="text-[16px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
