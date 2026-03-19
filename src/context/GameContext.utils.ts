type VisibilityState = "hidden" | "visible" | "prerender";

export const getAutoFinalizedRecordId = (
    activeRecordId: string | null,
): string | null => activeRecordId;

export const shouldRestoreAutoFinalizedRecord = (
    autoFinalizedRecordId: string | null,
    activeRecordId: string | null,
    visibilityState: VisibilityState,
): boolean =>
    autoFinalizedRecordId !== null &&
    activeRecordId === null &&
    visibilityState === "visible";
