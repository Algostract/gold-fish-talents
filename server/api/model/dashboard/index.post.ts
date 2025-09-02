export default defineEventHandler(async (event) => {
  try {
    const { data } = await readValidatedBody(event, modelFormSchema.safeParse)

    if (!data)
      throw createError({
        statusCode: 400,
        statusMessage: 'data format invalid',
      })

    const { user } = await requireUserSession(event)

    const config = useRuntimeConfig()
    const notionDbId = config.private.notionDbId as unknown as NotionDB

    const model = (
      await notion.databases.query({
        database_id: notionDbId.model,
        filter: {
          property: 'Email',
          email: { equals: user.email },
        },
      })
    ).results[0] as unknown as NotionModel

    if (model) {
      await notion.pages.update({
        page_id: model.id,
        properties: {
          Name: {
            type: 'title',
            title: [{ type: 'text', text: { content: data.name } }],
          },
          Status: {
            type: 'status',
            status: { name: model.properties.Status.status.name === 'Unfilled' ? 'Filled' : model.properties.Status.status.name },
          },
          Description: {
            type: 'rich_text',
            rich_text: [{ text: { content: data.why } }],
          },
          DOB: {
            type: 'date',
            date: { start: data.dob },
          },
          Gender: {
            type: 'select',
            select: { name: data.gender },
          },
          Profession: {
            type: 'rich_text',
            rich_text: [{ text: { content: data.profession } }],
          },
          Latitude: {
            type: 'number',
            number: data.coordinate[1],
          },
          Longitude: {
            type: 'number',
            number: data.coordinate[0],
          },
          Height: {
            type: 'number',
            number: data.height,
          },
          Weight: {
            type: 'number',
            number: data.weight,
          },
          Shoulder: {
            type: 'number',
            number: data.shoulder,
          },
          Waist: {
            type: 'number',
            number: data.waist,
          },
          Phone: {
            type: 'phone_number',
            phone_number: data.phone,
          },
          Whatsapp: {
            type: 'url',
            url: `https://wa.me/91${data.whatsapp}`,
          },
          ...(data.facebook && {
            Facebook: { url: data.facebook },
          }),
          ...(data.instagram && {
            Instagram: { url: data.instagram },
          }),
          Fee: {
            type: 'number',
            number: data.fee,
          },
        },
      })

      const { user } = await getUserSession(event)
      await replaceUserSession(
        event,
        {
          user: {
            ...user,
            isProfileComplete: true,
          },
          logged_at: new Date().toISOString(),
        },
        { maxAge: 30 * 24 * 60 * 60 * 1000 }
      )
    }

    return { status: 'OK' }
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API model/dashboard/index POST', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
