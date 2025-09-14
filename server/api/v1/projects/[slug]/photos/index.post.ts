import { z } from 'zod'
import { toUint8Array } from 'undio'

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
    const featured = Boolean(formData.get('featured') as string)

    const fileName = `${file.name.split('.')[0]}.${file.name.split('.').at(-1)?.toLowerCase()}`

    if (!file || !file.size) {
      throw createError({ statusCode: 400, message: 'No file provided' })
    }
    const storage = useStorage('fs')
    const config = useRuntimeConfig()
    const notionDbId = config.private.notionDbId as unknown as NotionDB

    const buffer = await toUint8Array(file)
    await storage.setItemRaw(`photos/source/${fileName}`, buffer)
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

    // modelSlug (manjira-mitra-13) -> modelNotionId ()
    // projectSlug () -> projectNotionId ()
    // console.log({ projectSlug, modelSlug })
    const modelId = user.id
    const projects = await notionQueryDb<NotionProject>(notion, notionDbId.project)
    const projectId = projects.find(({ properties }) => slugify(notionTextStringify(properties.Name.title)) === projectSlug)?.id
    // console.log({ projectId, modelId })

    const response = await notionQueryDb<NotionAsset>(notion, notionDbId.asset, {
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
          {
            // TODO: add user type
            property: 'Model',
            relation: {
              contains: modelId,
            },
          },
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

    await notion.pages.create({
      parent: {
        database_id: notionDbId.asset,
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
        Model: {
          type: 'relation',
          relation: modelId
            ? [
                {
                  id: modelId,
                },
              ]
            : [],
        },
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
        Featured: {
          type: 'checkbox',
          checkbox: featured,
        },
      },
    })

    return { success: true }
  } catch (error: unknown) {
    console.error('API photo POST', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
