import z from 'zod'
import { convertSources, heroPreset, landscapePreset, portraitPreset } from '~~/server/api/v1/projects/[slug]/videos/index.get'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const notionDbId = config.private.notionDbId as unknown as NotionDB

  const { slug: projectSlug } = await getValidatedRouterParams(
    event,
    z.object({
      slug: z.string().min(1),
    }).parse
  )

  const projects = (
    await notion.databases.query({
      database_id: notionDbId.project,
    })
  ).results as unknown as NotionProject[]
  const project = projects.find((project) => slugify(notionTextStringify(project.properties.Name.title)) === projectSlug)

  if (!project) {
    throw createError({ statusCode: 404, statusMessage: `project ${projectSlug} not found` })
  }

  const assets = await notionQueryDb<NotionAsset>(notion, notionDbId.asset)

  const filteredPhotos = assets.filter(({ properties }) => properties.Type?.select?.name === 'Photo' && properties.Status.status?.name === 'Release')

  if (!filteredPhotos) throw createError({ statusCode: 500, statusMessage: 'photos is undefined' })

  const photos = await Promise.all(
    filteredPhotos
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

  const filteredVideos = assets.filter(({ properties }) => properties.Type?.select?.name === 'Video' && properties.Status.status?.name === 'Release')
  const videos = await Promise.all(
    filteredVideos
      .toSorted((a, b) => {
        const pa = b.properties['Project Index'].rollup?.array[0]?.number ?? 0
        const pb = a.properties['Project Index'].rollup?.array[0]?.number ?? 0
        return pa - pb || (b.properties.Index?.number ?? 0) - (a.properties.Index?.number ?? 0)
      })
      .map<Promise<Video>>(async ({ cover, properties }) => {
        const slug: string = properties.Slug.formula.string

        // if (slugify(notionTextStringify(properties.Slug.rich_text)) !== slug)
        //   slugMap[slugify(notionTextStringify(properties.Slug.rich_text))] = slug

        const [aW, aH] = properties['Aspect ratio'].select.name.split(':').map((item) => parseInt(item))
        const aspectRatio = aW / aH

        return {
          id: slug,
          title: notionTextStringify(properties.Name.title),
          description: notionTextStringify(properties.Description.rich_text),
          poster: cover?.type === 'external' ? cover.external.url : undefined,
          sources: convertSources(slug, slug.includes('featured-video') ? heroPreset : aspectRatio < 1 ? portraitPreset : landscapePreset),
          type: slug.includes('featured-video') ? 'hero' : 'feature',
          featured: properties.Featured.checkbox,
          projectId: properties.Project.relation[0].id,
          url: `/video/${slug}`,
        }
      })
  )

  return {
    id: project.id,
    name: notionTextStringify(project.properties.Name.title),
    image: project.cover?.type === 'external' ? project.cover.external.url.split('/')[3] : undefined,
    datetime: project.properties['Shoot Date/Time'].date.start,
    location: {
      name: notionTextStringify(project.properties.Name.title),
      address: notionTextStringify(project.properties.Address.rich_text),
    },
    mapUrl: project.properties.Place.place,
    helpline: '+919433128726',
    media: {
      photo: photos.filter(({ projectId }) => projectId === project.id),
      video: videos.filter(({ projectId }) => projectId === project.id),
    },
  }
})
