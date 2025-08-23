<script setup lang="ts">
type Action = 'back' | 'share' | 'highlight'

const props = defineProps<{ shareAsset: ShareAsset; assetType: 'model' }>()

const { proxy: gaProxy } = useScriptGoogleAnalytics()

const urls: {
  action: Action
  id: string
  label: string
  icon: string
}[] = [
  { action: 'back', id: 'back', label: 'Back', icon: 'local:chevron-bold' },
  { action: 'share', id: 'share', label: 'Share', icon: 'local:share' },
  { action: 'highlight', id: 'high', label: 'highlighted', icon: 'local:love' },
]
// const { share, isSupported } = useShare({ title: `${props.shareAsset.title}\n\n`, text: `${props.shareAsset.text}\n\n`, url: props.shareAsset.url })

async function handleAction(action: Action) {
  switch (action) {
    case 'back':
      navigateTo(`/${props.assetType}`)
      break
    case 'share': {
      await share(props.shareAsset)
      gaProxy.gtag('event', 'share', { talent: props.shareAsset.name, type: props.assetType })
      break
    }
    case 'highlight':
      break
    /*     case 'contact'{
          gaProxy.gtag('event', 'contact', { talent: props.shareAsset.title, type: props.assetType })
          break
        } */
    default:
      break
  }
}
</script>

<template>
  <nav class="fixed bottom-5 left-0 right-0 z-50 mx-auto w-fit rounded-full bg-dark-500 px-9 py-1 shadow-2xl" aria-label="Primary">
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
</template>
