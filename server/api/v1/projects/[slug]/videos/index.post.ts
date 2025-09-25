import { z } from 'zod'
import { toUint8Array } from 'undio'
import type { Codec, Device } from '~~/server/utils/transcode-video'
import { Client } from '@notionhq/client'

type Category = 'food' | 'product' | 'ecommerce'

export default defineEventHandler(async (event) => {
  try {
    const { slug: projectSlug } = await getValidatedRouterParams(
      event,
      z.object({
        slug: z.string().min(1),
      }).parse
    )
    const { user } = await requireUserSession(event)

    const formData = await readFormData(event)

    const targetCodecs = JSON.parse(formData.get('codecs') as string) as Codec[]
    const targetResolutions = JSON.parse(formData.get('resolutions') as string) as Resolution[]
    const targetDevice = formData.get('device') as Device

    const file = formData.get('file') as File
    const description = (formData.get('description') ?? '') as string
    // const featured = Boolean(formData.get('featured') as string)
    const category = formData.get('category') as Category

    const title = `${file.name.split('.')[0]}`
    const fileName = `${title}.${file.name.split('.').at(-1)?.toLowerCase()}`

    if (!file || !file.size) {
      throw createError({ statusCode: 400, message: 'No file provided' })
    }

    const config = useRuntimeConfig()
    const storage = useStorage('fs')
    const notionDbId = config.private.notionDbId as unknown as NotionDB

    const eventStream = createEventStream(event)
    const streamResponse = (data: object) => eventStream.push(JSON.stringify(data))

    event.waitUntil(
      (async () => {
        try {
          const buffer = await toUint8Array(file)
          await storage.setItemRaw(`videos/source/${fileName}`, buffer)

          console.log(`File Saved ${fileName}`)
          await streamResponse({
            fileName: fileName,
            status: `saved`,
          })

          const { width: originalWidth = 0, height: originalHeight = 0 } = await getDimension(fileName, 'video')
          const resolutionLabel = getResolution(originalWidth, originalHeight)
          const resolution = parseInt(resolutionLabel.slice(0, -1))
          const aspectRatioLabel = getAspectRatio(originalWidth, originalHeight)
          const [aW, aH] = aspectRatioLabel.split(':').flatMap((item) => parseInt(item))
          const aspectRatio = aW / aH
          const { width: expectedWidth, height: expectedHeight } = calculateDimension(resolution, aspectRatio)
          const { width: coverWidth, height: coverHeight } = calculateDimension(1080, aspectRatio)

          const results = []
          for (const codec of targetCodecs) {
            for (const resolutionLabel of targetResolutions) {
              const resolution = parseInt(resolutionLabel.slice(0, -1))
              const expectedDim = calculateDimension(resolution, aspectRatio)

              const status = await transcodeVideo(`./static/videos/source/${fileName}`, `./static/videos`, expectedDim, codec, targetDevice, streamResponse)
              results.push(status)
            }
          }

          console.log(`File processed ${fileName}`)

          await generateThumbnail(`./static/videos/source/${fileName}`, `./static/photos/source`, '00:00:00.500')
          // Transcode image
          const imageFile = await transcodeImage(`./static/photos/source/${fileName.split('.')[0]}.jpg`, `./static/photos`, expectedWidth, expectedHeight)
          // Upload to uploadcare cdn
          const { file: fileId } = await uploadcareUploadImage(imageFile)

          const talentId = user.id
          const talentType = 'Model'

          const notionClients = [
            { client: new Client({ auth: import.meta.env.NOTION_RCP_API_KEY }), redcatflag: true },
            { client: notion, redcatflag: false },
          ]
          for (const { client, redcatflag } of notionClients) {
            const projects = await notionQueryDb<NotionProject>(client, redcatflag ? notionDbId.redcatpicturesProject : notionDbId.project)
            const projectId = projects.find(({ properties }) => properties.Slug.formula.string === projectSlug)?.id

            const response = await notionQueryDb<NotionAsset>(client, redcatflag ? notionDbId.redcatpicturesAsset : notionDbId.asset, {
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
                  ...(!redcatflag
                    ? [
                        {
                          property: talentType,
                          relation: talentId
                            ? {
                                contains: talentId,
                              }
                            : ({ is_empty: true } as const),
                        },
                      ]
                    : []),
                  {
                    property: 'Type',
                    select: {
                      equals: 'Video',
                    },
                  },
                ],
              },
            })
            const lastIndex = response.reduce((max, page) => {
              const indexValue = page.properties?.Index?.number ?? 0
              return indexValue > max ? indexValue : max
            }, 0)

            await client.pages.create({
              parent: {
                database_id: redcatflag ? notionDbId.redcatpicturesAsset : notionDbId.asset,
              },
              cover: {
                type: 'external',
                external: {
                  url: `https://ucarecdn.com/${fileId}/-/preview/${coverWidth}x${coverHeight}/`,
                },
              },
              properties: {
                Index: {
                  type: 'number',
                  number: lastIndex + 1,
                },
                Name: {
                  type: 'title',
                  title: [
                    {
                      type: 'text',
                      text: {
                        content: description,
                      },
                    },
                  ],
                },
                Description: {
                  type: 'rich_text',
                  rich_text: [
                    {
                      text: {
                        content: description,
                      },
                    },
                  ],
                },
                Project: {
                  type: 'relation',
                  relation: projectId
                    ? [
                        {
                          id: projectId,
                        },
                      ]
                    : [],
                },
                ...(!redcatflag
                  ? {
                      Featured: {
                        type: 'checkbox',
                        checkbox: false,
                      },
                      [talentType]: {
                        type: 'relation',
                        relation: talentId
                          ? [
                              {
                                id: talentId,
                              },
                            ]
                          : [],
                      },
                    }
                  : {
                      Segment: {
                        type: 'select',
                        select: {
                          name: category,
                        },
                      },
                      Featured: {
                        type: 'number',
                        number: lastIndex + 1,
                      },
                    }),
                Type: {
                  type: 'select',
                  select: {
                    name: 'Video',
                  },
                },
                Status: {
                  type: 'status',
                  status: {
                    name: 'Plan',
                  },
                },
                Resolution: {
                  type: 'select',
                  select: {
                    name: resolutionLabel,
                  },
                },
                'Aspect ratio': {
                  type: 'select',
                  select: {
                    name: aspectRatioLabel,
                  },
                },
              },
            })

            await streamResponse({
              fileName: fileName,
              status: `processed`,
              size: file.size,
              results,
            })
          }
        } catch (error) {
          await streamResponse({ error: (error as Error).message })
        } finally {
          eventStream.close()
        }
      })()
    )

    return eventStream.send()
  } catch (error: unknown) {
    console.error('API video POST', error)

    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
