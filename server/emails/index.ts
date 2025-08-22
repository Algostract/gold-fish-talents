import otpTemplate from './OTPTemplate.vue'

export interface EmailMetaData {
  fromCompanyName: string
  fromEmail: string
  fromCompanyLogo: string
}

export interface OTPEmail {
  otp: string
  toEmail: string
}

export type EmailTemplateData = {
  otp: OTPEmail
}

const emailTemplate = {
  otp: {
    template: otpTemplate,
    data: {
      emailSubject: 'Verify Email Address',
    },
  },
}

export default emailTemplate
