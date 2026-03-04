import { useEffect } from "react";
import confetti from "canvas-confetti";

const BURST_COUNT   = 3;
const BURST_DELAY   = 400;
const PARTICLE_COUNT = 60;

const CONFETTI_DEFAULTS: confetti.Options = {
    spread: 70,
    startVelocity: 35,
    gravity: 0.9,
    ticks: 120,
    disableForReducedMotion: true,
};

const fireBurst = (angle: number, origin: confetti.Origin): void => {
    confetti({
        ...CONFETTI_DEFAULTS,
        particleCount: PARTICLE_COUNT,
        angle,
        origin,
    });
};

/**
 * Fires a confetti celebration when `trigger` becomes `true`.
 * Multiple bursts alternate from left and right for a richer effect.
 */
const useConfetti = (trigger: boolean): void => {
    useEffect(() => {
        if (!trigger) return;

        const timeouts: ReturnType<typeof setTimeout>[] = [];

        for (let i = 0; i < BURST_COUNT; i++) {
            const id = setTimeout(() => {
                fireBurst(60, { x: 0.1, y: 0.7 });
                fireBurst(120, { x: 0.9, y: 0.7 });
            }, i * BURST_DELAY);
            timeouts.push(id);
        }

        return (): void => {
            timeouts.forEach(clearTimeout);
        };
    }, [trigger]);
};

export default useConfetti;

export { BURST_COUNT, BURST_DELAY, PARTICLE_COUNT, CONFETTI_DEFAULTS };

