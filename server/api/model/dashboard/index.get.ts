export default defineEventHandler(async (event) => {
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

  const data = query.results[0] as unknown as NotionModel

  return {
    name: notionTextStringify(data.properties.Name.title),
    description: notionTextStringify(data.properties.Description.rich_text),
    dob: data.properties.DOB.date.start,
    gender: data.properties.Gender.select.name,
    profession: notionTextStringify(data.properties.Profession.rich_text),
    height: data.properties.Height.number,
    weight: data.properties.Weight.number,
    fee: data.properties.Fee.number,
    email: data.properties.Email.email,
    phone: data.properties.Phone.phone_number,
    whatsapp: data.properties.Whatsapp.url,
    facebook: data.properties.Facebook.url,
    instagram: data.properties.Instagram.url,
  }
})
