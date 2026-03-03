import { formatTurnMessage } from "./TurnAnnouncement.utils.ts";

describe("formatTurnMessage", () => {
    it("formats turn message for player 1", () => {
        expect(formatTurnMessage(1)).toBe("Player 1's Turn");
    });

    it("formats turn message for player 2", () => {
        expect(formatTurnMessage(2)).toBe("Player 2's Turn");
    });

    it("formats turn message for player 4", () => {
        expect(formatTurnMessage(4)).toBe("Player 4's Turn");
    });

    it("includes the player number in the message", () => {
        for (let p = 1; p <= 4; p++) {
            expect(formatTurnMessage(p)).toContain(`Player ${p}`);
        }
    });

    it("always contains Turn in the message", () => {
        expect(formatTurnMessage(1)).toContain("Turn");
    });
});
