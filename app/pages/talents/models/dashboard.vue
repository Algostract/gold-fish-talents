<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const {
  public: { siteUrl },
} = useRuntimeConfig()

const { proxy: gaProxy } = useScriptGoogleAnalytics()

const { data, refresh } = await useFetch('/api/v1/talents/models/dashboard')

type Action = 'share' | 'models' | 'highlight'

const urls: {
  action: Action
  id: string
  label: string
  icon: string
}[] = [
  { action: 'share', id: 'share', label: 'Share', icon: 'local:share' },
  { action: 'models', id: 'models', label: 'Models', icon: 'local:grid' },
  { action: 'highlight', id: 'high', label: 'highlighted', icon: 'local:love' },
]

const title = `${data.value?.name}`
const shareAsset = ref<ShareAsset>({
  name: title,
  imageUrl: `https://ucarecdn.com/${data.value?.photo.image}/-/format/jpeg/-/scale_crop/720x960/50p,0p/`,
  url: `${siteUrl}/talents/models/${data.value?.id}`,
})

async function handleAction(action: Action) {
  switch (action) {
    case 'share': {
      await share(shareAsset.value)
      gaProxy.gtag('event', 'share', { talent: shareAsset.value.name, type: 'model' })
      break
    }
    case 'models': {
      navigateTo('/talents/models')
      break
    }
    case 'highlight':
      break
    default:
      break
  }
}

const profileImg = computed(() =>
  data.value?.photo?.image ? { provider: 'uploadcare', src: `${data.value.photo.image}/-/crop/face/200px200p/-/crop/1:1/50p,30p/` } : { provider: 'ipx', src: 'https://api.dicebear.com/9.x/glass/svg' }
)

// 'media'
const tabs = ['project', 'profile'] as const
type Tab = (typeof tabs)[number]

const activeTab = ref<Tab>('project')

function setTab(tab: Tab) {
  activeTab.value = tab
}
</script>

<template>
  <main v-if="data" class="flex h-dvh w-dvw flex-col items-center justify-center gap-8 p-5 pb-24">
    <!-- Profile Picture -->
    <div class="flex flex-col items-center gap-6">
      <NuxtImg :provider="profileImg.provider" :src="profileImg.src" :alt="data.name" width="128" height="128" loading="eager" fit="cover" class="rounded-full object-cover object-top" />
      <h2 class="font-semibold text-lg text-white">{{ data.name }}</h2>
    </div>
    <!-- Tabs -->
    <div class="flex w-full max-w-2xl rounded-xl bg-dark-500 p-1">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="font-medium flex-1 rounded-lg py-2 text-sm capitalize"
        :class="activeTab === tab ? 'bg-primary-400 text-black' : 'text-slate-300'"
        @click="setTab(tab)">
        {{ tab }}
      </button>
    </div>
    <!-- Sections -->
    <section class="relative flex w-screen max-w-2xl flex-1 flex-col gap-6 overflow-y-scroll rounded-2xl bg-dark-400 px-5 shadow-xl">
      <!-- Media Tab -->
      <!-- <ModelTabMedia v-if="activeTab === 'media'" :media="data.media" /> -->
      <!-- Project Tab -->
      <ModelTabProject v-if="activeTab === 'project'" :projects="data.projects" />
      <!-- Profile Tab -->
      <ModelTabProfile v-else-if="activeTab === 'profile'" :data="data" @update="refresh" />
    </section>
    <!-- Float action button -->
    <nav class="fixed bottom-5 left-0 right-0 z-50 mx-auto w-fit rounded-full bg-dark-500 px-9 py-1 shadow-2xl" aria-label="Primary">
      <div class="relative flex gap-8">
        <button
          v-for="item in urls"
          :key="item.id"
          class="relative z-10 flex flex-1 select-none flex-col items-center justify-center py-2 transition-colors duration-300 ease-in-out"
          :class="item.action === 'models' ? 'fill-black text-[36px] text-black' : 'fill-white text-[28px] text-white'"
          @click="handleAction(item.action)">
          <NuxtIcon :name="item.icon" />
        </button>
        <span aria-hidden="true" class="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-400 transition-all duration-300 ease-out" />
      </div>
    </nav>
  </main>
</template>
