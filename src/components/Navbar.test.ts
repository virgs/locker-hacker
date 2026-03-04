import {
    GITHUB_URL,
    PAYPAL_URL,
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

    describe("PAYPAL_URL", () => {
        it("is a valid https PayPal URL", () => {
            expect(PAYPAL_URL).toMatch(/^https:\/\/www\.paypal\.com\//);
        });

        it("is a non-empty string", () => {
            expect(PAYPAL_URL.length).toBeGreaterThan(0);
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

