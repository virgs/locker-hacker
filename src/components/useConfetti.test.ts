import { BURST_COUNT, BURST_DELAY, PARTICLE_COUNT, CONFETTI_DEFAULTS } from "./useConfetti.ts";

describe("useConfetti constants", () => {
    it("BURST_COUNT is a positive integer", () => {
        expect(BURST_COUNT).toBeGreaterThan(0);
        expect(Number.isInteger(BURST_COUNT)).toBe(true);
    });

    it("BURST_DELAY is a positive number", () => {
        expect(BURST_DELAY).toBeGreaterThan(0);
    });

    it("PARTICLE_COUNT is a positive integer", () => {
        expect(PARTICLE_COUNT).toBeGreaterThan(0);
        expect(Number.isInteger(PARTICLE_COUNT)).toBe(true);
    });

    it("CONFETTI_DEFAULTS has expected properties", () => {
        expect(CONFETTI_DEFAULTS).toHaveProperty("spread");
        expect(CONFETTI_DEFAULTS).toHaveProperty("startVelocity");
        expect(CONFETTI_DEFAULTS).toHaveProperty("gravity");
        expect(CONFETTI_DEFAULTS).toHaveProperty("ticks");
        expect(CONFETTI_DEFAULTS).toHaveProperty("disableForReducedMotion", true);
    });

    it("total animation duration is BURST_COUNT * BURST_DELAY", () => {
        const totalDuration = (BURST_COUNT - 1) * BURST_DELAY;
        expect(totalDuration).toBeGreaterThan(0);
        expect(totalDuration).toBeLessThan(5000);
    });
});

