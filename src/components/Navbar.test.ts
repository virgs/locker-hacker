import {
    GITHUB_URL,
    BUY_ME_A_COFFEE_URL,
    APP_TITLE,
} from "./Navbar.constants.ts";

describe("Navbar constants", () => {
    describe("GITHUB_URL", () => {
        it("is a valid https GitHub URL", () => {
            expect(GITHUB_URL).toMatch(/^https:\/\/github\.com\//);
        });

        it("points to the locker-hacker repository", () => {
            expect(GITHUB_URL).toBe("https://github.com/virgs/locker-hacker");
        });
    });

    describe("BUY_ME_A_COFFEE_URL", () => {
        it("is a valid https Buy Me a Coffee URL", () => {
            expect(BUY_ME_A_COFFEE_URL).toMatch(/^https:\/\/buymeacoffee\.com\//);
        });

        it("is a non-empty string", () => {
            expect(BUY_ME_A_COFFEE_URL.length).toBeGreaterThan(0);
        });
    });

    describe("APP_TITLE", () => {
        it("is a non-empty string", () => {
            expect(typeof APP_TITLE).toBe("string");
            expect(APP_TITLE.length).toBeGreaterThan(0);
        });

        it("matches the expected title", () => {
            expect(APP_TITLE).toBe("Locker Hacker");
        });
    });
});

