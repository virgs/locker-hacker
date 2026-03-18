export const MOBILE_MAIN_AREA_PADDING_PX = 16;
export const MOBILE_SIDEBAR_COLLAPSED_HEIGHT_PX = 272;

export const getMobileMainAreaPaddingBottom = (): string =>
    `calc(${MOBILE_SIDEBAR_COLLAPSED_HEIGHT_PX}px + ${MOBILE_MAIN_AREA_PADDING_PX}px)`;
