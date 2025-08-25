export async function findOrCreateNotionUser(authUser: { sub?: string; name?: string; picture?: string; email: string }): Promise<{
  id: string
  name: string
  avatar?: string
  email: string
  createdAt: string
  updatedAt: string
  isProfileComplete: boolean
}> {
  const config = useRuntimeConfig()
  const notionDbId = config.private.notionDbId as unknown as NotionDB

  const query = await notion.databases.query({
    database_id: notionDbId.model,
    filter: {
      property: 'Email',
      email: { equals: authUser.email },
    },
  })

  if (query.results.length > 0) {
    const data = query.results[0] as unknown as NotionModel

    return {
      id: data.id,
      name: notionTextStringify(data.properties.Name.title),
      avatar: data.cover?.type === 'external' ? data.cover?.external.url : authUser.picture,
      email: data.properties.Email.email || '',
      createdAt: data.created_time || new Date().toISOString(),
      updatedAt: data.last_edited_time || new Date().toISOString(),
      isProfileComplete: data.properties.Status.status.name !== 'Unfilled',
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await notion.pages.create({
    parent: { database_id: notionDbId.model },
    ...(authUser.picture && {
      cover: {
        type: 'external',
        external: { url: authUser.picture },
      },
    }),
    properties: {
      ...(authUser.name && {
        Name: {
          type: 'title',
          title: [{ type: 'text', text: { content: authUser.name } }],
        },
      }),
      Email: { type: 'email', email: authUser.email },
    },
  })

  return {
    id: data.id,
    name: notionTextStringify(data.properties.Name.title),
    avatar: data.cover?.external.url || authUser.picture,
    email: data.properties.Email.email || '',
    createdAt: data.created_time || new Date().toISOString(),
    updatedAt: data.last_edited_time || new Date().toISOString(),
    isProfileComplete: false,
  }
}

export default defineOAuthGoogleEventHandler({
  config: {},
  async onSuccess(event, { user: data }) {
    const user = await findOrCreateNotionUser(data)

    await setUserSession(
      event,
      {
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          isProfileComplete: user.isProfileComplete,
        },
        logged_at: new Date().toISOString(),
      },
      { maxAge: 30 * 24 * 60 * 60 * 1000 }
    )

    return sendRedirect(event, user.isProfileComplete ? '/model/dashboard' : '/auth/signup')
  },
  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/')
  },
})
