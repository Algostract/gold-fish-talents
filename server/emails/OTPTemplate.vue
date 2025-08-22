<script setup lang="ts">
import { Html, Head, Preview, Body, Container, Section, Text, Tailwind, Img, Font } from '@vue-email/components'

defineProps<{
  fromCompanyName: string
  fromEmail: string
  fromCompanyLogo: string
  emailSubject: string
  otp: string
  toEmail: string
}>()

const tailwindConfig = {
  darkMode: 'class',
  theme: {
    fontSize: {
      '3xs': ['0.5rem', '0.5625rem'],
      '2xs': ['0.625rem', '0.75rem'],
      xs: ['0.75rem', '0.875rem'],
      sm: ['0.875rem', '1.0625rem'],
      base: ['1rem', '1.5rem'],
      lg: ['1.25rem', '1.5625rem'],
      xl: ['1.5rem', '1.875rem'],
      '2xl': ['2rem', '2.5rem'],
      '3xl': ['2.5rem', '3.125rem'],
      '4xl': ['3rem', '3.625rem'],
      '5xl': ['3.5rem', '4.1875rem'],
    },
    fontFamily: {
      main: ['', 'sans-serif'],
      sub: ['', 'sans-serif'],
    },
    fontWeight: {
      light: '300',
      regular: '400',
      'semi-bold': '500',
      bold: '600',
    },
    colors: {
      transparent: 'transparent',
      white: '#FFFFFF',
      light: {
        400: '',
        500: '',
        600: '',
      },
      black: '#000000',
      dark: {
        400: '',
        500: '',
        600: '',
      },
      primary: {
        400: '',
        500: '',
        600: '',
      },
      success: {
        400: '',
        500: '',
        600: '',
      },
      warning: {
        400: '',
        500: '',
        600: '',
      },
      alert: {
        400: '',
        500: '',
        600: '',
      },
    },
  },
}
</script>

<template>
  <Html lang="en">
    <Tailwind :config="tailwindConfig">
      <Head>
        <Font
          font-family="Oxanium"
          fallback-font-family="Verdana"
          :web-font="{
            url: 'https://fonts.gstatic.com/s/oxanium/v19/RrQQboN_4yJ0JmiMe2zE0YBB.woff2',
            format: 'woff2',
          }"
          :font-weight="400"
          font-style="normal" />
        <title>{{ emailSubject }}</title>
      </Head>

      <Preview>{{ emailSubject }}</Preview>

      <Body class="font-body bg-white text-black">
        <Container class="px-3 py-5">
          <!-- Logo -->
          <Section class="mt-4 text-center">
            <Img :src="fromCompanyLogo" alt="{{ fromCompanyName }} logo" class="mx-auto size-20" width="80" height="80" />
          </Section>

          <!-- Greeting -->
          <Section class="mt-6 text-center">
            <Text class="text-2xl font-semi-bold leading-tight"> {{ fromCompanyName }} Verification Code </Text>
            <Text class="mt-2 text-base text-dark-600"> Hello {{ toEmail }}, </Text>
            <Text class="mt-1 text-base text-dark-600"> Use the following code to complete your sign in: </Text>
          </Section>

          <!-- OTP Box -->
          <Section class="mt-6 text-center">
            <Text class="inline-block rounded-lg bg-light-500 px-6 py-4 text-3xl font-bold tracking-widest text-dark-500">
              {{ otp }}
            </Text>
          </Section>

          <!-- Info -->
          <Section class="mt-6 text-center">
            <Text class="text-sm text-dark-600"> This code will expire in 10 minutes. If you didn’t request this, you can safely ignore this email. </Text>
          </Section>

          <!-- Footer -->
          <Section class="mt-10 text-center">
            <Text class="text-xs text-light-600"> Sent by {{ fromCompanyName }} ({{ fromEmail }}) </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
</template>
