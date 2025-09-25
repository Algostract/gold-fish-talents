export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const notionDbId = config.private.notionDbId as unknown as NotionDB

    const { user } = await requireUserSession(event)

    const query = await notion.databases.query({
      database_id: notionDbId.model,
      filter: {
        property: 'Email',
        email: { equals: user.email },
      },
    })
    const model = query.results[0] as unknown as NotionModel

    const modelSlug = model.properties.Slug.formula.string
    const title = notionTextStringify(model.properties.Name.title)

    return {
      id: modelSlug,
      name: title,
      photo: {
        image: model.cover?.type === 'external' ? model.cover.external.url.split('/')[3] : undefined,
      },
      dob: model.properties.DOB.date.start,
      gender: model.properties.Gender.select.name.toLowerCase() as Gender,
      profession: model.properties.Profession?.rich_text && notionTextStringify(model.properties.Profession.rich_text),
      coordinate: [model.properties.Longitude?.number, model.properties.Latitude?.number] as [number, number],
      height: model.properties.Height?.number,
      weight: model.properties.Weight?.number,
      shoulder: model.properties.Shoulder?.number,
      waist: model.properties.Waist?.number,
      phone: model.properties.Phone.phone_number,
      sameAsPhone: false,
      whatsapp: model.properties.Whatsapp.url,
      fee: model.properties.Fee?.number,
      facebook: '',
      instagram: '',
      why: model.properties.Description?.rich_text && notionTextStringify(model.properties.Description.rich_text),
      projects: await $fetch(`/api/v1/projects`, { query: { modelSlug } }),
    }
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API  model/dashboard/index GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
