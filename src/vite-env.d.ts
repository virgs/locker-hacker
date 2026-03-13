/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __APP_BUILD_NUMBER__: string;

interface ImportMetaEnv {
    readonly VITE_PLATFORM?: string;
    readonly VITE_ADMOB_BANNER_ID?: string;
    readonly VITE_ADMOB_REWARDED_ID?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
