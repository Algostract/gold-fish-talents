export interface ShareAsset {
  name: string
  imageUrl: string
  url: string
}

export default async function (asset: ShareAsset) {
  const { share, isSupported } = useShare()
  const { copy } = useClipboard()

  if (!isSupported) {
    await copy(`${asset.name}\n\n${asset.url}`)
    return
  }

  try {
    const content = await $fetch<Blob>(asset.imageUrl, {
      responseType: 'blob',
    })
    if (!content) throw createError({ message: 'Content is null' })

    const files = [new File([content], `${asset.name}.jpg`, { type: 'image/jpeg' })]
    await share({
      title: asset.name,
      text: `${asset.name}\n`,
      url: asset.url,
      files,
    })
  } catch (error) {
    console.error('Utils Share', error)
  }
}
