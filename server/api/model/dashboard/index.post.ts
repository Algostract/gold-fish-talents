export default defineEventHandler(async (event) => {
  const { data } = await readValidatedBody(event, modelFormSchema.safeParse)

  if (!data) return

  const { user } = await requireUserSession(event)

  const config = useRuntimeConfig()
  const notionDbId = config.private.notionDbId as unknown as NotionDB

  const query = await notion.databases.query({
    database_id: notionDbId.model,
    filter: {
      property: 'Email',
      email: { equals: user.email },
    },
  })

  if (query.results.length > 0) {
    await notion.pages.update({
      page_id: query.results[0].id,
      properties: {
        Name: {
          type: 'title',
          title: [{ type: 'text', text: { content: data.name } }],
        },
        Status: {
          type: 'status',
          status: { name: 'Filled' },
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
        Height: {
          type: 'number',
          number: data.height,
        },
        Weight: {
          type: 'number',
          number: data.weight,
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
    await replaceUserSession(event, {
      user: {
        ...user,
        isProfileComplete: true,
      },
      logged_at: new Date().toISOString(),
    })
  }

  return { status: 'OK' }
})
