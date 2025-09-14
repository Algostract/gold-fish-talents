<script setup lang="ts">
import type { z } from 'zod'

definePageMeta({
  layout: false,
  middleware: ['guest'],
})

type ModelFormData = z.infer<typeof modelFormSchema>

const { r$ } = useRegleSchema(
  {
    name: '',
    dob: '',
    gender: 'female',
    profession: '',
    coordinate: undefined,
    height: undefined,
    weight: undefined,
    shoulder: undefined,
    waist: undefined,
    phone: '',
    sameAsPhone: false,
    whatsapp: '',
    facebook: '',
    instagram: '',
    fee: 0,
    why: '',
  },
  modelFormSchema
)

function showError(field: keyof ModelFormData) {
  return r$[field]?.$dirty && r$[field].$error
}

// when sameAsPhone toggled or phone changes, ensure whatsapp follows if required
watch(
  () => r$.$value.sameAsPhone,
  (val) => {
    if (val) {
      r$.$value.whatsapp = r$.$value.phone
    }
  }
)

watch(
  () => r$.$value.phone,
  (val) => {
    if (r$.$value.sameAsPhone) r$.$value.whatsapp = val
  }
)

const { status, execute } = useFetch('/api/v1/talents/models', {
  method: 'POST',
  body: r$.$value,
  immediate: false,
  watch: false,
})

async function onSubmit() {
  const { valid } = await r$.$validate()
  if (!valid || status.value === 'pending') return

  await execute()

  if (status.value === 'success') {
    await navigateTo('/talents/models/dashboard')
  }
}

// const colorMode = useColorMode()
// colorMode.value === 'dark'
// eslint-disable-next-line no-constant-condition
const mapStyle = computed(() => `/api/map?theme=${false ? 'dark' : 'light'}`)
const center = r$.$value.coordinate ?? [88, 22]
const zoom = 16

function onGeoLocate(event: { coords: { latitude: number; longitude: number } }) {
  r$.$value.coordinate = [event.coords.longitude, event.coords.latitude]
}
</script>

<template>
  <main class="flex min-h-screen w-full items-center justify-center p-5">
    <section class="flex w-full max-w-2xl flex-col gap-6 rounded-2xl bg-dark-500 p-6 shadow-xl ring-1 ring-dark-600" aria-labelledby="signup-heading">
      <header>
        <h1 id="signup-heading" class="text-xl text-white">Model — Sign up</h1>
        <p class="mt-1 text-light-600">Fill out the form to apply as a model</p>
      </header>
      <form class="flex flex-col gap-5" novalidate @submit.prevent="onSubmit">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <!-- Name -->
          <div class="flex flex-col gap-3">
            <label for="name" class="font-medium text-slate-300 text-sm after:ml-1 after:text-alert-500 after:content-['*']">Full name</label>
            <input
              id="name"
              v-model="r$.$value.name"
              type="text"
              autocomplete="name"
              placeholder="Your full name"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
              :aria-invalid="showError('name') ? 'true' : 'false'" />
            <p v-if="showError('name')" class="text-xs text-alert-500">{{ r$.name.$errors[0] }}</p>
          </div>
          <!-- DOB -->
          <div class="flex flex-col gap-3">
            <label for="dob" class="font-medium text-slate-300 text-sm after:ml-1 after:text-alert-500 after:content-['*']">Date of birth</label>
            <input
              id="dob"
              v-model="r$.$value.dob"
              type="date"
              placeholder="YYYY-MM-DD"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
              :aria-invalid="showError('dob') ? 'true' : 'false'" />
            <p v-if="showError('dob')" class="text-xs text-alert-500">{{ r$.dob.$errors[0] }}</p>
          </div>
          <!-- Gender -->
          <div class="flex flex-col gap-3">
            <label class="font-medium text-slate-300 text-sm after:ml-1 after:text-alert-500 after:content-['*']">Gender</label>
            <div class="mt-2 flex gap-3">
              <label class="inline-flex items-center gap-2">
                <input v-model="r$.$value.gender" type="radio" value="male" class="disabled:cursor-not-allowed disabled:opacity-60" />
                <span class="text-sm">Male</span>
              </label>
              <label class="inline-flex items-center gap-2">
                <input v-model="r$.$value.gender" type="radio" value="female" class="disabled:cursor-not-allowed disabled:opacity-60" />
                <span class="text-sm">Female</span>
              </label>
              <label class="inline-flex items-center gap-2">
                <input v-model="r$.$value.gender" type="radio" value="other" class="disabled:cursor-not-allowed disabled:opacity-60" />
                <span class="text-sm">Other</span>
              </label>
            </div>
            <p v-if="showError('gender')" class="text-xs text-alert-500">{{ r$.gender.$errors[0] }}</p>
          </div>
          <!-- Profession -->
          <div class="flex flex-col gap-3">
            <label for="profession" class="font-medium text-slate-300 text-sm after:ml-1 after:text-alert-500 after:content-['*']">Profession</label>
            <input
              id="profession"
              v-model="r$.$value.profession"
              type="text"
              placeholder="e.g. Student / Photographer / Model"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
              :aria-invalid="showError('profession') ? 'true' : 'false'" />
            <p v-if="showError('profession')" class="text-xs text-alert-500">{{ r$.profession.$errors[0] }}</p>
          </div>
          <!-- Coordinate -->
          <div class="relative aspect-video w-full overflow-hidden rounded-lg">
            <ClientOnly>
              <MglMap :map-style="mapStyle" :center="center" :zoom="zoom" :attribution-control="false">
                <MglGeolocateControl position="bottom-right" :show-user-location="false" @geolocate="onGeoLocate" />
                <MglMarker v-if="r$.$value.coordinate" v-model:coordinates="r$.$value.coordinate" :draggable="true" />
              </MglMap>
            </ClientOnly>
            <p v-if="showError('coordinate')" class="text-xs text-alert-500">{{ r$.coordinate.$errors[0] }}</p>
          </div>
          <!-- Height -->
          <div class="flex flex-col gap-3">
            <label for="height" class="font-medium text-slate-300 text-sm after:ml-1 after:text-alert-500 after:content-['*']">Height (cm)</label>
            <input
              id="height"
              v-model.number="r$.$value.height"
              type="number"
              min="30"
              max="300"
              placeholder="175"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
              :aria-invalid="showError('height') ? 'true' : 'false'" />
            <p v-if="showError('height')" class="text-xs text-alert-500">{{ r$.height.$errors[0] }}</p>
          </div>
          <!-- Weight -->
          <div class="flex flex-col gap-3">
            <label for="weight" class="font-medium text-slate-300 text-sm after:ml-1 after:text-alert-500 after:content-['*']">Weight (Kg)</label>
            <input
              id="weight"
              v-model.number="r$.$value.weight"
              type="number"
              min="20"
              max="500"
              placeholder="55"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
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
              placeholder="40"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
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
              placeholder="65"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
              :aria-invalid="showError('waist') ? 'true' : 'false'" />
            <p v-if="showError('waist')" class="text-xs text-alert-500">{{ r$.waist.$errors[0] }}</p>
          </div>
        </div>
        <!-- Contact block -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="flex flex-col gap-3">
            <label for="phone" class="font-medium text-slate-300 text-sm after:ml-1 after:text-alert-500 after:content-['*']">Phone</label>
            <input
              id="phone"
              v-model="r$.$value.phone"
              type="tel"
              inputmode="tel"
              placeholder="9876543210"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
              :aria-invalid="showError('phone') ? 'true' : 'false'" />
            <p v-if="showError('phone')" class="text-xs text-alert-500">{{ r$.phone.$errors[0] }}</p>
          </div>
          <div class="mt-6 flex items-center gap-2">
            <input id="same" v-model="r$.$value.sameAsPhone" type="checkbox" class="size-4 disabled:cursor-not-allowed disabled:opacity-60" />
            <label for="same" class="text-slate-300 text-sm">WhatsApp same as phone</label>
          </div>
          <div class="flex flex-col gap-3">
            <label for="whatsapp" class="font-medium text-slate-300 text-sm after:ml-1 after:text-alert-500 after:content-['*']">WhatsApp number</label>
            <input
              id="whatsapp"
              v-model="r$.$value.whatsapp"
              :disabled="r$.$value.sameAsPhone"
              type="tel"
              inputmode="tel"
              placeholder="Same as phone or enter separate"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
              :aria-invalid="showError('whatsapp') ? 'true' : 'false'" />
            <p v-if="showError('whatsapp')" class="text-xs text-alert-500">{{ r$.whatsapp?.$errors[0] }}</p>
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
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60" />
            <p v-if="showError('facebook')" class="text-xs text-alert-500">{{ r$.facebook?.$errors[0] }}</p>
          </div>
          <div class="flex flex-col gap-3">
            <label for="instagram" class="font-medium text-slate-300 text-sm">Instagram</label>
            <input
              id="instagram"
              v-model="r$.$value.instagram"
              type="text"
              placeholder="instagram.com/yourprofile"
              class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60" />
            <p v-if="showError('instagram')" class="text-xs text-alert-500">{{ r$.instagram?.$errors[0] }}</p>
          </div>
        </div>
        <!-- Fee -->
        <div class="flex flex-col gap-3">
          <label for="fee" class="font-medium text-slate-300 text-sm after:ml-1 after:text-alert-500 after:content-['*']">Fee per day (₹)</label>
          <input
            id="fee"
            v-model.number="r$.$value.fee"
            type="number"
            min="0"
            placeholder="0"
            class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
            :aria-invalid="showError('fee') ? 'true' : 'false'" />
          <p v-if="showError('fee')" class="text-xs text-alert-500">{{ r$.fee.$errors[0] }}</p>
        </div>
        <!-- Why -->
        <div class="flex flex-col gap-3">
          <label for="why" class="font-medium text-slate-300 text-sm after:ml-1 after:text-alert-500 after:content-['*']">Why do you want to be a model?</label>
          <textarea
            id="why"
            v-model="r$.$value.why"
            rows="4"
            placeholder="Tell us in a few lines"
            class="text-slate-200 w-full rounded-lg bg-transparent px-4 py-3 ring-2 ring-dark-600 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
            :aria-invalid="showError('why') ? 'true' : 'false'" />
          <p v-if="showError('why')" class="text-xs text-alert-500">{{ r$.why.$errors[0] }}</p>
        </div>
        <!-- Actions -->
        <button
          type="submit"
          :disabled="r$.$invalid"
          class="font-medium flex w-full items-center justify-center gap-1.5 rounded-lg py-3 text-base transition-all disabled:cursor-not-allowed disabled:opacity-60"
          :class="!r$.$invalid ? 'bg-white text-black' : 'bg-black text-white'">
          <NuxtIcon v-if="status === 'pending'" name="local:loader" class="text-[24px]" />Submit
        </button>
      </form>
    </section>
  </main>
</template>
