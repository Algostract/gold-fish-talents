import { z } from 'zod'

export default defineCachedEventHandler<Promise<Photo[]>>(
  async (event) => {
    try {
      const { slug: projectSlug } = await getValidatedRouterParams(
        event,
        z.object({
          slug: z.string().min(1),
        }).parse
      )

      const config = useRuntimeConfig()
      const notionDbId = config.private.notionDbId as unknown as NotionDB

      const projects = await notionQueryDb<NotionProject>(notion, notionDbId.project)
      const projectId = projects.find(({ properties }) => slugify(notionTextStringify(properties.Name.title)) === projectSlug)?.id
      const assets = await notionQueryDb<NotionAsset>(notion, notionDbId.asset, {
        filter: {
          and: [
            {
              property: 'Project',
              relation: projectId
                ? {
                    contains: projectId,
                  }
                : {
                    is_empty: true,
                  },
            },
          ],
        },
      })

      const photos = assets.filter(({ properties }) => properties.Type?.select?.name === 'Photo' && properties.Status.status?.name === 'Release')

      if (!photos) throw createError({ statusCode: 500, statusMessage: 'photos is undefined' })

      const results = await Promise.allSettled(
        photos
          .toSorted((a, b) => {
            const pa = b.properties['Project Index'].rollup?.array[0]?.number ?? 0
            const pb = a.properties['Project Index'].rollup?.array[0]?.number ?? 0
            return pa - pb || (b.properties.Index?.number ?? 0) - (a.properties.Index?.number ?? 0)
          })
          .map(async ({ cover, properties }): Promise<Photo> => {
            const slug: string = properties.Slug.formula.string
            const [aW, aH] = properties['Aspect ratio'].select.name.split(':').map((item) => parseInt(item))

            return {
              id: slug,
              title: notionTextStringify(properties.Name.title),
              description: notionTextStringify(properties.Description.rich_text),
              image: cover?.type === 'external' ? cover.external.url.split('/')[3] : undefined,
              aspectRatio: aW / aH,
              featured: properties.Featured.checkbox,
              projectId: properties.Project.relation[0].id,
              url: `/photo/${slug}`,
            }
          })
      )
      return results.filter((result) => result.status === 'fulfilled').map((result) => result.value)
    } catch (error: unknown) {
      console.error('API photo GET', error)

      throw createError({
        statusCode: 500,
        statusMessage: 'Some Unknown Error Found',
      })
    }
  },
  { maxAge: 60 * 1, swr: true }
)
