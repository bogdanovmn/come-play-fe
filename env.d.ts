/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BACKEND_VERSION: string
  readonly FRONTEND_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}