/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_ENDPOINT: string;
    readonly APP_VERSION: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
