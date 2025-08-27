export default defineEventHandler(async (event) => {
  try {
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
    const model = query.results[0] as unknown as NotionModel

    const projects = (
      await notion.databases.query({
        database_id: notionDbId.project,
        filter: {
          property: 'Model',
          relation: { contains: model.id },
        },
      })
    ).results as unknown as NotionProject[]

    const slug = model.properties.Slug.formula.string
    const title = notionTextStringify(model.properties.Name.title)

    const photos = await $fetch(`/api/model/${slug}/photo`)
    const videos = await $fetch(`/api/model/${slug}/video`)

    return {
      id: slug,
      name: title,
      photo: {
        image: model.cover?.type === 'external' ? model.cover.external.url.split('/')[3] : undefined,
      },
      dob: model.properties.DOB.date.start,
      gender: model.properties.Gender.select.name.toLowerCase() as Gender,
      profession: notionTextStringify(model.properties.Profession.rich_text),
      coordinate: [model.properties.Longitude.number, model.properties.Latitude.number] as [number, number],
      height: model.properties.Height.number,
      weight: model.properties.Weight.number,
      shoulder: model.properties.Shoulder.number,
      waist: model.properties.Waist.number,
      phone: model.properties.Phone.phone_number,
      sameAsPhone: false,
      whatsapp: model.properties.Whatsapp.url,
      fee: model.properties.Fee.number,
      facebook: '',
      instagram: '',
      why: notionTextStringify(model.properties.Description.rich_text),
      projects: await Promise.all(
        projects.map<Promise<Project>>(async ({ id, cover, properties }) => {
          return {
            id: id,
            name: notionTextStringify(properties.Name.title),
            image: cover?.type === 'external' ? cover.external.url.split('/')[3] : undefined,
            datetime: properties['Shoot Date/Time'].date.start,
            location: {
              name: notionTextStringify(properties.Name.title),
              address: notionTextStringify(properties.Address.rich_text),
            },
            mapUrl: properties.Map.url,
            helpline: '+919433128726',
            media: {
              photo: photos.filter(({ projectId }) => projectId === id),
              video: videos.filter(({ projectId }) => projectId === id),
            },
          }
        })
      ),
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
