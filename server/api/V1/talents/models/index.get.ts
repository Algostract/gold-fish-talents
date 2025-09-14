import type { TypesenseModel } from '~~/server/api/search/sync.post'

export default defineEventHandler<Promise<Model[]>>(async (event) => {
  try {
    const searchParams = getQuery<PaginatedSearchParams>(event)

    const response = await typesense
      .collections<TypesenseModel>('model')
      .documents()
      .search({
        q: searchParams.query,
        query_by: searchParams.queryBy,
        filter_by: 'status:=Active' + (searchParams.filterBy ? `&&${searchParams.filterBy}` : ''), // e.g. "isFeatured:=true"
        sort_by: searchParams.sortBy,
        per_page: searchParams.perPage,
        page: searchParams.page,
      })
    // filter by status

    return (
      response.hits?.map<Model>(({ document }) => ({
        id: document.id,
        name: document.name,
        gender: document.gender,
        age: document.age,
        fee: document.fee,
        photo: {
          title: document['photo.title'],
          image: document['photo.image'],
          description: document['photo.description'],
          aspectRatio: document['photo.aspectRatio'],
        },
        rating: document.rating,
        reviewCount: document.reviewCount,
        coordinate: document.coordinate,
        isFeatured: document.isFeatured,
        url: `/talents/models/${document.id}`,
      })) ?? []
    )
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API model/index GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
