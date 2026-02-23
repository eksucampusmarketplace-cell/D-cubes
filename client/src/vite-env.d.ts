/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_STAFF_MANAGER_PIN?: string
  readonly VITE_STAFF_KITCHEN_PIN?: string
  readonly VITE_STAFF_BAR_PIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
