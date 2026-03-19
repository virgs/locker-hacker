import {
    getAutoFinalizedRecordId,
    shouldRestoreAutoFinalizedRecord,
} from "./GameContext.utils.ts";

describe("GameContext auto-finalized stats helpers", () => {
    it("tracks the current active record id for provisional pagehide finalization", () => {
        expect(getAutoFinalizedRecordId("record-123")).toBe("record-123");
        expect(getAutoFinalizedRecordId(null)).toBeNull();
    });

    it("restores only when a provisional record exists and the page is visible again", () => {
        expect(shouldRestoreAutoFinalizedRecord("record-123", null, "visible")).toBe(true);
        expect(shouldRestoreAutoFinalizedRecord(null, null, "visible")).toBe(false);
        expect(shouldRestoreAutoFinalizedRecord("record-123", "record-123", "visible")).toBe(false);
        expect(shouldRestoreAutoFinalizedRecord("record-123", null, "hidden")).toBe(false);
    });
});
