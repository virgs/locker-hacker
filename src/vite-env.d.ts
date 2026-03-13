/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PLATFORM?: string;
    readonly VITE_ADMOB_BANNER_ID?: string;
    readonly VITE_ADMOB_REWARDED_ID?: string;
    readonly VITE_APP_VERSION?: string;
    readonly VITE_APP_BUILD_NUMBER?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
