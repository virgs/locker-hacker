import * as utils from "./math.ts";

describe("Utils", () => {
    describe("getPoints", () => {
        it("Should place 9 points evenly in a 3x3 square grid", () => {
            const points = utils.getPoints({ pointActiveSize: 10, containerWidth: 300, containerHeight: 300, cols: 3, rows: 3 });
            expect(points).toHaveLength(9);
            expect(points[0]).toEqual({ x: 45, y: 45 });   // top-left
            expect(points[2]).toEqual({ x: 245, y: 45 });  // top-right
            expect(points[4]).toEqual({ x: 145, y: 145 }); // center
            expect(points[8]).toEqual({ x: 245, y: 245 }); // bottom-right
        });

        it("Should place points correctly in a rectangular container with a square grid", () => {
            const points = utils.getPoints({ pointActiveSize: 10, containerWidth: 200, containerHeight: 100, cols: 2, rows: 2 });
            expect(points).toHaveLength(4);
            expect(points[0]).toEqual({ x: 45, y: 20 });   // top-left  (cellW=100, cellH=50)
            expect(points[1]).toEqual({ x: 145, y: 20 });  // top-right
            expect(points[2]).toEqual({ x: 45, y: 70 });   // bottom-left
            expect(points[3]).toEqual({ x: 145, y: 70 });  // bottom-right
        });

        it("Should place 6 points correctly for a 2-column × 3-row non-square grid", () => {
            // containerWidth=200, containerHeight=300 → cellW=100, cellH=100
            const points = utils.getPoints({ pointActiveSize: 10, containerWidth: 200, containerHeight: 300, cols: 2, rows: 3 });
            expect(points).toHaveLength(6);
            expect(points[0]).toEqual({ x: 45, y: 45 });   // col=0, row=0
            expect(points[1]).toEqual({ x: 145, y: 45 });  // col=1, row=0
            expect(points[2]).toEqual({ x: 45, y: 145 });  // col=0, row=1
            expect(points[3]).toEqual({ x: 145, y: 145 }); // col=1, row=1
            expect(points[4]).toEqual({ x: 45, y: 245 });  // col=0, row=2
            expect(points[5]).toEqual({ x: 145, y: 245 }); // col=1, row=2
        });
    });


    describe("getConnectorOpacity", () => {
        const minOpacity = 0.2;
        const call = (i: number, n: number) =>
            utils.getConnectorOpacity({ connectorIndex: i, totalConnectors: n, minConnectorOpacity: minOpacity });

        it("Should return 1 for the only connector in a single-connector path", () => {
            expect(call(0, 1)).toBe(1);
        });

        it("Should return 1 for the oldest (first) connector — it is the most opaque", () => {
            expect(call(0, 5)).toBe(1);
            expect(call(0, 11)).toBe(1);
        });

        it("Should return minConnectorOpacity for the newest (last) connector with multiple lines", () => {
            expect(call(4, 5)).toBe(minOpacity);
            expect(call(10, 11)).toBe(minOpacity);
        });

        it("Should produce monotonically decreasing opacity for more recent connectors", () => {
            const opacities = [0, 1, 2, 3, 4].map(i => call(i, 5));
            for (let i = 1; i < opacities.length; i++) {
                expect(opacities[i]).toBeLessThan(opacities[i - 1]);
            }
        });

        it("Should never go below minConnectorOpacity or exceed 1", () => {
            for (let n = 1; n <= 11; n++) {
                for (let i = 0; i < n; i++) {
                    const opacity = call(i, n);
                    expect(opacity).toBeGreaterThanOrEqual(minOpacity);
                    expect(opacity).toBeLessThanOrEqual(1);
                }
            }
        });
    });

    describe("getDynamicConnectorThickness", () => {
        const base = { connectorThickness: 4, minConnectorThickness: 2 };
        const call = (i: number, n: number) =>
            utils.getDynamicConnectorThickness({ ...base, connectorIndex: i, totalConnectors: n });

        it("Should match the spec example: 5 lines → [4, 3.5, 3, 2.5, 2]", () => {
            expect([0, 1, 2, 3, 4].map(i => call(i, 5))).toEqual([4, 3.5, 3, 2.5, 2]);
        });

        it("Should match the spec example: 2 lines → [4, 2]", () => {
            expect([0, 1].map(i => call(i, 2))).toEqual([4, 2]);
        });

        it("Should match the spec example: 3 lines → [4, 3, 2]", () => {
            expect([0, 1, 2].map(i => call(i, 3))).toEqual([4, 3, 2]);
        });

        it("Should return connectorThickness for any single connector", () => {
            expect(call(0, 1)).toBe(4);
        });

        it("Should return connectorThickness for the oldest (first) connector", () => {
            expect(call(0, 11)).toBe(4);
        });

        it("Should return minConnectorThickness for the newest (last) connector with multiple lines", () => {
            expect(call(10, 11)).toBe(2);
        });

        it("Should produce monotonically decreasing thickness for more recent connectors", () => {
            const thicknesses = [0, 2, 5, 8, 10].map(i =>
                utils.getDynamicConnectorThickness({ ...base, connectorIndex: i, totalConnectors: 11 })
            );
            for (let i = 1; i < thicknesses.length; i++) {
                expect(thicknesses[i]).toBeLessThanOrEqual(thicknesses[i - 1]);
            }
        });

        it("Should always stay within [minConnectorThickness, connectorThickness]", () => {
            for (let n = 1; n <= 11; n++) {
                for (let i = 0; i < n; i++) {
                    const t = call(i, n);
                    expect(t).toBeGreaterThanOrEqual(2);
                    expect(t).toBeLessThanOrEqual(4);
                }
            }
        });
    });

    describe("exclusiveRange", () => {
        it("Should return an empty range if start & end are the same number", () => {
            expect(utils.exclusiveRange(1, 1)).toEqual([]);
            expect(utils.exclusiveRange(-1, -1)).toEqual([]);
        });
        it("Should return an empty range if Math.abs(start - end) <= 1 (because it\"s inclusive)", () => {
            expect(utils.exclusiveRange(-1, 0)).toEqual([]);
            expect(utils.exclusiveRange(-1000, -1001)).toEqual([]);
            expect(utils.exclusiveRange(-1000, -999)).toEqual([]);
            expect(utils.exclusiveRange(1, 2)).toEqual([]);
            expect(utils.exclusiveRange(0, 1)).toEqual([]);
            expect(utils.exclusiveRange(1000, 1001)).toEqual([]);
            expect(utils.exclusiveRange(1000, 999)).toEqual([]);
        });

        it("Should create decremental ranges", () => {
            expect(utils.exclusiveRange(10, 1)).toEqual([9, 8, 7, 6, 5, 4, 3, 2]);
            expect(utils.exclusiveRange(-1, -10)).toEqual([-2, -3, -4, -5, -6, -7, -8, -9]);
            expect(utils.exclusiveRange(3, -4)).toEqual([2, 1, 0, -1, -2, -3]);
        }); 
        it("Should create incremental ranges", () => {
            expect(utils.exclusiveRange(1, 10)).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
            expect(utils.exclusiveRange(-3, 5)).toEqual([-2, -1, 0, 1, 2, 3, 4]);
        });
    });

    describe("getPointsInTheMiddle", () => {
        it("Horizontal: Should get points in the middle if start & end are in the same row", () => {
            expect(utils.getPointsInTheMiddle(1, 9, 10)).toEqual([2, 3, 4, 5, 6, 7, 8]);
            expect(utils.getPointsInTheMiddle(5, 3, 3)).toEqual([4]);
            expect(utils.getPointsInTheMiddle(3, 4, 3)).toEqual([]);
            expect(utils.getPointsInTheMiddle(15, 16, 10)).toEqual([]);
            expect(utils.getPointsInTheMiddle(9, 6, 5)).toEqual([8, 7]);
        });

        it("Horizontal: Should return an empty array if start & end are NOT in the same row", () => {
            expect(utils.getPointsInTheMiddle(2, 3, 3)).toEqual([]);
            expect(utils.getPointsInTheMiddle(2, 5, 3)).toEqual([]);
            expect(utils.getPointsInTheMiddle(25, 33, 10)).toEqual([]);
        });

        it("Vertical: Should get points in the middle if start & end are in the same column", () => {
            expect(utils.getPointsInTheMiddle(5, 35, 10)).toEqual([15, 25]);
            expect(utils.getPointsInTheMiddle(7, 1, 3)).toEqual([4]);
            expect(utils.getPointsInTheMiddle(2, 5, 3)).toEqual([]);
            expect(utils.getPointsInTheMiddle(15, 16, 10)).toEqual([]);
            expect(utils.getPointsInTheMiddle(24, 4, 5)).toEqual([19, 14, 9]);
        });

        it("Vertical: Should return an empty array if start & end are NOT in the same column", () => {
            expect(utils.getPointsInTheMiddle(1, 8, 3)).toEqual([]);
            expect(utils.getPointsInTheMiddle(7, 0, 3)).toEqual([]);
            expect(utils.getPointsInTheMiddle(25, 33, 10)).toEqual([]);
        });

        it("Diagonal: Should get points in the middle for diagonally connected points", () => {
            expect(utils.getPointsInTheMiddle(0, 44, 10)).toEqual([11, 22, 33]);
            expect(utils.getPointsInTheMiddle(8, 0, 3)).toEqual([4]);
            expect(utils.getPointsInTheMiddle(0, 4, 3)).toEqual([]);
            expect(utils.getPointsInTheMiddle(44, 55, 10)).toEqual([]);
            expect(utils.getPointsInTheMiddle(24, 0, 5)).toEqual([18, 12, 6]);
            expect(utils.getPointsInTheMiddle(44, 58, 8)).toEqual([51]);
            expect(utils.getPointsInTheMiddle(56, 35, 8)).toEqual([49, 42]);
            expect(utils.getPointsInTheMiddle(32, 59, 8)).toEqual([41, 50]);
        });
    });
});