import { toOrdinal, formatGuessLabel } from "./GuessCounter.utils.ts";

describe("toOrdinal", () => {
    it("returns 1st for 1", () => expect(toOrdinal(1)).toBe("1st"));
    it("returns 2nd for 2", () => expect(toOrdinal(2)).toBe("2nd"));
    it("returns 3rd for 3", () => expect(toOrdinal(3)).toBe("3rd"));
    it("returns 4th for 4", () => expect(toOrdinal(4)).toBe("4th"));
    it("returns 11th for 11", () => expect(toOrdinal(11)).toBe("11th"));
    it("returns 12th for 12", () => expect(toOrdinal(12)).toBe("12th"));
    it("returns 13th for 13", () => expect(toOrdinal(13)).toBe("13th"));
    it("returns 21st for 21", () => expect(toOrdinal(21)).toBe("21st"));
    it("returns 22nd for 22", () => expect(toOrdinal(22)).toBe("22nd"));
    it("returns 23rd for 23", () => expect(toOrdinal(23)).toBe("23rd"));
    it("returns 111th for 111", () => expect(toOrdinal(111)).toBe("111th"));
    it("returns 101st for 101", () => expect(toOrdinal(101)).toBe("101st"));
});

describe("formatGuessLabel", () => {
    it("formats 1 as '1st guess'", () => expect(formatGuessLabel(1)).toBe("1st guess"));
    it("formats 2 as '2nd guess'", () => expect(formatGuessLabel(2)).toBe("2nd guess"));
    it("formats 3 as '3rd guess'", () => expect(formatGuessLabel(3)).toBe("3rd guess"));
    it("formats 11 as '11th guess'", () => expect(formatGuessLabel(11)).toBe("11th guess"));
    it("always includes 'guess'", () => {
        for (let n = 1; n <= 20; n++) {
            expect(formatGuessLabel(n)).toContain("guess");
        }
    });
});
