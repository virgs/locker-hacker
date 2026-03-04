import { BREAKPOINT_VALUES, BREAKPOINT_QUERIES, BREAKPOINTS } from "./breakpoints.ts";

describe("BREAKPOINT_VALUES", () => {
    it("defines mobile as 600", () => {
        expect(BREAKPOINT_VALUES.mobile).toBe(600);
    });

    it("defines xl as 1200", () => {
        expect(BREAKPOINT_VALUES.xl).toBe(1200);
    });
});

describe("BREAKPOINT_QUERIES", () => {
    it("mobile is a max-width query without @media prefix", () => {
        expect(BREAKPOINT_QUERIES.mobile).toBe("(max-width: 600px)");
        expect(BREAKPOINT_QUERIES.mobile).not.toContain("@media");
    });

    it("xl is a min-width query without @media prefix", () => {
        expect(BREAKPOINT_QUERIES.xl).toBe("(min-width: 1200px)");
        expect(BREAKPOINT_QUERIES.xl).not.toContain("@media");
    });
});

describe("BREAKPOINTS", () => {
    it("mobile includes @media prefix", () => {
        expect(BREAKPOINTS.mobile).toBe("@media (max-width: 600px)");
    });

    it("xl includes @media prefix", () => {
        expect(BREAKPOINTS.xl).toBe("@media (min-width: 1200px)");
    });

    it("BREAKPOINTS are derived from BREAKPOINT_QUERIES", () => {
        expect(BREAKPOINTS.mobile).toBe(`@media ${BREAKPOINT_QUERIES.mobile}`);
        expect(BREAKPOINTS.xl).toBe(`@media ${BREAKPOINT_QUERIES.xl}`);
    });
});

