import { z } from 'zod'
import { toUint8Array } from 'undio'
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

    const file = formData.get('file') as File
    const description = (formData.get('description') ?? '') as string
    const category = formData.get('category') as Category

    const title = `${file.name.split('.')[0]}`
    const fileName = `${title}.${file.name.split('.').at(-1)?.toLowerCase()}`

    if (!file || !file.size) {
      throw createError({ statusCode: 400, message: 'No file provided' })
    }
    const storage = useStorage('fs')
    const config = useRuntimeConfig()
    const notionDbId = config.private.notionDbId as unknown as NotionDB

    const buffer = await toUint8Array(file)
    const signedBuffer = await stegoEncode(
      buffer,
      JSON.stringify({
        copyright: '© Gold Fish Bowl',
        terms: 'All Rights Reserved',
        year: '2025',
        // "id": "9b8f3c2a-4d1e-4a6f-bf2e-7d5a946ab123",
        // "url": `${config.public.siteUrl}/photo`,
        ts: new Date().toISOString(),
      }),
      config.private.steganographyKey
    )
    await storage.setItemRaw(`photos/source/${fileName}`, signedBuffer)
    console.log(`File Saved ${fileName}`)

    const { width = 0, height = 0 } = await getDimension(fileName, 'photo')
    const resolutionLabel = getResolution(width, height)
    const resolution = parseInt(resolutionLabel.slice(0, -1))
    const aspectRatioLabel = getAspectRatio(width, height)
    const [aW, aH] = aspectRatioLabel.split(':').flatMap((item) => parseInt(item))
    const aspectRatio = aW / aH
    const { width: expectedWidth, height: expectedHeight } = calculateDimension(resolution, aspectRatio)
    const { width: coverWidth, height: coverHeight } = calculateDimension(1080, aspectRatio)

    // Transcode image
    const imageFile = await transcodeImage(`./static/photos/source/${fileName}`, `./static/photos`, expectedWidth, expectedHeight)
    // Upload to uploadcare cdn
    const { file: id } = await uploadcareUploadImage(imageFile)

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
                equals: 'Photo',
              },
            },
          ],
        },
      })
      const lastIndex = response.reduce((max, page) => {
        const indexValue = page.properties?.Index?.number ?? 0
        return indexValue > max ? indexValue : max
      }, 0)

      // Normal
      await client.pages.create({
        parent: {
          database_id: redcatflag ? notionDbId.redcatpicturesAsset : notionDbId.asset,
        },
        cover: {
          type: 'external',
          external: {
            url: `https://ucarecdn.com/${id}/-/preview/${coverWidth}x${coverHeight}/`,
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
                  content: title,
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
              name: 'Photo',
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
    }

    return { success: true }
  } catch (error: unknown) {
    console.error('API photo POST', error)

    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
