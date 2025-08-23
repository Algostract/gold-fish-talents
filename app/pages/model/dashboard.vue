<script setup lang="ts">
import type { z } from 'zod'

definePageMeta({
  middleware: ['auth'],
})

const {
  public: { siteUrl },
} = useRuntimeConfig()

const { proxy: gaProxy } = useScriptGoogleAnalytics()

const { user } = useUserSession()
const { data } = await useFetch(`/api/model/${user.value!.slug}`)

const modelUpdateFormSchema = modelFormSchema.pick({
  profession: true,
  height: true,
  weight: true,
  shoulder: true,
  waist: true,
  facebook: true,
  instagram: true,
  fee: true,
})

type ModelUpdateFormData = z.infer<typeof modelUpdateFormSchema>

const { r$ } = useRegleSchema(
  {
    profession: data.value?.details?.professionalBackground?.profession ?? '',
    height: data.value?.details.physicalAttributes.height,
    weight: data.value?.details.physicalAttributes.weight,
    shoulder: data.value?.details.physicalAttributes.shoulder,
    waist: data.value?.details.physicalAttributes.waist,
    facebook: '',
    instagram: '',
    fee: data.value?.fee,
  },
  modelUpdateFormSchema
)

function showError(field: keyof ModelUpdateFormData) {
  return r$[field]?.$dirty && r$[field].$error
}

const { status, execute } = useFetch('/api/model/dashboard', {
  method: 'POST',
  body: r$.$value,
  immediate: false,
  watch: false,
})

async function onUpdate() {
  const { valid } = await r$.$validate()
  if (!valid || status.value === 'pending') return

  await execute()

  if (status.value === 'success') {
    navigateTo('/model/dashboard')
  }
}

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
  url: `${siteUrl}/model/${user.value!.slug}`,
})

async function handleAction(action: Action) {
  switch (action) {
    case 'share': {
      await share(shareAsset.value)
      gaProxy.gtag('event', 'share', { talent: shareAsset.value.name, type: 'model' })
      break
    }

    case 'models': {
      navigateTo('/model')
      break
    }
    case 'highlight':
      break
    default:
      break
  }
}
</script>

<template>
  <main class="flex min-h-screen w-full flex-col items-center justify-center gap-8 p-5">
    <!-- Profile Picture -->
    <div v-if="data" class="flex flex-col items-center gap-6">
      <NuxtImg
        :src="`${data.photo.image}/-/crop/face/200px200p/-/crop/1:1/50p,30p/`"
        :alt="data.name"
        width="80"
        height="80"
        loading="eager"
        fit="cover"
        class="size-3/4 rounded-full object-cover object-top" />
      <h2 class="font-semibold text-lg text-white">{{ data.name }}</h2>
    </div>
    <section class="flex w-full max-w-2xl flex-col gap-6 rounded-2xl bg-dark-500 p-6 shadow-xl ring-1 ring-dark-600" aria-labelledby="signup-heading">
      <form class="flex flex-col gap-5" novalidate @submit.prevent="onUpdate">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <!-- Profession -->
          <div class="flex flex-col gap-3">
            <label for="profession" class="font-medium text-slate-300 text-sm after:ml-1">Profession</label>
            <input
              id="profession"
              v-model="r$.$value.profession"
              type="text"
              placeholder="e.g. Student / Photographer / Model"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0"
              :aria-invalid="showError('profession') ? 'true' : 'false'" />
            <p v-if="showError('profession')" class="text-xs text-alert-500">{{ r$.profession.$errors[0] }}</p>
          </div>
          <!-- Height -->
          <div class="flex flex-col gap-3">
            <label for="height" class="font-medium text-slate-300 text-sm after:ml-1">Height (cm)</label>
            <input
              id="height"
              v-model.number="r$.$value.height"
              type="number"
              min="30"
              max="300"
              placeholder="170"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0"
              :aria-invalid="showError('height') ? 'true' : 'false'" />
            <p v-if="showError('height')" class="text-xs text-alert-500">{{ r$.height.$errors[0] }}</p>
          </div>
          <!-- Weight -->
          <div class="flex flex-col gap-3">
            <label for="weight" class="font-medium text-slate-300 text-sm after:ml-1">Weight (Kg)</label>
            <input
              id="weight"
              v-model.number="r$.$value.weight"
              type="number"
              min="20"
              max="500"
              placeholder="60"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0"
              :aria-invalid="showError('weight') ? 'true' : 'false'" />
            <p v-if="showError('weight')" class="text-xs text-alert-500">{{ r$.weight.$errors[0] }}</p>
          </div>
          <!-- Shoulder -->
          <div class="flex flex-col gap-3">
            <label for="shoulder" class="font-medium text-slate-300 text-sm after:ml-1 after:text-alert-500 after:content-['*']">Shoulder (cm)</label>
            <input
              id="shoulder"
              v-model.number="r$.$value.shoulder"
              type="number"
              min="20"
              max="500"
              placeholder="60"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0"
              :aria-invalid="showError('shoulder') ? 'true' : 'false'" />
            <p v-if="showError('shoulder')" class="text-xs text-alert-500">{{ r$.shoulder.$errors[0] }}</p>
          </div>

          <!-- Waist -->
          <div class="flex flex-col gap-3">
            <label for="waist" class="font-medium text-slate-300 text-sm after:ml-1 after:text-alert-500 after:content-['*']">Waist (cm)</label>
            <input
              id="waist"
              v-model.number="r$.$value.waist"
              type="number"
              min="20"
              max="500"
              placeholder="60"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0"
              :aria-invalid="showError('waist') ? 'true' : 'false'" />
            <p v-if="showError('waist')" class="text-xs text-alert-500">{{ r$.waist.$errors[0] }}</p>
          </div>
        </div>
        <!-- Social (optional) -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="flex flex-col gap-3">
            <label for="facebook" class="font-medium text-slate-300 text-sm">Facebook</label>
            <input
              id="facebook"
              v-model="r$.$value.facebook"
              type="text"
              placeholder="facebook.com/yourprofile"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0" />
            <p v-if="showError('facebook')" class="text-xs text-alert-500">{{ r$.facebook?.$errors[0] }}</p>
          </div>
          <div class="flex flex-col gap-3">
            <label for="instagram" class="font-medium text-slate-300 text-sm">Instagram</label>
            <input
              id="instagram"
              v-model="r$.$value.instagram"
              type="text"
              placeholder="@your_handle or instagram.com/your"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0" />
            <p v-if="showError('instagram')" class="text-xs text-alert-500">{{ r$.instagram?.$errors[0] }}</p>
          </div>
        </div>
        <!-- Fee -->
        <div class="flex flex-col gap-3">
          <label for="fee" class="font-medium text-slate-300 text-sm after:ml-1">Fee per day (₹)</label>
          <input
            id="fee"
            v-model.number="r$.$value.fee"
            type="number"
            min="0"
            placeholder="0"
            class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0"
            :aria-invalid="showError('fee') ? 'true' : 'false'" />
          <p v-if="showError('fee')" class="text-xs text-alert-500">{{ r$.fee.$errors[0] }}</p>
        </div>
        <!-- Actions -->
        <button
          type="submit"
          :disabled="r$.$invalid"
          class="font-medium flex w-full items-center justify-center gap-1.5 rounded-lg py-3 text-base transition-all disabled:cursor-not-allowed disabled:opacity-60"
          :class="!r$.$invalid ? 'bg-white text-black' : 'bg-black text-white'">
          <NuxtIcon v-if="status === 'pending'" name="local:loader" class="text-[24px]" />Update
        </button>
      </form>
    </section>
    <!-- <FloatActionBar :share-asset="shareAsset" :asset-type="'model'" /> -->
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
  </main>
</template>
