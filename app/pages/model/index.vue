<script setup lang="ts">
const colorMode = useColorMode()

const pageParams = ref({
  perPage: 8,
  page: 1,
})

const searchParams = ref<SearchParams>({
  query: '',
  queryBy: 'name',
  filterBy: '',
  sortBy: 'name:asc',
})

const allParams = computed(() => ({
  ...searchParams.value,
  ...pageParams.value,
}))

const { data: models, status } = useFetch('/api/model', { query: allParams })
const allModels = ref<Model[]>(models.value ?? [])
const hasMore = ref(true)
const isLoading = ref(false)

watch(status, (value) => {
  if (value == 'success' && models.value) {
    allModels.value.push(...models.value)
    hasMore.value = !!models.value?.length
  }
})

watch(
  () => [searchParams.value.query, searchParams.value.queryBy, searchParams.value.filterBy, searchParams.value.sortBy],
  () => {
    allModels.value = []
    hasMore.value = true
    pageParams.value.page = 1
  }
)

const listContainer = useTemplateRef('listContainer')
useInfiniteScroll(
  listContainer,
  () => {
    if (!isLoading.value && hasMore.value) {
      pageParams.value.page++
    }
  },
  {
    distance: 10,
    canLoadMore: () => {
      return hasMore.value && status.value !== 'pending'
    },
  }
)

const { state: viewMode, next: changeViewMode } = useCycleList(['list', 'map'])

const mapStyle = computed(() => `/api/map?theme=${colorMode.value === 'dark' ? 'dark' : 'light'}`)

// TODO: Get user location when viewMode is changed to map
const center: [number, number] = [88.4306945, 22.409649]
const zoom = 16
</script>

<template>
  <main class="relative isolate grid h-screen w-screen grid-cols-6 grid-rows-[min-content_1fr] overflow-hidden">
    <section class="hidden md:col-start-1 md:row-span-full md:block">NavBar</section>
    <div class="z-10 col-span-full col-start-1 row-start-1 m-4 flex justify-between gap-4 md:col-start-2 md:m-8">
      <SearchBar v-model="searchParams" placeholder="Search" class="w-full" />
      <button class="size-fit rounded-lg bg-dark-500 fill-white p-1 text-[36px] text-white">
        <NuxtIcon name="local:slider" />
      </button>
      <DevOnly>
        <button @click="changeViewMode()">Toggle View</button>
      </DevOnly>
    </div>
    <section
      v-show="viewMode === 'list'"
      ref="listContainer"
      class="target scrollbar-hidden relative col-span-full col-start-1 block h-full items-center justify-items-center overflow-y-auto p-2 md:col-start-2">
      <div class="mx-auto mb-20 grid w-full grid-cols-2 gap-2 md:grid-cols-4 md:gap-8">
        <CardModel
          v-for="{ id, name, fee, photo, rating, reviewCount, coordinate, isFeatured, url } in allModels"
          :id="id"
          :key="id"
          :name="name"
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
        <MglMap :map-style="mapStyle" :center="center" :zoom="zoom">
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
  </main>
</template>
