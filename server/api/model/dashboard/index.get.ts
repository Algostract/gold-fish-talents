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

  /*   return {
      email: data.properties.Email.email,
      phone: data.properties.Phone.phone_number,
      whatsapp: data.properties.Whatsapp.url,
      facebook: data.properties.Facebook.url,
      instagram: data.properties.Instagram.url,
    } */

  const slug = data.properties.Slug.formula.string
  const title = notionTextStringify(data.properties.Name.title)
  return {
    id: slug,
    name: title,
    description: `${title} is one of the Gold Fish Bowl's Talented Model`,
    fee: data.properties.Fee.number,
    photo: {
      image: data.cover?.type === 'external' ? data.cover.external.url.split('/')[3] : undefined,
    },
    details: {
      personalInfo: {
        gender: data.properties.Gender.select.name,
        dob: data.properties.DOB.date.start,
      },
      /*           location: {
                  city: 'Dummy',
                  area: 'Dummy',
                }, */
      physicalAttributes: {
        height: data.properties.Height.number,
        weight: data.properties.Weight.number,
        shoulder: data.properties.Shoulder.number,
        waist: data.properties.Waist.number,
        /*             bodyType: 'Mesomorph',
                    skinTone: 'Wheatish',
                    eyeColor: 'Hazel',
                    hairColor: 'DarkBrown',
                    shoeSize: 7,
                    bust: 86,
                    hips: 90,
                    tattoos: 'Small lotus on right wrist',
                    armpitHair: 'Trimmed', */
      },
      professionalBackground: {
        profession: notionTextStringify(data.properties.Profession.rich_text),
      },
      /*             education: 'BachelorArts',
                  hasPassport: true,
                  experienceYears: 3,
                }, */
      /*           skillsInterests: {
                  languages: ['Hindi', 'English', 'Bhojpuri'],
                  hobbies: ['Photography', 'Yoga', 'Travel'],
                  comfortableTimings: true,
                  travelOutstation: true,
                  travelInternational: false,
                }, */
      /*           shootPreferences: {
                  preferredGenres: ['Acting', 'PrintEditorial', 'EthnicFashion', 'WesternFashion', 'RampRunway', 'MusicVideos', 'WebSeries', 'Anchoring'],
                  preferredWardrobe: ['EthnicWear', 'WesternWear', 'SwimSuits'],
                  experiencedGenres: ['Commercial', 'TV Serial', 'Short Film'],
                }, */
      /*           healthSafety: {
                  allergies: 'None',
                }, */
    },
    rating: 0,
    reviewCount: 0,
    coordinate: [data.properties.Longitude.number, data.properties.Latitude.number],
    isFeatured: false,
    url: `/model/${slug}`,
  }
})
