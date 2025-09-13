import { render } from '@vue-email/render'
import type { Component } from 'vue'
import emailTemplate from '~~/server/emails'
import { findOrCreateNotionUser } from '~~/server/routes/auth/google.get'
import type { EmailMetaData, EmailTemplateData } from '~~/server/emails'

export async function sendEmail<T extends keyof EmailTemplateData>(template: T, payload: EmailTemplateData[T][]) {
  let isSuccessful = true
  const config = useRuntimeConfig()
  const metaData = config.private.emailMetaData as unknown as EmailMetaData

  await Promise.allSettled(
    payload.map(async (payloadData) => {
      try {
        const allData = { ...metaData, ...emailTemplate[template].data, ...payloadData }
        const html = await render(emailTemplate[template].template as Component, allData)
        const text = await render(emailTemplate[template].template as Component, allData, { plainText: true })

        const { transport } = useNodeMailer()

        await transport.verify()

        await transport.sendMail({
          from: `"${allData.fromCompanyName}" <${allData.fromEmail}>`,
          to: allData.toEmail,
          subject: allData.emailSubject,
          html,
          text,
        })
      } catch (error) {
        console.error('function sendEmail', error)
        isSuccessful = false
      }
    })
  )

  return isSuccessful
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ email: string; otp?: string }>(event)
    const authCodeStorage = useStorage<{ type: 'email' | 'phone'; code: string; expiresAt: number }>(`data:auth:code`)

    let isSuccess = false
    let navigateTo: string | undefined = undefined

    if (!body.otp) {
      const code = generateCode(8, 'alphanumeric')
      isSuccess = await sendEmail('otp', [{ otp: code, toEmail: import.meta.env.NODE_ENV === 'production' ? body.email : 'admin@shirsendu-bairagi.dev' }])
      await authCodeStorage.setItem(body.email, { type: 'email', code, expiresAt: Date.now() + 10 * 60 * 1000 })
    } else {
      const authData = await authCodeStorage.getItem(body.email)

      if (!authData) throw createError({ statusCode: 400, statusMessage: "OTP isn't generated" })
      else if (authData.expiresAt <= Date.now()) {
        throw createError({ statusCode: 400, statusMessage: 'OTP Expired' })
      } else if (authData.code !== body.otp) throw createError({ statusCode: 400, statusMessage: 'OTP Mismatched' })
      else {
        isSuccess = true
        const user = await findOrCreateNotionUser({ email: body.email })

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

        navigateTo = user.isProfileComplete ? '/model/dashboard' : '/auth/signup'
      }
    }

    return { isSuccess, navigateTo }
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API auth/email POST', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
