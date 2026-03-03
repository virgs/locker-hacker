import { formatTime } from "./Footer.utils.ts";

describe("formatTime", () => {
    it("formats 0 seconds as 0:00", () => {
        expect(formatTime(0)).toBe("0:00");
    });

    it("formats seconds under a minute", () => {
        expect(formatTime(9)).toBe("0:09");
        expect(formatTime(30)).toBe("0:30");
        expect(formatTime(59)).toBe("0:59");
    });

    it("formats exactly one minute", () => {
        expect(formatTime(60)).toBe("1:00");
    });

    it("formats minutes and seconds", () => {
        expect(formatTime(61)).toBe("1:01");
        expect(formatTime(90)).toBe("1:30");
        expect(formatTime(125)).toBe("2:05");
    });

    it("pads seconds with leading zero", () => {
        expect(formatTime(65)).toBe("1:05");
        expect(formatTime(600)).toBe("10:00");
    });

    it("handles large values", () => {
        expect(formatTime(3599)).toBe("59:59");
        expect(formatTime(3600)).toBe("60:00");
    });
});
