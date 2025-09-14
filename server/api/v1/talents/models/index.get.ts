import type { TypesenseModel } from '~~/server/api/search/sync.post'

export default defineEventHandler<Promise<{ models: Model[]; count: number; page: number; perPage: number }>>(async (event) => {
  try {
    const queryParams = getQuery<PaginatedSearchParams>(event)

    const response = await typesense
      .collections<TypesenseModel>('model')
      .documents()
      .search({
        q: queryParams.query,
        query_by: queryParams.queryBy,
        filter_by: `status:=Active&&${queryParams.filterBy}`,
        sort_by: `isFeatured:desc,${queryParams.sortBy}`,
        per_page: queryParams.perPage,
        page: queryParams.page,
      })

    return {
      models:
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
        })) ?? [],
      count: response.out_of,
      page: response.page ?? 1,
      perPage: parseInt(`${queryParams.perPage}`) ?? 8,
    }
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
