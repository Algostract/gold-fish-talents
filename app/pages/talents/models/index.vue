<script setup lang="ts">
definePageMeta({
  layout: false,
})

function onFeeUpdate(min: number, max: number) {
  filterBy.value.fee.value.min = min
  filterBy.value.fee.value.max = max
}

const filterBy = ref({
  fee: { limit: { min: 0, max: 5000 }, value: { min: 0, max: 5000 } },
})

const searchParams = ref<SearchParams>({
  query: '',
  queryBy: 'name',
})

const pageParams = ref<PageParams>({
  perPage: 8,
  page: 1,
})

/**
 * 🔹 Computed query params
 */
const queryParams = computed(() => ({
  ...searchParams.value,
  filterBy: `fee:[${filterBy.value.fee.value.min}..${filterBy.value.fee.value.max}]`,
  sortBy: 'name:asc',
  ...pageParams.value,
}))

const debouncedQueryParams = debouncedRef(queryParams, 300)

/**
 * 🔹 Fetch API
 */
const { data: models, status } = useFetch<Model[]>('/api/v1/talents/models', {
  query: debouncedQueryParams,
  default: () => [],
})

/**
 * 🔹 State
 */
const allModels = ref<Model[]>(models.value)
const hasMore = ref(true)

const isLoading = computed(() => status.value === 'pending' && !allModels.value.length)

/**
 * 🔹 Append new data whenever models update
 */
watch(status, (value) => {
  if (!value) return
  console.log({ status: status.value, models: models.value, pageParams: pageParams.value })
  if (pageParams.value.page === 1) {
    // fresh search → reset
    allModels.value = [...models.value]
  } else if (status.value === 'success') {
    // append
    allModels.value.push(...models.value)
  }

  hasMore.value = value.length > 0
})

/**
 * 🔹 Reset when filters/search change
 */
watch(
  () => [searchParams.value.query, searchParams.value.queryBy, filterBy.value.fee.value.min, filterBy.value.fee.value.max],
  () => {
    hasMore.value = true
    pageParams.value.page = 1
  }
)

/**
 * 🔹 Infinite scroll
 */
const listContainer = useTemplateRef('list-container')

useInfiniteScroll(
  listContainer,
  () => {
    if (hasMore.value && status.value === 'success') {
      pageParams.value.page++
    }
  },
  { distance: 10 }
)

const { state: viewMode, next: changeViewMode } = useCycleList(['list', 'map'])

const colorMode = useColorMode()

const mapStyle = computed(() => `/api/map?theme=${colorMode.value === 'dark' ? 'dark' : 'light'}`)
// TODO: Get user location when viewMode is changed to map
const center: [number, number] = [88.4306945, 22.409649]
const zoom = 16

const isDrawerOpen = ref(false)
</script>

<template>
  <main class="relative isolate grid h-screen w-screen grid-cols-6 grid-rows-[min-content_1fr] overflow-hidden">
    <section class="hidden md:col-start-1 md:row-span-full md:block">NavBar</section>
    <div class="z-10 col-span-full col-start-1 row-start-1 m-4 flex justify-between gap-4 md:col-start-2 md:m-8">
      <SearchBar v-model="searchParams" placeholder="Search" class="w-full" />
      <button class="size-fit rounded-lg bg-dark-500 fill-white p-1 text-[36px] text-white" @click="isDrawerOpen = !isDrawerOpen">
        <NuxtIcon name="local:slider" />
      </button>
      <DevOnly>
        <button @click="changeViewMode()">Toggle View</button>
      </DevOnly>
    </div>
    <section
      v-show="viewMode === 'list'"
      ref="list-container"
      class="target scrollbar-hidden relative col-span-full col-start-1 block h-full items-center justify-items-center overflow-y-auto p-2 md:col-start-2">
      <div v-if="isLoading">Loading Model</div>
      <!--  -->
      <div v-else class="mx-auto mb-20 grid w-full grid-cols-2 gap-2 md:grid-cols-4 md:gap-8">
        <CardModel
          v-for="{ id, name, gender, age, fee, photo, rating, reviewCount, coordinate, isFeatured, url } in allModels"
          :id="id"
          :key="id"
          :name="name"
          :gender="gender"
          :age="age"
          :fee="fee"
          :photo="photo"
          :rating="rating"
          :review-count="reviewCount"
          :coordinate="coordinate"
          :is-featured="isFeatured"
          :is-favorite="false"
          :url="url" />
      </div>
    </section>
    <section v-show="viewMode !== 'list'" class="col-span-full col-start-1 row-span-full row-start-2 h-full p-2 md:col-start-2">
      <ClientOnly>
        <MglMap :map-style="mapStyle" :center="center" :zoom="zoom" :attribution-control="false">
          <!-- <MglNavigationControl /> -->
          <!-- <MglFullscreenControl /> -->
          <!-- <MglScaleControl /> -->
          <MglGeolocateControl />
          <MglMarker v-for="{ id, photo, name, coordinate, url } in models" :key="id" :coordinates="coordinate">
            <template #marker>
              <MarkerModel :id="id" :photo="photo" :name="name" :url="url" />
            </template>
          </MglMarker>
        </MglMap>
      </ClientOnly>
    </section>
    <FloatNavBar />
    <AppDrawer :is-open="isDrawerOpen" @close="isDrawerOpen = false">
      <ClientOnly>
        <div class="flex flex-col gap-4">
          <section class="grid w-full grid-flow-col grid-cols-[auto_min-content] grid-rows-[min-content_auto] gap-y-3">
            <span>Sort By</span>
            <div class="flex flex-wrap gap-3">
              <!--   <BaseLabel icon="cart" title="Arrival" size="S" class="flex-shrink-0"
                :class="{ '!text-white bg-primary-500': sortBy.type == 'arrival' }" @click="sortBy.type = 'arrival'" />
              <BaseLabel icon="trending-up" title="Popularity" size="S" class="flex-shrink-0"
                :class="{ '!text-white bg-primary-500': sortBy.type == 'popularity' }"
                @click="sortBy.type = 'popularity'" />
              <BaseLabel icon="star" title="Rating" size="S" class="flex-shrink-0"
                :class="{ '!text-white bg-primary-500': sortBy.type == 'rating' }" @click="sortBy.type = 'rating'" />
              <BaseLabel icon="money" title="Fee" size="S" class="flex-shrink-0"
                :class="{ '!text-white bg-primary-500': sortBy.type == 'fee' }" @click="sortBy.type = 'fee'" /> -->
            </div>
            <span>Order</span>
            <div class="flex flex-wrap gap-3">
              <!--  <BaseLabel icon="increasing" title="increasing" size="S" class="flex-shrink-0"
                :class="{ '!text-white bg-primary-500': sortBy.order == 'increasing' }"
                @click="sortBy.order = 'increasing'" />
              <BaseLabel icon="decreasing" title="decreasing" size="S" class="flex-shrink-0"
                :class="{ '!text-white bg-primary-500': sortBy.order == 'decreasing' }"
                @click="sortBy.order = 'decreasing'" /> -->
            </div>
          </section>
          <section class="">
            <div class="grid grid-cols-2 grid-rows-2 gap-y-2">
              <span>Fee</span>
              <span class="justify-self-end">₹{{ filterBy.fee.value.min }} - ₹{{ filterBy.fee.value.max }}</span>
              <AppSlider :limit="filterBy.fee.limit" :value="filterBy.fee.value" :step="500" class="col-span-2" @update="onFeeUpdate" />
            </div>
          </section>
        </div>
      </ClientOnly>
    </AppDrawer>
  </main>
</template>
