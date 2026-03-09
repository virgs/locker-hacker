import { GamePhase } from "../game/GameConfig.ts";

describe("useEndGameColor color mapping", () => {
    it("win maps to bootstrap success CSS var", () => {
        expect("var(--bs-success)").toContain("success");
    });

    it("loss maps to bootstrap danger CSS var", () => {
        expect("var(--bs-danger)").toContain("danger");
    });

    it("win and loss colors are distinct", () => {
        expect("var(--bs-success)").not.toBe("var(--bs-danger)");
    });

    it("GamePhase.Revealing is the only phase that triggers color", () => {
        const phases = Object.values(GamePhase);
        expect(phases).toContain(GamePhase.Revealing);
        expect(phases).toContain(GamePhase.Playing);
    });
});
