import { shouldScrollHistoryToBottom } from "./App.utils.ts";

describe("App history collapse behavior", () => {
    it("scrolls to the latest guesses only when the sidebar collapses", () => {
        expect(shouldScrollHistoryToBottom(true, false)).toBe(true);
    });

    it("does not force-scroll on initial collapsed render or expansion", () => {
        expect(shouldScrollHistoryToBottom(false, false)).toBe(false);
        expect(shouldScrollHistoryToBottom(false, true)).toBe(false);
        expect(shouldScrollHistoryToBottom(true, true)).toBe(false);
    });
});
