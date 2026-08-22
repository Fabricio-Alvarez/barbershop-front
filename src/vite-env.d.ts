/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_BUSINESS_NAME?: string;
  readonly VITE_BUSINESS_TIMEZONE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
