export default defineEventHandler(async (event) => {
  try {
    const queryParams = getQuery<{ code: string; state: string }>(event)

    $fetch('https://api.notion.com/v1/oauth/token', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic BASE64(client_id:client_secret)',
      },
      body: {
        grant_type: 'authorization_code',
        code: queryParams.code,
        redirect_uri: 'https://bowl.redcatpictures.com/',
      },
    })
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API auth/notion GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
