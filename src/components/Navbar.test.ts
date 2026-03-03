import { GITHUB_URL, APP_TITLE } from "./Navbar.constants.ts";

describe("Navbar constants", () => {
    describe("GITHUB_URL", () => {
        it("is a valid https GitHub URL", () => {
            expect(GITHUB_URL).toMatch(/^https:\/\/github\.com\//);
        });

        it("points to the locker-hacker repository", () => {
            expect(GITHUB_URL).toBe("https://github.com/virgs/locker-hacker");
        });
    });

    describe("APP_TITLE", () => {
        it("is a non-empty string", () => {
            expect(typeof APP_TITLE).toBe("string");
            expect(APP_TITLE.length).toBeGreaterThan(0);
        });

        it("matches the expected title", () => {
            expect(APP_TITLE).toBe("Pattern Lock History");
        });
    });
});
