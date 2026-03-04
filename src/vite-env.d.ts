/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PLATFORM?: string;
    readonly VITE_ADMOB_BANNER_ID?: string;
    readonly VITE_ADMOB_REWARDED_ID?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

