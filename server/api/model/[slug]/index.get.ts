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

      // const [aW, aH] = model.properties //.properties['Aspect ratio'].select.name.split(':').map((item) => parseInt(item))

      /* return {
              id: slug,
              title: notionTextStringify(model.properties.Name.title),
              description: notionTextStringify(model.properties.Description.rich_text),
              image: model.cover?.type === 'external' ? model.cover.external.url.split('/')[3] : undefined,
              aspectRatio: aW / aH,
              category: model.properties.Segment.select.name,
              featured: model.properties.Featured.number,
              gallery: model.properties.Gallery.checkbox,
              url: `/photo/${slug}`,
            } as PhotoDetails */

      const title = notionTextStringify(model.properties.Name.title)

      return {
        id: slug,
        name: title,
        description: `${title} is one of the Gold Fish Bowl's Talented Model`,
        fee: model.properties.Fee.number,
        photo: {
          image: model.cover?.type === 'external' ? model.cover.external.url.split('/')[3] : undefined,
        },
        details: {
          personalInfo: {
            gender: model.properties.Gender.select.name.toLowerCase(),
            age: differenceInYears(new Date(), parseISO(model.properties.DOB.date.start)),
          },
          /*           location: {
                      city: 'Dummy',
                      area: 'Dummy',
                    }, */
          physicalAttributes: {
            height: model.properties.Height.number,
            weight: model.properties.Weight.number,
            /*             bodyType: 'Mesomorph',
                        skinTone: 'Wheatish',
                        eyeColor: 'Hazel',
                        hairColor: 'DarkBrown',
                        shoeSize: 7,
                        bust: 86,
                        waist: 64,
                        hips: 90,
                        tattoos: 'Small lotus on right wrist',
                        armpitHair: 'Trimmed', */
          },
          /*           professionalBackground: {
                      profession: 'FreelanceModel',
                      education: 'BachelorArts',
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
        coordinate: [model.properties.Longitude.number, model.properties.Latitude.number],
        isFeatured: false,
        url: `/model/${slug}`,
      } as DetailedModel
    } catch (error: unknown) {
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
