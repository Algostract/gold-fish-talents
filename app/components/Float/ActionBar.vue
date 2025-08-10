<script setup lang="ts">
export interface ShareDetails {
  title: string
  image: string
  text: string
  url: string
}

const props = defineProps<{ shareDetails: ShareDetails }>()

type Action = 'back' | 'share' | 'highlight'
const urls: {
  action: Action
  id: string
  label: string
  icon: string
}[] = [
  { action: 'back', id: 'back', label: 'Back', icon: 'local:chevron' },
  { action: 'share', id: 'share', label: 'Share', icon: 'local:share' },
  { action: 'highlight', id: 'high', label: 'highlighted', icon: 'local:love' },
]

/**
 * Fetch an image URL and convert it to a File suitable for Web Share level 2.
 * Returns `undefined` if fetch fails.
 */
/* async function fetchImageAsFile(url?: string, filename = 'share-image') {
  if (!url) return undefined
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) return undefined
    const blob = await res.blob()
    const ext = blob.type.split('/')[1] ?? 'jpg'
    return new File([blob], `${filename}.${ext}`, { type: blob.type })
  } catch {
    return undefined
  }
} */

const { share, isSupported } = useShare({ title: `${props.shareDetails.title}\n\n`, text: `${props.shareDetails.text}\n\n`, url: props.shareDetails.url })
const { copy } = useClipboard()

async function handleAction(action: Action) {
  switch (action) {
    case 'back':
      navigateTo('/model')
      break
    case 'share': {
      // const file = await fetchImageAsFile(props.shareDetails.image, `${props.shareDetails.title} Profile Photo`)

      if (isSupported?.value) {
        // await share({ files: [file] as File[] })
        await share()
      } else {
        await copy(`${props.shareDetails.title}\n\n${props.shareDetails.text}\n\n${props.shareDetails.url}`)
      }

      break
    }
    default:
      break
  }
}
</script>

<template>
  <div class="fixed bottom-5 left-0 right-0 z-50">
    <nav class="relative mx-auto w-fit rounded-full bg-dark-500 px-9 py-1 shadow-2xl" aria-label="Primary">
      <div class="relative flex gap-8">
        <button
          v-for="item in urls"
          :key="item.id"
          class="relative z-10 flex flex-1 select-none flex-col items-center justify-center py-2 transition-colors duration-300 ease-in-out"
          :class="item.action === 'share' ? 'fill-black text-[36px] text-black' : 'fill-white text-[28px] text-white'"
          @click="handleAction(item.action)">
          <NuxtIcon :name="item.icon" class="" />
        </button>
        <span aria-hidden="true" class="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-400 transition-all duration-300 ease-out" />
      </div>
    </nav>
  </div>
</template>
