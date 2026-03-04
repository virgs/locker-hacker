import { toCoord, toId, dotCount } from "./grid.ts";

describe("toCoord", () => {
    it("converts id 0 on a 3-col grid to (0, 0)", () => {
        expect(toCoord(0, 3)).toEqual({ r: 0, c: 0 });
    });

    it("converts id 4 on a 3-col grid to (1, 1)", () => {
        expect(toCoord(4, 3)).toEqual({ r: 1, c: 1 });
    });

    it("converts id 5 on a 3-col grid to (1, 2)", () => {
        expect(toCoord(5, 3)).toEqual({ r: 1, c: 2 });
    });

    it("converts id 8 on a 4-col grid to (2, 0)", () => {
        expect(toCoord(8, 4)).toEqual({ r: 2, c: 0 });
    });
});

describe("toId", () => {
    it("converts (0, 0) on a 3-col grid to 0", () => {
        expect(toId(0, 0, 3)).toBe(0);
    });

    it("converts (1, 1) on a 3-col grid to 4", () => {
        expect(toId(1, 1, 3)).toBe(4);
    });

    it("converts (2, 0) on a 4-col grid to 8", () => {
        expect(toId(2, 0, 4)).toBe(8);
    });

    it("round-trips with toCoord", () => {
        for (let id = 0; id < 12; id++) {
            const { r, c } = toCoord(id, 4);
            expect(toId(r, c, 4)).toBe(id);
        }
    });
});

describe("dotCount", () => {
    it("returns cols * rows", () => {
        expect(dotCount(3, 2)).toBe(6);
        expect(dotCount(4, 4)).toBe(16);
        expect(dotCount(5, 5)).toBe(25);
    });
});

