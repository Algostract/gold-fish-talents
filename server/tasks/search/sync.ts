import { syncSearchDb } from '~~/server/api/search/sync.post'

// async function syncCoverPhoto() {
//   const config = useRuntimeConfig()
//   const notionDbId = config.private.notionDbId as unknown as NotionDB

//   const models = await notionQueryDb<NotionModel>(notion, notionDbId.model)
//   const assets = await notionQueryDb<NotionAsset>(notion, notionDbId.asset)

//   for (const model of models) {
//     const coverPhoto = assets.filter(
//       ({ properties }) => properties.Type?.select?.name === 'Photo' && properties.Status.status.name === 'Release' && properties.Index.number === 1 && model.id && properties.Model?.relation?.some((r) => r.id === model.id)
//     )

//     if (!coverPhoto.length)
//       continue

//     console.log({ model: notionTextStringify(model.properties.Name.title) })

//     await notion.pages.update({
//       page_id: model.id,
//       cover: { type: 'external', external: { url: coverPhoto[0].cover?.type === 'external' ? coverPhoto[0].cover.external.url : '' } }
//     })
//   }
// }

export default defineTask({
  meta: {
    name: 'search:sync',
    description: 'Sync notion resources into search db',
  },
  async run() {
    console.log('Running Task search:sync...')

    // await syncCoverPhoto()

    await syncSearchDb()

    return { result: 'success' }
  },
})
