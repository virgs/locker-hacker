import { readFileSync } from "node:fs";

const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");

describe("index.html social metadata", () => {
    it("includes the primary Open Graph tags for link previews", () => {
        expect(indexHtml).toContain('property="og:type" content="website"');
        expect(indexHtml).toContain('property="og:title" content="Locker Hacker"');
        expect(indexHtml).toContain('property="og:url" content="https://virgs.github.io/locker-hacker/"');
        expect(indexHtml).toContain('property="og:image" content="https://virgs.github.io/locker-hacker/screenshot.png"');
    });

    it("uses the same compelling description for standard and Open Graph metadata", () => {
        const description = "Crack the hidden pattern lock through smart guesses, bulls-and-cows feedback, and fast visual deduction in this sleek browser puzzle.";
        expect(indexHtml).toContain(`name="description"\n      content="${description}"`);
        expect(indexHtml).toContain(`property="og:description"\n      content="${description}"`);
    });
});
