import { shouldScrollHistoryToBottom } from "./App.utils.ts";

describe("App history collapse behavior", () => {
    it("scrolls to the latest guesses when a new guess is added", () => {
        expect(shouldScrollHistoryToBottom(2, 3, false, false)).toBe(true);
    });

    it("scrolls to the latest guesses only when the sidebar collapses", () => {
        expect(shouldScrollHistoryToBottom(3, 3, true, false)).toBe(true);
    });

    it("does not force-scroll when neither guesses nor collapse state demand it", () => {
        expect(shouldScrollHistoryToBottom(3, 3, false, false)).toBe(false);
        expect(shouldScrollHistoryToBottom(3, 3, false, true)).toBe(false);
        expect(shouldScrollHistoryToBottom(3, 3, true, true)).toBe(false);
    });
});
