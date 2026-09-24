/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BUILD_MODE: 'vulnerable' | 'defended';
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
