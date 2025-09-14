import { z } from 'zod'
import { differenceInYears, parseISO } from 'date-fns'

export default defineCachedEventHandler<Promise<DetailedModel>>(
  async (event) => {
    try {
      const { slug: modelSlug } = await getValidatedRouterParams(
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
                string: { contains: modelSlug },
              },
            },
          ],
        },
      })

      const model = models[0]
      if (!models || !models.length) {
        throw createError({ statusCode: 404, statusMessage: `model ${modelSlug} not found` })
      }

      const title = notionTextStringify(model.properties.Name.title)

      return {
        id: modelSlug,
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
            education: notionTextStringify(model.properties.Education.rich_text),
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
        projects: await $fetch(`/api/v1/projects`, { query: { modelSlug } }),
        isFeatured: false,
        url: `/talents/models/${modelSlug}`,
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
