/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GAME_NAME: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
