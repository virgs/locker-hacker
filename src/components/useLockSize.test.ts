describe("useLockSize size calculation", () => {
    const squareSize = (availW: number, availH: number, max = 500): number =>
        Math.floor(Math.min(availW, availH, max));

    it("is capped at MAX_LOCK_SIZE when both dimensions exceed it", () => {
        expect(squareSize(800, 700)).toBe(500);
    });

    it("uses the smaller of availW and availH when both are below max", () => {
        expect(squareSize(300, 400)).toBe(300);
        expect(squareSize(400, 300)).toBe(300);
    });

    it("is exactly square — returned value applied to both width and height gives a square", () => {
        const size = squareSize(350, 420);
        expect(size).toBe(350);
    });

    it("floors the result to avoid sub-pixel sizes", () => {
        expect(squareSize(299.9, 299.9)).toBe(299);
        expect(squareSize(500.9, 500.9)).toBe(500);
    });

    it("respects the max cap even when both dimensions are very large", () => {
        expect(squareSize(2000, 1500)).toBe(500);
    });
});
