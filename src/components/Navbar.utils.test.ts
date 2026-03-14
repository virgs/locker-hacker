import { HINT_ACTION_KEYS, runHintAction } from "./Navbar.utils.ts";

describe("Navbar hint menu actions", () => {
    it("routes the hint action to revealHint", () => {
        let revealCalls = 0;
        let giveUpCalls = 0;

        runHintAction(HINT_ACTION_KEYS.hint, {
            onRevealHint: () => { revealCalls += 1; },
            onGiveUp: () => { giveUpCalls += 1; },
        });

        expect(revealCalls).toBe(1);
        expect(giveUpCalls).toBe(0);
    });

    it("routes the give-up action to giveUp", () => {
        let revealCalls = 0;
        let giveUpCalls = 0;

        runHintAction(HINT_ACTION_KEYS.giveUp, {
            onRevealHint: () => { revealCalls += 1; },
            onGiveUp: () => { giveUpCalls += 1; },
        });

        expect(giveUpCalls).toBe(1);
        expect(revealCalls).toBe(0);
    });

    it("ignores unknown dropdown actions", () => {
        let revealCalls = 0;
        let giveUpCalls = 0;
        const handlers = {
            onRevealHint: () => { revealCalls += 1; },
            onGiveUp: () => { giveUpCalls += 1; },
        };

        runHintAction("unknown", handlers);
        runHintAction(null, handlers);

        expect(giveUpCalls).toBe(0);
        expect(revealCalls).toBe(0);
    });
});
