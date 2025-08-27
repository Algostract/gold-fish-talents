import { z } from 'zod'
import { differenceInYears, parseISO } from 'date-fns'

export default defineCachedEventHandler<Promise<DetailedModel>>(
  async (event) => {
    try {
      const { slug } = await getValidatedRouterParams(
        event,
        z.object({
          slug: z.string().min(1),
        }).parse
      )
      const config = useRuntimeConfig()
      const notionDbId = config.private.notionDbId as unknown as NotionDB

      const models = await notionQueryDb<NotionModel>(notion, notionDbId.model, {
        filter: {
          and: [
            {
              property: 'Slug',
              formula: {
                string: { contains: slug },
              },
            },
          ],
        },
      })

      const model = models[0]
      if (!models || !models.length || !model) {
        throw createError({ statusCode: 404, statusMessage: `model ${slug} not found` })
      }

      const projects = (
        await notion.databases.query({
          database_id: notionDbId.project,
          filter: {
            property: 'Model',
            relation: { contains: model.id },
          },
        })
      ).results as unknown as NotionProject[]

      const photos = await $fetch(`/api/model/${slug}/photo`)
      const videos = await $fetch(`/api/model/${slug}/video`)

      const title = notionTextStringify(model.properties.Name.title)

      return {
        id: slug,
        name: title,
        description: `${title} is one of the Gold Fish Bowl's Talented Model`,
        gender: model.properties.Gender.select.name as Gender,
        age: differenceInYears(new Date(), parseISO(model.properties.DOB.date.start)),
        fee: model.properties.Fee.number,
        photo: {
          image: model.cover?.type === 'external' ? model.cover.external.url.split('/')[3] : undefined,
        },
        details: {
          physicalAttributes: {
            height: model.properties.Height.number,
            weight: model.properties.Weight.number,
            shoulder: model.properties.Shoulder.number,
            waist: model.properties.Waist.number,
            // tattoos: 'Small lotus on right wrist',
            /*  bodyType: 'Mesomorph',
             skinTone: 'Wheatish',
             eyeColor: 'Hazel',
             hairColor: 'DarkBrown',
             shoeSize: 7,
             bust: 86,
             hips: 90,
             armpitHair: 'Trimmed', */
          },
          professionalBackground: {
            profession: notionTextStringify(model.properties.Profession.rich_text),
            education: notionTextStringify(model.properties.Profession.rich_text),
            /*  hasPassport: true,
             experienceYears: 3, */
          },
          /* skillsInterests: {
            languages: ['Hindi', 'English', 'Bhojpuri'],
            hobbies: ['Photography', 'Yoga', 'Travel'],
            comfortableTimings: true,
            travelOutstation: true,
            travelInternational: false,
          }, */
          /* shootPreferences: {
            preferredGenres: ['Acting', 'PrintEditorial', 'EthnicFashion', 'WesternFashion', 'RampRunway', 'MusicVideos', 'WebSeries', 'Anchoring'],
            preferredWardrobe: ['EthnicWear', 'WesternWear', 'SwimSuits'],
            experiencedGenres: ['Commercial', 'TV Serial', 'Short Film'],
          }, */
          healthSafety: {
            allergies: 'None',
          },
          /* email: data.properties.Email.email,
          phone: data.properties.Phone.phone_number,
          whatsapp: data.properties.Whatsapp.url,
          facebook: data.properties.Facebook.url,
          instagram: data.properties.Instagram.url,
           */
        },
        rating: 0,
        reviewCount: 0,
        coordinate: [model.properties.Longitude.number, model.properties.Latitude.number],
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
        isFeatured: false,
        url: `/model/${slug}`,
      } as DetailedModel
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error
      }

      console.error('API  model/[slug]/index GET', error)

      throw createError({
        statusCode: 500,
        statusMessage: 'Some Unknown Error Found',
      })
    }
  },
  {
    maxAge: 60,
    swr: true,
  }
)
