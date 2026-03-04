/**
 * AdMob wrapper for Capacitor builds.
 *
 * On web builds, all functions are safe no-ops.
 * On Capacitor builds, wraps @capacitor-community/admob.
 */

import { IS_CAPACITOR } from "../platform.ts";

/** Test ad unit IDs — replace with real ones before publishing. */
const BANNER_AD_ID   = import.meta.env.VITE_ADMOB_BANNER_ID   ?? "ca-app-pub-3940256099942544/6300978111";
const REWARDED_AD_ID = import.meta.env.VITE_ADMOB_REWARDED_ID ?? "ca-app-pub-3940256099942544/5224354917";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let admobModule: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAdMob = async (): Promise<any> => {
    if (!IS_CAPACITOR) return null;
    if (!admobModule) {
        admobModule = await import("@capacitor-community/admob");
    }
    return admobModule;
};

export const initializeAds = async (): Promise<void> => {
    const mod = await getAdMob();
    if (!mod) return;
    await mod.AdMob.initialize({ initializeForTesting: true });
};

export const showBannerAd = async (): Promise<void> => {
    const mod = await getAdMob();
    if (!mod) return;
    await mod.AdMob.showBanner({
        adId: BANNER_AD_ID,
        adSize: mod.BannerAdSize.BANNER,
        position: mod.BannerAdPosition.BOTTOM_CENTER,
        isTesting: true,
    });
};

export const hideBannerAd = async (): Promise<void> => {
    const mod = await getAdMob();
    if (!mod) return;
    await mod.AdMob.removeBanner();
};

export const showRewardedAd = async (): Promise<boolean> => {
    const mod = await getAdMob();
    if (!mod) return false;
    try {
        await mod.AdMob.prepareRewardVideoAd({ adId: REWARDED_AD_ID, isTesting: true });
        const result = await mod.AdMob.showRewardVideoAd();
        return result !== undefined;
    } catch {
        return false;
    }
};

