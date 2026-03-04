/**
 * Platform detection for conditional rendering.
 *
 * Set `VITE_PLATFORM=capacitor` in environment to enable mobile-specific
 * features (AdMob, remove GitHub link, etc.).
 *
 * Usage:
 *   import { IS_CAPACITOR, IS_WEB } from "../platform";
 *   if (IS_CAPACITOR) { ... }
 */

export const IS_CAPACITOR = import.meta.env.VITE_PLATFORM === "capacitor";
export const IS_WEB       = !IS_CAPACITOR;

