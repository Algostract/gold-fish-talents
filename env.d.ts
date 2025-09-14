interface ImportMetaEnv {
  readonly NODE_ENV: 'development' | 'production'
  readonly PLATFORM_ENV: 'native' | 'web'
  readonly HOSTNAME: string
  readonly NOTION_API_KEY?: string
  readonly UPLOADCARE_PUBLIC_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
